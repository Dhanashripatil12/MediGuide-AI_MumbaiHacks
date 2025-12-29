import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Heart, 
  Phone,
  Moon,
  Sun,
  Shield,
  LogOut,
  LogIn,
  ArrowLeft,
  Trash2,
  Plus,
  Pill
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SavedMedicines from "@/components/SavedMedicines";
import { useDarkMode } from "@/components/DarkModeContext";
import { useLanguage } from "@/components/LanguageContext";
import { getTranslations } from "@/components/translations";
import useTextToSpeech from "@/hooks/useTextToSpeech";

export default function Settings({ onLogout, setIsAuthenticated }) {
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [medicalProfile, setMedicalProfile] = useState({
    allergies: [],
    chronic_conditions: [],
    current_medications: [],
    blood_type: "",
    emergency_notes: ""
  });
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    is_primary: false
  });
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storedContacts, setStoredContacts] = useState([]);

  const { darkMode, toggleDarkMode } = useDarkMode();
  const { language } = useLanguage();
  const t = getTranslations(language).settings;
  const { speakOnMount } = useTextToSpeech();

  // loadUserData depends on setUser, setEmergencyContacts, setMedicalProfile (all state setters, stable).
  const loadUserData = useCallback(async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const contacts = await base44.entities.EmergencyContact.list();
      setEmergencyContacts(contacts);

      const profiles = await base44.entities.MedicalProfile.list();
      if (profiles.length > 0) {
        setMedicalProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [setUser, setEmergencyContacts, setMedicalProfile]);

  useEffect(() => {
    // Get email from sessionStorage (set during sign-in)
    const signedInEmail = sessionStorage.getItem('userEmail');
    if (signedInEmail) {
      setUserEmail(signedInEmail);
    }
    loadUserData();
    speakOnMount(t.title, t.subtitle);
  }, [loadUserData, language]);

  const saveMedicalProfile = async () => {
    setIsLoading(true);
    try {
      const profiles = await base44.entities.MedicalProfile.list();
      if (profiles.length > 0) {
        await base44.entities.MedicalProfile.update(profiles[0].id, medicalProfile);
      } else {
        await base44.entities.MedicalProfile.create(medicalProfile);
      }
      alert("Medical profile updated successfully!");
    } catch (error) {
      alert("Error saving medical profile");
    }
    setIsLoading(false);
  };

  const addEmergencyContact = async () => {
    if (!newContact.name || !newContact.phone) {
      alert("Name and phone are required");
      return;
    }
    
    try {
      const createdContact = await base44.entities.EmergencyContact.create(newContact);
      setStoredContacts(prev => [...prev, createdContact]);
      setEmergencyContacts(prev => [...prev, createdContact]);
      setNewContact({ name: "", relationship: "", phone: "", email: "", is_primary: false });
      alert("Contact added successfully!");
    } catch (error) {
      console.error("Error adding contact:", error);
      alert("Error adding contact");
    }
  };

  const removeContact = async (contactId) => {
    try {
      await base44.entities.EmergencyContact.delete(contactId);
      setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
      setStoredContacts(prev => prev.filter(c => c.id !== contactId));
      alert("Contact removed successfully!");
    } catch (error) {
      console.error("Error removing contact:", error);
      alert("Error removing contact");
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setMedicalProfile(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergy.trim()]
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (index) => {
    setMedicalProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setMedicalProfile(prev => ({
        ...prev,
        current_medications: [...(prev.current_medications || []), newMedication.trim()]
      }));
      setNewMedication("");
    }
  };

  const removeMedication = (index) => {
    setMedicalProfile(prev => ({
      ...prev,
      current_medications: prev.current_medications.filter((_, i) => i !== index)
    }));
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      // Clear authentication state from both sessionStorage and localStorage
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userEmail');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isAuthenticated');
      
      // Notify parent component
      if (setIsAuthenticated) {
        setIsAuthenticated(false);
      }
      if (onLogout) {
        onLogout();
      }
      
      // Redirect to sign in
      window.location.href = '/signin';
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if there's an error
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userEmail');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/signin';
    }
  };

  const handleLogin = async () => {
    try {
      await base44.auth.redirectToLogin(window.location.origin + createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8 transition-colors duration-300">
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

        {/* Theme Settings */}
        <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              {t.appearance}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t.darkMode}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t.appearanceDesc}</p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <UserIcon className="w-5 h-5" />
                {t.userProfile}
              </CardTitle>
              <div className="flex gap-2">
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Badge variant="destructive">{t.admin}</Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t.signOut}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleLogin}>
                    <LogIn className="w-4 h-4 mr-2" />
                    {t.signIn}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user.full_name || "User"}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{userEmail}</p>
                </div>
                <Badge variant="outline" className="w-fit">
                  {user.role === 'admin' ? t.administrator : t.user}
                </Badge>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">{t.pleaseSignIn}</p>
            )}
          </CardContent>
        </Card>

        {user && (
          <>
            {/* Saved Medicines */}
            <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Pill className="w-5 h-5 text-blue-500" />
                  {t.savedMedicines}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SavedMedicines />
              </CardContent>
            </Card>

            {/* Medical Profile */}
            <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Heart className="w-5 h-5 text-red-500" />
                  {t.medicalProfile}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Blood Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.bloodType}</label>
                  <Select 
                    value={medicalProfile.blood_type} 
                    onValueChange={(value) => setMedicalProfile(prev => ({...prev, blood_type: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.bloodTypeSelect} />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Allergies */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.allergies}</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.addNewAllergy}
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                    />
                    <Button onClick={addAllergy} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {medicalProfile.allergies?.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1">
                        {allergy}
                        <button onClick={() => removeAllergy(index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Current Medications */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.currentMedications}</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.addNewMedication}
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                    />
                    <Button onClick={addMedication} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {medicalProfile.current_medications?.map((medication, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {medication}
                        <button onClick={() => removeMedication(index)}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Emergency Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.emergencyNotes}</label>
                  <Textarea
                    placeholder={t.emergencyNotes}
                    value={medicalProfile.emergency_notes}
                    onChange={(e) => setMedicalProfile(prev => ({...prev, emergency_notes: e.target.value}))}
                    rows={3}
                  />
                </div>

                <Button onClick={saveMedicalProfile} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  {isLoading ? t.loading : t.savedSuccessfully}
                </Button>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="border-none shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Phone className="w-5 h-5 text-blue-500" />
                  {t.emergencyContacts}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Contact */}
                <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white">{t.addContact}</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder={t.contactName}
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({...prev, name: e.target.value}))}
                    />
                    <Input
                      placeholder={t.phone}
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({...prev, phone: e.target.value}))}
                    />
                    <Select 
                      value={newContact.relationship} 
                      onValueChange={(value) => setNewContact(prev => ({...prev, relationship: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.relationship} />
                      </SelectTrigger>
                      <SelectContent>
                        {["spouse", "parent", "child", "sibling", "friend", "doctor", "other"].map(rel => (
                          <SelectItem key={rel} value={rel}>{rel.charAt(0).toUpperCase() + rel.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={t.email}
                      value={newContact.email}
                      onChange={(e) => setNewContact(prev => ({...prev, email: e.target.value}))}
                    />
                  </div>
                  <Button onClick={addEmergencyContact} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.addContact}
                  </Button>
                </div>

                {/* Contact List */}
                <div className="space-y-3">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{contact.phone}</p>
                        <div className="flex gap-2 mt-1">
                          {contact.relationship && (
                            <Badge variant="outline">{contact.relationship}</Badge>
                          )}
                          {contact.is_primary && (
                            <Badge variant="destructive">Primary</Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeContact(contact.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {emergencyContacts.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No emergency contacts added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Admin Panel */}
        {user?.role === 'admin' && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <Shield className="w-5 h-5" />
                Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You have administrator privileges. You can manage users and system settings through the dashboard.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}