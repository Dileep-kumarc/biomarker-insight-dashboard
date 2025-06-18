from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.cors import ALL_METHODS
import re
from pdf2image import convert_from_bytes
from PyPDF2 import PdfReader
from io import BytesIO
import logging
import os

# IMPORTANT: You'll need to install pytesseract if you plan to use OCR fallback.
# Ensure Tesseract-OCR is installed on your system and its path is set in environment variables.
# You might need to uncomment and install 'Pillow' if not already installed with pdf2image.
try:
    import pytesseract
except ImportError:
    logging.warning("pytesseract not found. OCR fallback will not work. Please install it if needed.")
    logging.warning("Install with: pip install pytesseract")
    # If Tesseract-OCR executable is not in your PATH, you might need to set it:
    # pytesseract.pytesseract.tesseract_cmd = r'<path_to_your_tesseract_executable>'
    # Example for Windows: pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


# --- FastAPI App Initialization ---
app = FastAPI()

# CORS setup - Allowing Netlify and Vercel domains, including wildcards for subdomains
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.(vercel|netlify)\.app",
    allow_credentials=True,
    allow_methods=ALL_METHODS,
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)

# --- Configuration: Biomarker Mapping ---
# This mapping uses a list of keywords for flexible matching.
BIOMARKER_MAPPING = {
    "Total Cholesterol": {
        "keywords": ["total cholesterol", "cholesterol:"],
        "unit": "mg/dL"
    },
    "HDL": {
        "keywords": ["hdl cholesterol", "hdl:"],
        "unit": "mg/dL"
    },
    "LDL": {
        "keywords": ["ldl cholesterol", "ldl:"],
        "unit": "mg/dL"
    },
    "Triglycerides": {
        "keywords": ["triglycerides"],
        "unit": "mg/dL"
    },
    "Vitamin D": {
        "keywords": ["25-oh vitamin d", "vitamin d:", "vitamin d total"],
        "unit": "ng/mL"
    },
    "Vitamin B12": {
        "keywords": ["vitamin b-12", "vitamin b12", "cyanocobalamin"],
        "unit": "pg/mL"
    },
    "Creatinine": {
        "keywords": ["creatinine - serum", "creatinine:", "serum creatinine"],
        "unit": "mg/dL"
    },
    "HbA1c": {
        "keywords": ["hba1c", "hemoglobin a1c", "glycated hemoglobin"],
        "unit": "%"
    }
}

