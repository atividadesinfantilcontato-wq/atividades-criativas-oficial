import express from "express";
import path from "path";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Initialize express
const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// Set up Multer (in-memory storage for file uploading)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Import Firebase config to get apiKey if needed
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = {};
if (fs.existsSync(firebaseConfigPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
  } catch (err) {
    console.error("Erro ao ler firebase-applet-config.json", err);
  }
}

// Route to check R2 Configuration status
app.get("/api/r2-status", (req, res) => {
  const missing: string[] = [];
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) missing.push("CLOUDFLARE_ACCOUNT_ID");
  if (!process.env.R2_ACCESS_KEY_ID) missing.push("R2_ACCESS_KEY_ID");
  if (!process.env.R2_SECRET_ACCESS_KEY) missing.push("R2_SECRET_ACCESS_KEY");
  if (!process.env.R2_BUCKET_NAME) missing.push("R2_BUCKET_NAME");
  if (!process.env.R2_PUBLIC_URL) missing.push("R2_PUBLIC_URL");

  res.json({ 
    configured: missing.length === 0,
    missing: missing,
    details: {
      has_account_id: !!process.env.CLOUDFLARE_ACCOUNT_ID,
      has_access_key: !!process.env.R2_ACCESS_KEY_ID,
      has_secret_key: !!process.env.R2_SECRET_ACCESS_KEY,
      has_bucket_name: !!process.env.R2_BUCKET_NAME,
      has_public_url: !!process.env.R2_PUBLIC_URL
    }
  });
});

// API endpoint to handle R2 secure upload
app.post("/api/r2-upload", upload.single("file"), async (req, res) => {
  try {
    // 1. Authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Não autorizado. Token de autenticação ausente." });
    }
    const token = authHeader.split("Bearer ")[1];

    // Authenticate with Firebase Auth REST API
    const apiKey = firebaseConfig.apiKey;
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

    const authData = await authResponse.json();
    const user = authData.users?.[0];
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado para o token fornecido." });
    }

    const uid = user.localId;

    // 2. Verify admin status via Firestore REST API using the user's token
    const databaseId = firebaseConfig.firestoreDatabaseId;
    const projectId = firebaseConfig.projectId;
    if (!projectId || !databaseId) {
      return res.status(500).json({ error: "Configuração do Firestore ausente." });
    }

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/admins/${uid}`;
    const firestoreResponse = await fetch(firestoreUrl, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!firestoreResponse.ok) {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores cadastrados podem fazer upload." });
    }

    // 3. Check R2 Configuration and detail missing variables
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
    const timestamp = Date.now();
    const cleanFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    
    // Support custom path prefix
    const customPath = req.body.customPath || req.query.customPath;
    let key = `debug-r2/${uid}/${timestamp}-${cleanFilename}`;
    if (customPath) {
      const cleanCustomPath = String(customPath).replace(/^\/|\/$/g, '');
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

    res.json({
      url: finalUrl,
      key: key,
      size: file.size,
      contentType: file.mimetype,
      originalName: file.originalname,
    });
  } catch (err: any) {
    console.error("Erro no r2-upload endpoint:", err);
    res.status(500).json({ error: err.message || "Erro interno do servidor durante o upload R2." });
  }
});

// Vite middleware and static files setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
