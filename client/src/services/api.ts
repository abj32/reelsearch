const API_BASE = '/api';

// Network failures reach callers as plain Errors, so status and code are optional.
export type ApiError = Error & { status?: number; code?: string; body?: unknown };

type LoadingListener = (isLoading: boolean) => void;

type RequestOptions = RequestInit & {
  useGlobalLoading?: boolean;
  headers?: Record<string, string>;
};

let pendingGlobalLoadingRequests = 0;  // count of active "global loading" requests
const loadingListeners = new Set<LoadingListener>(); // set of subscribed listeners

// Notify all listeners of current loading state
function notifyLoadingListeners() {
  const isLoading = pendingGlobalLoadingRequests > 0;
  loadingListeners.forEach((listener) => listener(isLoading));
}

// Adds loading listener and intializes listener with current loading state
export function subscribeToApiLoading(listener: LoadingListener) {
  loadingListeners.add(listener);
  listener(pendingGlobalLoadingRequests > 0);

  return () => {
    loadingListeners.delete(listener);  // cleanup
  };
}

export async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    useGlobalLoading = false, // opt-in global loading
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const headers: Record<string, string> = { ...(customHeaders || {}) }; // copy headers

  // set JSON if needed
  if (fetchOptions.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // start loading
  if (useGlobalLoading) {
    pendingGlobalLoadingRequests += 1;
    notifyLoadingListeners();
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      ...fetchOptions,
      headers,
    });

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      // no JSON body
    }

    if (!res.ok) {
      const errorBody = data as { message?: string; code?: string } | null;
      const message =
        errorBody?.message ||
        `Request failed with status ${res.status}`;

      const error: ApiError = Object.assign(new Error(message), {
        status: res.status,
        code: errorBody?.code,
        body: data,
      });
      throw error;
    }

    return data as T;
  } finally {
    if (useGlobalLoading) {
      pendingGlobalLoadingRequests = Math.max(0, pendingGlobalLoadingRequests - 1);
      notifyLoadingListeners(); // stop loading if no pending requests
    }
  }
}