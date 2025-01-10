import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imagePath, base64Image } = await req.json();

    // Convert base64 to blob
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create FormData and append file and folder
    const formData = new FormData();
    formData.append('files', new Blob([buffer], { type: 'image/png' }), imagePath);
    formData.append('folder', 'campaigns');

    const response = await fetch(`${process.env.API_URL}/media/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to upload media. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Something went wrong', details: (error as Error).message },
      { status: 500 }
    );
  }
}
