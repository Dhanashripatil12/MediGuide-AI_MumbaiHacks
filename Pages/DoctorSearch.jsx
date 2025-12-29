import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Stethoscope,
  Volume2,
  Star,
  MapPin,
  Phone,
  Clock,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/components/LanguageContext";
import { getTranslations } from "@/components/translations";
import { speakInSelectedLanguage } from "@/components/LanguageSelector";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import ttsService from "@/services/textToSpeechService";

export default function DoctorSearch() {
  const [symptom, setSymptom] = useState("");
  const [city, setCity] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(true);
  const { language } = useLanguage();
  const t = getTranslations(language).doctorSearch;
  const { speakOnMount } = useTextToSpeech();

  // Load doctors on component mount
  useEffect(() => {
    const loadInitialDoctors = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDoctors(mockDoctors);
      } catch (error) {
        console.error("Error loading doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialDoctors();
    
    // Automatically speak about doctor search when page loads
    const doctorText = 'Doctor Search page. Find and book appointments with qualified doctors and specialists near you. Search by symptoms or doctor specialty, view ratings and reviews, and check availability.';
    ttsService.speak(doctorText);
  }, []);

  const cities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose"
  ];

  const mockDoctors = [
    // CARDIOLOGY - Chest Pain
    {
      id: 1,
      name: "Dr. Michael Chen",
      specialization: "Cardiology",
      rating: 4.9,
      reviews: 120,
      experience: 20,
      location: "New York",
      clinic: "NYC Heart Care Center",
      phone: "+1-555-0101",
      specialties: ["chest pain", "heart disease", "hypertension", "heart attack prevention", "arrhythmia"],
      image: "👨‍⚕️"
    },
    {
      id: 2,
      name: "Dr. Patricia Anderson",
      specialization: "Cardiology",
      rating: 4.8,
      reviews: 95,
      experience: 18,
      location: "Los Angeles",
      clinic: "LA Cardiac Institute",
      phone: "+1-555-0102",
      specialties: ["chest pain", "heart disease", "cholesterol management", "cardiac surgery"],
      image: "👩‍⚕️"
    },
    {
      id: 3,
      name: "Dr. James Thompson",
      specialization: "Cardiology",
      rating: 4.7,
      reviews: 87,
      experience: 15,
      location: "Houston",
      clinic: "Houston Heart Clinic",
      phone: "+1-555-0103",
      specialties: ["chest pain", "coronary artery disease", "heart failure", "hypertension"],
      image: "👨‍⚕️"
    },
    // NEUROLOGY - Headaches & Migraines
    {
      id: 4,
      name: "Dr. Robert Lee",
      specialization: "Neurology",
      rating: 4.9,
      reviews: 140,
      experience: 22,
      location: "New York",
      clinic: "Premier Neurology Institute",
      phone: "+1-555-0104",
      specialties: ["headaches", "migraines", "dizziness", "nerve pain", "seizures"],
      image: "👨‍⚕️"
    },
    {
      id: 5,
      name: "Dr. Lisa Martinez",
      specialization: "Neurology",
      rating: 4.8,
      reviews: 105,
      experience: 17,
      location: "Chicago",
      clinic: "Chicago Neurology Center",
      phone: "+1-555-0105",
      specialties: ["headaches", "migraines", "tension headaches", "cluster headaches"],
      image: "👩‍⚕️"
    },
    {
      id: 6,
      name: "Dr. Andrew Cohen",
      specialization: "Neurology",
      rating: 4.7,
      reviews: 92,
      experience: 14,
      location: "Phoenix",
      clinic: "Arizona Neurology Clinic",
      phone: "+1-555-0106",
      specialties: ["headaches", "migraines", "vertigo", "neurological disorders"],
      image: "👨‍⚕️"
    },
    // GENERAL MEDICINE - All symptoms
    {
      id: 7,
      name: "Dr. Sarah Williams",
      specialization: "General Medicine",
      rating: 4.8,
      reviews: 175,
      experience: 13,
      location: "New York",
      clinic: "Community Health Clinic",
      phone: "+1-555-0107",
      specialties: ["routine checkups", "fever", "cold", "flu", "headaches", "preventive care"],
      image: "👩‍⚕️"
    },
    {
      id: 8,
      name: "Dr. Christopher Stone",
      specialization: "General Practice",
      rating: 4.7,
      reviews: 148,
      experience: 12,
      location: "Los Angeles",
      clinic: "Family Medicine Center",
      phone: "+1-555-0108",
      specialties: ["general checkups", "fever", "headaches", "allergies", "wellness"],
      image: "👨‍⚕️"
    },
    // ORTHOPEDICS - Back Pain, Joint Pain
    {
      id: 9,
      name: "Dr. James Rodriguez",
      specialization: "Orthopedics",
      rating: 4.9,
      reviews: 165,
      experience: 19,
      location: "Houston",
      clinic: "Advanced Orthopedic Center",
      phone: "+1-555-0109",
      specialties: ["back pain", "knee pain", "shoulder pain", "joint pain", "arthritis", "sports injuries"],
      image: "👨‍⚕️"
    },
    {
      id: 10,
      name: "Dr. Victoria Bell",
      specialization: "Orthopedics",
      rating: 4.8,
      reviews: 128,
      experience: 16,
      location: "Philadelphia",
      clinic: "Philadelphia Orthopedic Institute",
      phone: "+1-555-0110",
      specialties: ["back pain", "spine surgery", "neck pain", "sciatica"],
      image: "👩‍⚕️"
    },
    // RESPIRATORY - Cough, Shortness of Breath
    {
      id: 11,
      name: "Dr. Marcus Turner",
      specialization: "Pulmonology",
      rating: 4.8,
      reviews: 110,
      experience: 17,
      location: "New York",
      clinic: "Lung & Respiratory Center",
      phone: "+1-555-0111",
      specialties: ["cough", "shortness of breath", "asthma", "pneumonia", "bronchitis"],
      image: "👨‍⚕️"
    },
    {
      id: 12,
      name: "Dr. Helen Foster",
      specialization: "Pulmonology",
      rating: 4.7,
      reviews: 95,
      experience: 14,
      location: "Los Angeles",
      clinic: "Respiratory Health Clinic",
      phone: "+1-555-0112",
      specialties: ["cough", "asthma", "shortness of breath", "COPD"],
      image: "👩‍⚕️"
    },
    // GASTROENTEROLOGY - Stomach Pain, Nausea
    {
      id: 13,
      name: "Dr. Daniel Garcia",
      specialization: "Gastroenterology",
      rating: 4.8,
      reviews: 132,
      experience: 18,
      location: "Chicago",
      clinic: "Digestive Health Center",
      phone: "+1-555-0113",
      specialties: ["stomach pain", "nausea", "diarrhea", "acid reflux", "indigestion"],
      image: "👨‍⚕️"
    },
    {
      id: 14,
      name: "Dr. Amanda White",
      specialization: "Gastroenterology",
      rating: 4.7,
      reviews: 108,
      experience: 15,
      location: "Houston",
      clinic: "GI Care Institute",
      phone: "+1-555-0114",
      specialties: ["stomach pain", "nausea", "vomiting", "abdominal pain"],
      image: "👩‍⚕️"
    },
    // DERMATOLOGY - Skin Problems
    {
      id: 15,
      name: "Dr. Emily Watson",
      specialization: "Dermatology",
      rating: 4.9,
      reviews: 145,
      experience: 16,
      location: "Los Angeles",
      clinic: "Advanced Skin Care Clinic",
      phone: "+1-555-0115",
      specialties: ["skin rash", "acne", "eczema", "psoriasis", "skin infections"],
      image: "👩‍⚕️"
    },
    {
      id: 16,
      name: "Dr. Kevin Walsh",
      specialization: "Dermatology",
      rating: 4.8,
      reviews: 118,
      experience: 14,
      location: "San Diego",
      clinic: "Dermatology Specialists",
      phone: "+1-555-0116",
      specialties: ["skin rash", "hives", "fungal infections", "moles"],
      image: "👨‍⚕️"
    },
    // PEDIATRICS
    {
      id: 17,
      name: "Dr. Maria Gonzalez",
      specialization: "Pediatrics",
      rating: 4.9,
      reviews: 160,
      experience: 18,
      location: "Dallas",
      clinic: "Children's Health Center",
      phone: "+1-555-0117",
      specialties: ["fever in children", "childhood infections", "asthma in children", "vaccinations"],
      image: "👩‍⚕️"
    },
    {
      id: 18,
      name: "Dr. Michael Park",
      specialization: "Pediatrics",
      rating: 4.8,
      reviews: 135,
      experience: 15,
      location: "San Jose",
      clinic: "Pediatric Care Clinic",
      phone: "+1-555-0118",
      specialties: ["childhood fever", "ear infections", "sore throat", "childhood allergies"],
      image: "👨‍⚕️"
    },
    // INFECTIOUS DISEASE - Fever, Infections
    {
      id: 19,
      name: "Dr. Susan Lee",
      specialization: "Infectious Disease",
      rating: 4.8,
      reviews: 102,
      experience: 16,
      location: "Philadelphia",
      clinic: "Infectious Disease Center",
      phone: "+1-555-0119",
      specialties: ["fever", "infections", "covid-19", "flu", "antibiotic resistance"],
      image: "👩‍⚕️"
    },
    {
      id: 20,
      name: "Dr. Thomas Brown",
      specialization: "Infectious Disease",
      rating: 4.7,
      reviews: 89,
      experience: 13,
      location: "San Antonio",
      clinic: "Infection Control Clinic",
      phone: "+1-555-0120",
      specialties: ["fever", "infections", "wound infections", "sepsis"],
      image: "👨‍⚕️"
    },
    // ENT - Sore Throat, Ear Pain
    {
      id: 21,
      name: "Dr. Rachel Green",
      specialization: "Otolaryngology (ENT)",
      rating: 4.8,
      reviews: 125,
      experience: 15,
      location: "New York",
      clinic: "ENT Specialist Center",
      phone: "+1-555-0121",
      specialties: ["sore throat", "ear pain", "sinusitis", "tonsillitis"],
      image: "👩‍⚕️"
    },
    {
      id: 22,
      name: "Dr. Brian Taylor",
      specialization: "Otolaryngology (ENT)",
      rating: 4.7,
      reviews: 98,
      experience: 12,
      location: "Chicago",
      clinic: "Chicago ENT Clinic",
      phone: "+1-555-0122",
      specialties: ["sore throat", "earache", "nasal congestion", "hoarseness"],
      image: "👨‍⚕️"
    }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!symptom.trim() || !city) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter doctors by symptom and city
      const filteredDoctors = mockDoctors.filter(doctor => {
        const matchesCity = doctor.location.toLowerCase() === city.toLowerCase();
        const matchesSymptom = doctor.specialties.some(specialty =>
          specialty.toLowerCase().includes(symptom.toLowerCase())
        ) || doctor.specialization.toLowerCase().includes(symptom.toLowerCase());
        
        return matchesCity && matchesSymptom;
      });
      
      setDoctors(filteredDoctors);
      setSearched(true);
    } catch (error) {
      console.error("Error searching doctors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSymptom(transcript);
      };
    } catch (error) {
      alert("Voice input not supported in your browser");
    }
  };

  const handleReadDetails = (doctor) => {
    alert(`${doctor.name} - ${doctor.specialization}\n\nClinic: ${doctor.clinic}\nPhone: ${doctor.phone}`);
  };

  const handleCallNow = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
              <p className="text-gray-600 dark:text-gray-300">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <Card className="mb-8 border-none shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="pt-8">
            <div className="flex items-center gap-3 mb-6">
              <Stethoscope className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.findYourDoctor}</h2>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              {/* Symptom Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.describeSymptom}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t.symptomPlaceholder}
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    className="w-full pr-12"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                  >
                    <Volume2 size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* City Selector */}
              <div className="grid md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.city}
                  </label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectCity} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-10 text-base"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin">⟳</span> {t.searching}
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      {t.findDoctors}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Found {doctors.length} doctors
              </h3>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Volume2 size={18} />
                  Read Results
                </Button>
                <Button variant="outline" className="gap-2">
                  <span>⭐</span>
                  Smart matched
                </Button>
              </div>
            </div>

            {/* Doctor Cards */}
            <div className="space-y-4">
              {doctors.map((doctor, index) => (
                <Card key={doctor.id} className="border-none shadow-lg hover:shadow-xl transition bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6 items-center">
                      {/* Doctor Info */}
                      <div className="md:col-span-2">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{doctor.image}</div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">#{index + 1}</span>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{doctor.name}</h4>
                            </div>
                            <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">{doctor.specialization}</p>

                            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-1">
                                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{doctor.rating}</span>
                                <span>({doctor.reviews} reviews)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={16} />
                                <span>{doctor.experience} years exp.</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={16} />
                                <span>{doctor.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-300">
                              <MapPin size={16} />
                              <span>{doctor.clinic}</span>
                            </div>

                            {/* Specialties Tags */}
                            <div className="flex flex-wrap gap-2">
                              {doctor.specialties.slice(0, 4).map((specialty, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                              {doctor.specialties.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{doctor.specialties.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3">
                        <Button
                          variant="outline"
                          onClick={() => handleReadDetails(doctor)}
                          className="gap-2 dark:border-gray-600 dark:text-white"
                        >
                          <Volume2 size={18} />
                          Read Details
                        </Button>
                        <Button
                          onClick={() => handleCallNow(doctor.phone)}
                          className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                          <Phone size={18} />
                          Call Now
                        </Button>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">{doctor.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searched && (
          <div className="text-center py-12">
            <Stethoscope size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Search for doctors based on your symptoms</p>
          </div>
        )}
      </div>
    </div>
  );
}