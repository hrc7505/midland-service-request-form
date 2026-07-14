export interface ServerResponse<T> {
    ok: boolean;
    status: number;
    data: T;
    errorText?: string;
}

/**
 * Common server-side fetch wrapper for backend proxies.
 * Handles URL prepending, timeouts, and safe response parsing.
 */
export default async function serverRequest<T = unknown>(
    path: string,
    options: RequestInit = {},
    timeoutMs = 120000
): Promise<ServerResponse<T>> {
    const baseUrl = process.env.BASE_API_URL;
    const url = `${baseUrl}${path}`;

    try {
        const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(timeoutMs),
        });

        const text = await response.text();
        let data = {} as T;
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text } as unknown as T;
            }
        }

        let errorText: string | undefined = undefined;
        if (!response.ok) {
            console.error(`[Upstream API Error] ${options.method || "GET"} ${url} failed with status ${response.status}. Full response:`, data, "\nRaw text:", text);
            if (data && typeof data === "object" && "error" in data) {
                errorText = String((data as Record<string, unknown>).error);
            } else if (data && typeof data === "object" && "message" in data) {
                errorText = String((data as Record<string, unknown>).message);
            } else {
                errorText = text || "Upstream request failed";
            }
        }

        return {
            ok: response.ok,
            status: response.status,
            data,
            errorText,
        };
    } catch (error) {
        console.error(`[Server Request Error] ${options.method || "GET"} ${path} failed:`, error);
        return {
            ok: false,
            status: 500,
            data: {} as T,
            errorText: error instanceof Error ? error.message : "Internal Server Error",
        };
    }
}
