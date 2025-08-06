const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const keysPath = './keys.json';
let keysDB = JSON.parse(fs.readFileSync(keysPath));

let saveTimeout = null;
function saveKeysDB() {
  if (saveTimeout) return; // Уже запланировано сохранение
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(keysPath, JSON.stringify(keysDB, null, 2));
      console.log(`[✔] keys.json сохранён`);
    } catch (err) {
      console.error(`[❌] Ошибка при записи keys.json:`, err);
    }
    saveTimeout = null;
  }, 5000); // Отложить запись на 5 секунд, чтобы объединить несколько изменений
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
    saveKeysDB();
    console.log(`[✔] HWID записан для ключа: ${key} → ${hwid}`);
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
