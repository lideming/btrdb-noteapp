# Note App - btrdb demo

<img align="right" src="https://user-images.githubusercontent.com/14901890/155878043-6eb5b4fc-a467-47d0-b5d3-18968b09fc34.png" width="40%" />

- [btrdb](https://github.com/lideming/btrdb) as the database
- [Next.js](https://nextjs.org/) for React SSR and API endpoints
- [NextAuth.js](https://next-auth.js.org/) for JWT authentication
- [tailwindcss](https://tailwindcss.com/) for UI styling

## Live demo

[Link to live demo](https://note.yuuza.net/) (the data may be deleted anytime!)

## Running

### Install dependencies

```bash
pnpm i
```

### Configure

Copy `.env.example` to `.env` and fill in the values.

### Run dev server

```bash
pnpm dev
```

### Run production server

```bash
pnpm build
pnpm start

# or with specific listening address and port:
npx next start --hostname=127.0.0.1 --port=8080
```
