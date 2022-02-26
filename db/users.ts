import { getUsersSet } from "./db";
import { UserInfo } from "./models";

export async function upsertUser(user: UserInfo) {
    const users = await getUsersSet();
    await users.upsert(user);
}

export async function getUserById(id: string) {
    const users = await getUsersSet();
    return await users.get(id);
}