import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Heart, Activity, Brain, Shield, AlertTriangle } from "lucide-react"
import type { BiomarkerData } from "../types/biomarker"

interface HealthInsightsProps {
  patientInfo: {
    name: string
    age: number
    gender: string
    id: string
    lastUpdated: string
  }
  biomarkerData: {
    [key: string]: BiomarkerData
  }
}

export function HealthInsights({ patientInfo, biomarkerData }: HealthInsightsProps) {
  const insights = [
    {
      type: "critical",
      icon: AlertTriangle,
      title: "Prediabetes Alert",
      message:
        "HbA1c at 5.8% indicates prediabetes. Immediate lifestyle changes needed to prevent Type 2 diabetes progression.",
      priority: "critical",
      color: "bg-red-50 border-red-200 text-red-800",
    },
    {
      type: "warning",
      icon: Heart,
      title: "Cardiovascular Risk Factors",
      message: "Low HDL (39 mg/dL) and elevated triglycerides (174 mg/dL) significantly increase heart disease risk.",
      priority: "high",
      color: "bg-orange-50 border-orange-200 text-orange-800",
    },
    {
      type: "improvement",
      icon: TrendingUp,
      title: "Vitamin D Recovery Success",
      message:
        "Excellent progress! Vitamin D improved from deficient (18.7 ng/mL) to normal (39.3 ng/mL) with supplementation.",
      priority: "high",
      color: "bg-green-50 border-green-200 text-green-800",
    },
    {
      type: "monitoring",
      icon: Activity,
      title: "Kidney Function Monitoring",
      message: "Creatinine slightly elevated (1.19 mg/dL). Continue monitoring kidney function and maintain hydration.",
      priority: "medium",
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    },
    {
      type: "success",
      icon: Shield,
      title: "Cholesterol Management Success",
      message: "LDL cholesterol improved dramatically from 118 to 72 mg/dL - excellent cardiovascular protection.",
      priority: "low",
      color: "bg-blue-50 border-blue-200 text-blue-800",
    },
  ]

  const getHealthScore = () => {
    const normalCount = Object.values(biomarkerData).filter((b) => b.currentValue.status === "Normal").length
    const totalCount = Object.values(biomarkerData).length
    return Math.round((normalCount / totalCount) * 100)
  }

  const getRiskFactors = () => {
    const risks = []
    if (biomarkerData["HDL Cholesterol"]?.currentValue.status === "Low") {
      risks.push("Low HDL Cholesterol")
    }
    if (biomarkerData["Triglycerides"]?.currentValue.status === "High") {
      risks.push("Elevated Triglycerides")
    }
    if (biomarkerData["Creatinine"]?.currentValue.status === "High") {
      risks.push("Kidney Function")
    }
    if (biomarkerData["HbA1c"]?.currentValue.status === "High") {
      risks.push("Prediabetes")
    }
    if (biomarkerData["RBC Count"]?.currentValue.status === "High") {
      risks.push("Elevated RBC Count")
    }
    return risks
  }

  const healthScore = getHealthScore()
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-600"
    if (score >= 60) return "text-yellow-600 bg-yellow-600"
    return "text-red-600 bg-red-600"
  }

  return (
    <div className="space-y-6">
      {/* AI Health Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span>AI Health Score - {patientInfo?.name || ""}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`text-4xl font-bold ${getScoreColor(healthScore).split(" ")[0]}`}
              >
                {healthScore}%
              </motion.div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${healthScore}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                    className={`h-3 rounded-full ${getScoreColor(healthScore).split(" ")[1]}`}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on {Object.keys(biomarkerData).length} biomarkers from real patient reports
                </p>
                <p className="text-xs text-gray-500 mt-1">Source: Reports 1726238851863, AD231201100076582949</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Critical Risk Factors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Priority Risk Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getRiskFactors().map((risk, index) => (
                <motion.div
                  key={`risk-${risk.replace(/\s+/g, '-').toLowerCase()}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Badge variant="destructive" className="text-xs">
                    {risk}
                  </Badge>
                </motion.div>
              ))}
              {getRiskFactors().length === 0 && (
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  No major risk factors identified
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personalized Health Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Health Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon
              return (
                <div key={`insight-${insight.title}-${index}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Alert className={insight.color}>
                      <IconComponent className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">{insight.title}</div>
                        <div className="text-sm">{insight.message}</div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          Priority: {insight.priority}
                        </Badge>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Trend Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Biomarker Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-green-800">Improving Trends</p>
                  <p className="text-sm text-green-600">Vitamin D, LDL Cholesterol, Total Cholesterol</p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-red-800">Concerning Trends</p>
                  <p className="text-sm text-red-600">HbA1c, HDL Cholesterol, Triglycerides</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
