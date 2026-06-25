import { NextResponse } from "next/server";

const BASE_API_URL = process.env.BASE_API_URL;

export async function POST(
    request: Request,
    { params }: { params: Promise<{ uploadSessionId: string; fileId: string }> }
) {
    try {
        const { uploadSessionId, fileId } = await params;

        const response = await fetch(`${BASE_API_URL}/api/upload-sessions/${uploadSessionId}/files/${fileId}/complete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[UPLOAD_FILE_COMPLETE_FAILED]", response.status, errorText);
            return NextResponse.json(
                { error: errorText || "Failed to complete upload session file" },
                { status: response.status }
            );
        }

        let data = {};
        const text = await response.text();
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text };
            }
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error("[UPLOAD_FILE_COMPLETE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
