# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i --legacy-peer-deps

# Step 4: Configure environment (backend)
# Copy .env.example to .env and set:
#   DATABASE_URL=postgresql://user:password@localhost:5432/apex
#   JWT_ACCESS_SECRET=your-access-secret-min-32-characters
#   JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters

# Step 5: Run database migrations and seed
npm run db:migrate
npm run db:seed

# Step 6: Start the development server (Vite + API in one command)
npm run dev
```

## Backend & local development

This app includes a **single full-stack setup**: the frontend (Vite + React) and the backend API (Express + Drizzle + PostgreSQL) live in the same repo. No separate `/server` folder; backend code is under `src/server`.

- **One command:** `npm run dev` starts both the Vite dev server and the API (via `tsx watch`). The frontend proxies `/api` to the Express server (port 4000).
- **Env vars:** Set `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` (see `.env.example` if present, or use the values above). Use secrets with at least 32 characters.
- **Database:** PostgreSQL. Run `npm run db:generate` to generate migrations from `src/server/db/schema.ts`, `npm run db:migrate` to apply them, and `npm run db:seed` to seed an admin user (`admin@local.dev` / `Admin123!`, idNumber `ADMIN-0001`) and sample data.
- **Production:** `npm run build` builds frontend and backend. `npm run start` runs the compiled API; in production the Express app serves the Vite `dist` and the `/api` routes. Set `NODE_ENV=production`.
- **Frontend API client:** `src/lib/api.ts` uses the same origin (no hardcoded localhost). Tokens are stored in localStorage (MVP); document the tradeoff for production (e.g. httpOnly cookies for refresh).

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
