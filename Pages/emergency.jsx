import React, { useState, useEffect } from "react";
import { EmergencyContact, MedicalProfile, User, Doctor } from "@/entities/all";
import { SendEmail } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Phone, 
  Heart, 
  Volume2,
  Shield,
  ArrowLeft,
  Clock,
  MapPin,
  User as UserIcon,
  Stethoscope,
  Activity,
  Brain,
  Droplet,
  Thermometer,
  Navigation, // New import for location icon
  Copy, // New import for copy icon
  Pill // Import for medication icon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { speakInSelectedLanguage } from "@/components/LanguageSelector";
import { useLanguage } from "@/components/LanguageContext";
import { getTranslations } from "@/components/translations";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"; // New imports for Leaflet map
import "leaflet/dist/leaflet.css"; // New import for Leaflet CSS
import useTextToSpeech from "@/hooks/useTextToSpeech";
import ttsService from "@/services/textToSpeechService";

// Fix Leaflet default marker icon issue
// This is a common workaround for leaflet's default icons not showing up in react-leaflet
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to recenter map when location changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15); // Set view to new center with zoom level 15
    }
  }, [center, map]);
  return null;
}

// Emergency categories with symptoms - will be populated with translations
const getEmergencyCategories = (t) => [
  {
    title: t.heartEmergency,
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-50",
    symptoms: ["chest pain", "heart attack", "heart palpitations", "irregular heartbeat"],
    specialization: t.cardiology,
    urgency: t.critical
  },
  {
    title: t.brainEmergency,
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    symptoms: ["stroke", "severe headache", "seizure", "loss of consciousness"],
    specialization: t.neurology,
    urgency: t.critical
  },
  {
    title: t.breathingEmergency,
    icon: Activity,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    symptoms: ["breathing difficulty", "asthma attack", "choking", "shortness of breath"],
    specialization: t.pulmonology,
    urgency: t.critical
  },
  {
    title: t.severeInjury,
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    symptoms: ["severe injury", "broken bone", "severe bleeding", "trauma"],
    specialization: t.orthopedics,
    urgency: t.high
  },
  {
    title: t.fever,
    icon: Thermometer,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    symptoms: ["high fever", "fever with rash", "dehydration", "severe infection"],
    specialization: t.internalMedicine,
    urgency: t.high
  },
  {
    title: t.allergicReaction,
    icon: Droplet,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    symptoms: ["anaphylaxis", "severe allergy", "swelling", "difficulty breathing"],
    specialization: t.internalMedicine,
    urgency: t.critical
  }
];

