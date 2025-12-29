/**
 * Cloud-based Text-to-Speech Service
 * Uses cloud APIs for Indian languages (Hindi, Marathi)
 * Supports Google Cloud TTS and Azure Speech Services
 * 
 * Configuration:
 * - Set VITE_CLOUD_TTS_ENDPOINT in .env (Vite uses import.meta.env)
 * - Set API endpoint for your backend that proxies the cloud service
 * - Ensure backend handles authentication securely
 */

import { isAudioUnlocked } from '@/utils/audioUnlock';

const CLOUD_TTS_CONFIG = {
  provider: 'google', // 'google' or 'azure'
  apiEndpoint: import.meta.env.VITE_CLOUD_TTS_ENDPOINT || 'http://localhost:3001/api/tts',
  timeout: 10000, // 10 seconds timeout for API calls
  supportedLanguages: ['hi-IN', 'mr-IN', 'hi', 'mr'],
  audioFormat: 'mp3',
  audioEncoding: 'MP3',
  pitch: 0,
  speakingRate: 1.0
};

class CloudTTSService {
  constructor() {
    this.isSupported = true;
    this.isSpeaking = false;
    this.currentAudio = null;
    this.audioQueue = [];
    this.isProcessing = false;
    this.endpointAvailable = null; // null = unknown, true = available, false = not available
    this.endpointCheckTime = 0; // Time of last endpoint check
    this.endpointCheckInterval = 60000; // Re-check endpoint every 60 seconds
  }

  /**
   * Check if cloud TTS endpoint is available
   * Caches result to avoid excessive requests
   */
  async isEndpointAvailable() {
    const now = Date.now();
    
    // Return cached result if recently checked
    if (this.endpointAvailable !== null && (now - this.endpointCheckTime) < this.endpointCheckInterval) {
      return this.endpointAvailable;
    }

    try {
      const response = await fetch(CLOUD_TTS_CONFIG.apiEndpoint, {
        method: 'HEAD',
        timeout: 2000
      });
      
      this.endpointAvailable = response.ok || response.status !== 404;
      this.endpointCheckTime = now;
      
      if (!this.endpointAvailable) {
        console.warn(`⚠️ Cloud TTS endpoint not available. Install backend from CLOUD_TTS_SETUP.md`);
      }
      
      return this.endpointAvailable;
    } catch (error) {
      this.endpointAvailable = false;
      this.endpointCheckTime = now;
      console.warn(`⚠️ Cloud TTS endpoint unreachable: ${error.message}. Will use browser TTS instead.`);
      return false;
    }
  }

  /**
   * Check if a language is supported by cloud TTS
   */
  isLanguageSupported(lang) {
    return CLOUD_TTS_CONFIG.supportedLanguages.some(supported => 
      lang.toLowerCase().startsWith(supported.split('-')[0])
    );
  }

  /**
   * Get normalized language code for cloud TTS
   */
  getNormalizedLanguage(lang) {
    const langMap = {
      'hi': 'hi-IN',
      'hi-IN': 'hi-IN',
      'mr': 'mr-IN',
      'mr-IN': 'mr-IN'
    };
    return langMap[lang] || 'hi-IN';
  }

  /**
   * Get voice name based on language and provider
   */
  getVoiceForLanguage(lang) {
    const normalized = this.getNormalizedLanguage(lang);
    
    if (CLOUD_TTS_CONFIG.provider === 'google') {
      const voiceMap = {
        'hi-IN': 'hi-IN-Neural2-A', // or 'hi-IN-Standard-B'
        'mr-IN': 'mr-IN-Standard-A'
      };
      return voiceMap[normalized] || 'hi-IN-Neural2-A';
    } else if (CLOUD_TTS_CONFIG.provider === 'azure') {
      const voiceMap = {
        'hi-IN': 'hi-IN-AmolNeural', // or 'hi-IN-SwaraNeural'
        'mr-IN': 'mr-IN-AarohNeural'
      };
      return voiceMap[normalized] || 'hi-IN-AmolNeural';
    }
    
    return 'default';
  }

