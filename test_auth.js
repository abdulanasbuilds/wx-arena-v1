const { createClient } = require('@supabase/supabase-js');
  
const supabase = createClient(
  'https://rhjrnploeuvmknttimme.supabase.co',
  'sb_publishable_3CVjEhBuzB8Wpxc1_TUEtQ_uOhFougN'
);

async function testAuth() {
  const email = `testuser_${Date.now()}@gmail.com`;
  console.log("Signing up:", email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
    options: { data: { username: `test_${Math.floor(Date.now()/1000)}` } }
  });

  if (error) {
    console.error("SignUp Error:", error.message);
    return;
  }
  
  console.log("User Data:", data.user?.id);
  
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
    
  if (profileErr) console.error("Profile Error:", profileErr.message);
  else console.log("Profile points:", profile.points);
  
  const { data: wallet } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', data.user.id);
    
  console.log("Wallet txs:", wallet?.length);
  
  if (wallet?.length) {
    console.log("Wallet first tx:", wallet[0]);
  }
}
testAuth();
