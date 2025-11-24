const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY
import { TaskJson } from "../../interface";

export default async function getTasks():Promise<TaskJson>{
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/exec`);
    if(!response.ok){
        throw new Error('Failed to fetch tasks');
    }
    return response.json();
}