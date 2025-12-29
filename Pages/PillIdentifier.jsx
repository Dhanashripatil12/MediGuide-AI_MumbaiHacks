import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  Upload, 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Volume2,
  ArrowLeft,
  Calendar,
  Info,
  Clock,
  Activity,
  User as UserIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { speakInSelectedLanguage } from "@/components/LanguageSelector";
import { useLanguage } from "@/components/LanguageContext";
import { getTranslations } from "@/components/translations";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import ttsService from "@/services/textToSpeechService";

export default function PillIdentifier() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [user, setUser] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { language } = useLanguage();
  const t = getTranslations(language).pillIdentifier;
  const { speakOnMount } = useTextToSpeech();

  useEffect(() => {
    loadUser();
    // Automatically speak about pill identifier when page loads
    const pillIdText = 'Medicine Identifier page. Take a photo or upload an image of your medicine bottle. Our system will identify the medicine and show you detailed information including usage instructions, side effects, and expiry date.';
    ttsService.speak(pillIdText);
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("User not logged in:", error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      setError(t.cameraAccessDenied || "Camera access denied. Please check permissions or upload an image instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `medicine-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      stopCamera();
    }, 'image/jpeg', 0.8);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setResults(null);
      setError(null);
    } else {
      setError(t.selectValidImage || "Please select a valid image file");
    }
  };

  const analyzeMedicine = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const messages = {
        'en-IN': "Analyzing your medicine image using OCR. Please wait while I read the text on the packaging...",
        'hi-IN': "आपकी दवाई की छवि का विश्लेषण OCR का उपयोग करके कर रहा हूं। कृपया प्रतीक्षा करें...",
        'mr-IN': "तुमच्या औषधाच्या प्रतिमेचे OCR वापरून विश्लेषण करत आहे। कृपया प्रतीक्षा करा..."
      };
      speakInSelectedLanguage(messages[language] || messages['en-IN']);

      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });

      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Identify medicine from image using OCR text matching.
        
