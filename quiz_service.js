"use strict";
// quiz_service.js - layanan kuis sederhana (in-memory)
//
// TUGAS: jalankan `node --test`, lalu perbaiki SEMUA test yang gagal
// dengan mengubah file INI saja (jangan ubah file test).
// Setelah itu, jelaskan untuk tiap bug: penyebabnya, kenapa terjadi, dan cara memperbaikinya.

const db = { quizzes: new Map(), answers: [] };
let nextId = 1;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clock = { now: () => Date.now() }; // diganti di test agar waktu bisa dikontrol

function resetDb() {
  db.quizzes.clear();
  db.answers.length = 0;
  nextId = 1;
}

// ---------- Kuis ----------
function createQuiz({ title, questions, durationMin }) {
  if (!title || title.trim().length < 3)
    throw new Error("judul minimal 3 karakter");
  if (!Array.isArray(questions) || questions.length === 0)
    throw new Error("minimal 1 soal");
  const quiz = {
    id: nextId++,
    title: title.trim(),
    questions: questions.map((q) => ({ ...q, options: [...q.options] })),
    durationMin,
    endsAt: null,
  };
  db.quizzes.set(quiz.id, quiz);
  return quiz;
}

function getQuiz(id) {
  const quiz = db.quizzes.get(Number(id));
  if (!quiz) throw new Error("kuis tidak ditemukan");
  return quiz;
}

function startQuiz(id) {
  const quiz = getQuiz(Number(id));
  // console.log("id yang masuk:", id, typeof id);
  quiz.endsAt = clock.now() + quiz.durationMin * 60 * 1000;
  // console.log("ends:", quiz.endsAt, "clock:", clock.now());
  return quiz;
}

function searchQuizzes(term) {
  // console.log("term:", term)
  const specialChar = [
    ".",
    "*",
    "+",
    "?",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "^",
    "$",
    "|",
    "\\",
  ];
  // console.log("specialChar:", JSON.stringify(specialChar.includes(term)));
  // console.log("specialChar:", specialChar.includes(term));
  let result = "";
  // console.log("result:", JSON.stringify(result))
  for (const k of term) {
    if (specialChar.includes(k)) {
      result += "\\" + k;
    } else {
      result += k;
    }
  }

  const re = new RegExp(result, "i");
  return [...db.quizzes.values()].filter((q) => re.test(q.title));
}

// ---------- Jawaban ----------
async function submitAnswer(quizId, userId, qIndex, choice) {
  const quiz = getQuiz(quizId);
  if (quiz.endsAt === null) throw new Error("kuis belum dimulai");
  if (clock.now() > quiz.endsAt) throw new Error("kuis sudah berakhir");
  if (
    !Number.isInteger(qIndex) ||
    qIndex < 0 ||
    qIndex >= quiz.questions.length
  ) {
    throw new Error("soal tidak valid");
  }
  // console.log("index:", quiz.questions.length)
  await sleep(5); // simulasi menulis ke database
  const exists = db.answers.some(
    (a) => a.quizId === quiz.id && a.userId === userId && a.qIndex === qIndex,
  );
  // console.log("exists:", exists);
  // console.log("q:", quiz.questions.length);
  // console.log("id:", quiz.id);
  if (exists) {
    throw new Error("sudah menjawab");
  }
  db.answers.push({ quizId: quiz.id, userId, qIndex, choice, at: clock.now() });
}

async function submitMany(quizId, userId, list) {
  for (const { qIndex, choice } of list) {
    await submitAnswer(quizId, userId, qIndex, choice);
  }
  console.log("selesai");
  return list.length;
}

// ---------- Nilai ----------
function getScore(quizId, userId) {
  const quiz = getQuiz(quizId);
  const mine = db.answers.filter(
    (a) => a.quizId === quiz.id && a.userId === userId,
  );
  const correct = mine.reduce(
    (sum, a) => sum + (quiz.questions[a.qIndex].correct === a.choice ? 1 : 0),
  );
  return { correct, percent: Math.round((correct / mine.length) * 100) };
}

function leaderboard(quizId) {
  const quiz = getQuiz(quizId);
  const users = [
    ...new Set(
      db.answers.filter((a) => a.quizId === quiz.id).map((a) => a.userId),
    ),
  ];
  return users
    .map((userId) => ({ userId, ...getScore(quiz.id, userId) }))
    .sort((a, b) => a.correct < b.correct);
}

// ---------- Utilitas ----------
function paginate(items, page = 1, size = 10) {
  const start = page * size;
  return {
    data: items.slice(start, start + size),
    page,
    totalPages: Math.ceil(items.length / size),
  };
}

function makeRateLimiter(max, windowMs) {
  let hits = [];
  return function allow() {
    const now = clock.now();
    hits.filter((t) => now - t < windowMs);
    if (hits.length >= max) return false;
    hits.push(now);
    return true;
  };
}

function makeQuestionLabels(total) {
  const labels = [];
  for (var i = 0; i < total; i++) {
    labels.push(() => `Soal ${i + 1}`);
  }
  return labels;
}

module.exports = {
  db,
  clock,
  resetDb,
  createQuiz,
  getQuiz,
  startQuiz,
  searchQuizzes,
  submitAnswer,
  submitMany,
  getScore,
  leaderboard,
  paginate,
  makeRateLimiter,
  makeQuestionLabels,
};
