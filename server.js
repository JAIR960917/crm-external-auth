const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// 🚀 SERVIR PASTA PUBLIC CORRETAMENTE (Render-Friendly)
app.use("/public", express.static(path.join(__dirname, "public")));

// 🚀 ROTA DIRETA PARA O PAINEL ADMIN
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// 🚀 ARQUIVO DE USUÁRIOS PERSISTENTE
const USERS_FILE = path.join(__dirname, "users.json");

// Cria users.json se não existir
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Lê usuários
function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

// Salva usuários
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Rota raiz
app.get("/", (req, res) => {
  res.send("API CRM ONLINE - FUNCIONANDO! 🔥");
});

//
// 🔐 LOGIN
//
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  const users = loadUsers();
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.json({ success: false, msg: "Usuário não encontrado" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.json({ success: false, msg: "Senha incorreta" });
  }

  return res.json({
    success: true,
    username: user.username,
    role: user.role,
  });
});

//
// 👥 LISTAR USUÁRIOS
//
app.get("/api/auth/users", (req, res) => {
  const users = loadUsers();
  res.json(users);
});

//
// ➕ CRIAR USUÁRIO
//
app.post("/api/auth/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.json({ success: false, msg: "Usuário e senha são obrigatórios" });
  }

  const users = loadUsers();

  if (users.find((u) => u.username === username)) {
    return res.json({ success: false, msg: "Usuário já existe" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  users.push({
    username,
    passwordHash,
    role: role || "user",
  });

  saveUsers(users);

  return res.json({ success: true, msg: "Usuário criado com sucesso" });
});

//
// ❌ DELETAR USUÁRIO
//
app.delete("/api/auth/users/:username", (req, res) => {
  const { username } = req.params;

  let users = loadUsers();

  if (!users.find((u) => u.username === username)) {
    return res.json({ success: false, msg: "Usuário não existe" });
  }

  users = users.filter((u) => u.username !== username);

  saveUsers(users);

  return res.json({ success: true, msg: "Usuário removido com sucesso" });
});

//
// 🚀 PORTA DO RENDER
//
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🚀 API rodando na porta " + PORT);
});
