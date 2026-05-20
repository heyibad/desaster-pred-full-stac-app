export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiRegister(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error((await response.json()).detail || "Register failed");
  }

  return response.json();
}

export async function apiLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error((await response.json()).detail || "Login failed");
  }

  return response.json();
}

export async function apiPredict(file: File, token: string) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  if (!response.ok) {
    throw new Error((await response.json()).detail || "Prediction failed");
  }

  return response.json();
}
