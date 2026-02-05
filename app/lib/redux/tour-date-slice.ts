import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getCookie } from '@/app/lib/cookies'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface DateResult {
    id: number
    date: string
    is_active: boolean
    created_at: string
    tour_plan: number
    times?: any[]
}

export interface DateResponse {
    count: number
    next: string | null
    previous: string | null
    results: DateResult[]
}

interface TourDateState {
    dates: DateResult[]
    isLoading: boolean
    error: any | null
    success: boolean
}

const initialState: TourDateState = {
    dates: [],
    isLoading: false,
    error: null,
    success: false,
}

export const fetchTourDates = createAsyncThunk(
    'tourDate/fetchTourDates',
    async (tourId: number, { rejectWithValue }) => {
        try {
            const token = getCookie('access_token')
            const response = await fetch(`${API_BASE_URL}/tour/plan/date/${tourId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            const data = await response.json()
            if (!response.ok) return rejectWithValue(data)
            return data as DateResponse
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

export const addTourDate = createAsyncThunk(
    'tourDate/addTourDate',
    async ({ date, tour_id }: { date: string; tour_id: number }, { rejectWithValue, dispatch }) => {
        try {
            const token = getCookie('access_token')
            const response = await fetch(`${API_BASE_URL}/tour/plan/date/${tour_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ date, tour_id }),
            })
            const data = await response.json()
            if (!response.ok) return rejectWithValue(data)

            // Update data without loading page
            dispatch(fetchTourDates(tour_id))
            return data
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

export const deleteTourDate = createAsyncThunk(
    'tourDate/deleteTourDate',
    async ({ tourId, dateId }: { tourId: number; dateId: number }, { rejectWithValue, dispatch }) => {
        try {
            const token = getCookie('access_token')
            const response = await fetch(`${API_BASE_URL}/tour/plan/date/${tourId}/${dateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            if (!response.ok) {
                const data = await response.json()
                return rejectWithValue(data)
            }

            // Update data without loading page
            dispatch(fetchTourDates(tourId))
            return dateId
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

const tourDateSlice = createSlice({
    name: 'tourDate',
    initialState,
    reducers: {
        resetStatus: (state) => {
            state.success = false
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchTourDates.pending, (state) => {
                state.isLoading = true
            })
            .addCase(fetchTourDates.fulfilled, (state, action: PayloadAction<DateResponse>) => {
                state.isLoading = false
                state.dates = action.payload.results
            })
            .addCase(fetchTourDates.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Add
            .addCase(addTourDate.pending, (state) => {
                state.isLoading = true
                state.success = false
                state.error = null
            })
            .addCase(addTourDate.fulfilled, (state) => {
                state.isLoading = false
                state.success = true
            })
            .addCase(addTourDate.rejected, (state, action) => {
                state.isLoading = false
                state.success = false
                state.error = action.payload
            })
            // Delete
            .addCase(deleteTourDate.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(deleteTourDate.fulfilled, (state) => {
                state.isLoading = false
            })
            .addCase(deleteTourDate.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
    },
})

export const { resetStatus } = tourDateSlice.actions
export default tourDateSlice.reducer
