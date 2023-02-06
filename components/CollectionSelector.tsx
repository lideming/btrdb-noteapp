import React, { useRef, useState, useEffect, useLayoutEffect, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Note, NoteCollection } from "@/db/models";
import { fetchJsonBody } from "../utils/fetch";
import { Plus, Save, TrashBin } from "./icons";

export function CollectionSelector(props: { cols: NoteCollection[], currentCol: NoteCollection }) {
    const router = useRouter();
    return (
        <div className="m-3 mt-2 space-x-1 space-y-1">
            <button
                className={"btn light text-gray-500"}
                onClick={async () => {
                    const resp = await fetch(`/api/notes/new`, {
                        method: 'POST'
                    });
                    const col = await resp.json();
                    router.push(`?col=${col.id}`);
                }}
            ><Plus /> Collection</button>
            {props.cols.map(col => (
                col.id === props.currentCol.id ? (
                    <CurrentCollection key={col.id} col={props.currentCol} />
                ) : (
                    <Link key={col.id} href={`?col=${col.id}`} passHref className="btn">
                        {col.name}
                    </Link>
                )
            ))}
        </div>
    );
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
                    }}><TrashBin /></button>
                    <button className="btn" onClick={() => exit()}><Save /></button>
                </div>
            </div>
        )
    )
}
