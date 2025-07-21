import { initializeDatabase } from './models/Database.js';

// Initialize the database with tables and default data
try {
  await initializeDatabase();
  console.log('Database seeded successfully!');
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
} 