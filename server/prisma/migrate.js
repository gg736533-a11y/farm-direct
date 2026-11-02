import { execSync } from 'node:child_process';

async function main() {
  console.log('Checking connection to MySQL via Prisma...');
  console.log('Applying FarmDirect schema to the MySQL database...');
  execSync('npx prisma db push', {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
  });
  console.log('MySQL database schema synchronized successfully.');
}

main().catch((err) => {
  console.error('Database schema setup failed:', err.message);
  process.exit(1);
});
