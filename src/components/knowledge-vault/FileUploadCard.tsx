import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadCardProps {
  title: string;
  description: string;
  points: number;
  acceptedTypes?: string[];
  onFileUpload?: (file: File) => Promise<void>;
  isUploading?: boolean;
  uploadedFile?: any;
  onRemoveFile?: () => void;
  className?: string;
}

export const FileUploadCard = ({
  title,
  description,
  points,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
  onFileUpload,
  isUploading = false,
  uploadedFile,
  onRemoveFile,
  className
}: FileUploadCardProps) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(files[0]);
    }
  };

  const handleCardClick = () => {
    if (!uploadedFile && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200 cursor-pointer group relative overflow-hidden",
        dragOver && "border-primary bg-primary/5",
        uploadedFile && "border-green-500 bg-green-50 dark:bg-green-950/20",
        isUploading && "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
        !uploadedFile && !isUploading && "border-2 border-dashed border-muted-foreground/25 hover:border-primary/50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCardClick}
    >
      <CardContent className="p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
            <div>
              <h4 className="font-semibold text-orange-700 dark:text-orange-300">{title}</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">Uploading...</p>
            </div>
            <Progress value={75} className="w-full" />
          </div>
        ) : uploadedFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile?.();
                }}
                className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-300">{title}</h4>
              <p className="text-sm text-green-600 dark:text-green-400 truncate">
                {uploadedFile.file_name}
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                {formatFileSize(uploadedFile.file_size)}
              </p>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              +{points} points
            </Badge>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary mx-auto transition-colors" />
            <div>
              <h4 className="font-semibold mb-1">{title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{description}</p>
              <Badge variant="outline">+{points} points</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Click or drag to upload • {acceptedTypes.join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};