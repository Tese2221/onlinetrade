import { pool } from './server/src/db/pool.js';
import { ADMIN_PRIVILEGES } from './server/src/lib/adminPrivileges.js';

async function fixAdminPrivileges() {
  const check = await pool.query("SELECT id, phone_number, role, is_super_admin, privileges FROM users WHERE phone_number = '900000000'");
  console.log('BEFORE:', check.rows);

  // Set is_super_admin = true and all privileges for user 900000000
  await pool.query(
    "UPDATE users SET is_super_admin = true, privileges = $1::jsonb WHERE phone_number = '900000000'",
    [JSON.stringify(['*', ...ADMIN_PRIVILEGES])]
  );

  const after = await pool.query("SELECT id, phone_number, role, is_super_admin, privileges FROM users WHERE phone_number = '900000000'");
  console.log('AFTER:', after.rows);
  process.exit(0);
}

fixAdminPrivileges().catch(e => { console.error(e); process.exit(1); });
