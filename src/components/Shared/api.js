import { authFetch } from "../Shared/authFetch";
const token = localStorage.getItem("token");


const res = await authFetch("http://localhost:8080/api/leave/apply", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
});