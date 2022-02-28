import { useSession, getSession } from "next-auth/react"
import React, { useRef, useState, useEffect, useLayoutEffect, useContext } from "react";
import Head from "next/head";
import { Note, NoteCollection } from "../db/models";
import { addCollection, getCollectionsByOwner, getNotesByCollection, getNotesByOwner } from "../db"
import { Notes } from "../components/Notes";
import { CollectionSelector } from "../components/CollectionSelector";
import { Exit } from "../components/icons";

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

function Header() {
    const { data } = useSession();
    return (
        <div className="p-3 bg-slate-200 flex justify-between items-center">
            <h1 className="text-xl font-bold">Notes</h1>
            <span className="space-x-3 flex items-center">
                <a className="btn" href="/api/auth/signout"><Exit /></a>
                <span className="align-middle">{data.user.name}</span>
                {data.user.image && <img src={data.user.image} alt="user avatar" className="w-8 rounded-full inline-block" />}
            </span>
        </div>
    )
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
