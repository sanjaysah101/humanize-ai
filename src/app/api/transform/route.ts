import { NextRequest, NextResponse } from 'next/server';
import { transformText } from '@/app/actions/transform';
import { TransformationOptions } from '@/core/entities/transformation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, options } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid text input' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    const result = await transformText(text, options as TransformationOptions);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
