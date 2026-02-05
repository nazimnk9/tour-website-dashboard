import { configureStore } from '@reduxjs/toolkit'
import tourDateReducer from './tour-date-slice'

export const store = configureStore({
    reducer: {
        tourDate: tourDateReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
