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

export interface TourLocation {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

export interface TourImage {
    id: number;
    file: string;
    status: string;
}

export interface TourPlan {
    id: number;
    locations: TourLocation[];
    images: TourImage[];
    title: string;
    description: string;
    max_adults: number;
    price_adult: string;
    adult_age_min: number;
    adult_age_max: number;
    max_children: number;
    price_child: string;
    child_age_min: number;
    child_age_max: number;
    max_infants: number;
    price_infant: string;
    infant_age_min: number;
    infant_age_max: number;
    max_youth: number;
    price_youth: string;
    youth_age_min: number;
    youth_age_max: number;
    max_student_eu: number;
    price_student_eu: string;
    student_eu_age_min: number;
    student_eu_age_max: number;
    free_cancellation: boolean;
    pickup_included: boolean;
    highlights: string[];
    full_description: string | null;
    includes: string[];
    excludes: string[];
    not_suitable_for: string[];
    not_allowed: string[];
    know_before_you_go: string[];
    duration_days: number | null;
    status: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TourPlanResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: TourPlan[];
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

/**
 * Get tour plans
 * @param token Authentication token
 * @returns Tour plans response
 */
export const getTourPlans = async (token: string): Promise<TourPlanResponse> => {
    const response = await fetch(`${API_BASE_URL}/tour/plan/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as TourPlanResponse;
};

/**
 * Get a single tour plan detail
 * @param token Authentication token
 * @param id Tour plan ID
 * @returns Tour plan detail
 */
export const getTourPlanDetail = async (token: string, id: string): Promise<TourPlan> => {
    const response = await fetch(`${API_BASE_URL}/tour/plan/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as TourPlan;
};
