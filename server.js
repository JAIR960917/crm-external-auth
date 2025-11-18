const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

// Permitir requisições do seu CRM
app.use(cors());
app.use(express.json());

// 🔐 Usuários "externos" definidos no servidor
// Você pode mudar, adicionar, remover aqui sempre que quiser
const users = [
  {
    username: "admin",
    passwordHash: bcrypt.hashSync("1234", 10), // senha: 1234
    role: "admin",
  },
  {
    username: "atendente",
    passwordHash: bcrypt.hashSync("senha123", 10), // senha: senha123
    role: "user",
  },
];

// Função para achar usuário
function findUser(username) {
  return users.find((u) => u.username === username);
}

// Rota simples para testar
app.get("/", (req, res) => {
  res.send("API CRM rodando ✅");
});

// Rota de login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, msg: "Usuário e senha são obrigatórios." });
  }

  const user = findUser(username);
  if (!user) {
    return res
      .status(401)
      .json({ success: false, msg: "Usuário não encontrado." });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res
      .status(401)
      .json({ success: false, msg: "Senha incorreta." });
  }

  return res.json({
    success: true,
    username: user.username,
    role: user.role,
  });
});

// Porta usada pelo Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("API CRM ouvindo na porta " + PORT);
});
