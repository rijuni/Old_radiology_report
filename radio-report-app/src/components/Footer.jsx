import React from 'react';

export default function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-red-400 via-brand-footer to-red-400 text-white text-center py-1.5 font-bold z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-red-300">
            <marquee>Use of this application is governed by hospital IT policies</marquee>
        </footer>
    );
}
