const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const keysPath = './keys.json';

// Загружаем ключи из файла
let keysDB = JSON.parse(fs.readFileSync(keysPath));

app.post('/verify', (req, res) => {
  const { key, hwid } = req.body;

  if (!key || !hwid) {
    return res.status(400).json({ valid: false, message: "Missing key or hwid" });
  }

  if (!keysDB.hasOwnProperty(key)) {
    return res.json({ valid: false, message: "Invalid key" });
  }

  if (keysDB[key] === null) {
    // Привязываем HWID к ключу
    keysDB[key] = hwid;

    try {
      fs.writeFileSync(keysPath, JSON.stringify(keysDB, null, 2));
      console.log(`[✔] HWID записан для ключа: ${key} → ${hwid}`);
    } catch (err) {
      console.error(`[❌] Ошибка при записи в keys.json:`, err);
    }

    return res.json({ valid: true });
  } else if (keysDB[key] === hwid) {
    return res.json({ valid: true });
  } else {
    return res.json({ valid: false, message: "Key is already used on another PC" });
  }
});

const port = process.env.PORT || 10000;

app.listen(port, () => {
  console.log(`Auth server started on port ${port}`);
});
