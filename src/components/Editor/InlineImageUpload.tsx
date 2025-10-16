import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Link as LinkIcon,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InlineImageUploadProps {
  onImageInsert: (src: string, alt?: string) => void;
  onCancel: () => void;
}

interface UploadStatus {
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  message?: string;
}

export function InlineImageUpload({
  onImageInsert,
  onCancel,
}: InlineImageUploadProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [dragActive, setDragActive] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: "idle",
    progress: 0,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setUploadStatus({
        status: "error",
        progress: 0,
        message: "Por favor, selecione apenas arquivos de imagem.",
      });
      return;
    }

    // Validar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({
        status: "error",
        progress: 0,
        message: "O arquivo deve ter no máximo 5MB.",
      });
      return;
    }

    setUploadStatus({ status: "uploading", progress: 0 });

    try {
      // Simular upload com progresso
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadStatus({ status: "uploading", progress });
        }
      };

      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setUploadStatus({
          status: "success",
          progress: 100,
          message: "Imagem carregada com sucesso!",
        });
      };

      reader.onerror = () => {
        setUploadStatus({
          status: "error",
          progress: 0,
          message: "Erro ao carregar a imagem.",
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setUploadStatus({
        status: "error",
        progress: 0,
        message: "Erro ao processar a imagem.",
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onImageInsert(imageUrl.trim(), imageAlt.trim() || undefined);
    }
  };

  const handleUploadSubmit = () => {
    if (previewUrl) {
      onImageInsert(previewUrl, imageAlt.trim() || undefined);
    }
  };

  const resetUpload = () => {
    setUploadStatus({ status: "idle", progress: 0 });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="inline-upload">
      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-4">
        <Button
          variant={activeTab === "upload" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("upload")}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <Button
          variant={activeTab === "url" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("url")}
          className="flex-1"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          URL
        </Button>
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div className="space-y-4">
          {!previewUrl ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="inline-upload-content"
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground inline-upload-icon" />
                <p className="text-lg font-medium mb-2 inline-upload-text">
                  {dragActive
                    ? "Solte a imagem aqui"
                    : "Arraste uma imagem ou clique para selecionar"}
                </p>
                <p className="text-sm text-muted-foreground inline-upload-subtext">
                  PNG, JPG, GIF até 5MB
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="inline-upload-preview">
                <img src={previewUrl} alt="Preview" />
                <div className="inline-upload-actions">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={resetUpload}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {uploadStatus.status === "uploading" && (
                  <div className="inline-upload-progress">
                    <div
                      className="inline-upload-progress-bar"
                      style={{ width: `${uploadStatus.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Upload Status */}
              <AnimatePresence>
                {uploadStatus.status !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`inline-upload-status ${uploadStatus.status}`}
                  >
                    {uploadStatus.status === "uploading" && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        <span>Carregando imagem...</span>
                      </div>
                    )}

                    {uploadStatus.status === "success" && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>{uploadStatus.message}</span>
                      </div>
                    )}

                    {uploadStatus.status === "error" && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>{uploadStatus.message}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* URL Tab */}
      {activeTab === "url" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              URL da Imagem
            </label>
            <Input
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {imageUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="border rounded-lg p-4 bg-muted/30">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full h-32 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alt Text */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Texto Alternativo (opcional)
        </label>
        <Input
          placeholder="Descreva a imagem para acessibilidade"
          value={imageAlt}
          onChange={(e) => setImageAlt(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        {activeTab === "upload" ? (
          <Button
            onClick={handleUploadSubmit}
            disabled={!previewUrl || uploadStatus.status === "uploading"}
          >
            Inserir Imagem
          </Button>
        ) : (
          <Button onClick={handleUrlSubmit} disabled={!imageUrl.trim()}>
            Inserir Imagem
          </Button>
        )}
      </div>
    </div>
  );
}
