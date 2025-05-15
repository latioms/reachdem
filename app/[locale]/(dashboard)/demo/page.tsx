"use client";

import React, { useState, useRef, useCallback } from 'react';
import { IntelligentCsvInput } from '@/components/csv/intelligent-csv-input';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DemoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<any | null>(null);
  const [messageText, setMessageText] = useState('');
  const [previewMessage, setPreviewMessage] = useState('');
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  // Parse CSV data to extract columns
  const parseCSVData = (data: string) => {
    const lines = data.trim().split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };
    
    // Detect delimiter (comma or tab)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    
    // Extract headers
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
    
    // Extract rows
    const rows = lines.slice(1).map(line => {
      const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {} as Record<string, string>);
    });
    
    return { headers, rows };
  };

  const handleProcessData = async (file?: File, text?: string) => {
    setIsProcessing(true);
    
    if (file) {
      setSelectedFile(file);
      setInputText(null);
      console.log("Processing CSV file:", file.name);
      
      // Read the file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        processCSVContent(content, `File: ${file.name}`);
      };
      reader.readAsText(file);
    } else if (text) {
      setInputText(text);
      setSelectedFile(null);
      console.log("Processing manual input, length:", text.length);
      processCSVContent(text, "Manual input");
    } else {
      setIsProcessing(false);
      return;
    }
  };

  const processCSVContent = (content: string, source: string) => {
    try {
      const { headers, rows } = parseCSVData(content);
      
      setProcessedData({
        source,
        rowCount: rows.length,
        columns: headers,
        sampleData: rows.slice(0, 2)
      });
    } catch (error) {
      console.error("Error processing data:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const insertVariableAtCursor = (variable: string) => {
    const input = messageInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = messageText;
    const newValue = currentValue.substring(0, start) + `{{ ${variable} }}` + currentValue.substring(end);
    
    setMessageText(newValue);
    
    // Set focus back and position cursor after the inserted variable
    setTimeout(() => {
      input.focus();
      const newPosition = start + variable.length + 6; // 6 is the length of "{{ " and " }}"
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handlePreview = () => {
    if (!processedData || !processedData.sampleData || processedData.sampleData.length === 0) {
      setPreviewMessage(messageText);
      return;
    }

    // Use first row data for preview
    const sampleRow = processedData.sampleData[0];
    let previewText = messageText;

    // Replace all variables with actual values
    const pattern = /\{\{\s*([^}]+)\s*\}\}/g;
    previewText = previewText.replace(pattern, (match, varName) => {
      const trimmedVarName = varName.trim();
      return sampleRow[trimmedVarName] || match;
    });

    setPreviewMessage(previewText);
  };

  const copyVariableToClipboard = (variable: string) => {
    const textToCopy = `{{ ${variable} }}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedVariable(variable);
        setTimeout(() => setCopiedVariable(null), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  const hasInput = selectedFile || inputText;

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6">
      <div className="w-full max-w-3xl">
                
        <IntelligentCsvInput 
          onProcess={handleProcessData} 
          placeholder="Upload a file or enter data manually" 
        />
        
        {!hasInput ? (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Upload your CSV file or enter data manually to create personalized message templates with dynamic variables
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left column - Message input */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Message Template</h2>
                  <Textarea 
                    ref={messageInputRef}
                    placeholder="Enter your message here. Use {{ variable }} to insert dynamic content from your data."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="min-h-[200px] text-sm resize-y"
                  />
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={handlePreview} 
                      disabled={!processedData || isProcessing}
                    >
                      Preview with Sample Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {previewMessage && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-2">Preview</h2>
                    <div className="bg-muted/50 p-4 rounded-md whitespace-pre-wrap">
                      {previewMessage}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Right column - Variables and data info */}
            <div>
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-2">
                    {processedData?.source || (selectedFile ? `File: ${selectedFile.name}` : "Manual Input")}
                  </h2>
                  
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p>Processing your data...</p>
                    </div>
                  ) : processedData ? (
                    <div className="space-y-4">
                      <p><span className="font-medium">Rows detected:</span> {processedData.rowCount}</p>
                      
                      <div>
                        <p className="font-medium mb-1">Available Variables:</p>
                        <div className="flex flex-wrap gap-2">
                          {processedData.columns.map((col: string, i: number) => (
                            <TooltipProvider key={i}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className="cursor-pointer hover:bg-primary/10"
                                    onClick={() => insertVariableAtCursor(col)}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>{col}</span>
                                      <button onClick={(e) => {
                                        e.stopPropagation();
                                        copyVariableToClipboard(col);
                                      }}>
                                        {copiedVariable === col ? (
                                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Copy className="h-3 w-3 text-muted-foreground" />
                                        )}
                                      </button>
                                    </div>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Click to insert or copy this variable</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-1">Sample data:</p>
                        <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm">
                          {JSON.stringify(processedData.sampleData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
