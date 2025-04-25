import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UploadCloud, X, Image } from "lucide-react";

interface FileUploadProps {
  className?: string;
  accept?: string;
  maxSize?: number;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  previewUrl?: string;
}

export function FileUpload({
  className,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileChange,
  disabled = false,
  previewUrl,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFile = (file: File | null) => {
    setError(null);
    
    if (!file) {
      setPreview(null);
      onFileChange(null);
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Pass file to parent
    onFileChange(file);
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
  };
  
  const clearFile = () => {
    setPreview(null);
    onFileChange(null);
  };
  
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          preview ? "py-2" : "py-8"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full max-h-64 object-contain rounded-md mx-auto"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-primary">
              <UploadCloud className="h-12 w-12 mx-auto" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-medium">
                {disabled ? "Upload disabled" : "Drag and drop your image here"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, GIF up to {maxSize / (1024 * 1024)}MB
              </p>
              {!disabled && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    const input = document.getElementById("file-upload") as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <Image className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
              )}
            </div>
          </>
        )}
        <input
          type="file"
          id="file-upload"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="sr-only"
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}