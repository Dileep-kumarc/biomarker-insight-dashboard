"use client"

import { XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { BiomarkerData } from "../types/biomarker"

interface AdvancedBiomarkerChartProps {
  biomarker: BiomarkerData
}

export function AdvancedBiomarkerChart({ biomarker }: AdvancedBiomarkerChartProps) {
  const { name, history, currentValue } = biomarker
  const { unit, referenceRange } = currentValue

  const chartData = history.map((point, index) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: point.value,
    formattedDate: new Date(point.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    status: point.status,
    isLatest: index === history.length - 1,
  }))

  const chartConfig = {
    value: {
      label: name,
      color: "hsl(var(--chart-1))",
    },
  }

  // Calculate if trend is improving
  const isImproving = () => {
    if (history.length < 2) return false
    const latest = history[history.length - 1].value
    const previous = history[history.length - 2].value

    // For biomarkers where lower is better
    if (
      (name.includes("Cholesterol") && name !== "HDL Cholesterol") ||
      name === "Triglycerides" ||
      name === "Creatinine"
    ) {
      return latest < previous
    }
    // For biomarkers where higher is better
    if (name === "HDL Cholesterol" || name === "Vitamin D" || name === "Hemoglobin") {
      return latest > previous
    }
    return false
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{name} Trend</h3>
        {isImproving() && <span className="text-sm text-green-600 font-medium">📈 Improving</span>}
      </div>

      <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} tickLine={{ stroke: "#e5e7eb" }} />
            <YAxis
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "#e5e7eb" }}
              label={{ value: unit, angle: -90, position: "insideLeft" }}
            />

            {/* Reference range highlighting */}
            {referenceRange.min > 0 && (
              <ReferenceLine
                y={referenceRange.min}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={{ value: "Normal Min", position: "right", fontSize: 10 }}
              />
            )}
            <ReferenceLine
              y={referenceRange.max}
              stroke="#10b981"
              strokeDasharray="5 5"
              label={{ value: "Normal Max", position: "right", fontSize: 10 }}
            />

            {referenceRange.optimal && (
              <ReferenceLine
                y={referenceRange.optimal}
                stroke="#059669"
                strokeDasharray="2 2"
                label={{ value: "Optimal", position: "right", fontSize: 10 }}
              />
            )}

            <ChartTooltip
              content={<ChartTooltipContent />}
              labelFormatter={(value, payload) => {
                const point = payload?.[0]?.payload
                return point?.formattedDate || value
              }}
              formatter={(value, name, props: any) => {
                const status = props?.payload?.status
                return [
                  `${value} ${unit}`,
                  biomarker.name,
                  <span
                    key={`${value}-${name}`}
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      status === "Normal"
                        ? "bg-green-100 text-green-800"
                        : status === "Low"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {status}
                  </span>,
                ]
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={3}
              fill="url(#colorValue)"
              dot={(props) => {
                const { cx, cy, payload } = props
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={payload.isLatest ? 6 : 4}
                    fill="var(--color-value)"
                    stroke="#fff"
                    strokeWidth={2}
                    className={payload.isLatest ? "animate-pulse" : ""}
                  />
                )
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
