import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    timestamp: number;
}

interface NotificationState {
    notifications: Notification[];
    globalError: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    globalError: null,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addNotification: (
            state,
            action: PayloadAction<Omit<Notification, "id" | "timestamp">>,
        ) => {
            const notification: Notification = {
                ...action.payload,
                id: Math.random().toString(36).substring(2, 9),
                timestamp: Date.now(),
            };
            state.notifications.push(notification);
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                (n) => n.id !== action.payload,
            );
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        setGlobalError: (state, action: PayloadAction<string | null>) => {
            state.globalError = action.payload;
        },
        clearGlobalError: (state) => {
            state.globalError = null;
        },
    },
});

export const {
    addNotification,
    removeNotification,
    clearNotifications,
    setGlobalError,
    clearGlobalError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
