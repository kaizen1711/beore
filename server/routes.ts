import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import path from "path";
import fetch from "node-fetch";

const upload = multer({
  storage: multer.memoryStorage(),  
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for multimedia files
    files: 3
  }
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || "kabox-files";
// Get the base domain from environment or use request host for dynamic URLs
const getBaseDomain = (req: any) => {
  if (process.env.VITE_BASE_DOMAIN) {
    return process.env.VITE_BASE_DOMAIN;
  }
  
  // For development and dynamic hosting
  const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
};

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // File upload endpoint
  app.post("/api/upload", upload.array("files", 3), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[] || [];
      const urlsRaw = req.body.urls;
      let urls: string[] = [];
      
      // Parse URLs if provided
      if (urlsRaw) {
        try {
          urls = Array.isArray(urlsRaw) ? urlsRaw : [urlsRaw];
          urls = urls.filter(url => url && typeof url === 'string');
        } catch (e) {
          // Ignore URL parsing errors
        }
      }

      const allFiles: Array<{buffer: Buffer, originalname: string, mimetype: string, size: number}> = [];
      const results: Array<{name: string, url: string, mime: string, size: number}> = [];

      // Add uploaded files
      files.forEach(file => {
        allFiles.push({
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
      });

      // Download and add URL files
      for (const url of urls) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          
          const buffer = Buffer.from(await response.arrayBuffer());
          const contentType = response.headers.get('content-type') || 'application/octet-stream';
          const filename = path.basename(new URL(url).pathname) || 'download';
          
          allFiles.push({
            buffer,
            originalname: filename,
            mimetype: contentType,
            size: buffer.length
          });
        } catch (e) {
          console.error('Failed to download file from URL:', url, e);
          // Continue with other files
        }
      }

      if (allFiles.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Tidak ada file yang valid untuk diupload"
        });
      }

      if (allFiles.length > 3) {
        return res.status(400).json({
          success: false,
          error: "Maksimal 3 file dapat diupload sekaligus"
        });
      }

      // Upload each file to Supabase
      for (const file of allFiles) {
        try {
          // Validate file size
          if (file.size > 50 * 1024 * 1024) {
            continue; // Skip files over 50MB
          }

          // Generate unique filename
          const fileExt = path.extname(file.originalname);
          const fileName = `${nanoid(12)}${fileExt}`;

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              cacheControl: '31536000', // 1 year cache
            });

          if (error) {
            console.error('Supabase upload error:', error);
            continue;
          }

          // Get public URL - using dynamic domain
          const publicUrl = `${getBaseDomain(req)}/files/${fileName}`;

          // Save to storage
          await storage.createUpload({
            filename: fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            publicUrl: publicUrl,
          });

          results.push({
            name: fileName,
            url: publicUrl,
            mime: file.mimetype,
            size: file.size
          });

        } catch (e) {
          console.error('Error processing file:', e);
          continue;
        }
      }

      if (results.length === 0) {
        return res.status(500).json({
          success: false,
          error: "Semua file gagal diupload. Pastikan ukuran file tidak melebihi 50MB."
        });
      }

      res.json({
        success: true,
        files: results
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat mengupload file"
      });
    }
  });

  // Serve files from Supabase (proxy endpoint for custom domain)
  app.get("/files/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      
      // Download file from Supabase and serve it directly
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filename);
      
      if (error || !data) {
        return res.status(404).json({ error: "File tidak ditemukan" });
      }

      // Get file info for proper headers
      const upload = await storage.getUploads();
      const fileInfo = upload.find(u => u.filename === filename);
      
      // Set proper headers based on file extension if no fileInfo
      let contentType = 'application/octet-stream';
      const ext = filename.split('.').pop()?.toLowerCase();
      
      const mimeTypes = {
        'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif',
        'webp': 'image/webp', 'svg': 'image/svg+xml', 'mp4': 'video/mp4', 'webm': 'video/webm',
        'avi': 'video/x-msvideo', 'mov': 'video/quicktime', 'mp3': 'audio/mpeg', 'wav': 'audio/wav',
        'pdf': 'application/pdf', 'txt': 'text/plain', 'json': 'application/json'
      };
      
      if (fileInfo) {
        contentType = fileInfo.mimeType;
        res.setHeader('Content-Length', fileInfo.size);
        res.setHeader('Content-Disposition', `inline; filename="${fileInfo.originalName}"`);
      } else if (ext && mimeTypes[ext]) {
        contentType = mimeTypes[ext];
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Convert blob to buffer and send
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
      
    } catch (error) {
      console.error('File serve error:', error);
      res.status(500).json({ error: "Gagal mengakses file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
