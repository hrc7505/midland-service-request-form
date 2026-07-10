import { NextResponse } from "next/server";

import serverRequest from "@/app/utils/serverRequest";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const res = await serverRequest("/api/service-requests", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            console.error("[SERVICE_REQUEST_SUBMIT_FAILED]", res.status, res.errorText);
            return NextResponse.json(
                { error: res.errorText || "Failed to submit service request" },
                { status: res.status }
            );
        }

        return NextResponse.json(res.data);
    } catch (error) {
        console.error("[SERVICE_REQUEST_SUBMIT_ERROR]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
