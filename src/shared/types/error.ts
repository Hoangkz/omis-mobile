// GET API error response
export interface ApiErrorResponse {
  message: string;
  status: number;
}

// POST/PUT API validation error
export interface ValidationError {
  property: string;
  value?: string | number | boolean | null;
  target?: Record<string, unknown>;
  children?: ValidationError[];
  constraints?: Record<string, string>;
}

export interface ValidationErrorResponse {
  status: number;
  message: string;
  path: string;
  timestamp: string;
  errors: ValidationError[];
}

export interface ApiError {
  response?: {
    data: ApiErrorResponse | ValidationErrorResponse;
    status: number;
    statusText: string;
  };
  message: string;
  name: string;
}
