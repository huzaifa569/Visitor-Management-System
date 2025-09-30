'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  BarChart2,
  Home,
  UserPlus,
  FileText,
  BookOpen,
  LayoutDashboard,
  QrCode,
  Users,
  Group
} from 'lucide-react';
import Image from 'next/image';

interface AppBarProps {
  showAuthButtons?: boolean;
}

export default function AppBar({ showAuthButtons = true }: AppBarProps) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const handleLanguageChange = async (lang: string) => {
    setLanguageOpen(false);

    try {
      const res = await fetch('/api/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      });

      if (!res.ok) throw new Error("Language change failed");

      localStorage.setItem('lang', lang);

      // ✅ Delay to ensure cookie is written
      setTimeout(() => {
        window.location.reload();
      }, 200); // even 100ms can work, but 200ms is safer
    } catch (error) {
      console.error('Language change failed:', error);
    }
  };


  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          {/* Logo and primary navigation */}
          <div className="flex flex-1">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="p-1.5 rounded mr-2">
                  {/* <Shield className="h-5 w-5" /> */}
                  <Image src="/vms-logo.jpg" width={65} height={65} alt="img" className='object-cover w-10 h-10 md:w-16 md:h-16' />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-blue-800">FV VMS</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-4 lg:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${isActive('/')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
              >
                <Home className="mr-1.5 h-4 w-4" />
                <span>Home</span>
              </Link>

              <Link
                href="/check-in"
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${isActive('/check-in')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                <span>New Visitor</span>
              </Link>

              <Link
                href="/been-here-before"
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${isActive('/been-here-before')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
              >
                <User className="mr-1.5 h-4 w-4" />
                <span>Return Visitor</span>
              </Link>

              <Link
                href="/check-out"
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${isActive('/check-out')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                <span>Check Out</span>
              </Link>
            </div>
          </div>

          {/* Secondary navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <span>English</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {languageOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => handleLanguageChange('en')}>English</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => handleLanguageChange('fr')}>Français</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => handleLanguageChange('es')}>Español</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => handleLanguageChange('de')}>Deutsch</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => handleLanguageChange('it')}>Italiano</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => handleLanguageChange('zh')}>中文</button>
                  </div>
                </div>
              )}
            </div>

            {/* Auth buttons */}
            {showAuthButtons && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-100 border border-blue-100 shadow-sm transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0) || ''}
                      </div>
                      <span className="font-medium">{user.firstName || 'User'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {userMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                          {user?.role === 'admin' && (
                            <>
                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                                Admin
                              </div>
                              <Link
                                href="/admin/dashboard"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="flex items-center">
                                  <LayoutDashboard className="mr-2 h-4 w-4" />
                                  Dashboard
                                </div>
                              </Link>
                              <Link
                                href="/admin/visitors"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="flex items-center">
                                  <User className="mr-2 h-4 w-4" />
                                  Visitors
                                </div>
                              </Link>
                              <Link
                                href="/admin/access-control"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="flex items-center">
                                  <QrCode className="mr-2 h-4 w-4" />
                                  Access Control
                                </div>
                              </Link>
                              <Link
                                href="/admin/documents"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="flex items-center">
                                  <FileText className="mr-2 h-4 w-4" />
                                  Documents
                                </div>
                              </Link>
                              <Link
                                href="/admin/training"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="flex items-center">
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  Training
                                </div>
                              </Link>
                              <Link
                                href="/admin/group"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="flex items-center">
                                  <Group className="mr-2 h-4 w-4" />
                                  Group
                                </div>
                              </Link>
                              <Link
                                href="/admin/analytics"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="flex items-center">
                                  <BarChart2 className="mr-2 h-4 w-4" />
                                  Analytics
                                </div>
                              </Link>
                              <Link
                                href="/admin/users"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="flex items-center">
                                  <Users className="mr-2 h-4 w-4" />
                                  Users
                                </div>
                              </Link>
                              <Link
                                href="/admin/settings"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="flex items-center">
                                  <Settings className="mr-2 h-4 w-4" />
                                  Settings
                                </div>
                              </Link>
                              <div className="border-t border-gray-100 my-1"></div>
                            </>
                          )}
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              Profile
                            </div>
                          </Link>
                          <button type='button'
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <div className="flex items-center">
                              <LogOut className="mr-2 h-4 w-4" />
                              Logout
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="text-blue-700 hover:text-blue-800 px-4 py-2 rounded-md text-sm font-medium border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all text-sm font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-700 hover:bg-blue-50 focus:outline-none"
            >
              {menuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 px-2">
            <Link
              href="/"
              className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${isActive('/')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'
                }`}
              onClick={() => setMenuOpen(false)}
            >
              <Home className="mr-3 h-5 w-5" />
              Home
            </Link>
            <Link
              href="/check-in"
              className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${isActive('/check-in')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'
                }`}
              onClick={() => setMenuOpen(false)}
            >
              <UserPlus className="mr-3 h-5 w-5" />
              New Visitor
            </Link>
            <Link
              href="/been-here-before"
              className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${isActive('/been-here-before')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'
                }`}
              onClick={() => setMenuOpen(false)}
            >
              <User className="mr-3 h-5 w-5" />
              Return Visitor
            </Link>
            <Link
              href="/check-out"
              className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${isActive('/check-out')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'
                }`}
              onClick={() => setMenuOpen(false)}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Check Out
            </Link>
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0) || ''}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {user?.role === 'admin' && (
                    <>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                        Admin
                      </div>
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <LayoutDashboard className="mr-2 h-5 w-5" />
                          Dashboard
                        </div>
                      </Link>
                      <Link
                        href="/admin/visitors"
                        className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <User className="mr-2 h-5 w-5" />
                          Visitors
                        </div>
                      </Link>
                      <Link
                        href="/admin/access-control"
                        className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <QrCode className="mr-2 h-5 w-5" />
                          Access Control
                        </div>
                      </Link>
                      <Link
                        href="/admin/documents"
                        className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <FileText className="mr-2 h-5 w-5" />
                          Documents
                        </div>
                      </Link>
                      <Link
                        href="/admin/training"
                        className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <BookOpen className="mr-2 h-5 w-5" />
                          Training
                        </div>
                      </Link>
                      <Link
                        href="/admin/group"
                        className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Group className="mr-2 h-5 w-5" />
                          Group
                        </div>
                      </Link>
                      <Link
                        href="/admin/analytics"
                        className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <BarChart2 className="mr-2 h-5 w-5" />
                          Analytics
                        </div>
                      </Link>
                      <Link
                        href="/admin/users"
                        className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Users className="mr-2 h-5 w-5" />
                          Users
                        </div>
                      </Link>
                      <Link
                        href="/admin/settings"
                        className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Settings className="mr-2 h-5 w-5" />
                          Settings
                        </div>
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                    </>
                  )}

                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Profile
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <div className="flex items-center">
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-2 px-2">
                <Link
                  href="/login"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50 border border-blue-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="mr-3 h-5 w-5" />
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium bg-blue-700 text-white hover:bg-blue-800"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserPlus className="mr-3 h-5 w-5" />
                  Sign Up
                </Link>
              </div>
            )}

            <div className="mt-3 px-2 space-y-1 border-t border-gray-200 pt-3">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className="flex justify-between w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                <span>Language: English</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              {languageOpen && (
                <div className="pl-3 space-y-1">
                  <button onClick={() => handleLanguageChange("en")} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">English</button>
                  <button onClick={() => handleLanguageChange("fr")} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Français</button>
                  <button onClick={() => handleLanguageChange("es")} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Español</button>
                  <button onClick={() => handleLanguageChange("de")} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Deutsch</button>
                  <button onClick={() => handleLanguageChange("it")} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Italiano</button>
                  <button onClick={() => handleLanguageChange("zh")} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">中文</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
