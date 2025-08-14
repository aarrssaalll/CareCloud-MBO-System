"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);

  useEffect(() => {
    // Generate sophisticated particle system
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 80; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.8 + 0.2,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();

    // Smooth particle animation
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y <= -5 ? 105 : particle.y - particle.speed,
        opacity: particle.y > 95 ? 0 : particle.y < 5 ? particle.y / 5 : particle.opacity,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      
      {/* Sophisticated Particle System */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
            }}
          >
            {/* Shooting star effect */}
            <div className="relative">
              <div 
                className="bg-white rounded-full"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                }}
              />
              <div 
                className="absolute top-0 left-0 bg-gradient-to-t from-transparent to-white rounded-full"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size * 8}px`,
                  transform: 'translateY(-100%)',
                  opacity: 0.3,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        
        {/* Professional Header */}
        <div className="text-center mb-16 max-w-4xl">
          
          {/* Corporate Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-8 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          {/* Professional Branding */}
          <h1 className="text-5xl md:text-6xl font-light text-white mb-4 tracking-wide">
            CareCloud
          </h1>
          
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mb-6"></div>
          
          <p className="text-xl text-slate-300 font-light tracking-wide mb-8">
            Management by Objectives System
          </p>

          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
            Transform your organization's performance management with intelligent objective tracking, 
            AI-powered analytics, and comprehensive reporting solutions.
          </p>
        </div>

        {/* Professional Call-to-Action */}
        <div className="relative">
          {/* Subtle Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl opacity-20 blur-sm"></div>
          
          {/* Main Button */}
          <Link href="/login">
            <button className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-blue-500/30">
              <span className="flex items-center space-x-3">
                <span>Begin Your Journey</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </Link>
        </div>

        {/* Professional Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          
          <div className="text-center p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Objective Tracking</h3>
            <p className="text-slate-400 text-sm">Comprehensive goal management with AI-powered insights</p>
          </div>

          <div className="text-center p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Performance Analytics</h3>
            <p className="text-slate-400 text-sm">Advanced reporting and trend analysis</p>
          </div>

          <div className="text-center p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Role-Based Access</h3>
            <p className="text-slate-400 text-sm">Secure, scalable user management system</p>
          </div>
        </div>
      </div>
    </div>
  );
}
