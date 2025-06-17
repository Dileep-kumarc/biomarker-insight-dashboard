"use client"

import React from 'react'
import { motion } from 'framer-motion'
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

export default function EcoTownHealthDashboard() {
  const [selectedBiomarker, setSelectedBiomarker] = React.useState("Total Cholesterol")
  const [dateRange, setDateRange] = React.useState("all-time")
  const [showUpload, setShowUpload] = React.useState(false)
  const [selectedGroup, setSelectedGroup] = React.useState("Lipid Profile")
  const [uploadedBiomarkerData, setUploadedBiomarkerData] = React.useState<any>(null)
  const [forceUpdate, setForceUpdate] = React.useState(0)

  // NEW: Use state for patient info and biomarker data with correct types
  const [patientInfo, setPatientInfo] = React.useState<PatientInfo>(initialPatientInfo)
  const [biomarkerData, setBiomarkerData] = React.useState<Record<string, BiomarkerData>>(initialBiomarkerData)

  const biomarkerKeys = Object.keys(biomarkerData)

  // Calculate dynamic summary statistics
  const [summaryStats, setSummaryStats] = React.useState({
    total: 0,
    normal: 0,
    outOfRange: 0,
    improving: 0,
  })

  const calculateSummaryStats = () => {
    const total = biomarkerKeys.length
    const normal = biomarkerKeys.filter((key) => biomarkerData[key].currentValue.status === "Normal").length
    const outOfRange = biomarkerKeys.filter(
      (key) =>
        biomarkerData[key].currentValue.status === "Low" ||
        biomarkerData[key].currentValue.status === "High" ||
        biomarkerData[key].currentValue.status === "Critical",
    ).length
    const improving = biomarkerKeys.filter((key) => {
      const history = biomarkerData[key].history
      if (history.length < 2) return false
      const latest = history[history.length - 1].value
      const previous = history[history.length - 2].value

      // Improvement logic based on biomarker type
      if (key === "HDL Cholesterol" || key === "Vitamin D" || key === "Hemoglobin" || key === "Vitamin B12") {
        return latest > previous // Higher is better
      } else if (
        key === "Total Cholesterol" ||
        key === "LDL Cholesterol" ||
        key === "Triglycerides" ||
        key === "Creatinine" ||
        key === "HbA1c"
      ) {
        return latest < previous // Lower is better
      }
      return false
    }).length

    setSummaryStats({ total, normal, outOfRange, improving })
  }

  React.useEffect(() => {
    calculateSummaryStats()
  }, [forceUpdate, biomarkerData])

  const handleUpload = async (file: File) => {
    console.log("Processing uploaded file:", file.name)
  }

  const handlePDFDataExtracted = (extractedData: any) => {
    console.log("Extracted data received:", extractedData)
    setPatientInfo({ ...extractedData.patientInfo })
    // Deep clone and update biomarker data
    const newBiomarkerData = JSON.parse(JSON.stringify(biomarkerData))
    Object.keys(extractedData.biomarkers).forEach((biomarkerName) => {
      if (newBiomarkerData[biomarkerName]) {
        const newData = extractedData.biomarkers[biomarkerName]
        const currentDate = extractedData.patientInfo.reportDate
        // Create new history entry
        const newHistoryEntry = {
          value: Number.parseFloat(newData.value.toString()),
          unit: newData.unit,
          status: newData.status as any,
          trend: "stable" as any,
          date: currentDate,
          referenceRange: newBiomarkerData[biomarkerName].currentValue.referenceRange,
        }
        // COMPLETELY REPLACE current value with extracted data
        newBiomarkerData[biomarkerName].currentValue = {
          ...newBiomarkerData[biomarkerName].currentValue,
          value: Number.parseFloat(newData.value.toString()),
          date: currentDate,
          status: newData.status as any,
        }
        // Add to history (keep last 6 entries)
        newBiomarkerData[biomarkerName].history = [
          ...newBiomarkerData[biomarkerName].history.slice(-5),
          newHistoryEntry,
        ]
      }
    })
    setBiomarkerData(newBiomarkerData)
    setUploadedBiomarkerData({ ...extractedData, timestamp: Date.now() })
    setForceUpdate((prev) => prev + 1)
    calculateSummaryStats()
    setTimeout(() => {
      setShowUpload(false)
    }, 3000)
  }

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
    link.click()
    URL.revokeObjectURL(url)
  }

  // Type the biomarker groups
  const biomarkerGroups: BiomarkerGroups = getDynamicBiomarkerGroups(biomarkerData)

  // Function to render chart for current group
  const renderBiomarkerChart = (group: string) => {
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
        />
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen font-sans">
      {/* Mobile Responsive Header */}
      <MobileResponsiveHeader
        patientInfo={patientInfo}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onUploadClick={() => setShowUpload(!showUpload)}
        onExportClick={handleExportReport}
        summaryStats={summaryStats}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Upload Section */}
        {showUpload && (
          <motion.div 
            className="mb-4 sm:mb-6 glass-card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <UploadReport onUpload={handleUpload} onDataExtracted={handlePDFDataExtracted} />
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
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4"
              >
                Biomarker Overview
              </motion.h2>
              <Tabs value={selectedGroup} onValueChange={setSelectedGroup} className="w-full">
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
                  <TabsContent key={group} value={group} className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {data.biomarkers.map((biomarker) => (
                        <motion.div
                          key={biomarker.name}
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
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4"
              >
                Trend Analysis
              </motion.h2>
              {renderBiomarkerChart(selectedGroup)}
            </motion.div>

            {/* Clinical Interpretation Guide - now centered below the chart */}
            <motion.div
              className="glass-card rounded-xl border border-gray-100 shadow-xl p-3 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4"
              >
                Clinical Interpretation Guide
              </motion.h2>
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
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4"
              >
                Health Insights
              </motion.h2>
              <HealthInsights patientInfo={patientInfo} biomarkerData={biomarkerData} />
            </motion.div>

            <motion.div 
              className="glass-card rounded-xl border border-gray-100 shadow-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-4"
              >
                Personalized Action Plan
              </motion.h2>
              <ActionPlan />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 