# Supabase Setup Guide

This guide will walk you through connecting your WX Arena app to Supabase.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Enter project name: `wx-arena`
5. Choose region closest to your users (e.g., `us-east-1` for US, `eu-west-1` for Europe, `ap-south-1` for India)
6. Click "Create new project"
7. Wait 2-3 minutes for database to be ready

## Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API** in the sidebar
3. Copy these values:
   - `URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → this is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Set Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 4: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase/schema.sql` in your project folder
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click **Run**
7. Wait for "Success. No rows returned" message

## Step 5: Enable Auth

1. Go to **Authentication** (left sidebar)
2. Click **Providers**
3. Enable **Email** provider (should be on by default)
4. Under **Email provider** settings:
   - Enable "Confirm email" for production
   - For testing, you can disable it
5. Click **Save**

## Step 6: Test Connection

1. Restart your dev server:
   ```bash
   npx next dev
   ```

2. Open browser at `http://localhost:3000`

3. Try to sign up with a test email

4. Check if user appears in Supabase:
   - Go to **Authentication** → **Users**
   - You should see your test user

## Troubleshooting

### "Failed to fetch" errors
- Check that `NEXT_PUBLIC_SUPABASE_URL` is correct
- Ensure you included `https://`

### "Invalid API key" errors
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is copied correctly
- Make sure there are no extra spaces

### Database errors
- Re-run the schema SQL in Supabase SQL Editor
- Check for any error messages in the SQL output

### Auth not working
- Verify Email provider is enabled in Supabase
- Check browser console for error messages
- Ensure you're using the correct project (not a different one)

## Next Steps

After Supabase is connected:

1. Test all auth flows (register, login, forgot password)
2. Create a test match to verify database writes
3. Check real-time subscriptions are working
4. Review the [README.md](./README.md) for feature details

## Security Notes

- **NEVER** commit `.env.local` to git (it's in .gitignore already)
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Use Row Level Security (RLS) policies to protect data (already configured in schema)
- Enable "Confirm email" before production launch
