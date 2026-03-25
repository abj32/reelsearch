import { request } from "./api"

export function register(email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST',
  });
}

export function getProfile() {
  return request('/auth/profile', {
    method: 'GET',
    useGlobalLoading: true,
  });
}