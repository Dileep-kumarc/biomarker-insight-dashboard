"use client"

import React, { useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, AlertTriangle, Activity } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface UploadReportProps {
  onUpload: (file: File) => void
  isUploading: boolean
  uploadError: string | null
}

export function UploadReport({ onUpload, isUploading, uploadError }: UploadReportProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0])
      }
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isUploading,
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
            ${uploadError ? "border-red-500 bg-red-50" : ""}
            ${isUploading ? "cursor-not-allowed bg-gray-50" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <>
                <Activity className="h-8 w-8 text-gray-400 animate-spin" />
                <p className="text-sm text-blue-600">Processing your report...</p>
              </>
            ) : uploadError ? (
              <>
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <p className="text-sm text-red-600">{uploadError}</p>
                <p className="text-xs text-gray-500 mt-2">Please try uploading the file again.</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag and drop your PDF report here, or click to select
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
