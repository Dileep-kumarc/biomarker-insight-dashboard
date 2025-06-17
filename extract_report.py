import re
from PyPDF2 import PdfReader

def extract_pdf_data(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    # Extract patient info
    name = re.search(r"Name:\s*([A-Z. ]+)", text)
    age_gender = re.search(r"Age/Gender:\s*(\d+)Y/([MF])", text)
    date = re.search(r"Date:\s*([\d-]+)", text)

    patient_info = {
        "name": name.group(1).strip() if name else "",
        "age": int(age_gender.group(1)) if age_gender else "",
        "gender": "MALE" if age_gender and age_gender.group(2) == "M" else "FEMALE" if age_gender else "",
        "report_date": date.group(1) if date else ""
    }

    # Extract biomarker values
    biomarkers = {}
    biomarker_patterns = {
        "Total Cholesterol": r"Total Cholesterol\s+([\d.]+)\s*mg/dL",
        "Triglycerides": r"Triglycerides\s+([\d.]+)\s*mg/dL",
        "HDL": r"HDL\s+([\d.]+)\s*mg/dL",
        "LDL": r"LDL\s+([\d.]+)\s*mg/dL",
        "Vitamin D": r"Vitamin D\s+([\d.]+)\s*ng/mL",
        "Vitamin B12": r"Vitamin B12\s+([\d.]+)\s*pg/mL",
        "Creatinine": r"Creatinine\s+([\d.]+)\s*mg/dL",
        "HbA1c": r"HbA1c\s+([\d.]+)\s*%",
    }

    for key, pattern in biomarker_patterns.items():
        match = re.search(pattern, text)
        biomarkers[key] = match.group(1) if match else ""

    return {
        "patient_info": patient_info,
        "biomarkers": biomarkers
    }

# Example usage:
result = extract_pdf_data(r"C:\Users\dilee\Downloads\MR. MANJUNATH SWAMY_56 Y 0 M 0 D _KAL5954 (1).pdf")
print(result)
