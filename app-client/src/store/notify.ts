import { store } from "./index";
import { addNotification } from "./notificationSlice";

const notify = {
    success: (message: string) =>
        store.dispatch(addNotification({ message, type: "success" })),

    error: (message: string) =>
        store.dispatch(addNotification({ message, type: "error" })),

    info: (message: string) =>
        store.dispatch(addNotification({ message, type: "info" })),

    warning: (message: string) =>
        store.dispatch(addNotification({ message, type: "warning" })),
};

export default notify;
