"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Upload, Calendar, Download, Menu, Heart, Activity, TrendingUp, AlertTriangle } from "lucide-react"

interface MobileResponsiveHeaderProps {
  patientInfo: {
    name: string
    age: number
    gender: string
    id: string
    lastUpdated: string
  }
  dateRange: string
  onDateRangeChange: (value: string) => void
  onUploadClick: () => void
  onExportClick: () => void
  summaryStats: {
    total: number
    normal: number
    outOfRange: number
    improving: number
  }
  isClient: boolean;
}

export function MobileResponsiveHeader({
  patientInfo,
  dateRange,
  onDateRangeChange,
  onUploadClick,
  onExportClick,
  summaryStats,
  isClient,
}: MobileResponsiveHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleDateRangeChange = useCallback((value: string) => {
    onDateRangeChange(value)
  }, [onDateRangeChange])

  if (!isClient) {
    return (
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[88px]">
          {/* Placeholder for header */}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-green-500 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-br from-blue-600 to-green-500 bg-clip-text text-transparent">
                EcoTown Health
              </h1>
              <p className="text-sm text-gray-600 font-medium">{patientInfo.name}</p>
            </div>
          </div>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="hover:bg-gray-50">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-xl">
              {isMenuOpen && (
                <motion.div 
                  key="mobile-menu"
                  className="space-y-6 mt-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Patient Information</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">
                        {patientInfo.name}, {patientInfo.age}Y/{patientInfo.gender}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs font-medium">
                          ID: {patientInfo.id}
                        </Badge>
                        <Badge variant="secondary" className="text-xs font-medium">
                          Updated: {new Date(patientInfo.lastUpdated).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Select 
                      defaultValue={dateRange} 
                      onValueChange={handleDateRangeChange}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-time">All Time</SelectItem>
                        <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                        <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      variant="outline" 
                      onClick={onUploadClick} 
                      className="w-full bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Report
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={onExportClick} 
                      className="w-full bg-white hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>

                  {/* Mobile Summary Stats */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Health Overview</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div key="normal-stats" animate={{ scale: 1 }}>
                        <Card className="bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-emerald-100 text-sm font-medium">In Range</p>
                                <p className="text-2xl font-bold">{summaryStats.normal}</p>
                              </div>
                              <Activity className="h-6 w-6 text-emerald-200" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div key="out-of-range-stats" animate={{ scale: 1 }}>
                        <Card className="bg-gradient-to-br from-amber-500 to-red-500 text-white shadow-lg shadow-amber-500/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-amber-100 text-sm font-medium">Out of Range</p>
                                <p className="text-2xl font-bold">{summaryStats.outOfRange}</p>
                              </div>
                              <AlertTriangle className="h-6 w-6 text-amber-200" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div key="improving-stats" animate={{ scale: 1 }}>
                        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-blue-100 text-sm font-medium">Improving</p>
                                <p className="text-2xl font-bold">{summaryStats.improving}</p>
                              </div>
                              <TrendingUp className="h-6 w-6 text-blue-200" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div key="total-stats" animate={{ scale: 1 }}>
                        <Card className="bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-violet-100 text-sm font-medium">Total Tests</p>
                                <p className="text-2xl font-bold">{summaryStats.total}</p>
                              </div>
                              <Activity className="h-6 w-6 text-violet-200" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex lg:items-center lg:justify-between">
          <div className="flex items-center space-x-5">
            <div className="bg-gradient-to-br from-blue-600 to-green-500 text-white p-3.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Heart className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-green-500 bg-clip-text text-transparent">
                EcoTown Health Dashboard
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-lg text-gray-600 font-medium">
                  {patientInfo.name}, {patientInfo.age}Y/{patientInfo.gender}
                </p>
                <Badge variant="outline" className="text-xs font-medium">
                  ID: {patientInfo.id}
                </Badge>
                <Badge variant="secondary" className="text-xs font-medium">
                  Last Updated: {new Date(patientInfo.lastUpdated).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="w-48 bg-white">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={onUploadClick}
              className="bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Report
            </Button>
            <Button 
              variant="outline" 
              onClick={onExportClick}
              className="bg-white hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
