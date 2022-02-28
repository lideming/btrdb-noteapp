import { db, getNoteCollectionsSet, getNotesSet } from "./db";
import { Note, NoteCollection } from "./models";

export async function getNotesByOwner(owner: string) {
    const notes = await getNotesSet();
    const array = await notes.findIndex("owner", owner);
    return array.map(x => Object.assign({}, x));
}

export async function getNotesByCollection(col: string) {
    const notes = await getNotesSet();
    const array = await notes.findIndex("col", col);
    return array.map(x => Object.assign({}, x));
}

export async function getNoteById(id: string) {
    const notes = await getNotesSet();
    const note = await notes.get(id);
    return note ? Object.assign({}, note) : null;
}

export function addNote(note: Note) {
    return db.runTransaction(async () => {
        const notes = await getNotesSet();
        await notes.insert(note);
    });
}

export function updateNote(note: Note, col?: NoteCollection) {
    return db.runTransaction(async () => {
        const notes = await getNotesSet();
        await notes.update(note);
        if (col) {
            const cols = await getNoteCollectionsSet();
            await cols.update(col);
        }
    });
}

export function deleteNote(note: Note, col?: NoteCollection) {
    return db.runTransaction(async () => {
        const notes = await getNotesSet();
        await notes.delete(note.id);
        if (col) {
            const cols = await getNoteCollectionsSet();
            await cols.update(col);
        }
    });
}

export function addCollection(col: NoteCollection) {
    return db.runTransaction(async () => {
        const cols = await getNoteCollectionsSet();
        await cols.insert(col);
    });
}

export async function getCollectionsByOwner(owner: string) {
    const cols = await getNoteCollectionsSet();
    const array = await cols.findIndex("owner", owner);
    return array.map(x => Object.assign({}, x));
}

export async function getCollectionById(id: string) {
    const cols = await getNoteCollectionsSet();
    const col = await cols.get(id);
    return col ? Object.assign({}, col) : null;
}

export async function updateCollection(col: NoteCollection) {
    return db.runTransaction(async () => {
        const cols = await getNoteCollectionsSet();
        await cols.update(col);
    });
}

export async function deleteCollection(col: NoteCollection) {
    return db.runTransaction(async () => {
        const cols = await getNoteCollectionsSet();
        const notes = await getNotesSet();
        await cols.delete(col.id);
        for (const note of await notes.findIndex("col", col.id)) {
            await notes.delete(note.id);
        }
    });
}
