import React from 'react';

const InvoicePDF = React.forwardRef(({ invoice }, ref) => {
    if (!invoice) return null;

    // Professional Black & White / Grayscale Palette
    const colors = {
        white: '#ffffff',
        black: '#000000',
        gray50: '#f9fafb',
        gray100: '#f3f4f6',
        gray200: '#e5e7eb',
        gray300: '#d1d5db',
        gray400: '#9ca3af',
        gray500: '#6b7280',
        gray600: '#4b5563',
        gray700: '#374151',
        gray800: '#1f2937',
        gray900: '#111827'
    };

    return (
        <div style={{
            position: 'absolute',
            top: '-10000px',
            left: 0,
            width: '210mm',
            height: '1px',
            overflow: 'visible',
            pointerEvents: 'none',
            zIndex: -1
        }}>
            <div
                ref={ref}
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    margin: '0 auto',
                    padding: '60px',
                    backgroundColor: colors.white,
                    color: colors.black,
                    fontFamily: 'serif', // Serif font for a more professional/classic look
                    position: 'relative',
                    boxSizing: 'border-box'
                }}
            >
                {/* Header Section */}
                <div style={{ borderBottom: `2px solid ${colors.black}`, paddingBottom: '30px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 5px 0' }}>Vikalp Electronics</h1>
                        <p style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '4px', color: colors.gray600, margin: 0 }}>Sales & Service Specialist</p>
                        <p style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '4px', color: colors.gray600, margin: 0 }}>Address: Murlidhar Nagar 1, Gokul Nagar, Jamnagar-361004 </p>
                        <p style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '4px', color: colors.gray600, margin: 0 }}>Mo:+91 9374170929 / +91 7016223029 </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '48px', fontWeight: '900', color: colors.gray200, textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>Invoice</h2>
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '50px' }}>
                    <div>
                        <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', borderBottom: `1px solid ${colors.gray200}`, paddingBottom: '8px', marginBottom: '15px', color: colors.gray800 }}>Bill To:</h3>
                        <p style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 5px 0' }}>{invoice.customer?.name}</p>
                        <p style={{ fontSize: '13px', color: colors.gray700, lineHeight: '1.6', margin: '0 0 8px 0' }}>{invoice.customer?.address}</p>
                        <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>Phone: {invoice.mobile}</p>
                    </div>
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', borderBottom: `1px solid ${colors.gray200}`, paddingBottom: '8px', marginBottom: '10px', color: colors.gray800 }}>Invoice Details:</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                                <span style={{ color: colors.gray500 }}>Invoice Number:</span>
                                <span style={{ fontWeight: '700' }}>#{invoice.invoiceNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: colors.gray500 }}>Date:</span>
                                <span style={{ fontWeight: '700' }}>{new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                        <div style={{ backgroundColor: colors.gray50, padding: '15px', borderLeft: `4px solid ${colors.black}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Amount Due:</span>
                                <span style={{ fontSize: '20px', fontWeight: '900' }}>₹ {invoice.grandTotal?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                    <thead>
                        <tr style={{ borderBottom: `2px solid ${colors.black}` }}>
                            <th style={{ textAlign: 'left', padding: '15px 10px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Service Description</th>
                            <th style={{ textAlign: 'center', padding: '15px 10px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '15px 10px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Unit Price</th>
                            <th style={{ textAlign: 'right', padding: '15px 10px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: `1px solid ${colors.gray100}` }}>
                                <td style={{ padding: '20px 10px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 3px 0' }}>{item.serviceName}</p>
                                    <p style={{ fontSize: '11px', color: colors.gray500, margin: 0 }}>Professional Electronic Service & Maintenance</p>
                                </td>
                                <td style={{ textAlign: 'center', padding: '20px 10px', fontSize: '14px' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right', padding: '20px 10px', fontSize: '14px' }}>₹ {item.unitPrice?.toLocaleString()}</td>
                                <td style={{ textAlign: 'right', padding: '20px 10px', fontSize: '14px', fontWeight: '700' }}>₹ {item.lineTotal?.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary Section */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '60px' }}>
                    <div style={{ width: '250px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${colors.gray100}`, fontSize: '13px' }}>
                            <span style={{ color: colors.gray500 }}>Subtotal</span>
                            <span>₹ {invoice.subtotal?.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${colors.gray100}`, fontSize: '13px' }}>
                            <span style={{ color: colors.gray500 }}>Tax (GST)</span>
                            <span>₹ {invoice.gstTotal?.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '18px', fontWeight: '900' }}>
                            <span>Grand Total</span>
                            <span>₹ {invoice.grandTotal?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Notes */}
                <div style={{ borderTop: `1px solid ${colors.gray100}`, paddingTop: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                        <div>
                            <h4 style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px' }}>Notes & Instructions:</h4>
                            <p style={{ fontSize: '12px', color: colors.gray600, lineHeight: '1.6', margin: 0 }}>
                                1. This is a computer generated invoice and does not require a physical signature.<br />
                                2. Service warranty applies as per company policy from the date of invoice.<br />
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
});

export default InvoicePDF;
