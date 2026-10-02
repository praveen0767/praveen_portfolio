# Portfolio

Personal engineering portfolio for Praveen Kumar S, built with Next.js, TypeScript, and static content modules.

## Development

Use Node.js 22 (see `.nvmrc`) and install dependencies with npm:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment

Copy `.env.example` to `.env.local` when you need to set a local canonical URL. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain in production. It is used by canonical metadata, Open Graph URLs, robots, and the sitemap.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

There is currently no automated test suite configured.

## Content Workflow

New projects are added under `content/projects` with metadata, verified assets, and case-study fields. New notes and experiments are added under `content/lab` with publication status; only published entries appear in public listings and the sitemap.

## Deployment

The app is compatible with Vercel or another Next.js host.

- Install command: `npm ci`
- Build command: `npm run build`
- Runtime: Node.js 22
- Required production variable: `NEXT_PUBLIC_SITE_URL`

Deployment, domain, DNS, resume, and verified professional contact configuration remain manual production steps.
