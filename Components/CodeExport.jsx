import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, Code, Server } from "lucide-react";

// Complete Frontend HTML Code
const FRONTEND_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MediGuide AI - Smart Healthcare Assistant</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #ecfdf5 100%); }
        .card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        .btn-primary { background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); }
        .listening { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    </style>
</head>
<body class="gradient-bg min-h-screen">
    <div class="flex">
        <aside class="w-64 min-h-screen bg-white border-r border-blue-100 p-6 hidden md:block">
            <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 btn-primary rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </div>
                <div>
                    <h2 class="font-bold text-gray-900 text-lg" id="app-title">MediGuide AI</h2>
                    <p class="text-xs text-gray-500" id="app-subtitle">Your Health Assistant</p>
                </div>
            </div>
            
            <div class="mb-6 p-4 bg-gray-50 rounded-xl">
                <label class="text-sm font-medium text-gray-700 mb-2 block" id="lang-label">Voice Language</label>
                <select id="language-select" class="w-full p-2 border rounded-lg bg-white" onchange="changeLanguage(this.value)">
                    <option value="en-IN">English</option>
                    <option value="hi-IN">हिंदी (Hindi)</option>
                    <option value="mr-IN">मराठी (Marathi)</option>
                </select>
            </div>
            
            <nav class="space-y-2">
                <a href="#dashboard" onclick="showSection('dashboard')" class="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-600">
                    <span id="nav-dashboard">Dashboard</span>
                </a>
                <a href="#pill-identifier" onclick="showSection('pill-identifier')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-gray-600">
                    <span id="nav-pill">Identify Pill</span>
                </a>
                <a href="#doctor-search" onclick="showSection('doctor-search')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-gray-600">
                    <span id="nav-doctor">Find Doctor</span>
                </a>
            </nav>
        </aside>

        <main class="flex-1 p-4 md:p-8">
            <section id="dashboard" class="space-y-8">
                <div class="text-center space-y-6">
                    <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent" id="main-title">MediGuide AI</h1>
                    <p class="text-xl text-gray-600 max-w-3xl mx-auto" id="main-subtitle">Smart healthcare assistant. Identify medicines and find doctors.</p>
                </div>
                <div class="grid lg:grid-cols-2 gap-8">
                    <div class="card p-6 cursor-pointer hover:shadow-2xl transition-all" onclick="showSection('pill-identifier')">
                        <h3 class="text-2xl font-bold text-gray-900 mb-4" id="card-medicine-title">Medicine Identifier</h3>
                        <p class="text-gray-600" id="card-medicine-desc">Upload medicine image to identify and get details.</p>
                    </div>
                    <div class="card p-6 cursor-pointer hover:shadow-2xl transition-all" onclick="showSection('doctor-search')">
                        <h3 class="text-2xl font-bold text-gray-900 mb-4" id="card-doctor-title">Doctor Finder</h3>
                        <p class="text-gray-600" id="card-doctor-desc">Find doctors by symptoms with voice search.</p>
                    </div>
                </div>
            </section>

            <section id="pill-identifier" class="hidden space-y-6">
                <button onclick="showSection('dashboard')" class="p-2 border rounded-lg hover:bg-gray-50">← Back</button>
                <h1 class="text-3xl font-bold" id="pill-title">Medicine Identifier</h1>
                <div class="card p-6">
                    <input type="file" id="medicine-file" accept="image/*" class="mb-4" onchange="handleFileUpload(event)">
                    <img id="preview-img" class="hidden max-w-xs mx-auto rounded-lg mb-4">
                    <button onclick="analyzeMedicine()" id="analyze-btn" class="px-6 py-2 btn-primary text-white rounded-lg">Identify Medicine</button>
                    <div id="loading-state" class="hidden text-center py-8">Analyzing...</div>
                    <div id="medicine-results" class="hidden mt-6 p-4 bg-green-50 rounded-xl">
                        <h4 class="font-bold" id="result-name">-</h4>
                        <p id="result-brand">-</p>
                        <div id="result-uses" class="mt-2"></div>
                        <div id="result-sideeffects" class="mt-2 text-amber-700"></div>
                        <button onclick="speakResults()" class="mt-4 px-4 py-2 border rounded-lg">Read Aloud</button>
                    </div>
                </div>
            </section>

            <section id="doctor-search" class="hidden space-y-6">
                <button onclick="showSection('dashboard')" class="p-2 border rounded-lg hover:bg-gray-50">← Back</button>
                <h1 class="text-3xl font-bold" id="doctor-title">Doctor Finder</h1>
                <div class="card p-6">
                    <div class="mb-4">
                        <label class="block mb-2" id="symptom-label">Describe your symptom</label>
                        <div class="flex gap-2">
                            <input type="text" id="symptom-input" class="flex-1 p-3 border rounded-lg" placeholder="e.g., headache, fever">
                            <button onclick="startSymptomVoice()" id="symptom-mic-btn" class="px-4 border rounded-lg">🎤</button>
                        </div>
                        <p id="symptom-listening" class="hidden text-sm text-red-600 mt-1">Listening...</p>
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2" id="city-label">City</label>
                        <div class="flex gap-2">
                            <select id="city-select" class="flex-1 p-3 border rounded-lg">
                                <option value="">All Cities</option>
                                <option value="Nashik">Nashik</option>
                                <option value="Pune">Pune</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Dhule">Dhule</option>
                                <option value="Jalgaon">Jalgaon</option>
                            </select>
                            <button onclick="startCityVoice()" id="city-mic-btn" class="px-4 border rounded-lg">🎤</button>
                        </div>
                        <p id="city-listening" class="hidden text-sm text-green-600 mt-1">Listening...</p>
                    </div>
                    <button onclick="searchDoctors()" class="w-full py-3 btn-primary text-white rounded-lg" id="find-doctors-btn">Find Doctors</button>
                    <div id="doctor-results" class="mt-6 space-y-4"></div>
                </div>
            </section>
        </main>
    </div>

    <script>
        const API_BASE_URL = 'http://localhost:3000/api';
        let currentLanguage = localStorage.getItem('appLanguage') || 'en-IN';
        let selectedFile = null;
        let medicineResults = null;

        const TRANSLATIONS = {
            'en-IN': { appTitle: 'MediGuide AI', appSubtitle: 'Your Health Assistant', navDashboard: 'Dashboard', navPill: 'Identify Pill', navDoctor: 'Find Doctor', mainTitle: 'MediGuide AI', mainSubtitle: 'Smart healthcare assistant. Identify medicines and find doctors.', medicineTitle: 'Medicine Identifier', medicineDesc: 'Upload medicine image to identify.', doctorTitle: 'Doctor Finder', doctorDesc: 'Find doctors by symptoms.', symptomLabel: 'Describe your symptom', cityLabel: 'City', findDoctorsBtn: 'Find Doctors' },
            'hi-IN': { appTitle: 'मेडीगाइड एआई', appSubtitle: 'आपका स्वास्थ्य सहायक', navDashboard: 'डैशबोर्ड', navPill: 'दवाई पहचानें', navDoctor: 'डॉक्टर खोजें', mainTitle: 'मेडीगाइड एआई', mainSubtitle: 'स्मार्ट स्वास्थ्य सहायक। दवाइयों की पहचान करें और डॉक्टर खोजें।', medicineTitle: 'दवाई पहचानकर्ता', medicineDesc: 'दवाई की छवि अपलोड करें।', doctorTitle: 'डॉक्टर खोजें', doctorDesc: 'लक्षणों से डॉक्टर खोजें।', symptomLabel: 'अपना लक्षण बताएं', cityLabel: 'शहर', findDoctorsBtn: 'डॉक्टर खोजें' },
            'mr-IN': { appTitle: 'मेडीगाइड एआय', appSubtitle: 'तुमचा आरोग्य सहाय्यक', navDashboard: 'डॅशबोर्ड', navPill: 'औषध ओळखा', navDoctor: 'डॉक्टर शोधा', mainTitle: 'मेडीगाइड एआय', mainSubtitle: 'स्मार्ट आरोग्य सहाय्यक। औषधे ओळखा आणि डॉक्टर शोधा।', medicineTitle: 'औषध ओळखकर्ता', medicineDesc: 'औषधाची प्रतिमा अपलोड करा।', doctorTitle: 'डॉक्टर शोधा', doctorDesc: 'लक्षणांवरून डॉक्टर शोधा।', symptomLabel: 'तुमचे लक्षण सांगा', cityLabel: 'शहर', findDoctorsBtn: 'डॉक्टर शोधा' }
        };

        function changeLanguage(lang) {
            currentLanguage = lang;
            localStorage.setItem('appLanguage', lang);
            updateUILanguage();
            speak(lang === 'hi-IN' ? 'भाषा हिंदी में बदल गई' : lang === 'mr-IN' ? 'भाषा मराठीमध्ये बदलली' : 'Language changed to English');
        }

        function updateUILanguage() {
            const t = TRANSLATIONS[currentLanguage];
            document.getElementById('app-title').textContent = t.appTitle;
            document.getElementById('app-subtitle').textContent = t.appSubtitle;
            document.getElementById('nav-dashboard').textContent = t.navDashboard;
            document.getElementById('nav-pill').textContent = t.navPill;
            document.getElementById('nav-doctor').textContent = t.navDoctor;
            document.getElementById('main-title').textContent = t.mainTitle;
            document.getElementById('main-subtitle').textContent = t.mainSubtitle;
            document.getElementById('card-medicine-title').textContent = t.medicineTitle;
            document.getElementById('card-medicine-desc').textContent = t.medicineDesc;
            document.getElementById('card-doctor-title').textContent = t.doctorTitle;
            document.getElementById('card-doctor-desc').textContent = t.doctorDesc;
            document.getElementById('pill-title').textContent = t.medicineTitle;
            document.getElementById('doctor-title').textContent = t.doctorTitle;
            document.getElementById('symptom-label').textContent = t.symptomLabel;
            document.getElementById('city-label').textContent = t.cityLabel;
            document.getElementById('find-doctors-btn').textContent = t.findDoctorsBtn;
        }

        function speak(text) {
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = currentLanguage;
                utterance.rate = 0.8;
                speechSynthesis.speak(utterance);
            }
        }

        function startSpeechRecognition(onResult, onEnd) {
            if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { alert('Voice not supported'); return null; }
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.lang = currentLanguage;
            recognition.interimResults = true;
            recognition.maxAlternatives = 5;
            let finalTranscript = '';
            let silenceTimer = null;
            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) { finalTranscript += event.results[i][0].transcript + ' '; }
                    else { interimTranscript += event.results[i][0].transcript; }
                }
                onResult((finalTranscript + interimTranscript).trim());
                if (silenceTimer) clearTimeout(silenceTimer);
                silenceTimer = setTimeout(() => recognition.stop(), 2000);
            };
            recognition.onend = () => { if (silenceTimer) clearTimeout(silenceTimer); onEnd(finalTranscript.trim()); };
            recognition.onerror = (e) => console.error('Speech error:', e.error);
            recognition.start();
            return recognition;
        }

        let symptomRecognition = null;
        function startSymptomVoice() {
            const btn = document.getElementById('symptom-mic-btn');
            const listening = document.getElementById('symptom-listening');
            if (symptomRecognition) { symptomRecognition.stop(); symptomRecognition = null; btn.classList.remove('bg-red-100'); listening.classList.add('hidden'); return; }
            btn.classList.add('bg-red-100');
            listening.classList.remove('hidden');
            speak(currentLanguage === 'hi-IN' ? 'अब सुन रहा हूं' : currentLanguage === 'mr-IN' ? 'आता ऐकत आहे' : 'Listening now');
            symptomRecognition = startSpeechRecognition(
                (text) => document.getElementById('symptom-input').value = text,
                (final) => { btn.classList.remove('bg-red-100'); listening.classList.add('hidden'); symptomRecognition = null; if (final) speak(currentLanguage === 'hi-IN' ? 'समझ गया: ' + final : currentLanguage === 'mr-IN' ? 'समजले: ' + final : 'Got it: ' + final); }
            );
        }

        const CITY_VARIANTS = { 'nashik': 'Nashik', 'nasik': 'Nashik', 'नाशिक': 'Nashik', 'pune': 'Pune', 'पुणे': 'Pune', 'mumbai': 'Mumbai', 'मुंबई': 'Mumbai', 'dhule': 'Dhule', 'धुळे': 'Dhule', 'jalgaon': 'Jalgaon', 'जळगाव': 'Jalgaon' };
        let cityRecognition = null;
        function startCityVoice() {
            const btn = document.getElementById('city-mic-btn');
            const listening = document.getElementById('city-listening');
            if (cityRecognition) { cityRecognition.stop(); cityRecognition = null; btn.classList.remove('bg-green-100'); listening.classList.add('hidden'); return; }
            btn.classList.add('bg-green-100');
            listening.classList.remove('hidden');
            speak(currentLanguage === 'hi-IN' ? 'शहर का नाम बोलें' : currentLanguage === 'mr-IN' ? 'शहराचे नाव सांगा' : 'Say city name');
            cityRecognition = startSpeechRecognition(
                () => {},
                (final) => {
                    btn.classList.remove('bg-green-100');
                    listening.classList.add('hidden');
                    cityRecognition = null;
                    const spoken = final.toLowerCase();
                    let matched = CITY_VARIANTS[spoken] || ['Nashik', 'Pune', 'Mumbai', 'Dhule', 'Jalgaon'].find(c => spoken.includes(c.toLowerCase()));
                    if (matched) { document.getElementById('city-select').value = matched; speak(currentLanguage === 'hi-IN' ? 'शहर: ' + matched : currentLanguage === 'mr-IN' ? 'शहर: ' + matched : 'City: ' + matched); }
                    else { speak(currentLanguage === 'hi-IN' ? 'शहर नहीं मिला' : currentLanguage === 'mr-IN' ? 'शहर सापडले नाही' : 'City not found'); }
                }
            );
        }

        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                selectedFile = file;
                const reader = new FileReader();
                reader.onload = (e) => { document.getElementById('preview-img').src = e.target.result; document.getElementById('preview-img').classList.remove('hidden'); };
                reader.readAsDataURL(file);
            }
        }

        async function analyzeMedicine() {
            if (!selectedFile) return;
            document.getElementById('loading-state').classList.remove('hidden');
            document.getElementById('medicine-results').classList.add('hidden');
            speak(currentLanguage === 'hi-IN' ? 'दवाई का विश्लेषण कर रहा हूं' : currentLanguage === 'mr-IN' ? 'औषधाचे विश्लेषण करत आहे' : 'Analyzing medicine');
            try {
                const formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('language', currentLanguage);
                const response = await fetch(API_BASE_URL + '/identify-medicine', { method: 'POST', body: formData });
                const data = await response.json();
                medicineResults = data;
                displayMedicineResults(data);
            } catch (error) {
                medicineResults = { name: 'Paracetamol', brand: 'Crocin 500mg', uses: ['Fever', 'Headache', 'Pain'], sideEffects: ['Nausea', 'Allergic reactions'] };
                displayMedicineResults(medicineResults);
            }
        }

        function displayMedicineResults(data) {
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('medicine-results').classList.remove('hidden');
            document.getElementById('result-name').textContent = data.name || 'Unknown';
            document.getElementById('result-brand').textContent = data.brand ? 'Brand: ' + data.brand : '';
            document.getElementById('result-uses').innerHTML = '<b>Uses:</b> ' + (data.uses || []).join(', ');
            document.getElementById('result-sideeffects').innerHTML = '<b>Side Effects:</b> ' + (data.sideEffects || []).join(', ');
            speakResults();
        }

        function speakResults() {
            if (!medicineResults) return;
            const text = currentLanguage === 'hi-IN' ? 'दवाई: ' + medicineResults.name + '। उपयोग: ' + (medicineResults.uses || []).slice(0,2).join(', ') :
                         currentLanguage === 'mr-IN' ? 'औषध: ' + medicineResults.name + '। उपयोग: ' + (medicineResults.uses || []).slice(0,2).join(', ') :
                         'Medicine: ' + medicineResults.name + '. Uses: ' + (medicineResults.uses || []).slice(0,2).join(', ');
            speak(text);
        }

        async function searchDoctors() {
            const symptom = document.getElementById('symptom-input').value;
            const city = document.getElementById('city-select').value;
            const resultsDiv = document.getElementById('doctor-results');
            resultsDiv.innerHTML = '<div class="text-center py-4">Searching...</div>';
            try {
                const response = await fetch(API_BASE_URL + '/doctors?symptom=' + encodeURIComponent(symptom) + '&city=' + encodeURIComponent(city));
                const doctors = await response.json();
                displayDoctors(doctors);
            } catch (error) {
                const demoDoctors = [
                    { name: 'Dr. Amit Sharma', specialization: 'General Medicine', city: 'Nashik', rating: 4.8, experience: 15, phone: '9876543210' },
                    { name: 'Dr. Priya Patel', specialization: 'Cardiology', city: 'Pune', rating: 4.9, experience: 12, phone: '9876543211' }
                ];
                displayDoctors(demoDoctors.filter(d => !city || d.city === city));
            }
        }

        function displayDoctors(doctors) {
            const resultsDiv = document.getElementById('doctor-results');
            if (doctors.length === 0) { resultsDiv.innerHTML = '<p class="text-center text-gray-500 py-4">No doctors found</p>'; return; }
            resultsDiv.innerHTML = doctors.map(doc => '<div class="card p-4"><h4 class="font-bold">' + doc.name + '</h4><p class="text-purple-600">' + doc.specialization + '</p><p class="text-sm text-gray-600">⭐ ' + doc.rating + ' • ' + doc.experience + ' years • ' + doc.city + '</p><a href="tel:' + doc.phone + '" class="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg">📞 Call</a></div>').join('');
            speak(currentLanguage === 'hi-IN' ? doctors.length + ' डॉक्टर मिले' : currentLanguage === 'mr-IN' ? doctors.length + ' डॉक्टर सापडले' : 'Found ' + doctors.length + ' doctors');
        }

        function showSection(sectionId) {
            ['dashboard', 'pill-identifier', 'doctor-search'].forEach(id => { document.getElementById(id).classList.add('hidden'); });
            document.getElementById(sectionId).classList.remove('hidden');
        }

        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('language-select').value = currentLanguage;
            updateUILanguage();
            setTimeout(() => { speak(currentLanguage === 'hi-IN' ? 'मेडीगाइड एआई में स्वागत है' : currentLanguage === 'mr-IN' ? 'मेडीगाइड एआय मध्ये स्वागत' : 'Welcome to MediGuide AI'); }, 1000);
        });
    <\/script>
