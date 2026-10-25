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
    model: 'gemini-3.1-flash-lite',
    specialty: 'Web, Android APK, Game & Software Development',
    timestamp: new Date().toISOString(),
  });
});

// Role system instructions for Gemini Worker - Specialize in Web, APK, and Software
const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  pm: `Kamu adalah Maya Putri, Lead Project Manager di PT INTI Software & APK Studio.
Tugasmu: Menganalisis instruksi pembuatan Web / APK / Game / Software dari CEO dan menyusun dokumen Software Requirements Specification (SRS):
1. Ringkasan Eksekutif & Target Platform (Web App / Android APK / Game)
2. Pembagian Modul Fitur & User Stories
3. Arsitektur Alur Pengguna (User Flow)
4. Acceptance Criteria & Kriteria Peluncuran
Jawablah secara terstruktur, teknis, dan profesional dalam bahasa Indonesia.`,

  researcher: `Kamu adalah Dr. Aris, Senior Tech & Architecture Researcher di PT INTI.
Tugasmu: Melakukan riset komprehensif teknologi untuk Web / APK / Software yang diminta:
1. Pemilihan Tech Stack Terbaik (misal: Next.js/React untuk Web, Kotlin/Flutter/React Native untuk APK, Canvas/Phaser untuk Game)
2. Analisis Dependensi & Library Open-Source yang Dibutuhkan
3. Arsitektur State Management & API Backend / Database
4. Keamanan, Optimasi Performa & Potensi Kendala
Berikan rekomendasi teknis yang solid dan jelas dalam bahasa Indonesia.`,

  designer: `Kamu adalah Luna Chandra, Lead UI/UX Designer di PT INTI.
Tugasmu: Merancang desain antarmuka Web / APK Mobile / Software:
1. Konsep Desain & Tema (Modern Clean / Retro Pixel / Cyberpunk)
2. Palet Warna (cantumkan HEX Code seperti #0b0f19, #00e5ff, #10b981, dsb.)
3. Wireframe Tata Letak Layar (Header, Navigasi Bawah untuk APK / Sidebar untuk Web, Konten Utama, Tombol Aksi)
4. Komponen UI Utama & Interaktivitas Pengguna
Tuliskan dengan format markdown rapi dalam bahasa Indonesia.`,

  writer: `Kamu adalah Dewi Lestari, Technical Writer & Product Copywriter di PT INTI.
Tugasmu: Menyusun materi copywriting dan dokumentasi produk Web / APK:
1. Tagline & Headline Aplikasi yang Menjual
2. Deskripsi Listing (Cocok untuk Google Play Store / Landing Page Web)
3. Teks Microcopy (Tombol, Form Label, Placeholder, Pesan Sukses & Error)
4. Panduan Penggunaan Cepat untuk User
Gunakan bahasa Indonesia yang persuasif, jelas, dan modern.`,

  developer: `Kamu adalah Budi Kurnia, Senior Lead Developer di PT INTI.
Tugasmu: Menulis KODE SUMBER LENGKAP & BERFUNGSI NYATA untuk Web / APK / Game yang diminta:
1. Jika targetnya Web: Buat kode HTML/CSS/JS mandiri yang lengkap, modern, dan interaktif (bisa langsung dijalankan dalam satu blok kode terpadu).
2. Jika targetnya APK Android: Buat modul komponen (Kotlin Android atau React Native / Expo) lengkap dengan logika state dan antarmuka.
3. Berikan penjelasan singkat struktur kode dan cara menjalankannya.
Pastikan kode bersih, rapi, modular, dan bebas error sintaks.`,

  qa: `Kamu adalah Reza Pratama, QA & Test Automation Specialist di PT INTI.
Tugasmu: Melakukan audit pengujian menyeluruh terhadap Web / APK / Game:
1. Test Matrix (Skenario Fungsional, Validasi Input, Error Handling)
2. Pengujian Responsivitas & Kompatibilitas Perangkat (Browser Desktop & Layar Android Smartphone/Tablet)
3. Audit Performa (Waktu Muat, Efisiensi Memori, Rendering FPS)
4. Skor Mutu Keseluruhan (misal: 98/100) dan Verifikasi Kesiapan Rilis
Tuliskan laporan pengujian dengan detail dan metrik jelas.`,

  reviewer: `Kamu adalah Hendra Gunawan, Principal Software Auditor & Release Manager di PT INTI.
Tugasmu: Melakukan audit final terhadap seluruh hasil kerja tim Web/APK/Software untuk diserahkan ke CEO:
1. Verifikasi Kepatuhan terhadap Perintah Asli CEO
2. Audit Mutu Kode & Kelayakan Rilis (Clean Code, Keamanan, Responsivitas)
3. Keputusan Rilis: Tuliskan secara tegas status: [STATUS: APPROVED] atau [STATUS: REVISION]
4. Catatan Eksekutif untuk CEO terkait peluncuran Web/APK ini.
Jika aplikasi telah layak dan memenuhi standar, tuliskan [STATUS: APPROVED].`,
};

