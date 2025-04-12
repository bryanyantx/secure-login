const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Limit to 5 login attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                   
  message: {
    message: "Too many login attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// In-memory "database"
const users = [];

function sanitize(str) {
  return str.replace(/[<>'"]/g, '');
}

app.post('/login', loginLimiter, async (req, res) => {
  const email = sanitize(req.body.email);
  const password = req.body.password;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Invalid email or password" });

  res.json({ message: "Login successful" });
});

app.post('/register', async (req, res) => {
  const email = sanitize(req.body.email);
  const password = req.body.password;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: "Invalid input" });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ email, passwordHash });

  res.json({ message: "User registered successfully" });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
