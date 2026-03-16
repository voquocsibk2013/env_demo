# Setup guide: Microsoft login + cloud sync

This guide takes you from a fresh Supabase project to a fully working
Microsoft-authenticated team app. Estimated time: 30–40 minutes.

---

## Overview of what you are building

```
User clicks "Sign in with Microsoft"
  → Redirected to Microsoft login (Azure AD)
  → Redirected back to your Vercel app
  → Supabase verifies the Microsoft token
  → App checks team_members table for user's email
  → If allowed: full access to shared projects
  → If not allowed: blocked with a clear message
```

---

## Part 1 — Create a Supabase project (5 min)

1. Go to https://supabase.com and sign up or log in (free)
2. Click **New project**
3. Fill in:
   - Name: `env-toolkit` (or anything you like)
   - Database password: save this somewhere safe
   - Region: **Frankfurt** or **Stockholm** (closest to Norway)
4. Click **Create new project** — takes about 60 seconds to provision

---

## Part 2 — Create the database tables (5 min)

In your Supabase project, go to **SQL Editor** and run each block below.

### Block 1 — Team members allowlist

```sql
create table public.team_members (
  email text primary key,
  name  text,
  added_at timestamptz default now()
);

-- Only authenticated users can read this table
alter table public.team_members enable row level security;

create policy "Authenticated users can read team_members"
  on public.team_members for select
  to authenticated
  using (true);
```

### Block 2 — Projects table

```sql
create table public.projects (
  id         text primary key,
  data       jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- All authenticated team members can read and write all projects
alter table public.projects enable row level security;

create policy "Authenticated users can read projects"
  on public.projects for select
  to authenticated
  using (true);

create policy "Authenticated users can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update projects"
  on public.projects for update
  to authenticated
  using (true);

create policy "Authenticated users can delete projects"
  on public.projects for delete
  to authenticated
  using (true);
```

### Block 3 — Add yourself to the allowlist

Replace the email and name with your own details:

```sql
insert into public.team_members (email, name)
values ('your.name@yourcompany.com', 'Your Name');
```

---

## Part 3 — Register an app in Azure AD (10 min)

You need an Azure AD app registration so Microsoft knows it is safe to redirect
users back to your app after login.

1. Go to https://portal.azure.com and sign in with your company account
2. Search for **App registrations** in the top search bar and open it
3. Click **+ New registration**
4. Fill in:
   - **Name**: `Env Aspects Toolkit`
   - **Supported account types**: select **Accounts in this organizational directory only** (single tenant — just your company)
   - **Redirect URI**: leave blank for now (you will add it in step 8)
5. Click **Register**

6. On the app overview page, copy and save:
   - **Application (client) ID** — you will need this in Part 4
   - **Directory (tenant) ID** — you will need this in Part 4

7. In the left menu click **Certificates & secrets** → **+ New client secret**
   - Description: `Supabase`
   - Expires: 24 months
   - Click **Add**
   - Copy the **Value** immediately (it is only shown once)

8. Now go back to **Authentication** in the left menu → **+ Add a platform** → **Web**
   - Add this redirect URI (replace YOUR-PROJECT-REF with your Supabase project reference — visible in your Supabase URL):
     ```
     https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
     ```
   - Click **Configure**

---

## Part 4 — Connect Azure to Supabase (5 min)

1. In your Supabase project go to **Authentication** → **Providers**
2. Find **Azure** and toggle it on
3. Fill in:
   - **Application (client) ID**: paste the value from Part 3 step 6
   - **Application (client) secret**: paste the secret value from Part 3 step 7
   - **Azure Tenant ID**: paste the Directory (tenant) ID from Part 3 step 6
4. Click **Save**

---

## Part 5 — Get your Supabase API keys (2 min)

1. In Supabase go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

---

## Part 6 — Add environment variables to Vercel (5 min)

1. Open your Vercel dashboard → find your `env-toolkit` project
2. Go to **Settings** → **Environment Variables**
3. Add two variables:

   | Name | Value |
   |------|-------|
   | `REACT_APP_SUPABASE_URL` | Your Project URL from Part 5 |
   | `REACT_APP_SUPABASE_ANON_KEY` | Your anon public key from Part 5 |

4. Make sure both are enabled for **Production**, **Preview**, and **Development**
5. Go to **Deployments** → click the three dots on your latest deployment → **Redeploy**

---

## Part 7 — Deploy the updated code (2 min)

1. Replace `src/App.jsx` in your GitHub repo with the new version from the zip
2. Replace `package.json` with the new version (it now includes `@supabase/supabase-js`)
3. Vercel will automatically redeploy — takes about 90 seconds

---

## Part 8 — Test the login

1. Open your Vercel app URL
2. You should see the "Sign in with Microsoft" screen
3. Click it — you should be redirected to Microsoft login
4. Sign in with your company account
5. You should be redirected back and see the app

If you see "Access not granted", your email is not in the `team_members` table.
Go to Supabase → Table Editor → team_members and add a row.

---

## Adding team members

To give a colleague access:

1. Go to your Supabase project → **Table Editor** → **team_members**
2. Click **Insert row**
3. Add their company email address and name
4. Click **Save**

They can now sign in immediately — no code changes needed.

To remove access, delete their row from the table.

---

## Troubleshooting

**Blank page after Microsoft login**
Check that the redirect URI in Azure (Part 3 step 8) matches exactly:
`https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`

**"Supabase is not configured" error**
Your environment variables are not set. Check Part 6.

**"Access not granted" for yourself**
Add your email to the `team_members` table (Part 2 Block 3).

**Microsoft login page says "Need admin approval"**
Your Azure tenant requires admin consent for new app registrations.
Ask your IT admin to go to the App Registration in Azure AD and click
**Grant admin consent** under API permissions.

---

## Running locally

Create a `.env.local` file in the project root (never commit this to GitHub):

```
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

Then run:
```
npm install
npm start
```

For local Microsoft login to work, also add `http://localhost:3000` as an
allowed redirect URI in both Azure (Authentication → Web → Redirect URIs)
and Supabase (Authentication → URL Configuration → Redirect URLs).
