// api/branch-locator.js
// Branch Locator + Appointment Booking
// GET /api/branch-locator — Find nearby branches
// POST /api/branch-locator — Book appointment

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Major cities in Pakistan with Islamic bank branches
const BRANCHES = {
  meezan: [
    { id: 'MB-001', city: 'Karachi', area: 'Clifton', address: 'Plot 123, Block 4, Clifton', phone: '021-111-331-331', hours: '9:00 AM - 5:00 PM', lat: 24.8103, lng: 67.0285, services: ['account_opening', 'financing', 'zakat_advisory'] },
    { id: 'MB-002', city: 'Karachi', area: 'DHA', address: 'Phase 5, DHA', phone: '021-111-331-331', hours: '9:00 AM - 5:00 PM', lat: 24.8059, lng: 67.0384, services: ['account_opening', 'financing'] },
    { id: 'MB-003', city: 'Lahore', area: 'Gulberg', address: 'Main Boulevard, Gulberg III', phone: '042-111-331-331', hours: '9:00 AM - 5:00 PM', lat: 31.5204, lng: 74.3587, services: ['account_opening', 'financing', 'zakat_advisory'] },
    { id: 'MB-004', city: 'Lahore', area: 'DHA', address: 'DHA Phase 6', phone: '042-111-331-331', hours: '9:00 AM - 5:00 PM', lat: 31.4739, lng: 74.3760, services: ['account_opening', 'financing'] },
    { id: 'MB-005', city: 'Islamabad', area: 'Blue Area', address: 'Blue Area, Jinnah Avenue', phone: '051-111-331-331', hours: '9:00 AM - 5:00 PM', lat: 33.6844, lng: 73.0479, services: ['account_opening', 'financing', 'zakat_advisory'] },
    { id: 'MB-006', city: 'Faisalabad', area: 'D-Ground', address: 'D-Ground, Peoples Colony', phone: '041-111-331-331', hours: '9:00 AM - 5:00 PM', lat: 31.4504, lng: 73.1350, services: ['account_opening', 'financing'] },
    { id: 'MB-007', city: 'Peshawar', area: 'Saddar', address: 'Saddar Bazaar', phone: '091-111-331-331', hours: '9:00 AM - 5:00 PM', lat: 34.0151, lng: 71.5249, services: ['account_opening', 'financing'] },
    { id: 'MB-008', city: 'Quetta', area: 'Satellite Town', address: 'Satellite Town', phone: '081-111-331-331', hours: '9:00 AM - 5:00 PM', lat: 30.1798, lng: 66.9745, services: ['account_opening', 'financing'] },
  ],
  Albilad: [
    { id: 'AB-001', city: 'Karachi', area: 'Sad', address: 'Sad', phone: '021-111-252-523', hours: '9:00 AM - 5:00 PM', lat: 24.8607, lng: 67.0011, services: ['account_opening', 'financing'] },
    { id: 'AB-002', city: 'Lahore', area: 'M.M. Alam Road', address: 'M.M. Alam Road', phone: '042-111-252-523', hours: '9:00 AM - 5:00 PM', lat: 31.5133, lng: 74.3489, services: ['account_opening', 'financing'] },
    { id: 'AB-003', city: 'Islamabad', area: 'F-7', address: 'F-7 Markaz', phone: '051-111-252-523', hours: '9:00 AM - 5:00 PM', lat: 33.7030, lng: 73.0390, services: ['account_opening', 'financing'] },
  ],
  Dubai: [
    { id: 'DIB-001', city: 'Karachi', area: 'Tariq Road', address: 'Tariq Road', phone: '021-111-342-342', hours: '9:00 AM - 5:00 PM', lat: 24.8699, lng: 67.0494, services: ['account_opening', 'financing'] },
    { id: 'DIB-002', city: 'Lahore', area: 'Liberty Market', address: 'Liberty Market', phone: '042-111-342-342', hours: '9:00 AM - 5:00 PM', lat: 31.5136, lng: 74.3445, services: ['account_opening', 'financing'] },
  ],
  HBL: [
    { id: 'HBL-001', city: 'Karachi', area: 'Saddar', address: 'Saddar', phone: '021-111-111-111', hours: '9:00 AM - 5:00 PM', lat: 24.8547, lng: 67.0110, services: ['account_opening', 'financing', 'islamic_banking'] },
    { id: 'HBL-002', city: 'Lahore', area: 'Mall Road', address: 'The Mall', phone: '042-111-111-111', hours: '9:00 AM - 5:00 PM', lat: 31.5546, lng: 74.3470, services: ['account_opening', 'financing', 'islamic_banking'] },
    { id: 'HBL-003', city: 'Islamabad', area: 'Blue Area', address: 'Blue Area', phone: '051-111-111-111', hours: '9:00 AM - 5:00 PM', lat: 33.6844, lng: 73.0479, services: ['account_opening', 'financing', 'islamic_banking'] },
  ],
};

