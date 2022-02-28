import { db, getNotesSet } from "./db";
import { Note } from "./models";

export async function getNotesByOwner(owner: string) {
    const notes = await getNotesSet();
    const array = await notes.findIndex("owner", owner);
    return array.map(x => Object.assign({}, x));
}

export async function getNoteById(id: string) {
    const notes = await getNotesSet();
    const note = await notes.get(id);
    return Object.assign({}, note);
}

export function addNote(note: Note) {
    return db.runTransaction(async () => {
        const notes = await getNotesSet();
        await notes.insert(note);
    });
}

export function updateNote(note: Note) {
    return db.runTransaction(async () => {
        const notes = await getNotesSet();
        await notes.update(note);
    });
}

export function deleteNote(note: Note) {
    return db.runTransaction(async () => {
        const notes = await getNotesSet();
        await notes.delete(note.id);
    });
}
