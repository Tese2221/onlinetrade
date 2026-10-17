import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';

const serverDirectory = fileURLToPath(new URL('..', import.meta.url));
dotenv.config({ path: path.resolve(serverDirectory, '../.env') });

const migration = spawnSync(process.execPath, ['src/db/migrate.js'], {
  cwd: serverDirectory,
  env: process.env,
  stdio: 'inherit',
});

if (migration.error) throw migration.error;
if (migration.status !== 0) process.exit(migration.status ?? 1);

await import('./server.js');
