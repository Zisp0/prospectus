export const fetchDashboardStats = async () => {
  const response = await fetch('http://localhost:8000/api/dashboard/stats/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return await response.json();
};

// Auth service functions
export const loginUser = async (email, password) => {
  const response = await fetch('http://localhost:8000/api/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Login failed');
  }
  return await response.json(); // returns { access, refresh }
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:8000/api/auth/me/', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }
  return await response.json(); // returns user object
};

export const logOut = async () => {
  const token = localStorage.getItem('accessToken');
  const refresh = localStorage.getItem('refreshToken');
  const response = await fetch('http://127.0.0.1:8000/api/auth/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }
  return response;
};

export const fetchProspects = async ({ query = '', page = 1, pageSize = 10 } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (query.trim()) {
    params.set('q', query.trim());
  }

  const response = await fetch(`http://localhost:8000/api/prospectos/?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch prospects');
  }
  return await response.json();
};

export const createProspect = async (data) => {
  const response = await fetch('http://localhost:8000/api/prospectos/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw await response.json();
  }
  return await response.json();
};

export const updateProspect = async (id, data) => {
  const response = await fetch(`http://localhost:8000/api/prospectos/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw await response.json();
  }
  return await response.json();
};

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/api/prospectos/upload/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload CSV');
  }
  return await response.json();
};

export const deleteProspect = async (id) => {
  const response = await fetch(`http://localhost:8000/api/prospectos/${id}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete prospect');
  }
  return response;
};
