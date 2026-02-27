// app/index.tsx  (atau app/(tabs)/index.tsx)
// Satu halaman yang mengatur semua fase: Upload → Scanning → Analisis → Wawancara

import React, { useState, useCallback } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { theme } from '../src/theme';
import UploadPhase    from '../src/components/UploadPhase';
import ScanningPhase  from '../src/components/ScanningPhase';
import AnalysisPhase  from '../src/components/AnalysisPhase';
import InterviewPhase from '../src/components/InterviewPhase';

import {
  analyzeCV,
  getJobMatches,
  generateInterviewQuestions,
  MOCK_ANALYSIS,
  MOCK_JOBS,
  MOCK_QUESTIONS,
} from '../src/services/analyzer';

type Phase = 'upload' | 'scanning' | 'analisis' | 'wawancara';

const USE_MOCK = true; // Ganti false saat API sudah siap

export default function MainScreen() {
  const [phase,      setPhase]      = useState<Phase>('upload');
  const [loading,    setLoading]    = useState(false);
  const [fileName,   setFileName]   = useState<string | null>(null);
  const [imageUri,   setImageUri]   = useState<string | null>(null);
  const [analisis,   setAnalisis]   = useState<any>(null);
  const [jobs,       setJobs]       = useState<any[]>([]);
  const [pertanyaan, setPertanyaan] = useState<any[]>([]);

  // ── Proses file setelah dipilih ─────────────────────────────────────────────
  const processFile = useCallback(async (asset: any, uri?: string) => {
    setLoading(true);
    setPhase('scanning');
    setFileName(asset?.name ?? 'dokumen.pdf');
    if (uri) setImageUri(uri);

    try {
      if (USE_MOCK) {
        // Simulasi delay analisis
        await new Promise((res) => setTimeout(res, 4000));
        setAnalisis(MOCK_ANALYSIS);
        setJobs(MOCK_JOBS);
        setPhase('analisis');
      } else {
        const result = await analyzeCV(asset);
        setAnalisis(result);
        const jobData = await getJobMatches(result.id);
        setJobs(jobData);
        setPhase('analisis');
      }
    } catch (err) {
      console.error('Analisis gagal:', err);
      setPhase('upload');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Pilih file ───────────────────────────────────────────────────────────────
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        await processFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Picker error:', err);
    }
  };

  // ── Foto CV ──────────────────────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        await processFile(
          { uri: asset.uri, name: `cv_foto_${Date.now()}.jpg`, mimeType: 'image/jpeg' },
          asset.uri,
        );
      }
    } catch (err) {
      console.error('Kamera error:', err);
    }
  };

  // ── Mulai wawancara ──────────────────────────────────────────────────────────
  const handleStartInterview = async () => {
    if (USE_MOCK) {
      setPertanyaan(MOCK_QUESTIONS);
      setPhase('wawancara');
      return;
    }
    try {
      const qs = await generateInterviewQuestions(analisis?.id, analisis?.posisiTarget);
      setPertanyaan(qs);
      setPhase('wawancara');
    } catch (err) {
      console.error('Gagal generate pertanyaan:', err);
      setPertanyaan(MOCK_QUESTIONS);
      setPhase('wawancara');
    }
  };

  // ── Reset ke awal ────────────────────────────────────────────────────────────
  const handleReset = () => {
    setPhase('upload');
    setAnalisis(null);
    setJobs([]);
    setPertanyaan([]);
    setImageUri(null);
    setFileName(null);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />

      {phase === 'upload' && (
        <UploadPhase
          onPickFile={handlePickFile}
          onTakePhoto={handleTakePhoto}
          loading={loading}
        />
      )}

      {phase === 'scanning' && (
        <ScanningPhase fileName={fileName} />
      )}

      {phase === 'analisis' && (
        <AnalysisPhase
          imageUri={imageUri}
          analisis={analisis}
          jobs={jobs}
          onStartInterview={handleStartInterview}
        />
      )}

      {phase === 'wawancara' && (
        <InterviewPhase
          pertanyaan={pertanyaan}
          analisis={analisis}
          onSelesai={handleReset}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
});
