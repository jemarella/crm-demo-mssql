import bcrypt from 'bcrypt';
import { execute, query } from '../lib/database'; // Correct import
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

async function seedUsers() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await execute(
        `INSERT INTO users (id, name, email, password) 
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        [user.id, user.name, user.email, hashedPassword]
      );
    }),
  );

  return insertedUsers;
}

async function seedCustomers() {
  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `);

  const insertedCustomers = await Promise.all(
    customers.map(async (customer) => {
      await execute(
        `INSERT INTO customers (id, name, email, image_url)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        [customer.id, customer.name, customer.email, customer.image_url]
      );
    }),
  );

  return insertedCustomers;
}

async function seedInvoices() {
  await query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id VARCHAR(36) PRIMARY KEY,
      customer_id VARCHAR(36) NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `);

  const insertedInvoices = await Promise.all(
    invoices.map(async (invoice) => {
      await execute(
        `INSERT INTO invoices (id, customer_id, amount, status, date)
         VALUES (UUID(), ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        [invoice.customer_id, invoice.amount, invoice.status, invoice.date]
      );
    }),
  );

  return insertedInvoices;
}

async function seedRevenue() {
  await query(`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `);

  const insertedRevenue = await Promise.all(
    revenue.map(async (rev) => {
      await execute(
        `INSERT INTO revenue (month, revenue)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE month=month`,
        [rev.month, rev.revenue]
      );
    }),
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    // Execute sequentially to ensure proper table creation order
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seeding error:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}