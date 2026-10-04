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

// Admin Account Seed
const salt = bcrypt.genSaltSync(10);
const validAdminHash = bcrypt.hashSync('admin123', salt);

const existingAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
if (!existingAdmin) {
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', validAdminHash);
} else if (!existingAdmin.password || !existingAdmin.password.startsWith('$2')) {
  db.prepare('UPDATE admins SET password = ? WHERE username = ?').run(validAdminHash, 'admin');
}

// 3. Permanent Catalogue with Attached Images
const permanentBats = [
  {
    id: 'bat-001',
    name: 'SS Master 7000 English Willow',
    brand: 'SS',
    price: 15499,
    shortDescription: 'Grade 1 English Willow with 40mm thick contoured edges and light pickup.',
    description: 'Hand-crafted from selected Grade 1 English Willow. Features a mid-to-low sweet spot, massive spine profile, and 9-piece cane handle for maximum shock absorption on heavy hits.',
    weight: '1180g - 1200g',
    willowType: 'English Willow',
    availability: 'In Stock',
    image: '/uploads/bat-ss-master.svg'
  },
  {
    id: 'bat-002',
    name: 'SG Player Edition Kashmir Willow',
    brand: 'SG',
    price: 3499,
    shortDescription: 'Durable seasoned Kashmir willow blade ideal for club matches and leather balls.',
    description: 'Engineered from hard-pressed seasoned Kashmir willow. Custom-shaped with a balanced blade profile and toe protector for durability against fast toe yorkers.',
    weight: '1200g - 1230g',
    willowType: 'Kashmir Willow',
    availability: 'In Stock',
    image: '/uploads/bat-sg-player.svg'
  },
  {
    id: 'bat-003',
    name: 'MRF Grand Edition Grade 1',
    brand: 'MRF',
    price: 21999,
    shortDescription: 'Supreme Grade 1 English Willow for dynamic international-level stroke play.',
    description: 'The iconic shape favored by world-class top-order batsmen. Extreme grain count, minimal concaving, and supreme balance for effortless 360-degree stroke making.',
    weight: '1160g - 1190g',
    willowType: 'English Willow',
    availability: 'In Stock',
    image: '/uploads/bat-mrf-grand.svg'
  },
  {
    id: 'bat-004',
    name: 'Kookaburra Kahuna Kashmir Willow',
    brand: 'Kookaburra',
    price: 4299,
    shortDescription: 'High-impact Kashmir blade featuring a mid-blade sweet spot profile.',
    description: 'Crafted from selected Kashmir willow with the classic Kahuna profile. Outstanding pick-up designed for rapid hand speed and aggressive counter-attacking drives.',
    weight: '1190g - 1220g',
    willowType: 'Kashmir Willow',
    availability: 'In Stock',
    image: '/uploads/bat-kookaburra-kahuna.svg'
  },
  {
    id: 'bat-005',
    name: 'DSC Krunch 5.0 English Willow',
    brand: 'DSC',
    price: 8999,
    shortDescription: 'Exquisite balance with an enlarged sweet spot engineered for boundary hitters.',
    description: 'Constructed from superior Grade 3 English Willow. Prominent spine and wide face provide unmatched rebound punch for maximums with minimal effort.',
    weight: '1170g - 1210g',
    willowType: 'English Willow',
    availability: 'Out of Stock',
    image: '/uploads/bat-dsc-krunch.svg'
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
    image: '/uploads/bat-ceat-hitman.svg'
  }
];

const insertStmt = db.prepare(`
  INSERT INTO products (
    id, name, brand, price, shortDescription, description, weight, willowType, availability, image
  ) VALUES (
    @id, @name, @brand, @price, @shortDescription, @description, @weight, @willowType, @availability, @image
  )
`);

// Self-healing: if any bat is missing or has an empty image, restore it!
for (const bat of permanentBats) {
  const existing = db.prepare('SELECT id, image FROM products WHERE id = ?').get(bat.id);
  if (!existing) {
    insertStmt.run(bat);
  } else if (!existing.image || existing.image.trim() === '') {
    db.prepare('UPDATE products SET image = ? WHERE id = ?').run(bat.image, bat.id);
  }
}

export default db;
