import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'study_store.json');

app.use(express.json({ limit: '50mb' }));

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoreData {
  sessions: any[];
  participants: any[];
  storageConfig: {
    storageEmail: string;
    secondaryEmail?: string;
    autoEmailDigest: boolean;
    cloudSyncEnabled: boolean;
    studyTitle: string;
    targetCount: number;
    lastExportAt?: number;
  };
}

const defaultStore: StoreData = {
  sessions: [],
  participants: [],
  storageConfig: {
    storageEmail: 'research-archive@golfdiscovery.org',
    secondaryEmail: '',
    autoEmailDigest: true,
    cloudSyncEnabled: true,
    studyTitle: '5-Cohort Golf Discovery Study (25 Per Cohort)',
    targetCount: 125,
  },
};

function readDb(): StoreData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading study DB, using defaults:', err);
  }
  return { ...defaultStore };
}

function writeDb(data: StoreData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing study DB:', err);
  }
}

// REST Endpoints
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Full study state (sessions, participants, config)
app.get('/api/study', (_req, res) => {
  const data = readDb();
  res.json({
    sessions: data.sessions || [],
    participants: data.participants || [],
    storageConfig: data.storageConfig || defaultStore.storageConfig,
    stats: {
      totalStoredSessions: (data.sessions || []).length,
      storageEmail: data.storageConfig?.storageEmail || defaultStore.storageConfig.storageEmail,
      dbFileSizeKb: fs.existsSync(DB_FILE) ? Math.round(fs.statSync(DB_FILE).size / 1024) : 0,
    },
  });
});

// Save or update an interview session
app.post('/api/sessions', (req, res) => {
  const session = req.body;
  if (!session || !session.id) {
    return res.status(400).json({ error: 'Valid session object required' });
  }

  const db = readDb();
  const existingIdx = db.sessions.findIndex((s) => s.id === session.id);
  if (existingIdx >= 0) {
    db.sessions[existingIdx] = session;
  } else {
    db.sessions.unshift(session);
  }

  // Update matching participant status if applicable
  if (session.participantId && db.participants) {
    const pIdx = db.participants.findIndex((p) => p.id === session.participantId);
    if (pIdx >= 0) {
      db.participants[pIdx].status = 'completed';
      db.participants[pIdx].sessionId = session.id;
    }
  }

  writeDb(db);
  res.json({ success: true, session, totalSessions: db.sessions.length });
});

// Delete an interview session
app.delete('/api/sessions/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const deletedSession = db.sessions.find((s) => s.id === id);
  db.sessions = db.sessions.filter((s) => s.id !== id);

  // If was linked to a participant, reset participant status
  if (deletedSession?.participantId && db.participants) {
    const pIdx = db.participants.findIndex((p) => p.id === deletedSession.participantId);
    if (pIdx >= 0) {
      db.participants[pIdx].status = 'not_started';
      delete db.participants[pIdx].sessionId;
    }
  }

  writeDb(db);
  res.json({ success: true, remaining: db.sessions.length });
});

// Clear all interview sessions
app.post('/api/sessions/clear', (_req, res) => {
  const db = readDb();
  db.sessions = [];
  if (db.participants) {
    db.participants.forEach((p) => {
      p.status = 'not_started';
      delete p.sessionId;
    });
  }
  writeDb(db);
  res.json({ success: true });
});

// Update participants roster
app.get('/api/participants', (_req, res) => {
  const db = readDb();
  res.json(db.participants || []);
});

app.post('/api/participants', (req, res) => {
  const participants = req.body;
  const db = readDb();
  db.participants = participants;
  writeDb(db);
  res.json({ success: true, count: db.participants.length });
});

// Get/Update Storage Email Config
app.get('/api/storage/config', (_req, res) => {
  const db = readDb();
  res.json(db.storageConfig || defaultStore.storageConfig);
});

app.post('/api/storage/config', (req, res) => {
  const newConfig = req.body;
  if (!newConfig || !newConfig.storageEmail) {
    return res.status(400).json({ error: 'Valid storageEmail is required' });
  }

  const db = readDb();
  db.storageConfig = {
    ...db.storageConfig,
    ...newConfig,
    lastExportAt: Date.now(),
  };
  writeDb(db);
  res.json({ success: true, storageConfig: db.storageConfig });
});

// Generate email dispatch briefing package for the target storage email
app.post('/api/storage/generate-package', (req, res) => {
  const { storageEmailOverride } = req.body || {};
  const db = readDb();
  const targetEmail = storageEmailOverride || db.storageConfig?.storageEmail || defaultStore.storageConfig.storageEmail;
  const sessions = db.sessions || [];

  const completedCount = sessions.length;
  const targetCount = db.storageConfig?.targetCount || 25;

  // Executive summary markdown
  let summary = `# GOLF CUSTOMER DISCOVERY STUDY — 25 PARTICIPANT ARCHIVE\n`;
  summary += `**Target Storage Email:** ${targetEmail}\n`;
  summary += `**Generated:** ${new Date().toLocaleString()}\n`;
  summary += `**Progress:** ${completedCount} of ${targetCount} Interviews Completed (${Math.round((completedCount / targetCount) * 100)}%)\n\n`;

  summary += `## Sessions Included (${completedCount})\n`;
  sessions.forEach((s, idx) => {
    summary += `### [${idx + 1}/${completedCount}] ${s.participantName || 'Anonymous'} (${s.cohortName} - ${s.modeName})\n`;
    summary += `- Date: ${new Date(s.timestamp).toLocaleDateString()}\n`;
    summary += `- Questions Covered: ${s.questionsAnswered} of ${s.totalQuestions}\n`;
    summary += `- Audio Time: ${Math.floor(s.recordedSeconds / 60)}m ${s.recordedSeconds % 60}s\n`;
    if (s.notes) {
      summary += `- Notes: ${s.notes.slice(0, 300)}${s.notes.length > 300 ? '...' : ''}\n`;
    }
    summary += `\n`;
  });

  res.json({
    targetEmail,
    subject: `Golf Discovery Study Archive: ${completedCount}/${targetCount} Completed Interviews`,
    summaryText: summary,
    fullDataJson: JSON.stringify(sessions, null, 2),
    timestamp: Date.now(),
  });
});

// Boot dev server with Vite or static production build
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Golf Discovery Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
