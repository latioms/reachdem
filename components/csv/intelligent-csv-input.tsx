"use client";

import React, { useState, useCallback } from 'react';
import { Sparkles, Paperclip, FileText } from 'lucide-react';
import { BorderBeam } from '@/components/magicui/border-beam';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface IntelligentCsvInputProps {
  placeholder?: string;
  onProcess?: (file?: File, text?: string) => void;
  className?: string;
}

export function IntelligentCsvInput({
  placeholder = "Upload a CSV file or enter data manually",
  onProcess,
  className,
}: IntelligentCsvInputProps) {
  const [showBeam, setShowBeam] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (onProcess) {
      setShowBeam(true);
      onProcess(file);

      setTimeout(() => {
        setShowBeam(false);
      }, 6000);
    }
  };

  const processManualInput = () => {
    if (manualText.trim() && onProcess) {
      setShowBeam(true);
      onProcess(undefined, manualText);

      setTimeout(() => {
        setShowBeam(false);
      }, 6000);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's a CSV file
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        processFile(file);
      } else {
        console.log("Not a CSV file");
        // Could show an error message here
      }
    }
  }, [onProcess]);

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "border rounded-xl p-4 bg-background relative overflow-hidden",
        showBeam ? "shadow-lg" : "",
        isDragging ? "border-primary ring-2 ring-primary/20" : ""
      )}>
        {showBeam && <BorderBeam colorFrom="#4c84ff" colorTo="#c054ff" />}
        {/* Text Input Area with horizontal label */}
        <div className="mt-3">
          <Textarea
            placeholder="Enter your data here (comma or tab separated values)..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="min-h-[80px] text-sm resize-y"
          />
        </div>

        <div className="space-y-4">

          {/* File Input Area */}
          <div
            className="w-full"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-between gap-2 mt-2">
              
              
              <button
                onClick={handleButtonClick}
                className="p-0 rounded-lg transition-colors relative group hover:bg-muted cursor-pointer"
                title="Upload CSV file"
              >
                <div className="relative">
                  <Paperclip className="size-5 -rotate-45 text-gray-400" />
                  <Sparkles className="size-3 absolute -top-1 -right-1 text-gray-400" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="sr-only">Upload CSV file</span>
              </button>

              <div className={cn(
                "flex py-2 px-3 transition-color items-center  h-10",
                isDragging
                  ? "bg-primary/10 border-dashed border-primary/50"
                  : "bg-background border-input"
              )}>

                {selectedFile ? (
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="size-4 text-primary" />
                    <span className="truncate">{selectedFile.name}</span>
                  </div>
                ) : (
                  <span className="flex text-muted-foreground text-xs truncate justify-self-end"></span>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
