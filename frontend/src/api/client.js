const API_BASE_URL = '/api';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        ...(options.headers || {})
    };

    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If 401 and refresh token exists, attempt refresh
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    localStorage.setItem('token', refreshData.token);
                    if (refreshData.refreshToken) {
                        localStorage.setItem('refreshToken', refreshData.refreshToken);
                    }
                    // Retry original request with new token
                    headers['Authorization'] = `Bearer ${refreshData.token}`;
                    response = await fetch(`${API_BASE_URL}${endpoint}`, {
                        ...options,
                        headers
                    });
                } else {
                    // Refresh failed, clean up
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            } catch (e) {
                console.error('Session refresh failed:', e);
            }
        }
    }

    // For file download responses (e.g. CSV)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
        const blob = await response.blob();
        return { data: blob, isBlob: true };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

export const api = {
    get: (endpoint, params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                query.append(key, val);
            }
        });
        const qs = query.toString();
        return request(`${endpoint}${qs ? `?${qs}` : ''}`, { method: 'GET' });
    },
    post: (endpoint, body) => {
        return request(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    },
    put: (endpoint, body) => {
        return request(endpoint, {
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    },
    patch: (endpoint, body = {}) => {
        return request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },
    delete: (endpoint) => {
        return request(endpoint, { method: 'DELETE' });
    },
    download: async (endpoint, params = {}, filename = 'export.csv') => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                query.append(key, val);
            }
        });
        const qs = query.toString();
        const res = await request(`${endpoint}${qs ? `?${qs}` : ''}`, { method: 'GET' });
        if (res.isBlob) {
            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        }
    }
};

export default api;
