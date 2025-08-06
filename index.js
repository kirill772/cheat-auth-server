const express = require('express');
const fs = require('fs'); // ← Только один раз

const app = express();
app.use(express.json());

let keysDB = JSON.parse(fs.readFileSync('keys.json'));

function saveKeys() {
  try {
    fs.writeFileSync('keys.json', JSON.stringify(keysDB, null, 2));
    console.log('keys.json updated');
  } catch (error) {
    console.error('Error saving keys.json:', error);
  }
}

app.post('/verify', (req, res) => {
  const { key, hwid } = req.body;

  if (!key || !hwid) {
    return res.status(400).json({ valid: false, message: "Missing key or hwid" });
  }

  if (!keysDB.hasOwnProperty(key)) {
    return res.json({ valid: false, message: "Invalid key" });
  }

  if (keysDB[key] === null) {
    keysDB[key] = hwid;
    saveKeys();
    return res.json({ valid: true });
  } else if (keysDB[key] === hwid) {
    return res.json({ valid: true });
  } else {
    return res.json({ valid: false, message: "Key is already used on another PC" });
  }
});

app.listen(10000, () => {
  console.log('Auth server started on port 10000');
});
