import React from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Heart, 
  Pill, 
  Stethoscope, 
  AlertTriangle, 
  Settings,
  Mic,
  MicOff,
  Shield,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDarkMode } from "@/components/DarkModeContext";
import { useLanguage } from "@/components/LanguageContext";
import { getTranslations } from "@/components/translations";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import LanguageSelector from "@/components/LanguageSelector";
import { getCurrentLanguage } from "@/components/LanguageSelector";

const getNavigationItems = (translations) => {
  const t = translations.dashboard;
  
  return [
    {
      title: t.dashboard || "Dashboard",
      url: createPageUrl("Dashboard"),
      icon: Heart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: t.identifyPill || "Identify Pill",
      url: createPageUrl("PillIdentifier"),
      icon: Pill,
      color: "text-blue-600", 
      bgColor: "bg-blue-50"
    },
    {
      title: t.findDoctor || "Find Doctor",
      url: createPageUrl("DoctorSearch"),
      icon: Stethoscope,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: t.emergency || "Emergency",
      url: createPageUrl("Emergency"),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: t.settings || "Settings",
      url: createPageUrl("Settings"),
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      title: t.adminPanel || "Admin Panel",
      url: createPageUrl("AdminDashboard"),
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];
};

export default function Layout({ onLogout, setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { language } = useLanguage();
  const [isListening, setIsListening] = React.useState(false);
  const [voiceSupported, setVoiceSupported] = React.useState(false);
  const [navigationItems, setNavigationItems] = React.useState([]);
  
  const translations = getTranslations(language);
  
  React.useEffect(() => {
    setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    setNavigationItems(getNavigationItems(translations));
  }, [language, translations]);

  const startVoiceNavigation = () => {
    if (!voiceSupported) return;
    
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    const lang = getCurrentLanguage();
    recognition.continuous = false;
    recognition.lang = lang === 'en-IN' ? 'en-IN' : lang === 'hi-IN' ? 'hi-IN' : 'mr-IN';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      const currentLang = getCurrentLanguage();
      
      const navigation = {
        'en-IN': {
          dashboard: ['dashboard', 'home'],
          pill: ['pill', 'identify', 'medicine'],
          doctor: ['doctor', 'find'],
          emergency: ['emergency', 'help'],
          settings: ['settings', 'setting']
        },
        'hi-IN': {
          dashboard: ['डैशबोर्ड', 'होम'],
          pill: ['गोली', 'दवाई', 'दवा'],
          doctor: ['डॉक्टर', 'खोजें', 'खोज'],
          emergency: ['आपातकाल', 'मदद'],
          settings: ['सेटिंग', 'सेटिंग्स']
        },
        'mr-IN': {
          dashboard: ['डॅशबोर्ड', 'मुख्यपृष्ठ', 'होम'],
          pill: ['गोळी', 'औषध', 'दवा'],
          doctor: ['डॉक्टर', 'शोधा', 'शोध'],
          emergency: ['आणीबाणी', 'मदत'],
          settings: ['सेटिंग्ज', 'सेटिंग']
        }
      };
      
      const nav = navigation[currentLang] || navigation['en-IN'];
      
      if (nav.dashboard.some(word => command.includes(word))) {
        window.location.href = createPageUrl("Dashboard");
      } else if (nav.pill.some(word => command.includes(word))) {
        window.location.href = createPageUrl("PillIdentifier");
      } else if (nav.doctor.some(word => command.includes(word))) {
        window.location.href = createPageUrl("DoctorSearch");
      } else if (nav.emergency.some(word => command.includes(word))) {
        window.location.href = createPageUrl("Emergency");
      } else if (nav.settings.some(word => command.includes(word))) {
        window.location.href = createPageUrl("Settings");
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  return (
    <SidebarProvider className="bg-gray-50 dark:bg-gray-950">
      <div className="h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-200">
        <Sidebar className="border-r border-blue-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-850 dark:text-white flex-shrink-0">
          <SidebarHeader className="border-b border-blue-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">{translations.common?.appName || "MediGuide AI"}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{translations.sidebar?.yourHealthAssistant || "Your Health Assistant"}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 bg-white dark:bg-gray-850 dark:text-white">
            {/* Language Selector */}
            <SidebarGroup className="mb-4">
              <LanguageSelector />
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          onClick={() => window.location.pathname === item.url || (window.location.href = item.url)}
                          className={`hover:${item.bgColor} hover:${item.color} transition-all duration-200 rounded-xl p-3 cursor-pointer dark:hover:bg-gray-800 ${
                            isActive ? `${item.bgColor} ${item.color} shadow-sm` : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {voiceSupported && (
              <SidebarGroup className="mt-6">
                <div className="px-3">
                  <Button
                    onClick={startVoiceNavigation}
                    disabled={isListening}
                    variant="outline"
                    className={`w-full flex items-center gap-2 ${
                      isListening ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-700 dark:text-red-200' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                    {isListening ? translations.common?.listening : translations.common?.voiceNavigation}
                  </Button>
                  <p className="text-xs text-black dark:text-gray-300 mt-2 text-center font-medium">
                    {translations.common?.voiceCommandsHint}
                  </p>
                </div>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-blue-100 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-850 dark:text-white">
            {/* Dark Mode Toggle */}
            <Button
              onClick={() => toggleDarkMode(!darkMode)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              title={darkMode ? translations.common?.switchToLightMode : translations.common?.switchToDarkMode}
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="text-sm font-medium">{translations.common?.lightMode}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="text-sm font-medium">{translations.common?.darkMode}</span>
                </>
              )}
            </Button>

            {/* User Profile Section */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{translations.common?.welcome || "Welcome to"} {translations.common?.appName || "MediGuide AI"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{translations.common?.stayHealthy || "Stay healthy & safe"}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-blue-100 dark:border-gray-700 px-6 py-4 md:hidden flex-shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{translations.common?.appName || "MediGuide AI"}</h1>
              {location.pathname.includes("emergency") && (
                <Badge variant="destructive" className="ml-auto">
                  {translations.sidebar?.emergencyMode || "Emergency Mode"}
                </Badge>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}