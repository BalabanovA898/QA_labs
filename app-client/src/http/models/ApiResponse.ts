type Error = {
    code: string;
    message: string;
};

export type ApiResponse<T> = {
    data?: T;
    success?: boolean;
    error: Error;
};

export type Message = {
    message: string;
};
