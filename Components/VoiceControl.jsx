import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2 } from "lucide-react";

export default function VoiceControl({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  useEffect(() => {
    setVoiceSupported(
      'webkitSpeechRecognition' in window || 
      'SpeechRecognition' in window ||
      'speechSynthesis' in window
    );
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (!voiceSupported) {
      speak("Voice control is not supported on this device");
      return;
    }
    
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsListening(true);
      speak("Listening for your command");
    };
    
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      setLastCommand(command);
      speak(`You said: ${command}`);
      
      if (onCommand) {
        onCommand(command);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      speak("Sorry, I couldn't understand that. Please try again.");
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  if (!voiceSupported) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-100 to-emerald-100 border-none shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Volume2 className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Voice Control</h3>
            <p className="text-sm text-gray-600">
              {isListening ? "Listening for commands..." : "Click to give voice commands"}
            </p>
            {lastCommand && (
              <p className="text-xs text-blue-600 mt-1">Last: "{lastCommand}"</p>
            )}
          </div>
        </div>
        <Button
          onClick={startListening}
          disabled={isListening}
          className={`${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white rounded-full w-12 h-12`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Try saying: "Identify pill", "Find doctor", "Emergency mode", or "Settings"
      </div>
    </Card>
  );
}