// Realistic fallback generator when AI key is missing or offline
function generateSimulatedOutput(role: string, prompt: string, taskTitle: string): { output: string; notes: string; decision: 'APPROVED' | 'REVISION' } {
  const shortTitle = taskTitle || prompt;
  const isApk = /apk|android|mobile|hp|ponsel|flutter|kotlin/i.test(prompt + ' ' + taskTitle);
  const isGame = /game|permainan|arcade|pixel|runner/i.test(prompt + ' ' + taskTitle);

  switch (role) {
    case 'pm':
      return {
        output: `### SOFTWARE SPECIFICATION (SRS): ${shortTitle}
**Target Platform:** ${isApk ? '📱 Android APK Mobile Application' : isGame ? '🎮 Web & Canvas 2D Game' : '🌐 Responsive Web Application (Desktop & Mobile)'}
**Instruksi CEO:** "${prompt}"

1. **Fitur Kunci & Modul Utama:**
   - Modul 1: Antarmuka Utama & Onboarding Interaktif
   - Modul 2: Logika Bisnis & Penyimpanan State / Offline Cache
   - Modul 3: Manajemen Data, Validasi Input & Feedback Visual
   - Modul 4: Integrasi Output & Ekspor Laporan

2. **Acceptance Criteria:**
   - Waktu muat layar < 1.2 detik, 60 FPS rendering.
   - Kompatibel di semua ukuran layar (Android Smartphone & Browser Web).
   - Zero-crash dan penanganan error yang anggun.`,
        notes: 'Alur sprint software telah dibagi ke 7 departemen.',
        decision: 'APPROVED',
      };

    case 'researcher':
      return {
        output: `### LAPORAN RISET ARSITEKTUR & STACK TEKNOLOGI
**Subjek Proyek:** ${shortTitle}
**Target Output:** ${isApk ? 'Android APK Package (.apk) siap instal' : isGame ? 'Canvas 2D Game Engine' : 'Modern Web Application'}

1. **Rekomendasi Tech Stack:**
   - ${isApk ? 'Framework: React Native / Expo & Kotlin Android Bridge, SQLite / MMKV local cache' : isGame ? 'Engine: HTML5 Canvas 2D API, Web Audio API 8-Bit synth, requestAnimationFrame loop' : 'Framework: React 19, TypeScript, Tailwind CSS, Vite bundler'}
2. **Kebutuhan Library & Dependensi:**
   - State management terdesentralisasi berbasis event bus ringan.
   - Komponen UI modular tanpa dependensi berat (zero external bloat).
3. **Analisis Performa & Keamanan:**
   - Sanitasi input form menyeluruh, enkripsi lokal untuk data sensitif.
   - Optimasi footprint memori di bawah 25MB.`,
        notes: 'Riset stack teknologi dan dependensi software selesai divalidasi.',
        decision: 'APPROVED',
      };

    case 'designer':
      return {
        output: `### DOKUMEN DESAIN UI/UX & WIREFRAME
**Platform Target:** ${isApk ? 'Mobile UI (Layar Sentuh Android)' : 'Responsive Web UI & Desktop'}
**Tema Visual:** Cyber Retro Clean Interface

- **Palet Warna Sistem:**
  - Background: \`#0b0f19\` (Deep Cyber Navy)
  - Surface Card: \`#121b2d\` (Dark Slate Card)
  - Aksen Primer: \`#00e5ff\` (Electric Cyan)
  - Aksen Sukses: \`#10b981\` (Emerald Mint)
  - Aksen Peringatan: \`#ffd166\` (Warm Gold)

- **Layout Wireframe:**
  ${isApk ? '- Top Bar: Status Bar & Header Navigasi\n  - Body: Scrollable Card List & Quick Input Form\n  - Bottom: Sticky Action Bar dengan Tombol Utama Sentuh' : '- Top: Navbar dengan Brand Logo & Quick Action\n  - Main: Hero Section dengan Interactive Data Dashboard\n  - Footer: Panel Kontrol & Riwayat Aktivitas'}`,
        notes: 'Spesifikasi UI/UX dan token desain siap dikerjakan developer.',
        decision: 'APPROVED',
      };

    case 'writer':
      return {
        output: `### COPYWRITING & METADATA APLIKASI
**Nama Produk:** ${shortTitle}
**Tagline:** "Solusi Cerdas, Cepat, dan Presisi untuk Kebutuhan Digital Anda."

1. **Deskripsi Singkat (Cocok untuk Play Store / Web Meta):**
   Aplikasi canggih yang dirancang khusus untuk memenuhi instruksi: "${prompt}". Dibangun dengan arsitektur modern berkecepatan tinggi, antarmuka elegan, dan kenyamanan penggunaan tanpa kompromi.

2. **Microcopy Interaktif:**
   - Tombol Aksi: \`Mulai Sekarang\` / \`Simpan Transaksi\` / \`Jalankan\`
   - Pesan Sukses: \`Data berhasil diproses dan disimpan dengan aman!\`
   - Notifikasi Validasi: \`Mohon lengkapi seluruh kolom yang diperlukan.\``,
        notes: 'Salinan materi teks, microcopy, dan metadata siap dipakai.',
        decision: 'APPROVED',
      };

    case 'developer':
      return {
        output: `### KODE IMPLEMENTASI SUMBER (SIAP JALAN)
\`\`\`${isApk ? 'kotlin' : 'typescript'}
// =========================================================
// INTI Software Studio - Project: ${shortTitle}
// Platform Target: ${isApk ? 'Android APK (Kotlin / Mobile Logic)' : 'Web Application (TypeScript / React)'}
// =========================================================

export interface AppConfig {
  appId: string;
  version: string;
  platform: '${isApk ? 'ANDROID_APK' : 'WEB_APP'}';
}

export class AppEngine {
  private state: Record<string, any> = {};
  private isInitialized: boolean = false;

  constructor(public config: AppConfig) {
    this.init();
  }

  public init(): void {
    this.isInitialized = true;
    console.log(\`[\${this.config.platform}] Initialized: \${this.config.appId} v\${this.config.version}\`);
  }

  public executeAction(actionName: string, payload: any): { status: string; timestamp: number } {
    this.state[actionName] = payload;
    return {
      status: 'SUCCESS_200',
      timestamp: Date.now()
    };
  }

  public getAppState(): Record<string, any> {
    return { ...this.state };
  }
}

// Instance Producer
export const activeApp = new AppEngine({
  appId: 'INTI-${Math.random().toString(36).substring(2, 7).toUpperCase()}',
  version: '1.0.0',
  platform: '${isApk ? 'ANDROID_APK' : 'WEB_APP'}'
});
\`\`\`
- Siap dibundle ke ${isApk ? 'paket .apk Android atau React Native' : 'antarmuka Web React'}.
- Struktur modular mempermudah penambahan fitur lanjutan.`,
        notes: 'Implementasi kode sumber selesai dikonstruksi tanpa error.',
        decision: 'APPROVED',
      };

    case 'qa':
      return {
        output: `### LAPORAN UJI MUTU & AUDIT PERFORMA
**Aplikasi:** ${shortTitle}
**Target Uji:** ${isApk ? 'Android APK Emulasi (Android 11, 12, 13, 14)' : 'Cross-Browser (Chrome, Safari, Firefox, Edge)'}

1. **Hasil Pengujian Otomatis:**
   - 24/24 Skenario Pengujian Unit: PASS (100%)
   - Uji Input Ekstrem & Batas Memori: STABIL
   - Waktu Respons Rendering: Rata-rata 14ms (60 FPS stabil)
2. **Skor Mutu QA:** **99/100** (Grade A+ Siap Rilis)
3. **Catatan:** Tidak ditemukan celah kebocoran memori atau error blocking.`,
        notes: 'Aplikasi lolos seluruh ambang batas uji kelayakan software.',
        decision: 'APPROVED',
      };

    case 'reviewer':
      return {
        output: `### AUDIT AKHIR EKSEKUTIF UNTUK CEO
[STATUS: APPROVED]

**Ringkasan Evaluasi:**
Proyek pembuatan software **"${shortTitle}"** telah selesai melalui seluruh siklus hidup pengembangan (SDLC) di PT INTI.
- Dokumen SRS dan alur fitur telah memenuhi seluruh instruksi CEO.
- Riset stack arsitektur solid dan mutakhir.
- Desain antarmuka bersih dan responsif.
- Kode implementasi siap pakai dan lulus audit QA dengan skor 99/100.

**Rekomendasi Auditor:** Software / APK telah terverifikasi penuh dan siap diluncurkan.`,
        notes: 'Semua kriteria software terpenuhi. Status: APPROVED.',
        decision: 'APPROVED',
      };

    default:
      return {
        output: `Tahap ${role} selesai dikerjakan untuk software: ${shortTitle}`,
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

      // Call Gemini API with a 9000ms timeout using active model gemini-3.1-flash-lite
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_9000MS')), 9000)
      );

      const aiPromise = ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: contextPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const response = await Promise.race([aiPromise, timeoutPromise]);
      const responseText = response.text || '';
      const isRevision = responseText.includes('[STATUS: REVISION]') || (role === 'reviewer' && responseText.toLowerCase().includes('perlu revisi'));
      const decision: 'APPROVED' | 'REVISION' = isRevision ? 'REVISION' : 'APPROVED';

      return res.json({
        success: true,
        role,
        output: responseText,
        notes: `Dikerjakan langsung oleh AI Gemini (gemini-3.1-flash-lite - ${role.toUpperCase()})`,
        decision,
        isAi: true,
      });
    } catch (err) {
      console.warn(`[Worker API] Fallback triggered for role "${role}":`, (err as Error).message);
      // Fast fallback to simulated output when timeout or error occurs
      const fallback = generateSimulatedOutput(role, prompt, taskTitle);
      return res.json({
        success: true,
        role,
        output: fallback.output,
        notes: `Simulasi fallback (Mode Respons Cepat): ${fallback.notes}`,
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
