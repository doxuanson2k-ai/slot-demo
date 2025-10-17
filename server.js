const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');

const DATA_FILE = path.join(__dirname, 'data.json');
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {}, leaderboard: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}
function saveData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(require('cors')());

app.post('/api/user', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'missing name' });
  const data = loadData();
  let user = Object.values(data.users).find(u => u.name === name);
  if (!user) {
    const id = shortid.generate();
    user = { id, name, points: 100 };
    data.users[id] = user;
    saveData(data);
  }
  res.json(user);
});

app.post('/api/play', (req, res) => {
  const { userId, bet } = req.body;
  const data = loadData();
  const user = data.users[userId];
  if (!user) return res.status(404).json({ error: 'user not found' });
  if (!bet || bet <= 0) return res.status(400).json({ error: 'invalid bet' });
  if (user.points < bet) return res.status(400).json({ error: 'not enough points' });

  const symbols = ['🍒','🍋','🔔','🍀','7️⃣'];
  const r = [
    symbols[Math.floor(Math.random()*symbols.length)],
    symbols[Math.floor(Math.random()*symbols.length)],
    symbols[Math.floor(Math.random()*symbols.length)]
  ];

  let payout = 0;
  if (r[0] === r[1] && r[1] === r[2]) {
    payout = bet * (r[0] === '7️⃣' ? 10 : 5);
  } else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) {
    payout = bet * 2;
  }

  user.points = user.points - bet + payout;

  const existingIndex = data.leaderboard.findIndex(x => x.id === user.id);
  if (existingIndex === -1) data.leaderboard.push({ id: user.id, name: user.name, points: user.points });
  else data.leaderboard[existingIndex].points = user.points;

  data.leaderboard.sort((a,b)=>b.points-a.points);
  data.leaderboard = data.leaderboard.slice(0, 20);
  saveData(data);
  res.json({ reels: r, payout, points: user.points });
});

app.get('/api/leaderboard', (req, res) => {
  const data = loadData();
  res.json(data.leaderboard || []);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
