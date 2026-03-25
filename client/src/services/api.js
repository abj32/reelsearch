const API_BASE = import.meta.env.VITE_API_URL;

let pendingGlobalLoadingRequests = 0;  // count of active "global loading" requests
const loadingListeners = new Set(); // set of subscribed listeners

// Notify all listeners of current loading state
function notifyLoadingListeners() {
  const isLoading = pendingGlobalLoadingRequests > 0;
  loadingListeners.forEach((listener) => listener(isLoading));
}

// Adds loading listener and intializes listener with current loading state
export function subscribeToApiLoading(listener) {
  loadingListeners.add(listener);
  listener(pendingGlobalLoadingRequests > 0);

  return () => {
    loadingListeners.delete(listener);  // cleanup
  };
}

export async function request(path, options = {}) {
  const {
    useGlobalLoading = false, // opt-in global loading
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const headers = { ...(customHeaders || {}) }; // copy headers

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

    let data = null;
    try {
      data = await res.json();
    } catch {
      // no JSON body
    }

    if (!res.ok) {
      const error = new Error(data?.message || "Request failed");
      error.status = res.status;
      error.body = data;
      throw error;
    }

    return data;
  } finally {
    if (useGlobalLoading) {
      pendingGlobalLoadingRequests = Math.max(0, pendingGlobalLoadingRequests - 1);
      notifyLoadingListeners(); // stop loading if no pending requests
    }
  }
}