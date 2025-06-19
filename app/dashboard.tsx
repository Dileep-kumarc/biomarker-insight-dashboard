"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from "framer-motion";
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MobileResponsiveHeader } from '@/components/mobile-responsive-header'
import { BiomarkerSummaryCard } from '@/components/biomarker-summary-card'
import { MultiSeriesChart } from '@/components/multi-series-chart'
import { HealthInsights } from '@/components/health-insights'
import { ActionPlan } from '@/components/action-plan'
import { ClinicalInterpretationGuide } from '@/components/clinical-interpretation-guide'
import { UploadReport } from '@/components/upload-report'
import { getDynamicBiomarkerGroups } from '@/utils/biomarker-utils'
import { realBiomarkerData as initialBiomarkerData, realPatientInfo as initialPatientInfo } from '@/data/real-patient-data'
import type { BiomarkerData, PatientInfo } from '@/types/biomarker'

// Add type for biomarker group data
interface BiomarkerGroupData {
  title: string
  biomarkers: Array<{
    name: string
    data: Array<{
      date: string
      value: number
      status: string
    }>
    color: string
    referenceRange: {
      min: number
      max: number
      optimal?: number
    }
    unit: string
  }>
}

interface BiomarkerGroups {
  [key: string]: BiomarkerGroupData
}

// Create a specific motion heading component
// Remove unused motion component declaration

type BiomarkerGroup = "Lipid Profile" | "Metabolic Panel" | "Vitamins"

