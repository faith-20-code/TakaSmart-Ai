const prisma = require('../config/prisma');
const { generateEPRPdf } = require('../services/pdf.service');

// Get daily incoming waste log
const getDailyIncoming = async (req, res, next) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD
    const day = date ? new Date(date) : new Date();
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));

    const logs = await prisma.incomingWasteLog.findMany({
      where: {
        businessId: req.user.id,
        loggedAt: { gte: start, lte: end },
      },
      include: {
        collectionPoint: { select: { name: true } },
      },
      orderBy: { loggedAt: 'desc' },
    });

    // Summarise by material type
    const summary = logs.reduce((acc, log) => {
      const key = log.materialType;
      if (!acc[key]) acc[key] = 0;
      acc[key] += log.quantityKg;
      return acc;
    }, {});

    const totalKg = logs.reduce((sum, log) => sum + log.quantityKg, 0);

    res.json({ logs, summary, totalKg, date: start });
  } catch (err) {
    next(err);
  }
};

// Get daily outgoing waste log
const getDailyOutgoing = async (req, res, next) => {
  try {
    const { date } = req.query;
    const day = date ? new Date(date) : new Date();
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));

    const logs = await prisma.outgoingWasteLog.findMany({
      where: {
        businessId: req.user.id,
        loggedAt: { gte: start, lte: end },
      },
      include: {
        buyer: { select: { name: true, buyerProfile: { select: { companyName: true } } } },
      },
      orderBy: { loggedAt: 'desc' },
    });

    const summary = logs.reduce((acc, log) => {
      const key = log.materialType;
      if (!acc[key]) acc[key] = 0;
      acc[key] += log.quantityKg;
      return acc;
    }, {});

    const totalKg = logs.reduce((sum, log) => sum + log.quantityKg, 0);

    res.json({ logs, summary, totalKg, date: start });
  } catch (err) {
    next(err);
  }
};

// Generate monthly EPR report
const getMonthlyEPRReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) - 1;
    const y = parseInt(year);
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);

    const [incoming, outgoing, business] = await Promise.all([
      prisma.incomingWasteLog.findMany({
        where: { businessId: req.user.id, loggedAt: { gte: start, lte: end } },
      }),
      prisma.outgoingWasteLog.findMany({
        where: { businessId: req.user.id, loggedAt: { gte: start, lte: end } },
        include: {
          buyer: { select: { buyerProfile: { select: { companyName: true } } } },
        },
      }),
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { name: true, sellerProfile: true },
      }),
    ]);

    const incomingSummary = incoming.reduce((acc, log) => {
      if (!acc[log.materialType]) acc[log.materialType] = 0;
      acc[log.materialType] += log.quantityKg;
      return acc;
    }, {});

    const outgoingSummary = outgoing.reduce((acc, log) => {
      if (!acc[log.materialType]) acc[log.materialType] = 0;
      acc[log.materialType] += log.quantityKg;
      return acc;
    }, {});

    const totalIncoming = incoming.reduce((sum, l) => sum + l.quantityKg, 0);
    const totalOutgoing = outgoing.reduce((sum, l) => sum + l.quantityKg, 0);

    res.json({
      report: {
        business: {
          name: business.sellerProfile?.businessName || business.name,
          registrationNo: business.sellerProfile?.registrationNo,
        },
        period: {
          month: parseInt(month),
          year: parseInt(year),
          from: start,
          to: end,
        },
        incoming: {
          totalKg: totalIncoming,
          byMaterial: incomingSummary,
          entries: incoming.length,
        },
        outgoing: {
          totalKg: totalOutgoing,
          byMaterial: outgoingSummary,
          entries: outgoing.length,
        },
        netWaste: totalIncoming - totalOutgoing,
      },
    });
  } catch (err) {
    next(err);
  }
};

const downloadMonthlyEPR = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) - 1;
    const y = parseInt(year);
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);

    const [incoming, outgoing, business] = await Promise.all([
      prisma.incomingWasteLog.findMany({
        where: { businessId: req.user.id, loggedAt: { gte: start, lte: end } },
      }),
      prisma.outgoingWasteLog.findMany({
        where: { businessId: req.user.id, loggedAt: { gte: start, lte: end } },
      }),
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { name: true, sellerProfile: true },
      }),
    ]);

    const incomingSummary = incoming.reduce((acc, log) => {
      if (!acc[log.materialType]) acc[log.materialType] = 0;
      acc[log.materialType] += log.quantityKg;
      return acc;
    }, {});

    const outgoingSummary = outgoing.reduce((acc, log) => {
      if (!acc[log.materialType]) acc[log.materialType] = 0;
      acc[log.materialType] += log.quantityKg;
      return acc;
    }, {});

    const totalIncoming = incoming.reduce((sum, l) => sum + l.quantityKg, 0);
    const totalOutgoing = outgoing.reduce((sum, l) => sum + l.quantityKg, 0);

    const report = {
      business: {
        name: business.sellerProfile?.businessName || business.name,
        registrationNo: business.sellerProfile?.registrationNo,
      },
      period: { month: parseInt(month), year: parseInt(year), from: start, to: end },
      incoming: { totalKg: totalIncoming, byMaterial: incomingSummary, entries: incoming.length },
      outgoing: { totalKg: totalOutgoing, byMaterial: outgoingSummary, entries: outgoing.length },
      netWaste: totalIncoming - totalOutgoing,
    };

    const doc = generateEPRPdf(report);

    // Buffer the entire PDF first then send it
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=EPR_Report_${year}_${month}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
    });
    doc.end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getDailyIncoming, getDailyOutgoing, getMonthlyEPRReport, downloadMonthlyEPR };