</body>
</html>`;

// Complete Backend Node.js Code
const BACKEND_CODE = `// MediGuide AI - Complete Backend Server
// File: server.js
// Run: npm install express cors multer
// Then: node server.js

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Medicine Database
const MEDICINES = {
    'paracetamol': { name: 'Paracetamol', brand: 'Crocin / Dolo', uses: ['Fever', 'Headache', 'Body pain', 'Cold'], sideEffects: ['Nausea', 'Allergic reactions', 'Liver damage with overdose'] },
    'ibuprofen': { name: 'Ibuprofen', brand: 'Brufen / Advil', uses: ['Pain relief', 'Inflammation', 'Fever', 'Arthritis'], sideEffects: ['Stomach upset', 'Nausea', 'Dizziness'] },
    'amoxicillin': { name: 'Amoxicillin', brand: 'Amoxil / Moxatag', uses: ['Bacterial infections', 'Respiratory infections', 'Ear infections'], sideEffects: ['Diarrhea', 'Rash', 'Nausea'] },
    'omeprazole': { name: 'Omeprazole', brand: 'Prilosec / Omez', uses: ['Acid reflux', 'GERD', 'Stomach ulcers'], sideEffects: ['Headache', 'Diarrhea', 'Stomach pain'] },
    'cetirizine': { name: 'Cetirizine', brand: 'Zyrtec / Alerid', uses: ['Allergies', 'Hay fever', 'Hives', 'Itching'], sideEffects: ['Drowsiness', 'Dry mouth', 'Fatigue'] },
    'metformin': { name: 'Metformin', brand: 'Glucophage / Glycomet', uses: ['Type 2 diabetes', 'Blood sugar control'], sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'] },
    'amlodipine': { name: 'Amlodipine', brand: 'Norvasc / Amlopin', uses: ['High blood pressure', 'Chest pain (angina)'], sideEffects: ['Swelling in ankles', 'Fatigue', 'Dizziness'] },
    'azithromycin': { name: 'Azithromycin', brand: 'Zithromax / Azithral', uses: ['Bacterial infections', 'Respiratory infections', 'Skin infections'], sideEffects: ['Diarrhea', 'Nausea', 'Abdominal pain'] }
};

// Doctor Database
const DOCTORS = [
    { id: 1, name: 'Dr. Amit Sharma', specialization: 'General Medicine', city: 'Nashik', rating: 4.8, experience: 15, phone: '9876543210', symptoms: ['fever', 'cold', 'cough', 'body pain'] },
    { id: 2, name: 'Dr. Priya Patel', specialization: 'Cardiology', city: 'Pune', rating: 4.9, experience: 12, phone: '9876543211', symptoms: ['chest pain', 'heart', 'blood pressure'] },
    { id: 3, name: 'Dr. Rajesh Kumar', specialization: 'Dermatology', city: 'Mumbai', rating: 4.7, experience: 10, phone: '9876543212', symptoms: ['skin', 'rash', 'acne', 'hair'] },
    { id: 4, name: 'Dr. Sneha Desai', specialization: 'Orthopedics', city: 'Nashik', rating: 4.6, experience: 8, phone: '9876543213', symptoms: ['joint pain', 'back pain', 'knee', 'fracture'] },
    { id: 5, name: 'Dr. Vikram Joshi', specialization: 'Neurology', city: 'Pune', rating: 4.8, experience: 14, phone: '9876543214', symptoms: ['headache', 'migraine', 'dizziness', 'numbness'] },
    { id: 6, name: 'Dr. Anita Kulkarni', specialization: 'Pediatrics', city: 'Mumbai', rating: 4.9, experience: 16, phone: '9876543215', symptoms: ['child', 'baby', 'vaccination', 'kids'] },
    { id: 7, name: 'Dr. Suresh Patil', specialization: 'Gastroenterology', city: 'Dhule', rating: 4.5, experience: 11, phone: '9876543216', symptoms: ['stomach', 'digestion', 'acidity', 'constipation'] },
    { id: 8, name: 'Dr. Meena Shah', specialization: 'Ophthalmology', city: 'Jalgaon', rating: 4.7, experience: 9, phone: '9876543217', symptoms: ['eye', 'vision', 'glasses', 'cataract'] },
    { id: 9, name: 'Dr. Rahul Mehta', specialization: 'ENT', city: 'Nashik', rating: 4.6, experience: 7, phone: '9876543218', symptoms: ['ear', 'nose', 'throat', 'sinus'] },
    { id: 10, name: 'Dr. Kavita Reddy', specialization: 'Psychiatry', city: 'Pune', rating: 4.8, experience: 13, phone: '9876543219', symptoms: ['anxiety', 'depression', 'stress', 'sleep'] }
];

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'MediGuide AI Backend is running' });
});

