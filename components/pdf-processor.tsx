"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Activity } from "lucide-react"
import React from "react"
import dynamic from "next/dynamic"

interface PDFProcessorProps {
  onDataExtracted: (extractedData: ExtractedData) => void
  uploadedFile?: File
}

interface ExtractedData {
  patientInfo: {
    name?: string;
    age?: number;
    dob?: string;
    sex?: string;
    reportDate?: string;
  };
  biomarkers: Record<string, {
    value: number;
    unit: string;
    status: string;
    referenceRange?: { min: number; max: number };
  }>;
}

const PdfExtractClient = dynamic(() => import("./pdf-extract-client"), { ssr: false })

export function PDFProcessor({ onDataExtracted, uploadedFile }: PDFProcessorProps) {  const [isProcessing, setIsProcessing] = useState(false)
  const handleTextExtracted = async (text: string) => {
    if (text.startsWith("[ERROR]")) {
      setIsProcessing(false);
      // Handle error case
      return;
    }
    
    try {
      // Here you would parse the text into ExtractedData format
      // This is a placeholder - implement actual parsing logic
      const parsedData: ExtractedData = {
        patientInfo: {},
        biomarkers: {}
      };
      
      setIsProcessing(false);
      onDataExtracted(parsedData);
    } catch (error) {
      setIsProcessing(false);
      console.error("Failed to parse PDF text:", error);
    }
  }

  if (!uploadedFile) {
    return (
      <Alert>
        <AlertDescription>No file selected for processing.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Process PDF Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Icons - Using verified basic icons */}
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">Extracting text from PDF...</span>
          </div>

          {isProcessing && (
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-sm text-gray-600">Processing data...</span>
            </div>
          )}

          <PdfExtractClient onExtracted={handleTextExtracted} file={uploadedFile} />
        </div>
      </CardContent>
    </Card>
  )
}
