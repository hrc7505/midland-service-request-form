import { NextResponse } from "next/server";

import serverRequest from "@/app/utils/serverRequest";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ uploadSessionId: string; fileId: string }> }
) {
    try {
        const { uploadSessionId, fileId } = await params;

        const res = await serverRequest(`/api/upload-sessions/${uploadSessionId}/files/${fileId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            console.error("[UPLOAD_FILE_DELETE_FAILED]", res.status, res.errorText);
            return NextResponse.json(
                { error: res.errorText || "Failed to delete file from upload session" },
                { status: res.status }
            );
        }

        return NextResponse.json(res.data);
    } catch (error) {
        console.error("[UPLOAD_FILE_DELETE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