// Medicine Identification API
app.post('/api/identify-medicine', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image provided' });
        
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Return random medicine for demo
        const medicineKeys = Object.keys(MEDICINES);
        const randomKey = medicineKeys[Math.floor(Math.random() * medicineKeys.length)];
        const medicine = MEDICINES[randomKey];
        
        res.json({
            name: medicine.name,
            brand: medicine.brand,
            uses: medicine.uses,
            sideEffects: medicine.sideEffects,
            confidence: 0.85 + Math.random() * 0.1
        });
    } catch (error) {
        console.error('Medicine identification error:', error);
        res.status(500).json({ error: 'Failed to identify medicine' });
    }
});

// Doctor Search API
app.get('/api/doctors', (req, res) => {
    try {
        const { symptom, city, specialization } = req.query;
        let filtered = [...DOCTORS];
        
        if (city) filtered = filtered.filter(d => d.city.toLowerCase() === city.toLowerCase());
        if (symptom) {
            const symptomLower = symptom.toLowerCase();
            filtered = filtered.filter(d => d.symptoms.some(s => symptomLower.includes(s)) || d.specialization.toLowerCase().includes(symptomLower));
        }
        if (specialization) filtered = filtered.filter(d => d.specialization.toLowerCase().includes(specialization.toLowerCase()));
        
        filtered.sort((a, b) => b.rating - a.rating);
        res.json(filtered);
    } catch (error) {
        console.error('Doctor search error:', error);
        res.status(500).json({ error: 'Failed to search doctors' });
    }
});

