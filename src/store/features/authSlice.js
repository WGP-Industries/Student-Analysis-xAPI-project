import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isLoggedIn: false,
    isLoading: true,
    enrollments: [],
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login(state, action) {
            state.user = action.payload;
            state.isLoggedIn = true;
        },
        logout(state) {
            state.user = null;
            state.isLoggedIn = false;
            state.enrollments = [];
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setEnrollments(state, action) {
            state.enrollments = action.payload;
        },
        upsertEnrollment(state, action) {
            const incoming = action.payload;
            const idx = state.enrollments.findIndex(
                (e) => e.course?.courseCode === incoming.course?.courseCode
            );
            if (idx >= 0) {
                state.enrollments[idx] = incoming;
            } else {
                state.enrollments.push(incoming);
            }
        },
    },
});

export const { login, logout, setLoading, setEnrollments, upsertEnrollment } = authSlice.actions;

// Selectors
export const selectIsAdmin = (state) => state.auth.user?.role === "admin";

export default authSlice.reducer;