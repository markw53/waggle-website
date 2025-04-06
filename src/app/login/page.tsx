"use client";
import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  interface LoginFormValues {
    email: string;
    password: string;
  }

  interface LoginEvent extends React.FormEvent<HTMLFormElement> {}

  const handleLogin = (e: LoginEvent): void => {
    e.preventDefault();
    // Add your login logic here
    if (!email || !password) {
      setError('Please fill in all fields');
    } else {
      setError('');
      console.log('Logging in with:', email, password);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/waggle-background.png')" }}
    >
      <div className="bg-white border border-gray-300 rounded-xl shadow-xl p-10 w-[450px] mt-24">
        <h1 className="text-3xl font-semibold text-center mb-8">Welcome to Waggle!</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-sm text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-indigo-500 text-sm hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        {/* Google Sign-In */}
        <button
          className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          onClick={() => console.log('Google login')}
        >
          <FcGoogle size={24} />
          <span className="text-sm font-medium">Continue with Google</span>
        </button>

        {/* Signup */}
        <div className="text-center mt-6 text-sm">
          <span>Don't have an account? </span>
          <Link href="/signup" className="text-indigo-500 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-center text-black bg-[#E2B007] px-6 py-2 rounded-md shadow">
        &copy; 2025 Waggle | Devon's Digital Solutions
      </footer>
    </div>
  );
}
