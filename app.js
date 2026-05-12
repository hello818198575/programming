const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
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

app.listen(3000, () => console.log('Server on port 3000'));