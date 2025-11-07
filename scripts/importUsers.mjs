import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// --- START CONFIGURATION ---

// !! USE YOUR SERVICE ROLE KEY, NOT THE ANON KEY !!
// Find this in your Supabase Project: Settings > API > Project Secrets
const SUPABASE_URL = "https://sfrabtflrzvnrcxgnklm.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcmFidGZscnp2bnJjeGdua2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUxMzU4NSwiZXhwIjoyMDc4MDg5NTg1fQ.MTgsGt4c7Wvh9RXMO7JPOU6XERTZ0Xs1MKlhQn0W7nQ"; // <-- IMPORTANT!

// --- END CONFIGURATION ---


// Create the "Admin" client
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Load the JSON file
const usersFilePath = path.join(path.resolve(), 'scripts', 'users.json');
const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
const users = usersData.users;

async function createUsers() {
  console.log(`Starting to import ${users.length} users...`);

  for (const user of users) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      // We use user_metadata to pass the 'team_name' to our trigger
      user_metadata: { team_name: user.username }, 
      email_confirm: true // We're admin, so we can just mark it as confirmed
    });

    if (error) {
      console.error(`Error creating user ${user.email}:`, error.message);
    } else {
      console.log(`Successfully created user: ${user.email}`);
    }
  }

  console.log('User import complete.');
}

createUsers();