import { NextRequest, NextResponse } from "next/server";

import { transformText } from "@/app/actions/transform";
import { TransformationOptions } from "@/core/entities/transformation";
import { TEXT_VALIDATION, validateTransformText } from "@/utils/validation";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { text, options } = body;

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 });
    }

    const validation = validateTransformText(text);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (text.length > TEXT_VALIDATION.MAX_CHARS) {
      return NextResponse.json(
        { error: `Text too long. Maximum ${TEXT_VALIDATION.MAX_CHARS} characters allowed.` },
        { status: 400 }
      );
    }

    const result = await transformText(text, options as TransformationOptions);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
