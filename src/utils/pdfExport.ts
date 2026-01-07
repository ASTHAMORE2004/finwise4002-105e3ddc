import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PortfolioItem {
  investment_name: string;
  symbol: string | null;
  investment_type: string;
  quantity: number;
  buy_price: number;
  current_price: number | null;
  invested_amount: number;
  current_value: number | null;
  sector: string | null;
  purchase_date: string;
}

interface PortfolioMetrics {
  totalInvested: number;
  totalCurrentValue: number;
  totalReturns: number;
  returnsPercent: number;
}

export const exportPortfolioToPDF = (
  portfolio: PortfolioItem[],
  metrics: PortfolioMetrics,
  userName?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(16, 185, 129); // Primary green color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Investment Portfolio Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, 32, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Portfolio Summary
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Portfolio Summary', 14, 55);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['Total Invested', `₹${metrics.totalInvested.toLocaleString('en-IN')}`],
    ['Current Value', `₹${metrics.totalCurrentValue.toLocaleString('en-IN')}`],
    ['Total Returns', `₹${metrics.totalReturns.toLocaleString('en-IN')} (${metrics.returnsPercent >= 0 ? '+' : ''}${metrics.returnsPercent.toFixed(2)}%)`],
    ['Total Holdings', `${portfolio.length} investments`],
  ];

  autoTable(doc, {
    startY: 60,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 80 },
    },
  });

  // Holdings Table
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const finalY = (doc as any).lastAutoTable?.finalY || 100;
  doc.text('Holdings Details', 14, finalY + 15);

  const tableData = portfolio.map(item => {
    const returns = (item.current_value || item.invested_amount) - item.invested_amount;
    const returnsPercent = item.invested_amount > 0 
      ? ((returns / item.invested_amount) * 100) 
      : 0;
    
    return [
      item.investment_name,
      item.symbol || '-',
      item.investment_type,
      item.quantity.toString(),
      `₹${item.buy_price.toLocaleString('en-IN')}`,
      `₹${(item.current_price || item.buy_price).toLocaleString('en-IN')}`,
      `₹${item.invested_amount.toLocaleString('en-IN')}`,
      `₹${(item.current_value || item.invested_amount).toLocaleString('en-IN')}`,
      `${returnsPercent >= 0 ? '+' : ''}${returnsPercent.toFixed(2)}%`,
    ];
  });

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Name', 'Symbol', 'Type', 'Qty', 'Buy Price', 'Current', 'Invested', 'Value', 'Returns']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { 
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold' 
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages?.() || 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Kuber Investment Platform`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download
  doc.save(`portfolio-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportCalculationToPDF = (
  calculationType: string,
  inputs: Record<string, any>,
  result: Record<string, any>
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${calculationType} Calculation Report`, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, 32, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  
  // Input Parameters
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Input Parameters', 14, 55);
  
  const inputData = Object.entries(inputs).map(([key, value]) => [
    key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    typeof value === 'number' ? value.toLocaleString('en-IN') : String(value)
  ]);

  autoTable(doc, {
    startY: 60,
    head: [],
    body: inputData,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 80 },
    },
  });

  // Results
  const finalY = (doc as any).lastAutoTable?.finalY || 100;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculation Results', 14, finalY + 15);

  const resultData = Object.entries(result).map(([key, value]) => [
    key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    typeof value === 'number' 
      ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` 
      : String(value)
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [],
    body: resultData,
    theme: 'striped',
    styles: { fontSize: 11, cellPadding: 4 },
    headStyles: { fillColor: [16, 185, 129] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 80 },
    },
  });

  doc.save(`${calculationType.toLowerCase().replace(/\s+/g, '-')}-calculation-${new Date().toISOString().split('T')[0]}.pdf`);
};
