import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    // Parse multipart form data
    await runMiddleware(req, res, upload.single("file"));

    // Read firebase config if exists
    let firebaseConfig: any = {};
    const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(firebaseConfigPath)) {
      try {
        firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
      } catch (err) {
        console.error("Erro ao ler firebase-applet-config.json", err);
      }
    }

    // 1. Authenticate user
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Não autorizado. Token de autenticação ausente." });
    }
    const token = authHeader.split("Bearer ")[1];

    // Authenticate with Firebase Auth REST API
    const apiKey = process.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey;
    if (!apiKey) {
      return res.status(500).json({ error: "Chave de API do Firebase não configurada no servidor." });
    }

    const authVerifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
    const authResponse = await fetch(authVerifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });

    if (!authResponse.ok) {
      return res.status(401).json({ error: "Token de autenticação inválido ou expirado." });
    }

    const authData: any = await authResponse.json();
    const user = authData.users?.[0];
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado para o token fornecido." });
    }

    const uid = user.localId;
    const userEmail = (user.email || "").toLowerCase();
    const isOfficialAdmin = userEmail === "atividadesinfantilcontato@gmail.com";

    // 2. Verify admin status via Firestore REST API using the user's token
    const databaseId = process.env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || firebaseConfig.databaseId || "(default)";
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId;

    if (projectId && databaseId && !isOfficialAdmin) {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/admins/${uid}`;
      const firestoreResponse = await fetch(firestoreUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!firestoreResponse.ok) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores cadastrados podem fazer upload." });
      }
    }

    // 3. Check R2 Configuration
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    const missingVars: string[] = [];
    if (!accountId) missingVars.push("CLOUDFLARE_ACCOUNT_ID");
    if (!accessKeyId) missingVars.push("R2_ACCESS_KEY_ID");
    if (!secretAccessKey) missingVars.push("R2_SECRET_ACCESS_KEY");
    if (!bucketName) missingVars.push("R2_BUCKET_NAME");
    if (!publicUrl) missingVars.push("R2_PUBLIC_URL");

    if (missingVars.length > 0) {
      return res.status(503).json({ error: `R2 não configurado: falta ${missingVars.join(", ")}.` });
    }

    // 4. Validate file
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const file = req.file;

    // Reject video file uploads
    if (file.mimetype.startsWith("video/") || file.originalname.match(/\.(mp4|m4v|avi|mov|wmv|flv|webm|mkv)$/i)) {
      return res.status(400).json({ error: "Vídeos devem ser cadastrados apenas por URL do YouTube." });
    }

    const timestamp = Date.now();
    const cleanFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");

    // Support custom path prefix
    const customPath = req.body?.customPath || req.query?.customPath;
    let key = `debug-r2/${uid}/${timestamp}-${cleanFilename}`;
    if (customPath) {
      const cleanCustomPath = String(customPath).replace(/^\/|\/$/g, "");
      key = `${cleanCustomPath}/${timestamp}-${cleanFilename}`;
    }

    // 5. Initialize S3 client for Cloudflare R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    // 6. Send file to Cloudflare R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // 7. Return metadata
    const cleanPublicUrl = publicUrl.replace(/\/$/, "");
    const finalUrl = `${cleanPublicUrl}/${key}`;

    return res.status(200).json({
      url: finalUrl,
      key: key,
      size: file.size,
      contentType: file.mimetype,
      originalName: file.originalname,
    });
  } catch (err: any) {
    console.error("Erro no r2-upload endpoint:", err);
    return res.status(500).json({ error: err.message || "Erro interno do servidor durante o upload R2." });
  }
}
