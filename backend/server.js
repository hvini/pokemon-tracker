const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize In-Memory SQLite Database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to the in-memory SQLite database.');
});

// Create Table
db.serialize(() => {
  db.run(`CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setName TEXT,
    cardName TEXT,
    variant TEXT,
    quantity INTEGER
  )`);
});

// GET all cards
app.get('/api/cards', (req, res) => {
  db.all('SELECT * FROM cards ORDER BY setName, cardName', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST a new card (or increment existing)
app.post('/api/cards', (req, res) => {
  const { setName, cardName, variant } = req.body;

  db.get(
    `SELECT * FROM cards WHERE setName = ? AND cardName = ? AND variant = ?`,
    [setName, cardName, variant],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        db.run(`UPDATE cards SET quantity = quantity + 1 WHERE id = ?`, [row.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Quantity updated', id: row.id, quantity: row.quantity + 1 });
          }
        );
      } else {
        db.run(`INSERT INTO cards (setName, cardName, variant, quantity) VALUES (?, ?, ?, ?)`,
          [setName, cardName, variant, 1], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Card added', id: this.lastID, quantity: 1 });
          }
        );
      }
    }
  );
});

// DELETE a card (decrement quantity or remove entirely)
app.delete('/api/cards/:id', (req, res) => {
  const id = req.params.id;

  db.get(`SELECT quantity FROM cards WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Card not found' });

    if (row.quantity > 1) {
      // Decrease quantity if more than 1
      db.run(`UPDATE cards SET quantity = quantity - 1 WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Quantity decreased' });
      });
    } else {
      // Remove row entirely if quantity is 1
      db.run(`DELETE FROM cards WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Card removed entirely' });
      });
    }
  });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});