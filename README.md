# osu! Beatmap Mirror

A beatmap mirror for the rhythm game osu!

## Download System Architecture

The download system is designed for reliability, performance, and reduced load on both servers and clients:

### Features

- **Server-side proxy**: Downloads beatmaps through the server, avoiding CORS issues
- **Download caching**: Beatmaps are cached on the server to reduce load on upstream mirrors
- **Fallback system**: Automatically tries multiple download sources
- **Retry logic**: Automatically retries failed downloads
- **Download queue**: Manages concurrent downloads to prevent overwhelming the client
- **Download statistics**: Tracks download counts for analytics

### Environment Variables

Create a `.env.local` file with the following variables:

```
# osu! API credentials
OSU_CLIENT_ID=
OSU_CLIENT_SECRET=
OSU_LEGACY_KEY=

# Download cache settings
ENABLE_DOWNLOAD_CACHE=true

# Vercel KV connection (for production)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run start
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
