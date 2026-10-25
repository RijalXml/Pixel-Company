import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK if GEMINI_API_KEY is available
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health / Status Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    aiAvailable: Boolean(ai),
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Role system instructions for Gemini Worker
const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  pm: `Kamu adalah Maya Putri, Lead Project Manager di PT INTI (Virtual AI Company).
Tugasmu: Menganalisis perintah CEO dan menyusun dokumen Project Specification:
1. Ringkasan Eksekutif & Tujuan Utama
2. Pembagian Milestone & Waktu
3. Scope & Batasan
4. Kriteria Keberhasilan (Acceptance Criteria)
Jawablah secara terstruktur, jelas, dan profesional dalam bahasa Indonesia.`,

  researcher: `Kamu adalah Dr. Aris, Senior Market & Tech Researcher di PT INTI.
Tugasmu: Melakukan riset komprehensif atas proyek:
1. Analisis Kebutuhan Pengguna & Target Audiens
2. Benchmark Solusi / Tren Industri Terkini
3. Rekomendasi Pendekatan & Stack Teknologi
4. Potensi Risiko & Mitigasi
Berikan insight tajam dan bernilai tinggi dalam bahasa Indonesia.`,

  designer: `Kamu adalah Luna Chandra, Lead UI/UX & Visual Designer di PT INTI.
Tugasmu: Merancang spesifikasi visual dan desain antarmuka:
1. Tema Desain & Moodboard Filosofi
2. Palet Warna (cantumkan HEX Code seperti #0b0f19, #00e5ff, dsb.)
3. Wireframe & Tata Letak Antarmuka (Header, Main, Actions)
4. Interaksi & Pengalaman Pengguna (UX Micro-interactions)
Gunakan format markdown yang rapi dalam bahasa Indonesia.`,

  writer: `Kamu adalah Dewi Lestari, Content & Technical Copywriter di PT INTI.
Tugasmu: Menyusun copywriting dan materi komunikasi:
1. Headline & Tagline yang kuat
2. Value Proposition & Salinan Konten Utama
3. Microcopy Tombol (CTA) & Pesan Interaktif
4. Panduan Singkat untuk Pengguna
Tulislah dengan gaya meyakinkan, menarik, dan informatif.`,

  developer: `Kamu adalah Budi Kurnia, Senior Software Engineer di PT INTI.
Tugasmu: Mengimplementasikan kode atau spesifikasi teknis nyata:
1. Arsitektur Teknis & Komponen Utama
2. Potongan Kode Siap Pakai (TypeScript/JavaScript/HTML/CSS lengkap dengan komentar)
3. Alur Logika & Penanganan State
Berikan implementasi kode yang rapi, modular, dan berfungsi nyata.`,

  qa: `Kamu adalah Reza Pratama, QA Specialist di PT INTI.
Tugasmu: Melakukan audit pengujian mutu:
1. Test Matrix (Skenario Utama, Edge Cases, Stress Test)
2. Hasil Pengujian & Verifikasi Bug
3. Metrik Kualitas & Uji Responsivitas
4. Skor Kelayakan (misal: 96/100) dan Rekomendasi
Jelaskan temuan secara terperinci.`,

  reviewer: `Kamu adalah Hendra Gunawan, Principal Auditor & Quality Reviewer di PT INTI.
Tugasmu: Memberikan audit final eksekutif untuk diserahkan ke CEO:
1. Evaluasi Kepatuhan terhadap Perintah Asli CEO
2. Penilaian Kualitas tiap Departemen (PM, Riset, Desain, Tulisan, Dev, QA)
3. Keputusan Audit: Tuliskan secara tegas status: [STATUS: APPROVED] atau [STATUS: REVISION]
4. Catatan Eksekutif untuk CEO
Jika semua baik, tulis [STATUS: APPROVED].`,
};

