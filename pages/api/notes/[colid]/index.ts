import { getSession } from "@/utils/session";
import type { NextApiRequest, NextApiResponse } from "next"
import { deleteCollection, getCollectionById, getNoteById, updateCollection } from "@/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const colid = req.query.colid as string;
  const session = await getSession({ req });
  if (!session?.uid) {
    res.status(401).end();
    return;
  }
  const col = await getCollectionById(colid);
  if (!col || col.owner !== session.uid) {
    res.status(404).end();
    return
  }
  if (req.method == "PUT") {
    // col.mtime = Date.now();
    col.name = req.body.name;
    await updateCollection(col);
    res.status(200).end();
  } else if (req.method == "DELETE") {
    await deleteCollection(col);
    res.status(200).end();
  } else {
    res.status(400).end();
  }
}
