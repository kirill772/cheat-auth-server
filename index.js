const express = require('express');
const app = express();
app.use(express.json());

// В реальном приложении нужно хранить в базе (например MongoDB)
const keysDB = {
  "key123": null,
  "key456": null
};

app.post('/verify', (req, res) => {
  const { key, hwid } = req.body;

  if (!key || !hwid) {
    return res.status(400).json({ valid: false, message: "Missing key or hwid" });
  }

  if (!keysDB.hasOwnProperty(key)) {
    return res.json({ valid: false, message: "Invalid key" });
  }

  if (keysDB[key] === null) {
    // Привязываем ключ к hwid при первом использовании
    keysDB[key] = hwid;
    return res.json({ valid: true });
  } else if (keysDB[key] === hwid) {
    // Ключ уже привязан к этому ПК
    return res.json({ valid: true });
  } else {
    // Ключ используется на другом ПК
    return res.json({ valid: false, message: "Key is already used on another PC" });
  }
});

app.listen(10000, () => {
  console.log('Auth server started on port 10000');
});
