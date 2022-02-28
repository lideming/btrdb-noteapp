export interface Note {
    id: string;
    owner: string;
    type: "text" | "todo";
    text: string;
    ctime: number;
    mtime: number;
}

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    image: string;
}
