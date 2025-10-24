const API_URL = "http://localhost:8000";

function normalizeErrorMessage(detail) {
  if (!detail) {
    return undefined;
  }
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") return item;
        if (typeof item === "object") {
          return item.msg || item.message || item.detail || null;
        }
        return String(item);
      })
      .filter(Boolean);
    return parts.join(" ");
  }
  if (typeof detail === "object") {
    return detail.message || detail.detail || JSON.stringify(detail);
  }
  return String(detail);
}

async function handleResponse(response) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message =
      normalizeErrorMessage(data?.detail) || data?.message || "Ocurrió un error inesperado";
    throw new Error(message);
  }
  return response.json();
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function register({ email, password, firstName, lastName }) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    }),
  });
  return handleResponse(response);
}

export async function requestPasswordReset(email) {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
}

export async function resetPassword(code, newPassword) {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, new_password: newPassword }),
  });
  return handleResponse(response);
}

export async function findClientByTaxId(taxId) {
  const sanitized = encodeURIComponent(taxId.trim());
  const response = await fetch(`${API_URL}/clients/${sanitized}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(response);
}