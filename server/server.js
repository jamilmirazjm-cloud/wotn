require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { requestGroqPrediction } = require('./groq');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'wotn-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

// ============================================================================
// Database Initialization — create tables if they don't exist
// ============================================================================
async function initDb() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
initDb().catch(console.error);

// ============================================================================
// Auth Middleware — verify JWT on all protected routes
// ============================================================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user_id = payload.id;
    next();
  });
}

// ============================================================================
// Auth Routes — public (no token required)
// ============================================================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db.query(
      `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at`,
      [username.toLowerCase().trim(), passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username already taken' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await db.query(
      `SELECT id, username, password_hash FROM users WHERE username = $1`,
      [username.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me — verify token + return user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, created_at FROM users WHERE id = $1`,
      [req.user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// Apply auth middleware to all remaining /api/* routes
// ============================================================================
app.use('/api', authenticateToken);

// ============================================================================
// People Routes
// ============================================================================

// GET /api/people
app.get('/api/people', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.relationship_type, p.first_impression, p.created_at,
        (SELECT COUNT(*) FROM observations o WHERE o.person_id = p.id) as observationCount,
        (SELECT MAX(logged_at) FROM observations o WHERE o.person_id = p.id) as lastObservationDate
       FROM people p WHERE user_id = $1 ORDER BY p.created_at DESC`,
      [req.user_id]
    );
    result.rows.forEach(r => r.observationcount = parseInt(r.observationcount || 0));
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/people
app.post('/api/people', async (req, res) => {
  const { name, relationshipType, firstImpression } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO people (user_id, name, relationship_type, first_impression)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user_id, name, relationshipType, firstImpression]
    );
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Person already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/people/:personId
app.get('/api/people/:personId', async (req, res) => {
  const { personId } = req.params;
  try {
    const personRes = await db.query('SELECT * FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (personRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const obsRes = await db.query('SELECT * FROM observations WHERE person_id = $1 ORDER BY logged_at DESC', [personId]);
    const predRes = await db.query('SELECT * FROM predictions WHERE person_id = $1 ORDER BY created_at DESC', [personId]);
    const outRes = await db.query('SELECT * FROM outcomes WHERE person_id = $1 ORDER BY created_at DESC', [personId]);

    const person = personRes.rows[0];
    person.observations = obsRes.rows;
    person.predictions = predRes.rows;
    person.outcomes = outRes.rows;

    res.json(person);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// Observation Routes
// ============================================================================

// POST /api/observations
app.post('/api/observations', async (req, res) => {
  const { personId, text, tags, sentiment } = req.body;
  try {
    const verify = await db.query('SELECT 1 FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (verify.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const result = await db.query(
      `INSERT INTO observations (person_id, text, tags, sentiment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [personId, text, tags || [], sentiment]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/observations/:personId
app.get('/api/observations/:personId', async (req, res) => {
  const { personId } = req.params;
  try {
    const verify = await db.query('SELECT 1 FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (verify.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const result = await db.query('SELECT * FROM observations WHERE person_id = $1 ORDER BY logged_at DESC', [personId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// Prediction Routes
// ============================================================================

// POST /api/predict
app.post('/api/predict', async (req, res) => {
  const { personId, goal } = req.body;
  try {
    const personRes = await db.query('SELECT * FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (personRes.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const obsRes = await db.query('SELECT * FROM observations WHERE person_id = $1 ORDER BY logged_at DESC LIMIT 20', [personId]);

    const prediction = await requestGroqPrediction(personRes.rows[0], obsRes.rows, goal);

    const insertRes = await db.query(
      `INSERT INTO predictions (person_id, goal, behavioral_tendencies, personality_read, action_cards, data_quality, prediction_note, groq_response)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        personId, goal,
        prediction.behavioral_tendencies || [],
        JSON.stringify(prediction.personality_read || {}),
        JSON.stringify(prediction.action_cards || []),
        prediction.data_quality,
        prediction.prediction_note,
        JSON.stringify(prediction)
      ]
    );

    res.json(insertRes.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ============================================================================
// Outcome Routes
// ============================================================================

// POST /api/outcomes
app.post('/api/outcomes', async (req, res) => {
  const { personId, predictionId, goal, whatHappened, accuracyRating } = req.body;
  try {
    const verify = await db.query('SELECT 1 FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (verify.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const result = await db.query(
      `INSERT INTO outcomes (person_id, prediction_id, goal, what_happened, prediction_accuracy_rating)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [personId, predictionId, goal, whatHappened, accuracyRating]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/outcomes/:personId
app.get('/api/outcomes/:personId', async (req, res) => {
  const { personId } = req.params;
  try {
    const verify = await db.query('SELECT 1 FROM people WHERE id = $1 AND user_id = $2', [personId, req.user_id]);
    if (verify.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });

    const result = await db.query('SELECT * FROM outcomes WHERE person_id = $1 ORDER BY created_at DESC', [personId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// Static Frontend (production)
// ============================================================================
app.use(express.static(path.join(__dirname, '../dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`WOTN Backend running on port ${PORT}`);
});
