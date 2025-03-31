export interface LoginFormState {
    name: string;
    password: string;
}

export interface NumVerifyResponse {
    valid: boolean;
    number: string;
    local_format: string;
    international_format: string;
    country_prefix: string;
    carrier: string;
}

export class AuthResponse {
  constructor(
    public isOwner: boolean,    
    public barberId: string | null,
    public error?: string
  ) {}
}

export interface ServiceResponse {
    success: boolean;
    data?: unknown;
    error?: Error | string;
}

export interface SupabaseError {
    message: string;
    status: number;
}