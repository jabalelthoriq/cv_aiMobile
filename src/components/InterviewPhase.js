// src/components/InterviewPhase.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView,
} from 'react-native';
import { theme, sp, r } from '../theme';
import { speak, stopSpeaking } from '../services/tts';
import { startRecording, stopRecording, requestMicPermission } from '../services/stt';

const MAX_SECONDS = 120;

// ─── Waveform ─────────────────────────────────────────────────────────────────
function Waveform({ active }) {
  // Buat semua animated values di top level (tidak di dalam map/callback)
  const a0  = useRef(new Animated.Value(0.15)).current;
  const a1  = useRef(new Animated.Value(0.15)).current;
  const a2  = useRef(new Animated.Value(0.15)).current;
  const a3  = useRef(new Animated.Value(0.15)).current;
  const a4  = useRef(new Animated.Value(0.15)).current;
  const a5  = useRef(new Animated.Value(0.15)).current;
  const a6  = useRef(new Animated.Value(0.15)).current;
  const a7  = useRef(new Animated.Value(0.15)).current;
  const a8  = useRef(new Animated.Value(0.15)).current;
  const a9  = useRef(new Animated.Value(0.15)).current;
  const a10 = useRef(new Animated.Value(0.15)).current;
  const a11 = useRef(new Animated.Value(0.15)).current;
  const a12 = useRef(new Animated.Value(0.15)).current;
  const a13 = useRef(new Animated.Value(0.15)).current;
  const a14 = useRef(new Animated.Value(0.15)).current;

  const bars = [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14];
  const durations = [220, 180, 260, 200, 240, 190, 280, 210, 230, 170, 250, 200, 270, 185, 245];

  useEffect(() => {
    bars.forEach((anim, i) => {
      anim.stopAnimation();
      if (active) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 0.3 + (i % 4) * 0.2, duration: durations[i], useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.15, duration: durations[i], useNativeDriver: true }),
          ])
        ).start();
      } else {
        Animated.timing(anim, { toValue: 0.15, duration: 300, useNativeDriver: true }).start();
      }
    });
  }, [active]);

  return (
    <View style={wf.wrap}>
      {bars.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            wf.bar,
            { backgroundColor: active ? theme.accent : theme.dim },
            { transform: [{ scaleY: anim }] },
          ]}
        />
      ))}
    </View>
  );
}

const wf = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 48, justifyContent: 'center' },
  bar:  { width: 3, height: 36, borderRadius: 2 },
});

// ─── Countdown ring ───────────────────────────────────────────────────────────
function CountdownRing({ seconds, max }) {
  const pct   = seconds / max;
  const color = pct > 0.5 ? theme.green : pct > 0.25 ? theme.amber : theme.red;
  const mm    = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss    = String(seconds % 60).padStart(2, '0');

  return (
    <View style={cd.wrap}>
      <View style={[cd.ring, { borderColor: color + '30' }]}>
        <View style={[cd.innerRing, { borderColor: color }]}>
          <Text style={[cd.time, { color }]}>{mm}:{ss}</Text>
          <Text style={cd.sub}>tersisa</Text>
        </View>
      </View>
    </View>
  );
}

