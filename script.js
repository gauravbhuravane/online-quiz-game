let questions = [];
let filteredQuestions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;

const categoryEl = document.getElementById('category');
const difficultyEl = document.getElementById('difficulty');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const quizBox = document.getElementById('quiz-box');
const resultBox = document.getElementById('result-box');
const finalScore = document.getElementById('final-score');
const timeDisplay = document.getElementById('time');
const saveBtn = document.getElementById('save-score');
const usernameInput = document.getElementById('username');
const leaderboard = document.getElementById('leaders');

document.getElementById('toggle-dark').onclick = () => {
  document.body.classList.toggle('dark-mode');
};

// Load questions from JSON file
fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    questions = data;
    populateFilters(data);
  })
  .catch(err => {
    alert('Failed to load questions.json. Make sure you are running a local server.');
    console.error(err);
  });

function populateFilters(data) {
  categoryEl.innerHTML = '<option value="all">All</option>';
  difficultyEl.innerHTML = '<option value="all">All</option>';

  const cats = [...new Set(data.map(q => q.category))];
  cats.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryEl.appendChild(option);
  });

  const diffs = [...new Set(data.map(q => q.difficulty))];
  diffs.forEach(diff => {
    const option = document.createElement('option');
    option.value = diff;
    option.textContent = diff;
    difficultyEl.appendChild(option);
  });
}

startBtn.onclick = () => {
  const cat = categoryEl.value;
  const diff = difficultyEl.value;

  filteredQuestions = questions.filter(q =>
    (cat === 'all' || q.category === cat) &&
    (diff === 'all' || q.difficulty === diff)
  );

  if (filteredQuestions.length === 0) {
    alert("No questions found for selected category and difficulty.");
    return;
  }

  filteredQuestions = shuffleArray(filteredQuestions);
  score = 0;
  currentIndex = 0;

  document.querySelector('.config').classList.add('hidden');
  quizBox.classList.remove('hidden');
  nextBtn.classList.add('hidden');
  showQuestion();
};

function showQuestion() {
  clearInterval(timer);
  timeLeft = 15;
  timeDisplay.textContent = timeLeft;
  nextBtn.classList.add('hidden');

  timer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      nextBtn.classList.remove('hidden');
      // Disable all answer buttons when time runs out
      Array.from(answersEl.children).forEach(b => b.disabled = true);
    }
  }, 1000);

  const q = filteredQuestions[currentIndex];
  questionEl.textContent = q.question;
  answersEl.innerHTML = '';

  const optionIndexes = q.options.map((_, idx) => idx);
  const shuffledIndexes = shuffleArray(optionIndexes);

  shuffledIndexes.forEach(idx => {
    const btn = document.createElement('button');
    btn.textContent = q.options[idx];
    btn.onclick = () => {
      clearInterval(timer);
      if (idx === q.answer) {
        btn.style.background = 'lightgreen';
        score++;
      } else {
        btn.style.background = 'salmon';
      }
      Array.from(answersEl.children).forEach(b => b.disabled = true);
      nextBtn.classList.remove('hidden');
    };
    answersEl.appendChild(btn);
  });
}

nextBtn.onclick = () => {
  currentIndex++;
  if (currentIndex < filteredQuestions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
};

function endQuiz() {
  quizBox.classList.add('hidden');
  resultBox.classList.remove('hidden');
  finalScore.textContent = `You scored ${score} out of ${filteredQuestions.length}`;
  saveBtn.disabled = false;
  usernameInput.value = '';
}

saveBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) return;
  const existing = JSON.parse(localStorage.getItem('leaders') || '[]');
  existing.push({ name, score });
  localStorage.setItem('leaders', JSON.stringify(existing.sort((a, b) => b.score - a.score).slice(0, 10)));
  displayLeaderboard();
  saveBtn.disabled = true;
};

function displayLeaderboard() {
  const data = JSON.parse(localStorage.getItem('leaders') || '[]');
  leaderboard.innerHTML = data.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('');
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Display leaderboard on page load
displayLeaderboard();
