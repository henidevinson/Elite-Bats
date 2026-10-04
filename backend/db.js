import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'cricket_bat_shop.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// 1. Products Table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    price REAL NOT NULL,
    shortDescription TEXT,
    description TEXT,
    weight TEXT,
    willowType TEXT NOT NULL,
    availability TEXT NOT NULL DEFAULT 'In Stock',
    image TEXT DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 2. Admins Table
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Admin Account
const salt = bcrypt.genSaltSync(10);
const validAdminHash = bcrypt.hashSync('admin123', salt);
const existingAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
if (!existingAdmin) {
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', validAdminHash);
} else if (!existingAdmin.password || !existingAdmin.password.startsWith('$2')) {
  db.prepare('UPDATE admins SET password = ? WHERE username = ?').run(validAdminHash, 'admin');
}

// 3. Permanent Self-Contained SVG Images stored directly inside the database
const ssSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 520'><rect x='73' y='20' width='14' height='150' rx='7' fill='%23d32f2f'/><path d='M68 170 C68 170 52 205 50 250 L48 475 C48 495 60 505 80 505 C100 505 112 495 112 475 L110 250 C108 205 92 170 92 170 Z' fill='%23f5deb3' stroke='%23b88a57' stroke-width='2'/><rect x='62' y='240' width='36' height='60' rx='4' fill='%230b0c0e'/><text x='80' y='268' font-family='sans-serif' font-weight='900' font-size='18' fill='%23cda35f' text-anchor='middle'>SS</text><text x='80' y='286' font-family='sans-serif' font-weight='800' font-size='8' fill='%23fff' text-anchor='middle'>MASTER</text></svg>";
const sgSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 520'><rect x='73' y='20' width='14' height='150' rx='7' fill='%231976d2'/><path d='M68 170 C68 170 52 205 50 250 L48 475 C48 495 60 505 80 505 C100 505 112 495 112 475 L110 250 C108 205 92 170 92 170 Z' fill='%23e2bf94' stroke='%23a1753e' stroke-width='2'/><rect x='62' y='240' width='36' height='60' rx='4' fill='%230d47a1'/><text x='80' y='268' font-family='sans-serif' font-weight='900' font-size='18' fill='%23fff' text-anchor='middle'>SG</text><text x='80' y='286' font-family='sans-serif' font-weight='800' font-size='8' fill='%23ffd700' text-anchor='middle'>PLAYER</text></svg>";
const mrfSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 520'><rect x='73' y='20' width='14' height='150' rx='7' fill='%23b71c1c'/><path d='M68 170 C68 170 52 205 50 250 L48 475 C48 495 60 505 80 505 C100 505 112 495 112 475 L110 250 C108 205 92 170 92 170 Z' fill='%23faebd7' stroke='%23b88a57' stroke-width='2'/><rect x='58' y='235' width='44' height='65' rx='4' fill='%23d32f2f'/><text x='80' y='262' font-family='sans-serif' font-weight='900' font-size='14' fill='%23fff' text-anchor='middle'>MRF</text><text x='80' y='278' font-family='sans-serif' font-weight='900' font-size='8' fill='%23ffd700' text-anchor='middle'>GRAND</text><text x='80' y='290' font-family='sans-serif' font-weight='700' font-size='7' fill='%23fff' text-anchor='middle'>EDITION</text></svg>";
const kookaburraSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 520'><rect x='73' y='20' width='14' height='150' rx='7' fill='%237cb342'/><path d='M68 170 C68 170 52 205 50 250 L48 475 C48 495 60 505 80 505 C100 505 112 495 112 475 L110 250 C108 205 92 170 92 170 Z' fill='%23f5e1c4' stroke='%23a1753e' stroke-width='2'/><rect x='60' y='240' width='40' height='60' rx='4' fill='%237cb342'/><text x='80' y='266' font-family='sans-serif' font-weight='900' font-size='11' fill='%23fff' text-anchor='middle'>KAHUNA</text><text x='80' y='284' font-family='sans-serif' font-weight='800' font-size='7' fill='%23111' text-anchor='middle'>KASHMIR</text></svg>";
const dscSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 520'><rect x='73' y='20' width='14' height='150' rx='7' fill='%23ff9800'/><path d='M68 170 C68 170 52 205 50 250 L48 475 C48 495 60 505 80 505 C100 505 112 495 112 475 L110 250 C108 205 92 170 92 170 Z' fill='%23faebd7' stroke='%23b88a57' stroke-width='2'/><rect x='60' y='240' width='40' height='60' rx='4' fill='%23ff6d00'/><text x='80' y='268' font-family='sans-serif' font-weight='900' font-size='16' fill='%23111' text-anchor='middle'>DSC</text><text x='80' y='286' font-family='sans-serif' font-weight='800' font-size='8' fill='%23fff' text-anchor='middle'>KRUNCH</text></svg>";
const ceatSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 520'><rect x='73' y='20' width='14' height='150' rx='7' fill='%230288d1'/><path d='M68 170 C68 170 52 205 50 250 L48 475 C48 495 60 505 80 505 C100 505 112 495 112 475 L110 250 C108 205 92 170 92 170 Z' fill='%23f5e1c4' stroke='%23a1753e' stroke-width='2'/><rect x='58' y='240' width='44' height='60' rx='4' fill='%230d47a1'/><text x='80' y='268' font-family='sans-serif' font-weight='900' font-size='16' fill='%23fff' text-anchor='middle'>CEAT</text><text x='80' y='286' font-family='sans-serif' font-weight='800' font-size='7' fill='%23ff6d00' text-anchor='middle'>HITMAN</text></svg>";

