import API from './api';

export const loginUser = async (username, password) => {
  const res = await API.post('/auth/login', { username, password });
  return res.data;
};

export const registerUser = async (username, password) => {
  const res = await API.post('/auth/register', { username, password });
  return res.data;
};
