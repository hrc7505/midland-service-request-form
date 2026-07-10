import { NextResponse } from "next/server";

import serverRequest from "@/app/utils/serverRequest";

export async function POST() {
    try {
        const res = await serverRequest("/api/upload-sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            console.error("[UPLOAD_SESSION_CREATE_FAILED]", res.status, res.errorText);
            return NextResponse.json(
                { error: res.errorText || "Failed to create upload session" },
                { status: res.status }
            );
        }

        console.log("[UPLOAD_SESSION_CREATE_SUCCESS]", res.data);
        return NextResponse.json(res.data);
    } catch (error) {
        console.error("[UPLOAD_SESSION_CREATE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
