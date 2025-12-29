import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Pill,
  Stethoscope,
  AlertTriangle,
  Activity,
  Clock,
  Shield,
  Mic,
  Camera,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillIdentification, EmergencyContact, MedicalProfile, User } from "@/entities/all";
import { speakInSelectedLanguage } from "@/components/LanguageSelector";
import { useLanguage } from "@/components/LanguageContext";
import { getTranslations } from "@/components/translations";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import EnableHindiVoiceButton from "@/components/EnableHindiVoiceButton";
import ttsService from "@/services/textToSpeechService";

export default function Dashboard() {
  const [recentScans, setRecentScans] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [user, setUser] = useState(null);
  
  const { language } = useLanguage();
  const t = getTranslations(language).dashboard;
  const { speakOnMount } = useTextToSpeech();

  useEffect(() => {
    document.title = "MediGuide AI - Dashboard";
    loadDashboardData();
    
    // Automatically speak about dashboard when page loads
    const dashboardText = 'Welcome to MediGuide Dashboard. This is your central hub for managing your health. Use the Medicine Identifier to scan and identify medicines, search for doctors nearby, manage emergency contacts, and view your health statistics.';
    ttsService.speak(dashboardText);
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const pillScans = await PillIdentification.list("-created_date", 3);
      setRecentScans(pillScans);

      const contacts = await EmergencyContact.list();
      setEmergencyContacts(contacts);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const speakWelcome = () => {
    if ('speechSynthesis' in window) {
      const messages = {
        'en-IN': "Welcome to MediGuide AI. Your smart healthcare assistant for medicine identification and doctor search.",
        'hi-IN': "मेडीगाइड एआई में आपका स्वागत है। दवा पहचान और डॉक्टर खोज के लिए आपका स्मार्ट स्वास्थ्य सहायक।",
        'mr-IN': "मेडीगाइड एआय मध्ये आपले स्वागत आहे. औषध ओळख आणि डॉक्टर शोध करण्यासाठी तुमचा स्मार्ट आरोग्य सहाय्यक."
      };
      // Ensure that a fallback is always present if a specific language isn't defined
      speakInSelectedLanguage(messages[language] || messages['en-IN']);
    }
  };

  return (
    <div className="w-full p-4 md:p-8 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg">
                  <Activity className="w-12 h-12 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                  <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">{t.title}</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mt-4">
                  {t.subtitle}
                </p>
                <div className="mt-6">
                  <EnableHindiVoiceButton />
                </div>
              </div>
            </div>

        {/* Main Features */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Medicine Identifier */}
          <Link to={createPageUrl("PillIdentifier")} className="group">
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-gray-700 dark:group-hover:to-gray-600 h-full">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Pill className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{t.medicineIdentifier}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                  {t.medicineIdentifierDesc}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {t.ocrPowered}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    {t.voiceOutput}
                  </Badge>
                  <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    {t.expiryDetection}
                  </Badge>
                </div>
                <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.recentScans}: {recentScans.length}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300\">{t.tryItNow}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Doctor Finder */}
          <Link to={createPageUrl("DoctorSearch")} className="group">
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 group-hover:from-purple-100 group-hover:to-indigo-200 dark:group-hover:from-gray-700 dark:group-hover:to-gray-600 h-full">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Stethoscope className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{t.findDoctors}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                  {t.doctorFinderDesc}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    {t.smartMatching}
                  </Badge>
                  <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    {t.voiceSearch}
                  </Badge>
                  <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    {t.cityFilter}
                  </Badge>
                </div>
                <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.availableCities}: 5+</span>
                    <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300">{t.findDoctors}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Pill className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{recentScans.length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.medicinesIdentified}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">10+</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.availableDoctors}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{emergencyContacts.length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.emergencyContacts}</p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Access */}
        <Card className="border-red-200 dark:border-red-900 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{t.emergencyMode}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.emergencyModeDesc}</p>
                </div>
              </div>
              <Link to={createPageUrl("Emergency")}>
                <Button className="bg-red-600 hover:bg-red-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t.emergency}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {recentScans.length > 0 && (
          <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                {t.recentMedicineScans}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center gap-4 p-3 rounded-lg bg-blue-50">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Pill className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">
                        {scan.identified_medication || t.medicineIdentified}
                      </h4>
                      <p className="text-sm text-black">
                        {scan.dosage && `${scan.dosage} • `}
                        {new Date(scan.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Highlights */}
        <div className="text-center space-y-4 bg-white dark:bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.whyChoose}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Camera className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.ocrTechnology}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t.ocrTechnologyDesc}</p>
            </div>
            <div className="space-y-2">
              <Search className="w-8 h-8 text-purple-600 mx-auto" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.smartMatchingTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t.smartMatchingDesc}</p>
            </div>
            <div className="space-y-2">
              <Mic className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.voiceEnabled}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t.voiceEnabledDesc}</p>
            </div>
            <div className="space-y-2">
              <Shield className="w-8 h-8 text-red-600 mx-auto" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.emergencyReady}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t.emergencyReadyDesc}</p>
            </div>
          </div>
        </div>
        </div>
        </div>
        );
        }