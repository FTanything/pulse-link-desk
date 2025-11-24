import { API_BASE_URL, API_KEY } from "@/config/apiConfig";
import { TaskJson } from "../../interface";

export default async function getTasks():Promise<TaskJson>{
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/exec`);
    if(!response.ok){
        throw new Error('Failed to fetch tasks');
    }
    return response.json();
}