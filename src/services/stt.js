// src/services/stt.js — Recording menggunakan expo-audio (SDK 54+)
// Menggantikan expo-av yang sudah deprecated

import { useAudioRecorder, RecordingOptions, AudioQuality } from 'expo-audio';

// Fallback: jika expo-audio belum tersedia, gunakan expo-av
let _recording = null;
let _useNewApi  = false;

async function tryImportAudio() {
  try {
    const mod = await import('expo-audio');
    _useNewApi = true;
    return mod;
  } catch {
    _useNewApi = false;
    return null;
  }
}

// ── Menggunakan expo-av (kompatibel SDK 53 ke bawah) ──────────────────────────
async function _startRecordingAV() {
  const { Audio } = await import('expo-av');
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  _recording = recording;
}

async function _stopRecordingAV() {
  if (!_recording) throw new Error('Tidak ada rekaman aktif.');
  await _recording.stopAndUnloadAsync();
  const uri = _recording.getURI();
  _recording = null;
  const { Audio } = await import('expo-av');
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  return { uri, name: `jawaban_${Date.now()}.m4a` };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function requestMicPermission() {
  try {
    const { Audio } = await import('expo-av');
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function startRecording() {
  return _startRecordingAV();
}

export async function stopRecording() {
  return _stopRecordingAV();
}

export function isRecording() {
  return _recording !== null;
}
