import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/components/DarkModeContext";
import { 
  Pill, 
  Calendar, 
  Star, 
  Eye, 
  Trash2,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { getTranslations } from "@/components/translations";

export default function SavedMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const { darkMode } = useDarkMode();
  const { language } = useLanguage();
  const t = getTranslations(language).common;
  const tPill = getTranslations(language).pillIdentifier;

  useEffect(() => {
    loadSavedMedicines();
  }, []);

  const loadSavedMedicines = async () => {
    try {
      const data = await base44.entities.PillIdentification.list('-created_date', 100);
      console.log("Loaded medicines:", data);
      setMedicines(data);
    } catch (error) {
      console.error("Error loading medicines:", error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedMedicines();
  };

  const handleImageError = (medicineId) => {
    console.warn(`Image failed to load for medicine ${medicineId}`);
    setFailedImages(prev => ({ ...prev, [medicineId]: true }));
  };

  const deleteMedicine = async (id) => {
    if (confirm(t.confirmDelete)) {
      try {
        await base44.entities.PillIdentification.delete(id);
        loadSavedMedicines();
      } catch (error) {
        console.error("Error deleting medicine:", error);
      }
    }
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">{t.loadingMedicines}</p>
        </CardContent>
      </Card>
    );
  }

  if (medicines.length === 0) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-8 text-center">
          <Pill className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">{t.noMedicinesIdentified}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t.useMedicineIdentifier}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          My Saved Medicines ({medicines.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="grid gap-4">
        {medicines.map((medicine) => (
          <Card key={medicine.id} className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/50">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Image */}
                <div className="flex-shrink-0 w-24 h-24">
                  {!failedImages[medicine.id] && medicine.image_url ? (
                    <img
                      src={medicine.image_url}
                      alt={medicine.identified_medication}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      onError={() => handleImageError(medicine.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 flex items-center justify-center">
                      <Pill className="w-12 h-12 text-blue-400 dark:text-blue-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {medicine.identified_medication}
                    </h4>
                    {medicine.brand_name && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{medicine.brand_name}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {medicine.dosage && (
                      <Badge variant="outline" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">{medicine.dosage}</Badge>
                    )}
                    {medicine.confidence_score && (
                      <Badge 
                        variant={medicine.confidence_score >= 0.8 ? "default" : "secondary"}
                        className="flex items-center gap-1 dark:bg-gray-700 dark:text-gray-300"
                      >
                        <Star className="w-3 h-3" />
                        {Math.round(medicine.confidence_score * 100)}%
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(medicine.created_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>

                  {medicine.indications && medicine.indications.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      <strong>Uses:</strong> {medicine.indications.join(', ')}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMedicine(medicine)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMedicine(medicine.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedMedicine && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedicine(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="dark:text-white">{selectedMedicine.identified_medication}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!failedImages[selectedMedicine.id] && selectedMedicine.image_url ? (
                <img
                  src={selectedMedicine.image_url}
                  alt={selectedMedicine.identified_medication}
                  className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  onError={() => handleImageError(selectedMedicine.id)}
                />
              ) : (
                <div className="w-full h-64 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 flex items-center justify-center">
                  <div className="text-center">
                    <Pill className="w-16 h-16 text-blue-400 dark:text-blue-300 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Medicine Image</p>
                  </div>
                </div>
              )}
              
              {selectedMedicine.brand_name && (
                <div className="dark:text-gray-300">
                  <h4 className="font-semibold mb-1 dark:text-white">Brand Name:</h4>
                  <p className="text-sm">{selectedMedicine.brand_name}</p>
                </div>
              )}

              {selectedMedicine.description && (
                <div className="dark:text-gray-300">
                  <h4 className="font-semibold mb-2 dark:text-white">How it works:</h4>
                  <p className="text-sm">{selectedMedicine.description}</p>
                </div>
              )}

              {selectedMedicine.dosage_by_age && (
                <div className="dark:text-gray-300">
                  <h4 className="font-semibold mb-2 dark:text-white">Dosage by Age:</h4>
                  <div className="space-y-2 text-sm">
                    {selectedMedicine.dosage_by_age.adults && (
                      <p><strong>Adults:</strong> {selectedMedicine.dosage_by_age.adults}</p>
                    )}
                    {selectedMedicine.dosage_by_age.children_6_17 && (
                      <p><strong>Children (6-17):</strong> {selectedMedicine.dosage_by_age.children_6_17}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedMedicine.warnings && selectedMedicine.warnings.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400">Warnings:</h4>
                  <ul className="list-disc list-inside space-y-1 text-red-600 dark:text-red-400 text-sm">
                    {selectedMedicine.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={() => setSelectedMedicine(null)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}