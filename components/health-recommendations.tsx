import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Heart, Activity } from "lucide-react"

const recommendations = [
  {
    type: "warning",
    icon: AlertTriangle,
    title: "HDL Cholesterol Low",
    message: "Consider increasing physical activity and consuming healthy fats like omega-3 fatty acids.",
    priority: "high",
  },
  {
    type: "info",
    icon: Heart,
    title: "Cardiovascular Health",
    message: "Maintain current cholesterol levels through balanced diet and regular exercise.",
    priority: "medium",
  },
  {
    type: "success",
    icon: Activity,
    title: "Kidney Function",
    message: "Creatinine levels are within normal range. Continue current lifestyle habits.",
    priority: "low",
  },
]

export function HealthRecommendations() {
  const getAlertVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "destructive"
      case "info":
        return "default"
      case "success":
        return "default"
      default:
        return "default"
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-red-200 bg-red-50"
      case "info":
        return "border-blue-200 bg-blue-50"
      case "success":
        return "border-green-200 bg-green-50"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Health Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => {
          const IconComponent = rec.icon
          return (
            <Alert key={index} className={getAlertColor(rec.type)}>
              <IconComponent className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">{rec.title}</div>
                <div className="text-sm">{rec.message}</div>
              </AlertDescription>
            </Alert>
          )
        })}
      </CardContent>
    </Card>
  )
}
