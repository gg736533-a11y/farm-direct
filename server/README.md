# FarmDirect Backend Service (MySQL + XAMPP)

## Setup from scratch on Windows

1. Install Node.js LTS and XAMPP.
2. Open XAMPP Control Panel and start **MySQL**. Apache is only needed if you want phpMyAdmin; start it too for convenience.
3. Open `http://localhost/phpmyadmin`, choose **New**, create a database named `farmdirect`, and choose `utf8mb4_unicode_ci` if asked.
4. Open a terminal in this `server` folder and run `npm install`.
5. Ensure `server/.env` contains `DATABASE_URL="mysql://root:@localhost:3306/farmdirect"`. This matches the usual XAMPP default of user `root` with no password. If you configured a password, add it after `root:` in the URL.
6. Run `npx prisma generate`.
7. Run `npm run db:setup` to create/synchronize the tables.
8. Run `npm run db:seed` to add demo users, farmer, products, order, and favorites. This seed script clears existing FarmDirect records first, so use it only for a fresh/demo database.
9. Run `npm run dev` to start the API at `http://localhost:5000`.
10. Test `http://localhost:5000/api/health`; then run the frontend from the project root with `npm install` and `npm run dev`, and open `http://localhost:5173`.

## Demo accounts
- Consumer: `arun@example.com` / `DemoConsumer123!`
- Farmer: `ravi@farmdirect.example` / `DemoFarmer123!`

If the database connection fails, confirm MySQL is green/running in XAMPP, the `farmdirect` database exists, the port is `3306`, and `DATABASE_URL` matches the MySQL username/password.
