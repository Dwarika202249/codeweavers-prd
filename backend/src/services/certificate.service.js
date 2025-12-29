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
export async function generateCertificatePDF({ studentName, courseTitle, issuedAt = new Date(), serial = '', issuerName = 'CodeWeavers', logoPath, signaturePath, verificationUrl } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const filename = `${Date.now()}-${(studentName || 'student').replace(/\s+/g, '_')}-certificate.pdf`;
      const filePath = path.join(certUploadsDir, filename);
      const fileUrl = `${config.frontendUrl.replace(/\/$/, '')}/uploads/certificates/${filename}`;

      // Use config defaults if explicit paths not provided
      logoPath = logoPath || config.certificateLogoPath || '';
      signaturePath = signaturePath || config.certificateSignaturePath || '';

      // Use a 4:3 landscape page size for certificates (wider than tall)
      // 1400x1050 gives good resolution and prints well
      const pageW = 1400;
      const pageH = 1050;
      const doc = new PDFDocument({ size: [pageW, pageH], margin: 40 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Helper: shrink font until text fits within width
      const fitText = (text, maxWidth, opts = {}) => {
        const { font = 'Helvetica', min = 8, max = 36 } = opts;
        let size = max;
        doc.font(font);
        while (size >= min) {
          doc.fontSize(size);
          const w = doc.widthOfString(text);
          if (w <= maxWidth) return size;
          size -= 1;
        }
        return Math.max(min, size);
      };

      const W = doc.page.width;
      const H = doc.page.height;

      // Background - use app primary color as a very light tint for the page background
      const primary = config.certificatePrimaryColor || '#3B82F6';
      // subtle tint (lighten primary) - fallback to light indigo
      const bg = '#eff6ff';
      doc.save();
      doc.rect(0, 0, W, H).fill(bg);
      doc.restore();

      // Decorative outer border
      const pad = 40;
      doc.save();
      doc.roundedRect(pad, pad, W - pad * 2, H - pad * 2, 8).lineWidth(2).stroke('#e2c078');
      doc.restore();

      // Optional logo (top-left) - ensure it doesn't push layout
      const logoW = Math.min(160, W * 0.12);
      if (logoPath && fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, pad + 10, pad + 10, { width: logoW });
        } catch (e) {
          // ignore logo errors
        }
      }

      // Title (relative position) — larger, no background box
      const titleY = H * 0.13;
      doc.fillColor('#0f172a');
      doc.font('Helvetica-Bold');
      doc.fontSize(48).text('Certificate of Completion', 0, titleY, { align: 'center' });

      // Decorative subtle gold line under title
      doc.moveTo(W * 0.12, titleY + 60).lineTo(W * 0.88, titleY + 60).lineWidth(2).stroke('#e2c078');

      // Student name (centered) — big and bold
      doc.font('Helvetica-Bold');
      doc.fontSize(40).fillColor('#111827');
      const studentY = titleY + 96;
      doc.text(studentName || 'Student Name', 0, studentY, { align: 'center' });

      // Short issuance paragraph (always present) - ensure it fits and doesn't create extra page
      const paragraph = `This certifies that ${studentName || 'the student'} has satisfactorily completed the requirements for the course ${courseTitle || 'the course'} and is awarded this certificate on ${new Date(issuedAt).toLocaleDateString()}.`;
      const paraMaxWidth = W - pad * 2 - 160;
      const paraSize = fitText(paragraph, paraMaxWidth, { font: 'Helvetica', min: 9, max: 16 });
      doc.font('Helvetica').fontSize(paraSize).fillColor('#334155');
      const paraY = studentY + 54;
      doc.text(paragraph, pad + 80, paraY, { width: paraMaxWidth, align: 'center' });

      // Course title (no filled box) — styled with accent color and bold, single-line
      const badgeMaxWidth = Math.min(640, W * 0.7);
      const courseFontSize = fitText(courseTitle || 'Course Title', badgeMaxWidth - 40, { font: 'Helvetica-Bold', min: 12, max: 28 });
      const courseBoxWidth = Math.min(badgeMaxWidth, doc.widthOfString(courseTitle || 'Course Title', { font: 'Helvetica-Bold', size: courseFontSize }) + 40);
      const courseX = (W - courseBoxWidth) / 2;
      const courseY = paraY + 84;
      // render course title as centered text with accent color (no background fill)
      doc.font('Helvetica-Bold').fontSize(courseFontSize).fillColor(primary || '#3B82F6');
      doc.text(courseTitle || 'Course Title', courseX, courseY - 6, { width: courseBoxWidth, align: 'center' });

      // Issued info (left) and serial (right)
      const infoY = courseY + 84;
      doc.font('Helvetica').fontSize(12).fillColor('#475569');
      doc.text(`Issued: ${new Date(issuedAt).toLocaleDateString()}`, pad + 12, infoY);

      if (serial) {
        const badgeW = 180;
        const badgeH = 34;
        const bx = W - pad - badgeW;
        const by = infoY - 6;
        // subtle outlined badge for serial
        doc.roundedRect(bx, by, badgeW, badgeH, 6).lineWidth(1).stroke('#cbd5e1');
        doc.fillColor('#0f172a').fontSize(11).text(`Certificate ID: ${serial}`, bx + 12, by + 9);
      }

      // Signature area: use instructor name if provided, else issuer
      const signY = H - pad - 160;
      if (signaturePath && fs.existsSync(signaturePath)) {
        try {
          doc.image(signaturePath, pad + 10, signY, { width: 220 });
        } catch (e) {
          // ignore signature image errors
        }
      } else {
        doc.moveTo(pad + 10, signY + 100).lineTo(pad + 320, signY + 100).lineWidth(0.7).stroke('#cbd5e1');
      }
      const sigName = issuerName || 'Course Instructor';
      const sigTitle = 'Course Instructor';
      doc.fontSize(14).fillColor(primary || '#3B82F6').text(sigName, pad + 10, signY + 108);
      doc.fontSize(11).fillColor('#94a3b8').text(sigTitle, pad + 10, signY + 132);

      // Optional verification URL as small text (bottom-left)
      if (verificationUrl) {
        doc.fontSize(10).fillColor('#6b7280').text(`Verify: ${verificationUrl}`, pad + 12, H - pad - 18);
      }

      // Ensure we don't accidentally create additional pages: end the document
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