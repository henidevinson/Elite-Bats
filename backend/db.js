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

// Generate guaranteed valid bcrypt hash for "admin123"
const salt = bcrypt.genSaltSync(10);
const validAdminHash = bcrypt.hashSync('admin123', salt);

const existingAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
if (!existingAdmin) {
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', validAdminHash);
  console.log('Seeded demo admin account (username: "admin", password: "admin123")');
} else if (!existingAdmin.password || !existingAdmin.password.startsWith('$2')) {
  // Fix any previously stored plain-text password
  db.prepare('UPDATE admins SET password = ? WHERE username = ?').run(validAdminHash, 'admin');
  console.log('Updated legacy admin password with secure bcrypt hash.');
}

// Seed initial products if table is empty
const productCount = db.prepare('SELECT COUNT(*) AS count FROM products').get();
if (productCount.count === 0) {
  const insertStmt = db.prepare(`
    INSERT INTO products (
      id, name, brand, price, shortDescription, description, weight, willowType, availability, image
    ) VALUES (
      @id, @name, @brand, @price, @shortDescription, @description, @weight, @willowType, @availability, @image
    )
  `);

  const initialBats = [
    {
      id: 'bat-001',
      name: 'SS Master 7000 English Willow',
      brand: 'SS',
      price: 15499,
      shortDescription: 'Grade 1 English Willow with 40mm thick contoured edges.',
      description: 'Hand-crafted from selected Grade 1 English Willow. Mid-to-low sweet spot and 9-piece cane handle.',
      weight: '1180g - 1200g',
      willowType: 'English Willow',
      availability: 'In Stock',
      image: ''
    },
    {
      id: 'bat-002',
      name: 'SG Player Edition Kashmir Willow',
      brand: 'SG',
      price: 3499,
      shortDescription: 'Durable seasoned Kashmir willow blade ideal for leather ball matches.',
      description: 'Engineered from hard-pressed seasoned Kashmir willow with toe protector.',
      weight: '1200g - 1230g',
      willowType: 'Kashmir Willow',
      availability: 'In Stock',
      image: ''
    },
    {
      id: 'bat-003',
      name: 'MRF Grand Edition Grade 1',
      brand: 'MRF',
      price: 21999,
      shortDescription: 'Supreme Grade 1 English Willow for dynamic stroke play.',
      description: 'Iconic shape favored by international batsmen. Supreme balance and grain structure.',
      weight: '1160g - 1190g',
      willowType: 'English Willow',
      availability: 'In Stock',
      image: ''
    }
  ];

  const insertMany = db.transaction((bats) => {
    for (const bat of bats) insertStmt.run(bat);
  });
  insertMany(initialBats);
}

export default db;
