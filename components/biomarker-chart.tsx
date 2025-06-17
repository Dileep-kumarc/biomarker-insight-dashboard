"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ChartDataPoint {
  date: string
  value: number
  formattedDate: string
}

interface BiomarkerChartProps {
  data: ChartDataPoint[]
  normalRange: { min: number; max: number }
  unit: string
  biomarker: string
}

export function BiomarkerChart({ data, normalRange, unit, biomarker }: BiomarkerChartProps) {
  const chartConfig = {
    value: {
      label: biomarker,
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
          <YAxis
            className="text-xs"
            tick={{ fontSize: 12 }}
            label={{ value: unit, angle: -90, position: "insideLeft" }}
          />

          {/* Normal range highlighting */}
          <ReferenceLine
            y={normalRange.min}
            stroke="#10b981"
            strokeDasharray="5 5"
            label={{ value: "Normal Min", position: "topRight" }}
          />
          <ReferenceLine
            y={normalRange.max}
            stroke="#10b981"
            strokeDasharray="5 5"
            label={{ value: "Normal Max", position: "topRight" }}
          />

          <ChartTooltip
            content={<ChartTooltipContent />}
            labelFormatter={(value, payload) => {
              const point = payload?.[0]?.payload as ChartDataPoint
              return point?.formattedDate || value
            }}
            formatter={(value: number) => [`${value} ${unit}`, biomarker]}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "var(--color-value)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
