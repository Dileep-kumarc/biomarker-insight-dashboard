import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface BiomarkerCardProps {
  name: string
  value: string
  unit: string
  status: "Normal" | "Low" | "High"
  trend: "up" | "down" | "stable"
  message: string
}

export function BiomarkerCard({ name, value, unit, status, trend, message }: BiomarkerCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800 border-green-200"
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          {getTrendIcon(trend)}
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-600">{unit}</span>
        </div>
        <Badge className={`mb-2 ${getStatusColor(status)}`}>{status}</Badge>
        <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
      </CardContent>
    </Card>
  )
}