const cd = StyleSheet.create({
  wrap:      { alignItems: 'center' },
  ring:      { width: 100, height: 100, borderRadius: 50, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  innerRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  time:      { fontSize: 20, fontWeight: '800', fontFamily: 'Courier New' },
  sub:       { fontSize: 9, color: theme.muted, letterSpacing: 0.5 },
});

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InterviewPhase({ pertanyaan, analisis, onSelesai }) {
  const [qIdx,      setQIdx]      = useState(0);
  const [fase,      setFase]      = useState('siap');
  const [recording, setRecording] = useState(false);
  const [seconds,   setSeconds]   = useState(MAX_SECONDS);
  const [riwayat,   setRiwayat]   = useState([]);
  const timerRef = useRef(null);
  const fadeIn   = useRef(new Animated.Value(0)).current;

  const soal = pertanyaan[qIdx];

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    requestMicPermission();
    return () => { stopSpeaking(); clearInterval(timerRef.current); };
  }, []);

  // Bacakan soal saat fase = 'tanya'
  useEffect(() => {
    if (fase === 'tanya' && soal) {
      speak(soal.teks, {
        language: 'id-ID',
        rate: 0.85,
        onDone: () => setFase('rekam'),
      });
    }
  }, [fase, qIdx]);

  // Timer saat rekam aktif
  useEffect(() => {
    if (fase === 'rekam') {
      setSeconds(MAX_SECONDS);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { handleStopRecord(true); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [fase]);

  const prosesBerikutnya = useCallback(() => {
    if (qIdx + 1 < pertanyaan.length) {
      setQIdx((i) => i + 1);
      setFase('tanya');
    } else {
      setFase('selesai');
    }
  }, [qIdx, pertanyaan.length]);

  const handleMulai = () => setFase('tanya');

  const handleStartRecord = async () => {
    try {
      await startRecording();
      setRecording(true);
    } catch (e) { console.error(e); }
  };

  const handleStopRecord = useCallback(async (timeout = false) => {
    clearInterval(timerRef.current);
    setRecording(false);
    setFase('evaluasi');
    try {
      await stopRecording();
      // TODO: kirim ke evaluateAnswer(soal.id, audio)
      setTimeout(() => {
        const feedback = timeout
          ? 'Waktu habis. Cobalah lebih ringkas dan terstruktur dalam menjawab.'
          : 'Jawaban cukup baik! Gunakan metode STAR (Situasi, Tugas, Aksi, Hasil) agar lebih terstruktur.';
        setRiwayat((prev) => [...prev, { soal: soal?.teks, tipe: soal?.tipe, feedback, timeout }]);
        prosesBerikutnya();
      }, 1500);
    } catch (e) {
      console.error(e);
      prosesBerikutnya();
    }
  }, [soal, prosesBerikutnya]);

  // ── Layar selesai ──────────────────────────────────────────────────────────
  if (fase === 'selesai') {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.topBar}>
          <View style={s.logoDot} />
          <Text style={s.logoText}>CV<Text style={{ color: theme.accent }}>.AI</Text></Text>
          <View style={[s.chip, { backgroundColor: theme.greenDim }]}>
            <View style={[s.chipDot, { backgroundColor: theme.green }]} />
            <Text style={[s.chipTxt, { color: theme.green }]}>Wawancara Selesai</Text>
          </View>
        </View>

        <Text style={s.doneTitle}>Sesi Wawancara Selesai</Text>
        <Text style={s.doneSub}>Berikut ringkasan feedback AI untuk setiap pertanyaan.</Text>

        {riwayat.map((item, i) => (
          <View key={i} style={s.riwayatCard}>
            <View style={s.riwayatHeader}>
              <View style={s.tipeBadge}><Text style={s.tipeText}>{item.tipe}</Text></View>
              {item.timeout && (
                <View style={[s.tipeBadge, { backgroundColor: theme.red + '20' }]}>
                  <Text style={[s.tipeText, { color: theme.red }]}>Waktu Habis</Text>
                </View>
              )}
            </View>
            <Text style={s.riwayatSoal}>"{item.soal}"</Text>
            <View style={s.feedbackBox}>
              <Text style={s.feedbackLabel}>FEEDBACK AI</Text>
              <Text style={s.feedbackText}>{item.feedback}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={s.ulangBtn} onPress={onSelesai}>
          <Text style={s.ulangBtnText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
        <View style={{ height: sp.xxl }} />
      </ScrollView>
    );
  }

  // ── Wawancara berlangsung ──────────────────────────────────────────────────
  return (
    <Animated.View style={[s.container, { opacity: fadeIn }]}>
      <View style={s.topBar}>
        <View style={s.logoDot} />
        <Text style={s.logoText}>CV<Text style={{ color: theme.accent }}>.AI</Text></Text>
        <View style={s.progressChip}>
          <Text style={s.progressText}>{qIdx + 1} / {pertanyaan.length}</Text>
        </View>
      </View>

      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${(qIdx / pertanyaan.length) * 100}%` }]} />
      </View>

      <View style={s.mainContent}>
        {/* Siap */}
        {fase === 'siap' && (
          <View style={s.centerBox}>
            <View style={s.readyIcon}>
              <View style={s.readyRing1} />
              <View style={s.readyRing2} />
              <View style={s.readyCore} />
            </View>
            <Text style={s.readyTitle}>Siap untuk Wawancara?</Text>
            <Text style={s.readySub}>
              AI akan membacakan <Text style={{ color: theme.accent }}>{pertanyaan.length} pertanyaan</Text> melalui suara.{'\n'}
              Setiap pertanyaan diberi waktu maksimal <Text style={{ color: theme.amber }}>2 menit</Text>.
            </Text>
            <Text style={s.readyCv}>Posisi: <Text style={{ color: theme.accent }}>{analisis?.posisiTarget}</Text></Text>
            <TouchableOpacity style={s.startBtn} onPress={handleMulai} activeOpacity={0.85}>
              <View style={s.startBtnInner}>
                <View style={s.startDot} />
                <Text style={s.startBtnText}>Mulai Sekarang</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* AI sedang berbicara */}
        {fase === 'tanya' && (
          <View style={s.centerBox}>
            <View style={s.speakingWrap}>
              <Waveform active={true} />
              <Text style={s.speakingLabel}>AI sedang mengajukan pertanyaan...</Text>
            </View>
            <View style={s.questionBox}>
              <View style={s.qMeta}>
                <Text style={s.qNum}>Pertanyaan {qIdx + 1}</Text>
                <View style={[s.tipeBadge, { backgroundColor: theme.accentDim + '60' }]}>
                  <Text style={[s.tipeText, { color: theme.accent }]}>{soal?.tipe}</Text>
                </View>
              </View>
              <Text style={s.qText}>"{soal?.teks}"</Text>
            </View>
          </View>
        )}

        {/* User menjawab */}
        {fase === 'rekam' && (
          <View style={s.centerBox}>
            <CountdownRing seconds={seconds} max={MAX_SECONDS} />
            <View style={s.questionBox}>
              <View style={s.qMeta}>
                <Text style={s.qNum}>Pertanyaan {qIdx + 1}</Text>
                <View style={s.tipeBadge}>
                  <Text style={s.tipeText}>{soal?.tipe}</Text>
                </View>
              </View>
              <Text style={s.qText}>"{soal?.teks}"</Text>
            </View>
            <Waveform active={recording} />
            {!recording ? (
              <TouchableOpacity style={s.recBtn} onPress={handleStartRecord} activeOpacity={0.85}>
                <View style={s.recBtnCore} />
                <Text style={s.recBtnText}>Mulai Menjawab</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[s.recBtn, s.recBtnStop]} onPress={() => handleStopRecord(false)} activeOpacity={0.85}>
                <View style={[s.recBtnCore, s.recBtnCoreStop]} />
                <Text style={[s.recBtnText, { color: theme.red }]}>Selesai Menjawab</Text>
              </TouchableOpacity>
            )}
            <Text style={s.recHint}>
              {recording ? 'Sedang merekam — ketuk untuk selesai' : 'Ketuk untuk mulai merekam jawaban Anda'}
            </Text>
          </View>
        )}

        {/* Evaluasi */}
        {fase === 'evaluasi' && (
          <View style={s.centerBox}>
            <View style={s.evalWrap}>
              <View style={s.evalRing} />
              <Text style={s.evalTitle}>Mengevaluasi jawaban...</Text>
              <Text style={s.evalSub}>AI sedang menganalisis respons Anda</Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: theme.bg },
  content:      { padding: sp.lg },
  mainContent:  { flex: 1, paddingHorizontal: sp.lg },

  topBar:       { flexDirection: 'row', alignItems: 'center', gap: sp.sm, padding: sp.lg, borderBottomWidth: 1, borderBottomColor: theme.border },
  logoDot:      { width: 7, height: 7, borderRadius: r.full, backgroundColor: theme.accent },
  logoText:     { flex: 1, fontSize: 18, fontWeight: '800', color: theme.text, letterSpacing: 1.5 },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: sp.xs, paddingHorizontal: sp.sm, paddingVertical: sp.xs, borderRadius: r.full },
  chipDot:      { width: 5, height: 5, borderRadius: r.full },
  chipTxt:      { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  progressChip: { backgroundColor: theme.dim, paddingHorizontal: sp.sm, paddingVertical: sp.xs, borderRadius: r.full },
  progressText: { fontSize: 11, fontFamily: 'Courier New', color: theme.accent },
  progressTrack:{ height: 2, backgroundColor: theme.border },
  progressFill: { height: '100%', backgroundColor: theme.accent },

  centerBox:    { flex: 1, justifyContent: 'center', alignItems: 'center', gap: sp.lg, paddingVertical: sp.xl },

  readyIcon:    { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: sp.md },
  readyRing1:   { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: theme.accent + '30' },
  readyRing2:   { position: 'absolute', width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: theme.accent + '60' },
  readyCore:    { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.accent },
  readyTitle:   { fontSize: 22, fontWeight: '800', color: theme.text, textAlign: 'center' },
  readySub:     { fontSize: 14, color: theme.muted, textAlign: 'center', lineHeight: 22 },
  readyCv:      { fontSize: 13, color: theme.muted },
  startBtn:     { borderWidth: 1, borderColor: theme.accent, borderRadius: r.md, paddingVertical: sp.md, paddingHorizontal: sp.xl, marginTop: sp.sm, backgroundColor: theme.accent + '10' },
  startBtnInner:{ flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  startDot:     { width: 7, height: 7, borderRadius: r.full, backgroundColor: theme.accent },
  startBtnText: { fontSize: 16, fontWeight: '700', color: theme.accent, letterSpacing: 0.5 },

  speakingWrap:  { alignItems: 'center', gap: sp.sm },
  speakingLabel: { fontSize: 12, color: theme.muted, letterSpacing: 0.5 },

  questionBox:  { width: '100%', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.borderHi, borderRadius: r.md, padding: sp.md, borderLeftWidth: 3, borderLeftColor: theme.accent },
  qMeta:        { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginBottom: sp.sm },
  qNum:         { fontSize: 11, color: theme.muted, fontFamily: 'Courier New' },
  tipeBadge:    { paddingHorizontal: sp.sm, paddingVertical: 2, borderRadius: r.sm, backgroundColor: theme.dim },
  tipeText:     { fontSize: 10, fontWeight: '600', color: theme.muted, letterSpacing: 0.5 },
  qText:        { fontSize: 15, color: theme.text, lineHeight: 24, fontWeight: '500' },

  recBtn:        { width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: theme.borderHi, alignItems: 'center', justifyContent: 'center', gap: sp.xs, backgroundColor: theme.card },
  recBtnStop:    { borderColor: theme.red + '60', backgroundColor: theme.red + '08' },
  recBtnCore:    { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.accent + '20', borderWidth: 1, borderColor: theme.accent },
  recBtnCoreStop:{ borderRadius: r.sm, backgroundColor: theme.red + '30', borderColor: theme.red },
  recBtnText:    { fontSize: 13, fontWeight: '700', color: theme.accent, letterSpacing: 0.5 },
  recHint:       { fontSize: 11, color: theme.muted, textAlign: 'center' },

  evalWrap:  { alignItems: 'center', gap: sp.md },
  evalRing:  { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: theme.accent },
  evalTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
  evalSub:   { fontSize: 13, color: theme.muted },

  doneTitle:     { fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: sp.xs, marginTop: sp.md },
  doneSub:       { fontSize: 13, color: theme.muted, marginBottom: sp.lg, lineHeight: 20 },
  riwayatCard:   { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: r.md, padding: sp.md, marginBottom: sp.md },
  riwayatHeader: { flexDirection: 'row', gap: sp.sm, marginBottom: sp.sm },
  riwayatSoal:   { fontSize: 13, color: theme.text, fontStyle: 'italic', marginBottom: sp.sm, lineHeight: 20 },
  feedbackBox:   { backgroundColor: theme.accentDim + '25', borderRadius: r.sm, padding: sp.sm },
  feedbackLabel: { fontSize: 10, fontWeight: '700', color: theme.accent, letterSpacing: 1, marginBottom: sp.xs },
  feedbackText:  { fontSize: 13, color: theme.text, lineHeight: 20 },
  ulangBtn:      { borderWidth: 1, borderColor: theme.borderHi, borderRadius: r.md, paddingVertical: sp.md, alignItems: 'center', marginTop: sp.lg },
  ulangBtnText:  { fontSize: 14, fontWeight: '700', color: theme.accent },
});
