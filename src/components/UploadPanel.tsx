import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadPanelProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export function UploadPanel({ onUpload, isLoading, error }: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-neutral-200">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Agenda Builder</h2>
        <p className="text-sm text-neutral-500 mt-1">Upload a document overview, transcript, or brief to magically extract an agenda.</p>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors 
            ${selectedFile ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
          />
          
          {selectedFile ? (
            <div className="flex flex-col items-center text-center">
              <FileText className="h-10 w-10 text-blue-500 mb-3" />
              <p className="text-sm font-medium text-neutral-900 truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-xs text-neutral-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <Button variant="link" size="sm" onClick={handleClear} className="mt-2 text-red-500 hover:text-red-600">
                Remove file
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-neutral-900 mb-1">Select a file</p>
              <p className="text-xs text-neutral-500 mb-4 text-center max-w-[200px]">
                Drag and drop or click below. Supports PDF, TXT, DOCX, CSV.
              </p>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                Browse Files
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-sm p-3 rounded-md flex items-start border border-red-100">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="break-words leading-relaxed">{error}</span>
          </div>
        )}

        <Button 
          type="button"
          onClick={handleSubmit} 
          disabled={!selectedFile || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Document...
            </>
          ) : (
            'Generate Agenda'
          )}
        </Button>
      </div>
    </div>
  );
}
