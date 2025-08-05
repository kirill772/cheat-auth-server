const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const KEYS_FILE = "./keys.json";

function loadKeys() {
  if (!fs.existsSync(KEYS_FILE)) return {};
  return JSON.parse(fs.readFileSync(KEYS_FILE));
}

function saveKeys(keys) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

app.post("/auth", (req, res) => {
  const { key, hwid } = req.body;
  if (!key || !hwid) return res.status(400).json({ error: "Missing key or hwid" });

  let keys = loadKeys();
  const record = keys[key];

  if (!record) {
    return res.status(404).json({ error: "Key not found" });
  }

  if (!record.hwid) {
    // Привязываем
    record.hwid = hwid;
    record.activatedAt = Date.now();
    keys[key] = record;
    saveKeys(keys);
    return res.json({ success: true, message: "Key activated and HWID bound" });
  }

  if (record.hwid !== hwid) {
    return res.status(403).json({ error: "HWID mismatch" });
  }

  return res.json({ success: true, message: "Authentication successful" });
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});