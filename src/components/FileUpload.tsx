import React, { useCallback, useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";

interface FileUploadProps {
  file: File | null;
  onFile: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, onFile }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") {
      onFile(f);
    }
  }, [onFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      className={`ag-glass cursor-pointer p-8 text-center ${
        dragOver ? "border-foreground/20 bg-foreground/[0.04]" : ""
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />
      {file ? (
        <div>
          <FileText className="w-7 h-7 mx-auto mb-3 text-foreground/50" />
          <div className="text-foreground text-sm font-medium mb-1">{file.name}</div>
          <div className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB · Click to change
          </div>
        </div>
      ) : (
        <div>
          <Upload className="w-7 h-7 mx-auto mb-3 text-muted-foreground/50" />
          <div className="text-sm text-foreground/80 font-medium mb-1">
            Drop PDF here
          </div>
          <div className="text-xs text-muted-foreground/60">
            or click to browse
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;