const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});
db.run(`CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS chapters (
  id INTEGER PRIMARY KEY,
  course_id INTEGER,
  title TEXT,
  content TEXT,
  FOREIGN KEY(course_id) REFERENCES courses(id)
)`);

// 初期データ挿入（初回のみ）
db.run("INSERT OR IGNORE INTO courses (id, title) VALUES (1, 'Web基礎')");
db.run("INSERT OR IGNORE INTO chapters (id, course_id, title, content) VALUES (1, 1, 'HTML基礎', 'HTMLはウェブページの構造を作る言語です。<h1>見出し</h1><p>段落</p>のようにタグを使います。次は自分で試してみましょう。')");

module.exports = db;