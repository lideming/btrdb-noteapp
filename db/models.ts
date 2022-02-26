export interface Note {
    id: number;
    owner: string;
    type: "text" | "todo";
    text: string;
}

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    image: string;
}