# --- PDF and Text Processing Functions ---

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extracts text from PDF bytes. Tries PyPDF2 first, falls back to OCR if needed."""
    text = ""
    try:
        reader = PdfReader(BytesIO(pdf_bytes))
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        if len(text.strip()) > 50:
            logging.info("Text successfully extracted via PyPDF2.")
            return text
    except Exception as e:
        logging.warning(f"PyPDF2 failed to extract text: {e}. Falling back to OCR if pytesseract is available.")

    if 'pytesseract' in globals(): # Check if pytesseract was successfully imported
        try:
            images = convert_from_bytes(pdf_bytes)
            ocr_text = ""
            for i, img in enumerate(images):
                logging.info(f"OCR processing page {i+1}...")
                ocr_text += pytesseract.image_to_string(img) + "\n"
            logging.info("Text extracted via OCR fallback.")
            return ocr_text
        except Exception as e:
            logging.error(f"OCR fallback failed: {e}. Please ensure Tesseract-OCR is installed and configured.")
            return ""
    else:
        logging.warning("pytesseract is not available, cannot perform OCR fallback.")
        return ""

def find_patient_info(text: str) -> dict:
    """Finds patient name, age, gender, and report date from the text using multiple patterns."""
    patient_info = {"name": "", "age": "", "gender": "", "report_date": ""}

    # --- Name, Age, Gender - Combined Patterns (Prioritized) ---
    # Pattern 1: NAME : BG MANJUNATH SWAMY (57Y/M) or NAME: BG MANJUNATH SWAMY (57 YRS/M)
    # This is often the most reliable if it matches.
    name_age_gender_pattern1 = re.compile(
        r'(?:NAME|PATIENT NAME)\s*[:\s]*([A-Z\s\.]+)\s*\((\d+)\s*(?:Y|YRS)?\/?([MF])\)',
        re.IGNORECASE
    )

    # Pattern 2: Patient Name: Raju (and age/gender on separate lines later)
    name_pattern = re.compile(r'(?:Patient Name|Name)\s*[:\s]*(.*)', re.IGNORECASE)
    age_pattern = re.compile(r'(?:Age|DOB Year)\s*[:\s]*(\d+)', re.IGNORECASE) # Added DOB Year
    gender_pattern = re.compile(r'(?:Gender|Sex)\s*[:\s]*(Male|Female|M|F)', re.IGNORECASE) # Added Sex, M/F

    # --- Date Patterns ---
    date_pattern = re.compile(
        r'(?:Date|Report Released on \(RRT\)|Report Date|Test Date|Collection Date)\s*[:\s]*(\d{1,2}\s+\w+\s+\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
        re.IGNORECASE
    )

    logging.info("Searching for patient information...")

    # Try combined pattern first
    match1 = name_age_gender_pattern1.search(text)
    if match1:
        patient_info["name"] = match1.group(1).strip().title()
        patient_info["age"] = match1.group(2).strip()
        patient_info["gender"] = "Male" if match1.group(3).upper() == 'M' else "Female"
        logging.info(f"Matched with combined pattern 1: Name='{patient_info['name']}', Age='{patient_info['age']}', Gender='{patient_info['gender']}'")
    else:
        logging.info("Combined pattern 1 not found. Trying separate patterns.")
        # Fallback to other patterns
        name_match = name_pattern.search(text)
        if name_match:
            patient_info["name"] = name_match.group(1).strip().title()
            logging.info(f"Name matched: '{patient_info['name']}'")

        age_match = age_pattern.search(text)
        if age_match:
            patient_info["age"] = age_match.group(1).strip()
            logging.info(f"Age matched: '{patient_info['age']}'")

        gender_match = gender_pattern.search(text)
        if gender_match:
            # Normalize gender to "Male" or "Female"
            gender_raw = gender_match.group(1).strip().upper()
            if gender_raw in ['M', 'MALE']:
                patient_info["gender"] = "Male"
            elif gender_raw in ['F', 'FEMALE']:
                patient_info["gender"] = "Female"
            logging.info(f"Gender matched: '{patient_info['gender']}' (raw: {gender_raw})")

    # Always try to find the date, as it can be anywhere
    date_match = date_pattern.search(text)
    if date_match:
        patient_info["report_date"] = date_match.group(1).strip()
        logging.info(f"Report Date matched: '{patient_info['report_date']}'")
    else:
        logging.info("Report Date not found with any pattern.")

    return patient_info


def find_biomarkers(text: str) -> dict:
    """
    NEW ROBUST LOGIC:
    - Iterates through lines and uses flexible keyword matching.
    - Finds all numbers on a matching line.
    - The FIRST number is the result, subsequent numbers are ignored as reference range.
    """
    biomarkers = {k: {"value": "", "unit": v["unit"]} for k, v in BIOMARKER_MAPPING.items()}
    lines = text.split('\n')
    found_biomarkers = set()

    logging.info("Searching for biomarkers...")

    for line in lines:
        line_lower = line.lower()

        # Skip lines that are clearly headers or irrelevant to avoid false positives
        if re.match(r'^\s*(bio\.\sref|method|technology|units|remarks|--|test details|test name|result|reference range|unit|page)', line_lower):
            continue

        for key, config in BIOMARKER_MAPPING.items():
            if key in found_biomarkers: # Skip if already found
                continue

            for keyword in config['keywords']:
                if keyword in line_lower:
                    # Found a matching line. Extract the FIRST number as the value.
                    # This heuristic correctly separates the result from the reference range.
                    numbers = re.findall(r'\b\d+\.?\d*\b', line) # Matches integers and decimals

                    if numbers:
                        # Special case: Avoid matching "Non-HDL Cholesterol" as "Total Cholesterol"
                        if key == "Total Cholesterol" and "non-hdl" in line_lower:
                            continue

                        # Special case: For HbA1c, ensure it's not part of a date or page number if the pattern is too broad
                        # (e.g., "HbA1c 5.8%" vs "Page 5 of 8") - already handled by skipping common irrelevant keywords.

                        biomarkers[key]['value'] = numbers[0]
                        found_biomarkers.add(key)
                        logging.info(f"Found biomarker '{key}': Value='{numbers[0]}', Unit='{config['unit']}'")
                        break  # Move to the next biomarker mapping
            # If a biomarker was found on this line, don't re-process for other keywords on the same line.
            if key in found_biomarkers:
                continue # This 'continue' here is important to move to the next 'key' in BIOMARKER_MAPPING
                         # after finding one, allowing the outer loop to continue to the next line.

    return biomarkers

def extract_info_from_text(text: str) -> dict:
    """Main extraction orchestrator."""
    patient_info = find_patient_info(text)
    biomarkers = find_biomarkers(text)

    logging.info("Final Extracted Patient Info: %s", patient_info)
    logging.info("Final Extracted Biomarkers: %s", biomarkers)

    return {
        "patient_info": patient_info,
        "biomarkers": biomarkers
    }

# --- FastAPI Route ---

@app.post("/extract")
async def extract_pdf(file: UploadFile = File(...)):
    """API endpoint to receive a PDF file, extract text, and return structured data."""
    logging.info(f"Received file: {file.filename}")
    pdf_bytes = await file.read()
    
    # Log the first 500 characters of the PDF bytes for initial inspection (optional)
    # logging.info(f"First 500 bytes of PDF: {pdf_bytes[:500].decode('latin-1', errors='ignore')}")

    text = extract_text_from_pdf_bytes(pdf_bytes)

    if not text or len(text.strip()) < 50:
        logging.error("Failed to extract sufficient text from the PDF. Extracted text length: %d", len(text.strip()))
        return {"error": "Failed to extract text. The PDF might be an image, scanned, or corrupted, or OCR failed."}

    # Log the full extracted text for debugging
    logging.info("--- FULL EXTRACTED TEXT START ---")
    logging.info(text)
    logging.info("--- FULL EXTRACTED TEXT END ---")

    result = extract_info_from_text(text)

    return {
        "patientInfo": result["patient_info"],
        "biomarkers": result["biomarkers"]
    }