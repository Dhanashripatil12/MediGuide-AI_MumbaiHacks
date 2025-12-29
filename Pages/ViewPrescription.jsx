import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User as UserIcon,
  Calendar,
  Phone,
  Download,
  Loader2,
  AlertTriangle
} from "lucide-react";

export default function ViewPrescription() {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPrescription();
  }, []);

  const loadPrescription = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const prescriptionId = urlParams.get('id');

      if (!prescriptionId) {
        setError("No prescription ID provided");
        setLoading(false);
        return;
      }

      const prescriptions = await base44.entities.Prescription.list();
      const found = prescriptions.find(p => p.id === prescriptionId);

      if (found) {
        setPrescription(found);
      } else {
        setError("Prescription not found");
      }
    } catch (error) {
      console.error("Error loading prescription:", error);
      setError("Error loading prescription");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading prescription...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h2>
            <p className="text-gray-600">{error || "Prescription not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Prescription</h1>
          <p className="text-gray-600">View prescription details</p>
        </div>

        {/* Patient Info Card */}
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-blue-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{prescription.patient_name}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {prescription.patient_contact && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span>{prescription.patient_contact}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>
                  {prescription.prescription_date 
                    ? new Date(prescription.prescription_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : new Date(prescription.created_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                  }
                </span>
              </div>
            </div>

            {prescription.notes && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Notes:</p>
                <p className="text-gray-700">{prescription.notes}</p>
              </div>
            )}

            <Badge variant="outline" className="w-fit">
              {prescription.file_type === 'pdf' ? 'PDF Document' : 'Image File'}
            </Badge>
          </CardContent>
        </Card>

        {/* Prescription File Card */}
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Prescription Document
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* File Display */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                {prescription.file_type === 'pdf' ? (
                  <div className="space-y-4">
                    <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden border">
                      <iframe
                        src={prescription.file_url}
                        className="w-full h-full"
                        title="Prescription PDF"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <img
                      src={prescription.file_url}
                      alt="Prescription"
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>

              {/* Download Button */}
              <div className="flex justify-center">
                <a
                  href={prescription.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    Download Prescription
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Notice */}
        <div className="text-center text-sm text-gray-500 p-4">
          <p>This is a medical prescription. Please consult with your healthcare provider for any questions.</p>
          <p className="mt-2">© MediGuide AI - Your Health Assistant</p>
        </div>
      </div>
    </div>
  );
}