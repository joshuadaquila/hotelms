const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const initializeDatabase = require('./dbInitial');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const url = require('url')

const startServer = () => {
  const serverApp = express();
  const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
  // Check if the database exists in the userData folder, if not, copy it there
  if (!fs.existsSync(dbPath)) {
    const originalDbPath = path.join(__dirname, 'database.sqlite');
    console.log('Copying database from', originalDbPath, 'to', dbPath);
    fs.copyFileSync(originalDbPath, dbPath);
    }
  
    // Now use the database path
    console.log('Using database at:', dbPath);
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
        console.error('Error opening database', err);
        } else {
        console.log('Database connected');
        }
    });

  console.log(dbPath)

  serverApp.use(cors());
  serverApp.use(express.json());

  serverApp.get('/api/rooms', (req, res) => {
        db.all(`SELECT type, COUNT(*) AS available_count
        FROM rooms
        WHERE status <> 'Occupied'
        GROUP BY type
        
        UNION ALL
        
        SELECT 'Total' AS type, COUNT(*) AS available_count
        FROM rooms
        WHERE status <> 'Occupied';
      `, [], (err, rows) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
          res.json(rows);
      });
  });

  serverApp.get('/api/getOccupied', (req, res) => {
        db.all(`SELECT name
        FROM rooms         
        WHERE status = 'Occupied'
        ;
      `, [], (err, rows) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
          res.json(rows);
      });
  });

    serverApp.get('/api/getReserved', (req, res) => {
        db.all(`SELECT roomid
        FROM rooms         
        WHERE status = 'Reserved'
        ;
    `, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
    });

    serverApp.get('/api/getRoomInfo', (req, res) => {
        const roomId = req.query.roomId; // Expecting `roomid` as a query parameter
    
        if (!roomId) {
            return res.status(400).json({ error: "Missing required 'roomid' parameter" });
        }
    
        db.all(
            `SELECT *
             FROM rooms         
             WHERE roomid = ?;`,
            [roomId], // Pass the roomId as a parameter to the SQL query
            (err, rows) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Database query failed" });
                }
    
                res.json(rows);
            }
        );
    });
    


    serverApp.get('/api/reservations', (req, res) => {
        db.all(`SELECT res.*, r.name as roomname
        FROM reservations res INNER JOIN rooms r
        ON res.roomid = r.roomid
        WHERE res.status = 'active'
        ORDER BY res.checkindate ASC
        ;
        `, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    serverApp.get('/api/checkedin', (req, res) => {
        db.all(`SELECT g.lastname, g.firstname, g.checkindate, g.checkoutdate, r.name
        FROM checkins c INNER JOIN
        guests g ON c.guestid = g.guestid
        INNER JOIN rooms r
        ON c.roomid = r.roomid
        WHERE c.status = 'active'
        ;
        `, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    serverApp.post('/api/addReservation', (req, res) => {
        const { 
            guestName: name, 
            checkinDate: checkindate, 
            checkoutDate: checkoutdate, 
            roomId: roomid 
        } = req.body;
    
        // First, check if the room is currently available (not occupied or reserved)
        const checkRoomAvailabilityQuery = `
            SELECT r.roomid, c.status
            FROM rooms r
            LEFT JOIN checkins c ON r.roomid = c.roomid
            LEFT JOIN guests g ON c.guestid = g.guestid
            WHERE r.roomid = ? AND c.status = 'active'
            AND ((? <= g.checkoutdate AND ? > g.checkindate) 
                OR (? < g.checkindate AND ? >= g.checkoutdate));
        `;
        
        db.get(checkRoomAvailabilityQuery, [roomid, checkindate, checkoutdate, checkindate, checkoutdate], function(err, room) {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            }
    
            // If the room is occupied or reserved, reject the reservation
            if (room) {
                return res.status(400).json({ message: 'Room is currently occupied' });
            }
    
            const checkReservationConflictQuery = `
                SELECT * FROM reservations
                WHERE roomid = ? 
                AND ((checkindate <= ? AND checkoutdate > ?) 
                OR (checkindate < ? AND checkoutdate >= ?));
            `;
            
            // If the room is available, check for any scheduling conflicts
            db.get(checkReservationConflictQuery, [roomid, checkoutdate, checkindate, checkindate, checkoutdate], function(err, conflictingReservation) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
    
                // If there's a scheduling conflict, reject the reservation
                if (conflictingReservation) {
                    return res.status(400).json({ error: 'Room is already reserved during the selected dates.' });
                }
    
                // If no conflicts, proceed with the reservation
                db.serialize(() => {
                    // Insert the reservation into the reservations table
                    db.run(`
                        INSERT INTO reservations (name, checkindate, checkoutdate, roomid, date, status)
                        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'active');
                    `, [name, checkindate, checkoutdate, roomid], function(err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
    
                        // Update the room status in the rooms table to 'Reserved'
                        db.run(`
                            UPDATE rooms
                            SET status = 'Reserved'
                            WHERE roomid = ? AND status = 'Available';
                        `, [roomid], function(err) {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }
    
                            res.json({ message: 'Reservation added and room status updated successfully' });
                        });
                    });
                });
            });
        });
    });
    
    serverApp.post('/api/updateReservation', (req, res) => {
        const { 
            guestName: name, 
            checkinDate: checkindate, 
            checkoutDate: checkoutdate, 
            roomId: roomid,
            reservationid 
        } = req.body;
    
        // First, check if the room is currently available (not occupied or reserved)
        const checkRoomAvailabilityQuery = `
            SELECT r.roomid, c.status
            FROM rooms r
            LEFT JOIN checkins c ON r.roomid = c.roomid
            LEFT JOIN guests g ON c.guestid = g.guestid
            WHERE r.roomid = ? AND c.status = 'active'
            AND ((? <= g.checkoutdate AND ? > g.checkindate) 
                OR (? < g.checkindate AND ? >= g.checkoutdate));
        `;
        
        db.get(checkRoomAvailabilityQuery, [roomid, checkindate, checkoutdate, checkindate, checkoutdate], function(err, room) {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            }
    
            // If the room is occupied or reserved, reject the reservation
            if (room) {
                return res.status(400).json({ message: 'Room is currently occupied' });
            }
    
            // If the room is available, proceed with the reservation
            db.serialize(() => {
                // Update the reservation in the reservations table
                db.run(`
                    UPDATE reservations
                    SET 
                        name = ?, 
                        checkindate = ?, 
                        checkoutdate = ?, 
                        roomid = ?
                    WHERE reservationid = ?;
                `, [name, checkindate, checkoutdate, roomid, reservationid], function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
    
                    // Update the room status in the rooms table to 'Reserved'
                    db.run(`
                        UPDATE rooms
                        SET status = 'Reserved'
                        WHERE roomid = ? AND status = 'Available';
                    `, [roomid], function(err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
    
                        res.json({ message: 'Reservation updated and room status updated successfully' });
                    });
                });
            });
        });
    });

    serverApp.post('/api/deleteReservation', (req, res) => {
        const { reservationid, roomid } = req.body;
    
        if (!reservationid || !roomid) {
            return res.status(400).json({ error: 'Reservation ID and Room ID are required' });
        }
    
        db.serialize(() => {
            // Delete the reservation
            db.run(`
                UPDATE reservations SET status = 'cancelled'
                WHERE reservationid = ?;
            `, [reservationid], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
    
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Reservation not found' });
                }
    
                // Check if there are other active reservations for the same room
                db.get(`
                    SELECT COUNT(*) AS count
                    FROM reservations
                    WHERE roomid = ? AND status = 'active';
                `, [roomid], function(err, result) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
    
                    // If no other reservations exist for the room, update the room's status to "Available"
                    if (result.count === 0) {
                        db.run(`
                            UPDATE rooms
                            SET status = 'Available'
                            WHERE roomid = ?;
                        `, [roomid], function(err) {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }
    
                            return res.json({ message: 'Reservation deleted and room status updated to Available' });
                        });
                    } else {
                        // If there are other reservations, just confirm the deletion
                        return res.json({ message: 'Reservation deleted, but the room status remains unchanged as there are other active reservations' });
                    }
                });
            });
        });
    });
    
    
    serverApp.get('/api/pastreservations', (req, res) => {
        db.all(`SELECT res.*, r.name as roomname
        FROM reservations res INNER JOIN rooms r
        ON res.roomid = r.roomid
        WHERE res.status = 'fulfilled'
        ;
        `, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    serverApp.get('/api/getOccupiedDetails', (req, res) => {
        const room = req.query.room; // Get the 'room' parameter from the query string

        // Adjust the SQL query to use the room parameter in the WHERE clause
        const query = `
            SELECT g.guestid, g.lastname, g.firstname, g.middlename, g.checkoutdate, r.name
            FROM guests g
            INNER JOIN rooms r ON g.roomid = r.roomid
            WHERE r.name = ?
            ORDER BY g.guestid DESC
            LIMIT 1;
        
        `;

        db.all(query, [room], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    serverApp.get('/api/getReservedDetails', (req, res) => {
        const room = req.query.room; // Get the 'room' parameter from the query string

        // Adjust the SQL query to use the room parameter in the WHERE clause
        const query = `
            SELECT res.*, r.name as roomname
            FROM reservations res
            INNER JOIN rooms r ON res.roomid = r.roomid
            WHERE res.roomid = ? AND res.status = 'active'
            ORDER BY checkindate ASC
            LIMIT 1;
        `;

        db.all(query, [room], (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
                
            }
            res.json(rows);
        });
    });


    serverApp.get('/api/guest', (req, res) => {
        db.all(`SELECT g.guestid, g.lastname, g.firstname, g.middlename, r.name,
            g.checkindate, g.checkoutdate
            FROM guests g INNER JOIN checkins c ON g.guestid = c.guestid
            INNER JOIN rooms r ON c.roomid = r.roomid
            WHERE c.status = 'active'      
        
        ;
    `, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
    });

    serverApp.get('/api/guestDetails', (req, res) => {
        const guestid = req.query.guestid; // Get the 'room' parameter from the query string

        console.log("guestid ", guestid);
        // Adjust the SQL query to use the room parameter in the WHERE clause
        const query = `
            SELECT g.*, r.* 
            FROM guests g 
            INNER JOIN rooms r ON g.roomid = r.roomid         
            WHERE g.guestid = ?
        `;
        console.log(query);
        db.all(query, [guestid], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    serverApp.get('/api/admin/getMonthlyOccupants', (req, res) => {
        const query = `
            SELECT 
            (SELECT COUNT(*) 
            FROM checkins c INNER JOIN guests g ON c.guestid = g.guestid
            WHERE strftime('%Y-%m', g.checkindate) = strftime('%Y-%m', 'now')) AS total_current_month,
            (SELECT COUNT(*) 
            FROM checkins c INNER JOIN guests g ON c.guestid = g.guestid
            WHERE strftime('%Y-%m', g.checkindate) = strftime('%Y-%m', datetime('now', '-1 month'))) AS total_previous_month;
    
        `;
        console.log(query);
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    serverApp.get('/api/admin/monthlyCounts', (req, res) => {
        const year = req.query.year || new Date().getFullYear(); // Default to the current year if not provided
        const query = `
            SELECT 
                CASE strftime('%m', g.checkindate)
                    WHEN '01' THEN 'January'
                    WHEN '02' THEN 'February'
                    WHEN '03' THEN 'March'
                    WHEN '04' THEN 'April'
                    WHEN '05' THEN 'May'
                    WHEN '06' THEN 'June'
                    WHEN '07' THEN 'July'
                    WHEN '08' THEN 'August'
                    WHEN '09' THEN 'September'
                    WHEN '10' THEN 'October'
                    WHEN '11' THEN 'November'
                    WHEN '12' THEN 'December'
                END || ' ' || strftime('%Y', g.checkindate) AS month,
                COUNT(DISTINCT c.roomid) AS occupied_rooms
            FROM checkins c
            INNER JOIN guests g ON c.guestid = g.guestid
            WHERE strftime('%Y', g.checkindate) = ?
            GROUP BY strftime('%Y-%m', g.checkindate);
        `;
    
        // Log the query and year for debugging
        console.log(`Executing query for year: ${year}`);
    
        db.all(query, [year], (err, rows) => { // Bind the year parameter securely
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
    
            res.json(rows);
        });
    });
    

    serverApp.get('/api/getLatestId', (req, res) => {
        const query = `
            SELECT seq as guestid FROM sqlite_sequence WHERE name = 'guests';
        `;
        console.log(query);
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });
    serverApp.get('/api/billing', (req, res) => {
        const query = `
            SELECT g.*, p.* 
            FROM guests g INNER JOIN checkins c
            ON g.guestid = c.guestid INNER JOIN payments p
            ON c.paymentid = p.paymentid
            WHERE c.status = 'active'
        `;
        console.log(query);
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    serverApp.post('/api/checkout', (req, res) => {
        // Get the required parameters from the request body
        const { roomid } = req.body;
    
        if (!roomid) {
            return res.status(400).json({ error: "Missing required parameter: roomid" });
        }
    
        // Use parameterized queries to avoid SQL injection
        const updateCheckinsQuery = `
            UPDATE checkins SET status = ? WHERE roomid = ?;
        `;
        const updateRoomsQuery = `
            UPDATE rooms SET status = ? WHERE roomid = ?;
        `;
        const checkReservationQuery = `
            SELECT * FROM reservations WHERE roomid = ? AND status = 'active';
        `;
    
        // Execute the queries
        db.run(updateCheckinsQuery, ['fulfilled', roomid], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
    
            // Check if there is an active reservation for this room
            db.get(checkReservationQuery, [roomid], function (err, reservation) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
    
                const nextStatus = reservation ? 'Reserved' : 'Available';
    
                // Update the room status based on reservation existence
                db.run(updateRoomsQuery, [nextStatus, roomid], function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
    
                    // Send success response
                    res.json({ 
                        message: 'Checkout process completed successfully.',
                        nextStatus: nextStatus,
                    });
                });
            });
        });
    });
    
    
    

    serverApp.post('/api/checkinGuest', (req, res) => {
        console.log('Request Body:', req.body); // Log the incoming request body
    
        // Normalize the input to always be an array
        const guests = Array.isArray(req.body) ? req.body : [req.body];
    
        // Combine fields into a single object
        const combinedGuest = guests.reduce((acc, guest) => {
            acc.firstName = acc.firstName || [];
            acc.lastName = acc.lastName || [];
            acc.middleName = acc.middleName || [];
    
            // Collect firstName, lastName, and middleName separately
            acc.firstName.push(guest.firstName || '');
            acc.lastName.push(guest.lastName || '');
            acc.middleName.push(guest.middleName || '');
    
            // Check for identical values in checkInDate, checkOutDate, and roomNumber
            ['checkInDate', 'checkOutDate', 'roomNumber'].forEach(field => {
                if (!acc[field]) {
                    acc[field] = guest[field];
                } else if (acc[field] !== guest[field]) {
                    acc[field] = null; // Mark as invalid if values differ
                }
            });
    
            // Aggregate other fields into arrays
            for (const [key, value] of Object.entries(guest)) {
                if (!['firstName', 'lastName', 'middleName', 'checkInDate', 'checkOutDate', 'roomNumber'].includes(key)) {
                    acc[key] = acc[key] || [];
                    acc[key].push(value || ''); // Push the value or default to an empty string
                }
            }
    
            return acc;
        }, {});
    
        // Handle invalid cases for checkInDate, checkOutDate, and roomNumber
        ['checkInDate', 'checkOutDate', 'roomNumber'].forEach(field => {
            if (combinedGuest[field] === null) {
                return res.status(400).json({ error: `${field} must be the same for all guests` });
            }
        });
    
        console.log('Combined Guest Data:', combinedGuest);
    
        // Prepare data for the database
        const guestParams = [
            combinedGuest.firstName.join('| '), // Join first names into a single string
            combinedGuest.lastName.join('| '),  // Join last names into a single string
            combinedGuest.middleName.join('| '), // Join middle names into a single string
            combinedGuest.homeAddress.join('| '),
            combinedGuest.telephoneNumber.join('| '),
            combinedGuest.companyOrganization.join('| '),
            combinedGuest.address.join('| '),
            combinedGuest.companyTelephone.join('| '),
            combinedGuest.contactNumber.join('| '),
            combinedGuest.email.join('| '),
            combinedGuest.nationality.join('| '),
            combinedGuest.passportNumber.join('| '),
            combinedGuest.checkInDate, // Single value
            combinedGuest.checkOutDate, // Single value
            combinedGuest.roomNumber, // Single value
            combinedGuest.remarks.join('| '),
        ];
    
        const query = `
            INSERT INTO guests 
            (firstname, lastname, middlename, homeaddress, telephonenum, company, address, 
             companytel, contactnum, email, nationality, passportnum, checkindate, checkoutdate, roomid, remarks) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    
        db.run(query, guestParams, function(err) {
            if (err) {
                console.error('Database Error:', err.message); // Log the error message
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: 'Guest checked in successfully', id: this.lastID });
            }
        });
    });
    

    serverApp.post('/api/login', (req, res) => {
        const { username, password } = req.body;
      
        // Query to get the user by username
        const query = `
          SELECT * FROM users WHERE username = ?
        `;
      
        // Execute the query to get the user information
        db.all(query, [username], async (error, results) => {
          if (error) {
            console.error("Error executing query:", error);
            return res.status(500).json({ error: "Internal server error" });
          }
      
          if (results.length > 0) {
            const user = results[0];
      
            // Compare provided password with hashed password in the database
            const match = await bcrypt.compare(password, user.password);
      
            if (match) {
              // If the password matches, login is successful
              res.status(200).json({ message: "Login successful", user: { id: user.userid, username: user.username } });
            } else {
              // If password does not match
              res.status(401).json({ error: "Invalid username or password" });
            }
          } else {
            // If no matching user is found
            res.status(401).json({ error: "Invalid username or password" });
          }
        });
    });

    serverApp.post('/api/admin/login', (req, res) => {
        const { username, password } = req.body;
      
        // Query to get the user by username
        const query = `
          SELECT * FROM users WHERE username = ?
        `;
      
        // Execute the query to get the user information
        db.all(query, [username], async (error, results) => {
          if (error) {
            console.error("Error executing query:", error);
            return res.status(500).json({ error: "Internal server error" });
          }
      
          if (results.length > 0) {
            const user = results[0];
      
            // Compare provided password with hashed password in the database
            const match = await bcrypt.compare(password, user.password);
      
            if (match) {
              // If the password matches, login is successful
              res.status(200).json({ message: "Login successful", user: { id: user.userid, username: user.username } });
            } else {
              // If password does not match
              res.status(401).json({ error: "Invalid username or password" });
            }
          } else {
            // If no matching user is found
            res.status(401).json({ error: "Invalid username or password" });
          }
        });
    });

    serverApp.post('/api/saveTransaction', (req, res) => {
        const {
            guestid,
            totalAmountDue,
            amountPaid,
            change,
            roomid,
            reservationid,
            userid
        } = req.body;
        
        console.log(req.body)
    
        // SQL transaction
        const queryPayments = `
            INSERT INTO payments(type, amountdue, amountreceived, change)
            VALUES ('cash', ?, ?, ?);
        `;
    
        const queryUpdateRoom = `
            UPDATE rooms
            SET status = 'Occupied'
            WHERE roomid = ?;
        `;
    
        const queryCheckin = `
            INSERT INTO checkins (guestid, reservationid, roomid, paymentid, userid, status)
            VALUES (?, ?, ?, (SELECT last_insert_rowid()), ?, 'active');
        `;
    
        db.serialize(() => {
            console.log("Starting transaction...");
    
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) console.error("Error starting transaction:", err.message);
            });
    
            // Insert into payments table
            db.run(queryPayments, [totalAmountDue, amountPaid, change], function (err) {
                if (err) {
                    console.error("Error in queryPayments:", err.message);
                    return db.run("ROLLBACK", () => {
                        console.log("Transaction rolled back due to error in payments.");
                        return res.status(500).json({ error: err.message });
                    });
                }
    
                console.log("Payments insert successful, payment ID:", this.lastID);
    
                // Update room status
                db.run(queryUpdateRoom, [roomid], function (err) {
                    if (err) {
                        console.error("Error in queryUpdateRoom:", err.message);
                        return db.run("ROLLBACK", () => {
                            console.log("Transaction rolled back due to error in room update.");
                            return res.status(500).json({ error: err.message });
                        });
                    }
    
                    console.log("Room update successful for room ID:", roomid);
    
                    // Insert into checkins table
                    db.run(queryCheckin, [guestid, reservationid, roomid, userid], function (err) {
                        if (err) {
                            console.error("Error in queryCheckin:", err.message);
                            return db.run("ROLLBACK", () => {
                                console.log("Transaction rolled back due to error in checkin.");
                                return res.status(500).json({ error: err.message });
                            });
                        }
    
                        console.log("Check-in insert successful for guest ID:", guestid);
    
                        // Commit transaction
                        db.run("COMMIT", (err) => {
                            if (err) {
                                console.error("Error committing transaction:", err.message);
                                return res.status(500).json({ error: err.message });
                            }
    
                            console.log("Transaction committed successfully.");
                            return res.json({ message: 'Transaction saved successfully.' });
                        });
                    });
                });
            });
        });
    });
    

    
    
    

  const port = 3001;
  serverApp.listen(port, () => {
      console.log(`API server running at http://localhost:${port}`);
  });
};

// Function to stop your server
function stopServer() {
    if (server) {
        server.close(() => {
            console.log('Server stopped');
        });
    }
}


let win; // Main window reference
let server; // Server reference

function createWindow() {
    // Get the primary display's size
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window with the display's dimensions
    win = new BrowserWindow({
        width,
        height,
        icon: path.join(__dirname, '../src/resources/hmslogo.png'),
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // Load the React app
    // win.loadURL(`file://${__dirname}/../build/index.html`);
    win.loadURL("http://localhost:3000")

    // Event: Window closed
    win.on("closed", () => {
        win = null;
    });
}

// Ensure only one instance of the app is running
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit(); // Quit if another instance is already running
} else {
    app.on('second-instance', () => {
        // If another instance is attempted, focus the existing window
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });

    // App ready
    app.on('ready', () => {
        createWindow();
        initializeDatabase();
        startServer();
    });
}

// Close servers when the app is closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        stopServer(); // Custom function to stop the server
        app.quit();
    }
});

// macOS specific: Re-create a window if none are open
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
