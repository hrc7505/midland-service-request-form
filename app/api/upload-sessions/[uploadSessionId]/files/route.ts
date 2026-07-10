import { NextResponse } from "next/server";

import serverRequest from "@/app/utils/serverRequest";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ uploadSessionId: string }> }
) {
    try {
        const { uploadSessionId } = await params;
        const body = await request.json();

        const res = await serverRequest(`/api/upload-sessions/${uploadSessionId}/files`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            console.error("[UPLOAD_FILE_CREATE_FAILED]", res.status, res.errorText);
            return NextResponse.json(
                { error: res.errorText || "Failed to register file in upload session" },
                { status: res.status }
            );
        }

        // Redact UploadUrl from success logs to avoid exposing Azure SAS credentials
        const data = res.data;
        const logData = typeof data === "object" && data !== null ? { ...data } as Record<string, unknown> : { data } as Record<string, unknown>;
        if (logData && "UploadUrl" in logData) {
            logData.UploadUrl = "[REDACTED]";
        }
        console.log("[UPLOAD_FILE_CREATE_SUCCESS]", logData);

        return NextResponse.json(data);
    } catch (error) {
        console.error("[UPLOAD_FILE_CREATE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
