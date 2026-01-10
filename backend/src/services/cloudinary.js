import { v2 as cloudinary } from 'cloudinary';
import config from '../config/index.js';

// Configure cloudinary using env vars from config
cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

/**
 * Upload a Buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer
 * @param {object} options cloudinary upload options
 * @returns {Promise<object>} result
 */
export function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    // Write buffer and end
    uploadStream.end(buffer);
  });
}

/**
 * Destroy (delete) an asset by public_id. Optionally pass options like { resource_type: 'video' }
 * @param {string} publicId
 * @param {object} options
 * @returns {Promise<object>}
 */
export function destroy(publicId, options = {}) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

export default cloudinary;