import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaGraduationCap, FaChartBar, FaCalendar, FaShieldAlt } from 'react-icons/fa';

interface LoginPageProps {
  onLogin: (htno: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function LoginPage({ onLogin, isLoading, error }: LoginPageProps) {
  const [htno, setHtno] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (htno.trim() && password.trim()) {
      await onLogin(htno.trim(), password.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/15 rounded-full animate-pulse delay-1000"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-12">
            {/* Main Title with Icon */}
            <div className="flex items-center mb-8">
              <FaGraduationCap className="text-4xl mr-6 text-blue-200" />
              <h1 className="text-6xl font-black tracking-tight">75+</h1>
            </div>
            
            {/* Tagline */}
            <p className="text-2xl font-medium text-blue-100 leading-relaxed mb-6">
              Where Attendance Meets Survival
            </p>
            
            {/* Subtitle */}
            <h2 className="text-4xl font-light mb-8 leading-tight text-white">
              Track Your Academic Journey
            </h2>
          </div>
          
          {/* Feature List */}
          <div className="space-y-6">
            <div className="flex items-center">
              <FaChartBar className="text-xl mr-4 text-blue-200" />
              <span className="text-lg text-blue-100 font-medium">Real-time attendance analytics</span>
            </div>
            <div className="flex items-center">
              <FaCalendar className="text-xl mr-4 text-blue-200" />
              <span className="text-lg text-blue-100 font-medium">Subject-wise tracking</span>
            </div>
            <div className="flex items-center">
              <FaShieldAlt className="text-xl mr-4 text-blue-200" />
              <span className="text-lg text-blue-100 font-medium">Secure and private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FaGraduationCap className="text-2xl mr-3 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">EduTrack</h1>
            </div>
            <p className="text-gray-600">Track your academic attendance</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access your attendance dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="htno" className="block text-sm font-semibold text-gray-700 mb-2">
                  Hall Ticket Number
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    id="htno"
                    type="text"
                    value={htno}
                    onChange={(e) => setHtno(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    placeholder="Enter your HTNO"
                    required
                    maxLength={15}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !htno.trim() || !password.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Features Section */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
              <FaChartBar className="text-2xl text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm">Analytics</h3>
              <p className="text-xs text-gray-600 mt-1">Detailed insights</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
              <FaCalendar className="text-2xl text-indigo-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm">Tracking</h3>
              <p className="text-xs text-gray-600 mt-1">Real-time updates</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
              <FaShieldAlt className="text-2xl text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm">Secure</h3>
              <p className="text-xs text-gray-600 mt-1">Protected data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}