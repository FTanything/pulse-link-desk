const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
import { TaskJson } from "interface";

export default async function addTask(
  title: string,
  date: string
): Promise<TaskJson> {
  return await fetch(`${API_BASE_URL}/${API_KEY}/exec?action=post`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify({
      title: title,
      date: date,
    }),
  })
    .then((response) => {
      return response.ok ? response.json() : Promise.reject(response);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
