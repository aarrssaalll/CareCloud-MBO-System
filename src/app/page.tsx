"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 20, y: 20 });

  useEffect(() => {
    setMounted(true);

    // Smooth spotlight animation
    const spotlightInterval = setInterval(() => {
      setSpotlightPosition(prev => {
        // Calculate next position in a smooth figure-8 pattern
        const time = Date.now() / 3000; // Slower movement
        const x = 50 + Math.sin(time) * 30; // Move between 20% and 80%
        const y = 50 + Math.sin(time * 1.5) * 25; // Move between 25% and 75%
        return { x, y };
      });
    }, 50);

    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(spotlightInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a3d] via-[#003366] to-[#002244] relative overflow-hidden">
      
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[#004E9E]/40 rounded-full mix-blend-lighten filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-[#007BFF]/30 rounded-full mix-blend-lighten filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-[#0066CC]/35 rounded-full mix-blend-lighten filter blur-3xl opacity-55 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Moving Spotlight Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full transition-all duration-1000 ease-out"
          style={{
            left: `${spotlightPosition.x}%`,
            top: `${spotlightPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(0, 123, 255, 0.15) 0%, rgba(0, 78, 158, 0.08) 30%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full transition-all duration-700 ease-out"
          style={{
            left: `${spotlightPosition.x}%`,
            top: `${spotlightPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(0, 102, 204, 0.2) 0%, rgba(0, 123, 255, 0.1) 40%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
      </div>

      {/* Dynamic Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.12]">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 123, 255, 0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 123, 255, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        
        {/* Professional Header */}
        <div className={`text-center mb-16 max-w-4xl transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          
          
          
          {/* CareCloud Logo */}
          <div className="mb-8 flex justify-center items-center animate-fade-in">
            <img 
              src="/carecloud-logo.png" 
              alt="CareCloud Logo" 
              className="h-20 w-auto drop-shadow-2xl"
            />
          </div>
          
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent mx-auto mb-6 rounded-full animate-expand"></div>
          
          <p className="text-2xl text-blue-200 font-light tracking-wide mb-8 animate-slide-up">
            Management by Objectives System
          </p>

          <p className="text-blue-100 max-w-2xl mx-auto leading-relaxed mb-12 text-lg animate-slide-up animation-delay-200">
            Transform our organization's performance management with intelligent objective tracking, 
            AI-powered analytics, and comprehensive reporting solutions.
          </p>
        </div>

        {/* Professional Call-to-Action */}
        <div className={`relative group transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Subtle Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#004E9E]/30 to-[#007BFF]/30 rounded-2xl opacity-40 blur-md group-hover:opacity-60 transition-opacity duration-500"></div>
          
          {/* Main Button with Subtle Gradient */}
          <Link href="/login">
            <button className="relative px-10 py-5 bg-gradient-to-r from-[#003d7a] to-[#005bb5] text-white font-medium rounded-2xl shadow-lg shadow-blue-900/40 transform transition-all duration-300 hover:scale-105 hover:shadow-blue-800/50 border border-blue-500/20 group-hover:border-blue-400/30 backdrop-blur-sm">
              <span className="flex items-center space-x-3">
                <span className="text-lg tracking-wide">Begin Your Journey</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </Link>
        </div>

        {/* Professional Features */}
        <div className={`mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          
          <div className="group text-center p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl border border-blue-500/20 hover:border-blue-400/40 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-200 transition-colors">Objective Tracking</h3>
            <p className="text-blue-100 text-sm leading-relaxed">Comprehensive goal management with AI-powered insights</p>
          </div>

          <div className="group text-center p-8 bg-gradient-to-br from-[#002244]/60 to-[#001a3d]/70 backdrop-blur-lg rounded-2xl border border-[#007BFF]/30 hover:border-[#007BFF]/60 shadow-xl hover:shadow-2xl hover:shadow-[#007BFF]/30 transition-all duration-500 hover:-translate-y-2 md:translate-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-200 transition-colors">Performance Analytics</h3>
            <p className="text-blue-100 text-sm leading-relaxed">Advanced reporting and trend analysis</p>
          </div>

          <div className="group text-center p-8 bg-gradient-to-br from-[#002244]/60 to-[#001a3d]/70 backdrop-blur-lg rounded-2xl border border-[#007BFF]/30 hover:border-[#007BFF]/60 shadow-xl hover:shadow-2xl hover:shadow-[#007BFF]/30 transition-all duration-500 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#004E9E] to-[#007BFF] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-200 transition-colors">Role-Based Access</h3>
            <p className="text-blue-100 text-sm leading-relaxed">Secure, scalable user management system</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expand {
          from { width: 0; opacity: 0; }
          to { width: 8rem; opacity: 1; }
        }
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(200%); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fade-in 1.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animate-expand {
          animation: expand 1.5s ease-out 0.5s;
          animation-fill-mode: forwards;
          width: 0;
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
