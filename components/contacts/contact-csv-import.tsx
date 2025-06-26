'use client';

import React, { useState } from 'react';
import { IntelligentCsvInput } from '../csv/intelligent-csv-input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, TableIcon, Check, FileSpreadsheet as FileCsv, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { importContacts } from '@/app/actions/mail/contacts/importContacts';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// Constants
const BATCH_SIZE = 10;
const PREVIEW_ROWS = 5;
const CSV_DELIMITERS = [',', ';', '\t'] as const;

// Field mapping configuration
const FIELD_MAPPINGS: Record<string, string[]> = {
  'first_name': ['first name', 'firstname', 'prénom', 'prenom', 'given name', 'first', 'fname'],
  'last_name': ['last name', 'lastname', 'nom', 'nom de famille', 'surname', 'family name', 'last', 'lname'],
  'email': ['email', 'mail', 'e-mail', 'courriel', 'adresse email', 'adresse e-mail', 'email1'],
  'phone': ['phone', 'phone number', 'telephone', 'téléphone', 'tel', 'mobile', 'cell', 'portable', 'whatsapp'],
  'address': ['address', 'adresse', 'street', 'rue', 'location', 'lieu']
};

interface CsvImportProps {
  onSuccess?: () => void;
  dictionary?: {
    contacts?: {
      csvImport?: {
        title?: string;
        description?: string;
        fieldMappingTitle?: string;
        selectField?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        address?: string;
        previewTitle?: string;
        importButton?: string;
        importing?: string;
        success?: string;
        successDescription?: string;
        failed?: string;
        noMapping?: string;
        noData?: string;
        backToForm?: string;
        errors?: string;
        requiredFields?: string;
        emptyFile?: string;
        processingError?: string;
      };
    };
  };
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

interface FieldMapping {
  [key: string]: string;
}

export function ContactCsvImport({ onSuccess, dictionary }: CsvImportProps) {
  const [csvData, setCsvData] = useState<Record<string, string>[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  
  // Utiliser les traductions du dictionnaire avec fallbacks
  const t = dictionary?.contacts?.csvImport || {};

  const targetFields = [
    { key: 'first_name', label: t?.firstName || 'Prénom' },
    { key: 'last_name', label: t?.lastName || 'Nom' },
    { key: 'email', label: t?.email || 'Email' },
    { key: 'phone', label: t?.phone || 'Téléphone' },
    { key: 'address', label: t?.address || 'Adresse' },
  ];
  const handleCsvProcess = (file?: File, text?: string) => {
    setError(null);
    try {
      if (text) {
        processCsvContent(text);
      } else if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            processCsvContent(content);
          }
        };
        reader.readAsText(file);
      }    } catch (err) {
      console.error('Error processing CSV:', err);
      setError(t?.processingError || 'Erreur lors du traitement du fichier CSV');
    }
  };
  const processCsvContent = (content: string) => {
    try {
      const lines = content.split(/\r?\n/);      if (lines.length === 0) {
        setError(t?.emptyFile || 'Fichier vide');
        return;
      }

      // Detect the delimiter (comma, semicolon, or tab)
      const firstLine = lines[0];
      let delimiter = ',';
      if (firstLine.includes(';')) delimiter = ';';
      else if (firstLine.includes('\t')) delimiter = '\t';

      // Parse headers
      const headersLine = lines[0];
      const detectedHeaders = headersLine
        .split(delimiter)
        .map(header => header.trim().replace(/^["']|["']$/g, ''));
      
      setHeaders(detectedHeaders);

      // Parse data (skip empty lines)
      const parsedData = lines
        .slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
          // Handle quoted values with commas inside
          const values: string[] = [];
          let currentValue = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if ((char === '"' || char === "'") && (i === 0 || line[i-1] !== '\\')) {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              values.push(currentValue.trim().replace(/^["']|["']$/g, ''));
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue.trim().replace(/^["']|["']$/g, ''));

          // Create object with headers as keys
          const rowData: Record<string, string> = {};
          detectedHeaders.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });
          
          return rowData;
        });      setCsvData(parsedData);
      setPreview(parsedData.slice(0, PREVIEW_ROWS));
      
      // Auto-map fields with improved logic
      const autoMapping: FieldMapping = {};
      
      detectedHeaders.forEach(header => {
        const headerLower = header.toLowerCase().trim();
        Object.entries(FIELD_MAPPINGS).forEach(([targetField, possibleMatches]) => {
          // Exact match first, then partial match
          if (possibleMatches.includes(headerLower) || 
              possibleMatches.some(match => headerLower.includes(match))) {
            if (!autoMapping[targetField]) { // Don't override existing mapping
              autoMapping[targetField] = header;
            }
          }
        });
      });
      
      setFieldMapping(autoMapping);    } catch (err) {
      console.error('Error processing CSV:', err);
      setError(t?.errors || 'Erreur lors de l\'analyse du fichier CSV');
    }
  };
  const handleFieldMappingChange = (fieldKey: string, headerValue: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [fieldKey]: headerValue
    }));
  };
  
  // Composant pour le contenu du toast avec barre de progression
  const ProgressToast = ({ progress }: { progress: number }) => (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <p className="font-medium">
          {t?.importing || "Import en cours..."}
        </p>
        <span className="text-sm text-muted-foreground">{`${progress}%`}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );

  const handleImport = async () => {
    // Validate that at least email is mapped
    if (!fieldMapping.email) {
      setError(t?.noMapping || 'Veuillez faire correspondre au moins l\'email avant d\'importer');
      return;
    }

    if (!csvData || csvData.length === 0) {
      setError(t?.noData || 'Aucune donnée à importer');
      return;
    }

    setIsLoading(true);
    setError(null);
    setImportProgress(0);

    // Fonction qui effectue l'importation avec le suivi de progression
    const importFunction = async () => {
      try {
        // Transform data according to field mapping
        const transformedData = csvData.map(row => {
          const transformedRow: Record<string, string> = {};
          
          // Map each field according to the defined mapping
          Object.entries(fieldMapping).forEach(([targetField, sourceHeader]) => {
            if (sourceHeader && row[sourceHeader] !== undefined) {
              transformedRow[targetField] = row[sourceHeader];
            } else {
              transformedRow[targetField] = '';
            }
          });

          // Ensure email is added if available
          if (fieldMapping.email && row[fieldMapping.email]) {
            transformedRow.email = row[fieldMapping.email];
          }

          return transformedRow;
        });

        // Filter out records without email
        const validData = transformedData.filter(row => row.email && row.email.trim() !== '');
        
        if (validData.length === 0) {
          throw new Error(t?.requiredFields || 'Email est obligatoire');
        }
          // Process contacts in batches to show progress
        const batchSize = BATCH_SIZE;
        let processed = 0;
        let successful = 0;
        let failed = 0;
        const errors: { email: string; error: string }[] = [];
        
        // Process in batches
        for (let i = 0; i < validData.length; i += batchSize) {
          const batch = validData.slice(i, i + batchSize);
          
          try {
            const batchResult = await importContacts(batch);
            
            if (batchResult.error) {
              errors.push({ email: 'batch', error: batchResult.error });
              failed += batch.length;
            } else if (batchResult.data) {
              successful += batchResult.data.success;
              failed += batchResult.data.failed;
              errors.push(...batchResult.data.errors);
            }
          } catch (err) {
            console.error("Batch import error:", err);
            failed += batch.length;
          }
          
          processed += batch.length;
          const progress = Math.round((processed / validData.length) * 100);
          setImportProgress(progress);
        }
        
        // Update result
        const result = {
          success: successful,
          failed,
          errors
        };
        
        setImportResult(result);
        
        // Si tout s'est bien passé ou s'il y a des réussites partielles
        if (successful > 0) {
          // Appel du callback onSuccess après un certain délai
          if (failed === 0 && onSuccess) {
            setTimeout(() => {
              onSuccess();
            }, 1000);
          }
          
          if (failed > 0) {
            return `${successful} ${t?.successDescription || "contacts importés avec succès"}, ${failed} ${t?.failed || "en échec"}`;
          } else {
            return `${successful} ${t?.successDescription || "contacts importés avec succès"}`;
          }
        } else {
          // Si aucun contact n'a été importé avec succès, c'est un échec
          throw new Error(`${failed} ${t?.failed || "contacts en échec"}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Utiliser toast.promise pour une expérience utilisateur élégante
    toast.promise(importFunction(), {
      loading: <ProgressToast progress={importProgress} />,
      success: (data) => data,
      error: (err) => err.message || 'Erreur lors de l\'importation des contacts',
      id: 'import-promise',
    });
  };

  return (
    <Card className="w-full">      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          {t?.title || "Importer des contacts"}
        </CardTitle>
        <CardDescription>
          {t?.description || "Importez des contacts à partir d'un fichier CSV ou Excel"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {importResult ? (
          <div className="space-y-4">
            {importResult.success > 0 && (              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">{t?.success || "Import réussi"}</AlertTitle>
                <AlertDescription className="text-green-700">
                  {importResult.success} {t?.successDescription || "contacts importés avec succès"}
                </AlertDescription>
              </Alert>
            )}
            
            {importResult.failed > 0 && (
              <div className="space-y-4">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">{importResult.failed} {t?.failed || "contacts en échec"}</AlertTitle>
                </Alert>
                
                <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                  <Table>
                    <TableCaption>{t?.errors || "Erreurs"}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Erreur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importResult.errors.map((err: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{err.email}</TableCell>
                          <TableCell>{err.error}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            <Button variant="outline" onClick={() => setImportResult(null)}>
              {t?.backToForm || "Retour au formulaire"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <IntelligentCsvInput 
              onProcess={handleCsvProcess}
              placeholder={t?.description || "Importez des contacts à partir d'un fichier CSV ou Excel"}
            />
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {headers.length > 0 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">
                      {t?.fieldMappingTitle || "Correspondance des champs"}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {targetFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={`field-${field.key}`} className="flex items-center gap-2">
                          {field.label} {field.key === 'email' && <Badge variant="outline">Requis</Badge>}
                        </Label>
                        <Select
                          value={fieldMapping[field.key] || ''}
                          onValueChange={(value) => handleFieldMappingChange(field.key, value)}
                        >
                          <SelectTrigger id={`field-${field.key}`} className="w-full">
                            <SelectValue placeholder={t?.selectField || "Sélectionner..."} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">-- {t?.selectField || "Sélectionner..."} --</SelectItem>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
                
                {preview.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileCsv className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">
                        {t?.previewTitle || "Aperçu des données"}
                      </h3>
                    </div>
                    
                    <div className="border rounded-md overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHead key={header}>
                                {header}
                                {Object.entries(fieldMapping).map(([key, value]) => 
                                  value === header ? (
                                    <Badge key={key} variant="outline" className="ml-1">
                                      {targetFields.find(f => f.key === key)?.label}
                                    </Badge>
                                  ) : null
                                )}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preview.map((row, idx) => (
                            <TableRow key={idx}>
                              {headers.map((header) => (
                                <TableCell key={`${idx}-${header}`}>
                                  {row[header] || ''}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleImport}
                  disabled={isLoading || !fieldMapping.email}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />                    {t?.importing || "Import en cours..."}
                  </>
                ) : (
                  t?.importButton || "Importer"
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
