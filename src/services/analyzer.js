// src/services/analyzer.js
// Ganti BASE_URL dengan endpoint AI kamu yang sesungguhnya.

const BASE_URL = "http://192.168.225.234:8000";
console.log("BASE_URL:", BASE_URL);
/**
 * Kirim file CV ke API untuk dianalisis.
 * @param {{ uri, name, mimeType }} asset
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeCV(asset) {
  const form = new FormData();
  form.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/pdf' });

  const res = await fetch(`${BASE_URL}/cv/analyze`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Analisis gagal: ${res.statusText}`);
  return res.json();
}

/**
 * Minta daftar pekerjaan yang cocok berdasarkan hasil analisis.
 * @param {string} cvId
 * @returns {Promise<JobMatch[]>}
 */
export async function getJobMatches(cvId) {
  const res = await fetch(`${BASE_URL}/jobs/match?cvId=${cvId}`);
  if (!res.ok) throw new Error(`Gagal ambil lowongan: ${res.statusText}`);
  return res.json();
}

/**
 * Generate pertanyaan interview berdasarkan profil CV.
 * @param {string} cvId
 * @param {string} jobRole
 * @returns {Promise<InterviewQuestion[]>}
 */
export async function generateInterviewQuestions(cvId, jobRole) {
  const res = await fetch(`${BASE_URL}/interview/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvId, jobRole }),
  });
  if (!res.ok) throw new Error(`Gagal generate pertanyaan: ${res.statusText}`);
  return res.json();
}

/**
 * Kirim rekaman jawaban untuk dievaluasi AI.
 * @param {string} questionId
 * @param {{ uri, name }} audioAsset
 * @returns {Promise<{ feedback: string, skor: number }>}
 */
export async function evaluateAnswer(questionId, audioAsset) {
  const form = new FormData();
  form.append('audio', { uri: audioAsset.uri, name: audioAsset.name, type: 'audio/m4a' });
  form.append('questionId', questionId);

  const res = await fetch(`${BASE_URL}/interview/evaluate`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Evaluasi gagal: ${res.statusText}`);
  return res.json();
}

// ─── Mock data untuk development ─────────────────────────────────────────────

export const MOCK_ANALYSIS = {
  id: 'cv_mock_001',
  nama: 'Ahmad Rizky Pratama',
  posisiTarget: 'Senior Frontend Engineer',
  skor: 84,
  ringkasan: 'CV menunjukkan pengalaman solid 4 tahun di bidang frontend development dengan penguasaan React dan TypeScript yang kuat. Struktur penulisan rapi dan ATS-friendly. Beberapa pencapaian perlu dilengkapi dengan angka kuantitatif agar lebih meyakinkan.',
  keahlian: [
    { nama: 'React / Next.js',   skor: 90, level: 'Ahli'      },
    { nama: 'TypeScript',        skor: 82, level: 'Mahir'      },
    { nama: 'Node.js',           skor: 74, level: 'Menengah'   },
    { nama: 'System Design',     skor: 58, level: 'Berkembang' },
    { nama: 'DevOps / CI-CD',    skor: 45, level: 'Dasar'      },
  ],
  kelebihan: [
    'Portofolio project yang beragam dan relevan',
    'Pengalaman kerja di perusahaan teknologi ternama',
    'Format CV bersih dan mudah dibaca ATS',
  ],
  kekurangan: [
    'Belum ada sertifikasi cloud (AWS / GCP)',
    'Pencapaian kurang spesifik — tambahkan angka & dampak',
    'Tidak ada kontribusi open-source yang disebutkan',
  ],
};

export const MOCK_JOBS = [
  { id: 'j1', posisi: 'Senior Frontend Engineer', perusahaan: 'Tokopedia',   lokasi: 'Jakarta / Remote', gaji: 'Rp 25–40 jt',  cocok: 94, tipe: 'Full-time' },
  { id: 'j2', posisi: 'Full Stack Developer',      perusahaan: 'Gojek',       lokasi: 'Jakarta',          gaji: 'Rp 22–35 jt',  cocok: 88, tipe: 'Full-time' },
  { id: 'j3', posisi: 'Frontend Lead',             perusahaan: 'Traveloka',   lokasi: 'Remote',           gaji: 'Rp 30–45 jt',  cocok: 81, tipe: 'Full-time' },
  { id: 'j4', posisi: 'React Native Engineer',     perusahaan: 'OVO',         lokasi: 'Jakarta',          gaji: 'Rp 18–28 jt',  cocok: 76, tipe: 'Full-time' },
];

export const MOCK_QUESTIONS = [
  { id: 'q1', teks: 'Ceritakan tentang diri kamu dan pengalaman kamu sebagai developer frontend selama ini.', tipe: 'Perkenalan' },
  { id: 'q2', teks: 'Jelaskan perbedaan antara useEffect dan useLayoutEffect di React, dan kapan kamu menggunakan masing-masing?', tipe: 'Teknikal' },
  { id: 'q3', teks: 'Ceritakan situasi di mana kamu harus menyelesaikan bug kritis di production. Bagaimana pendekatan kamu?', tipe: 'Situasional' },
  { id: 'q4', teks: 'Bagaimana kamu merancang arsitektur frontend untuk aplikasi berskala besar dengan banyak tim?', tipe: 'Desain Sistem' },
  { id: 'q5', teks: 'Di mana kamu melihat dirimu dalam 3 tahun ke depan, dan bagaimana posisi ini mendukung tujuan tersebut?', tipe: 'Karir' },
];