export default function Emergency() {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [medicalProfile, setMedicalProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isActivated, setIsActivated] = useState(false);
  const [isSendingAlerts, setIsSendingAlerts] = useState(false);
  const [emergencyDoctors, setEmergencyDoctors] = useState({});
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null); // New state for current location
  const [locationError, setLocationError] = useState(null); // New state for location error
  const [isLoadingLocation, setIsLoadingLocation] = useState(true); // New state for loading location
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true); // New state for loading doctors
  
  const { language } = useLanguage();
  const t = getTranslations(language).emergency;
  const emergencyCategories = getEmergencyCategories(t);
  const { speakOnMount } = useTextToSpeech();

  useEffect(() => {
    loadEmergencyData();
    getCurrentLocation(); // Call getCurrentLocation on mount
    
    // Automatically speak about emergency page when page loads
    const emergencyText = 'Emergency page. This is your emergency hub. Save your emergency contacts, view nearby emergency doctors, and get quick access to critical health information and emergency services.';
    ttsService.speak(emergencyText);
  }, []);

  const loadEmergencyData = async () => {
    setIsLoadingDoctors(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const contacts = await EmergencyContact.list();
      setEmergencyContacts(contacts);
      
      const profiles = await MedicalProfile.list();
      if (profiles.length > 0) {
        setMedicalProfile(profiles[0]);
      }

      // Load doctors for each emergency category
      const allDoctors = await Doctor.list('', 100); // Request more doctors to ensure all specializations are included
      console.log("All doctors loaded:", allDoctors);
      
      const doctorsByCategory = {};
      
      emergencyCategories.forEach(category => {
        const categoryDoctors = allDoctors
          .filter(doc => doc.specialization === category.specialization)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3); // Top 3 doctors per category
        
        doctorsByCategory[category.specialization] = categoryDoctors;
        console.log(`${category.specialization}: ${categoryDoctors.length} doctors found`);
      });
      
      console.log("Emergency doctors by category:", doctorsByCategory);
      setEmergencyDoctors(doctorsByCategory);
      setIsLoadingDoctors(false);
    } catch (error) {
      console.error("Error loading emergency data:", error);
      setIsLoadingDoctors(false);
    }
  };

  const speakEmergencyGreeting = () => {
    if ('speechSynthesis' in window) {
      const messages = {
        'en-IN': "Emergency mode activated. Your location is being tracked for quick assistance.", // Updated message
        'hi-IN': "आपातकालीन मोड सक्रिय। त्वरित सहायता के लिए आपकी स्थिति को ट्रैक किया जा रहा है।", // Updated message
        'mr-IN': "आपातकालीन मोड सक्रिय. त्वरित सहायतेसाठी तुमचे स्थान ट्रॅक केले जात आहे." // Updated message
      };
      speakInSelectedLanguage(messages[language] || messages['en-IN']);
    }
  };

  const speakMedicalInfo = () => {
    if (!medicalProfile || !('speechSynthesis' in window)) return;

    let info = '';
    
    if (language === 'hi-IN') {
      info = `${user?.full_name || 'उपयोगकर्ता'} के लिए चिकित्सा जानकारी: `;
      if (medicalProfile.blood_type) info += `रक्त समूह: ${medicalProfile.blood_type}। `;
      if (medicalProfile.allergies?.length > 0) info += `एलर्जी: ${medicalProfile.allergies.join(', ')}। `;
      if (medicalProfile.current_medications?.length > 0) info += `वर्तमान दवाएं: ${medicalProfile.current_medications.join(', ')}। `;
    } else if (language === 'mr-IN') {
      info = `${user?.full_name || 'वापरकर्ता'} साठी वैद्यकीय माहिती: `;
      if (medicalProfile.blood_type) info += `रक्तगट: ${medicalProfile.blood_type}। `;
      if (medicalProfile.allergies?.length > 0) info += `ऍलर्जी: ${medicalProfile.allergies.join(', ')}। `;
      if (medicalProfile.current_medications?.length > 0) info += `सध्याची औषधे: ${medicalProfile.current_medications.join(', ')}। `;
    } else {
      info = `Medical information for ${user?.full_name || 'user'}: `;
      if (medicalProfile.blood_type) info += `Blood type: ${medicalProfile.blood_type}. `;
      if (medicalProfile.allergies?.length > 0) info += `Allergies: ${medicalProfile.allergies.join(', ')}. `;
      if (medicalProfile.current_medications?.length > 0) info += `Current medications: ${medicalProfile.current_medications.join(', ')}. `;
    }

    speakInSelectedLanguage(info);
  };

  const activateEmergency = async () => {
    setIsActivated(true);
    setIsSendingAlerts(true);

    const messages = {
      'en-IN': "Emergency alert activated. Sending notifications with your location to emergency contacts.", // Updated message
      'hi-IN': "आपातकालीन अलर्ट सक्रिय। आपके स्थान के साथ आपातकालीन संपर्कों को सूचनाएं भेजी जा रही हैं।", // Updated message
      'mr-IN': "आणीबाणी अलर्ट सक्रिय. तुमच्या स्थानासह आणीबाणी संपर्कांना सूचना पाठवल्या जात आहेत." // Updated message
    };
    speakInSelectedLanguage(messages[language] || messages['en-IN']);

    try {
      // Prepare location URL for email
      const locationUrl = currentLocation 
        ? `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`
        : 'Location not available';

      for (const contact of emergencyContacts) {
        if (contact.email) {
          await SendEmail({
            to: contact.email,
            subject: `EMERGENCY ALERT - ${user?.full_name}`, // Added emphasis to subject
            body: `
              ⚠️ THIS IS AN EMERGENCY ALERT ⚠️
              
              Person: ${user?.full_name}
              Time: ${new Date().toLocaleString()}
              
              LOCATION: ${locationUrl}
              
              Medical Information:
              ${medicalProfile?.blood_type ? `Blood Type: ${medicalProfile.blood_type}` : ''}
              ${medicalProfile?.allergies?.length > 0 ? `Allergies: ${medicalProfile.allergies.join(', ')}` : ''}
              ${medicalProfile?.current_medications?.length > 0 ? `Current Medications: ${medicalProfile.current_medications.join(', ')}` : ''}
              ${medicalProfile?.emergency_notes ? `Emergency Notes: ${medicalProfile.emergency_notes}` : ''}
              
              Please contact them immediately at ${user?.email} or call emergency services.
              
              This alert was sent from MediGuide AI Emergency System.
            `
          });
        }
      }
    } catch (error) {
      console.error("Error sending emergency alerts:", error);
    }

    setIsSendingAlerts(false);
  };

  const resetEmergency = () => {
    setIsActivated(false);
    setSelectedEmergency(null);
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  const handleEmergencySelect = (category) => {
    console.log("Emergency selected:", category);
    console.log("Doctors available for", category.specialization, ":", emergencyDoctors[category.specialization]);
    setSelectedEmergency(category);
    const messages = {
      'en-IN': `${category.title}. Showing available ${category.specialization} specialists near you. Call 911 immediately if critical.`, // Updated message
      'hi-IN': `${category.title}। आपके पास उपलब्ध ${category.specialization} विशेषज्ञ दिखा रहे हैं। गंभीर स्थिति में तुरंत 911 पर कॉल करें।`, // Updated message
      'mr-IN': `${category.title}. तुमच्या जवळ उपलब्ध ${category.specialization} तज्ञ दाखवत आहे. गंभीर असल्यास ताबडतोब 911 वर कॉल करा.` // Updated message
    };
    speakInSelectedLanguage(messages[language] || messages['en-IN']);
  };

  // New function to get current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    if ("geolocation" in navigator) {
      // First try with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setCurrentLocation(location);
          setIsLoadingLocation(false);
          
          const messages = {
            'en-IN': "Your current location has been detected and will be shared during emergency calls.",
            'hi-IN': "आपकी वर्तमान स्थिति का पता लगा लिया गया है और आपातकालीन कॉल के दौरान साझा किया जाएगा।",
            'mr-IN': "तुमचे सध्याचे स्थान शोधले गेले आहे आणि आणीबाणीच्या कॉल दरम्यान सामायिक केले जाईल."
          };
          speakInSelectedLanguage(messages[language] || messages['en-IN']);
        },
        (error) => {
          // If high accuracy fails, try with low accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              };
              setCurrentLocation(location);
              setIsLoadingLocation(false);
            },
            (fallbackError) => {
              console.error("Geolocation error:", fallbackError.message);
              setLocationError("Unable to get your location. Please enable location services and try again.");
              setIsLoadingLocation(false);
            },
            {
              enableHighAccuracy: false,
              timeout: 30000,
              maximumAge: 60000
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLoadingLocation(false);
    }
  };

  // New function to copy location link to clipboard
  const copyLocationToClipboard = () => {
    if (currentLocation) {
      const locationText = `Emergency Location: https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
      navigator.clipboard.writeText(locationText);
      
      const messages = {
        'en-IN': "Location copied to clipboard. You can share this with emergency services.",
        'hi-IN': "स्थान क्लिपबोर्ड पर कॉपी हो गया। आप इसे आपातकालीन सेवाओं के साथ साझा कर सकते हैं।",
        'mr-IN': "स्थान क्लिपबोर्डवर कॉपी केले. तुम्ही हे आणीबाणी सेवांसह सामायिक करू शकता."
      };
      speakInSelectedLanguage(messages[language] || messages['en-IN']);
      alert(messages[language] || messages['en-IN']); // Provide visual feedback as well
    }
  };

  // New function to share location via SMS
  const shareLocationWithContact = (contact) => {
    if (currentLocation && contact.phone) {
      const locationUrl = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
      const message = `EMERGENCY! I need help at: ${locationUrl}`;
      
      // Open SMS with location
      window.location.href = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              {t.pageTitle}
            </h1>
            <p className="text-gray-600 mt-1">{t.pageSubtitle}</p>
          </div>
          <Badge variant="destructive" className="animate-pulse">
            {t.emergencyActive}
          </Badge>
        </div>

        {/* Live Location Map */}
        <Card className="border-red-200 bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Navigation className="w-6 h-6" />
              {t.currentLocation}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingLocation && (
              <Alert>
                <Navigation className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  {t.detecting}
                </AlertDescription>
              </Alert>
            )}

            {locationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}

            {currentLocation && (
              <>
                <div className="h-64 md:h-96 w-full rounded-lg overflow-hidden border-2 border-red-300">
                  <MapContainer
                    center={[currentLocation.lat, currentLocation.lng]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    attributionControl={false} // Disable default attribution
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[currentLocation.lat, currentLocation.lng]}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-bold text-red-600">{t.currentLocation}</p>
                          <p className="text-xs">Lat: {currentLocation.lat.toFixed(6)}</p>
                          <p className="text-xs">Lng: {currentLocation.lng.toFixed(6)}</p>
                        </div>
                      </Popup>
                    </Marker>
                    <RecenterMap center={[currentLocation.lat, currentLocation.lng]} />
                  </MapContainer>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={copyLocationToClipboard}
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {t.copyLocationLink}
                  </Button>
                  <Button
                    onClick={getCurrentLocation} // Re-fetch location
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Refresh Location
                  </Button>
                  <a 
                    href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Open in Google Maps
                    </Button>
                  </a>
                </div>

                <Alert className="bg-green-50 border-green-200">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Location Detected:</strong> Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                    <br />
                    <span className="text-xs">Accuracy: ±{currentLocation.accuracy.toFixed(0)} meters</span>
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>

        {/* Emergency Services - Always visible at top */}
        <Card className="border-red-300 bg-red-50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 text-xl">
              <Phone className="w-6 h-6" />
              Emergency Services - Call Immediately
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <a href="tel:911">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-8 shadow-lg">
                  <Phone className="w-6 h-6 mr-2" />
                  Call 911
                </Button>
              </a>
              <a href="tel:108">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-8 shadow-lg">
                  <Phone className="w-6 h-6 mr-2" />
                  Ambulance 108
                </Button>
              </a>
              <a href="tel:102">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-8 shadow-lg">
                  <Phone className="w-6 h-6 mr-2" />
                  Medical 102
                </Button>
              </a>
            </div>
            {currentLocation && (
              <p className="text-center text-sm text-red-700 mt-4">
                ℹ️ Your location will be automatically shared when calling these numbers
              </p>
            )}
          </CardContent>
        </Card>

        {/* Emergency Categories */}
        <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Stethoscope className="w-6 h-6" />
              {t.emergencyCategories}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyCategories.map((category) => (
                <Card
                  key={category.title}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedEmergency?.title === category.title
                      ? 'ring-2 ring-red-500 shadow-lg'
                      : ''
                  } ${category.bgColor}`}
                  onClick={() => handleEmergencySelect(category)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-16 h-16 rounded-full ${category.bgColor} flex items-center justify-center`}>
                        <category.icon className={`w-8 h-8 ${category.color}`} />
                      </div>
                      <div>
                        <h3 className={`font-bold ${category.color} mb-1`}>{category.title}</h3>
                        <Badge variant={category.urgency === 'CRITICAL' ? 'destructive' : 'secondary'} className="text-xs">
                          {category.urgency}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        {category.symptoms.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Specialist Doctors for Selected Emergency */}
        {selectedEmergency && emergencyDoctors[selectedEmergency.specialization] && emergencyDoctors[selectedEmergency.specialization].length > 0 && (
          <Card className="border-orange-200 bg-orange-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <selectedEmergency.icon className="w-6 h-6" />
                {selectedEmergency.specialization} {t.specialists}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergencyDoctors[selectedEmergency.specialization].map((doctor) => (
                  <Card key={doctor.id} className="border-orange-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{doctor.name}</h3>
                            <Badge className="bg-orange-100 text-orange-800">{doctor.specialization}</Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-orange-600" />
                              <span>{doctor.address}, {doctor.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span>{doctor.experience_years} years experience</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium">{doctor.rating} ⭐ Rating</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-orange-600" />
                              <span className="font-medium">{doctor.phone}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {selectedEmergency.symptoms.map((symptom, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-white">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:min-w-[180px]">
                          <a href={`tel:${doctor.phone}`}>
                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg">
                              <Phone className="w-5 h-5 mr-2" />
                              Emergency Call
                            </Button>
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              let text = '';
                              if (language === 'hi-IN') {
                                text = `डॉक्टर ${doctor.name}, ${doctor.specialization} विशेषज्ञ। ${doctor.city} में स्थित। ${doctor.experience_years} वर्ष का अनुभव। रेटिंग: ${doctor.rating} में से 5। फोन: ${doctor.phone}`;
                              } else if (language === 'mr-IN') {
                                text = `डॉक्टर ${doctor.name}, ${doctor.specialization} तज्ञ। ${doctor.city} मध्ये स्थित। ${doctor.experience_years} वर्षांचा अनुभव। रेटिंग: 5 पैकी ${doctor.rating}। फोन: ${doctor.phone}`;
                              } else {
                                text = `Dr. ${doctor.name}, ${doctor.specialization} specialist in ${doctor.city}. ${doctor.experience_years} years experience. Rating: ${doctor.rating} out of 5. Phone: ${doctor.phone}`;
                              }
                              speakInSelectedLanguage(text);
                            }}
                          >
                            <Volume2 className="w-4 h-4 mr-1" />
                            Read Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedEmergency && (!emergencyDoctors[selectedEmergency.specialization] || emergencyDoctors[selectedEmergency.specialization].length === 0) && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-yellow-800">
                Loading specialists for {selectedEmergency.specialization}...
              </p>
            </CardContent>
          </Card>
        )}

        {/* General Emergency Alert */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className={`border-none shadow-lg transition-all duration-300 ${
            isActivated ? 'bg-red-100 border-red-300' : 'bg-white/70 backdrop-blur-sm hover:shadow-xl'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Shield className="w-6 h-6" />
                Emergency Alert System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                {isActivated 
                  ? t.alertActivated
                  : t.emergencyInfoText
                }
              </p>
              
              {!isActivated ? (
                <Button 
                  onClick={activateEmergency}
                  disabled={emergencyContacts.length === 0 || isSendingAlerts}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
                >
                  {isSendingAlerts ? (
                    <>{t.sendingAlerts}</>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 mr-2" />
                      {t.activateAlert}
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      {t.emergencyActivated} {new Date().toLocaleString()}
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={resetEmergency}
                    variant="outline"
                    className="w-full"
                  >
                    {t.resetEmergency}
                  </Button>
                </div>
              )}
              
              {emergencyContacts.length === 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t.noContacts}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Heart className="w-6 h-6" />
                {t.medicalInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t.medicalInfoDescription}
              </p>
              
              <Button 
                onClick={speakMedicalInfo}
                variant="outline"
                className="w-full flex items-center gap-2"
                disabled={!medicalProfile}
              >
                <Volume2 className="w-5 h-5" />
                {t.speakMedicalInfo}
              </Button>

              {medicalProfile && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  {medicalProfile.blood_type && (
                    <div className="flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-red-600" />
                      <Badge variant="outline">Blood Type: {medicalProfile.blood_type}</Badge>
                    </div>
                  )}
                  
                  {medicalProfile.allergies && medicalProfile.allergies.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Allergies (CRITICAL):
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {medicalProfile.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs font-bold">
                            ⚠️ {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {medicalProfile.chronic_conditions && medicalProfile.chronic_conditions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-orange-700 flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        Chronic Conditions:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {medicalProfile.chronic_conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-orange-50">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {medicalProfile.current_medications && medicalProfile.current_medications.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-blue-700 flex items-center gap-1">
                        <Pill className="w-4 h-4" />
                        Current Medications:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {medicalProfile.current_medications.map((med, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {medicalProfile.emergency_notes && medicalProfile.emergency_notes.trim() && (
                    <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-600 rounded">
                      <p className="text-sm font-medium text-yellow-800">Emergency Notes:</p>
                      <p className="text-sm text-yellow-900 mt-1">{medicalProfile.emergency_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts */}
        <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Phone className="w-6 h-6" />
              {t.yourEmergencyContacts} ({emergencyContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emergencyContacts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.relationship}</p>
                        {contact.is_primary && (
                          <Badge variant="destructive" className="mt-1 text-xs">Primary</Badge>
                        )}
                      </div>
                      <a href={`tel:${contact.phone}`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      </a>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{contact.phone}</p>
                    {contact.email && (
                      <p className="text-xs text-gray-500 mb-2">{contact.email}</p>
                    )}
                    {currentLocation && ( // Only show if location is detected
                      <Button
                        onClick={() => shareLocationWithContact(contact)}
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Send Location via SMS
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{t.noEmergencyContacts}</p>
                <Link to={createPageUrl("Settings")}>
                  <Button variant="outline">
                    Add Emergency Contacts
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
