import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertTriangle, 
  Volume2, 
  Calendar,
  Pill,
  Info,
  RotateCcw
} from "lucide-react";

export default function PillResults({ results, onReset, onSpeak }) {
  const confidenceColor = results.confidence_score >= 0.8 ? 'text-green-600' : 
                         results.confidence_score >= 0.6 ? 'text-yellow-600' : 'text-red-600';
  
  const confidenceText = results.confidence_score >= 0.8 ? 'High' :
                        results.confidence_score >= 0.6 ? 'Medium' : 'Low';

  const speakResults = () => {
    const text = `Identified medication: ${results.identified_medication || 'Unknown'}. 
                  ${results.description || ''} 
                  ${results.warnings?.length > 0 ? `Important warnings: ${results.warnings.join('. ')}` : ''}`;
    onSpeak(text);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Pill Identified
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={speakResults}
              className="flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Read Aloud
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Results */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {results.identified_medication || "Unknown Medication"}
              </h3>
              {results.dosage && (
                <Badge variant="outline" className="mb-3">
                  <Pill className="w-3 h-3 mr-1" />
                  {results.dosage}
                </Badge>
              )}
              <p className="text-gray-600 leading-relaxed">
                {results.description || "No description available."}
              </p>
            </div>

            <div className="flex justify-center">
              <img 
                src={results.image_url}
                alt="Identified pill"
                className="max-w-full max-h-48 object-contain rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Confidence Score */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Identification Confidence</p>
              <p className={`text-sm ${confidenceColor} font-medium`}>
                {confidenceText} ({Math.round((results.confidence_score || 0) * 100)}%)
              </p>
            </div>
          </div>

          {/* Expiry Date */}
          {results.expiry_date && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <strong>Expiry Date:</strong> {new Date(results.expiry_date).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {results.warnings && results.warnings.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important Warnings:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {results.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Another
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}