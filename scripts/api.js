const API_URL = 'http://localhost:3000/api';

export class ApiService {
    static async get(endpoint, params = {}) {
        const url = new URL(`${API_URL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }
        return await response.json();
    }

    static async post(endpoint, data) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка запроса');
        }
        return result;
    }

    static async delete(endpoint) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка удаления');
        }
        return result;
    }
}