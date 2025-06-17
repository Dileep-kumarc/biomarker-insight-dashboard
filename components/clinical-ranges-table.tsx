import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const clinicalRanges = [
  { biomarker: "Total Cholesterol", normal: "< 200 mg/dL", borderline: "200-239 mg/dL", high: "≥ 240 mg/dL" },
  {
    biomarker: "HDL Cholesterol",
    normal: "≥ 40 mg/dL (M), ≥ 50 mg/dL (F)",
    low: "< 40 mg/dL (M), < 50 mg/dL (F)",
    high: "N/A",
  },
  { biomarker: "LDL Cholesterol", normal: "< 100 mg/dL", borderline: "100-159 mg/dL", high: "≥ 160 mg/dL" },
  { biomarker: "Triglycerides", normal: "< 150 mg/dL", borderline: "150-199 mg/dL", high: "≥ 200 mg/dL" },
  {
    biomarker: "Creatinine",
    normal: "0.7-1.3 mg/dL (M), 0.6-1.1 mg/dL (F)",
    low: "< 0.7 mg/dL",
    high: "> 1.3 mg/dL (M), > 1.1 mg/dL (F)",
  },
  { biomarker: "Vitamin D", normal: "30-100 ng/mL", low: "< 30 ng/mL", high: "> 100 ng/mL" },
  { biomarker: "Vitamin B12", normal: "200-900 pg/mL", low: "< 200 pg/mL", high: "> 900 pg/mL" },
  { biomarker: "HbA1c", normal: "< 5.7%", borderline: "5.7-6.4%", high: "≥ 6.5%" },
]

export function ClinicalRangesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Clinical Reference Ranges</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Biomarker</TableHead>
              <TableHead className="font-semibold">Normal</TableHead>
              <TableHead className="font-semibold">Borderline/Low</TableHead>
              <TableHead className="font-semibold">High</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clinicalRanges.map((range) => (
              <TableRow key={range.biomarker}>
                <TableCell className="font-medium">{range.biomarker}</TableCell>
                <TableCell className="text-green-700">{range.normal}</TableCell>
                <TableCell className="text-blue-700">{range.borderline || range.low}</TableCell>
                <TableCell className="text-red-700">{range.high}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
