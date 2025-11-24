const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY
import { TaskJson } from "interface";

export default async function updateTask(id:string, title:string, date:string, status:string): Promise<TaskJson> {
    return await fetch(
      `${API_BASE_URL}/${API_KEY}/exec?action=put`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body:JSON.stringify({
          id:id,
          title:title,
          date:date,
          status:status
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