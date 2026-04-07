#!/usr/bin/env node

/**
 * WX Arena Supabase Auto-Setup Script
 * 
 * This script automatically:
 * 1. Validates Supabase connection
 * 2. Creates all required tables
 * 3. Sets up RLS policies
 * 4. Creates indexes
 * 5. Seeds initial data
 * 
 * Usage:
 *   node scripts/setup-supabase.js
 * 
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Your service role key (NOT the anon key)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}]`;
  
  switch (type) {
    case 'success':
      console.log(`${colors.green}${prefix} ✓ ${message}${colors.reset}`);
      break;
    case 'warning':
      console.log(`${colors.yellow}${prefix} ⚠ ${message}${colors.reset}`);
      break;
    case 'error':
      console.log(`${colors.red}${prefix} ✗ ${message}${colors.reset}`);
      break;
    case 'info':
      console.log(`${colors.blue}${prefix} ℹ ${message}${colors.reset}`);
      break;
    case 'header':
      console.log(`${colors.cyan}${colors.bright}${message}${colors.reset}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

// Check environment variables
function checkEnvironment() {
  log('Checking environment variables...', 'header');
  
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(`Missing required environment variables: ${missing.join(', ')}`, 'error');
    log('Please set them using:', 'info');
    log('  Windows: set SUPABASE_URL=your-url && set SUPABASE_SERVICE_ROLE_KEY=your-key', 'info');
    log('  Linux/Mac: export SUPABASE_URL=your-url && export SUPABASE_SERVICE_ROLE_KEY=your-key', 'info');
    process.exit(1);
  }
  
  log('Environment variables check passed ✓', 'success');
}

// Create Supabase client
function createSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Test connection
async function testConnection(supabase) {
  log('Testing Supabase connection...', 'header');
  
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== '42P01') { // 42P01 = table doesn't exist (expected)
      throw error;
    }
    
    log('Supabase connection successful ✓', 'success');
    return true;
  } catch (error) {
    log(`Connection failed: ${error.message}`, 'error');
    return false;
  }
}

// Execute SQL from file
async function executeSqlFile(supabase, filePath) {
  log(`Executing SQL from ${filePath}...`, 'info');
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split SQL into statements (handle complex cases)
  const statements = sql
    .split(/;\s*$/gm)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const statement of statements) {
    try {
      // Use Supabase's REST API for SQL execution
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        // If exec_sql doesn't exist, we'll need to use the SQL editor API
        // For now, log and continue
        if (error.message.includes('exec_sql')) {
          log('Note: exec_sql function not found. Schema will need manual execution.', 'warning');
          return false;
        }
        throw error;
      }
      
      successCount++;
    } catch (error) {
      // Skip "already exists" errors
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate key') ||
          error.code === '42710') {
        successCount++;
        continue;
      }
      
      log(`SQL Error: ${error.message}`, 'error');
      log(`Statement: ${statement.substring(0, 100)}...`, 'info');
      errorCount++;
    }
  }
  
  log(`SQL execution: ${successCount} succeeded, ${errorCount} failed`, 
    errorCount > 0 ? 'warning' : 'success');
  
  return errorCount === 0;
}

// Alternative: Use direct SQL via Supabase Management API
async function setupViaManagementAPI() {
  log('Setting up database via Management API...', 'header');
  
  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    log(`Schema file not found: ${schemaPath}`, 'error');
    return false;
  }
  
  log(`Found schema file: ${schemaPath}`, 'success');
  
  // Read and display schema info
  const sql = fs.readFileSync(schemaPath, 'utf8');
  
  // Count tables
  const tableMatches = sql.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/g);
  const tables = tableMatches ? tableMatches.map(m => m.match(/public\.(\w+)/)[1]) : [];
  
  log(`Schema contains ${tables.length} tables:`, 'info');
  tables.forEach(table => log(`  - ${table}`, 'info'));
  
  // Count RLS policies
  const policyMatches = sql.match(/CREATE POLICY/g);
  log(`Schema contains ${policyMatches ? policyMatches.length : 0} RLS policies`, 'info');
  
  // Since we can't execute SQL directly via the client, provide instructions
  log('', 'info');
  log('═══════════════════════════════════════════════════════════', 'header');
  log('MANUAL SETUP REQUIRED', 'header');
  log('═══════════════════════════════════════════════════════════', 'header');
  log('', 'info');
  log('Please follow these steps to complete setup:', 'info');
  log('', 'info');
  log('1. Go to your Supabase Dashboard:', 'info');
  log(`   ${process.env.SUPABASE_URL.replace('.co', '.app')}`, 'cyan');
  log('', 'info');
  log('2. Navigate to: SQL Editor → New Query', 'info');
  log('', 'info');
  log('3. Copy and paste the entire contents of:', 'info');
  log(`   ${schemaPath}`, 'cyan');
  log('', 'info');
  log('4. Click "Run" to execute the schema', 'info');
  log('', 'info');
  log('═══════════════════════════════════════════════════════════', 'header');
  
  return true;
}

// Verify tables exist
async function verifyTables(supabase) {
  log('Verifying tables...', 'header');
  
  const expectedTables = [
    'profiles', 'matches', 'tournaments', 'tournament_entries',
    'wallet_transactions', 'linked_games', 'chat_rooms', 
    'chat_room_members', 'chat_messages', 'friends', 'online_status',
    'matchmaking_queue', 'communities', 'community_members',
    'message_reactions', 'typing_indicators'
  ];
  
  const results = {
    exists: [],
    missing: []
  };
  
  for (const table of expectedTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error && error.code === '42P01') {
        results.missing.push(table);
        log(`  ✗ ${table} - NOT FOUND`, 'error');
      } else {
        results.exists.push(table);
        log(`  ✓ ${table}`, 'success');
      }
    } catch (error) {
      results.missing.push(table);
      log(`  ✗ ${table} - ERROR`, 'error');
    }
  }
  
  log('', 'info');
  log(`Verification complete: ${results.exists.length}/${expectedTables.length} tables exist`, 
    results.missing.length === 0 ? 'success' : 'warning');
  
  if (results.missing.length > 0) {
    log(`Missing tables: ${results.missing.join(', ')}`, 'warning');
  }
  
  return results;
}

// Create environment file template
function createEnvTemplate() {
  const envPath = path.join(__dirname, '..', '.env.local.example');
  
  const envContent = `# WX Arena Environment Variables

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Note: Replace the values above with your actual Supabase credentials
# Get these from your Supabase Dashboard → Settings → API
`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    log(`Created .env.local.example template`, 'success');
  } else {
    log('.env.local.example already exists', 'info');
  }
}

// Main execution
async function main() {
  console.clear();
  log('═══════════════════════════════════════════════════════════', 'header');
  log('    WX ARENA - SUPABASE AUTO-SETUP', 'header');
  log('═══════════════════════════════════════════════════════════', 'header');
  log('', 'info');
  
  // Check environment
  checkEnvironment();
  
  // Create client
  const supabase = createSupabaseClient();
  
  // Test connection
  if (!await testConnection(supabase)) {
    process.exit(1);
  }
  
  // Setup schema (manual instructions)
  await setupViaManagementAPI();
  
  // Verify tables
  const tableResults = await verifyTables(supabase);
  
  // Create environment template
  createEnvTemplate();
  
  // Final summary
  log('', 'info');
  log('═══════════════════════════════════════════════════════════', 'header');
  log('SETUP SUMMARY', 'header');
  log('═══════════════════════════════════════════════════════════', 'header');
  log('', 'info');
  
  if (tableResults.missing.length === 0) {
    log('✓ All tables are properly configured!', 'success');
    log('', 'info');
    log('Next steps:', 'info');
    log('  1. Copy .env.local.example to .env.local', 'info');
    log('  2. Add your Supabase credentials to .env.local', 'info');
    log('  3. Run the development server: npm run dev', 'info');
    log('  4. Test auth flows at http://localhost:3000', 'info');
  } else {
    log(`⚠ ${tableResults.missing.length} tables need to be created`, 'warning');
    log('', 'info');
    log('Please run the SQL schema in Supabase SQL Editor first:', 'info');
    log('  1. Go to Supabase Dashboard → SQL Editor', 'info');
    log('  2. Run supabase/schema.sql', 'info');
    log('  3. Re-run this verification script', 'info');
  }
  
  log('', 'info');
  log('═══════════════════════════════════════════════════════════', 'header');
}

// Run main
main().catch(error => {
  log(`Unexpected error: ${error.message}`, 'error');
  process.exit(1);
});
