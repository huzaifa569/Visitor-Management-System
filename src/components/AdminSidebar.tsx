'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BookOpen,
  Bell,
  BarChart,
  Shield,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  QrCode,
  Group
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    visitors: false,
    settings: false,
  });
  const pathname = usePathname();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar');
      const toggle = document.getElementById('sidebar-toggle');

      if (isOpen &&
          sidebar &&
          toggle &&
          !sidebar.contains(event.target as Node) &&
          !toggle.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Visitors',
      href: '#',
      icon: <Users className="h-5 w-5" />,
      children: [
        {
          title: 'All Visitors',
          href: '/admin/visitors',
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: 'Visit History',
          href: '/admin/visitors/history',
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: 'Documents',
          href: '/admin/documents',
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Access Control",
      href: "/admin/access-control",
      icon: <QrCode className='h-4 w-4' />
    },
    {
      title: 'Training',
      href: '/admin/training',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: 'Group',
      href: '/admin/group',
      icon: <Group className="h-5 w-5" />,
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '#',
      icon: <Settings className="h-5 w-5" />,
      children: [
        {
          title: 'System Settings',
          href: '/admin/settings',
          icon: <Settings className="h-4 w-4" />,
        },
        {
          title: 'Notifications',
          href: '/admin/settings/notifications',
          icon: <Bell className="h-4 w-4" />,
        },
        {
          title: 'Security',
          href: '/admin/settings/security',
          icon: <Shield className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        id="sidebar-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-md text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-controls="admin-sidebar"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
      </button>

      {/* Sidebar */}
      <div
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-30 w-[85%] sm:w-72 md:w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Admin navigation"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Admin Panel</h2>
            <button
              className="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-3 sm:py-4 px-3">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <div key={item.title}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleGroup(item.title.toLowerCase())}
                        className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-md group ${
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-expanded={expandedGroups[item.title.toLowerCase()]}
                        aria-controls={`${item.title.toLowerCase()}-group`}
                      >
                        <div className="flex items-center">
                          <span className="mr-3 text-gray-500 group-hover:text-gray-600 flex-shrink-0" aria-hidden="true">
                            {item.icon}
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>
                        {expandedGroups[item.title.toLowerCase()] ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        )}
                      </button>
                      {expandedGroups[item.title.toLowerCase()] && (
                        <div id={`${item.title.toLowerCase()}-group`} className="mt-1 pl-6 sm:pl-8 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.title}
                              href={child.href}
                              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                                isActive(child.href)
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                              aria-current={isActive(child.href) ? 'page' : undefined}
                            >
                              <span className="mr-3 text-gray-500 flex-shrink-0" aria-hidden="true">
                                {child.icon}
                              </span>
                              <span className="truncate">{child.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      <span className="mr-3 text-gray-500 flex-shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="p-3 sm:p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">Admin User</p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
