import { NextResponse } from "next/server";

import serverRequest from "@/app/utils/serverRequest";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ uploadSessionId: string; fileId: string }> }
) {
    try {
        const { uploadSessionId, fileId } = await params;
        const body = await request.json().catch(() => ({}));

        const res = await serverRequest(`/api/upload-sessions/${uploadSessionId}/files/${fileId}/complete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            console.error("[UPLOAD_FILE_COMPLETE_FAILED]", res.status, res.errorText);
            return NextResponse.json(
                { error: res.errorText || "Failed to complete upload session file" },
                { status: res.status }
            );
        }

        return NextResponse.json(res.data);
    } catch (error) {
        console.error("[UPLOAD_FILE_COMPLETE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
