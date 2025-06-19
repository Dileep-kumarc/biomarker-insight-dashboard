"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"
import type { BiomarkerData } from "../types/biomarker"
import { useState } from "react"

interface BiomarkerSummaryCardProps {
  biomarker: BiomarkerData
  onClick?: () => void
}

export function BiomarkerSummaryCard({ biomarker, onClick }: BiomarkerSummaryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  const { currentValue } = biomarker
  const { value, unit, status, trend } = currentValue

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high':
        return 'text-red-600'
      case 'low':
        return 'text-yellow-600'
      case 'normal':
        return 'text-green-600'
      default:
        return 'text-gray-600'
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
    if (status === "Low" && biomarker.name === "HDL Cholesterol") {
      return "Low HDL – consider lifestyle changes and omega-3 supplements"
    }
    if (status === "High" && biomarker.name === "Triglycerides") {
      return "Elevated triglycerides – reduce refined carbs, increase exercise"
    }
    if (status === "High" && biomarker.name === "Creatinine") {
      return "Slightly elevated – monitor kidney function, stay hydrated"
    }
    if (status === "Normal" && biomarker.name === "Vitamin D") {
      return "Great improvement from deficient to normal levels!"
    }
    return `${status} levels – continue current management`
  }

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <motion.div
        className="w-full h-full"
        animate={{
          scale: isPressed ? 0.98 : isHovered ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm tracking-tight">{biomarker.name}</h3>
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
          <p className="text-sm text-gray-600 line-clamp-2">{getHealthMessage()}</p>
        </CardContent>
      </motion.div>
    </Card>
  )
}
