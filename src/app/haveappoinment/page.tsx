"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button" // Assuming the Button component is in the src/components directory
import { ChevronDown, Menu } from 'lucide-react';

export default function VisitorForm() {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-purple-50 to-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 shadow bg-white relative">
        <div className="text-2xl font-bold text-blue-900">
          <span className="text-blue-500">Q</span>uick<span className="text-blue-500">P</span>ass
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center relative">
          <a href="#" className="text-gray-700 hover:text-blue-700 font-medium">Have Appointment</a>
          <a href="#" className="text-gray-700 hover:text-blue-700 font-medium">Been here Before</a>
          <div className="relative">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-700 font-medium"
            >
              <span>GB English</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {languageOpen && (
              <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg z-10">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">GB English</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">FR Français</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ES Español</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">DE Deutsch</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">IT Italiano</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ZH 中文</li>
              </ul>
            )}
          </div>
          <Button className="bg-blue-900 text-white px-6 py-2 rounded-full shadow">Login</Button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          {menuOpen && (
            <div className="absolute top-full right-4 mt-2 bg-white border border-gray-200 rounded-md shadow-lg w-48 z-10 p-2">
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Have Appointment</a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Been here Before</a>
              <div className="border-t my-2"></div>
              <div className="relative">
                <button
                  onClick={() => setLanguageOpen(!languageOpen)}
                  className="flex items-center w-full justify-between px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <span>GB English</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {languageOpen && (
                  <ul className="mt-2 bg-white border border-gray-300 rounded shadow-lg">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">GB English</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">FR Français</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ES Español</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">DE Deutsch</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">IT Italiano</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">ZH 中文</li>
                  </ul>
                )}
              </div>
              <Button className="mt-2 w-full bg-blue-900 text-white rounded-full">Login</Button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row">
        {/* Left side form section */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-6">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center md:text-left">Pre Registered Visitor Details</h1>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visitor's Email or Phone or NID<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Enter Email, Phone or NID"
            />
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full shadow w-full">Cancel</Button>
              <Button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-full shadow w-full">Continue</Button>
            </div>
          </div>
        </div>

        {/* Right side image section */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center space-y-6 p-6">
          <img
            src="/building.jpeg"
            alt="Building"
            className="rounded-3xl w-3/4 shadow-lg"
          />
          <img
            src="/discussion.jpeg"
            alt="Discussion"
            className="rounded-3xl w-3/4 shadow-lg"
          />
        </div>
      </div>

      {/* Responsive images for small screens */}
      <div className="md:hidden w-full px-6 pt-6 space-y-4">
        <img
          src="/building.jpeg"
          alt="Building"
          className="rounded-3xl w-full shadow-lg"
        />
        <img
          src="/discussion.jpeg"
          alt="Discussion"
          className="rounded-3xl w-full shadow-lg"
        />
      </div>
    </div>
  );
}
