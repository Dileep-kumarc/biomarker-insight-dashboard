"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import React from "react"
import dynamic from "next/dynamic"

interface PDFProcessorProps {
  onDataExtracted: (extractedData: any) => void
  uploadedFile?: File
}

const PdfExtractClient = dynamic(() => import("./pdf-extract-client"), { ssr: false })

export function PDFProcessor({ onDataExtracted, uploadedFile }: PDFProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [ocrText, setOcrText] = useState<string>("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingExtract, setPendingExtract] = useState(false)

  React.useEffect(() => {
    if (uploadedFile && !extractedData && !isProcessing && !pendingExtract) {
      if (uploadedFile.type === "application/pdf" || uploadedFile.name.toLowerCase().endsWith(".pdf")) {
        setPendingFile(uploadedFile)
        setPendingExtract(true)
        setIsProcessing(true)
      } else {
        // Fallback: Simulate OCR for non-PDFs
        (async () => {
          setIsProcessing(true)
          const simulatedOCRText = await simulateOCRExtraction(uploadedFile)
          setOcrText(simulatedOCRText)
          const extractedValues = extractBiomarkersFromText(simulatedOCRText, uploadedFile.name)
          setExtractedData(extractedValues)
          setIsProcessing(false)
          onDataExtracted(extractedValues)
        })()
      }
    }
  }, [uploadedFile, extractedData, isProcessing, pendingExtract])

  // Handler for extracted text from PdfExtractClient
  const handleExtractedText = (text: string) => {
    setOcrText(text)
    if (text) {
      const extractedValues = extractBiomarkersFromText(text, pendingFile?.name || "")
      setExtractedData(extractedValues)
      setIsProcessing(false)
      onDataExtracted(extractedValues)
    } else {
      setIsProcessing(false)
    }
    setPendingExtract(false)
    setPendingFile(null)
  }

  const simulateOCRExtraction = async (file: File): Promise<string> => {
    // Simulate different OCR results based on file characteristics
    const fileName = file.name.toLowerCase()
    const fileSize = file.size

    // Create different "OCR" text based on file properties
    const templates = [
      `
HEALTH REPORT - PATIENT: ${generatePatientName(fileName)}
AGE: ${generateAge(fileSize)} YEARS
GENDER: ${generateGender(fileName)}
DATE: ${new Date().toLocaleDateString()}

COMPLETE BLOOD COUNT:
Hemoglobin: ${(12 + Math.random() * 6).toFixed(1)} g/dL
RBC Count: ${(4.0 + Math.random() * 2).toFixed(2)} million/cmm
WBC Count: ${(5 + Math.random() * 6).toFixed(1)} thousand/cmm

LIPID PROFILE:
Total Cholesterol: ${Math.floor(150 + Math.random() * 100)} mg/dL
HDL Cholesterol: ${Math.floor(30 + Math.random() * 40)} mg/dL
LDL Cholesterol: ${Math.floor(70 + Math.random() * 80)} mg/dL
Triglycerides: ${Math.floor(100 + Math.random() * 150)} mg/dL

KIDNEY FUNCTION:
Creatinine: ${(0.8 + Math.random() * 0.8).toFixed(2)} mg/dL

VITAMINS:
Vitamin D: ${(15 + Math.random() * 50).toFixed(1)} ng/mL
Vitamin B12: ${Math.floor(200 + Math.random() * 600)} pg/mL

DIABETES MARKERS:
HbA1c: ${(4.5 + Math.random() * 3).toFixed(1)} %
      `,
      `
LABORATORY RESULTS FOR: ${generatePatientName(fileName)}
PATIENT AGE: ${generateAge(fileSize)}
SEX: ${generateGender(fileName)}
REPORT DATE: ${new Date().toLocaleDateString()}

HEMATOLOGY:
- Hemoglobin Level: ${(11 + Math.random() * 7).toFixed(1)} g/dL (Normal: 12-16)
- Red Blood Cell Count: ${(3.8 + Math.random() * 2.5).toFixed(2)} million/cmm
- White Blood Cell Count: ${(4 + Math.random() * 8).toFixed(1)} thousand/cmm

CHEMISTRY PANEL:
- Total Cholesterol: ${Math.floor(140 + Math.random() * 120)} mg/dL
- HDL-C: ${Math.floor(25 + Math.random() * 50)} mg/dL
- LDL-C: ${Math.floor(60 + Math.random() * 100)} mg/dL
- Triglycerides: ${Math.floor(80 + Math.random() * 200)} mg/dL
- Serum Creatinine: ${(0.6 + Math.random() * 1.0).toFixed(2)} mg/dL

NUTRITIONAL STATUS:
- 25-OH Vitamin D: ${(10 + Math.random() * 60).toFixed(1)} ng/mL
- Vitamin B12: ${Math.floor(150 + Math.random() * 700)} pg/mL

GLYCEMIC CONTROL:
- Hemoglobin A1c: ${(4.8 + Math.random() * 2.5).toFixed(1)}%
      `,
    ]

    // Select template based on file characteristics
    const templateIndex = Math.abs(fileName.charCodeAt(0) + fileSize) % templates.length
    return templates[templateIndex]
  }

  const generatePatientName = (fileName: string): string => {
    const names = [
      "RAJESH KUMAR",
      "PRIYA SHARMA",
      "AMIT PATEL",
      "SUNITA SINGH",
      "VIKRAM GUPTA",
      "MEERA REDDY",
      "ARJUN NAIR",
      "KAVYA IYER",
      "ROHIT AGARWAL",
      "DEEPIKA JOSHI",
      "SANJAY VERMA",
      "ANITA CHOPRA",
    ]
    const index = Math.abs(fileName.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) % names.length
    return names[index]
  }

  const generateAge = (fileSize: number): number => {
    return 25 + (fileSize % 45) // Age between 25-70
  }

  const generateGender = (fileName: string): string => {
    return fileName.length % 2 === 0 ? "MALE" : "FEMALE"
  }

  const extractBiomarkersFromText = (text: string, fileName: string) => {
    // Improved regex for the provided sample text
    // Extract patient info
    const nameMatch = text.match(/Name:\s*([A-Z.\s]+)/i)
    const name = nameMatch ? nameMatch[1].trim() : ""
    const ageGenderMatch = text.match(/Age\/Gender:\s*(\d+)Y\/?([MF])?/i)
    const age = ageGenderMatch ? ageGenderMatch[1] : ""
    const gender = ageGenderMatch ? (ageGenderMatch[2] === "M" ? "MALE" : ageGenderMatch[2] === "F" ? "FEMALE" : "") : ""
    const dateMatch = text.match(/Date:\s*([\d-]+)/i)
    const reportDate = dateMatch ? dateMatch[1] : ""

    // Extract biomarker values by matching value lines
    const getValue = (label: string, unit: string) => {
      const regex = new RegExp(label + "\\s*([\d.]+)\\s*" + unit, "i")
      const match = text.match(regex)
      return match ? match[1] : null
    }
    const biomarkers = {
      "Total Cholesterol": {
        value: getValue("Total Cholesterol", "mg/dL") || "",
        unit: "mg/dL",
        status: "Normal",
        referenceRange: "125-200 mg/dL",
      },
      Triglycerides: {
        value: getValue("Triglycerides", "mg/dL") || "",
        unit: "mg/dL",
        status: "Normal",
        referenceRange: "30-150 mg/dL",
      },
      "HDL Cholesterol": {
        value: getValue("HDL", "mg/dL") || "",
        unit: "mg/dL",
        status: "Normal",
        referenceRange: "40-60 mg/dL",
      },
      "LDL Cholesterol": {
        value: getValue("LDL", "mg/dL") || "",
        unit: "mg/dL",
        status: "Normal",
        referenceRange: "0-130 mg/dL",
      },
      "Vitamin D": {
        value: getValue("Vitamin D", "ng/mL") || "",
        unit: "ng/mL",
        status: "Normal",
        referenceRange: "20-50 ng/mL",
      },
      "Vitamin B12": {
        value: getValue("Vitamin B12", "pg/mL") || "",
        unit: "pg/mL",
        status: "Normal",
        referenceRange: "211-946 pg/mL",
      },
      Creatinine: {
        value: getValue("Creatinine", "mg/dL") || "",
        unit: "mg/dL",
        status: "Normal",
        referenceRange: "0.6-1.3 mg/dL",
      },
      HbA1c: {
        value: getValue("HbA1c", "%") || "",
        unit: "%",
        status: "Normal",
        referenceRange: "< 5.7%",
      },
    }
    // Determine status based on values (reuse existing logic if present)
    Object.keys(biomarkers).forEach((key) => {
      const biomarker = biomarkers[key as keyof typeof biomarkers]
      if (biomarker.value) {
        biomarker.status = determineBiomarkerStatus(key, parseFloat(biomarker.value))
      }
    })
    return {
      patientInfo: {
        name,
        age: age ? parseInt(age) : "",
        gender,
        reportDate,
        reportId: `RPT${Date.now().toString().slice(-6)}`,
      },
      biomarkers,
      ocrText: text,
    }
  }

  const determineBiomarkerStatus = (biomarkerName: string, value: number): string => {
    const ranges: Record<string, { low?: number; high: number }> = {
      Hemoglobin: { low: 12, high: 16 },
      "RBC Count": { low: 4.5, high: 5.5 },
      "WBC Count": { low: 4, high: 11 },
      "Total Cholesterol": { high: 200 },
      "HDL Cholesterol": { low: 40, high: 100 },
      "LDL Cholesterol": { high: 100 },
      Triglycerides: { high: 150 },
      Creatinine: { low: 0.7, high: 1.3 },
      "Vitamin D": { low: 30, high: 100 },
      "Vitamin B12": { low: 200, high: 900 },
      HbA1c: { high: 5.7 },
    }

    const range = ranges[biomarkerName]
    if (!range) return "Normal"

    if (range.low && value < range.low) return "Low"
    if (value > range.high) return "High"
    return "Normal"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>Real PDF OCR Extraction</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isProcessing && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              <div className="font-medium">Reading PDF content with OCR...</div>
              <div className="text-sm mt-1">
                Extracting text and identifying biomarker values from: {uploadedFile?.name}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Dynamically load PdfExtractClient for PDF extraction on client only */}
        {pendingFile && pendingExtract && (
          <PdfExtractClient file={pendingFile} onExtracted={handleExtractedText} />
        )}

        {extractedData && !isProcessing && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="font-medium text-green-800">✅ PDF Successfully Processed!</div>
                <div className="text-sm text-green-700 mt-1">
                  Extracted {Object.keys(extractedData.biomarkers).length} biomarker values from uploaded PDF:{" "}
                  {uploadedFile?.name}
                </div>
              </AlertDescription>
            </Alert>

            {/* Show OCR Text Preview */}
            {ocrText && (
              <div className="bg-gray-100 rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-900 mb-2">📄 OCR Text Preview:</h4>
                <div className="text-xs font-mono bg-white p-3 rounded border max-h-32 overflow-y-auto">
                  {ocrText.substring(0, 500)}...
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">👤 Extracted Patient Information:</h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Name:</strong> {extractedData.patientInfo.name}
                </p>
                <p>
                  <strong>Age:</strong> {extractedData.patientInfo.age} years
                </p>
                <p>
                  <strong>Gender:</strong> {extractedData.patientInfo.gender}
                </p>
                <p>
                  <strong>Report Date:</strong> {extractedData.patientInfo.reportDate}
                </p>
                <p>
                  <strong>Source File:</strong> {uploadedFile?.name}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">🧪 Extracted Biomarker Values:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {Object.entries(extractedData.biomarkers).map(([name, data]: [string, any]) => (
                  <div key={name} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="font-medium">{name}:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        data.status === "Normal"
                          ? "bg-green-100 text-green-800"
                          : data.status === "Low"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {data.value} {data.unit} ({data.status})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="font-medium text-orange-800">📋 Real OCR Implementation Note:</div>
                <div className="text-sm text-orange-700 mt-1">
                  This demo simulates OCR extraction. For production, integrate with libraries like:
                  <br />• <strong>Tesseract.js</strong> for image-based OCR
                  <br />• <strong>PDF.js</strong> for text-based PDF parsing
                  <br />• <strong>Google Vision API</strong> for advanced OCR
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
