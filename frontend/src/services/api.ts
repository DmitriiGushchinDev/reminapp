export const API_BASE_URL = 'https://calendia-remind.onrender.com/api';
//  'http://localhost:8000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithErrorHandling(url: string, options?: RequestInit & { token?: string }) {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    // Add Authorization header if token is provided
    if (options?.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${options.token}`;
    }

    const { token, ...fetchOptions } = options || {};
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers,
      ...fetchOptions,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error occurred');
  }
}

export const api = {
  // Helper for handling API errors
  handleError: (error: unknown) => {
    if (error instanceof ApiError) {
      return { error: error.message, status: error.status };
    }
    return { error: 'Unknown error occurred', status: 500 };
  }
};

export { ApiError, fetchWithErrorHandling };