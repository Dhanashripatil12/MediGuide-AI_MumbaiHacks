import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Pill, Stethoscope, AlertTriangle, Camera, Search, Phone } from "lucide-react";

const quickActions = [
  {
    title: "Identify Pill",
    description: "Upload or capture pill image for instant identification",
    icon: Pill,
    url: createPageUrl("PillIdentifier"),
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700"
  },
  {
    title: "Find Doctor", 
    description: "Search for specialists based on your symptoms",
    icon: Stethoscope,
    url: createPageUrl("DoctorSearch"),
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700"
  },
  {
    title: "Emergency Mode",
    description: "Quick access to emergency contacts and alerts",
    icon: AlertTriangle,
    url: createPageUrl("Emergency"),
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50", 
    textColor: "text-red-700"
  }
];

export default function QuickActions() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Quick Actions</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.url} className="group">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}