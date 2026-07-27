const PDFDocument = require('pdfkit');

const BRAND = '#1d9e75';
const DARK = '#0b2318';
const GRAY = '#5e7569';
const LIGHT = '#f0fdf4';

const generateEPRPdf = (report) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 100;

  // ── Header band ───────────────────────────────────────────────────────────
  doc.rect(0, 0, pageWidth, 90).fill(BRAND);
  doc.fillColor('white').font('Helvetica-Bold').fontSize(24)
    .text('TakaSmart AI', 50, 22);
  doc.font('Helvetica').fontSize(11)
    .text('Extended Producer Responsibility Report', 50, 52);
  doc.font('Helvetica').fontSize(9).fillColor('#d1fae5')
    .text(`Generated: ${new Date().toDateString()}`, 50, 70);

  // ── Business details card ─────────────────────────────────────────────────
  let y = 110;
  doc.rect(50, y, contentWidth, 90).fill('#f8fffe').stroke('#d1fae5');
  doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(11)
    .text('BUSINESS DETAILS', 65, y + 12);

  doc.font('Helvetica').fontSize(10);
  doc.fillColor(GRAY).text('Business Name', 65, y + 30);
  doc.fillColor(DARK).text(report.business.name, 200, y + 30);

  doc.fillColor(GRAY).text('Registration No.', 65, y + 46);
  doc.fillColor(DARK).text(report.business.registrationNo || '—', 200, y + 46);

  doc.fillColor(GRAY).text('Report Period', 65, y + 62);
  doc.fillColor(DARK).text(
    `${new Date(report.period.from).toDateString()} — ${new Date(report.period.to).toDateString()}`,
    200, y + 62
  );

  // ── Summary cards ─────────────────────────────────────────────────────────
  y = 220;
  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(12)
    .text('MONTHLY SUMMARY', 50, y);

  y += 20;
  const cardW = (contentWidth - 20) / 3;

  // Card 1 — Incoming
  doc.rect(50, y, cardW, 70).fill(LIGHT);
  doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(9)
    .text('TOTAL INCOMING', 60, y + 10);
  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(22)
    .text(`${report.incoming.totalKg} kg`, 60, y + 24);
  doc.fillColor(GRAY).font('Helvetica').fontSize(8)
    .text('Drop-offs received', 60, y + 52);

  // Card 2 — Outgoing
  doc.rect(60 + cardW, y, cardW, 70).fill(LIGHT);
  doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(9)
    .text('TOTAL OUTGOING', 70 + cardW, y + 10);
  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(22)
    .text(`${report.outgoing.totalKg} kg`, 70 + cardW, y + 24);
  doc.fillColor(GRAY).font('Helvetica').fontSize(8)
    .text('Sold to recyclers', 70 + cardW, y + 52);

  // Card 3 — Net
  doc.rect(70 + cardW * 2, y, cardW, 70).fill(LIGHT);
  doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(9)
    .text('NET RETAINED', 80 + cardW * 2, y + 10);
  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(22)
    .text(`${report.netWaste} kg`, 80 + cardW * 2, y + 24);
  doc.fillColor(GRAY).font('Helvetica').fontSize(8)
    .text('Remaining on site', 80 + cardW * 2, y + 52);

  // ── Incoming table ────────────────────────────────────────────────────────
  y += 90;
  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(12)
    .text('INCOMING WASTE — DROP-OFFS RECEIVED', 50, y);

  doc.moveTo(50, y + 18).lineTo(50 + contentWidth, y + 18)
    .strokeColor(BRAND).lineWidth(2).stroke();

  y += 26;

  if (Object.keys(report.incoming.byMaterial).length === 0) {
    doc.fillColor(GRAY).font('Helvetica').fontSize(10)
      .text('No incoming waste recorded this month.', 50, y);
    y += 24;
  } else {
    doc.rect(50, y, contentWidth, 24).fill(BRAND);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(9);
    doc.text('MATERIAL TYPE', 62, y + 8);
    doc.text('QUANTITY (KG)', 262, y + 8);
    doc.text('DROP-OFF COUNT', 412, y + 8);
    y += 24;

    let shade = false;
    Object.entries(report.incoming.byMaterial).forEach(([material, kg]) => {
      if (shade) doc.rect(50, y, contentWidth, 22).fill('#f9fafb');
      doc.fillColor(DARK).font('Helvetica').fontSize(10);
      doc.text(material.charAt(0) + material.slice(1).toLowerCase(), 62, y + 6);
      doc.text(`${kg} kg`, 262, y + 6);
      doc.text(report.incoming.entries.toString(), 412, y + 6);
      y += 22;
      shade = !shade;
    });
  }

  // ── Outgoing table ────────────────────────────────────────────────────────
  y += 20;
  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(12)
    .text('OUTGOING WASTE — SOLD TO RECYCLERS', 50, y);

  doc.moveTo(50, y + 18).lineTo(50 + contentWidth, y + 18)
    .strokeColor(BRAND).lineWidth(2).stroke();

  y += 26;

  if (Object.keys(report.outgoing.byMaterial).length === 0) {
    doc.fillColor(GRAY).font('Helvetica').fontSize(10)
      .text('No outgoing waste recorded this month.', 50, y);
    y += 24;
  } else {
    doc.rect(50, y, contentWidth, 24).fill(BRAND);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(9);
    doc.text('MATERIAL TYPE', 62, y + 8);
    doc.text('QUANTITY (KG)', 262, y + 8);
    doc.text('RECYCLER', 412, y + 8);
    y += 24;

    let shade = false;
    Object.entries(report.outgoing.byMaterial).forEach(([material, kg]) => {
      if (shade) doc.rect(50, y, contentWidth, 22).fill('#f9fafb');
      doc.fillColor(DARK).font('Helvetica').fontSize(10);
      doc.text(material.charAt(0) + material.slice(1).toLowerCase(), 62, y + 6);
      doc.text(`${kg} kg`, 262, y + 6);
      doc.text(`${report.outgoing.entries} sale(s)`, 412, y + 6);
      y += 22;
      shade = !shade;
    });
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = doc.page.height - 50;
  doc.rect(0, footerY, pageWidth, 50).fill(DARK);
  doc.fillColor('white').font('Helvetica').fontSize(8)
    .text(
      'Generated by TakaSmart AI — Recyclable Waste Marketplace',
      50, footerY + 12,
      { width: contentWidth, align: 'center' }
    );
  doc.fillColor('#86efac').fontSize(7)
    .text(
      'This document is for Extended Producer Responsibility (EPR) compliance purposes only.',
      50, footerY + 28,
      { width: contentWidth, align: 'center' }
    );

  return doc;
};

module.exports = { generateEPRPdf };