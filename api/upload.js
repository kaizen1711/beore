import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import fetch from 'node-fetch';
import path from 'path';
import formidable from 'formidable';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || "kabox-files";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const getBaseDomain = (req) => {
  // Always prioritize custom domain if set
  if (process.env.VITE_BASE_DOMAIN) {
    return process.env.VITE_BASE_DOMAIN;
  }
  
  // For Vercel deployment, use proper headers
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000';
  
  return `${protocol}://${host}`;
};

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting - simple implementation
  const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  try {

    const contentType = req.headers['content-type'] || '';
    let files = [];
    let urls = [];

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data
      const formData = await parseMultipartFormData(req);
      files = formData.files || [];
      urls = formData.urls || [];
    } else if (contentType.includes('application/json')) {
      // Handle JSON data
      const body = JSON.parse(req.body);
      urls = body.urls || [];
    }

    const allFiles = [];
    const results = [];

    // Add uploaded files
    files.forEach(file => {
      allFiles.push({
        buffer: file.buffer,
        originalname: file.originalname || 'file',
        mimetype: file.mimetype || 'application/octet-stream',
        size: file.size || file.buffer.length
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
        continue;
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
        if (file.size > 50 * 1024 * 1024) {
          continue; // Skip files over 50MB
        }

        const fileExt = path.extname(file.originalname);
        const fileName = `${nanoid(12)}${fileExt}`;

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '31536000',
          });

        if (error) {
          console.error('Supabase upload error:', error);
          continue;
        }

        const publicUrl = `${getBaseDomain(req)}/api/files/${fileName}`;

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
    
    // Handle specific error types
    if (error.message?.includes('File too large')) {
      return res.status(413).json({
        success: false,
        error: "File terlalu besar. Maksimal 50MB per file."
      });
    }
    
    if (error.message?.includes('Too many files')) {
      return res.status(400).json({
        success: false,
        error: "Terlalu banyak file. Maksimal 3 file per upload."
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan saat mengupload file"
    });
  }
}

async function parseMultipartFormData(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 3,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const parsedFiles = [];
      const urls = [];

      // Process files
      if (files.files) {
        const fileArray = Array.isArray(files.files) ? files.files : [files.files];
        fileArray.forEach(file => {
          if (file && file.filepath) {
            const fs = await import('fs');
            parsedFiles.push({
              buffer: fs.readFileSync(file.filepath),
              originalname: file.originalFilename || 'file',
              mimetype: file.mimetype || 'application/octet-stream',
              size: file.size
            });
          }
        });
      }

      // Process URLs
      if (fields.urls) {
        const urlArray = Array.isArray(fields.urls) ? fields.urls : [fields.urls];
        urlArray.forEach(url => {
          if (url && typeof url === 'string') {
            urls.push(url);
          }
        });
      }

      resolve({ files: parsedFiles, urls });
    });
  });
}