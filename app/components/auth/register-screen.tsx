"use client";

import React from "react";
import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";

export const RegisterScreen = () => {
  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background Split */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-[#F3E038]" />
        <div className="w-1/2 bg-[#FF7352]" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="text-6xl font-bold mb-12 text-white flex">
          <span className="text-white">KE</span>
          <span className="text-white">TU</span>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Create Account
          </h2>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7352] pl-10"
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7352] pl-10"
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7352] pl-10"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF7352] text-white py-3 rounded-xl font-medium hover:bg-[#ff8668] transition-colors"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <img src="/google.svg" alt="Google" className="w-6 h-6" />
              </button>
              <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <img src="/apple.svg" alt="Google" className="w-6 h-6" />
              </button>
              <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <img src="/telegram.svg" alt="Telegram" className="w-6 h-6" />
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#FF7352] font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
