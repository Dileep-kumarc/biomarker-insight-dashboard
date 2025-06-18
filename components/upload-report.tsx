"use client"

import React, { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, CheckCircle, AlertTriangle } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface UploadReportProps {
  onUpload: (file: File) => void
  onDataExtracted?: (data: any) => void
}

export function UploadReport({ onUpload, onDataExtracted }: UploadReportProps) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setUploadStatus("uploading")
        setUploadedFile(file)
        setError("")
        onUpload(file)
        // Send to Python FastAPI backend for extraction
        try {
          const formData = new FormData()
          formData.append("file", file)
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extract`, {
            method: "POST",
            body: formData,
          })
          if (!response.ok) throw new Error("Extraction failed")
          const data = await response.json()
          setUploadStatus("success")
          if (onDataExtracted) onDataExtracted(data) // data contains patient_info and biomarkers
        } catch (err) {
          setUploadStatus("error")
          setError("Extraction failed. Please try again.")
        }
      }
    },
    [onUpload, onDataExtracted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
  })

  return (
    <Card className="w-full">
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 mt-4 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300"}
            ${uploadStatus === "error" ? "border-red-500 bg-red-50" : ""}
            ${uploadStatus === "success" ? "border-green-500 bg-green-50" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            {uploadStatus === "idle" && (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag and drop your PDF report here, or click to select
                </p>
              </>
            )}
            {uploadStatus === "uploading" && (
              <>
                <p className="text-sm text-blue-600">Processing your report...</p>
              </>
            )}
            {uploadStatus === "success" && (
              <>
                <CheckCircle className="h-8 w-8 text-green-500" />
                <p className="text-sm text-green-600">Report processed successfully!</p>
                {uploadedFile && (
                  <p className="text-xs text-gray-500">{uploadedFile.name}</p>
                )}
              </>
            )}
            {uploadStatus === "error" && (
              <>
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <p className="text-sm text-red-600">{error || "Failed to process report"}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