const permanentCatalogue = [
  {
    id: 'bat-001',
    name: 'SS Master 7000 English Willow',
    brand: 'SS',
    price: 15499,
    shortDescription: 'Grade 1 English Willow with 40mm thick contoured edges and light pickup.',
    description: 'Hand-crafted from selected Grade 1 English Willow. Features mid-to-low sweet spot and 9-piece cane handle for maximum punch.',
    weight: '1180g - 1200g',
    willowType: 'English Willow',
    availability: 'In Stock',
    image: ssSvg
  },
  {
    id: 'bat-002',
    name: 'SG Player Edition Kashmir Willow',
    brand: 'SG',
    price: 3499,
    shortDescription: 'Durable seasoned Kashmir willow blade ideal for club matches and leather balls.',
    description: 'Engineered from hard-pressed seasoned Kashmir willow. Custom-shaped with balanced blade profile and toe protector.',
    weight: '1200g - 1230g',
    willowType: 'Kashmir Willow',
    availability: 'In Stock',
    image: sgSvg
  },
  {
    id: 'bat-003',
    name: 'MRF Grand Edition Grade 1',
    brand: 'MRF',
    price: 21999,
    shortDescription: 'Supreme Grade 1 English Willow for dynamic international-level stroke play.',
    description: 'The iconic shape favored by world-class top-order batsmen. Extreme grain count and supreme balance for 360-degree strokeplay.',
    weight: '1160g - 1190g',
    willowType: 'English Willow',
    availability: 'In Stock',
    image: mrfSvg
  },
  {
    id: 'bat-004',
    name: 'Kookaburra Kahuna Kashmir Willow',
    brand: 'Kookaburra',
    price: 4299,
    shortDescription: 'High-impact Kashmir blade featuring a mid-blade sweet spot profile.',
    description: 'Crafted from selected Kashmir willow with the classic Kahuna profile. Outstanding pick-up designed for rapid hand speed.',
    weight: '1190g - 1220g',
    willowType: 'Kashmir Willow',
    availability: 'In Stock',
    image: kookaburraSvg
  },
  {
    id: 'bat-005',
    name: 'DSC Krunch 5.0 English Willow',
    brand: 'DSC',
    price: 8999,
    shortDescription: 'Exquisite balance with an enlarged sweet spot engineered for boundary hitters.',
    description: 'Constructed from superior Grade 3 English Willow. Prominent spine and wide face provide unmatched rebound punch.',
    weight: '1170g - 1210g',
    willowType: 'English Willow',
    availability: 'Out of Stock',
    image: dscSvg
  },
  {
    id: 'bat-006',
    name: 'CEAT Hitman Edition Kashmir Willow',
    brand: 'CEAT',
    price: 2999,
    shortDescription: 'Reliable all-round Kashmir bat suited for weekend tournaments and practice.',
    description: 'Built for heavy-duty club cricket. Offers high rebound value, comfortable ergonomic handle grip, and strong toe reinforcement.',
    weight: '1210g - 1240g',
    willowType: 'Kashmir Willow',
    availability: 'In Stock',
    image: ceatSvg
  }
];

const insertStmt = db.prepare(`
  INSERT INTO products (
    id, name, brand, price, shortDescription, description, weight, willowType, availability, image
  ) VALUES (
    @id, @name, @brand, @price, @shortDescription, @description, @weight, @willowType, @availability, @image
  )
`);

// Self-healing database:
// Automatically restores permanent images if missing, while preserving user-uploaded images!
for (const bat of permanentCatalogue) {
  const existing = db.prepare('SELECT id, image FROM products WHERE id = ?').get(bat.id);
  if (!existing) {
    insertStmt.run(bat);
  } else if (!existing.image || existing.image.trim() === '' || existing.image.startsWith('/uploads/')) {
    db.prepare('UPDATE products SET image = ? WHERE id = ?').run(bat.image, bat.id);
  }
}

export default db;
