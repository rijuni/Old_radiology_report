import React from 'react';

export default function Footer() {
    return (
        <footer
            style={{
                background: '#1e293b',
                borderTop: '1px solid #0f172a',
                marginTop: 'auto',
            }}
        >
            <div className="max-w-screen-xl mx-auto px-5 py-3 flex items-center justify-between">
                <p className="text-xs font-medium" style={{ color: '#64748b' }}>
                    © 2026 KIMS ICT Cell — Old Radiology Reporting System
                </p>
                <p className="text-xs font-medium" style={{ color: '#334155' }}>
                    Authorized use only
                </p>
            </div>
        </footer>
    );
}
