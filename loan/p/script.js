"use strict";

let chartInstance = null;
let REPORT = null;

const $ = id => document.getElementById(id);

/* ========= UTIL ========= */
const cleanNumber = v =>
  Number(String(v || "").replace(/[^\d]/g, "")) || 0;

const formatIDR = n =>
  new Intl.NumberFormat("id-ID").format(Math.round(n));

/* ========= INPUT FORMAT ========= */
["harga", "dp"].forEach(id => {
  const el = $(id);
  el.addEventListener("input", () => {
    const val = cleanNumber(el.value);
    el.value = val ? formatIDR(val) : "";
  });
});

/* ========= UI ========= */
function toggleMode() {
  document.body.classList.toggle("dark");
}

/* ========= CORE ========= */
function hitung() {
  const harga = cleanNumber($("harga").value);
  const dp = cleanNumber($("dp").value);
  const pinjaman = harga - dp;

  if (pinjaman <= 0) {
    alert("Pinjaman harus lebih dari 0");
    return;
  }

  const tenor = Math.min(Math.max(+$("tenor").value, 1), 25) * 12;
  const bungaRaw = (+$("bunga").value || 0) / 100;
  const bungaBulanan =
    $("tipeBunga").value === "tahun" ? bungaRaw / 12 : bungaRaw;

  const metode = $("bungaTipe").value;

  let sisa = pinjaman;
  let totalBayar = 0;
  let totalBunga = 0;
  let cicilan = 0;

  const cumulative = [];
  const rowsData = [];

  if (metode === "efektif") {
    cicilan =
      bungaBulanan === 0
        ? pinjaman / tenor
        : (pinjaman * bungaBulanan) /
          (1 - Math.pow(1 + bungaBulanan, -tenor));
  }

  for (let i = 1; i <= tenor; i++) {
    let bunga = 0;
    let pokok = 0;

    if (metode === "efektif") {
      bunga = sisa * bungaBulanan;
      pokok = cicilan - bunga;
    } else {
      pokok = pinjaman / tenor;
      bunga = pinjaman * bungaBulanan;
      cicilan = pokok + bunga;
    }

    sisa = Math.max(sisa - pokok, 0);

    totalBayar += cicilan;
    totalBunga += bunga;

    cumulative.push(Math.round(totalBayar));

    rowsData.push({
      bulan: i,
      cicilan: Math.round(cicilan),
      sisa: Math.round(sisa)
    });
  }

  $("summary").classList.remove("hidden");
  $("summary").innerHTML = `
    <b>Loan:</b> Rp ${formatIDR(pinjaman)}<br>
    <b>Monthly:</b> Rp ${formatIDR(cicilan)}<br>
    <b>Total Interest:</b> Rp ${formatIDR(totalBunga)}<br>
    <b>Total Payment:</b> Rp ${formatIDR(totalBayar)}
  `;

  $("detail").innerHTML = `
    <table>
      <tr><th>Bulan</th><th>Cicilan</th><th>Sisa</th></tr>
      ${rowsData.map(r => `
        <tr>
          <td>${r.bulan}</td>
          <td>Rp ${formatIDR(r.cicilan)}</td>
          <td>Rp ${formatIDR(r.sisa)}</td>
        </tr>
      `).join("")}
    </table>
  `;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart($("grafikCicilan"), {
    type: "line",
    data: {
      labels: cumulative.map((_, i) => `Bulan ${i + 1}`),
      datasets: [{
        data: cumulative,
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      animation: false,
      plugins: { legend: { display: false } }
    }
  });

  REPORT = {
    nama: $("namaUser").value || "Investor",
    tanggal: new Date().toLocaleDateString("id-ID"),
    pinjaman,
    cicilan,
    totalBunga,
    totalBayar,
    rowsData,
    chartImage: chartInstance.toBase64Image()
  };

  $("downloadBtn").classList.remove("hidden");
}

/* ========= PDF ========= */
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const d = REPORT;
  const pageW = 210;
  const pageH = 297;
  const margin = 18;
  let y = margin;

  const black = [10, 10, 12];
  const gold = [184, 155, 94];
  const white = [245, 245, 247];
  const gray = [140, 140, 145];

  const rupiah = n => "Rp " + formatIDR(n);

  const paintBg = () => {
    pdf.setFillColor(...black);
    pdf.rect(0, 0, pageW, pageH, "F");
  };

  /* ================= PAGE 1 ================= */
  paintBg();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...gold);
  pdf.text("CONFIDENTIAL INVESTMENT REPORT", pageW / 2, y, { align: "center" });

  y += 8;
  pdf.setFontSize(18);
  pdf.text("PRIVATE FINANCIAL PROJECTION", pageW / 2, y, { align: "center" });

  y += 6;
  pdf.setFontSize(8);
  pdf.setTextColor(...gray);
  pdf.text("For Sophisticated Investors Only", pageW / 2, y, { align: "center" });

  /* CLIENT INFO */
  y += 20;
  pdf.setFontSize(10);
  pdf.setTextColor(...gray);
  pdf.text("Client", margin, y);
  pdf.text("Date", pageW - margin, y, { align: "right" });

  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...white);
  pdf.text(d.nama, margin, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(d.tanggal, pageW - margin, y, { align: "right" });

  /* SUMMARY BOX */
  y += 14;
  pdf.setDrawColor(...gold);
  pdf.rect(margin, y, pageW - margin * 2, 42);

  pdf.setFontSize(10);
  pdf.setTextColor(...gray);

  pdf.text("Loan Principal", margin + 6, y + 10);
  pdf.text("Monthly Installment", pageW / 2 + 6, y + 10);

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...white);
  pdf.text(rupiah(d.pinjaman), margin + 6, y + 18);
  pdf.text(rupiah(d.cicilan), pageW / 2 + 6, y + 18);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...gray);
  pdf.text("Total Interest", margin + 6, y + 30);
  pdf.text("Total Payment", pageW / 2 + 6, y + 30);

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...white);
  pdf.text(rupiah(d.totalBunga), margin + 6, y + 38);
  pdf.text(rupiah(d.totalBayar), pageW / 2 + 6, y + 38);

  /* ================= PAGE 2 — TABLE ================= */
  pdf.addPage();
  paintBg();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(...gold);
  pdf.text("PAYMENT SCHEDULE", pageW / 2, margin, { align: "center" });

  pdf.autoTable({
    startY: margin + 12,
    head: [["Month", "Installment", "Remaining"]],
    body: d.rowsData.map(r => [
      r.bulan,
      rupiah(r.cicilan),
      rupiah(r.sisa)
    ]),
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: white,
      cellPadding: 4,
      lineWidth: 0.3,
      lineColor: gold,
      fillColor: black
    },
    headStyles: {
      textColor: gold,
      fontStyle: "bold",
      halign: "center"
    },
    bodyStyles: {
      halign: "center"
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      pdf.setFontSize(8);
      pdf.setTextColor(...gray);
      pdf.text(
        "PRIVATE INVESTMENT DOCUMENT — NOT FOR DISTRIBUTION",
        pageW / 2,
        pageH - 10,
        { align: "center" }
      );
    }
  });

  /* ================= PAGE 3 — CHART ================= */
  pdf.addPage();
  paintBg();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(...gold);
  pdf.text("PAYMENT PROJECTION", pageW / 2, margin, { align: "center" });

  pdf.addImage(
    d.chartImage,
    "PNG",
    margin,
    margin + 14,
    pageW - margin * 2,
    90
  );

  pdf.save(`Anglumea_Loan_Calc_${d.nama}.pdf`);
}
