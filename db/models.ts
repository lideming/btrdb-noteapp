export interface Note {
    id: string;
    owner: string;
    col: string;
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

export interface NoteCollection {
    id: string;
    owner: string;
    name: string;
    ctime: number;
    mtime: number;
}
