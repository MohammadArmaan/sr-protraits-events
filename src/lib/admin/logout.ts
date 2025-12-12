import axios from "axios";

export async function adminLogout(): Promise<void> {
    await axios.post("/api/admin/logout");
}

