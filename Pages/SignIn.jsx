import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Heart, AlertTriangle } from 'lucide-react';
import { useLanguage } from "@/components/LanguageContext";
import { getTranslations } from "@/components/translations";

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const t = getTranslations(language).signIn;
  const tCommon = getTranslations(language).common;
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!email || !password) {
      setError(tCommon.enterBothEmailPassword);
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError(tCommon.invalidEmail);
      setLoading(false);
      return;
    }

    try {
      // Store credentials in sessionStorage (cleared on browser close)
      sessionStorage.setItem('authToken', btoa(JSON.stringify({ email, password })));
      sessionStorage.setItem('userEmail', email);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reload the page to trigger App.jsx authentication check
      window.location.href = '/dashboard';
    } catch (err) {
      setError(t.signInError);
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    // Set demo credentials in sessionStorage
    sessionStorage.setItem('authToken', btoa(JSON.stringify({ email: 'user@medi-guide.com', password: 'demo123' })));
    sessionStorage.setItem('userEmail', 'user@medi-guide.com');
    // Redirect with page reload to trigger auth check
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Medi-Guide</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">AI-powered medicine identification & health companion</p>
        </div>

        {/* Sign In Card */}
        <Card className="border-none shadow-xl bg-white/95 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl dark:text-white">{t.welcomeBack}</CardTitle>
            <CardDescription className="dark:text-gray-400">{t.enterCredentials}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600"
                  defaultChecked
                />
                <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                  {t.rememberMe}
                </label>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {loading ? t.signingIn : t.signInButton}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Demo Login Button */}
            <Button
              type="button"
              onClick={handleDemoLogin}
              variant="outline"
              className="w-full h-10"
            >
              Try Demo Account
            </Button>

            {/* Footer Links */}
            <div className="text-center space-y-2 text-sm">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </button>
              </p>
              <p>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <Card className="border-none shadow-md bg-white/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">📷</div>
              <p className="text-xs text-gray-600">Medicine Identifier</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">🏥</div>
              <p className="text-xs text-gray-600">Doctor Search</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">🚨</div>
              <p className="text-xs text-gray-600">Emergency Info</p>
            </CardContent>
          </Card>
        </div>

        {/* Legal Links */}
        <div className="text-center mt-8 text-xs text-gray-500 space-x-4">
          <button className="hover:text-gray-700">Privacy Policy</button>
          <span>•</span>
          <button className="hover:text-gray-700">Terms of Service</button>
          <span>•</span>
          <button className="hover:text-gray-700">Contact Support</button>
        </div>
      </div>
    </div>
  );
}
