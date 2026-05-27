import api from './api';

export const uploadDocument = (formData, onProgress) =>
  api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });

export const getDocuments = (params) => api.get('/documents', { params });
export const getDocument = (id) => api.get(`/documents/${id}`);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const updateDocument = (id, data) => api.patch(`/documents/${id}`, data);
