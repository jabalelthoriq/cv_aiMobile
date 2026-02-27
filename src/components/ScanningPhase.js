// src/components/ScanningPhase.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { theme, sp, r } from '../theme';

const { width, height } = Dimensions.get('window');

const STEPS = [
  'Membaca struktur dokumen...',
  'Mengekstrak data pengalaman kerja...',
  'Menganalisis keahlian teknis...',
  'Mencocokkan dengan database lowongan...',
  'Menyusun laporan analisis...',
];

export default function ScanningPhase({ fileName }) {
  const scanY     = useRef(new Animated.Value(0)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const [step, setStep] = React.useState(0);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // Scan line
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanY, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])
    ).start();

    // Step progression
    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const translateY = scanY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <Animated.View style={[s.wrap, { opacity: fadeIn }]}>
      {/* Logo */}
      <View style={s.header}>
        <View style={s.logoDot} />
        <Text style={s.logoText}>CV<Text style={{ color: theme.accent }}>.AI</Text></Text>
      </View>

      {/* Document scan visual */}
      <View style={s.docWrap}>
        {/* Corner decorations */}
        <View style={[s.corner, s.cTL]} />
        <View style={[s.corner, s.cTR]} />
        <View style={[s.corner, s.cBL]} />
        <View style={[s.corner, s.cBR]} />

        {/* Mock document lines */}
        <View style={s.docContent}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={[s.docLine, {
                width: `${65 + Math.sin(i) * 25}%`,
                opacity: 0.15 + (i % 3 === 0 ? 0.1 : 0),
              }]}
            />
          ))}
        </View>

        {/* Scan line */}
        <Animated.View style={[s.scanLine, { transform: [{ translateY }] }]}>
          <View style={s.scanLineGlow} />
        </Animated.View>
      </View>

      {/* File name */}
      <View style={s.fileChip}>
        <View style={s.fileDot} />
        <Text style={s.fileName} numberOfLines={1}>{fileName ?? 'dokumen.pdf'}</Text>
      </View>

      {/* Steps */}
      <View style={s.stepsWrap}>
        {STEPS.map((st, i) => (
          <View key={i} style={s.stepRow}>
            <View style={[
              s.stepDot,
              i < step  && s.stepDotDone,
              i === step && s.stepDotActive,
            ]} />
            <Text style={[
              s.stepText,
              i < step   && { color: theme.muted },
              i === step && { color: theme.text },
              i > step   && { color: theme.dim },
            ]}>{st}</Text>
            {i < step && <Text style={s.checkMark}>OK</Text>}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const CORNER = 14;
const s = StyleSheet.create({
  wrap: {
    flex: 1, backgroundColor: theme.bg,
    paddingHorizontal: sp.lg, justifyContent: 'space-around',
    paddingVertical: sp.xxl,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  logoDot:  { width: 7, height: 7, borderRadius: r.full, backgroundColor: theme.accent },
  logoText: { fontSize: 18, fontWeight: '800', color: theme.text, letterSpacing: 1.5 },

  docWrap: {
    alignSelf: 'center', width: '80%', height: 220,
    borderWidth: 1, borderColor: theme.borderHi,
    borderRadius: r.lg, overflow: 'hidden',
    backgroundColor: theme.card, position: 'relative',
  },
  corner:  { position: 'absolute', width: CORNER, height: CORNER, borderColor: theme.accent, zIndex: 2 },
  cTL: { top: -1,  left: -1,  borderTopWidth: 2, borderLeftWidth: 2,  borderTopLeftRadius:     r.lg },
  cTR: { top: -1,  right: -1, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius:    r.lg },
  cBL: { bottom: -1, left: -1,  borderBottomWidth: 2, borderLeftWidth: 2,  borderBottomLeftRadius:  r.lg },
  cBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: r.lg },

  docContent: { padding: sp.lg, gap: sp.sm },
  docLine: { height: 6, backgroundColor: theme.muted, borderRadius: r.sm, marginBottom: sp.xs },

  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: theme.accent,
    shadowColor: theme.accent, shadowOpacity: 0.8, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  scanLineGlow: {
    position: 'absolute', left: 0, right: 0, top: -8, height: 18,
    backgroundColor: theme.accent + '15',
  },

  fileChip: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
    alignSelf: 'center', paddingHorizontal: sp.md, paddingVertical: sp.sm,
    borderRadius: r.full,
  },
  fileDot:  { width: 6, height: 6, borderRadius: r.full, backgroundColor: theme.accent },
  fileName: { fontSize: 12, color: theme.text, fontFamily: 'Courier New', maxWidth: 220 },

  stepsWrap: { gap: sp.sm },
  stepRow:   { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  stepDot:        { width: 8, height: 8, borderRadius: r.full, backgroundColor: theme.dim, borderWidth: 1, borderColor: theme.border },
  stepDotActive:  { backgroundColor: theme.accent, borderColor: theme.accent, shadowColor: theme.accent, shadowOpacity: 0.8, shadowRadius: 6, elevation: 3 },
  stepDotDone:    { backgroundColor: theme.green, borderColor: theme.green },
  stepText:       { flex: 1, fontSize: 13 },
  checkMark:      { fontSize: 10, fontFamily: 'Courier New', color: theme.green, fontWeight: '700' },
});
