const API_BASE = import.meta.env.VITE_API_URL;

export async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    const error = new Error(data?.message || 'Request failed');
    error.status = res.status;
    error.body = data;
    throw error;
  }

  return data;
}