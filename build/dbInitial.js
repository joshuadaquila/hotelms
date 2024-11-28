const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite'); 

async function initializeDatabase() {
  const db = new sqlite3.Database(dbPath);
  const defaultUsername = 'user@default';
  const defaultPassword = 'default.userpassword';


  db.serialize(async () => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        userid INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        roomid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        price FLOAT NOT NULL,
        status TEXT NOT NULL
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS guests (
        guestid INTEGER PRIMARY KEY AUTOINCREMENT,
        lastname TEXT NOT NULL,
        firstname TEXT NOT NULL,
        middlename TEXT NOT NULL,
        homeaddress TEXT NOT NULL,
        telephonenum TEXT,
        company TEXT,
        address TEXT NOT NULL,
        contactnum TEXT NOT NULL,
        email TEXT,
        nationality TEXT,
        passportnum TEXT,
        checkindate DATETIME NOT NULL,
        checkoutdate DATETIME NOT NULL,
        roomid INT NOT NULL,
        remarks TEXT,
        FOREIGN KEY (roomid) REFERENCES rooms(roomid) ON DELETE CASCADE
      );
    `);


    db.get("SELECT * FROM users WHERE username = ?", [defaultUsername], async (err, row) => {
      if (err) throw err;

      if (!row) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        db.run(`
          INSERT INTO users (username, password) VALUES (?, ?)
        `, [defaultUsername, hashedPassword]);
        console.log('Inserted default admin user with hashed password.');
      } else {
        console.log('Admin user already exists.');
      }
    });
  });

  db.all("SELECT * FROM rooms", [], (err, rows) => {
    if (err) throw err;
  
    if (rows.length === 0) {
      // Define default room types and counts
      const defaultRooms = [
        { room_type: 'Standard Room', price: 500.00, status: 'Available', count: 2 },
        { room_type: 'Deluxe Room', price: 800.00, status: 'Available', count: 5 },
      ];
  
      defaultRooms.forEach(room => {
        for (let i = 0; i < room.count; i++) {
          const roomName = `${room.room_type} - Room ${i + 1}`;
  
          db.run(`
            INSERT INTO rooms (type, price, status, name) VALUES (?, ?, ?, ?)
          `, [room.room_type, room.price, room.status, roomName], (err) => {
            if (err) {
              console.error('Error inserting default room:', err);
            } else {
              console.log(`Inserted default room: ${roomName}`);
            }
          });
        }
      });
    } else {
      console.log('Default rooms already exist.');
    }
  });
  

  // db.close();
}

module.exports = initializeDatabase;
