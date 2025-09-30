"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  Camera,
  CheckCircle,
  Clock,
  Shield,
  Users,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";
import QRCodeScanner from "@/components/QRCodeScanner";
import AppBar from "@/components/AppBar";
import Link from "next/link";

export default function Home() {
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Ensure hydration consistency
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-purple-100 font-sans">
      {/* Use the AppBar component for consistent navigation */}
      <AppBar showAuthButtons={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
            {/* Text Content */}
            <div className="text-center lg:text-left max-w-xl animate-fadeIn">
              <div className="inline-block bg-purple-100 px-3 py-1 rounded-full mb-4">
                <p className="text-xs font-medium tracking-widest text-purple-700 uppercase">
                  QuickPass - Visitor Management Simplified
                </p>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold my-4 text-black leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-purple-700">
                  Visitor Pass <br className="hidden md:block" /> Management System
                </span>
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Streamline your visitor management process with our secure and efficient system.
                Quick check-ins, real-time notifications, and comprehensive analytics.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  href="/check-in"
                  className="flex items-center justify-center bg-gradient-to-r from-blue-800 to-indigo-700 text-white px-8 py-4 rounded-full font-semibold w-full sm:w-auto hover:shadow-lg transform transition-all hover:-translate-y-1"
                >
                  Check-in <ArrowUpRight className="ml-2 animate-pulse" />
                </Link>
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center justify-center border-2 border-blue-800 text-blue-800 px-8 py-4 rounded-full font-semibold w-full sm:w-auto hover:bg-blue-50 transform transition-all hover:-translate-y-1"
                >
                  Scan QR <Camera className="ml-2 w-4 h-4" />
                </button>

                {/* QR Code Scanner Modal */}
                {showQRScanner && (
                  <QRCodeScanner
                    token="" // No token needed for public scanning
                    onClose={() => setShowQRScanner(false)}
                  />
                )}
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium border border-white">JD</div>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium border border-white">AS</div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium border border-white">RK</div>
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-medium border border-white">+</div>
                </div>
                <p className="ml-2 text-sm text-gray-600">Trusted by 5,000+ organizations worldwide</p>
              </div>
            </div>

            {/* Images */}
            <div className="flex flex-col lg:flex-row items-center gap-6 animate-slideInRight">
              <div className="relative transform transition-transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-30 animate-pulse"></div>
                <Image
                  src="/img2.png"
                  alt="QR Scan"
                  width={320}
                  height={320}
                  className="rounded-xl shadow-lg relative"
                  priority
                />
              </div>
              <div className="relative transform transition-transform hover:scale-105 mt-4 lg:mt-12">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-30 animate-pulse"></div>
                <Image
                  src="/img1.png"
                  alt="Office"
                  width={320}
                  height={320}
                  className="rounded-xl shadow-lg relative"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white bg-opacity-70 rounded-3xl shadow-sm my-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900">Key Features</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Our visitor management system offers everything you need to streamline your front desk operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Easy Check-in</h3>
              <p className="text-gray-600 text-center">
                Simple and quick check-in process for visitors with minimal waiting time
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Enhanced Security</h3>
              <p className="text-gray-600 text-center">
                Know exactly who is in your building at all times with detailed visitor logs
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Clock className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Real-time Notifications</h3>
              <p className="text-gray-600 text-center">
                Instant alerts when visitors arrive, ensuring hosts are always informed
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Visitor Analytics</h3>
              <p className="text-gray-600 text-center">
                Comprehensive reports and insights on visitor traffic and patterns
              </p>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 my-12 bg-gradient-to-r from-blue-900 to-indigo-800 rounded-3xl text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">By The Numbers</h2>
            <p className="mt-2 max-w-2xl mx-auto text-blue-100">
              See how QuickPass is transforming visitor management across organizations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-20 transform transition-transform hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <p className="text-blue-100">Reduction in check-in time</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-20 transform transition-transform hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2">5,000+</div>
              <p className="text-blue-100">Organizations using QuickPass</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-20 transform transition-transform hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <p className="text-blue-100">Visitors processed monthly</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-20 transform transition-transform hover:scale-105">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <p className="text-blue-100">System uptime reliability</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 my-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900">How It Works</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Our simple three-step process makes visitor management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
              <div className="bg-blue-800 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Register</h3>
              <p className="text-gray-600 text-center">
                Visitors enter their details through our user-friendly interface
              </p>
              <div className="hidden md:block absolute top-10 right-0 w-1/2 h-0.5 bg-blue-200"></div>
            </div>

            <div className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
              <div className="bg-blue-800 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Notify</h3>
              <p className="text-gray-600 text-center">
                The system automatically alerts the host about their visitor's arrival
              </p>
              <div className="hidden md:block absolute top-10 right-0 w-1/2 h-0.5 bg-blue-200"></div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
              <div className="bg-blue-800 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Check-in</h3>
              <p className="text-gray-600 text-center">
                Visitors receive a digital pass for seamless access to the premises
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 my-12 bg-gray-50 rounded-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900">What Our Clients Say</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Hear from organizations that have transformed their visitor experience with QuickPass
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex text-yellow-400 mb-4">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-gray-700 italic mb-4">
                "QuickPass has completely transformed our front desk operations. Our visitors love the seamless check-in process, and our staff appreciates the automated notifications."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                  JD
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Jane Doe</p>
                  <p className="text-xs text-gray-500">Facilities Manager, Tech Corp</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex text-yellow-400 mb-4">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-gray-700 italic mb-4">
                "The analytics feature has given us valuable insights into visitor patterns. We've been able to optimize staffing and improve security protocols based on this data."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                  JS
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">John Smith</p>
                  <p className="text-xs text-gray-500">Security Director, Global Industries</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex text-yellow-400 mb-4">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-gray-700 italic mb-4">
                "The QR code system has made our visitor check-in process contactless and efficient. Implementation was smooth, and the support team has been exceptional."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                  AW
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Alice Williams</p>
                  <p className="text-xs text-gray-500">Office Manager, Innovate Co.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-900 to-indigo-800 rounded-3xl text-white my-12 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
          </div>

          <div className="relative text-center max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your visitor experience?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of organizations that have streamlined their visitor management process with QuickPass
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/signup"
                className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-full font-semibold transition-all transform hover:-translate-y-1"
              >
                Contact Sales
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-blue-800 text-sm text-blue-200">
              <p>No credit card required • Free trial available • Cancel anytime</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-700 text-white p-1.5 rounded mr-2">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-blue-800">QuickPass</span>
              </div>
              <p className="text-gray-600 mb-4">Streamlining visitor management for modern organizations.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-gray-600 hover:text-blue-800">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-blue-800">Pricing</Link></li>
                <li><Link href="/security" className="text-gray-600 hover:text-blue-800">Security</Link></li>
                <li><Link href="/integrations" className="text-gray-600 hover:text-blue-800">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-600 hover:text-blue-800">About</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-blue-800">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-600 hover:text-blue-800">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-blue-800">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-gray-600 hover:text-blue-800">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-blue-800">Terms</Link></li>
                <li><Link href="/cookies" className="text-gray-600 hover:text-blue-800">Cookie Policy</Link></li>
                <li><Link href="/gdpr" className="text-gray-600 hover:text-blue-800">GDPR</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} QuickPass. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <select className="bg-white border border-gray-300 rounded-md py-1 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
