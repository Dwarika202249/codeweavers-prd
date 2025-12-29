import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import config from '../config/index.js';

const certUploadsDir = path.join(process.cwd(), 'uploads', 'certificates');
if (!fs.existsSync(certUploadsDir)) fs.mkdirSync(certUploadsDir, { recursive: true });

/**
 * Generate a simple certificate PDF and save it to uploads/certificates
 * Returns { filePath, fileUrl, meta }
 */
export async function generateCertificatePDF({ studentName, courseTitle, issuedAt = new Date(), serial = '' }) {
  return new Promise((resolve, reject) => {
    try {
      const filename = `${Date.now()}-${(studentName || 'student').replace(/\s+/g, '_')}-certificate.pdf`;
      const filePath = path.join(certUploadsDir, filename);
      const fileUrl = `${config.frontendUrl.replace(/\/$/, '')}/uploads/certificates/${filename}`;

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Simple layout
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');
      doc.fillColor('#ffffff');

      doc.fontSize(28).text('Certificate of Completion', { align: 'center', underline: false });

      doc.moveDown(2);
      doc.fontSize(20).fillColor('#c7f9cc');
      doc.text(studentName || 'Student Name', { align: 'center' });

      doc.moveDown(1);
      doc.fontSize(14).fillColor('#ffffff');
      doc.text(`has successfully completed the course`, { align: 'center' });

      doc.moveDown(0.8);
      doc.fontSize(18).fillColor('#fff3bf');
      doc.text(courseTitle || 'Course Title', { align: 'center', bold: true });

      doc.moveDown(2);
      doc.fontSize(12).fillColor('#9ca3af');
      const issuedDateText = `Issued: ${new Date(issuedAt).toLocaleDateString()}`;
      doc.text(issuedDateText, { align: 'center' });

      if (serial) {
        doc.moveDown(0.5);
        doc.text(`Certificate ID: ${serial}`, { align: 'center' });
      }

      // Footer / issuer
      doc.moveDown(4);
      doc.fontSize(10).fillColor('#94a3b8');
      doc.text('Issued by CodeWeavers', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({ filePath, fileUrl, meta: { serial } });
      });
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

export default { generateCertificatePDF };