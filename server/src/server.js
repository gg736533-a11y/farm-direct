import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';

async function bootstrap() {
  console.log('🚀 Initializing FarmDirect Backend Server...');

  // Test MySQL database connection before starting the API.
  try {
    await prisma.$connect();
    console.log('✅ MySQL database connection verified successfully.');
  } catch (err) {
    console.error('❌ Failed to connect to MySQL database:', err.message);
    console.error('Check that XAMPP MySQL is running, the farmdirect database exists, and server/.env has the correct DATABASE_URL.');
    process.exit(1);
  }

  // 3. Start Express HTTP Server
  const server = app.listen(env.PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🌾 FarmDirect API Server is running!`);
    console.log(`📡 URL: http://localhost:${env.PORT}`);
    console.log(`🩺 Health: http://localhost:${env.PORT}/api/health`);
    console.log(`🌐 Client Origin: ${env.CLIENT_URL}`);
    console.log(`🔒 Environment: ${env.NODE_ENV}`);
    console.log(`======================================================\n`);
  });

  // Graceful shutdown handlers
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('👋 FarmDirect Server terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('❌ Fatal server startup error:', err);
  process.exit(1);
});