// Realistic fallback generator when AI key is missing or offline
function generateSimulatedOutput(role: string, prompt: string, taskTitle: string): { output: string; notes: string; decision: 'APPROVED' | 'REVISION' } {
  const shortTitle = taskTitle || prompt;

  switch (role) {
    case 'pm':
      return {
        output: `### SPESIFIKASI PROYEK: ${shortTitle}
**Target Utama:** Menyelesaikan solusi berbasis kebutuhan: "${prompt}".

1. **Milestone Sprint:**
   - Tahap 1: Riset Kebutuhan & Benchmarking Pasar
   - Tahap 2: Prototyping Visual & Copywriting
   - Tahap 3: Implementasi Sistem & Integrasi Modul
   - Tahap 4: QA Assurance & Verifikasi Mutu

2. **Kriteria Keberhasilan:**
   - Antarmuka intuitif, responsif di semua perangkat.
   - Performa stabil tanpa lag, error rate 0%.
   - Semua modul inti selesai sesuai arahan CEO.`,
        notes: 'Alur kerja telah dibagi ke 7 departemen.',
        decision: 'APPROVED',
      };

    case 'researcher':
      return {
        output: `### LAPORAN RISET PASAR & TEKNOLOGI
**Subjek:** Solusi Optimal untuk "${shortTitle}"

1. **Target Persona:** Profesional muda, kreator digital, dan pelaku bisnis modern.
2. **Tren Industri:** Pengguna menyukai antarmuka yang cepat, interaktif, dan memiliki identitas visual yang khas (pixel-retro aesthetic saat ini mengalami lonjakan keterlibatan +42%).
3. **Rekomendasi Stack:** React 19, TypeScript modern, Tailwind CSS, dan sistem state berbasis event bus.
4. **Analisis Risiko:** Kompleksitas alur dapat membingungkan jika tidak ada visual feedback seketika.`,
        notes: 'Data primer dan studi kompetitor selesai dikompilasi.',
        decision: 'APPROVED',
      };

    case 'designer':
      return {
        output: `### SPESIFIKASI UI/UX & DESAIN VISUAL
**Konsep Visual:** 16-Bit Cyber Office Aesthetic

- **Palet Warna:**
  - Background Utama: \`#0b0f19\` (Deep Cyber Navy)
  - Aksen Primer: \`#00e5ff\` (Electric Cyan)
  - Aksen Sekunder: \`#9d4edd\` (Vibrant Purple)
  - Status Sukses: \`#06d6a0\` (Mint Green)
  - Highlight Emas: \`#ffd166\` (Warm Gold)

- **Hierarki Layout:**
  - Viewport kantor 2D berfokus pada dinamika gerakan karyawan.
  - Panel kontrol CEO di bagian bawah yang mudah diakses jempol di layar sentuh.
  - Tipografi pixel font dipadukan dengan sans-serif modern agar nyaman dibaca.`,
        notes: 'Palet warna dan grid layout telah difinalisasi.',
        decision: 'APPROVED',
      };

    case 'writer':
      return {
        output: `### DOKUMEN COPYWRITING & MATERI BRAND
**Headline:** "Mewujudkan Ide Besar dengan Presisi Digital."
**Tagline:** "INTI Corp — Setiap Perintah Dijalankan Secara Sempurna."

**Value Proposition:**
- Eksekusi instan dari instruksi CEO langsung ke alur kerja nyata.
- Kolaborasi lintas divisi yang transparan dan terpantau detik demi detik.

**Microcopy & Call to Action:**
- Tombol Utama: \`Mulai Tugas Sekarang\`
- Notifikasi: \`Berkas berhasil diserahkan ke tahap berikutnya!\``,
        notes: 'Copywriting siap digunakan pada tampilan produk.',
        decision: 'APPROVED',
      };

    case 'developer':
      return {
        output: `### ARSITEKTUR IMPLEMENTASI KODE
\`\`\`typescript
// Core Engine Implementation for: ${shortTitle}
export class ProjectEngine {
  private id: string;
  private isRunning: boolean = false;

  constructor(public config: { name: string; priority: string }) {
    this.id = 'MOD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  public async execute(): Promise<{ status: string; code: number }> {
    this.isRunning = true;
    console.log(\`[Engine \${this.id}] Processing: \${this.config.name}\`);
    // State machine logic execution
    return { status: 'OPTIMAL', code: 200 };
  }
}
\`\`\`
- Telah dioptimalkan untuk performa tinggi pada perangkat mobile & tablet.
- Modularitas kode memungkinkan ekspansi fitur tanpa refactoring berat.`,
        notes: 'Arsitektur dan prototipe kode berhasil diuji tanpa syntax error.',
        decision: 'APPROVED',
      };

    case 'qa':
      return {
        output: `### HASIL PENGUJIAN KUALITAS & AUDIT QA
**Ringkasan Pengujian untuk:** "${shortTitle}"

1. **Functional Test:** 18/18 Skenario PASS
2. **Edge-Case Validation:** Berhasil menangani input teks panjang dan karakter khusus.
3. **Cross-Device Check:** Diuji pada resolusi desktop, tablet (iPad/Android), dan ponsel pintar.
4. **Skor Mutu Keseluruhan:** **98/100** (Kategori Unggul)
*Tidak ditemukan bug kritis atau memory leak.*`,
        notes: 'Sistem stabil dan memenuhi standar rilis industri.',
        decision: 'APPROVED',
      };

    case 'reviewer':
      return {
        output: `### AUDIT AKHIR EKSEKUTIF UNTUK CEO
[STATUS: APPROVED]

**Catatan Auditor:**
Semua tahapan pengerjaan untuk proyek **"${shortTitle}"** telah diverifikasi dengan standar tertinggi PT INTI.
- PM telah mengarahkan scope secara terukur.
- Riset valid dan relevan dengan pasar.
- Desain visual menarik dan konsisten.
- Kode bersih, modular, dan lulus uji QA dengan skor 98/100.

**Rekomendasi:** Berkas resmi siap diserahkan kepada CEO untuk peluncuran penuh.`,
        notes: 'Semua kriteria lolos audit. Status: APPROVED.',
        decision: 'APPROVED',
      };

    default:
      return {
        output: `Tahap ${role} selesai dikerjakan untuk instruksi: ${shortTitle}`,
        notes: 'Lolos validasi standar.',
        decision: 'APPROVED',
      };
  }
}

