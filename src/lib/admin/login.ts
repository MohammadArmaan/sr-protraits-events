import axios from "axios";

export async function adminLogin(data: {
    email: string;
    password: string;
}) {
    const res = await axios.post("/api/admin/login", data);

    return res.data;
}