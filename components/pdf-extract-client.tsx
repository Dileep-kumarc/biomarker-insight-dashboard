"use client";
import { useEffect } from "react";
// @ts-expect-error - pdfjs-dist types are not properly resolved
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
// @ts-expect-error - pdfjs-dist types are not properly resolved
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

export default function PdfExtractClient({ file, onExtracted }: { file: File, onExtracted: (text: string) => void }) {
  useEffect(() => {
    let didFinish = false;
    const timer = setTimeout(() => {
      if (!didFinish) {
        didFinish = true;
        onExtracted("[ERROR] PDF extraction timed out. Please try a different file or check the PDF format.");
      }
    }, 30000); // 30 seconds timeout

    async function extract() {
      try {
        GlobalWorkerOptions.workerSrc = pdfjsWorker;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: { str: string }) => item.str).join(" ");
          fullText += pageText + "\n";
        }
        if (!didFinish) {
          didFinish = true;
          clearTimeout(timer);
          onExtracted(fullText || "[ERROR] No text could be extracted from this PDF. Try a different file.");
        }
      } catch (e) {
        if (!didFinish) {
          didFinish = true;
          clearTimeout(timer);
          onExtracted("[ERROR] PDF extraction failed. " + (e instanceof Error ? e.message : "Unknown error."));
        }
      }
    }
    extract();
    return () => {
      clearTimeout(timer);
      didFinish = true;
    };
  }, [file, onExtracted]);
  return null;
} 