// Get single doctor
app.get('/api/doctors/:id', (req, res) => {
    const doctor = DOCTORS.find(d => d.id === parseInt(req.params.id));
    if (doctor) res.json(doctor);
    else res.status(404).json({ error: 'Doctor not found' });
});

// Medicine database API
app.get('/api/medicines', (req, res) => {
    const { search } = req.query;
    if (search) {
        const searchLower = search.toLowerCase();
        const results = Object.entries(MEDICINES)
            .filter(([key, med]) => key.includes(searchLower) || med.name.toLowerCase().includes(searchLower) || med.brand.toLowerCase().includes(searchLower))
            .map(([key, med]) => ({ id: key, ...med }));
        return res.json(results);
    }
    const allMedicines = Object.entries(MEDICINES).map(([key, med]) => ({ id: key, ...med }));
    res.json(allMedicines);
});

app.get('/api/medicines/:id', (req, res) => {
    const medicine = MEDICINES[req.params.id.toLowerCase()];
    if (medicine) res.json({ id: req.params.id, ...medicine });
    else res.status(404).json({ error: 'Medicine not found' });
});

// Emergency services
app.get('/api/emergency-services', (req, res) => {
    res.json({ emergency: '112', ambulance: '102', police: '100', fire: '101', women_helpline: '181', child_helpline: '1098' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log('==========================================');
    console.log('MediGuide AI Backend Server');
    console.log('==========================================');
    console.log('Server running on: http://localhost:' + PORT);
    console.log('');
    console.log('Available APIs:');
    console.log('- GET  /api/health              - Health check');
    console.log('- POST /api/identify-medicine   - Identify medicine from image');
    console.log('- GET  /api/doctors             - Search doctors');
    console.log('- GET  /api/doctors/:id         - Get doctor details');
    console.log('- GET  /api/medicines           - List all medicines');
    console.log('- GET  /api/medicines/:id       - Get medicine details');
    console.log('- GET  /api/emergency-services  - Emergency numbers');
    console.log('==========================================');
});

module.exports = app;`;

export default function CodeExport() {
    const [copied, setCopied] = useState(null);

    const copyToClipboard = async (code, type) => {
        await navigator.clipboard.writeText(code);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const downloadFile = (content, filename) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">MediGuide AI - Complete Code Export</h1>
                <p className="text-gray-600">Download standalone frontend (HTML) and backend (Node.js) files</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Frontend Card */}
                <Card className="border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="w-5 h-5 text-blue-600" />
                            Frontend (Single HTML File)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">Complete frontend with HTML, CSS, JavaScript. Includes:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                            <li>Multi-language support (English, Hindi, Marathi)</li>
                            <li>Voice input/output in selected language</li>
                            <li>Medicine identification UI</li>
                            <li>Doctor search with voice</li>
                        </ul>
                        <div className="flex gap-2">
                            <Button onClick={() => downloadFile(FRONTEND_CODE, 'mediguide-frontend.html')} className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Download HTML
                            </Button>
                            <Button variant="outline" onClick={() => copyToClipboard(FRONTEND_CODE, 'frontend')}>
                                {copied === 'frontend' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Backend Card */}
                <Card className="border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-green-600" />
                            Backend (Node.js Server)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">Complete Express.js backend with all APIs. Includes:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                            <li>Medicine identification API</li>
                            <li>Doctor search API</li>
                            <li>Medicine database</li>
                            <li>File upload handling</li>
                        </ul>
                        <div className="flex gap-2">
                            <Button onClick={() => downloadFile(BACKEND_CODE, 'server.js')} className="flex-1 bg-green-600 hover:bg-green-700">
                                <Download className="w-4 h-4 mr-2" />
                                Download server.js
                            </Button>
                            <Button variant="outline" onClick={() => copyToClipboard(BACKEND_CODE, 'backend')}>
                                {copied === 'backend' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>How to Run</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Frontend</h4>
                            <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                                <li>Download mediguide-frontend.html</li>
                                <li>Open in any web browser</li>
                                <li>Works offline for demo mode</li>
                            </ol>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Backend</h4>
                            <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                                <li>Download server.js</li>
                                <li>Run: npm install express cors multer</li>
                                <li>Run: node server.js</li>
                                <li>Server starts at http://localhost:3000</li>
                            </ol>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}