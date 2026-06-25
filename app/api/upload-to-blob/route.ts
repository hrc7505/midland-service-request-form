import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const uploadUrl = searchParams.get("url");

        if (!uploadUrl) {
            return NextResponse.json({ error: "Missing upload URL" }, { status: 400 });
        }

        const contentType = request.headers.get("Content-Type") || "application/octet-stream";
        
        // Read raw binary body from request
        const arrayBuffer = await request.arrayBuffer();

        console.log(`[Proxy] Forwarding upload to Azure Blob. Length: ${arrayBuffer.byteLength} bytes`);

        const azureResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "x-ms-blob-type": "BlockBlob",
                "Content-Type": contentType,
            },
            body: Buffer.from(arrayBuffer),
        });

        if (!azureResponse.ok) {
            const errorText = await azureResponse.text();
            console.error("[Proxy] Azure Blob upload failed:", azureResponse.status, errorText);
            return NextResponse.json(
                { error: errorText || "Failed to upload file to storage" },
                { status: azureResponse.status }
            );
        }

        console.log("[Proxy] Azure Blob upload completed successfully.");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Proxy] Internal error in Azure Blob upload proxy:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
