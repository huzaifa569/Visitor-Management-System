"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  QrCode,
  UserPlus,
  User,
  Clock,
  Shield,
  BookOpen,
  ChevronRight,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import QRCodeScanner from "@/components/QRCodeScanner";
import AppBar from "@/components/AppBar";

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const { user, token } = useAuth();

  // Ensure hydration consistency
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const features = [
    {
      icon: <UserPlus className="h-6 w-6 text-blue-600" />,
      title: "Easy Check-in",
      description: "Streamlined visitor registration process with digital forms"
    },
    {
      icon: <QrCode className="h-6 w-6 text-blue-600" />,
      title: "QR Code Passes",
      description: "Generate secure QR codes for quick access and verification"
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Security Compliance",
      description: "Ensure all visitors meet security requirements"
    },
    {
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      title: "Training Modules",
      description: "Required safety and security training for visitors"
    }
  ];

  return (
    <main className="min-h-screen bg-white font-sans">
      {/* QR Code Scanner */}
      {showScanner && token && (
        <QRCodeScanner
          token={token}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* App Bar */}
      <AppBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-12 md:py-16 lg:py-24">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("/pattern.svg")', backgroundSize: '100px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 rounded-full mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-medium text-blue-800">Visitor Management System</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-6">
                Streamline Your <span className="text-blue-700">Visitor Experience</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
                A comprehensive solution for managing visitors, security compliance, and access control with digital passes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link
                  href="/check-in"
                  className="flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold w-full transition-all shadow-md hover:shadow-lg"
                >
                  New Visitor <ArrowUpRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/been-here-before"
                  className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold w-full transition-all shadow-md hover:shadow-lg"
                >
                  Returning Visitor <User className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/check-out"
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold w-full transition-all shadow-md hover:shadow-lg"
                >
                  Check Out <Clock className="ml-2 h-5 w-5" />
                </Link>
                <button
                  className="flex items-center justify-center border-2 border-blue-700 text-blue-700 hover:bg-blue-50 px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold w-full transition-all"
                  onClick={() => setShowScanner(true)}
                >
                  Scan QR <QrCode className="ml-2 h-5 w-5" />
                </button>
              </div>

              {user && user.role === 'admin' && (
                <div className="mt-4 inline-block">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center text-blue-700 hover:text-blue-900 font-medium"
                  >
                    Go to Admin Dashboard <ChevronRight className="ml-1 h-5 w-5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Hero Image */}  
            <div className="relative mt-6 lg:mt-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                <Image
                  src="/img2.png"
                  alt="Visitor Management"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white rounded-lg shadow-lg p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3 max-w-[180px] sm:max-w-none">
                <div className="bg-green-100 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Quick Check-in</p>
                  <p className="text-xs text-gray-500">Average time: 45 seconds</p>
                </div>
              </div>
              <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-white rounded-lg shadow-lg p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3 max-w-[180px] sm:max-w-none">
                <div className="bg-blue-100 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Secure Access</p>
                  <p className="text-xs text-gray-500">Enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Key Features</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Our visitor management system provides everything you need to streamline the check-in process and enhance security.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow">
                <div className="bg-blue-100 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">How It Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              A simple three-step process for visitors to check in and access your facility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm">
              <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-700" />
              </div>
              <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 sm:mb-4">Step 1</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Register</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Fill out the digital check-in form with your information and purpose of visit.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm">
              <div className="bg-indigo-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-700" />
              </div>
              <div className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 sm:mb-4">Step 2</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Complete Training</h3>
              <p className="text-sm sm:text-base text-gray-600">
                If required, complete any safety or security training modules for your visit.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm">
              <div className="bg-green-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-green-700" />
              </div>
              <div className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 sm:mb-4">Step 3</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Receive Pass</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Get your digital visitor pass with QR code for access throughout the facility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to Get Started?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto opacity-90">
            Experience a seamless visitor management process with our digital solution.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <Link
              href="/check-in"
              className="bg-white text-blue-700 hover:bg-blue-50 px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold transition-colors shadow-md"
            >
              Check In Now
            </Link>
            <Link
              href="/been-here-before"
              className="bg-blue-600 text-white hover:bg-blue-500 px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold transition-colors shadow-md border border-blue-400"
            >
              Returning Visitor
            </Link>
            <Link
              href="/check-out"
              className="bg-green-600 text-white hover:bg-green-500 px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold transition-colors shadow-md border border-green-400"
            >
              Check Out
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">FV VMS</h2>
              <p className="text-sm">Visitor Management System</p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-white font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/check-in" className="hover:text-white transition-colors">Check In</Link></li>
                <li><Link href="/been-here-before" className="hover:text-white transition-colors">Returning Visitor</Link></li>
                <li><Link href="/training-registeration" className="hover:text-white transition-colors">Register for training</Link></li>
                <li><Link href="/check-out" className="hover:text-white transition-colors">Check Out</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-white font-semibold mb-3">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact-us" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} QuickPass Visitor Management System. <Link href="https://wa.me/message/V64INIRXSEJNC1">POWERED BY ATLAS TECH CORPORATION.</Link> All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
