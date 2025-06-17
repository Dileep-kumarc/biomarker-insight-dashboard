import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, CheckCircle, XCircle } from "lucide-react"

export function ClinicalInterpretationGuide() {
  const interpretations = [
    {
      biomarker: "HDL Cholesterol",
      value: "39 mg/dL",
      status: "Low",
      interpretation:
        "HDL (good) cholesterol is below target range. Low HDL increases cardiovascular risk. Focus on lifestyle changes to improve.",
      recommendations: [
        "Increase physical activity",
        "Include healthy fats in diet",
        "Quit smoking if applicable",
        "Consider omega-3 supplements",
      ],
    },
    {
      biomarker: "Triglycerides",
      value: "174 mg/dL",
      status: "High",
      interpretation:
        "Elevated triglycerides indicate increased cardiovascular risk and potential metabolic issues. Dietary changes needed.",
      recommendations: [
        "Reduce refined carbohydrates",
        "Limit alcohol consumption",
        "Increase fiber intake",
        "Regular exercise",
      ],
    },
    {
      biomarker: "HbA1c",
      value: "5.8%",
      status: "High",
      interpretation:
        "HbA1c indicates prediabetes range. This suggests impaired glucose metabolism over the past 3 months.",
      recommendations: [
        "Monitor blood sugar regularly",
        "Follow low glycemic diet",
        "Increase physical activity",
        "Consider metformin (discuss with doctor)",
      ],
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600" />
            <span>Clinical Interpretation Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {interpretations.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className={`border-l-4 ${
                item.status === "Low"
                  ? "border-l-amber-500 bg-amber-50/50"
                  : "border-l-rose-500 bg-rose-50/50"
              } backdrop-blur-sm`}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.biomarker}</h4>
                          <p className="text-sm text-gray-600">Current Value: {item.value}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          item.status === "Low"
                            ? "text-amber-700 border-amber-300 bg-amber-100/50"
                            : "text-rose-700 border-rose-300 bg-rose-100/50"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>

                    {/* Interpretation */}
                    <div className="text-sm text-gray-700">
                      <p>{item.interpretation}</p>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-900">Recommendations:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {item.recommendations.map((rec, recIndex) => (
                          <motion.div
                            key={recIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + recIndex * 0.1 }}
                            className="flex items-start space-x-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <span className="text-sm text-gray-700">{rec}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-blue-50/50 backdrop-blur-sm border border-blue-200 rounded-lg p-4"
          >
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This guide is for informational purposes only. Always consult with your healthcare
              provider before making any changes to your treatment plan.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
