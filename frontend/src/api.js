import axios from 'axios';

const resolveApiBaseUrl = () => {
  const configured = (import.meta.env.VITE_API_BASE_URI || '').trim();
  const base = configured || 'https://blogifyy-hugk.onrender.com';
  return `${base.replace(/\/+$/, '')}/api/`;
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// separate instance for public endpoints
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const message = error.response.data?.message || 'Too many requests. Please try again later.';
      alert(message);
    }
    return Promise.reject(error);
  }
);


publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const message = error.response.data?.message || 'Too many requests. Please try again later.';
      alert(message);
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => {
    console.log('API call: verifying email with token:', token);
    return publicApi.get(`/auth/verify-email?token=${token}`);
  },
  verifyOTP: (data) => {
    console.log('API call: verifying OTP for email:', data.email);
    return publicApi.post('/auth/verify-otp', data);
  },
  forgotPassword: (email) => publicApi.post('/auth/forgot-password', { email }),
  resetPassword: (data) => publicApi.post('/auth/reset-password', data),
};

export const profileAPI = {
  getProfile: () => api.get('/profile/me'),
  updateProfile: (profileData) => api.put('/profile/me', profileData),
};


export const blogAPI = {
  getAllBlogs: ({ page = 1, tag = '', search = '', username = '' } = {}) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (tag) params.set('tag', tag);
    if (search) params.set('search', search);
    if (username) params.set('username', username);
    return publicApi.get(`/blogs?${params.toString()}`);
  },
  getBlog: (idOrSlug) => publicApi.get(`/blogs/${idOrSlug}`),
  getBlogAnalytics: (idOrSlug) => api.get(`/blogs/${idOrSlug}/analytics`),
  createBlog: (blogData) => api.post('/blogs', blogData),
  updateBlog: (idOrSlug, blogData) => api.put(`/blogs/${idOrSlug}`, blogData),
  deleteBlog: (idOrSlug) => api.delete(`/blogs/${idOrSlug}`),
  getUserBlogs: () => api.get('/blogs/user/me'),
  getAllBlogsAdmin: () => api.get('/blogs/admin/all'),
};

export const premiumAPI = {
  getPlans: () => publicApi.get('/premium/plans'),
  getSubscription: () => api.get('/premium/me'),
  createOrder: (plan) => api.post('/premium/create-order', { plan }),
  verifyPayment: (payload) => api.post('/premium/verify', payload),
  cancelSubscription: () => api.post('/premium/cancel'),
};

export const commentAPI = {
	addComment: (blogId, payload ) => {
    return api.post(`/comments/${blogId}/comment`, {
      ...payload,
    });
	},
  getBlogComments: (blogId) => publicApi.get(`/comments/${blogId}/comments`),
  deleteComment: (commentId) => api.delete(`/comments/comment/${commentId}`),
};

export const likeAPI = {
  toggleLike: (blogId) => api.post(`/likes/${blogId}/toggle`),
  getLikeStatus: (blogId) => api.get(`/likes/${blogId}`),
  getLikeUsers: (blogId) => publicApi.get(`/likes/${blogId}/users`),
};

export const adminAPI = {
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getStats: () => api.get('/admin/stats'),
};

export const uploadAPI = {
  uploadImage: (formData) => {
    const uploadApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    uploadApi.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return uploadApi.post('/upload/upload', formData);
  },
  deleteImage: (filename) => api.delete(`/upload/delete/${filename}`),
};

export default api;
