// src/components/UploadPhase.js
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { theme, sp, r } from '../theme';

export default function UploadPhase({ onPickFile, onTakePhoto, loading }) {
  const pulse  = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  // borderGlow: animasi opacity border, tanpa useNativeDriver conflict
  const borderOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // fadeIn — native driver OK
    Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }).start();

    // pulse scale — native driver OK
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // border glow — useNativeDriver: false (menganimasikan opacity, bukan transform)
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderOpacity, { toValue: 1,   duration: 2500, useNativeDriver: false }),
        Animated.timing(borderOpacity, { toValue: 0.4, duration: 2500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[s.wrap, { opacity: fadeIn }]}>
      {/* Grid background lines */}
      <View style={s.gridBg} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[s.gridLine, { top: `${i * 14}%` }]} />
        ))}
      </View>

      {/* Header */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoDot} />
          <Text style={s.logoText}>CV<Text style={s.logoAccent}>.AI</Text></Text>
        </View>
        <Text style={s.tagline}>Analisis CV Berbasis Kecerdasan Buatan</Text>
      </View>

      {/* Upload zone — border opacity dianimasikan terpisah */}
      <Animated.View style={[s.uploadZone, { transform: [{ scale: pulse }] }]}>
        {/* Animated border corners */}
        <Animated.View style={[s.corner, s.cornerTL, { opacity: borderOpacity }]} />
        <Animated.View style={[s.corner, s.cornerTR, { opacity: borderOpacity }]} />
        <Animated.View style={[s.corner, s.cornerBL, { opacity: borderOpacity }]} />
        <Animated.View style={[s.corner, s.cornerBR, { opacity: borderOpacity }]} />

        {/* Scan icon */}
        <View style={s.scanIcon}>
          <View style={s.scanRing} />
          <View style={s.scanInner} />
          <View style={s.scanCross1} />
          <View style={s.scanCross2} />
        </View>

        <Text style={s.zoneTitle}>Unggah CV Anda</Text>
        <Text style={s.zoneSub}>Format PDF atau DOCX · Maks 10MB</Text>
        <Text style={s.zoneSub2}>Atau ambil foto halaman CV</Text>
      </Animated.View>

      {/* Buttons */}
      <View style={s.btnGroup}>
        <TouchableOpacity style={s.btnPrimary} onPress={onPickFile} disabled={loading} activeOpacity={0.8}>
          <View style={s.btnInner}>
            <View style={s.btnDot} />
            <Text style={s.btnPrimaryText}>{loading ? 'Memproses...' : 'Pilih File CV'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={s.btnSecondary} onPress={onTakePhoto} disabled={loading} activeOpacity={0.8}>
          <Text style={s.btnSecondaryText}>Foto CV</Text>
        </TouchableOpacity>
      </View>

      {/* Status bar */}
      <View style={s.statusBar}>
        <View style={[s.statusDot, loading && s.statusDotActive]} />
        <Text style={s.statusText}>
          {loading ? 'Memproses dokumen...' : 'Sistem siap menerima dokumen'}
        </Text>
      </View>
    </Animated.View>
  );
}

const CORNER = 16;
const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: sp.lg,
    justifyContent: 'space-between',
    paddingTop: sp.xxl,
    paddingBottom: sp.xl,
  },
  gridBg:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: theme.border, opacity: 0.4 },

  header:     { alignItems: 'center', marginBottom: sp.xl },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginBottom: sp.sm },
  logoDot:    { width: 8, height: 8, borderRadius: r.full, backgroundColor: theme.accent },
  logoText:   { fontSize: 28, fontWeight: '800', color: theme.text, letterSpacing: 2 },
  logoAccent: { color: theme.accent },
  tagline:    { fontSize: 12, color: theme.muted, letterSpacing: 1.5, textTransform: 'uppercase' },

  uploadZone: {
    borderWidth: 1,
    borderColor: theme.borderHi,
    borderRadius: r.lg,
    padding: sp.xxl,
    alignItems: 'center',
    backgroundColor: theme.card,
    marginVertical: sp.lg,
  },

  corner:   { position: 'absolute', width: CORNER, height: CORNER, borderColor: theme.accent },
  cornerTL: { top: -1,    left: -1,  borderTopWidth: 2,    borderLeftWidth: 2,  borderTopLeftRadius:     r.lg },
  cornerTR: { top: -1,    right: -1, borderTopWidth: 2,    borderRightWidth: 2, borderTopRightRadius:    r.lg },
  cornerBL: { bottom: -1, left: -1,  borderBottomWidth: 2, borderLeftWidth: 2,  borderBottomLeftRadius:  r.lg },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: r.lg },

  scanIcon:   { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginBottom: sp.lg },
  scanRing:   { position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: theme.accent + '40' },
  scanInner:  { position: 'absolute', width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: theme.accent + '60' },
  scanCross1: { position: 'absolute', width: 24, height: 1,  backgroundColor: theme.accent },
  scanCross2: { position: 'absolute', width: 1,  height: 24, backgroundColor: theme.accent },

  zoneTitle: { fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: sp.xs, letterSpacing: 0.5 },
  zoneSub:   { fontSize: 13, color: theme.muted, textAlign: 'center' },
  zoneSub2:  { fontSize: 12, color: theme.muted, opacity: 0.6, marginTop: sp.xs },

  btnGroup:       { gap: sp.sm },
  btnPrimary:     { backgroundColor: theme.accent, borderRadius: r.md, paddingVertical: sp.md, alignItems: 'center' },
  btnInner:       { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  btnDot:         { width: 6, height: 6, borderRadius: r.full, backgroundColor: theme.bg },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: theme.bg, letterSpacing: 0.5 },
  btnSecondary:   { borderWidth: 1, borderColor: theme.borderHi, borderRadius: r.md, paddingVertical: sp.md, alignItems: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: theme.accent, letterSpacing: 0.5 },

  statusBar:       { flexDirection: 'row', alignItems: 'center', gap: sp.sm, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: sp.md },
  statusDot:       { width: 6, height: 6, borderRadius: r.full, backgroundColor: theme.muted },
  statusDotActive: { backgroundColor: theme.green },
  statusText:      { fontSize: 11, color: theme.muted, letterSpacing: 0.5 },
});
