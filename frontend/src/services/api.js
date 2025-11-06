import axios from "axios";

const API = axios.create({
  baseURL: "https://mentee-book-g0pcbdvnm-sujith-bs-projects.vercel.app/login", 
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
