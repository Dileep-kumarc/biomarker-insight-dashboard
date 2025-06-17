import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Pill, Activity } from "lucide-react"

export function ActionPlan() {
  const foodRecommendations = {
    enjoy: [
      { name: "Salmon & Fatty Fish", reason: "Rich in omega-3 for HDL improvement" },
      { name: "Avocados", reason: "Healthy fats to boost HDL cholesterol" },
      { name: "Nuts & Seeds", reason: "Almonds, walnuts for heart health" },
      { name: "Olive Oil", reason: "Monounsaturated fats for cardiovascular health" },
      { name: "Leafy Greens", reason: "Antioxidants and nutrients for overall health" },
      { name: "Berries", reason: "Antioxidants to reduce inflammation" },
    ],
    limit: [
      { name: "Refined Sugars", reason: "Can increase triglycerides" },
      { name: "Processed Foods", reason: "High sodium affects kidney function" },
      { name: "Trans Fats", reason: "Lowers HDL and raises LDL" },
      { name: "Excessive Alcohol", reason: "Can elevate triglycerides" },
      { name: "White Bread & Pasta", reason: "Refined carbs increase triglycerides" },
    ],
  }

  const supplements = [
    { name: "Omega-3 Fish Oil", dosage: "1000-2000mg daily", reason: "Improve HDL and reduce triglycerides" },
    { name: "Vitamin D3", dosage: "2000-4000 IU daily", reason: "Maintain current levels" },
    { name: "Niacin (B3)", dosage: "500mg daily", reason: "Boost HDL cholesterol" },
    { name: "Magnesium", dosage: "400mg daily", reason: "Support kidney and heart health" },
  ]

  const lifestyle = [
    { activity: "Aerobic Exercise", frequency: "30 min, 5x/week", benefit: "Improve HDL and reduce triglycerides" },
    { activity: "Strength Training", frequency: "2-3x/week", benefit: "Boost metabolism and heart health" },
    { activity: "Stress Management", frequency: "Daily", benefit: "Reduce cortisol and inflammation" },
    { activity: "Quality Sleep", frequency: "7-8 hours nightly", benefit: "Optimize hormone balance" },
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
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Personalized Action Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nutrition" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="supplements">Supplements</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            </TabsList>

            <TabsContent value="nutrition" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-green-200 bg-green-50/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Foods to Enjoy</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {foodRecommendations.enjoy.map((food, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="border-l-4 border-green-500 pl-3"
                        >
                          <div className="font-medium text-green-800">{food.name}</div>
                          <div className="text-sm text-green-600">{food.reason}</div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span>Foods to Limit</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {foodRecommendations.limit.map((food, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="border-l-4 border-red-500 pl-3"
                        >
                          <div className="font-medium text-red-800">{food.name}</div>
                          <div className="text-sm text-red-600">{food.reason}</div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="supplements" className="space-y-4">
              <div className="grid gap-4">
                {supplements.map((supplement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="border-blue-200 bg-blue-50/50 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Pill className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-blue-800">{supplement.name}</div>
                              <div className="text-sm text-blue-600">{supplement.reason}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-blue-700 border-blue-300">
                            {supplement.dosage}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-yellow-50/50 backdrop-blur-sm border border-yellow-200 rounded-lg p-4"
              >
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Always consult your healthcare provider before starting any new supplements,
                  especially if you're taking medications or have existing health conditions.
                </p>
              </motion.div>
            </TabsContent>

            <TabsContent value="lifestyle" className="space-y-4">
              <div className="grid gap-4">
                {lifestyle.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="border-purple-200 bg-purple-50/50 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Activity className="h-5 w-5 text-purple-600" />
                            <div>
                              <div className="font-medium text-purple-800">{item.activity}</div>
                              <div className="text-sm text-purple-600">{item.benefit}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-purple-700 border-purple-300">
                            {item.frequency}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
