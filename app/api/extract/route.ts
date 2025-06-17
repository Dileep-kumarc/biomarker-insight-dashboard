import { NextRequest, NextResponse } from 'next/server'

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

    // Use legacy build for Node.js
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js')
    pdfjsLib.GlobalWorkerOptions.workerSrc = null

    const pdf = await pdfjsLib.getDocument({ data }).promise

    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item: any) => item.str).join(' ') + '\n'
    }

    if (text.trim().length > 100) {
      return NextResponse.json({ text, method: 'pdfjs' })
    } else {
      return NextResponse.json({ text: '', method: 'ocr-needed' })
    }
  } catch (err: any) {
    console.error("PDF Extraction Error:", err)
    return NextResponse.json({ error: 'Extraction failed', details: err.message }, { status: 500 })
  }
}
