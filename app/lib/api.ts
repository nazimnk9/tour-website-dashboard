const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface LoginResponse {
    refresh: string;
    access: string;
}

export interface ApiErrorResponse {
    detail?: string[];
    email?: string[];
    password?: string[];
    [key: string]: string[] | undefined;
}

/**
 * Handle API login for admin
 * @param data Login credentials
 * @returns Response data or throws error
 */
export const loginAdmin = async (data: Record<string, string>): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/token/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData as ApiErrorResponse;
    }

    return responseData as LoginResponse;
};
