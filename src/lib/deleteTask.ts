const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY
import { TaskJson } from "interface";

export default async function deleteTask(id:string): Promise<TaskJson> {
    // console.log(`ID: ${id}`)
    return await fetch(
      `${API_BASE_URL}/${API_KEY}/exec?action=delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body:JSON.stringify({
           id: parseInt(id)
          })
      }
    )
      .then((response) => {
        return response.ok ? response.json() : Promise.reject(response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }