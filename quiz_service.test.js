"use strict";
// Jangan ubah file ini. Jalankan: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const s = require("./quiz_service");

const Q = () => [
  { text: "2+2", options: ["3", "4"], correct: 1 },
  { text: "Ibu kota Indonesia", options: ["Jakarta", "Bandung"], correct: 0 },
  { text: "HTTP sukses", options: ["200", "404"], correct: 0 },
];

test.beforeEach(() => {
  s.resetDb();
  s.clock.now = () => 1_000_000;
});

// test("kuis tidak ikut berubah saat data asli milik pemanggil diubah", () => {
//   const qs = Q();
//   const quiz = s.createQuiz({ title: "Dasar", questions: qs, durationMin: 10 });
//   qs[0].correct = 0;
//   qs.push({ text: "baru", options: [], correct: 0 });
//   assert.equal(quiz.questions.length, 3);
//   assert.equal(quiz.questions[0].correct, 1);
// });

// test("kuis bisa diambil dengan id berupa string (seperti dari URL)", () => {
//   const quiz = s.createQuiz({ title: "Dasar", questions: Q(), durationMin: 10 });
//   assert.equal(s.getQuiz(String(quiz.id)).id, quiz.id);
// });

test("kuis 10 menit berakhir tepat 10 menit setelah dimulai", () => {
  const quiz = s.createQuiz({ title: "Dasar", questions: Q(), durationMin: 10 });
  s.startQuiz(quiz.id);
  assert.equal(quiz.endsAt, 1_000_000 + 10 * 60 * 1000);
});

// test("pencarian dengan karakter spesial tidak error dan tetap menemukan judul", () => {
//   s.createQuiz({ title: "Belajar C++ (dasar)", questions: Q(), durationMin: 5 });
//   assert.equal(s.searchQuizzes("c++").length, 1);
//   assert.equal(s.searchQuizzes("(dasar)").length, 1);
//   assert.doesNotThrow(() => s.searchQuizzes("["));
// });

// test("nomor soal sama dengan jumlah soal ditolak", async () => {
//   const quiz = s.createQuiz({ title: "Dasar", questions: Q(), durationMin: 10 });
//   s.startQuiz(quiz.id);
//   await assert.rejects(() => s.submitAnswer(quiz.id, "ani", 3, 0), /soal tidak valid/);
// });

// test("jawaban bersamaan untuk soal yang sama hanya tersimpan sekali", async () => {
//   const quiz = s.createQuiz({ title: "Dasar", questions: Q(), durationMin: 10 });
//   s.startQuiz(quiz.id);
//   const results = await Promise.allSettled([
//     s.submitAnswer(quiz.id, "ani", 0, 1),
//     s.submitAnswer(quiz.id, "ani", 0, 1),
//     s.submitAnswer(quiz.id, "ani", 0, 0),
//   ]);
//   assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
//   assert.equal(s.db.answers.length, 1);
// });

// test("submitMany menunggu semua jawaban tersimpan", async () => {
//   const quiz = s.createQuiz({ title: "Dasar", questions: Q(), durationMin: 10 });
//   s.startQuiz(quiz.id);
//   await s.submitMany(quiz.id, "ani", [
//     { qIndex: 0, choice: 1 },
//     { qIndex: 1, choice: 0 },
//   ]);
//   assert.equal(s.db.answers.length, 2);
// });

// test("submitMany ikut gagal jika salah satu jawaban ditolak", async () => {
//   const quiz = s.createQuiz({ title: "Dasar", questions: Q(), durationMin: 10 });
//   s.startQuiz(quiz.id);
//   await assert.rejects(
//     () => s.submitMany(quiz.id, "ani", [{ qIndex: 0, choice: 1 }, { qIndex: 9, choice: 0 }]),
//     /soal tidak valid/
//   );
// });

// test("nilai dihitung dari jumlah SOAL, bukan jumlah yang dijawab", async () => {
//   const quiz = s.createQuiz({ title: "Dasar", questions: Q(), durationMin: 10 });
//   s.startQuiz(quiz.id);
//   await s.submitAnswer(quiz.id, "ani", 0, 1); // benar
//   await s.submitAnswer(quiz.id, "ani", 1, 0); // benar
//   assert.deepEqual(s.getScore(quiz.id, "ani"), { correct: 2, percent: 67 });
// });

// test("pengguna yang belum menjawab mendapat nilai 0", () => {
//   const quiz = s.createQuiz({ title: "Dasar", questions: Q(), durationMin: 10 });
//   assert.deepEqual(s.getScore(quiz.id, "belum"), { correct: 0, percent: 0 });
// });

// test("papan peringkat urut nilai tertinggi, seri diurut userId", async () => {
//   const quiz = s.createQuiz({ title: "Dasar", questions: Q(), durationMin: 10 });
//   s.startQuiz(quiz.id);
//   await s.submitAnswer(quiz.id, "budi", 0, 1);
//   await s.submitAnswer(quiz.id, "citra", 0, 1);
//   await s.submitAnswer(quiz.id, "citra", 1, 0);
//   await s.submitAnswer(quiz.id, "ani", 0, 1);
//   await s.submitAnswer(quiz.id, "ani", 1, 0);
//   await s.submitAnswer(quiz.id, "ani", 2, 0);
//   assert.deepEqual(s.leaderboard(quiz.id).map((r) => r.userId), ["ani", "citra", "budi"]);
// });

// test("halaman 1 menampilkan item pertama", () => {
//   const items = [1, 2, 3, 4, 5, 6, 7];
//   assert.deepEqual(s.paginate(items, 1, 3), { data: [1, 2, 3], page: 1, totalPages: 3 });
//   assert.deepEqual(s.paginate(items, 3, 3).data, [7]);
// });

// test("pembatas laju mengizinkan lagi setelah jendela waktu lewat", () => {
//   const allow = s.makeRateLimiter(2, 1000);
//   assert.equal(allow(), true);
//   assert.equal(allow(), true);
//   assert.equal(allow(), false);
//   s.clock.now = () => 1_000_000 + 1500;
//   assert.equal(allow(), true);
// });

// test("label soal sesuai nomornya", () => {
//   const labels = s.makeQuestionLabels(3).map((f) => f());
//   assert.deepEqual(labels, ["Soal 1", "Soal 2", "Soal 3"]);
// });