// Execute Worker Endpoint
app.post('/api/worker/execute', async (req, res) => {
  const { role, prompt, taskTitle, previousOutputs, revisionNotes } = req.body;

  if (!role || !prompt) {
    return res.status(400).json({ error: 'Role dan prompt wajib disertakan.' });
  }

  // If Gemini AI is active and configured
  if (ai) {
    try {
      const systemInstruction = ROLE_SYSTEM_PROMPTS[role] || 'Kamu adalah karyawan profesional di PT INTI.';
      
      let contextPrompt = `Instruksi Awal CEO: "${prompt}"\nJudul Proyek: "${taskTitle || prompt}"\n`;
      if (revisionNotes) {
        contextPrompt += `\nCATATAN REVISI DARI AUDITOR: "${revisionNotes}"\nMohon perbaiki pekerjaan sesuai catatan ini.\n`;
      }

      if (previousOutputs && Array.isArray(previousOutputs) && previousOutputs.length > 0) {
        contextPrompt += `\nDokumen Hasil Pekerjaan Tim Sebelumnya:\n`;
        previousOutputs.forEach((item: { role: string; title: string; output: string }) => {
          contextPrompt += `--- [${item.role.toUpperCase()}] ${item.title} ---\n${item.output.slice(0, 500)}...\n\n`;
        });
      }

      contextPrompt += `\nSilakan buat hasil pekerjaan terbaikmu untuk tahap [${role.toUpperCase()}] sekarang:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contextPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      const isRevision = responseText.includes('[STATUS: REVISION]') || (role === 'reviewer' && responseText.toLowerCase().includes('perlu revisi'));
      const decision: 'APPROVED' | 'REVISION' = isRevision ? 'REVISION' : 'APPROVED';

      return res.json({
        success: true,
        role,
        output: responseText,
        notes: `Dikerjakan langsung oleh AI Gemini 3.8 Flash (${role.toUpperCase()})`,
        decision,
        isAi: true,
      });
    } catch (err) {
      console.error('[Gemini API Worker Error]', err);
      // Fallback gracefully if rate limit or network issue occurs
      const fallback = generateSimulatedOutput(role, prompt, taskTitle);
      return res.json({
        success: true,
        role,
        output: fallback.output,
        notes: `Simulasi fallback (Mode Cadangan): ${fallback.notes}`,
        decision: fallback.decision,
        isAi: false,
      });
    }
  }

  // No API Key -> Demo / Simulation mode with explicit labeling
  const sim = generateSimulatedOutput(role, prompt, taskTitle);
  return res.json({
    success: true,
    role,
    output: sim.output,
    notes: `Mode Simulasi Kantor (SIMULASI): ${sim.notes}`,
    decision: sim.decision,
    isAi: false,
  });
});

// Vite Middleware for Development / Static Serve for Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[INTI Server] Server running at http://localhost:${PORT} (AI: ${ai ? 'ENABLED' : 'SIMULATION MODE'})`);
  });
}

startServer();
