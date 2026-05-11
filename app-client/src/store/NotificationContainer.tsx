import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { removeNotification } from "./notificationSlice";
import "./NotificationContainer.css";

export const NotificationContainer = () => {
    const dispatch = useAppDispatch();
    const { notifications } = useAppSelector((state) => state.notifications);

    useEffect(() => {
        // Auto-remove notifications after 5 seconds
        const timers = notifications.map((notification) => {
            return setTimeout(() => {
                dispatch(removeNotification(notification.id));
            }, 5000);
        });

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [notifications, dispatch]);

    const handleClose = (id: string) => {
        dispatch(removeNotification(id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="notification-container">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`notification notification-${notification.type}`}
                    onClick={() => handleClose(notification.id)}
                >
                    <span className="notification-icon">
                        {notification.type === "success" && "✓"}
                        {notification.type === "error" && "✕"}
                        {notification.type === "warning" && "⚠"}
                        {notification.type === "info" && "ℹ"}
                    </span>
                    <span className="notification-message">
                        {notification.message}
                    </span>
                    <button
                        className="notification-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose(notification.id);
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};
