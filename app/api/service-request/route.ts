// app/api/service-request/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // 1. Get Access Token (Server-to-Server)
        const tokenResponse = await fetch(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.CLIENT_ID!,
                client_secret: process.env.CLIENT_SECRET!,
                scope: `${process.env.DATAVERSE_URL}/.default`,
                grant_type: 'client_credentials',
            }),
        });

        const { access_token } = await tokenResponse.json();

        // 2. Post to Dataverse (Midland Beta Table)
        const dvResponse = await fetch(`${process.env.DATAVERSE_URL}/api/data/v9.2/cr3e9_midlandbetas`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
            },
            body: JSON.stringify({
                cr3e9_firstname: data.firstName,
                cr3e9_lastname: data.lastName,
                cr3e9_email: data.email,
                cr3e9_customertype: data.customerType, // e.g., 526300001
            }),
        });

        const result = await dvResponse.json();
        return NextResponse.json({ success: true, id: result.cr3e9_midlandbetaid });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Submission failed' }, { status: 500 });
    }
}