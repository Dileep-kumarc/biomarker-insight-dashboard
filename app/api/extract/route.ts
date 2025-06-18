import { NextRequest, NextResponse } from 'next/server'
import * as pdfjsLib from 'pdfjs-dist'

// Set the workerSrc to ensure it works correctly in the Vercel environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)

    const pdf = await pdfjsLib.getDocument({ data }).promise

    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      // Type guard to ensure item has 'str' property
      text += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n'
    }

    if (text.trim().length > 100) {
      return NextResponse.json({ text, method: 'pdfjs' })
    } else {
      return NextResponse.json({ text: '', method: 'ocr-needed' })
    }
  } catch (err) {
    console.error("PDF Extraction Error:", err)
    // Proper error handling
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
    return NextResponse.json({ error: 'Extraction failed', details: errorMessage }, { status: 500 })
  }
}
