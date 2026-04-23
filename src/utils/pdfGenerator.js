import { jsPDF } from 'jspdf';
import { generatePlan } from '../ml/recommend';

export const generateLongevityAudit = async (userData, predictions, dashboardElementId) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Header - Hospital Style
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top Border Accent
  doc.setFillColor(0, 168, 150); // Clinical Teal
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('DIAGNOSTIC LONGEVITY REPORT', margin, 25);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('CENTRAL LABORATORY FOR PREVENTATIVE MEDICINE & AI PROGNOSIS', margin, 32);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, 38, pageWidth - margin, 38);

  // Patient Details Matrix
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  
  const drawField = (label, value, x, y) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || 'N/A'), x + 30, y);
  };

  const currentAge = parseFloat(userData.age) || 30;

  const reportId = 'LL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  drawField('Report ID', reportId, margin, 48);
  drawField('Date Issued', date, margin + 90, 48);
  
  drawField('Age', currentAge, margin, 56);
  drawField('Gender', (userData.gender || 'Not specified').toUpperCase(), margin + 90, 56);
  
  drawField('Height (cm)', userData.height, margin, 64);
  drawField('Weight (kg)', userData.weight, margin + 90, 64);

  drawField('Region', userData.country || 'Not specified', margin, 72);
  drawField('BMI', userData.bmi || 'N/A', margin + 90, 72);

  doc.line(margin, 80, pageWidth - margin, 80);

  // Core Findings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('1. LONGEVITY PROGNOSIS', margin, 92);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 98, pageWidth - (margin * 2), 35, 2, 2, 'F');

  doc.setFontSize(11);
  doc.text('Estimated Biological Age:', margin + 5, 108);
  doc.setFontSize(16);
  doc.setTextColor(userData.biological_age > currentAge ? 220 : 0, userData.biological_age > currentAge ? 38 : 168, userData.biological_age > currentAge ? 38 : 150);
  doc.text(`${predictions.biologicalAge} years`, margin + 55, 108);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text('Predicted Lifespan:', margin + 5, 120);
  doc.setFontSize(16);
  doc.text(`${predictions.prediction} years`, margin + 55, 120);

  // Vital Biomarkers Table
  doc.setFontSize(14);
  doc.text('2. CLINICAL BIOMARKERS', margin, 148);

  const startY = 155;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, startY, pageWidth - (margin * 2), 8, 'F');
  
  doc.setFontSize(9);
  doc.text('MARKER', margin + 2, startY + 6);
  doc.text('REPORTED VALUE', margin + 60, startY + 6);
  doc.text('REFERENCE RANGE', margin + 120, startY + 6);

  const markers = [
    { name: 'Blood Pressure (Sys)', val: userData.blood_pressure, ref: '< 120 mmHg' },
    { name: 'Total Cholesterol', val: userData.cholesterol, ref: '< 200 mg/dL' },
    { name: 'Fasting Glucose', val: userData.glucose, ref: '< 100 mg/dL' },
    { name: 'Exercise Frequency', val: userData.exercise_level + ' days/wk', ref: '>= 3 days/wk' }
  ];

  doc.setFont('helvetica', 'normal');
  markers.forEach((m, i) => {
    const y = startY + 15 + (i * 10);
    doc.text(m.name, margin + 2, y);
    doc.text(String(m.val || 'Not Tested'), margin + 60, y);
    doc.text(m.ref, margin + 120, y);
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 3, pageWidth - margin, y + 3);
  });

  // Action Plan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('3. PRESCRIBED ACTION PLAN', margin, 215);

  const plan = generatePlan(predictions.featureImportance || {}, userData);
  
  let currentY = 225;
  doc.setFontSize(10);
  Object.entries(plan).slice(0, 3).forEach(([section, details]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(section.toUpperCase(), margin, currentY);
    currentY += 6;
    
    doc.setFont('helvetica', 'normal');
    details.tasks.slice(0, 2).forEach(task => {
      doc.text('• ' + task.text, margin + 5, currentY);
      currentY += 6;
    });
    currentY += 4;
  });

  // Clinical Validation Section
  currentY += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, margin + 60, currentY);
  doc.setFontSize(8);
  doc.text('Authorized Diagnostic Signature', margin, currentY + 4);
  doc.text('LifeLytics AI Neural Engine v2.4.0', margin, currentY + 8);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const footerText = "CONFIDENTIAL: This report is generated by the LifeLytics AI Neural Engine. It is intended for educational and preventative analysis. It does not replace professional medical advice.";
  const splitFooter = doc.splitTextToSize(footerText, pageWidth - (margin * 2));
  doc.text(splitFooter, margin, pageHeight - 15);

  const fileName = `LifeLytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
