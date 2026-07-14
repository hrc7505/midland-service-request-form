export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
}

/**
 * Common API request helper that handles body JSON serialization, Content-Type
 * headers, response parsing, and unified error handling.
 */
export default async function apiRequest<T = unknown>(
    url: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { headers, body, ...restOptions } = options;
    const requestHeaders = new Headers(headers);

    let finalBody: BodyInit | null | undefined = undefined;

    if (body !== undefined && body !== null) {
        if (body instanceof File || body instanceof Blob || body instanceof FormData) {
            finalBody = body;
            // Let the browser set the boundary header if it's FormData.
            // Otherwise, set Content-Type based on the File/Blob type.
            if (!requestHeaders.has("Content-Type") && !(body instanceof FormData)) {
                requestHeaders.set("Content-Type", body.type || "application/octet-stream");
            }
        } else if (typeof body === "object") {
            finalBody = JSON.stringify(body);
            if (!requestHeaders.has("Content-Type")) {
                requestHeaders.set("Content-Type", "application/json");
            }
        } else if (typeof body === "string") {
            finalBody = body;
        } else {
            finalBody = String(body);
        }
    }

    const response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        body: finalBody,
    });

    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let originalError: unknown = null;
        try {
            const errorText = await response.text();
            if (errorText) {
                originalError = errorText;
                try {
                    const parsed = JSON.parse(errorText);
                    originalError = parsed;
                    errorMessage = parsed.error || parsed.message || errorText;
                } catch {
                    errorMessage = errorText;
                }
            }
        } catch {
            // Ignore parse errors, use default message
        }
        console.error(`[API Error] ${options.method || "GET"} ${url} failed:`, response.status, errorMessage, "\nOriginal Error:", originalError);
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        try {
            return await response.json();
        } catch {
            return null as T;
        }
    }

    const text = await response.text();
    return text as T;
}
