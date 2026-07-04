const quizItems = [
  {
    label: "居宅サービス",
    question: "指定居宅サービスの基準はどちらの条例？",
    answer: "prefecture",
    explanation: "居宅サービスは普通のサービス。事業者管理は広域なので都道府県条例です。"
  },
  {
    label: "介護予防サービス",
    question: "指定介護予防サービスの基準はどちらの条例？",
    answer: "prefecture",
    explanation: "介護予防サービスも普通のサービス側。都道府県条例で押さえます。"
  },
  {
    label: "基準該当居宅サービス",
    question: "基準該当居宅サービスの基準はどちらの条例？",
    answer: "prefecture",
    explanation: "「居宅サービス」は支援ではありません。都道府県条例です。"
  },
  {
    label: "基準該当介護予防サービス",
    question: "基準該当介護予防サービスの基準はどちらの条例？",
    answer: "prefecture",
    explanation: "介護予防サービスは都道府県条例。地域密着型や支援と区別します。"
  },
  {
    label: "施設",
    question: "指定介護老人福祉施設の基準はどちらの条例？",
    answer: "prefecture",
    explanation: "老人ホーム系施設は大きい施設なので都道府県条例です。"
  },
  {
    label: "施設",
    question: "介護老人保健施設の基準はどちらの条例？",
    answer: "prefecture",
    explanation: "施設系は都道府県条例。老健もこのグループです。"
  },
  {
    label: "施設",
    question: "介護医療院の基準はどちらの条例？",
    answer: "prefecture",
    explanation: "介護医療院は施設系なので都道府県条例です。"
  },
  {
    label: "地域密着型",
    question: "地域密着型サービスの基準はどちらの条例？",
    answer: "municipality",
    explanation: "「地域」が付いたら住民に近い市町村条例です。"
  },
  {
    label: "地域密着型",
    question: "地域密着型介護予防サービスの基準はどちらの条例？",
    answer: "municipality",
    explanation: "地域密着型は市町村条例。介護予防が付いても地域密着型が優先です。"
  },
  {
    label: "支援",
    question: "居宅介護支援の基準はどちらの条例？",
    answer: "municipality",
    explanation: "ひっかけです。「支援」が付いた瞬間ケアマネ系なので市町村条例です。"
  },
  {
    label: "支援",
    question: "介護予防支援の基準はどちらの条例？",
    answer: "municipality",
    explanation: "介護予防支援は包括のケアプラン系。市町村条例です。"
  },
  {
    label: "支援",
    question: "基準該当居宅介護支援の基準はどちらの条例？",
    answer: "municipality",
    explanation: "「居宅介護支援」は支援あり。居宅サービスと混ぜず、市町村条例です。"
  },
  {
    label: "支援",
    question: "基準該当介護予防支援の基準はどちらの条例？",
    answer: "municipality",
    explanation: "介護予防支援はケアプラン系。市町村条例です。"
  },
  {
    label: "ひっかけ",
    question: "居宅サービスはどちらの条例？",
    answer: "prefecture",
    explanation: "「支援」がない居宅サービスは都道府県条例です。"
  },
  {
    label: "ひっかけ",
    question: "居宅介護支援はどちらの条例？",
    answer: "municipality",
    explanation: "名前は似ていますが、「支援」が付くので市町村条例です。"
  }
];

const storageKey = "care-manager-ordinance-quiz";
const answerLabels = {
  prefecture: "都道府県条例",
  municipality: "市町村条例"
};

const state = {
  currentIndex: 0,
  order: shuffle([...quizItems.keys()]),
  answered: false,
  wrongSet: new Set(),
  stats: {
    total: 0,
    correct: 0,
    streak: 0
  }
};

const questionNumber = document.querySelector("#questionNumber");
const tagLabel = document.querySelector("#tagLabel");
const questionText = document.querySelector("#questionText");
const feedback = document.querySelector("#feedback");
const nextButton = document.querySelector("#nextButton");
const wrongOnlyButton = document.querySelector("#wrongOnlyButton");
const resetButton = document.querySelector("#resetButton");
const correctCount = document.querySelector("#correctCount");
const streakCount = document.querySelector("#streakCount");
const accuracyRate = document.querySelector("#accuracyRate");
const choiceButtons = [...document.querySelectorAll(".choice")];

loadState();
renderQuestion();
renderStats();

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => checkAnswer(button.dataset.answer));
});

nextButton.addEventListener("click", () => {
  state.currentIndex = (state.currentIndex + 1) % state.order.length;
  state.answered = false;
  renderQuestion();
});

wrongOnlyButton.addEventListener("click", () => {
  if (state.wrongSet.size === 0) {
    feedback.hidden = false;
    feedback.innerHTML = "復習する間違いはまだありません。まずは全問モードで解いてください。";
    return;
  }

  state.order = shuffle([...state.wrongSet]);
  state.currentIndex = 0;
  state.answered = false;
  renderQuestion();
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  state.currentIndex = 0;
  state.order = shuffle([...quizItems.keys()]);
  state.answered = false;
  state.wrongSet = new Set();
  state.stats = { total: 0, correct: 0, streak: 0 };
  renderQuestion();
  renderStats();
});

function checkAnswer(selectedAnswer) {
  if (state.answered) return;

  const itemIndex = state.order[state.currentIndex];
  const item = quizItems[itemIndex];
  const isCorrect = selectedAnswer === item.answer;

  state.answered = true;
  state.stats.total += 1;

  if (isCorrect) {
    state.stats.correct += 1;
    state.stats.streak += 1;
    state.wrongSet.delete(itemIndex);
  } else {
    state.stats.streak = 0;
    state.wrongSet.add(itemIndex);
  }

  choiceButtons.forEach((button) => {
    const isSelected = button.dataset.answer === selectedAnswer;
    const isAnswer = button.dataset.answer === item.answer;
    button.classList.toggle("selected", isSelected);
    button.classList.toggle("correct", isAnswer);
    button.classList.toggle("wrong", isSelected && !isCorrect);
  });

  feedback.hidden = false;
  feedback.innerHTML = isCorrect
    ? `<strong>正解。</strong>${item.explanation}`
    : `<strong>不正解。</strong>答えは${answerLabels[item.answer]}です。${item.explanation}`;

  saveState();
  renderStats();
}

function renderQuestion() {
  const item = quizItems[state.order[state.currentIndex]];
  questionNumber.textContent = `${state.currentIndex + 1} / ${state.order.length}`;
  tagLabel.textContent = item.label;
  questionText.textContent = item.question;
  feedback.hidden = true;
  feedback.textContent = "";

  choiceButtons.forEach((button) => {
    button.classList.remove("selected", "correct", "wrong");
  });
}

function renderStats() {
  correctCount.textContent = state.stats.correct;
  streakCount.textContent = state.stats.streak;
  accuracyRate.textContent = state.stats.total === 0
    ? "0%"
    : `${Math.round((state.stats.correct / state.stats.total) * 100)}%`;
}

function saveState() {
  const payload = {
    wrongItems: [...state.wrongSet],
    stats: state.stats
  };
  localStorage.setItem(storageKey, JSON.stringify(payload));
}

function loadState() {
  const rawValue = localStorage.getItem(storageKey);
  if (!rawValue) return;

  try {
    const saved = JSON.parse(rawValue);
    state.wrongSet = new Set(saved.wrongItems || []);
    state.stats = {
      total: Number(saved.stats?.total) || 0,
      correct: Number(saved.stats?.correct) || 0,
      streak: Number(saved.stats?.streak) || 0
    };
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
  return items;
}
