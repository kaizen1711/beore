# 🌩️ kabox - Upload File Publik Profesional

Layanan CDN uploader modern yang memungkinkan Anda mengunggah file multimedia apa pun dan mendapatkan URL publik permanen. Tanpa registrasi, tanpa batas waktu.

## ✨ Fitur Utama

- 📁 **Upload Multi-format**: Support semua format multimedia (gambar, video, audio, dokumen)
- 🔗 **Upload dari URL**: Upload file langsung dari URL eksternal
- 🚀 **CDN Cepat**: Akses file dengan kecepatan tinggi dan cache optimal
- 🌐 **Domain Kustom**: File disajikan melalui domain Anda, bukan URL database
- 🌙 **Dark/Light Mode**: Antarmuka yang responsif dengan mode gelap/terang
- 📱 **Responsive**: Optimal di semua perangkat (HP, tablet, laptop)
- 🔄 **API Lengkap**: RESTful API untuk integrasi dengan aplikasi lain

## 🚀 Quick Start

### Prasyarat

- Node.js 18+ 
- Akun Supabase (gratis)
- Akun Vercel (untuk deployment)

### Instalasi Lokal

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd kabox
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Buat file `.env` di root folder:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://user:password@host:port/database

   # Supabase Configuration (Backend)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_BUCKET_NAME=kabox-files

   # Domain Configuration (Optional - auto-detects if not set)
   VITE_BASE_DOMAIN=https://kabox.vercel.app

   # Frontend Environment Variables (Required for client)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Node Environment
   NODE_ENV=development
   ```

4. **Setup Supabase**
   
   a. Buat project di [Supabase Dashboard](https://supabase.com/dashboard)
   
   b. Buat storage bucket:
   ```sql
   -- Di SQL Editor Supabase
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('kabox-files', 'kabox-files', true);
   ```
   
   c. Set storage policy (opsional - untuk akses publik):
   ```sql
   -- Policy untuk upload publik
   CREATE POLICY "Public upload" ON storage.objects 
   FOR INSERT WITH CHECK (bucket_id = 'kabox-files');
   
   -- Policy untuk akses publik
   CREATE POLICY "Public access" ON storage.objects 
   FOR SELECT USING (bucket_id = 'kabox-files');
   ```

5. **Jalankan development server**
   ```bash
   npm run dev
   ```

   Website akan berjalan di: `http://localhost:5000`

## 🌐 Deployment ke Vercel

### Otomatis (Recommended)

