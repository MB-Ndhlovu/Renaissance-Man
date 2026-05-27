import { Database } from "bun:sqlite";

let db: Database | null = null;

export function getDb() {
  if (!db) {
    db = new Database("/tmp/renaissance.db");
    db.run("PRAGMA journal_mode = WAL");
    initSchema();
  }
  return db;
}

function initSchema() {
  db!.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      skill_one_label TEXT DEFAULT 'Skill 1',
      skill_two_label TEXT DEFAULT 'Skill 2',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS default_habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      habit_id INTEGER NOT NULL,
      custom_label TEXT,
      active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (habit_id) REFERENCES default_habits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS habit_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (habit_id) REFERENCES default_habits(id) ON DELETE CASCADE,
      UNIQUE(user_id, habit_id, date)
    );
  `);

  // Seed defaults if empty
  const count = db!.query("SELECT COUNT(*) as c FROM default_habits").get() as { c: number };
  if (count.c === 0) {
    const defaults = [
      ["Wake Up Early", "sun", "mindset", 1],
      ["Meditate", "brain", "mindset", 2],
      ["Gratitude Journal", "book", "mindset", 3],
      ["Cold Shower", "droplet", "health", 4],
      ["Sleep by 10 PM", "moon", "health", 5],
      ["No Phone 30min before bed", "phone_off", "health", 6],
      ["Gym Session", "dumbbell", "fitness", 7],
      ["Zone 2 Cardio", "heart-pulse", "fitness", 8],
      ["Read 30min", "book-open", "knowledge", 9],
      ["Anki Flashcards", "layers", "knowledge", 10],
      ["Code 1hr", "code-2", "knowledge", 11],
      ["Spanish Lesson", "languages", "knowledge", 12],
    ];
    const insert = db!.prepare("INSERT INTO default_habits (name, icon, category, sort_order) VALUES (?, ?, ?, ?)");
    for (const d of defaults) insert.run(...d);
  }
}

export function createUser(email: string, passwordHash: string, name: string) {
  const result = getDb().prepare(
    "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?) RETURNING id"
  ).get(email, passwordHash, name) as { id: number } | undefined;
  return result?.id;
}

export function getUserByEmail(email: string) {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
}

export function getUserHabitsWithTodayStatus(userId: number, date: string) {
  const db = getDb();
  const habits = db.prepare(`
    SELECT uh.id, uh.active, uh.custom_label,
           dh.name, dh.icon, dh.category,
           he.id as entry_id, he.completed, he.notes
    FROM user_habits uh
    JOIN default_habits dh ON dh.id = uh.habit_id
    LEFT JOIN habit_entries he ON he.habit_id = dh.id AND he.date = ? AND he.user_id = ?
    WHERE uh.user_id = ?
    ORDER BY dh.sort_order
  `).all(date, userId, userId) as any[];
  return habits;
}

export function populateDefaultHabitsForUser(userId: number) {
  const db = getDb();
  const defaults = db.prepare("SELECT id FROM default_habits").all() as { id: number }[];
  const insert = db.prepare("INSERT OR IGNORE INTO user_habits (user_id, habit_id) VALUES (?, ?)");
  for (const d of defaults) insert.run(userId, d.id);
}

export function toggleHabitCompletion(userId: number, habitId: number, date: string, completed: boolean) {
  const db = getDb();
  db.prepare(`
    INSERT INTO habit_entries (user_id, habit_id, date, completed)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, habit_id, date) DO UPDATE SET completed = excluded.completed
  `).run(userId, habitId, date, completed ? 1 : 0);
}

export function getStreak(userId: number, habitId: number) {
  const rows = getDb().prepare(`
    SELECT date FROM habit_entries
    WHERE user_id = ? AND habit_id = ? AND completed = 1
    ORDER BY date DESC
  `).all(userId, habitId) as { date: string }[];
  if (!rows.length) return 0;
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const row of rows) {
    const d = new Date(row.date + "T00:00:00");
    const diff = Math.floor((cursor.getTime() - d.getTime()) / 86400000);
    if (diff <= 1) { streak++; cursor = d; }
    else break;
  }
  return streak;
}

export function getUserStats(userId: number, month: string) {
  const db = getDb();
  const days = new Date(month + "-01").getDate();
  const start = month + "-01";
  const end = month + "-" + String(days).padStart(2, "0");

  const total = db.prepare(`
    SELECT COUNT(*) as c FROM habit_entries
    WHERE user_id = ? AND date >= ? AND date <= ? AND completed = 1
  `).get(userId, start, end) as { c: number };

  const possible = db.prepare(`
    SELECT COUNT(*) as c FROM user_habits uh
    JOIN default_habits dh ON dh.id = uh.habit_id
    WHERE uh.user_id = ? AND uh.active = 1
  `).get(userId) as { c: number };

  return {
    completed: total.c,
    possible: possible.c * days,
    percentage: possible.c * days > 0 ? Math.round((total.c / (possible.c * days)) * 100) : 0,
  };
}

export function updateUserSettings(userId: number, settings: any) {
  getDb().prepare(`
    UPDATE users SET skill_one_label = ?, skill_two_label = ?
    WHERE id = ?
  `).run(settings.skill_one_label, settings.skill_two_label, userId);
}