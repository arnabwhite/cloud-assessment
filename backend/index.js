const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db', // 'db' is the docker-compose service name
  database: process.env.DB_NAME || 'lovematch',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Initialize database table
const initDB = async () => {
  try {
    // Drop old table to reset schema
    await pool.query('DROP TABLE IF EXISTS matches;');
    
    // Create new table with zodiac and gender columns
    await pool.query(`
      CREATE TABLE matches (
        id SERIAL PRIMARY KEY,
        name1 VARCHAR(255) NOT NULL,
        gender1 VARCHAR(20) NOT NULL,
        zodiac1 VARCHAR(50) NOT NULL,
        name2 VARCHAR(255) NOT NULL,
        gender2 VARCHAR(20) NOT NULL,
        zodiac2 VARCHAR(50) NOT NULL,
        percentage INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully with new schema');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};
initDB();

const { calculateMatchPercentage } = require('./utils');


// API Endpoints
app.post('/api/calculate', async (req, res) => {
  const { name1, gender1, zodiac1, name2, gender2, zodiac2 } = req.body;
  
  if (!name1 || !gender1 || !zodiac1 || !name2 || !gender2 || !zodiac2) {
    return res.status(400).json({ error: 'Please provide all fields' });
  }

  const percentage = calculateMatchPercentage(name1, gender1, zodiac1, name2, gender2, zodiac2);

  try {
    const result = await pool.query(
      'INSERT INTO matches (name1, gender1, zodiac1, name2, gender2, zodiac2, percentage) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name1, gender1, zodiac1, name2, gender2, zodiac2, percentage]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error while saving match' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM matches ORDER BY created_at DESC LIMIT 15'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error while fetching history' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
