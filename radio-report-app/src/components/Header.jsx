import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
    return (
        <header>
            <div className="flex justify-between items-center px-6 py-3 bg-brand-header shadow-sm relative z-50">
                {/* Left Side: KIMS Logo */}
                <div className="flex items-center">
                    <Link to="/">
                        <img src="/image/kims_logo.png" alt="KIMS Logo" className="w-[180px] hover:opacity-90 transition-opacity" />
                    </Link>
                </div>

                {/* Right Side: Radiology Logo */}
                <div className="flex items-center gap-6">
                    <img src="/image/radiology_logo.png" alt="Radiology" className="w-[100px] h-auto object-contain hidden md:block opacity-90" />
                </div>
            </div>

            <div className="text-center font-bold p-1.5 bg-brand-alert-bg text-brand-alert-text animate-blink text-sm shadow-inner tracking-wide">
                ⚠ Only Older Reports are Available for Viewing
            </div>
        </header>
    );
}
