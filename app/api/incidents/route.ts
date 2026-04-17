import { NextResponse } from 'next/server';

import IFormState from '@/app/interfaces/IFormState';
import IServiceModel from '@/app/models/IServiceModel';

/**
 * Centralized Auth Utility with Error Boundary
 * @returns access_token
 */
async function getAuthenticatedToken() {
    const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, DATAVERSE_URL } = process.env;

    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !DATAVERSE_URL) {
        throw new Error('MISSING_ENV_VARS');
    }

    try {
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
                next: { revalidate: 3500 } // Cache token for ~1 hour (standard MS expiry)
            }
        );

        if (!res.ok) {
            const errorBody = await res.json();
            console.error('[AUTH_ERROR]', errorBody);
            throw new Error('AUTH_SERVICE_UNAVAILABLE');
        }

        const { access_token } = await res.json();

        return access_token;
    } catch (error) {
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const body: IFormState = await request.json();

        // 1. Validation check matching YOUR IFormState properties
        // Note: I added email and phone as they are marked 'required' in your UI screenshots
        if (!body.brand || !body.problem || !body.lastName || !body.email || !body.phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Acquire Token
        let accessToken: string;
        try {
            accessToken = await getAuthenticatedToken();
        } catch (authError) {
            return NextResponse.json({ error: authError instanceof Error ? authError.message : 'Authentication Gateway Error' }, { status: 502 });
        }

        const newPayload: IServiceModel = {
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
            midland_unitnumber: body.unitNumber,

            midland_appliance: body.appliance,
            midland_brand: body.brand,
            midland_modelnumber: body.modelNumber,
            midland_serialnumber: body.serialNumber,
            midland_deliverydate: body.deliveryDate,
            midland_invoicenumber: body.invoiceNumber,
            midland_applianceproblem: body.problem,
           // midland_ReviewNotes: body.additionalNotes,
        };

        console.log(newPayload);

        // 3. Construct Dataverse Payload
        const incidentPayload = {
            "title": `Web Request: ${body.brand} - ${body.lastName}`.substring(0, 200),
            "description": `Problem: ${body.problem}\nSerial: ${body.serialNumber || 'N/A'}\nNotes: ${body.additionalNotes || 'N/A'}`,
            "caseorigincode": 1, // Web origin

            // Address Info
            "address1_line1": body.address1,
            "address1_city": body.city,
            "address1_stateorprovince": body.province,
            "address1_postalcode": body.postalCode,
            "address1_telephone1": body.phone,

            // Bind to Guest Customer (Contact)
            "customerid_contact@odata.bind": `/contacts(${process.env.GUEST_CONTACT_GUID})`,
        };

        // 4. Submit to Dataverse with Timeout Protection
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const dvResponse = await fetch(`${process.env.DATAVERSE_URL}/api/data/v9.2/midland_serviceintakes`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
            },
            body: JSON.stringify(newPayload/* {
                "title": "API test case",
                "customerid_account@odata.bind": "/accounts(6594655a-e931-f111-88b3-70a8a50fd20f)",
                "midland_brand": "Whirlpool",
                "midland_modelnumber": "TEST123",
                "midland_serialnumber": "SER123",
                "midland_problemdescription": "Created from API"
            } */),
        });

        clearTimeout(timeoutId);

        const result = await dvResponse.json();

        if (!dvResponse.ok) {
            console.error('[DATAVERSE_API_REJECTION]', result);
            // Check for specific Dataverse errors like missing Lookups
            if (dvResponse.status === 400) {
                return NextResponse.json({ error: 'Data validation failed in CRM.' }, { status: 400 });
            }
            return NextResponse.json({ error: 'CRM Service currently unavailable' }, { status: 503 });
        }

        // 5. Success Response
        return NextResponse.json({
            result,
            success: true,
            caseId: result.incidentid,
            ticketNumber: result.ticketnumber
        });

    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json({ error: 'Database request timed out' }, { status: 504 });
        }

        console.error('[CRITICAL_INTERNAL_ERROR]', error);

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}