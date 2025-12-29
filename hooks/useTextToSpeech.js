import { useEffect, useCallback, useRef } from 'react';
import ttsService from '@/services/textToSpeechService';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Custom hook for Text-to-Speech functionality
 * Integrates with language context and provides easy narration methods
 */
export function useTextToSpeech(enabled = true) {
  const { language } = useLanguage();
  const hasSpokenRef = useRef(false);

  // Update TTS language when app language changes
  useEffect(() => {
    ttsService.setLanguage(language);
  }, [language]);

  // Safe wrapper - always return, even if checking conditions inside
  const safeSpeak = useCallback((text, options = {}) => {
    if (!enabled || !ttsService.isAvailable() || !text) {
      return Promise.resolve();
    }
    return ttsService.speak(text, options);
  }, [enabled]);

  const safeSpeakPageHeading = useCallback((heading) => {
    if (!enabled || !ttsService.isAvailable() || !heading) {
      return;
    }
    ttsService.speakHeading(heading);
  }, [enabled]);

  const safeSpeakPageDescription = useCallback((description) => {
    if (!enabled || !ttsService.isAvailable() || !description) {
      return;
    }
    ttsService.speakDescription(description);
  }, [enabled]);

  const safeSpeakAction = useCallback((action) => {
    if (!enabled || !ttsService.isAvailable() || !action) {
      return;
    }
    ttsService.speakAction(action);
  }, [enabled]);

  const safeSpeakSequence = useCallback((texts, options = {}) => {
    if (!enabled || !ttsService.isAvailable() || !Array.isArray(texts)) {
      return Promise.resolve();
    }
    return ttsService.speakSequence(texts, options);
  }, [enabled]);

  const safeSpeakOnMount = useCallback((heading, description = '') => {
    if (!enabled || !ttsService.isAvailable()) {
      return;
    }
    if (hasSpokenRef.current) {
      return;
    }
    hasSpokenRef.current = true;
    ttsService.speakSequence([heading, description].filter(Boolean));
  }, [enabled]);

  const resetSpoken = useCallback(() => {
    hasSpokenRef.current = false;
  }, []);

  const cancel = useCallback(() => {
    ttsService.cancel();
    hasSpokenRef.current = false;
  }, []);

  // Non-hook functions
  const isSpeaking = () => ttsService.getSpeakingStatus();
  const isLanguageSupported = () => ttsService.isLanguageSupported(language);
  const getAvailableVoices = () => ttsService.getAvailableVoices();

  return {
    speak: safeSpeak,
    speakSequence: safeSpeakSequence,
    speakPageHeading: safeSpeakPageHeading,
    speakPageDescription: safeSpeakPageDescription,
    speakAction: safeSpeakAction,
    speakOnMount: safeSpeakOnMount,
    
    cancel,
    resetSpoken,
    isSpeaking,
    isLanguageSupported,
    getAvailableVoices,
    
    isAvailable: ttsService.isAvailable(),
    currentLanguage: language,
  };
}

export default useTextToSpeech;
