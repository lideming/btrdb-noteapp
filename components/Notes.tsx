import React, { useRef, useState, useEffect, useLayoutEffect, useContext } from "react";
import { Note, NoteCollection } from "../db/models";
import { fetchJsonBody } from "../utils/fetch";
import { Plus, Save, TrashBin } from "./icons";

const NotesContext = React.createContext<{
    removeNote: (note: Note) => void,
    updateNote: (note: Note) => void,
}>(null!);

export const Notes = React.memo((props: { notes: Note[], col: NoteCollection }) => {
    const [notes, setNotes] = useState(props.notes);
    useEffect(() => {
        setNotes(props.notes);
    }, [props.notes]);
    const notesRef = useRef(notes);
    notesRef.current = notes;
    const context = {
        removeNote: (note: Note) => {
            setNotes(notesRef.current.filter(x => x.id != note.id));
        },
        updateNote: (note: Note) => {
            setNotes(notesRef.current.map(x => x.id == note.id ? note : x));
        },
    };
    return (
        <div className="m-3 space-y-3">
            <div className="flex justify-between items-center">
                <button className="btn" onClick={async () => {
                    const resp = await fetch(`/api/notes/${props.col.id}/new`, {
                        method: 'POST'
                    });
                    const note = await resp.json();
                    setNotes([note, ...notesRef.current]);
                }}><Plus /> Note</button>
                <span>({notes.length} notes)</span>
            </div>
            <NotesContext.Provider value={context}>
                <div className="space-y-3">
                    {notes.map(note => (
                        <Note key={note.id} note={note} />
                    ))}
                </div>
            </NotesContext.Provider>
        </div>
    )
});

const Note = React.memo((props: { note: Note }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { note } = props;
    useLayoutEffect(() => {
        if (props.note.text === "") {
            setIsEditing(true);
        }
    }, [props.note]);
    return (
        isEditing ? (
            <NoteEditing note={note} onExit={() => setIsEditing(false)} />
        ) : (
            <div className="list-note" onClick={() => setIsEditing(true)}>
                {note.text}
            </div>
        )
    );
});

const NoteEditing = React.memo((props: { note: Note, onExit: () => void }) => {
    const context = useContext(NotesContext);
    const textarea = useRef<HTMLTextAreaElement>(null!);
    const [changed, setChanged] = useState(false);
    const { note } = props;
    useLayoutEffect(() => {
        textarea.current.value = note.text;
        resize(textarea.current);
    }, [note]);
    const onSave = async () => {
        if (textarea.current.value !== note.text) {
            await fetch('/api/notes/' + note.col + '/' + note.id, {
                method: 'PUT',
                ...fetchJsonBody({ text: textarea.current.value }),
            });
            context.updateNote({ ...note, text: textarea.current.value });
        }
        props.onExit();
    };
    const onDelete = async () => {
        await fetch('/api/notes/' + note.col + '/' + note.id, {
            method: 'DELETE'
        });
        context.removeNote(note);
    };
    const resize = (element: HTMLElement) => {
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    };
    return (
        <div className="list-note editing">
            <textarea
                ref={textarea}
                className="w-full h-fit bg-inherit outline-none resize-none"
                autoFocus
                onInput={(ev) => {
                    setChanged(true);
                    resize(ev.target as HTMLElement);
                }}
                onKeyDown={(ev) => {
                    if (ev.ctrlKey && ev.key == "Enter") {
                        onSave();
                    }
                }}
            ></textarea>
            <div className="mt-3 space-x-3 flex justify-between">
                <button className="btn" onClick={onSave} title="(Ctrl + Enter)"><Save /></button>
                <button className="btn dangerous" onClick={onDelete}><TrashBin /></button>
            </div>
        </div>
    );
});
