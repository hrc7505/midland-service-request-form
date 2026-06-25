import { NextResponse } from "next/server";

const BASE_API_URL = process.env.BASE_API_URL;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${BASE_API_URL}/api/service-requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[SERVICE_REQUEST_SUBMIT_FAILED]", response.status, errorText);
            return NextResponse.json(
                { error: errorText || "Failed to submit service request" },
                { status: response.status }
            );
        }

        const text = await response.text();
        let data = {};
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text };
            }
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error("[SERVICE_REQUEST_SUBMIT_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
