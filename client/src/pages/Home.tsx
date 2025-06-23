import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { FileUploader } from "@/components/FileUploader";
import { UploadResults } from "@/components/UploadResults";
import { ApiDocumentation } from "@/components/ApiDocumentation";
import { DeveloperCard } from "@/components/DeveloperCard";
import { Button } from "@/components/ui/button";
import { Cloud, Moon, Sun, Infinity, Shield, Zap } from "lucide-react";

interface UploadResult {
  name: string;
  url: string;
  mime: string;
  size: number;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  const handleUploadComplete = (results: UploadResult[]) => {
    setUploadResults(results);
  };

  const clearResults = () => {
    setUploadResults([]);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-card shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">kabox</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hover:bg-muted p-2"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Upload File Publik Profesional
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto px-4">
            Layanan CDN uploader modern yang memungkinkan Anda mengunggah file multimedia apa pun dan mendapatkan URL publik permanen. Tanpa registrasi, tanpa batas waktu.
          </p>
        </div>

        {/* File Uploader */}
        <FileUploader onUploadComplete={handleUploadComplete} />

        {/* Upload Results */}
        <UploadResults results={uploadResults} onClear={clearResults} />

        {/* API Documentation */}
        <ApiDocumentation />

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-card rounded-xl p-4 sm:p-6 border hover-lift transition-all duration-300">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Infinity className="text-primary" size={20} />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Tanpa Batas Waktu</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">File multimedia tersimpan permanen tanpa expired</p>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-4 sm:p-6 border hover-lift transition-all duration-300">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="text-green-500" size={20} />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Akses Publik</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Dapat diakses oleh siapa saja tanpa autentikasi</p>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-4 sm:p-6 border hover-lift transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Zap className="text-orange-500" size={20} />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">CDN Cepat</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Akses file multimedia dengan kecepatan tinggi</p>
            </div>
          </div>
        </div>

        {/* Developer Card */}
        <DeveloperCard />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground text-sm">
            kabox © 2025 - dibuat oleh aka
          </p>
        </div>
      </footer>
    </div>
  );
}
