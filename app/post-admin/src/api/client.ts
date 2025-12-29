const API_BASE = "/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
      throw new ApiError("Unauthorized", 401);
    }

    const errorData = await response.json().catch(() => ({}));
    const message =
      (errorData as { error?: string }).error ||
      `API Error: ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return response.json();
}
