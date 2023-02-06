import { Session } from "next-auth";
export { getSession } from "next-auth/react"

declare module "next-auth" {
  interface Session {
    uid: string;
  }
}
