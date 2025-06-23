import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code, Copy, CheckCircle, FileText, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ApiDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      
      toast({
        title: "Disalin!",
        description: "Kode berhasil disalin ke clipboard",
      });
      
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: "Gagal menyalin",
        description: "Silakan salin kode secara manual",
        variant: "destructive",
      });
    }
  };

  const currentDomain = window.location.origin.includes('localhost') 
    ? 'https://kabox.my.id' 
    : window.location.origin;

  const curlExample = `curl -X POST ${currentDomain}/api/upload \\
  -F "files=@/path/to/file1.jpg" \\
  -F "files=@/path/to/file2.mp4" \\
  -F "urls=https://example.com/image.png"`;
    
  const responseExample = `{
  "success": true,
  "files": [
    {
      "name": "abc123def456.jpg",
      "url": "${currentDomain}/files/abc123def456.jpg",
      "mime": "image/jpeg",
      "size": 2848392
    },
    {
      "name": "xyz789uvw012.mp4",
      "url": "${currentDomain}/files/xyz789uvw012.mp4",
      "mime": "video/mp4",
      "size": 15728640
    }
  ]
}`;

  const jsExample = `// JavaScript/Node.js Example
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('urls', 'https://example.com/image.png');

fetch('${currentDomain}/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));`;

  return (
    <div className="bg-card rounded-xl shadow-lg border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground flex items-center mb-2">
          <Code className="mr-2 text-primary" size={18} />
          Dokumentasi API
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Gunakan API kabox untuk mengintegrasikan upload file multimedia ke aplikasi Anda
        </p>
      </div>

      <div className="space-y-6">
        {/* API Endpoint */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center text-sm sm:text-base">
            <Zap className="mr-2 text-green-500" size={16} />
            Endpoint Upload
          </h4>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <code className="text-xs sm:text-sm font-mono text-primary">POST /api/upload</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`${currentDomain}/api/upload`, 'endpoint')}
                className="h-6 w-6 p-0"
              >
                {copiedCode === 'endpoint' ? (
                  <CheckCircle size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Metode:</strong> multipart/form-data
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Parameter:</strong> files (max 3), urls (opsional)
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Ukuran:</strong> maksimal 50MB per file
            </p>
          </div>
        </div>

        {/* cURL Example */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center text-sm sm:text-base">
            <FileText className="mr-2 text-blue-500" size={16} />
            Contoh cURL
          </h4>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <pre className="text-xs font-mono text-foreground overflow-x-auto flex-1 mr-2">
                {curlExample}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(curlExample, 'curl')}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                {copiedCode === 'curl' ? (
                  <CheckCircle size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* JavaScript Example */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center text-sm sm:text-base">
            <Code className="mr-2 text-yellow-500" size={16} />
            Contoh JavaScript
          </h4>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <pre className="text-xs font-mono text-foreground overflow-x-auto flex-1 mr-2">
                {jsExample}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(jsExample, 'js')}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                {copiedCode === 'js' ? (
                  <CheckCircle size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Response Example */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center text-sm sm:text-base">
            <CheckCircle className="mr-2 text-green-500" size={16} />
            Contoh Response
          </h4>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <pre className="text-xs font-mono text-foreground overflow-x-auto flex-1 mr-2">
                {responseExample}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(responseExample, 'response')}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                {copiedCode === 'response' ? (
                  <CheckCircle size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-background rounded-lg p-3 border">
          <h4 className="font-semibold text-foreground mb-2 text-sm">Fitur API:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>• Upload hingga 3 file sekaligus</div>
            <div>• Support semua format multimedia</div>
            <div>• Upload dari URL eksternal</div>
            <div>• URL permanen tanpa expired</div>
            <div>• CDN cepat dengan cache</div>
            <div>• Tanpa autentikasi required</div>
          </div>
        </div>
      </div>
    </div>
  );
}