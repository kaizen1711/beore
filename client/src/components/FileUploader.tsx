import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Plus, File, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileInfo {
  file?: File;
  url?: string;
  name: string;
  size?: number;
  type: 'file' | 'url';
}

interface FileUploaderProps {
  onUploadComplete: (results: any[]) => void;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (file.size > 50 * 1024 * 1024) {
      return `File ${file.name} melebihi batas maksimal 50MB`;
    }
    return null;
  };

  const handleFileSelection = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newFiles: FileInfo[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "File terlalu besar",
          description: error,
          variant: "destructive",
        });
        continue;
      }
      
      if (selectedFiles.length + newFiles.length >= 3) {
        toast({
          title: "Batas maksimal",
          description: "Maksimal 3 file dapat diupload sekaligus",
          variant: "destructive",
        });
        break;
      }
      
      newFiles.push({
        file,
        name: file.name,
        size: file.size,
        type: 'file'
      });
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [selectedFiles.length, toast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drop-zone-active');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-zone-active');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-zone-active');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
  };

  const addUrlFile = () => {
    const url = urlInput.trim();
    if (!url) return;
    
    try {
      new URL(url);
    } catch {
      toast({
        title: "URL tidak valid",
        description: "Pastikan URL yang dimasukkan benar",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedFiles.length >= 3) {
      toast({
        title: "Batas maksimal",
        description: "Maksimal 3 file dapat diupload sekaligus",
        variant: "destructive",
      });
      return;
    }
    
    const filename = url.split('/').pop()?.split('?')[0] || 'file';
    setSelectedFiles(prev => [...prev, {
      url,
      name: filename,
      type: 'url'
    }]);
    setUrlInput("");
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      // Add files
      selectedFiles.forEach(fileInfo => {
        if (fileInfo.type === 'file' && fileInfo.file) {
          formData.append('files', fileInfo.file);
        }
      });
      
      // Add URLs
      const urls = selectedFiles
        .filter(f => f.type === 'url')
        .map(f => f.url!);
      
      if (urls.length > 0) {
        urls.forEach(url => {
          formData.append('urls', url);
        });
      }
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 200);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload gagal');
      }
      
      toast({
        title: "Upload berhasil!",
        description: `${result.files.length} file berhasil diupload`,
      });
      
      onUploadComplete(result.files);
      setSelectedFiles([]);
      
    } catch (error) {
      toast({
        title: "Upload gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-fade-in">
      <div className="space-y-6">
        {/* File Upload Method */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-foreground flex items-center">
            <Upload className="mr-2 text-primary" size={18} />
            Upload dari Perangkat
          </h3>
          
          {/* File Drop Zone */}
          <div 
            className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 lg:p-8 text-center hover:border-primary hover:bg-muted/50 transition-all duration-300 cursor-pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl text-muted-foreground">
                <Upload className="mx-auto" size={32} />
              </div>
              <div>
                <p className="text-base sm:text-lg text-muted-foreground mb-2">
                  Seret file ke sini atau klik untuk memilih
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Maksimal 3 file multimedia, ukuran masing-masing hingga 50MB
                </p>
              </div>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="*/*" 
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2 animate-slide-in">
              {selectedFiles.map((fileInfo, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {fileInfo.type === 'file' ? (
                      <File className="text-muted-foreground" size={16} />
                    ) : (
                      <Link className="text-muted-foreground" size={16} />
                    )}
                    <span className="text-sm font-medium">{fileInfo.name}</span>
                    {fileInfo.size && (
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(fileInfo.size)}
                      </span>
                    )}
                    {fileInfo.type === 'url' && (
                      <span className="text-xs text-blue-500">dari URL</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* URL Upload Method */}
        <div className="border-t pt-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-foreground flex items-center">
            <Link className="mr-2 text-primary" size={18} />
            Upload dari URL
          </h3>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Input 
              type="url" 
              placeholder="https://example.com/multimedia.mp4" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addUrlFile()}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={addUrlFile}
              variant="secondary"
              disabled={!urlInput.trim() || selectedFiles.length >= 3}
            >
              <Plus size={16} className="mr-2" />
              Tambah
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            File multimedia dari URL akan diunduh dan diunggah ulang ke server kami
          </p>
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t space-y-3 sm:space-y-0">
          <div className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">{selectedFiles.length}</span> file multimedia dipilih
          </div>
          
          <Button 
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 font-medium ${isUploading ? 'btn-loading' : ''}`}
          >
            {!isUploading && <Upload size={16} className="mr-2" />}
            {isUploading ? 'Mengupload...' : 'Upload File'}
          </Button>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="animate-slide-in">
            <Progress value={uploadProgress} className="h-2 progress-bar" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Mengunggah file... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