/**
 * Calculate distance between two coordinates
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
 * @returns {number} Distance in km
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearby branches
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {number} radius - Search radius in km
 * @param {string} bank - Bank name (optional)
 * @returns {Array} Nearby branches
 */
function findNearbyBranches(lat, lng, radius = 10, bank = null) {
  const allBranches = [];

  for (const [bankKey, branches] of Object.entries(BRANCHES)) {
    if (bank && bankKey.toLowerCase() !== bank.toLowerCase()) continue;

    for (const branch of branches) {
      const distance = calculateDistance(lat, lng, branch.lat, branch.lng);
      if (distance <= radius) {
        allBranches.push({
          ...branch,
          bank: bankKey,
          distance: Math.round(distance * 10) / 10,
        });
      }
    }
  }

  // Sort by distance
  allBranches.sort((a, b) => a.distance - b.distance);

  return allBranches;
}

/**
 * Find branches by city
 * @param {string} city - City name
 * @param {string} bank - Bank name (optional)
 * @returns {Array} Branches in city
 */
function findBranchesByCity(city, bank = null) {
  const allBranches = [];

  for (const [bankKey, branches] of Object.entries(BRANCHES)) {
    if (bank && bankKey.toLowerCase() !== bank.toLowerCase()) continue;

    for (const branch of branches) {
      if (branch.city.toLowerCase() === city.toLowerCase()) {
        allBranches.push({ ...branch, bank: bankKey });
      }
    }
  }

  return allBranches;
}

/**
 * Generate appointment slots
 * @param {string} branchId - Branch ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Array} Available slots
 */
function generateAppointmentSlots(branchId, date) {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM

  for (let hour = startHour; hour < endHour; hour++) {
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      available: Math.random() > 0.3, // 70% availability
    });
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:30`,
      available: Math.random() > 0.3,
    });
  }

  return slots;
}

/**
 * Book appointment
 * @param {object} data - Appointment data
 * @returns {object} Booking result
 */
async function bookAppointment(data) {
  const { branchId, date, time, name, phone, purpose } = data;

  // Validate
  if (!branchId || !date || !time || !name || !phone) {
    return { success: false, error: 'Missing required fields' };
  }

  // Generate appointment ID
  const appointmentId = `APT${Date.now().toString(36).toUpperCase()}`;

  // In production, store in database
  // await db.query(
  //   'INSERT INTO appointments (id, branch_id, date, time, name, phone, purpose, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
  //   [appointmentId, branchId, date, time, name, phone, purpose, 'confirmed']
  // );

  console.log('Appointment booked:', {
    id: appointmentId,
    branchId,
    date,
    time,
    name,
    phone,
    purpose,
  });

  return {
    success: true,
    appointment_id: appointmentId,
    branch_id: branchId,
    date,
    time,
    purpose,
    status: 'confirmed',
    message: 'Appointment booked successfully!',
    message_ur: 'اپائنٹمنٹ کامیابی سے بک ہو گئی!',
    reminder: 'Please arrive 10 minutes before your appointment time.',
    reminder_ur: 'براہ کرم اپنے اپائنٹمنٹ کے وقت سے 10 منٹ پہلے پہنچیں۔',
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Find branches
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const lat = parseFloat(url.searchParams.get('lat'));
    const lng = parseFloat(url.searchParams.get('lng'));
    const radius = parseFloat(url.searchParams.get('radius')) || 10;
    const city = url.searchParams.get('city');
    const bank = url.searchParams.get('bank');
    const branchId = url.searchParams.get('branch_id');
    const date = url.searchParams.get('date');

    // Get specific branch
    if (branchId) {
      for (const branches of Object.values(BRANCHES)) {
        const branch = branches.find(b => b.id === branchId);
        if (branch) {
          const slots = date ? generateAppointmentSlots(branchId, date) : [];
          return res.status(200).json({ branch, available_slots: slots });
        }
      }
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Find by coordinates
    if (!isNaN(lat) && !isNaN(lng)) {
      const branches = findNearbyBranches(lat, lng, radius, bank);
      return res.status(200).json({
        user_location: { lat, lng },
        radius_km: radius,
        branches_found: branches.length,
        branches,
      });
    }

    // Find by city
    if (city) {
      const branches = findBranchesByCity(city, bank);
      return res.status(200).json({
        city,
        branches_found: branches.length,
        branches,
      });
    }

    // List all cities
    const cities = [...new Set(Object.values(BRANCHES).flat().map(b => b.city))];
    return res.status(200).json({
      message: 'Branch Locator API',
      available_cities: cities,
      banks: Object.keys(BRANCHES),
    });
  }

  // POST — Book appointment
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      if (action === 'book' && data) {
        const result = await bookAppointment(data);
        return res.status(200).json(result);
      }

      if (action === 'slots' && data?.branch_id && data?.date) {
        const slots = generateAppointmentSlots(data.branch_id, data.date);
        return res.status(200).json({ slots });
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['book', 'slots'],
      });
    } catch (err) {
      console.error('Branch locator error:', err.message);
      return res.status(500).json({ error: 'Operation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
