const { app, BrowserWindow, screen, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const dbPath = path.join(app.getPath('userData'), 'database.sqlite'); 

async function initializeDatabase() {
  const db = new sqlite3.Database(dbPath);
  const defaultUsername = 'user@default';
  const defaultPassword = 'default.userpassword';
  const adminUsername = 'admin@default';
  const adminPassword = 'default.adminpassword'


  db.serialize(async () => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        userid INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        usertype TEXT NOT NULL
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
      CREATE TABLE IF NOT EXISTS checkins (
        checkinid INTEGER PRIMARY KEY AUTOINCREMENT,
        guestid TEXT NOT NULL,
        reservationid INT,
        roomid INT NOT NULL,
        paymentid INT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        userid INT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        FOREIGN KEY (reservationid) REFERENCES reservations(reservationid),
        FOREIGN KEY (guestid) REFERENCES guests(guestid),
        FOREIGN KEY (roomid) REFERENCES rooms(roomid),
        FOREIGN KEY (paymentid) REFERENCES payments(paymentid),
        FOREIGN KEY(userid) REFERENCES users(userid)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS reservations (
        reservationid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        checkindate DATETIME NOT NULL,
        checkoutdate DATETIME NOT NULL,
        roomid INT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        FOREIGN KEY (roomid) REFERENCES rooms(roomid)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        paymentid INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amountdue FLOAT NOT NULL,
        amountreceived FLOAT NOT NULL,
        change FLOAT NOT NULL
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
        companytel TEXT,
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
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    
        // Insert default user
        db.run(`
          INSERT INTO users (username, password, usertype) VALUES (?, ?, ?)
        `, [defaultUsername, hashedPassword, 'user'], (err) => {
          if (err) console.error('Error inserting default user:', err);
          else console.log('Inserted default user with hashed password.');
        });
    
        // Insert default admin
        db.run(`
          INSERT INTO users (username, password, usertype) VALUES (?, ?, ?)
        `, [adminUsername, hashedAdminPassword, 'admin'], (err) => {
          if (err) console.error('Error inserting default admin:', err);
          else console.log('Inserted default admin with hashed password.');
        });
      } else {
        console.log('Admin user already exists.');
      }
    });    
  });

  async function insertDefaultRooms() {
    const rooms = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM rooms", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    if (rooms.length === 0) {
        const defaultRooms = [
            {
                room_type: 'Standard Room',
                price: 1500.00,
                status: 'Available',
                room_numbers: [102, 103, 201, 202, 205, 206],
            },
            {
                room_type: 'Deluxe Room',
                price: 1500.00,
                status: 'Available',
                room_numbers: [203, 204],
            },
        ];

        try {
            for (const room of defaultRooms) {
                for (const roomNumber of room.room_numbers) {
                    const roomName = `${room.room_type} - Room ${roomNumber}`;
                    await new Promise((resolve, reject) => {
                        db.run(`
                            INSERT INTO rooms (type, price, status, name) VALUES (?, ?, ?, ?)
                        `, [room.room_type, room.price, room.status, roomName], (err) => {
                            if (err) {
                                console.error('Error inserting default room:', err);
                                reject(err);
                            } else {
                                console.log(`Inserted default room: ${roomName}`);
                                resolve();
                            }
                        });
                    });
                }
            }
        } catch (error) {
            console.error('Failed to insert default rooms:', error);
        }
    } else {
        console.log('Default rooms already exist.');
    }
}


insertDefaultRooms();

  

  // db.close();
}

module.exports = initializeDatabase;
