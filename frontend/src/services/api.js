const API_BASE_URL = "http://localhost:4000/api";

function humanizeFieldName(field) {
  return field
    .replace(/\./g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function formatValidationErrors(errors) {
  if (!errors?.fieldErrors) {
    return "";
  }

  return Object.entries(errors.fieldErrors)
    .filter(([_field, messages]) => messages?.length)
    .map(([field, messages]) => `${humanizeFieldName(field)}: ${messages.join(", ")}`)
    .join("\n");
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("doctorapp_token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("doctorapp_token");
    }

    const validationMessage = formatValidationErrors(data.errors);
    const message = validationMessage || data.message || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.details = data.errors || data.details || null;
    throw error;
  }

  return data;
}