1. **Connect ke Vercel**
   - Login ke [Vercel Dashboard](https://vercel.com/dashboard)
   - Import project dari GitHub/GitLab
   - Vercel otomatis detect konfigurasi

2. **Set Environment Variables di Vercel**
   
   Di dashboard Vercel → Project → Settings → Environment Variables:
   
   **⚠️ PENTING: Set untuk semua environment (Production, Preview, Development)**
   
   ```bash
   # Database (Required)
   DATABASE_URL=postgresql://user:pass@host:port/database
   
   # Supabase Backend (Required)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
   SUPABASE_BUCKET_NAME=kabox-files
   
   # Custom Domain (Optional - untuk kabox.my.id)
   VITE_BASE_DOMAIN=https://kabox.my.id
   
   # Frontend (Required)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
   
   # Environment (Required)
   NODE_ENV=production
   ```
   
   **Langkah-langkah:**
   1. Buka Vercel Dashboard
   2. Pilih project kabox
   3. Settings → Environment Variables
   4. Add Variable untuk setiap env variable di atas
   5. ✅ Centang **Production**, **Preview**, dan **Development**

3. **Deploy**
   - Klik "Deploy" 
   - Tunggu build selesai (±2-3 menit)
   - Jika ada error, cek Function Logs di dashboard
   
4. **Setup Custom Domain (Opsional)**
   
   Untuk menggunakan `kabox.my.id`:
   1. Vercel Dashboard → Project → Settings → Domains
   2. Add Domain: `kabox.my.id`
   3. Set DNS di provider domain:
      ```
      Type: CNAME
      Name: @
      Value: cname.vercel-dns.com
      ```
   4. Update environment variable:
      ```
      VITE_BASE_DOMAIN=https://kabox.my.id
      ```

### Manual (CLI)

```bash
# Install Vercel CLI
npm i -g vercel

# Login dan deploy
vercel --prod
```

## 📋 API Documentation

### Upload Endpoint

**URL:** `POST /api/upload`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `files` - File upload (max 3 files, 50MB each)
- `urls` - URL eksternal (optional, array)

**Example cURL:**
```bash
curl -X POST https://your-domain.com/api/upload \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.mp4" \
  -F "urls=https://example.com/image.png"
```

**Example Response:**
```json
{
  "success": true,
  "files": [
    {
      "name": "abc123def456.jpg",
      "url": "https://your-domain.com/files/abc123def456.jpg",
      "mime": "image/jpeg",
      "size": 2848392
    }
  ]
}
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('files', file);
formData.append('urls', 'https://example.com/image.jpg');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

## 🏗️ Struktur Project

```
kabox/
├── api/                    # Vercel serverless functions
│   ├── upload.js          # Upload endpoint
│   └── files/[filename].js # File serving endpoint
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── pages/         # App pages
│   └── index.html
├── server/                # Development server (local only)
├── shared/                # Shared types/schemas
├── .env.example          # Environment template
├── vercel.json           # Vercel configuration
└── README.md
```

## 🔧 Konfigurasi

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_BUCKET_NAME` | Storage bucket name | ✅ |
| `VITE_BASE_DOMAIN` | Your app domain | ⚠️ Auto-detect jika kosong |
| `VITE_SUPABASE_URL` | Supabase URL untuk frontend | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase key untuk frontend | ✅ |
| `NODE_ENV` | Environment mode | ⚠️ |

### File Limits

- **Maximum file size**: 50MB per file
- **Maximum files**: 3 files per upload
- **Supported formats**: Semua format multimedia
- **Storage**: Unlimited (tergantung Supabase plan)

## 🛠️ Development

### Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npm run db:push      # Push schema changes to database
```

### Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express (dev) / Vercel Functions (prod)
- **Database**: PostgreSQL + Drizzle ORM
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## 🐛 Troubleshooting

### Common Issues

1. **File tidak bisa diupload**
   - Periksa ukuran file (max 50MB)
   - Pastikan environment variables benar
   - Cek Supabase bucket configuration

2. **URL file tidak bisa diakses**
   - Periksa Supabase storage policy
   - Pastikan bucket bersifat public
   - Cek CORS configuration

3. **Build error di Vercel**
   - Pastikan semua environment variables sudah diset
   - Cek vercel.json configuration
   - Pastikan dependencies sudah lengkap

4. **API tidak berfungsi**
   - Periksa Vercel function logs: Dashboard → Functions → View Function Logs
   - Pastikan environment variables sudah diset dengan benar
   - Cek network tab di browser untuk error details
   - Verify Supabase bucket permissions

5. **Error 404/405 di Vercel**
   - Pastikan vercel.json configuration benar
   - Cek function routing di dashboard
   - Pastikan tidak ada konflik dengan static files

6. **Custom domain tidak berfungsi**
   - Verifikasi DNS settings di domain provider
   - Pastikan VITE_BASE_DOMAIN sudah diupdate
   - Tunggu propagasi DNS (hingga 24 jam)

### Debug Mode

Set `NODE_ENV=development` untuk melihat detailed logs.

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 👨‍💻 Developer

**aka** - 15 tahun, Sumatera Barat, Pelajar

"gw hanya pemula 🗿"

📱 [WhatsApp](https://wa.me/6281266950382)

---

kabox © 2025 - dibuat oleh aka