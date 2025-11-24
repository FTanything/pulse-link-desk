const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY
import { TaskJson, Task } from "../../interface";

export async function getTaskByID(id:string):Promise<Task>{
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/exec?getBy=id&id=${id}`);
    if(!response.ok){
        throw new Error('Failed to fetch tasks');
    }
    return response.json();
}

export async function getTaskByDate(start:string, end:string):Promise<TaskJson>{
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/exec?getBy=date&start=${start}&end=${end}`);
    if(!response.ok){
        throw new Error('Failed to fetch tasks');
    }
    return response.json();
}

export async function getTaskByStatus(status:string):Promise<TaskJson>{
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/exec?getBy=status&status=${status}`);
    if(!response.ok){
        throw new Error('Failed to fetch tasks');
    }
    return response.json();
}