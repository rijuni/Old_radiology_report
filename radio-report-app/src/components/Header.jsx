import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
    return (
        <header>
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-brand-header to-teal-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] relative z-50 border-b border-teal-200/50">
                {/* Left Side: KIMS Logo */}
                <div className="flex items-center">
                    <Link to="/" className="transform hover:scale-105 transition-transform duration-200 drop-shadow-md">
                        <img src="/image/kims_logo.png" alt="KIMS Logo" className="w-[180px]" />
                    </Link>
                </div>

                {/* Right Side: Radiology Logo */}
                <div className="flex items-center gap-6">
                    <img src="/image/radiology_logo.png" alt="Radiology" className="w-[100px] h-auto object-contain hidden md:block opacity-90 drop-shadow-sm" />
                </div>
            </div>

            <div className="text-center font-bold p-1.5 bg-gradient-to-r from-red-100 via-brand-alert-bg to-red-100 text-brand-alert-text animate-blink text-sm shadow-inner tracking-wide border-b border-red-200">
                ⚠ Only Older Reports are Available for Viewing
            </div>
        </header>
    );
}
