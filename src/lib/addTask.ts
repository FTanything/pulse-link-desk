import { API_BASE_URL, API_KEY } from "@/config/apiConfig";
import { TaskJson } from "interface";

export default async function addTask(title:string, date:string): Promise<TaskJson> {
    return await fetch(
      `${API_BASE_URL}/${API_KEY}/exec?action=post`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body:JSON.stringify({
            title:title,
            date:date
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