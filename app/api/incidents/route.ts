import { NextResponse } from "next/server";

import IFormState, { IProduct } from "@/app/interfaces/IFormState";
import IServiceModel from "@/app/models/IServiceModel";

/**
 * Get Dataverse Token (cached)
 */
async function getAuthenticatedToken() {
    const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, DATAVERSE_URL } = process.env;

    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !DATAVERSE_URL) {
        throw new Error("MISSING_ENV_VARS");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch(
            `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                signal: controller.signal,
                body: new URLSearchParams({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    scope: `${DATAVERSE_URL}/.default`,
                    grant_type: "client_credentials",
                }),
                next: { revalidate: 3500 },
            }
        );

        if (!res.ok) {
            const errorBody = await res.json();
            console.error("[AUTH_ERROR]", errorBody);
            throw new Error("AUTH_SERVICE_UNAVAILABLE");
        }

        const { access_token } = await res.json();
        return access_token;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Transform form + product → Dataverse payload
 */
function buildPayload(body: IFormState, product: IProduct): IServiceModel {
    let mappedProvince: string | number | undefined = body.province;
    if (typeof mappedProvince === "string") {
        const lowerProv = mappedProvince.trim().toLowerCase();
        if (lowerProv === "bc" || lowerProv === "british columbia") {
            mappedProvince = "132190001"; // Send as integer to Dataverse
        }
    }

    return {
        // Common
        midland_intaketype: body.customerType,
        midland_firstname: body.firstName,
        midland_lastname: body.lastName,
        midland_email: body.email,
        midland_phone: body.phone,
        midland_serviceaddress: `${body.address1} ${body.address2 || ""}`,
        midland_city: body.city,
        midland_province: mappedProvince,
        midland_postalcode: body.postalCode,
        midland_repname: body.midlandRepName,
        midland_accountnumber: body.midlandAccount,

        midland_projectname: body.projectName,
        midland_sitecontact: body.siteContact,
        midland_sitecontact_phonenumber: body.siteContactPhone,
        midland_sitecontact_email: body.siteContactEmail,
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
                { error: "No products provided" },
                { status: 400 }
            );
        }

        // ✅ 1. Get token ONCE
        let accessToken: string;
        try {
            accessToken = await getAuthenticatedToken();
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                return NextResponse.json(
                    { error: "Authentication request timed out" },
                    { status: 504 }
                );
            }

            return NextResponse.json(
                { error: error instanceof Error ? error.message : "Authentication failed" },
                { status: 502 }
            );
        }

        const results: { success: boolean, [key: string]: unknown }[] = [];

        // ✅ 2. Loop products
        for (const product of body.products) {
            const payload = buildPayload(body, product);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            try {
                const response = await fetch(
                    `${process.env.DATAVERSE_URL}/api/data/v9.2/midland_serviceintakes`,
                    {
                        method: "POST",
                        signal: controller.signal,
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                            Prefer: "return=representation",
                            "OData-MaxVersion": "4.0",
                            "OData-Version": "4.0",
                        },
                        body: JSON.stringify(payload),
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    console.error("[PRODUCT_FAILED]", result);
                    results.push({
                        success: false,
                        error: result,
                    });
                } else {
                    console.log("[PRODUCT_SUCCESS]", product.appliance, result);
                    results.push({
                        success: true,
                        caseId: result.incidentid,
                        ticketNumber: result.ticketnumber,
                    });
                }
            } catch (err) {
                console.error("[PRODUCT_REQUEST_ERROR]", err);
                results.push({
                    success: false,
                    error: "Request failed",
                });
            } finally {
                clearTimeout(timeoutId);
            }
        }

        const overallSuccess = results.every(r => r.success);

        // ✅ 3. Final response
        return NextResponse.json({
            success: overallSuccess,
            total: results.length,
            results,
        }, {
            status: overallSuccess ? 200 : 500,
        });

    } catch (error) {
        console.error("[CRITICAL_INTERNAL_ERROR]", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}