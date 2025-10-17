let currentUser = null;
async function api(path, method='GET', body) {
  const opts = { method, headers: {} };
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const res = await fetch('/api' + path, opts);
  return res.json();
}
document.getElementById('btn-login').addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  if (!name) return alert('Nhập tên trước đã!');
  const user = await api('/user', 'POST', { name });
  currentUser = user;
  document.getElementById('player-name').textContent = user.name;
  document.getElementById('player-points').textContent = user.points;
  document.getElementById('login').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  loadLeaderboard();
});
document.getElementById('spin').addEventListener('click', async () => {
  if (!currentUser) return alert('Bạn chưa đăng nhập!');
  const bet = Number(document.getElementById('bet').value) || 1;
  const res = await api('/play', 'POST', { userId: currentUser.id, bet });
  if (res.error) return alert(res.error);
  const reels = ['reel0','reel1','reel2'];
  const symbols = ['🍒','🍋','🔔','🍀','7️⃣'];
  for (let i=0;i<15;i++){
    reels.forEach((r)=> document.getElementById(r).textContent = symbols[Math.floor(Math.random()*symbols.length)]);
    await new Promise(r=>setTimeout(r, 40 + i*2));
  }
  document.getElementById('reel0').textContent = res.reels[0];
  document.getElementById('reel1').textContent = res.reels[1];
  document.getElementById('reel2').textContent = res.reels[2];
  document.getElementById('result').textContent = `Bạn thắng: ${res.payout} điểm. Điểm hiện tại: ${res.points}`;
  document.getElementById('player-points').textContent = res.points;
  currentUser.points = res.points;
  loadLeaderboard();
});
async function loadLeaderboard(){
  const lb = await api('/leaderboard');
  const el = document.getElementById('leaderboard');
  el.innerHTML = '';
  lb.forEach((p, idx) => {
    const li = document.createElement('li');
    li.textContent = `${idx+1}. ${p.name} — ${p.points} điểm`;
    el.appendChild(li);
  });
}
const TG_USERNAME = 'cskhsd666'; // 🔹 Thay bằng username Telegram thật, không có @
const tgTextEl = document.getElementById('tg-text');
const tgLinkEl = document.getElementById('tg-link');
function openTelegramModal() {
  const name = currentUser ? currentUser.name : '[tên của bạn]';
  const sampleMsg = `Xin chào CSKH, tôi muốn được cộng điểm cho tài khoản tên: ${name}. Lý do: Yêu cầu Cộng điểm (demo). ID người chơi: ${currentUser ? currentUser.id : 'N/A'}`;
  tgTextEl.textContent = sampleMsg;
  tgLinkEl.href = `https://t.me/${TG_USERNAME}?text=${encodeURIComponent(sampleMsg)}`;
  document.getElementById('telegram-modal').classList.remove('hidden');
}
document.getElementById('btn-topup').addEventListener('click', () => openTelegramModal());
document.getElementById('close-tg').addEventListener('click', ()=> document.getElementById('telegram-modal').classList.add('hidden'));
