const timeButtons = [...document.querySelectorAll('.time-option')];
const activityButtons = [...document.querySelectorAll('.activity-card')];
const planner = document.getElementById('planner');
const timerPanel = document.getElementById('timer-panel');
const completionPanel = document.getElementById('completion-panel');
const countdown = document.getElementById('countdown');
const progressBar = document.getElementById('progress-bar');
const timerStatus = document.getElementById('timer-status');
const toggleButton = document.getElementById('toggle-button');
const resetButton = document.getElementById('reset-button');
const startButton = document.getElementById('start-button');

const activities = {
  'Gardening': { emoji: '🪴', title: 'Time to get growing.', missions: ['Water a plant or gently clear away a few weeds.', 'Check on a plant and notice one new detail.', 'Spend a few minutes caring for something green.'] },
  'Walking': { emoji: '🚶', title: 'Take the scenic route.', missions: ['Walk at a comfortable pace without checking your phone.', 'Notice three things you have never paid attention to before.', 'Find a safe, pleasant route and let your mind wander.'] },
  'Bird watching': { emoji: '🐦', title: 'Listen to the little things.', missions: ['Pause and listen for birdsong. Can you spot its source?', 'Notice the colours, calls, or movements of a bird.', 'Find a quiet spot and see what wildlife visits.'] },
  'Plant spotting': { emoji: '🌿', title: 'Meet your leafy neighbours.', missions: ['Find a plant you do not recognize and observe its leaves.', 'Look for different leaf shapes and shades of green.', 'Notice a tiny detail on a plant you usually walk past.'] },
  'Cloud watching': { emoji: '☁️', title: 'Let your mind wander.', missions: ['Look at the clouds and find a shape or pattern.', 'Watch the sky change for a few peaceful minutes.', 'Take a few slow breaths while looking at the clouds.'] }
};
let selectedMinutes = 15;
let selectedActivity = 'Gardening';
let sessionActivity = 'Gardening';
let totalSeconds = selectedMinutes * 60;
let remainingSeconds = totalSeconds;
let deadline = null;
let ticker = null;
let running = false;

function chooseTime(minutes) {
  selectedMinutes = minutes;
  timeButtons.forEach(button => {
    const active = Number(button.dataset.minutes) === minutes;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
function chooseActivity(name) {
  selectedActivity = name;
  activityButtons.forEach(button => {
    const active = button.dataset.activity === name;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
function getSessionActivity() {
  if (selectedActivity !== 'Surprise me') return selectedActivity;
  const choices = Object.keys(activities);
  return choices[Math.floor(Math.random() * choices.length)];
}
function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}
function renderTimer() {
  countdown.textContent = formatTime(remainingSeconds);
  countdown.setAttribute('aria-label', `${Math.floor(remainingSeconds / 60)} minutes and ${remainingSeconds % 60} seconds remaining`);
  progressBar.style.width = `${totalSeconds ? (remainingSeconds / totalSeconds) * 100 : 0}%`;
}
function stopTicker() {
  if (ticker !== null) window.clearInterval(ticker);
  ticker = null;
  running = false;
}
function finishSession() {
  stopTicker();
  remainingSeconds = 0;
  renderTimer();
  timerPanel.classList.add('hidden');
  completionPanel.classList.remove('hidden');
  document.getElementById('completion-message').textContent = `You spent ${selectedMinutes} ${selectedMinutes === 1 ? 'minute' : 'minutes'} with ${sessionActivity.toLowerCase()}. The internet will still be there. Take a moment to enjoy what you noticed.`;
  completionPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function tick() {
  remainingSeconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  renderTimer();
  if (remainingSeconds <= 0) finishSession();
}
function startOrResume() {
  if (running) {
    remainingSeconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    stopTicker();
    renderTimer();
    toggleButton.innerHTML = 'Resume timer <span aria-hidden="true">▶</span>';
    timerStatus.textContent = 'Paused. Take your time.';
    return;
  }
  if (remainingSeconds <= 0) remainingSeconds = totalSeconds;
  deadline = Date.now() + remainingSeconds * 1000;
  running = true;
  toggleButton.innerHTML = 'Pause timer <span aria-hidden="true">Ⅱ</span>';
  timerStatus.textContent = 'You are right where you need to be.';
  tick();
  if (remainingSeconds > 0) ticker = window.setInterval(tick, 250);
}
function resetTimer() {
  stopTicker();
  remainingSeconds = totalSeconds;
  renderTimer();
  toggleButton.innerHTML = 'Start timer <span aria-hidden="true">▶</span>';
  timerStatus.textContent = 'Ready when you are.';
}
function beginSession() {
  stopTicker();
  sessionActivity = getSessionActivity();
  const activity = activities[sessionActivity];
  totalSeconds = selectedMinutes * 60;
  remainingSeconds = totalSeconds;
  document.getElementById('timer-emoji').textContent = activity.emoji;
  document.getElementById('timer-title').textContent = activity.title;
  document.getElementById('mission-text').textContent = activity.missions[Math.floor(Math.random() * activity.missions.length)];
  toggleButton.innerHTML = 'Start timer <span aria-hidden="true">▶</span>';
  timerStatus.textContent = 'Ready when you are.';
  renderTimer();
  planner.classList.add('hidden');
  completionPanel.classList.add('hidden');
  timerPanel.classList.remove('hidden');
  timerPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function showPlanner() {
  stopTicker();
  timerPanel.classList.add('hidden');
  completionPanel.classList.add('hidden');
  planner.classList.remove('hidden');
  planner.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

timeButtons.forEach(button => button.addEventListener('click', () => chooseTime(Number(button.dataset.minutes))));
activityButtons.forEach(button => button.addEventListener('click', () => chooseActivity(button.dataset.activity)));
startButton.addEventListener('click', beginSession);
toggleButton.addEventListener('click', startOrResume);
resetButton.addEventListener('click', resetTimer);
document.getElementById('change-plan').addEventListener('click', showPlanner);
document.getElementById('again-button').addEventListener('click', showPlanner);
window.addEventListener('pagehide', stopTicker);
renderTimer();
