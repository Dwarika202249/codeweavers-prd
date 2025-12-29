import express from 'express';
import path from 'path';
import fs from 'fs';
import Certificate from '../models/Certificate.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

/**
 * GET /api/certificates/:id/download
 * Secure download for issued certificates (admin or owning student)
 */
router.get(
  '/:id/download',
  protect,
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.findById(req.params.id).populate('student', 'name email');
    if (!certificate) {
      res.status(404);
      throw new Error('Certificate not found');
    }

    if (certificate.status !== 'issued') {
      res.status(400);
      throw new Error('Certificate not issued yet');
    }

    // allow admin or the student who owns it
    if (req.user.role !== 'admin' && certificate.student._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    if (!certificate.fileUrl) {
      res.status(404);
      throw new Error('Certificate file not found');
    }

    // derive filename from fileUrl
    let filename = '';
    try {
      const parsed = new URL(certificate.fileUrl);
      filename = path.basename(parsed.pathname);
    } catch (err) {
      // fallback
      const parts = certificate.fileUrl.split('/');
      filename = parts[parts.length - 1];
    }

    const certDir = path.join(process.cwd(), 'uploads', 'certificates');
    let filePath = path.join(certDir, filename);

    if (!fs.existsSync(filePath)) {
      // Diagnostics: list available files and try to find a close match
      let files = [];
      try {
        files = fs.readdirSync(certDir).slice(0, 200);
      } catch (e) {
        console.error('Error reading certificates directory', e);
      }

      console.error('Certificate download: target file not found', {
        certificateId: certificate._id,
        fileUrl: certificate.fileUrl,
        expectedFilename: filename,
        expectedPath: filePath,
        filesAvailable: files.slice(0, 50),
      });

      // Fallback: try to match by containing filename, student name, serial, or "certificate.pdf" suffix
      const studentHint = (certificate.student && certificate.student.name) ? certificate.student.name.replace(/\s+/g, '_') : '';
      const serialHint = (certificate.meta && certificate.meta.serial) ? String(certificate.meta.serial) : '';

      const candidates = files.filter(f => {
        return (
          (filename && f.includes(filename)) ||
          (studentHint && f.includes(studentHint)) ||
          (serialHint && f.includes(serialHint)) ||
          f.toLowerCase().endsWith('-certificate.pdf') ||
          f.toLowerCase().includes('certificate')
        );
      });

      if (candidates.length > 0) {
        // pick the most recently modified candidate
        candidates.sort((a, b) => {
          const aStat = fs.statSync(path.join(certDir, a));
          const bStat = fs.statSync(path.join(certDir, b));
          return bStat.mtimeMs - aStat.mtimeMs;
        });

        const chosen = candidates[0];
        console.warn('Certificate download: using fallback candidate', { chosen });
        filePath = path.join(certDir, chosen);
      } else {
        res.status(404);
        throw new Error('Certificate file not found on server');
      }
    }

    return res.download(filePath, `${(certificate.student && certificate.student.name) ? certificate.student.name.replace(/\s+/g, '_') + '-certificate.pdf' : 'certificate.pdf'}`);
  })
);

export default router;
