import { NextResponse } from 'next/server';

import IFormState, { IProduct } from '@/app/interfaces/IFormState';
import IServiceModel from '@/app/models/IServiceModel';

/**
 * Get Dataverse Token (cached)
 */
async function getAuthenticatedToken() {
    const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, DATAVERSE_URL } = process.env;

    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !DATAVERSE_URL) {
        throw new Error('MISSING_ENV_VARS');
    }

    const res = await fetch(
        `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                scope: `${DATAVERSE_URL}/.default`,
                grant_type: 'client_credentials',
            }),
            next: { revalidate: 3500 },
        }
    );

    if (!res.ok) {
        const errorBody = await res.json();
        console.error('[AUTH_ERROR]', errorBody);
        throw new Error('AUTH_SERVICE_UNAVAILABLE');
    }

    const { access_token } = await res.json();
    return access_token;
}

/**
 * Transform form + product → Dataverse payload
 */
function buildPayload(body: IFormState, product: IProduct): IServiceModel {
    return {
        // Common
        midland_intaketype: body.customerType,
        midland_firstname: body.firstName,
        midland_lastname: body.lastName,
        midland_email: body.email,
        midland_phone: body.phone,
        midland_serviceaddress: `${body.address1} ${body.address2 || ''}`,
        midland_city: body.city,
        midland_province: body.province,
        midland_postalcode: body.postalCode,
        midland_repname: body.midlandRepName,

        midland_projectname: body.projectName,
        midland_sitecontact: body.siteContact,
        midland_unitnumber: product.unitNumber,

        // Product-specific
        midland_appliance: product.appliance,
        midland_brand: product.brand,
        midland_modelnumber: product.modelNumber,
        midland_serialnumber: product.serialNumber,
        midland_deliverydate: product.deliveryDate,
        midland_invoicenumber: product.invoiceNumber,
        midland_applianceproblem: product.problem,
    };
}

export async function POST(request: Request) {
    try {
        const body: IFormState = await request.json();

        if (!body.products || body.products.length === 0) {
            return NextResponse.json(
                { error: 'No products provided' },
                { status: 400 }
            );
        }

        // ✅ 1. Get token ONCE
        let accessToken: string;
        try {
            accessToken = await getAuthenticatedToken();
        } catch (error) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : 'Authentication failed' },
                { status: 502 }
            );
        }

        const controller = new AbortController();
        // const timeoutId = setTimeout(() => controller.abort(), 30000);

        const results: any[] = [];

        // ✅ 2. Loop products
        for (const product of body.products) {
            const payload = buildPayload(body, product);

            try {
                const response = await fetch(
                    `${process.env.DATAVERSE_URL}/api/data/v9.2/midland_serviceintakes`,
                    {
                        method: 'POST',
                        signal: controller.signal,
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                            Prefer: 'return=representation',
                            'OData-MaxVersion': '4.0',
                            'OData-Version': '4.0',
                        },
                        body: JSON.stringify(payload),
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    console.error('[PRODUCT_FAILED]', result);
                    results.push({
                        success: false,
                        error: result,
                    });
                } else {
                    results.push({
                        success: true,
                        caseId: result.incidentid,
                        ticketNumber: result.ticketnumber,
                    });
                }
            } catch (err) {
                results.push({
                    success: false,
                    error: 'Request failed',
                });
            }
        }

        //clearTimeout(timeoutId);

        // ✅ 3. Final response
        return NextResponse.json({
            success: true,
            total: results.length,
            results,
        });

    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json(
                { error: 'Request timed out' },
                { status: 504 }
            );
        }

        console.error('[CRITICAL_INTERNAL_ERROR]', error);

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}