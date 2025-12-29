import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function HealthStats({ recentScans, medicalProfile }) {
  const totalScans = recentScans.length;
  const successfulScans = recentScans.filter(scan => scan.identified_medication).length;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Health Overview</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Pill Scans</CardTitle>
            <Pill className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalScans}</div>
            <p className="text-xs text-gray-600">
              Total identifications performed
            </p>
            {successfulScans > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-600">
                  {successfulScans} successful
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Medical Profile</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {medicalProfile ? "Complete" : "Setup"}
            </div>
            <p className="text-xs text-gray-600">
              {medicalProfile ? "Profile configured" : "Complete your profile"}
            </p>
            {medicalProfile && (
              <div className="mt-2 space-y-1">
                {medicalProfile.allergies && medicalProfile.allergies.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {medicalProfile.allergies.length} allergies listed
                  </Badge>
                )}
                {medicalProfile.blood_type && (
                  <Badge variant="outline" className="text-xs">
                    Blood type: {medicalProfile.blood_type}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {recentScans.length > 0 && (
        <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Pill Identifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-4 p-3 rounded-lg bg-blue-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Pill className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {scan.identified_medication || "Unknown medication"}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {scan.dosage && `${scan.dosage} • `}
                      {new Date(scan.created_date).toLocaleString()}
                    </p>
                    {scan.confidence_score && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(scan.confidence_score * 100)}% confidence
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}