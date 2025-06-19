// Path: app/api/extract/route.ts

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const uploadedFile = formData.get('file');

    if (!uploadedFile || !(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded or invalid file format' },
        { status: 400 }
      );
    }

    if (!uploadedFile.type.includes('pdf')) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Please upload a PDF file.',
          details: `Received file type: ${uploadedFile.type}`
        },
        { status: 400 }
      );
    }

    const railwayUrl = 'https://passionate-eagerness-production-3c4a.up.railway.app/extract';
    const forwardFormData = new FormData();
    forwardFormData.append('file', uploadedFile);

    try {      const response = await fetch(railwayUrl, {
        method: 'POST',
        body: forwardFormData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('Railway response:', responseText);

      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { 
          status: response.ok ? 200 : 502,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch {
        console.error('Failed to parse Railway response:', responseText);
        return NextResponse.json(
          {
            error: 'Invalid response from processing service',
            details: responseText.substring(0, 200)
          },
          { 
            status: 502,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (networkError) {
      console.error('Network error:', networkError);
      return NextResponse.json(
        {
          error: 'Failed to reach processing service',
          details: networkError instanceof Error ? networkError.message : 'Unknown error'
        },
        { 
          status: 503,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (_error) {
    console.error('Upload handler error:', _error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: _error instanceof Error ? _error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
