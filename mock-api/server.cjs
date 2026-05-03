const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

// ======================== BANCO EM MEMÓRIA ========================
const users = [];
const orders = [];
const sessions = {};
const resetTokens = {};

// ======================== AUTH ========================

// REGISTER
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, address, city, state, zipCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "Campos obrigatórios: name, email, password." });
  }

  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ success: false, error: "E-mail já cadastrado." });
  }

  const user = {
    id: uuidv4(),
    name,
    email,
    password,
    address: address || "",
    city: city || "",
    state: state || "",
    zipCode: zipCode || "",
    createdAt: new Date().toISOString(),
  };

  users.push(user);

  const token = uuidv4();
  sessions[token] = user.id;

  const { password: _, ...publicUser } = user;
  res.status(201).json({ success: true, user: publicUser, token });
});

// LOGIN
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "E-mail e senha obrigatórios." });
  }

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, error: "E-mail ou senha incorretos." });
  }

  const token = uuidv4();
  sessions[token] = user.id;

  const { password: _, ...publicUser } = user;
  res.json({ success: true, user: publicUser, token });
});

// LOGOUT
app.post("/api/auth/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token && sessions[token]) {
    delete sessions[token];
  }
  res.json({ success: true, message: "Logout realizado." });
});

// FORGOT PASSWORD
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ success: false, message: "E-mail não encontrado." });
  }

  const code = uuidv4().slice(0, 6).toUpperCase();
  resetTokens[email] = code;

  res.json({ success: true, message: `Código enviado para ${email}.`, code });
});

// RESET PASSWORD
app.post("/api/auth/reset-password", (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!resetTokens[email] || resetTokens[email] !== token) {
    return res.status(400).json({ success: false, message: "Código inválido." });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ success: false, message: "Usuário não encontrado." });
  }

  user.password = newPassword;
  delete resetTokens[email];

  res.json({ success: true, message: "Senha redefinida com sucesso!" });
});

// UPDATE PROFILE
app.put("/api/auth/profile/:id", (req, res) => {
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Usuário não encontrado." });
  }

  const allowed = ["name", "email", "address", "city", "state", "zipCode"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) users[idx][key] = req.body[key];
  });

  const { password: _, ...publicUser } = users[idx];
  res.json({ success: true, user: publicUser });
});

// ======================== ORDERS ========================

// CREATE ORDER
app.post("/api/orders", (req, res) => {
  const { userId, items, total, address, paymentMethod, deliveryLat, deliveryLng } = req.body;

  if (!userId || !items || !total) {
    return res.status(400).json({ error: "Campos obrigatórios: userId, items, total." });
  }

  const transitMin = 10 + Math.floor(Math.random() * 10);

  const order = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    userId,
    items,
    total,
    status: "confirmed",
    address: address || "",
    paymentMethod: paymentMethod || "cartao",
    createdAt: new Date().toISOString(),
    prepMinutes: 20,
    estimatedMinutes: 20 + transitMin,
    deliveryLat: deliveryLat || -15.8138,
    deliveryLng: deliveryLng || -48.0508,
  };

  orders.push(order);
  res.status(201).json(order);
});

// GET USER ORDERS
app.get("/api/orders/user/:userId", (req, res) => {
  const userOrders = orders.filter((o) => o.userId === req.params.userId).reverse();
  res.json(userOrders);
});

// GET ORDER BY ID
app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Pedido não encontrado." });
  }
  res.json(order);
});

// UPDATE ORDER STATUS
app.put("/api/orders/:id/status", (req, res) => {
  const { status } = req.body;
  const valid = ["confirmed", "preparing", "on_the_way", "delivered"];

  if (!valid.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Use: ${valid.join(", ")}` });
  }

  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Pedido não encontrado." });
  }

  order.status = status;
  res.json(order);
});

// ======================== START ========================
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock API rodando em http://localhost:${PORT}`);
});