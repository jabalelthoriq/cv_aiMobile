// src/components/AnalysisPhase.js
import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  Animated, Dimensions, TouchableOpacity,
} from 'react-native';
import { theme, sp, r } from '../theme';

const { width } = Dimensions.get('window');

// ─── Skill bar ────────────────────────────────────────────────────────────────
function SkillBar({ nama, skor, level, delay = 0 }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.timing(anim, { toValue: skor / 100, duration: 900, useNativeDriver: false }).start();
    }, delay);
  }, []);

  const color = skor >= 80 ? theme.green : skor >= 60 ? theme.accent : theme.amber;

  return (
    <View style={sb.row}>
      <View style={sb.meta}>
        <Text style={sb.name}>{nama}</Text>
        <Text style={[sb.level, { color }]}>{level}</Text>
      </View>
      <View style={sb.track}>
        <Animated.View style={[sb.fill, { width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: color }]} />
      </View>
      <Text style={[sb.pct, { color }]}>{skor}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  row:   { marginBottom: sp.md },
  meta:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  name:  { fontSize: 13, color: theme.text },
  level: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  track: { height: 3, backgroundColor: theme.dim, borderRadius: r.full, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: r.full },
  pct:   { fontSize: 11, fontFamily: 'Courier New', marginTop: 4, textAlign: 'right' },
});

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ skor }) {
  const color = skor >= 80 ? theme.green : skor >= 60 ? theme.accent : theme.amber;
  return (
    <View style={sr.wrap}>
      <View style={[sr.ring, { borderColor: color + '30' }]}>
        <View style={[sr.innerRing, { borderColor: color + '60' }]}>
          <Text style={[sr.num, { color }]}>{skor}</Text>
          <Text style={sr.sub}>/ 100</Text>
        </View>
      </View>
      <Text style={sr.label}>Skor CV</Text>
    </View>
  );
}

const sr = StyleSheet.create({
  wrap:      { alignItems: 'center' },
  ring:      { width: 96, height: 96, borderRadius: 48, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  innerRing: { width: 76, height: 76, borderRadius: 38, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  num:       { fontSize: 28, fontWeight: '800', lineHeight: 32 },
  sub:       { fontSize: 10, color: theme.muted },
  label:     { fontSize: 11, color: theme.muted, marginTop: sp.xs, letterSpacing: 0.5 },
});

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ label, accent }) {
  return (
    <View style={sh.row}>
      <View style={[sh.bar, { backgroundColor: accent ?? theme.accent }]} />
      <Text style={sh.label}>{label}</Text>
      <View style={sh.line} />
    </View>
  );
}
const sh = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginBottom: sp.md, marginTop: sp.lg },
  bar:   { width: 3, height: 14, borderRadius: r.full },
  label: { fontSize: 11, fontWeight: '700', color: theme.muted, letterSpacing: 1.2, textTransform: 'uppercase' },
  line:  { flex: 1, height: 1, backgroundColor: theme.border },
});

