export interface Task{
    id:string,
    title:string,
    date:string,
    status:string
}

export interface TaskJson{
    status:string,
    data:Task[]
}