This system:
- Extracts text from medicine packaging using OCR
- Matches text with brand name and generic name database
- Only identifies based on readable text, NOT pill color or shape
- Returns full medicine information if confident`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            medicine_name: { type: "string" },
            brand_name: { type: "string" },
            dosage: { type: "string" },
            indications: { type: "array", items: { type: "string" } },
            common_side_effects: { type: "array", items: { type: "string" } },
            serious_side_effects: { type: "array", items: { type: "string" } },
            dosage_by_age: { type: "object" },
            when_to_use: { type: "object" },
            warnings: { type: "array", items: { type: "string" } },
            confidence_score: { type: "number" },
            ai_recommendation: { type: "string" }
          },
          required: ["medicine_name"]
        }
      });

      // Check if medicine identification failed
      if (analysisResult.error || !analysisResult.medicine_name) {
        const errorMsgs = {
          'en-IN': analysisResult.error || "Could not identify medicine. Please ensure text on the medicine strip or box is clearly visible.",
          'hi-IN': analysisResult.error || "दवाई की पहचान नहीं हो सकी। कृपया सुनिश्चित करें कि दवाई की पट्टी या डिब्बे पर पाठ स्पष्ट रूप से दिखाई दे रहा है।",
          'mr-IN': analysisResult.error || "औषधाची ओळख पटली नाही. कृपया सुनिश्चित करा की औषधाच्या पट्टी किंवा बॉक्सवरील मजकूर स्पष्टपणे दिसत आहे."
        };
        const errMsg = errorMsgs[language] || errorMsgs['en-IN'];
        setError(errMsg);
        speakInSelectedLanguage(errMsg);
        setIsProcessing(false);
        return;
      }

      const medicineData = {
        image_url: file_url,
        identified_medication: analysisResult.medicine_name || "Unknown Medicine",
        dosage: analysisResult.dosage,
        indications: analysisResult.indications || [],
        confidence_score: analysisResult.confidence_score || 0,
        brand_name: analysisResult.brand_name,
        when_to_use: analysisResult.when_to_use,
        dosage_by_age: analysisResult.dosage_by_age,
        common_side_effects: analysisResult.common_side_effects || [],
        serious_side_effects: analysisResult.serious_side_effects || [],
        warnings: analysisResult.warnings || [],
        ai_recommendation: analysisResult.ai_recommendation,
        identification_method: 'OCR-based text matching'
      };

      const savedRecord = await base44.entities.PillIdentification.create(medicineData);
      console.log("Medicine saved successfully:", savedRecord);
      setResults({...medicineData, id: savedRecord.id});
      setSaveSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => setSaveSuccess(false), 5000);
      
      // Voice output
      const speakMessages = {
        'en-IN': `Medicine identified: ${analysisResult.medicine_name}. Identified using OCR text matching from medicine packaging. ${analysisResult.brand_name ? `Brand: ${analysisResult.brand_name}.` : ''} This medicine is used for ${analysisResult.indications?.slice(0, 2).join(' and ')}. ${analysisResult.ai_recommendation ? `${analysisResult.ai_recommendation}.` : ''} Medicine saved to your profile.`,
        'hi-IN': `दवा की पहचान: ${analysisResult.medicine_name}। दवा पैकेजिंग से OCR पाठ मिलान का उपयोग करके पहचानी गई। ${analysisResult.brand_name ? `ब्रांड: ${analysisResult.brand_name}।` : ''} यह दवा ${analysisResult.indications?.slice(0, 2).join(' और ')} के लिए उपयोग की जाती है। दवा आपकी प्रोफाइल में सहेजी गई।`,
        'mr-IN': `औषध ओळखले: ${analysisResult.medicine_name}। औषध पॅकेजिंगपासून OCR मजकूर जुळवणी वापरून ओळखले गेले। ${analysisResult.brand_name ? `ब्रँड: ${analysisResult.brand_name}।` : ''} हे औषध ${analysisResult.indications?.slice(0, 2).join(' आणि ')} साठी वापरले जाते। औषध तुमच्या प्रोफाइलमध्ये जतन केले।`
      };
      speakInSelectedLanguage(speakMessages[language] || speakMessages['en-IN']);
      
    } catch (error) {
      console.error("Analysis error details:", error);
      const errorMessages = {
        'en-IN': `Error: ${error?.message || "Unable to analyze image. Please ensure the medicine strip or box text is clearly visible and try again."}`,
        'hi-IN': `त्रुटि: ${error?.message || "छवि का विश्लेषण करने में असमर्थ। कृपया सुनिश्चित करें कि दवा की पट्टी या बॉक्स का पाठ स्पष्ट रूप से दिखाई दे रहा है।"}`,
        'mr-IN': `त्रुटि: ${error?.message || "प्रतिमेचे विश्लेषण करू शकलो नाही. कृपया सुनिश्चित करा की औषधाच्या पट्टी किंवा बॉक्सवरील मजकूर स्पष्टपणे दिसत आहे."}`
      };
      const errorMsg = errorMessages[language] || errorMessages['en-IN'];
      setError(errorMsg);
      speakInSelectedLanguage(errorMsg);
    }
    
    setIsProcessing(false);
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setResults(null);
    setError(null);
    setSaveSuccess(false);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const speakResults = () => {
    if (!results) return;

    const translatedPhrases = {
      'en-IN': {
        intro: (medName) => `Complete information for ${medName}. `,
        brand: (brandName) => `Brand name: ${brandName}. `,
        usedFor: (indications) => `Used for: ${indications.join(', ')}. `,
        adultDose: (dose) => `Adult dosage: ${dose}. `,
        childDose: (dose) => `Children dosage: ${dose}. `,
        bestTaken: (timing) => `Best taken ${timing}. `,
        maxDailyDose: (dose) => `Maximum daily dose: ${dose}. `,
        commonSideEffects: (effects) => `Common side effects: ${effects.join(', ')}. `,
        seriousSideEffects: (effects) => `Serious side effects requiring medical attention: ${effects.join(', ')}. `,
        warnings: (warns) => `Important warnings: ${warns.join(', ')}. `
      },
      'hi-IN': {
        intro: (medName) => `${medName} के लिए पूरी जानकारी। `,
        brand: (brandName) => `ब्रांड का नाम: ${brandName}. `,
        usedFor: (indications) => `इसके लिए उपयोग: ${indications.join(', ')}. `,
        adultDose: (dose) => `वयस्क खुराक: ${dose}. `,
        childDose: (dose) => `बच्चों की खुराक: ${dose}. `,
        bestTaken: (timing) => `${timing} पर लेना सबसे अच्छा है। `,
        maxDailyDose: (dose) => `अधिकतम दैनिक खुराक: ${dose}. `,
        commonSideEffects: (effects) => `सामान्य दुष्प्रभाव: ${effects.join(', ')}. `,
        seriousSideEffects: (effects) => `गंभीर दुष्प्रभाव: ${effects.join(', ')}. `,
        warnings: (warns) => `महत्वपूर्ण चेतावनियां: ${warns.join(', ')}. `
      },
      'mr-IN': {
        intro: (medName) => `${medName} बद्दल संपूर्ण माहिती। `,
        brand: (brandName) => `ब्रँडचे नाव: ${brandName}। `,
        usedFor: (indications) => `यासाठी वापरले जाते: ${indications.join(', ')}। `,
        adultDose: (dose) => `प्रौढ डोस: ${dose}। `,
        childDose: (dose) => `मुलांचा डोस: ${dose}। `,
        bestTaken: (timing) => `${timing} ला घेणे सर्वोत्तम आहे। `,
        maxDailyDose: (dose) => `कमाल दैनिक डोस: ${dose}। `,
        commonSideEffects: (effects) => `सामान्य दुष्परिणाम: ${effects.join(', ')}। `,
        seriousSideEffects: (effects) => `गंभीर दुष्परिणाम: ${effects.join(', ')}। `,
        warnings: (warns) => `महत्त्वाच्या सूचना: ${warns.join(', ')}। `
      }
    };

    const currentLangPhrases = translatedPhrases[language] || translatedPhrases['en-IN'];
    let textToSpeak = currentLangPhrases.intro(results.identified_medication);

    if (results.brand_name) textToSpeak += currentLangPhrases.brand(results.brand_name);
    if (results.indications?.length > 0) textToSpeak += currentLangPhrases.usedFor(results.indications);
    if (results.dosage_by_age?.adults) textToSpeak += currentLangPhrases.adultDose(results.dosage_by_age.adults);
    if (results.dosage_by_age?.children_6_17) textToSpeak += currentLangPhrases.childDose(results.dosage_by_age.children_6_17);
    if (results.when_to_use?.timing) textToSpeak += currentLangPhrases.bestTaken(results.when_to_use.timing);
    if (results.when_to_use?.maximum_daily_dose) textToSpeak += currentLangPhrases.maxDailyDose(results.when_to_use.maximum_daily_dose);
    if (results.common_side_effects?.length > 0) textToSpeak += currentLangPhrases.commonSideEffects(results.common_side_effects);
    if (results.serious_side_effects?.length > 0) textToSpeak += currentLangPhrases.seriousSideEffects(results.serious_side_effects);
    if (results.warnings?.length > 0) textToSpeak += currentLangPhrases.warnings(results.warnings);
    
    speakInSelectedLanguage(textToSpeak);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{t.subtitle}</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!results ? (
          <div className="space-y-6">
            {/* Camera Section */}
            {showCamera && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    {t.cameraCapture}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-lg mx-auto rounded-lg bg-black"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex gap-3 mt-4 justify-center">
                    <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                      <Camera className="w-4 h-4 mr-2" />
                      {t.capturePhoto}
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      {t.stopCamera}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Section */}
            {!showCamera && (
              <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Pill className="w-6 h-6 text-blue-600" />
                    {t.uploadMedicine}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!selectedFile ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* File Upload */}
                      <div className="relative">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                          <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.uploadImage}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Choose an image of medicine strip or bottle
                          </p>
                        </div>
                      </div>

                      {/* Camera Capture */}
                      <div 
                        onClick={startCamera}
                        className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
                      >
                        <Camera className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.takePhoto}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Capture medicine strip or bottle with camera
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Selected File Preview */}
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                        <Pill className="w-8 h-8 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <img 
                          src={URL.createObjectURL(selectedFile)}
                          alt="Selected strip"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={analyzeMedicine}
                          disabled={isProcessing}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing Medicine...
                            </>
                            ) : (
                            <>
                              <Pill className="w-4 h-4 mr-2" />
                              Identify Medicine
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={resetAnalysis}
                          disabled={isProcessing}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Upload any medicine strip or bottle. Ensure the packaging and text are clearly visible for accurate identification.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Medicine Identified
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={speakResults}
                    className="flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Read Aloud
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Success Message */}
                {saveSuccess && (
                  <Alert className="bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-300">
                      ✓ Medicine successfully saved! You can view it in Settings → My Saved Medicines
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Quick Summary Card */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-green-300 dark:border-green-700">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Medicine Name */}
                      <div className="text-center md:text-left">
                        <p className="text-xs font-medium text-green-600 dark:text-green-300 uppercase tracking-wide mb-1">Medicine Name</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {results.identified_medication || "Unknown"}
                        </h3>
                        {results.brand_name && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Brand: {results.brand_name}</p>
                        )}
                        {results.medicine_type && (
                          <Badge className="mt-2 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">{results.medicine_type}</Badge>
                        )}
                      </div>
                      
                      {/* Common Side Effects */}
                      <div className="text-center md:text-left">
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-300 uppercase tracking-wide mb-1">Common Side Effects</p>
                        {results.common_side_effects?.length > 0 ? (
                          <ul className="text-sm text-gray-700 space-y-1">
                            {results.common_side_effects.slice(0, 3).map((effect, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                {effect}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No common side effects reported</p>
                        )}
                      </div>
                      
                      {/* Primary Uses */}
                      <div className="text-center md:text-left">
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Used For</p>
                        {results.indications?.length > 0 ? (
                          <ul className="text-sm text-gray-700 space-y-1">
                            {results.indications.slice(0, 3).map((use, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                {use}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">Usage information not available</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Recommendation Card */}
                {results.ai_recommendation && (
                  <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Info className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-purple-900 dark:text-purple-200 mb-1">AI Summary</p>
                          <p className="text-gray-700">{results.ai_recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Main Results */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {results.dosage && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          {results.dosage}
                        </Badge>
                      )}
                      {results.expiry_date && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Exp: {results.expiry_date}
                        </Badge>
                      )}
                      {results.confidence_score && (
                        <Badge 
                          variant={results.confidence_score >= 0.8 ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" />
                          {Math.round(results.confidence_score * 100)}% confident
                        </Badge>
                      )}
                    </div>

                    {results.manufacturer && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Manufacturer:</strong> {results.manufacturer}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <img 
                      src={results.image_url}
                      alt="Analyzed medicine"
                      className="max-w-full max-h-48 object-contain rounded-lg shadow-md"
                    />
                  </div>
                  {user && (
                    <div className="text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        ✓ Saved to your profile
                      </Badge>
                    </div>
                  )}
                </div>

                {/* What It's Used For */}
                {results.indications && results.indications.length > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        What It's Used For
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                        {results.indications.map((indication, index) => (
                          <li key={index}>{indication}</li>
                        ))}
                      </ul>
                      {results.description && (
                        <p className="mt-3 text-sm text-blue-700 dark:text-blue-300 italic">
                          <strong>How it works:</strong> {results.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Common Questions & Answers */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-indigo-900 dark:text-white mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Common Questions & Answers
                    </h4>
                    <div className="space-y-4">
                      {/* Question 1: How often should I take this medicine? */}
                      {results.when_to_use?.frequency && (
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="font-semibold text-indigo-900 dark:text-white mb-2">❓ How often should I take this medicine?</p>
                          <p className="text-gray-700">✅ {results.when_to_use.frequency}</p>
                        </div>
                      )}

                      {/* Question 2: What is the right dose for my age? */}
                      {results.dosage_by_age && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900">
                          <p className="font-semibold text-indigo-900 dark:text-white mb-3">❓ What is the right dose for my age?</p>
                          <div className="space-y-2">
                            {results.dosage_by_age.adults && (
                              <div className="pl-4 border-l-2 border-purple-300 dark:border-purple-600">
                                <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Adults (18+ years)</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">✅ {results.dosage_by_age.adults}</p>
                              </div>
                            )}
                            {results.dosage_by_age.children_6_17 && (
                              <div className="pl-4 border-l-2 border-blue-300 dark:border-blue-600">
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Children (6-17 years)</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">✅ {results.dosage_by_age.children_6_17}</p>
                              </div>
                            )}
                            {results.dosage_by_age.children_2_5 && (
                              <div className="pl-4 border-l-2 border-green-300 dark:border-green-600">
                                <p className="text-xs font-medium text-green-700 dark:text-green-300">Young Children (2-5 years)</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">✅ {results.dosage_by_age.children_2_5}</p>
                              </div>
                            )}
                            {results.dosage_by_age.infants && (
                              <div className="pl-4 border-l-2 border-orange-300 dark:border-orange-600">
                                <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Infants (Under 2 years)</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">✅ {results.dosage_by_age.infants}</p>
                              </div>
                            )}
                            {results.dosage_by_age.elderly && (
                              <div className="pl-4 border-l-2 border-amber-300 dark:border-amber-600">
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Elderly (65+ years)</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">✅ {results.dosage_by_age.elderly}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Question 3: When should I take it? */}
                      {results.when_to_use?.timing && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900">
                          <p className="font-semibold text-indigo-900 dark:text-white mb-2">❓ When should I take it?</p>
                          <p className="text-gray-700 dark:text-gray-300">✅ {results.when_to_use.timing}</p>
                        </div>
                      )}

                      {/* Question 4: Can I take it with food? */}
                      {results.when_to_use?.with_food && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900">
                          <p className="font-semibold text-indigo-900 dark:text-white mb-2">❓ Can I take it with food?</p>
                          <p className="text-gray-700 dark:text-gray-300">✅ {results.when_to_use.with_food}</p>
                        </div>
                      )}

                      {/* Question 5: What is the maximum daily dose? */}
                      {results.when_to_use?.maximum_daily_dose && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900">
                          <p className="font-semibold text-indigo-900 dark:text-white mb-2">❓ What is the maximum daily dose?</p>
                          <p className="text-gray-700 dark:text-gray-300 font-medium">⚠️ {results.when_to_use.maximum_daily_dose}</p>
                        </div>
                      )}

                      {/* Question 6: How long should I use it? */}
                      {results.when_to_use?.duration && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900">
                          <p className="font-semibold text-indigo-900 dark:text-white mb-2">❓ How long should I use it?</p>
                          <p className="text-gray-700 dark:text-gray-300">✅ {results.when_to_use.duration}</p>
                        </div>
                      )}

                      {/* Question 7: What if I miss a dose? */}
                      {results.missed_dose_instructions && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900">
                          <p className="font-semibold text-indigo-900 dark:text-white mb-2">❓ What if I miss a dose?</p>
                          <p className="text-gray-700 dark:text-gray-300">✅ {results.missed_dose_instructions}</p>
                        </div>
                      )}

                      {/* Question 8: Any special instructions? */}
                      {results.when_to_use?.special_instructions && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900">
                          <p className="font-semibold text-indigo-900 dark:text-white mb-2">❓ Any special instructions?</p>
                          <p className="text-gray-700 dark:text-gray-300">💡 {results.when_to_use.special_instructions}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Dosage by Age */}
                {results.dosage_by_age && (
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Age-Specific Dosage Guidelines
                      </h4>
                      <div className="space-y-3 text-purple-800">
                        {results.dosage_by_age.adults && (
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-sm font-semibold text-purple-900">Adults (18+ years):</p>
                            <p className="text-sm mt-1">{results.dosage_by_age.adults}</p>
                          </div>
                        )}
                        {results.dosage_by_age.children_6_17 && (
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-sm font-semibold text-purple-900">Children (6-17 years):</p>
                            <p className="text-sm mt-1">{results.dosage_by_age.children_6_17}</p>
                          </div>
                        )}
                        {results.dosage_by_age.children_2_5 && (
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-sm font-semibold text-purple-900">Young Children (2-5 years):</p>
                            <p className="text-sm mt-1">{results.dosage_by_age.children_2_5}</p>
                          </div>
                        )}
                        {results.dosage_by_age.infants && (
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-sm font-semibold text-purple-900">Infants (Under 2 years):</p>
                            <p className="text-sm mt-1">{results.dosage_by_age.infants}</p>
                          </div>
                        )}
                        {results.dosage_by_age.elderly && (
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-sm font-semibold text-purple-900">Elderly (65+ years):</p>
                            <p className="text-sm mt-1">{results.dosage_by_age.elderly}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}



                {/* Side Effects */}
                {(results.common_side_effects?.length > 0 || results.serious_side_effects?.length > 0) && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Side Effects
                      </h4>
                      
                      {results.common_side_effects?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-amber-900 mb-2">Common Side Effects:</p>
                          <div className="flex flex-wrap gap-2">
                            {results.common_side_effects.map((effect, index) => (
                              <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                                {effect}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {results.serious_side_effects?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-900 mb-2">Serious Side Effects (Seek Medical Attention):</p>
                          <div className="flex flex-wrap gap-2">
                            {results.serious_side_effects.map((effect, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {effect}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Warnings & Contraindications */}
                {(results.warnings?.length > 0 || results.contraindications?.length > 0) && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {results.warnings?.length > 0 && (
                        <div className="mb-3">
                          <strong>Warnings:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {results.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {results.contraindications?.length > 0 && (
                        <div>
                          <strong>Do NOT use if:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {results.contraindications.map((contra, index) => (
                              <li key={index}>{contra}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Drug Interactions */}
                {results.drug_interactions && results.drug_interactions.length > 0 && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Drug Interactions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
                        {results.drug_interactions.map((interaction, index) => (
                          <li key={index}>{interaction}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Storage */}
                {results.storage && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <strong>Storage:</strong> {results.storage}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={resetAnalysis}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Identify Another Medicine
                  </Button>
                  {user && (
                    <Link to={createPageUrl("Settings")}>
                      <Button variant="outline" className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        View My Saved Medicines
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800">
                      <strong>Medical Disclaimer:</strong> This AI identification is for informational purposes only. 
                      Always verify medication details with a healthcare professional or pharmacist before use. 
                      Never rely solely on this information for medical decisions. Consult your doctor if you experience any side effects.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}