// ─── Main component ───────────────────────────────────────────────────────────
export default function AnalysisPhase({ imageUri, analisis, jobs, onStartInterview }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeIn }}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header bar */}
        <View style={s.topBar}>
          <View style={s.logoDot} />
          <Text style={s.logoText}>CV<Text style={{ color: theme.accent }}>.AI</Text></Text>
          <View style={[s.statusChip, { backgroundColor: theme.greenDim }]}>
            <View style={[s.chipDot, { backgroundColor: theme.green }]} />
            <Text style={[s.chipText, { color: theme.green }]}>Analisis Selesai</Text>
          </View>
        </View>

        {/* CV Image preview */}
        {imageUri ? (
          <View style={s.imageWrap}>
            <View style={[s.corner, s.cTL]} /><View style={[s.corner, s.cTR]} />
            <View style={[s.corner, s.cBL]} /><View style={[s.corner, s.cBR]} />
            <Image source={{ uri: imageUri }} style={s.cvImage} resizeMode="contain" />
          </View>
        ) : (
          <View style={s.noImageWrap}>
            <Text style={s.noImageText}>CV berhasil diproses</Text>
            <Text style={s.noImageSub}>{analisis?.nama ?? '—'}</Text>
          </View>
        )}

        {/* Identity + score */}
        <View style={s.identityRow}>
          <View style={s.identityInfo}>
            <Text style={s.candidateName}>{analisis?.nama ?? '—'}</Text>
            <Text style={s.targetRole}>{analisis?.posisiTarget ?? '—'}</Text>
          </View>
          <ScoreRing skor={analisis?.skor ?? 0} />
        </View>

        {/* Ringkasan */}
        <SectionHead label="Ringkasan AI" />
        <View style={s.summaryBox}>
          <Text style={s.summaryText}>{analisis?.ringkasan}</Text>
        </View>

        {/* Keahlian */}
        <SectionHead label="Peta Keahlian" />
        {analisis?.keahlian?.map((k, i) => (
          <SkillBar key={k.nama} {...k} delay={i * 100} />
        ))}

        {/* Kelebihan & Kekurangan */}
        <View style={s.twoCol}>
          <View style={[s.colCard, { flex: 1 }]}>
            <SectionHead label="Kelebihan" accent={theme.green} />
            {analisis?.kelebihan?.map((item, i) => (
              <View key={i} style={s.bulletRow}>
                <View style={[s.bullet, { backgroundColor: theme.green }]} />
                <Text style={s.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={[s.colCard, { flex: 1 }]}>
            <SectionHead label="Perlu Diperbaiki" accent={theme.amber} />
            {analisis?.kekurangan?.map((item, i) => (
              <View key={i} style={s.bulletRow}>
                <View style={[s.bullet, { backgroundColor: theme.amber }]} />
                <Text style={s.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Lowongan cocok */}
        <SectionHead label="Lowongan yang Cocok" />
        {jobs?.map((job) => (
          <View key={job.id} style={s.jobCard}>
            <View style={s.jobLeft}>
              <Text style={s.jobPos}>{job.posisi}</Text>
              <Text style={s.jobCo}>{job.perusahaan}</Text>
              <View style={s.jobMeta}>
                <View style={s.metaChip}><Text style={s.metaText}>{job.lokasi}</Text></View>
                <View style={s.metaChip}><Text style={s.metaText}>{job.tipe}</Text></View>
                <View style={s.metaChip}><Text style={s.metaText}>{job.gaji}</Text></View>
              </View>
            </View>
            <View style={s.jobRight}>
              <Text style={[s.matchPct, {
                color: job.cocok >= 85 ? theme.green : job.cocok >= 70 ? theme.accent : theme.amber,
              }]}>{job.cocok}%</Text>
              <Text style={s.matchLabel}>kecocokan</Text>
            </View>
          </View>
        ))}

        {/* Interview CTA */}
        <View style={s.ctaWrap}>
          <View style={s.ctaDivider} />
          <Text style={s.ctaTitle}>Siap untuk Simulasi Wawancara?</Text>
          <Text style={s.ctaSub}>
            AI akan mengajukan pertanyaan melalui suara. Setiap pertanyaan diberi waktu maksimal 2 menit.
          </Text>
          <TouchableOpacity style={s.ctaBtn} onPress={onStartInterview} activeOpacity={0.85}>
            <View style={s.ctaBtnInner}>
              <View style={s.ctaBtnDot} />
              <Text style={s.ctaBtnText}>Mulai Simulasi Wawancara</Text>
            </View>
            {/* Scan line effect */}
            <View style={s.ctaBtnGlow} />
          </TouchableOpacity>
        </View>

        <View style={{ height: sp.xxl }} />
      </ScrollView>
    </Animated.View>
  );
}

const CORNER = 14;
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content:   { padding: sp.lg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    marginBottom: sp.lg,
    paddingBottom: sp.md,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  logoDot:  { width: 7, height: 7, borderRadius: r.full, backgroundColor: theme.accent },
  logoText: { flex: 1, fontSize: 18, fontWeight: '800', color: theme.text, letterSpacing: 1.5 },
  statusChip:  { flexDirection: 'row', alignItems: 'center', gap: sp.xs, paddingHorizontal: sp.sm, paddingVertical: sp.xs, borderRadius: r.full },
  chipDot:     { width: 5, height: 5, borderRadius: r.full },
  chipText:    { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },

  imageWrap: {
    borderWidth: 1, borderColor: theme.borderHi,
    borderRadius: r.lg, overflow: 'hidden',
    marginBottom: sp.lg, position: 'relative',
    backgroundColor: theme.card,
  },
  corner:  { position: 'absolute', width: CORNER, height: CORNER, borderColor: theme.accent, zIndex: 2 },
  cTL: { top: -1,  left: -1,  borderTopWidth: 2, borderLeftWidth: 2,  borderTopLeftRadius:     r.lg },
  cTR: { top: -1,  right: -1, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius:    r.lg },
  cBL: { bottom: -1, left: -1,  borderBottomWidth: 2, borderLeftWidth: 2,  borderBottomLeftRadius:  r.lg },
  cBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: r.lg },
  cvImage: { width: '100%', height: 220 },
  noImageWrap: {
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.borderHi,
    borderRadius: r.lg, padding: sp.xl, alignItems: 'center', marginBottom: sp.lg,
  },
  noImageText: { fontSize: 14, color: theme.muted, marginBottom: sp.xs },
  noImageSub:  { fontSize: 18, fontWeight: '700', color: theme.accent },

  identityRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: sp.md,
  },
  identityInfo: { flex: 1 },
  candidateName: { fontSize: 22, fontWeight: '800', color: theme.text, letterSpacing: 0.3 },
  targetRole:    { fontSize: 13, color: theme.muted, marginTop: 2 },

  summaryBox: {
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.borderHi,
    borderRadius: r.md, padding: sp.md,
    borderLeftWidth: 3, borderLeftColor: theme.accent,
  },
  summaryText: { fontSize: 13, color: theme.text, lineHeight: 22 },

  twoCol: { flexDirection: 'row', gap: sp.md },
  colCard: {},
  bulletRow: { flexDirection: 'row', gap: sp.sm, marginBottom: sp.sm, alignItems: 'flex-start' },
  bullet:    { width: 5, height: 5, borderRadius: r.full, marginTop: 6 },
  bulletText:{ flex: 1, fontSize: 12, color: theme.text, lineHeight: 18 },

  jobCard: {
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
    borderRadius: r.md, padding: sp.md, marginBottom: sp.sm,
    flexDirection: 'row', alignItems: 'center',
  },
  jobLeft:    { flex: 1 },
  jobPos:     { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 2 },
  jobCo:      { fontSize: 12, color: theme.accent, marginBottom: sp.sm },
  jobMeta:    { flexDirection: 'row', flexWrap: 'wrap', gap: sp.xs },
  metaChip:   { backgroundColor: theme.dim, paddingHorizontal: sp.sm, paddingVertical: 2, borderRadius: r.sm },
  metaText:   { fontSize: 10, color: theme.muted },
  jobRight:   { alignItems: 'flex-end', paddingLeft: sp.md },
  matchPct:   { fontSize: 22, fontWeight: '800', fontFamily: 'Courier New' },
  matchLabel: { fontSize: 10, color: theme.muted },

  ctaWrap:   { marginTop: sp.lg },
  ctaDivider: { height: 1, backgroundColor: theme.border, marginBottom: sp.lg },
  ctaTitle:  { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: sp.sm, letterSpacing: 0.3 },
  ctaSub:    { fontSize: 13, color: theme.muted, lineHeight: 20, marginBottom: sp.lg },
  ctaBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1, borderColor: theme.accent,
    borderRadius: r.md, paddingVertical: sp.md,
    alignItems: 'center', overflow: 'hidden',
    position: 'relative',
  },
  ctaBtnInner: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, zIndex: 2 },
  ctaBtnDot:   { width: 8, height: 8, borderRadius: r.full, backgroundColor: theme.accent },
  ctaBtnText:  { fontSize: 15, fontWeight: '700', color: theme.accent, letterSpacing: 0.5 },
  ctaBtnGlow: {
    position: 'absolute', inset: 0,
    backgroundColor: theme.accent + '08',
  },
});
