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

export interface TourTime {
    id: number;
    tour_date: {
        id: number;
        date: string;
        is_active: boolean;
        created_at: string;
        tour_plan: number;
    };
    start_time: string;
    end_time: string | null;
    available_adults: number;
    available_children: number;
    available_infants: number;
    available_youth: number;
    available_student_eu: number;
    is_active: boolean;
    created_at: string;
}

export interface TourTimeResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: TourTime[];
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
    image_ids?: number[];
    location_ids?: number[];
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
/**
 * Create a new tour plan
 * @param token Authentication token
 * @param data Tour plan data
 * @returns Created tour plan
 */
export const createTourPlan = async (token: string, data: Partial<TourPlan>): Promise<TourPlan> => {
    const response = await fetch(`${API_BASE_URL}/tour/plan/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as TourPlan;
};
/**
 * Upload a tour image
 * @param token Authentication token
 * @param file Image file to upload
 * @returns Uploaded image details
 */
export const uploadTourImage = async (token: string, file: File): Promise<TourImage> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/tour/image/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as TourImage;
};

/**
 * Delete a tour image
 * @param token Authentication token
 * @param id Image ID to delete
 */
export const deleteTourImage = async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tour/image/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw responseData;
    }
};

/**
 * Create a new tour location
 * @param token Authentication token
 * @param data Location data (name, description)
 * @returns Created location details
 */
export const createTourLocation = async (token: string, data: { name: string, description: string }): Promise<TourLocation> => {
    const response = await fetch(`${API_BASE_URL}/tour/location/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as TourLocation;
};

/**
 * Update a tour location
 * @param token Authentication token
 * @param id Location ID to update
 * @param data Updated location data
 * @returns Updated location details
 */
export const updateTourLocation = async (token: string, id: number, data: { name: string, description: string }): Promise<TourLocation> => {
    const response = await fetch(`${API_BASE_URL}/tour/location/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as TourLocation;
};

/**
 * Delete a tour location
 * @param token Authentication token
 * @param id Location ID to delete
 */
export const deleteTourLocation = async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tour/location/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw responseData;
    }
};

/**
 * Get tour times for a specific tour date
 * @param token Authentication token
 * @param tourDateId Tour date ID
 * @returns Tour times response
 */
export const getTourTimes = async (token: string, tourDateId: string): Promise<TourTimeResponse> => {
    const response = await fetch(`${API_BASE_URL}/tour/plan/date/time/${tourDateId}`, {
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

    return responseData as TourTimeResponse;
};

/**
 * Create a new tour time slot
 * @param token Authentication token
 * @param tourDateId Tour date ID
 * @param data Tour time data
 * @returns Created tour time
 */
export const createTourTime = async (token: string, tourDateId: string, data: any): Promise<TourTime> => {
    const response = await fetch(`${API_BASE_URL}/tour/plan/date/time/${tourDateId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as TourTime;
};

/**
 * Update an existing tour time slot
 * @param token Authentication token
 * @param tourDateId Tour date ID
 * @param timeId Time slot ID
 * @param data Updated tour time data
 * @returns Updated tour time
 */
export const updateTourTime = async (token: string, tourDateId: string, timeId: string, data: any): Promise<TourTime> => {
    const response = await fetch(`${API_BASE_URL}/tour/plan/date/time/${tourDateId}/${timeId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as TourTime;
};

/**
 * Delete a tour time slot
 * @param token Authentication token
 * @param tourDateId Tour date ID
 * @param timeId Time slot ID
 */
export const deleteTourTime = async (token: string, tourDateId: string, timeId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tour/plan/date/time/${tourDateId}/${timeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw responseData;
    }
};
