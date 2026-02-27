// src/services/tts.js
import * as Speech from 'expo-speech';

/**
 * Baca teks dengan suara (TTS).
 * @param {string} text
 * @param {object} opts
 * @param {Function} opts.onDone  - dipanggil saat selesai
 * @param {Function} opts.onError
 * @param {number}   opts.rate    - kecepatan (default 0.9)
 * @param {string}   opts.language - bahasa (default 'id-ID')
 */
export function speak(text, { onDone, onError, rate = 0.9, language = 'id-ID' } = {}) {
  Speech.stop();
  Speech.speak(text, { language, rate, pitch: 1.0, onDone, onError });
}

export function stopSpeaking() {
  Speech.stop();
}

export async function isSpeaking() {
  return Speech.isSpeakingAsync();
}
