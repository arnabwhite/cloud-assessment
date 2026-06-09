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

// Zodiac Elements Mapping
const zodiacElements = {
  'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
  'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
  'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
  'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
};

// Zodiac Compatibility Algorithm
const getZodiacScore = (z1, z2) => {
  const e1 = zodiacElements[z1];
  const e2 = zodiacElements[z2];
  
  if (!e1 || !e2) return 20; // Default fallback
  if (e1 === e2) return 50; // Same element: Great match (50 pts)
  
  // Fire & Air are compatible
  if ((e1 === 'Fire' && e2 === 'Air') || (e1 === 'Air' && e2 === 'Fire')) return 40;
  // Earth & Water are compatible
  if ((e1 === 'Earth' && e2 === 'Water') || (e1 === 'Water' && e2 === 'Earth')) return 40;
  
  // Opposites / Neutral
  return 25; 
};

// Algorithm for Love Match
const calculateMatchPercentage = (n1, g1, z1, n2, g2, z2) => {
  const combinedNames = (n1 + n2).toLowerCase().replace(/[^a-z]/g, '');
  if (combinedNames.length === 0) return 0;
  
  // 1. Zodiac Score (max 50)
  const zodiacScore = getZodiacScore(z1, z2);
  
  // 2. Name Hash Score (max 40)
  let hash = 0;
  for (let i = 0; i < combinedNames.length; i++) {
    hash = (hash << 5) - hash + combinedNames.charCodeAt(i);
    hash |= 0;
  }
  const nameScore = Math.abs(hash) % 41; // 0-40
  
  // 3. Gender Bonus (max 10)
  // Just a fun deterministic addition based on gender strings length combined with name length
  const genderHash = (g1.length + g2.length + combinedNames.length) % 11; // 0-10
  
  let totalScore = zodiacScore + nameScore + genderHash;
  if (totalScore > 100) totalScore = 100;
  
  return totalScore;
};

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
