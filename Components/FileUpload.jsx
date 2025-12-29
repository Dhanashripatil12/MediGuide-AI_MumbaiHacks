import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Pill, Loader2, FileImage } from "lucide-react";

export default function FileUpload({ 
  selectedFile, 
  onFileSelect, 
  onCameraStart, 
  onAnalyze, 
  onReset, 
  isProcessing 
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Pill className="w-6 h-6 text-blue-600" />
            Upload Pill Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedFile ? (
            <div className="grid md:grid-cols-2 gap-4">
              {/* File Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Image</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Choose a clear image of your pill
                  </p>
                </div>
              </div>

              {/* Camera Capture */}
              <div 
                onClick={onCameraStart}
                className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
              >
                <Camera className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Take Photo</h3>
                <p className="text-gray-600 text-sm">
                  Use your camera to capture the pill
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Preview */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <FileImage className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {selectedFile.type.startsWith('image/') && (
                  <img 
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected pill"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={onAnalyze}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Pill className="w-4 h-4 mr-2" />
                      Identify Pill
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onReset}
                  disabled={isProcessing}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Supports JPG, PNG images. For best results, ensure the pill is clearly visible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}