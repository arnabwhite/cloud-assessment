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

module.exports = {
  zodiacElements,
  getZodiacScore,
  calculateMatchPercentage
};
