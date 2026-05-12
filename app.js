const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const session = require('express-session');
app.use(session({
  secret: 'your-secret-key',  // 本番では環境変数に
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }  // 1日
}));


app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (password.length < 6) return res.status(400).json({ error: 'Password too short' });
  
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
    if (err) return res.status(400).json({ error: 'User exists' });
    res.json({ message: 'User created' });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Login success', userId: user.id });
  });
});


function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required' });
  next();
}


app.get('/courses', requireLogin, (req, res) => {
  db.all('SELECT * FROM courses', (err, courses) => {
    res.json(courses);
  });
});

app.get('/chapters/:courseId', requireLogin, (req, res) => {
  db.all('SELECT * FROM chapters WHERE course_id = ?', [req.params.courseId], (err, chapters) => {
    res.json(chapters);
  });
});

app.listen(3000, () => console.log('Server on port 3000'));