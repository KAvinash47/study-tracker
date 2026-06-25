import pool from './db.js';

export default async function handler(req, res) {
  // 1. Authenticate with X-Sync-Key header
  const syncKey = req.headers['x-sync-key'];
  const expectedKey = process.env.SYNC_PASSPHRASE;

  if (!expectedKey) {
    return res.status(500).json({ error: "Server misconfiguration: SYNC_PASSPHRASE environment variable is not set on Vercel." });
  }

  if (syncKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized: Invalid sync passphrase." });
  }

  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      // Fetch all tables
      const todosRes = await client.query('SELECT * FROM todos ORDER BY id DESC');
      const targetsRes = await client.query('SELECT * FROM targets ORDER BY id ASC');
      const syllabusRes = await client.query('SELECT * FROM syllabus ORDER BY id ASC');
      const mistakesRes = await client.query('SELECT * FROM mistakes ORDER BY id DESC');
      const pyqsRes = await client.query('SELECT * FROM pyqs ORDER BY id DESC');
      const logsRes = await client.query('SELECT * FROM logs ORDER BY log_date DESC');
      const spacedReviewsRes = await client.query('SELECT * FROM spaced_reviews ORDER BY scheduled_date ASC');

      // Reconstruct syllabus object
      const syllabus = {};
      syllabusRes.rows.forEach(row => {
        if (!syllabus[row.subject]) {
          syllabus[row.subject] = [];
        }
        syllabus[row.subject].push({
          chapter: row.chapter,
          status: row.status
        });
      });

      // Reconstruct logs object
      const logs = {};
      logsRes.rows.forEach(row => {
        // Format date to YYYY-MM-DD
        const dateStr = new Date(row.log_date).toISOString().split('T')[0];
        logs[dateStr] = {
          studied: row.studied,
          hours: row.hours,
          energy: row.energy,
          reason: row.reason || '',
          topics: row.topics || '',
          notes: row.notes || ''
        };
      });

      // Map DB fields back to client fields
      const todos = todosRes.rows;
      const targets = targetsRes.rows.map(row => ({
        day: row.day,
        targetHours: row.target_hours,
        actualHours: row.actual_hours
      }));
      const mistakes = mistakesRes.rows.map(row => ({
        id: parseInt(row.id),
        question: row.question,
        reason: row.reason,
        concept: row.concept,
        revisionDate: new Date(row.revision_date).toISOString().split('T')[0],
        done: row.done
      }));
      const pyqs = pyqsRes.rows.map(row => ({
        id: parseInt(row.id),
        subject: row.subject,
        topic: row.topic,
        difficulty: row.difficulty,
        year: row.year,
        attempt: row.attempt,
        analysis: row.analysis
      }));
      const spacedReviews = spacedReviewsRes.rows.map(row => ({
        id: row.id,
        chapter: row.chapter,
        subject: row.subject,
        scheduledDate: new Date(row.scheduled_date).toISOString().split('T')[0],
        completed: row.completed
      }));

      return res.status(200).json({
        todos,
        targets,
        syllabus,
        mistakes,
        pyqs,
        logs,
        spacedReviews
      });
    }

    if (req.method === 'POST') {
      const { todos, targets, syllabus, mistakes, pyqs, logs, spacedReviews } = req.body;

      await client.query('BEGIN');

      // Clear existing records
      await client.query('DELETE FROM todos');
      await client.query('DELETE FROM targets');
      await client.query('DELETE FROM syllabus');
      await client.query('DELETE FROM mistakes');
      await client.query('DELETE FROM pyqs');
      await client.query('DELETE FROM logs');
      await client.query('DELETE FROM spaced_reviews');

      // Insert TODOS
      if (Array.isArray(todos)) {
        for (const todo of todos) {
          await client.query(
            'INSERT INTO todos(id, text, completed) VALUES($1, $2, $3)',
            [todo.id, todo.text, todo.completed]
          );
        }
      }

      // Insert TARGETS
      if (Array.isArray(targets)) {
        for (const target of targets) {
          await client.query(
            'INSERT INTO targets(day, target_hours, actual_hours) VALUES($1, $2, $3)',
            [target.day, target.targetHours || 0, target.actualHours || 0]
          );
        }
      }

      // Insert SYLLABUS
      if (syllabus && typeof syllabus === 'object') {
        for (const subject of Object.keys(syllabus)) {
          const chapters = syllabus[subject];
          if (Array.isArray(chapters)) {
            for (const ch of chapters) {
              await client.query(
                'INSERT INTO syllabus(subject, chapter, status) VALUES($1, $2, $3)',
                [subject, ch.chapter, ch.status]
              );
            }
          }
        }
      }

      // Insert MISTAKES
      if (Array.isArray(mistakes)) {
        for (const m of mistakes) {
          await client.query(
            'INSERT INTO mistakes(id, question, reason, concept, revision_date, done) VALUES($1, $2, $3, $4, $5, $6)',
            [m.id, m.question, m.reason, m.concept, m.revisionDate, m.done]
          );
        }
      }

      // Insert PYQS
      if (Array.isArray(pyqs)) {
        for (const p of pyqs) {
          await client.query(
            'INSERT INTO pyqs(id, subject, topic, difficulty, year, attempt, analysis) VALUES($1, $2, $3, $4, $5, $6, $7)',
            [p.id, p.subject, p.topic, p.difficulty, p.year, p.attempt, p.analysis]
          );
        }
      }

      // Insert LOGS
      if (logs && typeof logs === 'object') {
        for (const dateStr of Object.keys(logs)) {
          const log = logs[dateStr];
          await client.query(
            'INSERT INTO logs(log_date, studied, hours, energy, reason, topics, notes) VALUES($1, $2, $3, $4, $5, $6, $7)',
            [dateStr, log.studied || false, log.hours || 0, log.energy || '', log.reason || '', log.topics || '', log.notes || '']
          );
        }
      }

      // Insert SPACED REVIEWS
      if (Array.isArray(spacedReviews)) {
        for (const sr of spacedReviews) {
          await client.query(
            'INSERT INTO spaced_reviews(id, chapter, subject, scheduled_date, completed) VALUES($1, $2, $3, $4, $5)',
            [sr.id, sr.chapter, sr.subject, sr.scheduledDate, sr.completed]
          );
        }
      }

      await client.query('COMMIT');
      return res.status(200).json({ success: true, message: "Database synchronized successfully!" });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });

  } catch (error) {
    if (req.method === 'POST') {
      await client.query('ROLLBACK');
    }
    console.error("Database Sync Error:", error);
    return res.status(500).json({ error: "Database execution failed.", details: error.message });
  } finally {
    client.release();
  }
}
