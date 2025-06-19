"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Brush,
  Legend,
  ReferenceArea,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
// Removing unused import: import { ChartTooltip } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color?: string;
    payload?: {
      [key: string]: string | number;
    };
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white p-2 border rounded shadow">
      <p className="text-sm font-semibold">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

interface MultiSeriesChartProps {
  title: string
  biomarkers: Array<{
    name: string
    data: Array<{
      date: string
      value: number
      status: string
    }>
    color: string
    referenceRange: { min: number; max: number; optimal?: number }
    unit: string
  }>
  height?: number
  dateRange: [Date, Date]
}

export function MultiSeriesChart({
  title,
  biomarkers,
  height = 400,
}: MultiSeriesChartProps) {
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [chartHeight, setChartHeight] = useState(height)
  const [zoomDomain, setZoomDomain] = useState<{ startIndex?: number; endIndex?: number }>({})

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
      setChartHeight(isMobileView ? 300 : height)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [height])

  // Process data for chart
  const combinedData = useMemo(() => {
    if (!biomarkers[0]?.data) return []
    
    return biomarkers[0].data.map((_, index) => {
      const dataPoint: Record<string, string | number> = {
        date: biomarkers[0].data[index].date,
        formattedDate: new Date(biomarkers[0].data[index].date).toLocaleDateString("en-US", {
          year: "numeric",
          month: isMobile ? "short" : "long",
          day: "numeric",
        }),
      }

      biomarkers.forEach((biomarker) => {
        if (biomarker.data[index]) {
          dataPoint[biomarker.name] = biomarker.data[index].value
          dataPoint[`${biomarker.name}_status`] = biomarker.data[index].status
        }
      })

      return dataPoint
    })
  }, [biomarkers, isMobile])

  // Calculate Y-axis domain
  const yDomain = useMemo(() => {
    const allValues = biomarkers.reduce((acc, biomarker) => {
      if (selectedBiomarker === biomarker.name) {
        const dataValues = biomarker.data.map(d => d.value);
        if (biomarker.referenceRange) {
          const rangeValues = [biomarker.referenceRange.min, biomarker.referenceRange.max];
          if (biomarker.referenceRange.optimal) {
            rangeValues.push(biomarker.referenceRange.optimal);
          }
          return acc.concat(dataValues, rangeValues);
        }
        return acc.concat(dataValues);
      }
      return acc;
    }, [] as number[]);

    if (allValues.length === 0) {
      return [0, 100] as [number, number];
    }

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1;

    return [min - padding, max + padding] as [number, number];
  }, [biomarkers, selectedBiomarker]);

  // Zoom controls
  const handleZoomReset = useCallback(() => {
    setZoomDomain({})
    setChartHeight(height)
  }, [height])

  const handleZoomIn = useCallback(() => {
    if (combinedData.length === 0) return
    
    const currentStart = zoomDomain.startIndex ?? 0
    const currentEnd = zoomDomain.endIndex ?? combinedData.length - 1
    const currentRange = currentEnd - currentStart
    
    const newRange = Math.max(2, Math.floor(currentRange * 0.7))
    const midPoint = Math.floor((currentStart + currentEnd) / 2)
    
    const start = Math.max(0, midPoint - Math.floor(newRange / 2))
    const end = Math.min(combinedData.length - 1, start + newRange)
    
    setZoomDomain({ startIndex: start, endIndex: end })
    setChartHeight(prev => Math.max(200, prev * 0.8))
  }, [combinedData.length, zoomDomain])

  const handleZoomOut = useCallback(() => {
    if (combinedData.length === 0) return
    
    const currentStart = zoomDomain.startIndex ?? 0
    const currentEnd = zoomDomain.endIndex ?? combinedData.length - 1
    const currentRange = currentEnd - currentStart
    
    const newRange = Math.min(combinedData.length, Math.ceil(currentRange / 0.7))
    const midPoint = Math.floor((currentStart + currentEnd) / 2)
    
    const start = Math.max(0, midPoint - Math.floor(newRange / 2))
    const end = Math.min(combinedData.length - 1, start + newRange)
    
    if (end - start >= combinedData.length - 1) {
      handleZoomReset()
      return
    }
    
    setZoomDomain({ startIndex: start, endIndex: end })
    setChartHeight(prev => Math.min(height * 2, prev * 1.2))
  }, [combinedData.length, zoomDomain, handleZoomReset, height])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={combinedData.length < 2}
            >
              Zoom In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={combinedData.length < 2}
            >
              Zoom Out
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomReset}
              disabled={combinedData.length < 2}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Biomarker Toggle Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {biomarkers.map((biomarker) => (
            <Badge
              key={biomarker.name}
              variant={selectedBiomarker === biomarker.name ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              style={{
                backgroundColor: selectedBiomarker === biomarker.name ? biomarker.color : "transparent",
                borderColor: biomarker.color,
                color: selectedBiomarker === biomarker.name ? "white" : biomarker.color,
              }}
              onClick={() => setSelectedBiomarker(biomarker.name)}
            >
              {biomarker.name}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div
          className={`chart-container bg-white ${isMobile ? 'p-1' : 'p-4'} rounded-lg`}
          style={{
            width: isMobile ? '100vw' : '100%',
            maxWidth: '100%',
            marginLeft: isMobile ? '-16px' : undefined, // compensate for container padding
            marginRight: isMobile ? '-16px' : undefined,
            overflowX: 'auto',
          }}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart
              data={combinedData}
              margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="formattedDate"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: isMobile ? 12 : 12, fontWeight: isMobile ? 600 : 400 }}
                interval={isMobile ? 0 : 0}
                domain={['auto', 'auto']}
                allowDataOverflow
              />
              <YAxis
                tick={{ fontSize: isMobile ? 12 : 12, fontWeight: isMobile ? 600 : 400 }}
                width={isMobile ? 40 : 60}
                domain={yDomain}
                allowDataOverflow
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ fontSize: isMobile ? 12 : 12, fontWeight: isMobile ? 600 : 400 }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: isMobile ? 12 : 12, fontWeight: isMobile ? 600 : 400 }}
              />
              {biomarkers.map((biomarker) => {
                if (selectedBiomarker === biomarker.name) {
                  return [
                    <Line
                      key={biomarker.name}
                      type="monotone"
                      dataKey={biomarker.name}
                      stroke={biomarker.color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name={`${biomarker.name} (${biomarker.unit})`}
                      isAnimationActive={false}
                    />,
                    biomarker.referenceRange && (
                      <ReferenceArea
                        key={`${biomarker.name}-range`}
                        y1={biomarker.referenceRange.min}
                        y2={biomarker.referenceRange.max}
                        fill={biomarker.color}
                        fillOpacity={0.1}
                      />
                    ),
                    biomarker.referenceRange && (
                      <ReferenceLine
                        key={`${biomarker.name}-min`}
                        y={biomarker.referenceRange.min}
                        stroke={biomarker.color}
                        strokeDasharray="3 3"
                        opacity={0.5}
                      />
                    ),
                    biomarker.referenceRange && (
                      <ReferenceLine
                        key={`${biomarker.name}-max`}
                        y={biomarker.referenceRange.max}
                        stroke={biomarker.color}
                        strokeDasharray="3 3"
                        opacity={0.5}
                      />
                    ),
                    biomarker.referenceRange?.optimal && (
                      <ReferenceLine
                        key={`${biomarker.name}-optimal`}
                        y={biomarker.referenceRange.optimal}
                        stroke={biomarker.color}
                        strokeDasharray="5 5"
                        opacity={0.8}
                      />
                    ),
                  ]
                }
                return null
              })}
              <Brush
                dataKey="formattedDate"
                height={30}
                stroke="#8884d8"
                startIndex={zoomDomain.startIndex}
                endIndex={zoomDomain.endIndex}
                onChange={(domain) => {
                  setZoomDomain(domain)
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