  /**
   * Fetch audio from cloud TTS API
   * @param {string} text - Text to synthesize
   * @param {string} language - Language code (e.g., 'hi-IN', 'mr-IN')
   * @returns {Promise<Blob>} - Audio blob
   */
  async fetchAudioFromCloud(text, language) {
    if (!text || text.trim() === '') {
      return null;
    }

    try {
      const response = await fetch(CLOUD_TTS_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          language: this.getNormalizedLanguage(language),
          voice: this.getVoiceForLanguage(language),
          provider: CLOUD_TTS_CONFIG.provider,
          audioFormat: CLOUD_TTS_CONFIG.audioFormat,
          pitch: CLOUD_TTS_CONFIG.pitch,
          speakingRate: CLOUD_TTS_CONFIG.speakingRate
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Cloud TTS API error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const audioBlob = await response.blob();
      
      if (audioBlob.size === 0) {
        throw new Error('Cloud TTS returned empty audio blob');
      }

      console.log(`☁️ Cloud TTS: Fetched ${audioBlob.size} bytes of ${CLOUD_TTS_CONFIG.audioFormat} audio for ${language}`);
      return audioBlob;
    } catch (error) {
      console.error(`☁️ Cloud TTS Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create audio URL from blob (for playback)
   */
  createAudioUrl(audioBlob) {
    return URL.createObjectURL(audioBlob);
  }

  /**
   * Clean up audio URL to prevent memory leaks
   */
  revokeAudioUrl(audioUrl) {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }

  /**
   * Play audio blob
   * @param {Blob} audioBlob - Audio data to play
   * @param {object} options - Playback options
   * @returns {Promise} - Resolves when audio finishes playing
   */
  playAudio(audioBlob, options = {}) {
    return new Promise((resolve, reject) => {
      if (!audioBlob) {
        resolve();
        return;
      }

      // Stop current audio if playing
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.revokeAudioUrl(this.currentAudio.src);
      }

      const audioUrl = this.createAudioUrl(audioBlob);
      const audio = new Audio();
      audio.src = audioUrl;
      audio.volume = options.volume || 1.0;

      this.currentAudio = audio;
      this.isSpeaking = true;

      const onAudioEnd = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        this.revokeAudioUrl(audioUrl);
        cleanup();
        if (options.onEnd) options.onEnd();
        resolve();
      };

      const onAudioError = (error) => {
        this.isSpeaking = false;
        this.currentAudio = null;
        this.revokeAudioUrl(audioUrl);
        cleanup();
        
        console.error('☁️ Audio playback error:', error);
        if (options.onError) options.onError(error);
        reject(error);
      };

      const cleanup = () => {
        audio.removeEventListener('ended', onAudioEnd);
        audio.removeEventListener('error', onAudioError);
      };

      audio.addEventListener('ended', onAudioEnd);
      audio.addEventListener('error', onAudioError);

      if (options.onStart) options.onStart();

      const playAudio = () => {
        // Check if audio is unlocked before attempting to play
        if (!isAudioUnlocked()) {
          console.warn('⚠️ Cloud TTS: Audio not unlocked. User must interact with page first.');
          reject(new Error('Audio not unlocked'));
          return;
        }

        try {
          audio.play().catch(error => {
            console.error('☁️ Failed to play audio:', error);
            onAudioError(error);
          });
        } catch (error) {
          onAudioError(error);
        }
      };

      // Always try to play if audio is unlocked
      if (isAudioUnlocked()) {
        playAudio();
      } else {
        console.log('⏳ Audio not unlocked yet - waiting for user interaction (click the page)');
        this.audioQueue.push({ play: playAudio });
        reject(new Error('Audio not unlocked. Please interact with the page first.'));
      }
    });
  }

  /**
   * Speak text using cloud TTS with audio playback
   * @param {string} text - Text to speak
   * @param {object} options - Options including language, callbacks
   * @returns {Promise<object>} - { success: bool, fallbackNeeded: bool }
   */
  async speak(text, options = {}) {
    const language = options.language || 'hi-IN';

    // Verify language is supported
    if (!this.isLanguageSupported(language)) {
      console.warn(`☁️ Cloud TTS: Language ${language} not supported. Use 'hi-IN' or 'mr-IN'.`);
      return { success: false, fallbackNeeded: true };
    }

    if (!text || text.trim() === '') {
      return { success: true, fallbackNeeded: false };
    }

    try {
      if (options.onStart) options.onStart();

      // Check if endpoint is available
      const endpointAvailable = await this.isEndpointAvailable();
      if (!endpointAvailable) {
        if (options.onEnd) options.onEnd();
        return { success: false, fallbackNeeded: true };
      }

      // Fetch audio from cloud
      const audioBlob = await this.fetchAudioFromCloud(text, language);
      
      if (!audioBlob) {
        if (options.onEnd) options.onEnd();
        return { success: false, fallbackNeeded: true };
      }

      // Play the audio
      await this.playAudio(audioBlob, {
        volume: options.volume || 1.0,
        onStart: options.onAudioStart,
        onEnd: options.onEnd,
        onError: options.onError
      });

      return { success: true, fallbackNeeded: false };

    } catch (error) {
      console.warn(`☁️ Cloud TTS fallback: ${error.message}`);
      if (options.onEnd) options.onEnd();
      return { success: false, fallbackNeeded: true };
    }
  }

  /**
   * Speak multiple texts sequentially
   * @param {array} texts - Array of text to speak
   * @param {object} options - Options
   * @returns {Promise} - Resolves when all complete
   */
  async speakSequence(texts, options = {}) {
    for (const text of texts) {
      if (text && text.trim()) {
        await this.speak(text, options);
        // Small delay between sequential items
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }

  /**
   * Cancel current playback
   */
  cancel() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.revokeAudioUrl(this.currentAudio.src);
      this.currentAudio = null;
    }
    this.isSpeaking = false;
    this.audioQueue = [];
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  /**
   * Resume playback
   */
  resume() {
    if (this.currentAudio) {
      this.currentAudio.play().catch(error => {
        console.warn('☁️ Failed to resume audio:', error);
      });
    }
  }

  /**
   * Get speaking status
   */
  getSpeakingStatus() {
    return this.isSpeaking;
  }

  /**
   * Clean text for better TTS
   */
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/[→←↑↓]/g, '') // Remove arrows
      .replace(/\s+/g, ' ') // Remove extra spaces
      .replace(/\{count\}/g, 'count') // Replace placeholders
      .trim();
  }

  /**
   * Speak page heading
   */
  async speakHeading(heading, language = 'hi-IN') {
    const cleanHeading = this.cleanText(heading);
    return this.speak(cleanHeading, {
      language,
      volume: 0.9
    });
  }

  /**
   * Speak description/instructions
   */
  async speakDescription(description, language = 'hi-IN') {
    const cleanDesc = this.cleanText(description);
    return this.speak(cleanDesc, {
      language,
      volume: 1.0
    });
  }

  /**
   * Speak action/button text
   */
  async speakAction(action, language = 'hi-IN') {
    const cleanAction = this.cleanText(action);
    return this.speak(cleanAction, {
      language,
      volume: 0.95
    });
  }

  /**
   * Get API configuration (for debugging)
   */
  getConfig() {
    return {
      ...CLOUD_TTS_CONFIG,
      isSupported: this.isSupported,
      currentAudioUrl: this.currentAudio?.src || null
    };
  }
}

// Create singleton instance
const cloudTTSService = new CloudTTSService();

export default cloudTTSService;
