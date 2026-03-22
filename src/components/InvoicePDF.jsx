import React from "react";

const InvoicePDF = React.forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const colors = {
    border: "#000000",
    text: "#000000",
    lightText: "#666666",
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date || date === '-') return '-';
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    }).replace(/ /g, '-');
  };

  const numberToWords = (num) => {
    const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
    const b = ['', '', 'TWENTY ', 'THIRTY ', 'FORTY ', 'FIFTY ', 'SIXTY ', 'SEVENTY ', 'EIGHTY ', 'NINETY '];
    const format = (n) => {
      if (n < 20) return a[n];
      const digit = n % 10;
      if (n < 100) return b[Math.floor(n / 10)] + (digit ? a[digit] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + 'HUNDRED ' + (n % 100 ? 'AND ' + format(n % 100) : '');
      if (n < 100000) return format(Math.floor(n / 1000)) + 'THOUSAND ' + (n % 1000 ? format(n % 1000) : '');
      if (n < 10000000) return format(Math.floor(n / 100000)) + 'LAKH ' + (n % 100000 ? format(n % 100000) : '');
      return format(Math.floor(n / 10000000)) + 'CRORE ' + (n % 10000000 ? format(n % 10000000) : '');
    };
    const split = Math.abs(num).toFixed(2).split('.');
    let words = format(parseInt(split[0])) + 'RUPEES ';
    if (split[1] && parseInt(split[1]) > 0) {
      words += 'AND ' + format(parseInt(split[1])) + 'PAISE ';
    }
    return words + 'ONLY';
  };

  const totalQty = invoice.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div
      style={{
        width: "210mm",
        backgroundColor: "#ffffff",
        fontFamily: "'Times New Roman', serif",
        color: colors.text,
        margin: "0 auto",
      }}
    >
      <div
        ref={ref}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "10mm",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "5px" }}>
          Tax invoice
        </div>

        {/* Top Header Grid */}
        <div style={{ border: `1px solid ${colors.border}`, display: "flex", fontSize: "12px" }}>
          {/* Seller Info */}
          <div style={{ flex: 1, borderRight: `1px solid ${colors.border}`, padding: "8px" }}>
            <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>Vikalp Electric & Refrigeration</div>
            <div style={{ fontSize: "11px", lineHeight: "1.3" }}>
              Street No.3, Murlidhar Nagar 1,<br />
              Gokul Nagar,<br />
              Jamnagar - 361004.<br />
              MO : 9374170929 / 7016223029<br />
              <strong>GSTIN/UIN: ----------------</strong><br />
              State Name : Gujarat, Code : 24<br />
              E-Mail : vikalpelectronicofficial@gmail.com
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {[
              ["Invoice No.", invoice.invoiceNumber, "Dated", formatDate(invoice.invoiceDate)],
              ["Delivery Note", invoice.deliveryNote || "-", "Mode/Terms of Payment", invoice.modeTermsOfPayment || "-"],
              ["Reference No. & Date.", invoice.referenceNoAndDate || "-", "Other References", invoice.otherReferences || "-"],
              ["Dispatch Doc No.", invoice.dispatchDocNo || "-", "Delivery Note Date", formatDate(invoice.deliveryNoteDate)],
              ["Dispatched through", invoice.dispatchedThrough || "-", "Destination", invoice.destination || "-"],
            ].map((row, idx) => (
              <div key={idx} style={{ flex: 1, display: "flex", borderBottom: idx < 4 ? `1px solid ${colors.border}` : "none" }}>
                <div style={{ flex: 1, borderRight: `1px solid ${colors.border}`, padding: "4px" }}>
                  <div style={{ fontSize: "8px", color: colors.lightText }}>{row[0]}</div>
                  <div style={{ fontWeight: "bold" }}>{row[1]}</div>
                </div>
                <div style={{ flex: 1, padding: "4px" }}>
                  <div style={{ fontSize: "8px", color: colors.lightText }}>{row[2]}</div>
                  <div style={{ fontWeight: "bold" }}>{row[3]}</div>
                </div>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${colors.border}`, padding: "4px" }}>
              <div style={{ fontSize: "8px", color: colors.lightText }}>Terms of Delivery</div>
              <div style={{ fontWeight: "bold" }}>{invoice.termsOfDelivery || "-"}</div>
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        <div style={{ borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, padding: "8px", fontSize: "12px" }}>
          <div style={{ fontSize: "10px", color: colors.lightText }}>Buyer (Bill to)</div>
          <div style={{ fontSize: "14px", fontWeight: "bold", margin: "4px 0" }}>{invoice.customer?.name || "N/A"}</div>
          <div style={{ fontSize: "11px", marginBottom: "4px" }}>{invoice.customer?.address || "Jamnagar"}</div>
          <div style={{ fontSize: "11px" }}>State Name : Gujarat, Code : 24</div>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: "#f9fafb" }}>
              <th style={{ borderRight: `1px solid ${colors.border}`, padding: "6px 4px", width: "35px" }}>Sl No</th>
              <th style={{ borderRight: `1px solid ${colors.border}`, padding: "6px 4px", textAlign: "left" }}>Description of Goods</th>
              <th style={{ borderRight: `1px solid ${colors.border}`, padding: "6px 4px", width: "65px" }}>HSN/SAC</th>
              <th style={{ borderRight: `1px solid ${colors.border}`, padding: "6px 4px", width: "45px" }}>GST %</th>
              <th style={{ borderRight: `1px solid ${colors.border}`, padding: "6px 4px", width: "65px" }}>Quantity</th>
              <th style={{ borderRight: `1px solid ${colors.border}`, padding: "6px 4px", width: "75px" }}>Rate</th>
              <th style={{ borderRight: `1px solid ${colors.border}`, padding: "6px 4px", width: "35px" }}>per</th>
              <th style={{ borderRight: `1px solid ${colors.border}`, padding: "6px 4px", width: "45px" }}>Disc %</th>
              <th style={{ padding: "6px 4px", textAlign: "right", width: "85px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} style={{ minHeight: "30px", verticalAlign: "top" }}>
                <td style={{ borderRight: `1px solid ${colors.border}`, padding: "8px 4px", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ borderRight: `1px solid ${colors.border}`, padding: "8px 4px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "12px" }}>{item.serviceName}</div>
                </td>
                <td style={{ borderRight: `1px solid ${colors.border}`, padding: "8px 4px", textAlign: "center" }}>{item.hsnCode || "-"}</td>
                <td style={{ borderRight: `1px solid ${colors.border}`, padding: "8px 4px", textAlign: "center" }}>{item.gstPercent}%</td>
                <td style={{ borderRight: `1px solid ${colors.border}`, padding: "8px 4px", textAlign: "center" }}><strong>{item.quantity} {item.per || 'Pcs'}</strong></td>
                <td style={{ borderRight: `1px solid ${colors.border}`, padding: "8px 4px", textAlign: "right" }}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ borderRight: `1px solid ${colors.border}`, padding: "8px 4px", textAlign: "center" }}>{item.per || 'Pcs'}</td>
                <td style={{ borderRight: `1px solid ${colors.border}`, padding: "8px 4px", textAlign: "center" }}>{item.discount > 0 ? `${item.discount}%` : "-"}</td>
                <td style={{ padding: "8px 4px", textAlign: "right" }}><strong>{formatCurrency(item.lineTotal)}</strong></td>
              </tr>
            ))}

            {/* Tax and Totals Spacer */}
            <tr style={{ height: "120px" }}>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ borderRight: `1px solid ${colors.border}`, padding: "10px", textAlign: "right", verticalAlign: "bottom" }}>
                <div style={{ fontStyle: "italic", fontSize: "10px" }}>
                  <div>CGST Output @ {(invoice.items[0]?.gstPercent || 18) / 2}%</div>
                  <div>SGST Output @ {(invoice.items[0]?.gstPercent || 18) / 2}%</div>
                </div>
              </td>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ borderRight: `1px solid ${colors.border}`, textAlign: "right", verticalAlign: "bottom", paddingBottom: "10px", fontSize: "10px" }}>
                <div>{(invoice.items[0]?.gstPercent || 18) / 2}%</div>
                <div>{(invoice.items[0]?.gstPercent || 18) / 2}%</div>
              </td>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ textAlign: "right", verticalAlign: "bottom", padding: "10px" }}>
                <div>{formatCurrency(invoice.gstTotal / 2)}</div>
                <div>{formatCurrency(invoice.gstTotal / 2)}</div>
              </td>
            </tr>

            {/* Total Row */}
            <tr style={{ borderTop: `1px solid ${colors.border}`, fontWeight: "bold", backgroundColor: "#f9fafb" }}>
              <td colSpan="2" style={{ borderRight: `1px solid ${colors.border}`, textAlign: "center", padding: "6px" }}>Total</td>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ borderRight: `1px solid ${colors.border}`, textAlign: "center", padding: "6px" }}>{totalQty} Pcs</td>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ borderRight: `1px solid ${colors.border}` }}></td>
              <td style={{ padding: "6px", textAlign: "right", fontSize: "13px" }}>₹ {formatCurrency(invoice.grandTotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Area */}
        <div style={{ padding: "10px 0", fontSize: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Amount Chargeable (in words)</span>
            <span>E. & O.E.</span>
          </div>
          <div style={{ fontWeight: "bold", margin: "5px 0" }}>{numberToWords(invoice.grandTotal)}</div>

          <div style={{ display: "flex", marginTop: "20px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginTop: "15px" }}>
                <div style={{ textDecoration: "underline", fontWeight: "bold" }}>Declaration</div>
                <div style={{ fontSize: "10px" }}>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px" }}>
            <div style={{ textAlign: "center", width: "250px" }}>
              <div style={{ marginBottom: "50px" }}>for Vikalp Electric & Refrigeration</div>
              <div style={{ fontWeight: "bold", borderTop: "1px solid #000", paddingTop: "5px" }}>Authorised Signatory</div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "30px", fontSize: "12px", fontWeight: "bold" }}>SUBJECT TO JAMNAGAR JURISDICTION</div>
          <div style={{ textAlign: "center", marginTop: "5px", fontSize: "10px", fontStyle: "italic" }}>This is a Computer Generated Invoice</div>
        </div>
      </div>
    </div>
  );
});

export default InvoicePDF;
