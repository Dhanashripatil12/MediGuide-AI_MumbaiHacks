import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/components/LanguageContext";
import { getTranslations } from "@/components/translations";
import {
  ArrowLeft,
  Upload,
  FileText,
  QrCode,
  User as UserIcon,
  Calendar,
  Phone,
  Download,
  Eye,
  Loader2,
  Shield,
  CheckCircle
} from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const { language } = useLanguage();
  const t = getTranslations(language).adminDashboard;
  
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_contact: "",
    prescription_date: new Date().toISOString().split('T')[0],
    notes: "",
    file: null
  });

  useEffect(() => {
    checkAdminAccess();
    loadPrescriptions();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const data = await base44.entities.Prescription.list('-created_date', 50);
      setPrescriptions(data);
    } catch (error) {
      console.error("Error loading prescriptions:", error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setFormData(prev => ({ ...prev, file }));
      } else {
        alert("Please upload a valid image (JPG, PNG) or PDF file");
      }
    }
  };

  const handleUpload = async () => {
    if (!formData.patient_name || !formData.file) {
      alert("Please fill in patient name and upload a file");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: formData.file });
      
      // Determine file type
      const file_type = formData.file.type.includes('pdf') ? 'pdf' : 'image';
      
      // Create prescription record with temporary QR code
      const prescriptionData = {
        patient_name: formData.patient_name,
        patient_contact: formData.patient_contact,
        file_url: file_url,
        file_type: file_type,
        prescription_date: formData.prescription_date,
        notes: formData.notes,
        qr_code_url: "generating..."
      };

      const savedPrescription = await base44.entities.Prescription.create(prescriptionData);
      
      // Generate QR code URL pointing to the view prescription page
      const viewUrl = `${window.location.origin}${createPageUrl("ViewPrescription")}?id=${savedPrescription.id}`;
      const qr_code_url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(viewUrl)}`;
      
      // Update prescription with QR code URL
      await base44.entities.Prescription.update(savedPrescription.id, {
        ...prescriptionData,
        qr_code_url: qr_code_url
      });

      setUploadSuccess(true);
      setFormData({
        patient_name: "",
        patient_contact: "",
        prescription_date: new Date().toISOString().split('T')[0],
        notes: "",
        file: null
      });
      
      // Reset file input
      document.getElementById('file-input').value = '';
      
      loadPrescriptions();
      
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Error uploading prescription:", error);
      alert("Error uploading prescription. Please try again.");
    }

    setIsUploading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">{t.loading}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.accessDenied}</h2>
            <p className="text-gray-600 mb-6">{t.adminPrivileges}</p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                {t.goToDashboard}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
            <p className="text-gray-600 mt-1">{t.subtitle}</p>
          </div>
          <Badge variant="destructive" className="ml-auto">{t.admin}</Badge>
        </div>

        {uploadSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {t.uploadSuccess}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Prescription Section */}
        <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Upload className="w-6 h-6 text-blue-600" />
              {t.uploadPrescription}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {t.patientName} *
                  </label>
                  <Input
                    placeholder={t.patientName}
                    value={formData.patient_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block\">
                    {t.patientContact}
                  </label>
                  <Input
                    placeholder="Enter phone number"
                    value={formData.patient_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_contact: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t.prescriptionDate}
                  </label>
                  <Input
                    type="date"
                    value={formData.prescription_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, prescription_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t.notes}
                  </label>
                  <Textarea
                    placeholder="Additional notes about the prescription"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Right Column - File Upload */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t.uploadPrescription} *
                  </label>
                  <div className="relative">
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-blue-300 dark:border-blue-500 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-400 transition-colors bg-blue-50 dark:bg-gray-700">
                      <FileText className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-3" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                        {formData.file ? formData.file.name : "Click to upload"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Supports JPG, PNG, PDF
                      </p>
                    </div>
                  </div>
                </div>

                {formData.file && (
                  <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg text-green-800 dark:text-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Selected:</strong> {formData.file.name}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Size: {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t.uploading}
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      {t.uploadButton}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <FileText className="w-6 h-6 text-purple-600" />
              {t.recentPrescriptions} ({prescriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t.noDataFound}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="grid md:grid-cols-4 gap-6">
                      {/* Patient Info */}
                      <div className="md:col-span-2 space-y-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-blue-500" />
                            {prescription.patient_name}
                          </h3>
                          {prescription.patient_contact && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                              <Phone className="w-4 h-4" />
                              {prescription.patient_contact}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {prescription.prescription_date || new Date(prescription.created_date).toLocaleDateString()}
                        </div>

                        <Badge variant="outline" className="w-fit">
                          {prescription.file_type === 'pdf' ? 'PDF Document' : 'Image File'}
                        </Badge>

                        {prescription.notes && (
                          <p className="text-sm text-gray-600 italic">
                            {prescription.notes}
                          </p>
                        )}
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
                          <img
                            src={prescription.qr_code_url}
                            alt="QR Code"
                            className="w-32 h-32"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Scan to view prescription
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Link to={`${createPageUrl("ViewPrescription")}?id=${prescription.id}`} target="_blank">
                          <Button variant="outline" className="w-full" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <a href={prescription.qr_code_url} download={`qr-${prescription.patient_name}.png`}>
                          <Button variant="outline" className="w-full" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download QR
                          </Button>
                        </a>
                        <a href={prescription.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            View File
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}