// Mock Base44 Client for development
// In production, this should be replaced with the actual Base44 SDK

import { PillIdentification, Doctor, EmergencyContact, MedicalProfile, Prescription, User } from '@/entities/all.js';

const createMockBase44 = () => {
  return {
    auth: {
      me: async () => {
        return {
          id: "user-1",
          name: "Test User",
          email: "test@example.com"
        };
      },
      redirectToLogin: async (redirectUrl) => {
        console.log("Redirect to login:", redirectUrl);
        // In a real app, this would redirect to Base44 login
      },
      logout: async () => {
        console.log("Logout called");
      }
    },
    db: {
      from: (tableName) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null })
          })
        }),
        insert: async (data) => ({ data, error: null }),
        update: async (data) => ({ data, error: null }),
        delete: async () => ({ data: null, error: null })
      })
    },
    integrations: {
      Core: {
        UploadFile: async ({ file }) => {
          // Mock file upload - convert file to data URL for local display
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                file_url: e.target.result, // Return actual image data URL
                error: null
              });
            };
            reader.readAsDataURL(file);
          });
        },
        InvokeLLM: async ({ prompt, file_urls, response_json_schema }) => {
          // OCR-based medicine identification from text on strip/box
          // Uses Tesseract.js for OCR and database matching
          
          const identifyMedicineByOCR = async (imageUrl) => {
            try {
              // Import Tesseract.js (it's already available via CDN)
              if (typeof Tesseract === 'undefined') {
                console.warn('Tesseract.js not available, using fallback');
                return null;
              }
              
              console.log('Starting OCR analysis of medicine image...');
              
              // Perform OCR on the image
              const result = await Tesseract.recognize(imageUrl, 'eng', {
                logger: m => console.log('OCR Progress:', m.progress)
              });
              
              const extractedText = result.data.text;
              console.log('Extracted text:', extractedText);
              
              if (!extractedText || extractedText.trim().length === 0) {
                console.warn('No text extracted from image');
                return null;
              }
              
              // Normalize text for matching
              const normalizeText = (text) => {
                return text
                  .toLowerCase()
                  .replace(/[^a-z0-9\s]/g, '') // Remove special characters
                  .split(/\s+/)
                  .filter(word => word.length > 2); // Filter short words
              };
              
              const extractedWords = normalizeText(extractedText);
              console.log('Normalized words:', extractedWords);
              
              // Import medicine database
              const medicineDatabase = [
                {
                  genericName: "Paracetamol",
                  brandNames: ["crocin", "tylenol", "acetaminophen", "paracetamol"],
                  id: "MED001"
                },
                {
                  genericName: "Aspirin",
                  brandNames: ["aspirin", "bayer", "disprin", "ecotrin", "bufferin"],
                  id: "MED002"
                },
                {
                  genericName: "Ibuprofen",
                  brandNames: ["brufen", "advil", "ibuprofen", "motrin", "nurofen"],
                  id: "MED003"
                },
                {
                  genericName: "Metformin",
                  brandNames: ["metformin", "glucophage", "diabeta", "glucomet", "gluformin"],
                  id: "MED004"
                },
                {
                  genericName: "Omeprazole",
                  brandNames: ["omeprazole", "prilosec", "omez", "nexium", "losec"],
                  id: "MED005"
                },
                {
                  genericName: "Lisinopril",
                  brandNames: ["lisinopril", "zestril", "lisigon", "zestoretic", "carace"],
                  id: "MED006"
                },
                {
                  genericName: "Amoxicillin",
                  brandNames: ["amoxicillin", "amoxil", "trimox", "biomox", "amoxypen"],
                  id: "MED007"
                },
                {
                  genericName: "Cetirizine",
                  brandNames: ["cetirizine", "zirtec", "alleroff", "cetcip", "alocet"],
                  id: "MED008"
                },
                {
                  genericName: "Atorvastatin",
                  brandNames: ["atorvastatin", "lipitor", "atoris", "atorlip", "atorbest"],
                  id: "MED009"
                },
                {
                  genericName: "Amlodipine",
                  brandNames: ["amlodipine", "norvasc", "amlong", "amlip", "amlogard"],
                  id: "MED010"
                }
              ];
              
              // Match extracted text with medicine database
              let bestMatch = null;
              let highestMatchCount = 0;
              
              for (const medicine of medicineDatabase) {
                let matchCount = 0;
                
                // Check if generic name appears
                if (normalizeText(medicine.genericName)[0] && 
                    extractedWords.includes(normalizeText(medicine.genericName)[0])) {
                  matchCount += 10; // High weight for generic name
                }
                
                // Check brand names
                for (const brandName of medicine.brandNames) {
                  const brandWords = normalizeText(brandName);
                  const matches = brandWords.filter(word => extractedWords.includes(word)).length;
                  matchCount += matches * 5;
                }
                
                console.log(`${medicine.genericName}: ${matchCount} matches`);
                
                if (matchCount > highestMatchCount) {
                  highestMatchCount = matchCount;
                  bestMatch = medicine;
                }
              }
              
              // Return result only if confidence is high
              if (bestMatch && highestMatchCount > 0) {
                console.log(`âœ“ Identified: ${bestMatch.genericName} (confidence: ${highestMatchCount})`);
                return bestMatch;
              } else {
                console.warn('No confident match found');
                return null;
              }
              
            } catch (err) {
              console.error('OCR error:', err);
              return null;
            }
          };
          
          // Perform OCR identification
          let identifiedMedicine = null;
          if (file_urls && file_urls.length > 0) {
            identifiedMedicine = await identifyMedicineByOCR(file_urls[0]);
          }
          
          if (!identifiedMedicine) {
            // No confident match - return error
            return {
              error: 'Could not identify medicine from image. Please ensure the text on medicine strip or box is clearly visible.',
              medicine_name: null,
              confidence_score: 0
            };
          }
          
          // Map identified medicine to response format
          const fullMedicineDatabase = {
            "MED001": {
              medicine_name: "Paracetamol",
              brand_name: "Crocin / Tylenol",
              dosage: "500mg",
              medicine_type: "tablet",
              indications: ["Fever", "Headache", "Body pain", "Mild to moderate pain"],
              how_it_works: "Reduces fever and blocks pain signals in the brain",
              common_side_effects: ["Nausea", "Dizziness", "Stomach upset"],
              serious_side_effects: ["Liver damage (rare with overdose)", "Allergic reactions"],
              dosage_by_age: {
                adults: "1-2 tablets (500-1000mg) every 4-6 hours",
                children_6_17: "0.5-1 tablet (250-500mg) every 4-6 hours",
                elderly: "1 tablet every 6-8 hours"
              },
              when_to_use: {
                timing: "After meals or with water",
                frequency: "Every 4-6 hours",
                maximum_daily_dose: "4000mg per day (do not exceed)"
              },
              warnings: ["Do not exceed 4000mg per day", "Not for patients with liver disease", "Avoid alcohol"],
              ai_recommendation: "Common fever and pain reliever. Safe when used as directed. Always follow dosage instructions.",
              confidence_score: 0.95,
              manufacturer: "GSK"
            },
            "MED002": {
              medicine_name: "Aspirin",
              brand_name: "Bayer / Disprin",
              dosage: "500mg",
              medicine_type: "tablet",
              indications: ["Pain relief", "Fever", "Anti-inflammatory", "Heart attack prevention"],
              how_it_works: "Reduces pain and inflammation by inhibiting prostaglandin production",
              common_side_effects: ["Stomach irritation", "Heartburn", "Dizziness"],
              serious_side_effects: ["Gastrointestinal bleeding", "Allergic reactions"],
              dosage_by_age: {
                adults: "1-2 tablets (500-1000mg) every 4-6 hours",
                children: "NOT RECOMMENDED - Risk of Reye's syndrome",
                elderly: "Lower doses (325mg) recommended"
              },
              when_to_use: {
                timing: "After meals with water",
                frequency: "Every 4-6 hours",
                maximum_daily_dose: "4000mg per day"
              },
              warnings: ["Take with food to prevent stomach ulcers", "NOT safe for children", "Avoid during pregnancy"],
              ai_recommendation: "Classic pain and fever reliever. Must be taken with food. Not safe for children.",
              confidence_score: 0.95,
              manufacturer: "Bayer"
            },
            "MED003": {
              medicine_name: "Ibuprofen",
              brand_name: "Brufen / Advil",
              dosage: "200mg",
              medicine_type: "tablet",
              indications: ["Pain relief", "Fever", "Anti-inflammatory", "Headache", "Muscle aches"],
              how_it_works: "NSAID that reduces pain, fever, and inflammation",
              common_side_effects: ["Stomach upset", "Heartburn", "Dizziness"],
              serious_side_effects: ["Gastrointestinal bleeding", "Kidney damage"],
              dosage_by_age: {
                adults: "1-2 tablets (200-400mg) every 6-8 hours",
                children_6_17: "As per doctor's guidance",
                elderly: "Lower doses recommended"
              },
              when_to_use: {
                timing: "With food or milk",
                frequency: "Every 6-8 hours",
                maximum_daily_dose: "1200mg per day"
              },
              warnings: ["Take with food", "Avoid in pregnancy", "Risk of heart and kidney problems"],
              ai_recommendation: "Effective NSAID for pain and fever. Must take with food.",
              confidence_score: 0.93,
              manufacturer: "Boots"
            },
            "MED004": {
              medicine_name: "Metformin",
              brand_name: "Glucophage / Diabeta",
              dosage: "500mg",
              medicine_type: "tablet",
              indications: ["Type 2 diabetes", "Blood sugar control", "PCOS", "Prediabetes"],
              how_it_works: "Reduces glucose production and improves insulin sensitivity",
              common_side_effects: ["Nausea", "Diarrhea", "Stomach upset"],
              serious_side_effects: ["Lactic acidosis (rare)", "Vitamin B12 deficiency"],
              dosage_by_age: {
                adults: "500-1000mg twice daily with meals",
                children_6_17: "Consult doctor",
                elderly: "May need dose adjustment"
              },
              when_to_use: {
                timing: "During or after meals",
                frequency: "Twice or three times daily",
                maximum_daily_dose: "2000-2500mg per day"
              },
              warnings: ["Must take with meals", "Avoid alcohol", "Monitor kidney function"],
              ai_recommendation: "Main medication for type 2 diabetes. Must take with food.",
              confidence_score: 0.90,
              manufacturer: "Merck"
            },
            "MED005": {
              medicine_name: "Omeprazole",
              brand_name: "Prilosec / Omez",
              dosage: "20mg",
              medicine_type: "capsule",
              indications: ["Acid reflux", "GERD", "Ulcers", "Heartburn"],
              how_it_works: "Reduces stomach acid production",
              common_side_effects: ["Nausea", "Diarrhea", "Headache"],
              serious_side_effects: ["Low vitamin B12", "Low magnesium"],
              dosage_by_age: {
                adults: "1 capsule (20mg) once daily",
                children_6_17: "Consult doctor",
                elderly: "1 capsule once daily"
              },
              when_to_use: {
                timing: "30-60 minutes before breakfast",
                frequency: "Once daily",
                maximum_daily_dose: "40mg per day"
              },
              warnings: ["Take before meals on empty stomach", "May affect B12 absorption", "Long-term use needs monitoring"],
              ai_recommendation: "Effective for acid reflux. Take before breakfast on empty stomach.",
              confidence_score: 0.88,
              manufacturer: "AstraZeneca"
            },
            "MED006": {
              medicine_name: "Lisinopril",
              brand_name: "Zestril / Lisigon",
              dosage: "10mg",
              medicine_type: "tablet",
              indications: ["High blood pressure", "Heart failure", "Post-MI", "Diabetic nephropathy"],
              how_it_works: "ACE inhibitor that relaxes blood vessels",
              common_side_effects: ["Dizziness", "Dry cough", "Fatigue"],
              serious_side_effects: ["Angioedema", "High potassium levels", "Kidney failure"],
              dosage_by_age: {
                adults: "10mg once daily",
                children_6_17: "Consult doctor",
                elderly: "Start with lower dose (5mg)"
              },
              when_to_use: {
                timing: "Same time daily, preferably morning",
                frequency: "Once daily",
                maximum_daily_dose: "40mg per day"
              },
              warnings: ["Monitor blood pressure", "Avoid potassium supplements", "Report dry cough immediately"],
              ai_recommendation: "ACE inhibitor for hypertension. Regular BP monitoring essential.",
              confidence_score: 0.91,
              manufacturer: "AstraZeneca"
            }
          };
          
          // Return full medicine information
          const medicineInfo = fullMedicineDatabase[identifiedMedicine.id];
          if (medicineInfo) {
            return {
              ...medicineInfo,
              identification_method: 'OCR-based text matching from medicine packaging',
              error: null
            };
          } else {
            return {
              error: 'Medicine not found in database',
              confidence_score: 0
            };
          }
        }
      }
    },
    entities: {
      PillIdentification,
      Doctor,
      EmergencyContact,
      MedicalProfile,
      Prescription,
      User
    }
  };
};

export const base44 = createMockBase44();

