import { store } from "./index";
import { addNotification, setGlobalError } from "./notificationSlice";

const originalConsoleError = console.error;

let isIntercepting = false;

export function initConsoleInterceptor() {
  if (isIntercepting) return;
  isIntercepting = true;

  console.error = (...args: unknown[]) => {
    originalConsoleError.apply(console, args);

    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
      )
      .join(" ");

    store.dispatch(addNotification({ message, type: "error" }));
    store.dispatch(setGlobalError(message));
  };
}

export function restoreConsole() {
  if (!isIntercepting) return;
  console.error = originalConsoleError;
  isIntercepting = false;
}

if (typeof window !== "undefined") {
  setTimeout(() => {
    initConsoleInterceptor();
  }, 0);
}
