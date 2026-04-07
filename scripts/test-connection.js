// Test Supabase Connection with Publishable Key
// Run: node scripts/test-connection.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rhjrnploeuvmknttimme.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3CVjEhBuzB8Wpxc1_TUEtQ_uOhFougN';

async function testConnection() {
  console.log('\n🔌 Testing Supabase Connection...\n');
  console.log('URL:', SUPABASE_URL);
  console.log('Key Format:', SUPABASE_KEY.startsWith('sb_publishable_') ? '✅ NEW Publishable Key' : 'Legacy Anon Key');
  console.log('');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Test 1: Basic Connection
    console.log('Test 1: Basic Connection...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Auth Error:', authError.message);
    } else {
      console.log('✅ Auth API Connected');
    }

    // Test 2: Database Connection
    console.log('\nTest 2: Database Tables...');
    const tables = ['profiles', 'matches', 'tournaments', 'wallet_transactions', 'matchmaking_queue'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`⚠️  Table '${table}' - NOT CREATED (run schema.sql)`);
        } else if (error.message.includes('permission denied')) {
          console.log(`⚠️  Table '${table}' - RLS Policy issue`);
        } else {
          console.log(`❌ Table '${table}' - ${error.message}`);
        }
      } else {
        console.log(`✅ Table '${table}' - Connected (count: ${data})`);
      }
    }

    // Test 3: Edge Functions
    console.log('\nTest 3: Edge Functions...');
    const functions = ['matchmaking', 'payments'];
    
    for (const fn of functions) {
      try {
        const { data, error } = await supabase.functions.invoke(fn, {
          body: { test: true }
        });
        
        if (error) {
          console.log(`⚠️  Function '${fn}' - ${error.message}`);
        } else {
          console.log(`✅ Function '${fn}' - Responding`);
        }
      } catch (e) {
        console.log(`⚠️  Function '${fn}' - ${e.message}`);
      }
    }

    // Test 4: Realtime
    console.log('\nTest 4: Realtime Connection...');
    const channel = supabase.channel('test-channel');
    
    channel
      .on('broadcast', { event: 'test' }, (payload) => {
        console.log('✅ Realtime broadcast received');
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime Connected (SUBSCRIBED)');
          channel.unsubscribe();
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Realtime Connection Error');
        }
      });

    setTimeout(() => {
      console.log('\n📊 Connection Test Complete!\n');
      console.log('Next Steps:');
      console.log('1. If tables are missing, run: node scripts/setup-supabase.js');
      console.log('2. If RLS errors, check RLS policies in Supabase Dashboard');
      console.log('3. Start dev server: npm run dev');
      console.log('');
    }, 2000);

  } catch (error) {
    console.error('\n❌ Connection Failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('- Check if Supabase project is active');
    console.log('- Verify publishable key is correct');
    console.log('- Ensure network connection is stable');
    console.log('');
  }
}

testConnection();
