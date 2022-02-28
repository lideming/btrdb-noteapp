import { useSession, getSession } from "next-auth/react"
import React, { useRef, useState, useEffect, useLayoutEffect, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Note, NoteCollection } from "../db/models";
import { addCollection, getCollectionsByOwner, getNotesByCollection, getNotesByOwner } from "../db"

export default function Page(props: { notes: Note[], currentCol: NoteCollection, cols: NoteCollection[] }) {
    return <>
        <Head>
            <title>Notes - {props.currentCol.name}</title>
        </Head>
        <Header />
        <CollectionSelector cols={props.cols} currentCol={props.currentCol} />
        <Notes notes={props.notes} col={props.currentCol} />
    </>
}

function CollectionSelector(props: { cols: NoteCollection[], currentCol: NoteCollection }) {
    const router = useRouter();
    return <div className="m-3 mt-2 space-x-1 space-y-1">
        <button
            className={"btn light"}
            onClick={async () => {
                const resp = await fetch(`/api/notes/new`, {
                    method: 'POST'
                });
                const col = await resp.json();
                router.push(`?col=${col.id}`);
            }}
        >+</button>
        {props.cols.map(col => (
            col.id === props.currentCol.id ? (
                <CurrentCollection key={col.id} col={props.currentCol} />
            ) : (
                <Link key={col.id}
                    href={`?col=${col.id}`}
                    passHref
                >
                    <a className="btn">{col.name}</a>
                </Link>
            )
        ))}
    </div>;
}

function CurrentCollection(props: { col: NoteCollection }) {
    const router = useRouter();
    const { col } = props;
    const [editing, setEditing] = useState(null);
    const input = useRef<HTMLInputElement>(null!);
    useLayoutEffect(() => {
        if (editing != null) {
            input.current.style.width = '80px';
            input.current.style.width = (input.current.scrollWidth + 20) + 'px';
        }
    }, [editing]);
    const exit = async (nosave = false) => {
        if (nosave || editing === col.name || editing == '') {
            setEditing(null);
            return;
        }
        await fetch(`/api/notes/${col.id}`, {
            method: 'PUT',
            ...fetchJsonBody({ name: editing }),
        });
        await router.replace(router.asPath);
        setEditing(null);
    };
    return (
        (editing == null) ? (
            <a className="btn active" href={`?col=${col.id}`} onClick={(e) => {
                e.preventDefault();
                setEditing(col.name);
            }}>
                {col.name}
            </a>
        ) : (
            <div className="btn active relative">
                <input
                    ref={input}
                    className="outline-none bg-white bg-opacity-70"
                    type="text"
                    autoFocus
                    value={editing}
                    onChange={(e) => setEditing(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key == "Enter") {
                            exit();
                        } else if (e.key == "Escape") {
                            exit(true);
                        }
                    }}
                    />
                <div className="absolute mt-1 right-0 space-x-1">
                    <button className="btn dangerous" onClick={async () => {
                        await fetch(`/api/notes/${col.id}`, {
                            method: 'DELETE',
                        });
                        router.replace(router.asPath);
                    }}>Delete</button>
                    <button className="btn" onClick={() => exit()}>Save</button>
                </div>
            </div>
        )
    )
}

function Header() {
    const { data } = useSession();
    return (
        <div className="p-3 bg-slate-200 flex justify-between items-center">
            <h1 className="text-xl font-bold">Notes</h1>
            <span className="space-x-3 flex items-center">
                <a className="btn" href="/api/auth/signout">Sign Out</a>
                <span className="align-middle">{data.user.name}</span>
                {data.user.image && <img src={data.user.image} alt="user avatar" className="w-8 rounded-full inline-block" />}
            </span>
        </div>
    )
}

const NotesContext = React.createContext<{
    removeNote: (note: Note) => void,
    updateNote: (note: Note) => void,
}>(null!);

const Notes = React.memo((props: { notes: Note[], col: NoteCollection }) => {
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
                }}>New note</button>
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
                <button className="btn" onClick={onSave} title="(Ctrl + Enter)">{changed ? "Save" : "Close"}</button>
                <button className="btn dangerous" onClick={onDelete}>Delete</button>
            </div>
        </div>
    );
});

function fetchJsonBody(obj: any) {
    return {
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' },
    }
}

export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session) {
        return {
            redirect: {
                destination: '/api/auth/signin'
            }
        }
    }
    const colid = context.query.col;
    const cols = await getCollectionsByOwner(session.uid as string);
    if (cols.length == 0) {
        const now = Date.now();
        const col = {
            id: null,
            ctime: now,
            mtime: now,
            name: "default",
            owner: session.uid as string,
        };
        await addCollection(col);
        cols.push(col);
    }
    cols.sort((a, b) => b.mtime - a.mtime);
    const currentCol = cols.find(x => x.id == colid) || cols[0];
    const notes = await getNotesByCollection(currentCol.id);
    notes.sort((a, b) => b.mtime - a.mtime);
    return {
        props: {
            session,
            notes,
            currentCol,
            cols,
        },
    }
}
