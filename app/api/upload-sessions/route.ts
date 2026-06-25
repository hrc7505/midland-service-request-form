import { NextResponse } from "next/server";

const BASE_API_URL = process.env.BASE_API_URL;

export async function POST(request: Request) {
    try {
        const response = await fetch(`${BASE_API_URL}/api/upload-sessions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[UPLOAD_SESSION_CREATE_FAILED]", response.status, errorText);
            return NextResponse.json(
                { error: errorText || "Failed to create upload session" },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("[UPLOAD_SESSION_CREATE_SUCCESS]", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("[UPLOAD_SESSION_CREATE_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
