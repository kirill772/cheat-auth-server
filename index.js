const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const KEYS_FILE = './keys.json';

// Функция чтения ключей из файла
function readKeys() {
  const data = fs.readFileSync(KEYS_FILE);
  return JSON.parse(data);
}

// Функция записи ключей в файл
function writeKeys(keys) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

// API для проверки ключа
app.post('/check-key', (req, res) => {
  const { key, pcId } = req.body;

  if (!key || !pcId) {
    return res.status(400).json({ status: 'error', message: 'key и pcId обязательны' });
  }

  let keys = readKeys();

  if (!(key in keys)) {
    return res.status(400).json({ status: 'error', message: 'Неверный ключ' });
  }

  if (keys[key] === null) {
    // Ключ не привязан — привязываем к этому pcId
    keys[key] = pcId;
    writeKeys(keys);
    return res.json({ status: 'ok', message: 'Ключ активирован и привязан к этому ПК' });
  }

  if (keys[key] !== pcId) {
    // Ключ привязан к другому ПК
    return res.status(403).json({ status: 'error', message: 'Ключ уже используется на другом ПК' });
  }

  // Ключ валиден и привязан к этому ПК
  return res.json({ status: 'ok', message: 'Ключ действителен' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
