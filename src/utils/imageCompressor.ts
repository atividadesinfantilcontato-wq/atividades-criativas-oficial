import { Product } from '../types';

/**
 * Compresses an image file or a base64 image string to keep it under Firestore size limits.
 * It resizes the image while maintaining aspect ratio and outputs a compressed JPEG base64 string.
 */
export function compressImage(
  base64OrFile: string | File,
  maxDimension: number = 800,
  quality: number = 0.7
): Promise<string> {
  const originalPromise = new Promise<string>((resolve, reject) => {
    const handleBase64 = (base64Str: string) => {
      // If it is not a data URL of an image, is a vector SVG, or a small placeholder, return as is
      if (!base64Str || !base64Str.startsWith('data:image/') || base64Str.startsWith('data:image/svg+xml')) {
        resolve(base64Str);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        try {
          // Output compressed JPEG
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          console.error('Error generating compressed base64:', err);
          resolve(base64Str); // Fallback to original on error
        }
      };

      img.onerror = (err) => {
        console.error('Image load error during compression:', err);
        // Fallback to original if we can't load it (e.g. CORS or format issues)
        resolve(base64Str);
      };

      img.src = base64Str;
    };

    if (base64OrFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleBase64(reader.result as string);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(base64OrFile);
    } else {
      handleBase64(base64OrFile);
    }
  });

  const timeoutPromise = new Promise<string>((resolve) => {
    setTimeout(() => {
      console.warn("Compression timed out (8s limit reached). Falling back to original image.");
      if (base64OrFile instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(base64OrFile);
      } else {
        resolve(base64OrFile);
      }
    }, 8000);
  });

  return Promise.race([originalPromise, timeoutPromise]);
}

/**
 * Checks the size of the product document and compresses any base64 images recursively
 * if the total size exceeds the Firestore safety limit (around 900KB).
 */
export async function ensureSafeProductPayload(payload: Product): Promise<Product> {
  const cloned = { ...payload };
  const getPayloadSize = (obj: Product) => JSON.stringify(obj).length;

  let currentSize = getPayloadSize(cloned);
  // Max size is 1,048,576 bytes. Let's aim to be well under 950,000 bytes.
  if (currentSize <= 900000) {
    return cloned;
  }

  console.log(`[SIZE_OPTIMIZER] Document size (${currentSize} bytes) exceeds safety limit. Optimizing Base64 images...`);

  const isBase64 = (str: string | undefined) => !!(str && str.startsWith('data:image/'));

  const steps = [
    { maxDim: 600, qual: 0.5 },
    { maxDim: 400, qual: 0.4 },
    { maxDim: 300, qual: 0.3 },
    { maxDim: 200, qual: 0.2 },
    { maxDim: 150, qual: 0.15 }
  ];

  for (const step of steps) {
    let mainCompressed = false;
    let galleryCompressed = false;

    // 1. Compress main image if it's base64
    let imageUrl = cloned.mainImageUrl || cloned.imageUrl || '';
    if (isBase64(imageUrl)) {
      try {
        const compressed = await compressImage(imageUrl, step.maxDim, step.qual);
        cloned.imageUrl = compressed;
        cloned.mainImageUrl = compressed;
        mainCompressed = true;
      } catch (e) {
        console.error('Failed to compress main image in optimizer:', e);
      }
    }

    // 2. Compress gallery images if they are base64
    let galleryUrls = cloned.galleryImages || cloned.galleryUrls || [];
    if (galleryUrls.length > 0) {
      const newGallery: string[] = [];
      for (let i = 0; i < galleryUrls.length; i++) {
        const url = galleryUrls[i];
        if (isBase64(url)) {
          try {
            const compressed = await compressImage(url, step.maxDim, step.qual);
            newGallery.push(compressed);
            galleryCompressed = true;
          } catch (e) {
            console.error(`Failed to compress gallery image ${i} in optimizer:`, e);
            newGallery.push(url);
          }
        } else {
          newGallery.push(url);
        }
      }
      cloned.galleryUrls = newGallery;
      cloned.galleryImages = newGallery;
    }

    currentSize = getPayloadSize(cloned);
    console.log(`[SIZE_OPTIMIZER] Optimized to dimension ${step.maxDim}, quality ${step.qual}. New size: ${currentSize} bytes.`);
    
    if (currentSize <= 900000) {
      break;
    }
    
    if (!mainCompressed && !galleryCompressed) {
      // No base64 images found or compressed, cannot reduce further this way
      break;
    }
  }

  // If even after compressing all Base64 images, we're still over the limit,
  // we might have too many gallery images that are Base64.
  // In this worst-case scenario, let's remove some gallery images to protect the save operation.
  currentSize = getPayloadSize(cloned);
  if (currentSize > 1000000) {
    console.warn(`[SIZE_OPTIMIZER] Document still exceeds 1MB (${currentSize} bytes). Pruning gallery Base64 images...`);
    let galleryUrls = cloned.galleryImages || cloned.galleryUrls || [];
    if (galleryUrls.length > 1) {
      // Keep only first 1-2 images or non-base64 images
      const prunedGallery = galleryUrls.filter((url, index) => index === 0 || !isBase64(url));
      cloned.galleryUrls = prunedGallery;
      cloned.galleryImages = prunedGallery;
      currentSize = getPayloadSize(cloned);
      console.log(`[SIZE_OPTIMIZER] After pruning Base64 gallery images, size is ${currentSize} bytes.`);
    }
  }

  return cloned;
}

