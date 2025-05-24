import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { signInAdmin, sendAdminPasswordReset } from "../lib/authService";

interface SecureLoginProps {
  onLogin: () => void;
}

export function SecureLogin({ onLogin }: SecureLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      await signInAdmin(email, password);
      onLogin();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");
    setError("");
    setResetLoading(true);

    if (!resetEmail) {
      setError("Please enter your email address");
      setResetLoading(false);
      return;
    }

    try {
      await sendAdminPasswordReset(resetEmail);
      setResetMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage("");
        setResetEmail("");
      }, 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400">
        <form
          onSubmit={handleForgotPassword}
          className="bg-white rounded-xl px-8 py-10 shadow-xl flex flex-col items-center w-96 border border-purple-200"
        >
          <h1 className="text-3xl font-bold mb-2 text-purple-700">Reset Password</h1>
          <p className="text-gray-600 mb-6 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2 w-full">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {resetMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2 w-full">
              <CheckCircle size={16} />
              <span className="text-sm">{resetMessage}</span>
            </div>
          )}

          <div className="relative w-full mb-4">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              value={resetEmail}
              placeholder="Enter your email address"
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
              disabled={resetLoading}
            />
          </div>

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError("");
                setResetMessage("");
                setResetEmail("");
              }}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={resetLoading}
            >
              Back to Login
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg font-bold hover:scale-105 shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={resetLoading}
            >
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl px-8 py-10 shadow-xl flex flex-col items-center w-96 border border-purple-200"
      >
        <h1 className="text-3xl font-bold mb-2 text-purple-700">Admin Login</h1>
        <p className="text-gray-600 mb-6">Secure access to KidzZone Admin</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2 w-full">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="relative w-full mb-4">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
            disabled={loading}
          />
        </div>

        <div className="relative w-full mb-4">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-lg border border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg font-bold hover:scale-105 shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
          disabled={loading}
        >
          Forgot your password?
        </button>
      </form>
    </div>
  );
}
