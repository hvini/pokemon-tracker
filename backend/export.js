const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'pokemon.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

db.all('SELECT * FROM cards ORDER BY setName, cardName, variant', [], (err, rows) => {
  if (err) {
    console.error('Error fetching data:', err.message);
    process.exit(1);
  }

  let totalUnique = rows.length;
  let totalCards = rows.reduce((sum, row) => sum + row.quantity, 0);

  let mdContent = `# My Pokémon TCG Portfolio\n\n`;
  mdContent += `**Total Unique Cards:** ${totalUnique}\n`;
  mdContent += `**Total Total Cards:** ${totalCards}\n\n`;

  let currentSet = "";
  
  rows.forEach(row => {
    // Group by Set Name
    if (row.setName !== currentSet) {
      currentSet = row.setName;
      mdContent += `\n## ${currentSet}\n`;
    }
    
    // Capitalize the card name for a cleaner look (since we saved them in lowercase)
    const cleanName = row.cardName.replace(/\b\w/g, char => char.toUpperCase());
    
    mdContent += `- [ ] ${row.quantity}x ${cleanName} (${row.variant})\n`;
  });

  const outputPath = path.join(__dirname, 'portfolio.md');
  fs.writeFileSync(outputPath, mdContent, 'utf8');
  
  console.log(`\n✅ Successfully exported ${totalCards} cards to portfolio.md`);
  db.close();
});
