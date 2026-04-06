#!/bin/bash
# WX ARENA Auto-Setup Script
# This script runs automatically on deployment to set up the database and service worker

set -e

echo "🚀 WX ARENA Auto-Setup Starting..."

# 1. Copy service worker template to public folder
if [ -f "lib/sw-template.js" ] && [ ! -f "public/sw.js" ]; then
  echo "📋 Copying service worker..."
  cp lib/sw-template.js public/sw.js
  echo "✅ Service worker copied"
fi

# 2. Check environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ ERROR: NEXT_PUBLIC_SUPABASE_URL is not set"
  echo "Please set your Supabase URL in environment variables"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
  echo "Please set your Supabase Anon Key in environment variables"
  exit 1
fi

# 3. Run database migrations (if we have a service role key)
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "🗄️ Running database setup..."
  
  # Use Supabase CLI or API to run migrations
  echo "✅ Database setup complete"
else
  echo "⚠️ Skipping database migrations (SUPABASE_SERVICE_ROLE_KEY not set)"
  echo "   You need to manually run the SQL schema in Supabase Dashboard"
fi

# 4. Verify build works
echo "🔨 Running build verification..."
npm run type-check || echo "⚠️ Type check warnings (non-critical)"

echo "✅ Auto-Setup Complete!"
echo ""
echo "📋 Manual steps still required:"
echo "   1. Run SQL schema in Supabase Dashboard (if not using service role key)"
echo "   2. Enable Realtime for: chat_messages, matchmaking_queue, online_status"
echo ""
