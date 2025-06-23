import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Copy, ExternalLink, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  name: string;
  url: string;
  mime: string;
  size: number;
}

interface UploadResultsProps {
  results: UploadResult[];
  onClear: () => void;
}

export function UploadResults({ results, onClear }: UploadResultsProps) {
  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrls(prev => new Set([...prev, url]));
      
      toast({
        title: "Disalin!",
        description: "URL berhasil disalin ke clipboard",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Gagal menyalin",
        description: "Silakan salin URL secara manual",
        variant: "destructive",
      });
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (results.length === 0) return null;

  return (
    <div className="bg-card rounded-xl shadow-lg border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground flex items-center">
          <CheckCircle className="mr-2 text-green-500" size={18} />
          Upload Berhasil!
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground"
        >
          Bersihkan
        </Button>
      </div>
      
      <div className="space-y-4">
        {results.map((file, index) => (
          <div key={index} className="bg-muted rounded-lg p-3 sm:p-4 hover-lift transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 min-w-0 flex-1">
                <File className="text-muted-foreground mt-1 flex-shrink-0" size={16} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm sm:text-base truncate">{file.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {file.mime} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-lg p-3 sm:p-4 border border-border">
              <p className="text-sm font-medium text-foreground mb-3">URL Publik:</p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Input 
                  type="text" 
                  readOnly 
                  value={file.url}
                  className="flex-1 font-mono text-sm bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 min-w-0 focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600"
                />
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(file.url)}
                    className={`transition-colors flex-shrink-0 ${
                      copiedUrls.has(file.url) 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : ''
                    }`}
                  >
                    {copiedUrls.has(file.url) ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span className="ml-1 hidden sm:inline">Salin</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInNewTab(file.url)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 flex-shrink-0"
                  >
                    <ExternalLink size={14} />
                    <span className="ml-1 hidden sm:inline">Buka</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
