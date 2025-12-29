import ttsService from '@/services/textToSpeechService';

export default function EnableHindiVoiceButton() {
  const handleClick = () => {
    // Speak Hindi description of the app when clicked
    const hindiPhoneticText = 'Namaste! Medi Guide mein aapka swaagat hai. Yeh application aapki davaai ki pehchan mein madad karta hai. Aap apne swasthya ko behtar tareeke se prabhandhit kar sakte hain. Doctor search karein, emergency contacts save karein, aur apne health stats track karein.';
    ttsService.speak(hindiPhoneticText);
  };

  return (
    <button
      onClick={handleClick}
      className='px-4 py-2 rounded-lg font-medium transition-all bg-blue-500 hover:bg-blue-600 text-white'
    >
      🎤 Hindi Description
    </button>
  );
}
