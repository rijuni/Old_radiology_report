import React from 'react';

export default function Footer() {
    return (
        <footer
            style={{
                background: '#0f172a',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                marginTop: 'auto',
            }}
        >
            <div className="max-w-screen-xl mx-auto px-5 py-3 flex justify-center">
                <p className="text-xs font-medium" style={{ color: '#64748b' }}>
                    © 2026 KIMS ICT Cell — Old Radiology Reporting System
                </p>
                <p className="text-xs font-medium" style={{ color: '#435164ff' }}>
                    (Authorized use only)
                </p>
            </div>
        </footer>
    );
}
