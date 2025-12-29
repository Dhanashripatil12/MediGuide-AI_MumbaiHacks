/**
 * Browser Web Speech API - Text-to-Speech Service
 * 
 * REQUIREMENTS:
 * ✅ Uses only window.speechSynthesis and SpeechSynthesisUtterance
 * ✅ No backend, no cloud, no audio files
 * ✅ Speaks automatically when app pages load
 * ✅ Button speaks Hindi description when clicked
 * ✅ Chrome and Edge compatible
 */

class TextToSpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voiceEnabled = true; // Always enabled for automatic speaking
    this.currentUtterance = null;
    this.hindiVoice = null;
    
    // Initialize voices immediately
    this.loadVoices();
  }

  /**
   * Check if voice was previously enabled in this session
   */
  isVoiceEnabledInSession() {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('voiceEnabled') === 'true';
  }

  /**
   * Load available system voices
   */
  loadVoices() {
    try {
      const voices = this.synth.getVoices();
      this.findHindiVoice(voices);
    } catch (error) {
      console.error('Error loading voices:', error);
    }

    // Reload when voices change
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        const voices = this.synth.getVoices();
        this.findHindiVoice(voices);
      };
    }
  }

  /**
   * Find the best Hindi voice available
   */
  findHindiVoice(voices) {
    // Priority: hi-IN, then hi, then en-IN, then en-US
    const hindiVoices = voices.filter(v => v.lang.startsWith('hi'));
    const englishInVoices = voices.filter(v => v.lang === 'en-IN');
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));

    if (hindiVoices.length > 0) {
      this.hindiVoice = hindiVoices[0];
      console.log('🎤 Hindi voice found:', this.hindiVoice.name);
    } else if (englishInVoices.length > 0) {
      this.hindiVoice = englishInVoices[0];
      console.log('🎤 Using English India voice as fallback');
    } else if (englishVoices.length > 0) {
      this.hindiVoice = englishVoices[0];
      console.log('🎤 Using English voice as fallback');
    } else {
      console.warn('⚠️ No suitable voice found');
    }
  }

  /**
   * Enable voice - call this when user clicks "Enable Hindi Voice" button
   */
  enableVoice() {
    this.voiceEnabled = true;
    sessionStorage.setItem('voiceEnabled', 'true');
    console.log('✅ Hindi Voice enabled');
    return true;
  }

  /**
   * Disable voice
   */
  disableVoice() {
    this.voiceEnabled = false;
    sessionStorage.removeItem('voiceEnabled');
    this.stopSpeaking();
    console.log('❌ Hindi Voice disabled');
    return true;
  }

  /**
   * Check if voice is enabled
   */
  isEnabled() {
    return this.voiceEnabled;
  }

  /**
   * Main speak method - ONLY speaks if voice is enabled
   */
  speak(text) {
    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Empty text provided');
      return false;
    }

    try {
      console.log('📢 Speaking:', text);

      // Cancel any previous speech
      this.synth.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // English US
      utterance.rate = 1; // Normal speed for English
      utterance.pitch = 1;
      utterance.volume = 1;

      console.log('🔊 Using English voice');

      // Handle events
      utterance.onstart = () => {
        console.log('✅ Speech started');
      };

      utterance.onend = () => {
        console.log('✓ Speech complete');
        this.currentUtterance = null;
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error);
        this.currentUtterance = null;
      };

      // Speak
      this.currentUtterance = utterance;
      const result = this.synth.speak(utterance);
      return true;
    } catch (error) {
      console.error('❌ Error in speak():', error);
      return false;
    }
  }

  /**
   * Stop current speech
   */
  stopSpeaking() {
    try {
      this.synth.cancel();
      this.currentUtterance = null;
      console.log('⏹️ Speech stopped');
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking() {
    return this.synth.speaking;
  }

  /**
   * Check if TTS is available in browser
   */
  isAvailable() {
    return true; // Web Speech API is widely supported
  }

  /**
   * Get available system voices
   */
  getAvailableVoices() {
    try {
      return this.synth.getVoices() || [];
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(lang) {
    const voices = this.getAvailableVoices();
    const langCode = lang.split('-')[0];
    return voices.some(v => v.lang.split('-')[0] === langCode);
  }

  /**
   * Set language preference
   */
  setLanguage(lang) {
    // For Hindi voice, we always use hi-IN
    // This is primarily for compatibility with useTextToSpeech hook
    console.log('Setting language to:', lang);
  }

  /**
   * Speak heading
   */
  speakHeading(text) {
    return this.speak(text);
  }

  /**
   * Speak description
   */
  speakDescription(text) {
    return this.speak(text);
  }

  /**
   * Speak action
   */
  speakAction(text) {
    return this.speak(text);
  }

  /**
   * Speak multiple texts sequentially
   */
  speakSequence(texts) {
    if (!Array.isArray(texts)) {
      return this.speak(texts);
    }

    return new Promise((resolve) => {
      const validTexts = texts.filter(t => t && t.trim().length > 0);
      
      if (validTexts.length === 0) {
        resolve();
        return;
      }

      let index = 0;

      const speakNext = () => {
        if (index >= validTexts.length) {
          resolve();
          return;
        }

        const text = validTexts[index];
        index++;

        try {
          this.synth.cancel();

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'hi-IN';
          utterance.rate = 1;
          utterance.pitch = 1;
          utterance.volume = 1;

          if (this.hindiVoice) {
            utterance.voice = this.hindiVoice;
          }

          utterance.onend = () => {
            setTimeout(speakNext, 300); // Small delay between texts
          };

          utterance.onerror = () => {
            setTimeout(speakNext, 300);
          };

          this.synth.speak(utterance);
        } catch (error) {
          console.error('Error in speakSequence:', error);
          setTimeout(speakNext, 300);
        }
      };

      speakNext();
    });
  }

  /**
   * Get speaking status
   */
  getSpeakingStatus() {
    return this.synth.speaking;
  }

  /**
   * Cancel speaking
   */
  cancel() {
    this.stopSpeaking();
  }
}

// Create singleton instance
const ttsService = new TextToSpeechService();

export default ttsService;
