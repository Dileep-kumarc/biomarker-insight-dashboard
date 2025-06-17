"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"
import type { BiomarkerData } from "../types/biomarker"

interface BiomarkerSummaryCardProps {
  biomarker: BiomarkerData
  onClick: () => void
}

export function BiomarkerSummaryCard({ biomarker, onClick }: BiomarkerSummaryCardProps) {
  const { name, currentValue } = biomarker
  const { value, unit, status, trend } = currentValue

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20"
      case "Low":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20"
      case "High":
        return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20"
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200 ring-red-500/20"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/20"
    }
  }

  const getStatusBorder = (status: string) => {
    switch (status) {
      case "Normal":
        return "border-l-emerald-500"
      case "Low":
        return "border-l-blue-500"
      case "High":
        return "border-l-amber-500"
      case "Critical":
        return "border-l-red-500"
      default:
        return "border-l-gray-500"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-amber-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getHealthMessage = () => {
    if (status === "Low" && name === "HDL Cholesterol") {
      return "Low HDL – consider lifestyle changes and omega-3 supplements"
    }
    if (status === "High" && name === "Triglycerides") {
      return "Elevated triglycerides – reduce refined carbs, increase exercise"
    }
    if (status === "High" && name === "Creatinine") {
      return "Slightly elevated – monitor kidney function, stay hydrated"
    }
    if (status === "Normal" && name === "Vitamin D") {
      return "Great improvement from deficient to normal levels!"
    }
    return `${status} levels – continue current management`
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Card
        className={`group cursor-pointer bg-white/60 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 
        border-l-4 ${getStatusBorder(status)} shadow-sm hover:shadow-lg hover:ring-2 ring-offset-2 ring-offset-white ${getStatusColor(status)}`}
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm tracking-tight">{name}</h3>
            <div className="flex items-center space-x-2">
              {status === "Critical" && (
                <motion.div
                  initial={{ opacity: 0.5, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                >
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </motion.div>
              )}
              {getTrendIcon(trend)}
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {value}
            </span>
            <span className="text-sm text-gray-500 font-medium">{unit}</span>
          </div>
          <Badge 
            className={`mb-3 text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300 
            group-hover:ring-2 ${getStatusColor(status)}`}
          >
            {status}
          </Badge>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">{getHealthMessage()}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
