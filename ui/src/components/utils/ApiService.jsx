

const BASE_URL = "http://10.4.16.168:8080/";

class ApiService {
  static async get(endpoint) {
    const response = await fetch(`${BASE_URL}/${endpoint}`);
    if (!response.ok) throw new Error(`GET ${endpoint} failed`);
    return response.json();
  }

  static async post(endpoint, data) {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed`);
    return response.json();
  }

  static async put(endpoint, data) {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`PUT ${endpoint} failed`);
    return response.json();
  }

  static async delete(endpoint) {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`DELETE ${endpoint} failed`);
    return response.text();
  }
}

export default ApiService;