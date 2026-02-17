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

export interface TourDate {
    id: number;
    date: string;
    is_active: boolean;
    created_at: string;
    tour_plan: number;
}

export interface TourDateResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: TourDate[];
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

export interface Notice {
    id: number;
    title: string;
    description: string;
    is_active: boolean;
}

export interface NoticeResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Notice[];
}

export interface TravelerDetail {
    name: string;
    email?: string;
}

export interface BookingItem {
    id: number;
    num_adults: number;
    num_children: number;
    num_infants: number;
    num_youth: number;
    num_student_eu: number;
    item_price: string;
    created_at: string;
    booking: number;
    tour_plan: number;
    time_slot: number | TourTime;
}

export interface Booking {
    id: number;
    items: BookingItem[];
    user_type: string;
    total_price: string;
    traveler_details: TravelerDetail[];
    status: string;
    cancelled_reason: string | null;
    booked_by_admin: boolean;
    created_at: string;
    updated_at: string;
    user: number | null;
    guest_user: number | null;
}

export interface BookingResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Booking[];
}

export interface ContactRequest {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: string;
    cancelled_reason: string | null;
}

export interface ContactRequestResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ContactRequest[];
}

export interface AuthUser {
    id?: string | number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    password?: string;
    role: string;
}

export interface AuthUserResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: AuthUser[];
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
 * Update an existing tour plan
 * @param token Authentication token
 * @param id Tour plan ID
 * @param data Updated tour plan data
 * @returns Updated tour plan
 */
export const updateTourPlan = async (token: string, id: string, data: Partial<TourPlan>): Promise<TourPlan> => {
    const response = await fetch(`${API_BASE_URL}/tour/plan/${id}`, {
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

    return responseData as TourPlan;
};
/**
 * Delete an existing tour plan
 * @param token Authentication token
 * @param id Tour plan ID
 */
export const deleteTourPlan = async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tour/plan/${id}`, {
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

/**
 * Get all notices
 * @param token Authentication token
 * @returns Notices response
 */
export const getNotices = async (token: string): Promise<NoticeResponse> => {
    const response = await fetch(`${API_BASE_URL}/tour/notice/`, {
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

    return responseData as NoticeResponse;
};

/**
 * Get single notice detail
 * @param token Authentication token
 * @param id Notice ID
 * @returns Notice detail
 */
export const getNoticeDetail = async (token: string, id: string): Promise<Notice> => {
    const response = await fetch(`${API_BASE_URL}/tour/notice/${id}`, {
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

    return responseData as Notice;
};

/**
 * Create a new notice
 * @param token Authentication token
 * @param data Notice data (title, description)
 * @returns Created notice details
 */
export const createNotice = async (token: string, data: { title: string, description: string }): Promise<Notice> => {
    const response = await fetch(`${API_BASE_URL}/tour/notice/`, {
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

    return responseData as Notice;
};

/**
 * Update an existing notice
 * @param token Authentication token
 * @param id Notice ID
 * @param data Updated notice data (title, description, is_active)
 * @returns Updated notice details
 */
export const updateNotice = async (token: string, id: string, data: Partial<Notice>): Promise<Notice> => {
    const response = await fetch(`${API_BASE_URL}/tour/notice/${id}`, {
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

    return responseData as Notice;
};

/**
 * Delete an existing notice
 * @param token Authentication token
 * @param id Notice ID
 */
export const deleteNotice = async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tour/notice/${id}`, {
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
 * Get bookings
 * @param token Authentication token
 * @returns Bookings response
 */
export const getBookings = async (token: string): Promise<BookingResponse> => {
    const response = await fetch(`${API_BASE_URL}/tour/booking/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as BookingResponse;
};

/**
 * Get contact requests
 * @param token Authentication token
 * @returns Contact requests response
 */
export const getContactRequests = async (token: string): Promise<ContactRequestResponse> => {
    const response = await fetch(`${API_BASE_URL}/tour/contacts/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as ContactRequestResponse;
};

/**
 * Get tour dates for a specific tour plan
 * @param tourId Tour plan ID
 * @returns Tour dates response
 */
export const getTourDates = async (tourId: string): Promise<TourDateResponse> => {
    const response = await fetch(`${API_BASE_URL}/tour/plan/date/${tourId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as TourDateResponse;
};

/**
 * Create a new booking
 * @param payload Booking payload
 * @param token Optional authentication token
 * @returns Created booking details
 */
export const createBooking = async (payload: any, token?: string): Promise<any> => {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/tour/booking/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData;
};

/**
 * Get a single booking detail
 * @param token Authentication token
 * @param id Booking ID
 * @returns Booking detail
 */
export const getBookingById = async (token: string, id: string): Promise<Booking> => {
    const response = await fetch(`${API_BASE_URL}/tour/booking/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as Booking;
};
/**
 * Update a booking status
 * @param token Authentication token
 * @param id Booking ID
 * @param data Patch data (e.g., { status: 'in_review', cancelled_reason: 'User requested' })
 * @returns Updated booking details
 */
export const updateBookingStatus = async (token: string, id: number, data: { status: string, cancelled_reason?: string | null }): Promise<Booking> => {
    const response = await fetch(`${API_BASE_URL}/tour/booking/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as Booking;
};
/**
 * Update a booking
 * @param token Authentication token
 * @param id Booking ID
 * @param data Patch data
 * @returns Updated booking details
 */
export const updateBooking = async (token: string, id: string, data: any): Promise<Booking> => {
    const response = await fetch(`${API_BASE_URL}/tour/booking/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as Booking;
};

/**
 * Update a booking item
 * @param token Authentication token
 * @param id Item ID
 * @param data Patch data
 * @returns Updated item details
 */
export const updateBookingItem = async (token: string, id: string, data: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/tour/booking/items/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData;
};
/**
 * Update a contact request status
 * @param token Authentication token
 * @param id Request ID
 * @param data Patch data (e.g., { status: 'completed', cancelled_reason: 'Resolved' })
 * @returns Updated contact request details
 */
export const updateContactRequestStatus = async (token: string, id: string | number, data: { status: string, cancelled_reason?: string | null }): Promise<ContactRequest> => {
    const response = await fetch(`${API_BASE_URL}/tour/contacts/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as ContactRequest;
};

/**
 * Get auth users
 * @param token Authentication token
 * @returns Auth users response
 */
export const getAuthUsers = async (token: string): Promise<AuthUserResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as AuthUserResponse;
};

/**
 * Create a new auth user
 * @param token Authentication token
 * @param data User data (first_name, last_name, email, phone, password, role)
 * @returns Created user details
 */
export const createAuthUser = async (token: string, data: AuthUser): Promise<AuthUser> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as AuthUser;
};

/**
 * Get a single auth user detail
 * @param token Authentication token
 * @param id User ID or email
 * @returns User details
 */
export const getAuthUserDetail = async (token: string, id: string): Promise<AuthUser> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as AuthUser;
};

/**
 * Update an existing auth user
 * @param token Authentication token
 * @param id User ID or email
 * @param data Partial user data
 * @returns Updated user details
 */
export const updateAuthUser = async (token: string, id: string, data: Partial<AuthUser>): Promise<AuthUser> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw responseData;
    }

    return responseData as AuthUser;
};

/**
 * Delete an auth user
 * @param token Authentication token
 * @param id User ID or email
 */
export const deleteAuthUser = async (token: string, id: string | number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        },
    });

    if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw responseData;
    }
};