export default function EcoTownHealthDashboard() {
  const [selectedBiomarker, setSelectedBiomarker] = useState("Total Cholesterol")
  const [dateRange, setDateRange] = useState("all-time")
  const [showUpload, setShowUpload] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<BiomarkerGroup>("Lipid Profile")
  const [uploadedBiomarkerData, setUploadedBiomarkerData] = useState<any>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(initialPatientInfo)
  const [biomarkerData, setBiomarkerData] = useState<Record<string, BiomarkerData>>(initialBiomarkerData)

  // Memoize derived values
  const biomarkerKeys = useMemo(() => Object.keys(biomarkerData), [biomarkerData])
  const biomarkerGroups = useMemo(() => getDynamicBiomarkerGroups(biomarkerData), [biomarkerData])

  // Memoize handlers
  const handleDateRangeChange = useCallback((value: string) => {
    setDateRange(value)
  }, [])

  const handleUploadClick = useCallback(() => {
    setShowUpload(prev => !prev)
  }, [])

  const handleExportClick = useCallback(() => {
    // Export functionality implementation
  }, [])

  const handleGroupChange = useCallback((value: string) => {
    setSelectedGroup(value as BiomarkerGroup)
  }, [])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = biomarkerKeys.length
    const normal = biomarkerKeys.filter(
      (key) => biomarkerData[key].currentValue.status === "Normal"
    ).length
    const outOfRange = biomarkerKeys.filter(
      (key) =>
        biomarkerData[key].currentValue.status === "Low" ||
        biomarkerData[key].currentValue.status === "High" ||
        biomarkerData[key].currentValue.status === "Critical"
    ).length
    const improving = biomarkerKeys.filter((key) => {
      const history = biomarkerData[key].history
      if (history.length < 2) return false
      const latest = history[history.length - 1].value
      const previous = history[history.length - 2].value

      if (
        key === "HDL Cholesterol" ||
        key === "Vitamin D" ||
        key === "Hemoglobin" ||
        key === "Vitamin B12"
      ) {
        return latest > previous
      } else if (
        key === "Total Cholesterol" ||
        key === "LDL Cholesterol" ||
        key === "Triglycerides" ||
        key === "Creatinine" ||
        key === "HbA1c"
      ) {
        return latest < previous
      }
      return false
    }).length

    return { total, normal, outOfRange, improving }
  }, [biomarkerData, biomarkerKeys])

  // Memoize handler functions
  const handleUpload = React.useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch('https://passionate-eagerness-production-3c4a.up.railway.app/extract', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred' }))
        throw new Error(`Upload failed with status ${response.status}: ${errorData.detail}`)
      }

      const extractedData = await response.json()
      handlePDFDataExtracted(extractedData)
    } catch (error) {
      console.error("Error during file upload:", error)
      if (error instanceof Error) {
        setUploadError(error.message)
      } else {
        setUploadError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handlePDFDataExtracted = React.useCallback((extractedData: any) => {
    setPatientInfo(prev => ({ ...prev, ...extractedData.patientInfo }))
    
    setBiomarkerData(prev => {
      const newBiomarkerData = { ...prev }
      Object.keys(extractedData.biomarkers).forEach((biomarkerName) => {
        if (newBiomarkerData[biomarkerName]) {
          const newData = extractedData.biomarkers[biomarkerName]
          const currentDate = extractedData.patientInfo.reportDate
          
          // Create new history entry
          const newHistoryEntry = {
            value: Number.parseFloat(newData.value.toString()),
            unit: newData.unit,
            status: newData.status,
            trend: "stable",
            date: currentDate,
            referenceRange: newData.referenceRange,
          }

          // Update biomarker data
          newBiomarkerData[biomarkerName] = {
            ...newBiomarkerData[biomarkerName],
            currentValue: newHistoryEntry,
            history: [...newBiomarkerData[biomarkerName].history, newHistoryEntry],
          }
        }
      })
      return newBiomarkerData
    })
  }, [])

  const handleExportReport = () => {
    const reportData = {
      patient: patientInfo,
      biomarkers: biomarkerData,
      summary: summaryStats,
      reportMetadata: {
        sourceReports: ["MR. MANJUNATH SWAMY Health Report", "Date: 16-06-2025"],
        generatedAt: new Date().toISOString(),
        clinicalSummary: {
          riskFactors: biomarkerKeys.filter(
            (key) =>
              biomarkerData[key].currentValue.status === "High" ||
              biomarkerData[key].currentValue.status === "Low",
          ),
          improvements: biomarkerKeys.filter((key) => {
            const history = biomarkerData[key].history
            return history.length >= 2 && history[history.length - 1].value !== history[history.length - 2].value
          }),
        },
      },
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `ecotown-health-${patientInfo.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link) // Required for Firefox
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Render functions
  const renderBiomarkerChart = useCallback((group: BiomarkerGroup) => {
    const groupData = biomarkerGroups[group]
    if (!groupData) return null

    return (
      <motion.div 
        className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Trend Analysis</h2>
        <MultiSeriesChart
          title={groupData.title}
          biomarkers={groupData.biomarkers}
          height={400}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </motion.div>
    )
  }, [biomarkerGroups, dateRange, handleDateRangeChange])

  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Mobile Responsive Header */}
      <MobileResponsiveHeader
        patientInfo={patientInfo}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onUploadClick={handleUploadClick}
        onExportClick={handleExportClick}
        summaryStats={summaryStats}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {isClient && showUpload && (
          <motion.div 
            className="mb-4 sm:mb-6 glass-card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <UploadReport 
              onUpload={handleUpload} 
              isUploading={isUploading}
              uploadError={uploadError}
            />
          </motion.div>
        )}

        {/* Last Extracted Data Summary */}
        {uploadedBiomarkerData && (
          <motion.div 
            className="mb-4 sm:mb-6 p-3 sm:p-4 glass-card rounded-xl border border-green-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Last Uploaded Report</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Processed on {new Date(uploadedBiomarkerData.timestamp).toLocaleString()}
                </p>
              </div>
              <Badge variant="outline" className="text-xs self-start sm:self-center">
                {Object.keys(uploadedBiomarkerData.biomarkers).length} biomarkers extracted
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column - Biomarker Groups */}
          <div className="lg:col-span-8 space-y-8 sm:space-y-10">
            <motion.div 
              className="glass-card rounded-xl border border-gray-100 shadow-xl p-3 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="inline-block"
                >
                  Biomarker Overview
                </motion.div>
              </h2>
              <Tabs value={selectedGroup} onValueChange={handleGroupChange} className="w-full">
                <TabsList className="w-full justify-start mb-4 bg-gray-100/50 p-1 overflow-x-auto flex-nowrap">
                  {Object.keys(biomarkerGroups).map((group) => (
                    <TabsTrigger
                      key={group}
                      value={group}
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
                    >
                      {group}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(biomarkerGroups).map(([group, data]) => (
                  <TabsContent key={`tab-${group}`} value={group} className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {data.biomarkers.map((biomarker) => (
                        <motion.div
                          key={`biomarker-${biomarker.name}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <BiomarkerSummaryCard
                            biomarker={biomarkerData[biomarker.name]}
                            onClick={() => setSelectedBiomarker(biomarker.name)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>

            {/* Charts Section */}
            <motion.div
              className="glass-card rounded-xl border border-gray-100 shadow-xl p-3 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block"
                >
                  Trend Analysis
                </motion.div>
              </h2>
              {renderBiomarkerChart(selectedGroup)}
            </motion.div>

            {/* Clinical Interpretation Guide - now centered below the chart */}
            <motion.div
              className="glass-card rounded-xl border border-gray-100 shadow-xl p-3 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block"
                >
                  Clinical Interpretation Guide
                </motion.div>
              </h2>
              <ClinicalInterpretationGuide />
            </motion.div>
          </div>

          {/* Right Column - Health Insights & Action Plan */}
          <div className="lg:col-span-4 space-y-8 sm:space-y-10">
            <motion.div 
              className="glass-card rounded-xl border border-gray-100 shadow-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  className="inline-block"
                >
                  Health Insights
                </motion.div>
              </h2>
              <HealthInsights patientInfo={patientInfo} biomarkerData={biomarkerData} />
            </motion.div>

            <motion.div 
              className="glass-card rounded-xl border border-gray-100 shadow-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42 }}
                  className="inline-block"
                >
                  Personalized Action Plan
                </motion.div>
              </h2>
              <ActionPlan />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}