export function getDynamicBiomarkerGroups(biomarkerData: any) {
  return {
    "Lipid Profile": {
      title: "Lipid Profile Trends",
      biomarkers: [
        {
          name: "Total Cholesterol",
          data: biomarkerData["Total Cholesterol"].history.map((item: any) => ({
            date: item.date,
            value: item.value,
            status: item.status
          })),
          color: "#3b82f6",
          referenceRange: biomarkerData["Total Cholesterol"].currentValue.referenceRange,
          unit: biomarkerData["Total Cholesterol"].currentValue.unit,
        },
        {
          name: "HDL Cholesterol",
          data: biomarkerData["HDL Cholesterol"].history.map((item: any) => ({
            date: item.date,
            value: item.value,
            status: item.status
          })),
          color: "#10b981",
          referenceRange: biomarkerData["HDL Cholesterol"].currentValue.referenceRange,
          unit: biomarkerData["HDL Cholesterol"].currentValue.unit,
        },
        {
          name: "LDL Cholesterol",
          data: biomarkerData["LDL Cholesterol"].history.map((item: any) => ({
            date: item.date,
            value: item.value,
            status: item.status
          })),
          color: "#f59e0b",
          referenceRange: biomarkerData["LDL Cholesterol"].currentValue.referenceRange,
          unit: biomarkerData["LDL Cholesterol"].currentValue.unit,
        },
        {
          name: "Triglycerides",
          data: biomarkerData["Triglycerides"].history.map((item: any) => ({
            date: item.date,
            value: item.value,
            status: item.status
          })),
          color: "#ef4444",
          referenceRange: biomarkerData["Triglycerides"].currentValue.referenceRange,
          unit: biomarkerData["Triglycerides"].currentValue.unit,
        },
      ],
    },
    "Metabolic Panel": {
      title: "Metabolic & Kidney Function",
      biomarkers: [
        {
          name: "Creatinine",
          data: biomarkerData["Creatinine"].history.map((item: any) => ({
            date: item.date,
            value: item.value,
            status: item.status
          })),
          color: "#0891b2",
          referenceRange: biomarkerData["Creatinine"].currentValue.referenceRange,
          unit: biomarkerData["Creatinine"].currentValue.unit,
        },
        {
          name: "HbA1c",
          data: biomarkerData["HbA1c"].history.map((item: any) => ({
            date: item.date,
            value: item.value,
            status: item.status
          })),
          color: "#be185d",
          referenceRange: biomarkerData["HbA1c"].currentValue.referenceRange,
          unit: biomarkerData["HbA1c"].currentValue.unit,
        },
      ],
    },
    Vitamins: {
      title: "Vitamin Levels",
      biomarkers: [
        {
          name: "Vitamin D",
          data: biomarkerData["Vitamin D"].history.map((item: any) => ({
            date: item.date,
            value: item.value,
            status: item.status
          })),
          color: "#f59e0b",
          referenceRange: biomarkerData["Vitamin D"].currentValue.referenceRange,
          unit: biomarkerData["Vitamin D"].currentValue.unit,
        },
        {
          name: "Vitamin B12",
          data: biomarkerData["Vitamin B12"].history.map((item: any) => ({
            date: item.date,
            value: item.value,
            status: item.status
          })),
          color: "#8b5cf6",
          referenceRange: biomarkerData["Vitamin B12"].currentValue.referenceRange,
          unit: biomarkerData["Vitamin B12"].currentValue.unit,
        },
      ],
    },
  }
} 