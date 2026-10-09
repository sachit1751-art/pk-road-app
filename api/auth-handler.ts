export function handleAuthValidate(req: any, res: any) {
  const { email, password, name, mode } = req.body || {};
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required.');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Invalid email address format.');
    }
  }

  if (mode === 'register') {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters.');
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.push('Password must be at least 6 characters.');
    }
  } else if (mode === 'login') {
    if (!password || typeof password !== 'string' || password.length < 1) {
      errors.push('Password is required.');
    }
  }

  if (errors.length > 0) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ valid: false, errors }));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      valid: true,
      message: 'Credentials format validated successfully.',
      colonyDomain: email?.trim().endsWith('greenwood.org') || email?.trim().endsWith('colony.local'),
    })
  );
}

export function handleAuthRoles(req: any, res: any) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      roles: [
        { id: 'resident', name: 'Resident', description: 'Colony resident / allottee with flat access' },
        { id: 'rwa_admin', name: 'RWA Administrator', description: 'Resident Welfare Association committee' },
        { id: 'security_guard', name: 'Security Guard', description: 'Main gate and visitor control staff' },
        { id: 'water_worker', name: 'Water Supply Worker', description: 'Municipal water & pipeline maintenance' },
        { id: 'electrical_worker', name: 'Electrical Worker', description: 'Substation and wiring maintenance' },
        { id: 'sanitation_worker', name: 'Sanitation Worker', description: 'Waste collection and cleaning' },
        { id: 'maintenance_worker', name: 'General Maintenance', description: 'Civil and structural repairs' },
      ],
    })
  );
}

export function handleAuthAudit(req: any, res: any) {
  const { event, email, uid, role } = req.body || {};
  const timestamp = new Date().toISOString();
  console.log(`[AUTH AUDIT ${timestamp}] Event: ${event} | Email: ${email} | UID: ${uid} | Role: ${role}`);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ recorded: true, timestamp }));
}
