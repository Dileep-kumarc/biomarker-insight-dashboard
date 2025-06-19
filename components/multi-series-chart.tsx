"use client"

import { useState, useEffect, useRef } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw } from "lucide-react"

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
  dateRange?: string
  onDateRangeChange?: (range: string) => void
}

interface ZoomState {
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  startX?: number
  currentX?: number
}

interface DataPoint {
  date: string
  value: number
  status: string
}

export function MultiSeriesChart({ title, biomarkers, height = 400, dateRange = 'all-time', onDateRangeChange }: MultiSeriesChartProps) {
  const [zoomDomain, setZoomDomain] = useState<{ startIndex?: number; endIndex?: number }>({})
  const [selectedBiomarkers, setSelectedBiomarkers] = useState<string[]>(biomarkers.map((b) => b.name))
  const [chartHeight, setChartHeight] = useState(height)
  const [isMobile, setIsMobile] = useState(false)
  const [zoomState, setZoomState] = useState<ZoomState>({})
  const [brushDomain, setBrushDomain] = useState<[number, number]>([0, 100])
  const defaultHeight = height
  const minHeight = Math.max(200, defaultHeight * 0.5) // Minimum 200px or 50% of default
  const maxHeight = defaultHeight * 2 // Maximum 200% of default

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 400) {
        setChartHeight(250)
      } else if (window.innerWidth < 768) {
        setChartHeight(350)
      } else {
        setChartHeight(defaultHeight)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [defaultHeight]) // keep defaultHeight dependency

  // Memoize biomarker names
  useEffect(() => {
    const biomarkerNames = biomarkers.map((b) => b.name)
    setSelectedBiomarkers(prev => {
      // Only update if the names have changed
      const prevSet = new Set(prev)
      const newSet = new Set(biomarkerNames)
      if (prevSet.size !== newSet.size || [...prevSet].some(name => !newSet.has(name))) {
        return biomarkerNames
      }
      return prev
    })
  }, [biomarkers]) // Only re-run when biomarkers change

  const filterDataByDateRange = (data: DataPoint[], range: string): DataPoint[] => {
    if (range === 'all-time') return data;

    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case 'last-3-months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'last-6-months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'last-year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(point => new Date(point.date) >= startDate);
  };

  // Filter biomarkers data based on date range
  const filteredBiomarkers = React.useMemo(() => biomarkers.map(biomarker => ({
    ...biomarker,
    data: filterDataByDateRange(biomarker.data, dateRange)
  })), [biomarkers, dateRange])

  // Improved data combination logic with filtered data
  const combinedData = React.useMemo(() => {
    if (!filteredBiomarkers[0]?.data) return []
    
    return filteredBiomarkers[0].data.map((_, index) => {
      const dataPoint: any = {
        date: filteredBiomarkers[0].data[index].date,
        formattedDate: new Date(filteredBiomarkers[0].data[index].date).toLocaleDateString("en-US", {
          year: "numeric",
          month: isMobile ? "short" : "long",
          day: "numeric",
        }),
      }

      filteredBiomarkers.forEach((biomarker) => {
        if (biomarker.data[index]) {
          dataPoint[biomarker.name] = biomarker.data[index].value
          dataPoint[`${biomarker.name}_status`] = biomarker.data[index].status
        }
      })

      return dataPoint
    })
  }, [filteredBiomarkers, isMobile])

  // Reset zoom when date range changes
  useEffect(() => {
    if (handleZoomReset) {
      handleZoomReset()
    }
  }, [dateRange, handleZoomReset])

  const handleBiomarkerToggle = (biomarkerName: string) => {
    setSelectedBiomarkers((prev) => {
      if (prev.includes(biomarkerName)) {
        return prev.filter((name) => name !== biomarkerName)
      } else {
        return [...prev, biomarkerName]
      }
    })
  }

  const handleZoomReset = () => {
    setZoomDomain({})
    setZoomState({})
    setBrushDomain([0, combinedData.length - 1])
    setChartHeight(defaultHeight) // Reset to default height
  }

  // Calculate data domain for Y axis using filtered data
  const yDomain = filteredBiomarkers.reduce((domain, biomarker) => {
    if (selectedBiomarkers.includes(biomarker.name)) {
      const values = biomarker.data.map(d => d.value)
      const min = Math.min(...values, biomarker.referenceRange.min)
      const max = Math.max(...values, biomarker.referenceRange.max)
      return [
        Math.min(domain[0], min * 0.9), // Add 10% padding
        Math.max(domain[1], max * 1.1)
      ]
    }
    return domain
  }, [Infinity, -Infinity])

  const handleZoomIn = () => {
    if (combinedData.length === 0) return;
    
    // Get current view range
    const currentStart = zoomDomain.startIndex ?? 0;
    const currentEnd = zoomDomain.endIndex ?? combinedData.length - 1;
    const currentRange = currentEnd - currentStart;
    
    // Calculate new range (zoom in by 30%)
    const newRange = Math.max(2, Math.floor(currentRange * 0.7));
    const midPoint = Math.floor((currentStart + currentEnd) / 2);
    
    // Calculate new start and end indices
    const newStart = Math.max(0, midPoint - Math.floor(newRange / 2));
    const newEnd = Math.min(combinedData.length - 1, newStart + newRange);
    
    // Update both zoom domain and brush domain
    setZoomDomain({ startIndex: newStart, endIndex: newEnd });
    setBrushDomain([newStart, newEnd]);

    // Decrease chart height (make it more compact)
    setChartHeight(prevHeight => {
      const newHeight = prevHeight * 0.8; // Reduce height by 20%
      return Math.max(minHeight, newHeight); // Don't go below minimum height
    });
  };

  const handleZoomOut = () => {
    if (combinedData.length === 0) return;
    
    // Get current view range
    const currentStart = zoomDomain.startIndex ?? 0;
    const currentEnd = zoomDomain.endIndex ?? combinedData.length - 1;
    const currentRange = currentEnd - currentStart;
    
    // Calculate new range (zoom out by 30%)
    const newRange = Math.min(combinedData.length, Math.ceil(currentRange / 0.7));
    const midPoint = Math.floor((currentStart + currentEnd) / 2);
    
    // Calculate new start and end indices
    let newStart = Math.max(0, midPoint - Math.floor(newRange / 2));
    let newEnd = Math.min(combinedData.length - 1, newStart + newRange);
    
    // Adjust if we're at the edges
    if (newEnd - newStart >= combinedData.length - 1) {
      // If zooming out would show full range or more, reset zoom
      handleZoomReset();
      return;
    }
    
    // Update both zoom domain and brush domain
    setZoomDomain({ startIndex: newStart, endIndex: newEnd });
    setBrushDomain([newStart, newEnd]);

    // Increase chart height
    setChartHeight(prevHeight => {
      const newHeight = prevHeight * 1.2; // Increase height by 20%
      return Math.min(maxHeight, newHeight); // Don't exceed maximum height
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              Zoom In
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              Zoom Out
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Zoom
            </Button>
          </div>
        </div>

        {/* Biomarker Toggle Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filteredBiomarkers.map((biomarker) => (
            <Badge
              key={biomarker.name}
              variant={selectedBiomarkers.includes(biomarker.name) ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              style={{
                backgroundColor: selectedBiomarkers.includes(biomarker.name) ? biomarker.color : "transparent",
                borderColor: biomarker.color,
                color: selectedBiomarkers.includes(biomarker.name) ? "white" : biomarker.color,
              }}
              onClick={() => handleBiomarkerToggle(biomarker.name)}
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
              <ChartTooltip />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: isMobile ? 12 : 12, fontWeight: isMobile ? 600 : 400 }}
              />
              {filteredBiomarkers.map((biomarker) => {
                if (selectedBiomarkers.includes(biomarker.name)) {
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
                    <ReferenceLine
                      key={`${biomarker.name}-min`}
                      y={biomarker.referenceRange.min}
                      stroke={biomarker.color}
                      strokeDasharray="3 3"
                      opacity={0.5}
                    />,
                    <ReferenceLine
                      key={`${biomarker.name}-max`}
                      y={biomarker.referenceRange.max}
                      stroke={biomarker.color}
                      strokeDasharray="3 3"
                      opacity={0.5}
                    />,
                    biomarker.referenceRange.optimal && (
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
                  setZoomDomain(domain);
                  setBrushDomain([domain.startIndex ?? 0, domain.endIndex ?? combinedData.length - 1]);
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
