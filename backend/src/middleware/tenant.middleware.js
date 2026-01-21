import College from '../models/College.model.js';

// Resolve tenant (college) by host, header or query param
export const resolveTenant = async (req, res, next) => {
  try {
    // Priority: header 'x-college-slug' -> query 'college' -> hostname (subdomain) -> none
    const slugFromHeader = req.headers['x-college-slug'];
    const slugFromQuery = req.query.college || null;

    let slug = slugFromHeader || slugFromQuery || null;

    if (!slug) {
      // Try subdomain e.g. college.example.com
      const host = (req.hostname || req.headers.host || '').split(':')[0];
      if (host && host.split('.').length > 2) {
        slug = host.split('.')[0];
      }
    }

    if (slug) {
      const college = await College.findOne({ $or: [{ slug }, { whiteLabelUrl: slug }, { customDomain: slug }] });
      if (college) {
        req.college = college;
      }
    }

    next();
  } catch (err) {
    // don't fail the request if tenant resolution errors
    console.warn('Tenant resolution error', err);
    next();
  }
};

// Require tenant middleware (use on college-scoped API endpoints)
export const requireTenant = (req, res, next) => {
  if (!req.college) {
    res.status(400);
    throw new Error('College (tenant) not found or not specified');
  }
  next();
};

export default resolveTenant;
