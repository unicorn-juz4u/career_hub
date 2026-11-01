// client/src/pages/NotFound.jsx
// 404 Not Found Page
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-indigo-400 mb-4 border border-slate-700">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-400 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
}
