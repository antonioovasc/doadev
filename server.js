const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('./db');

const app = express();

app.use(cors({
  origin: 'http://localhost:4000'
}));
app.use(express.json());

// Rota de registro
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  connection.query(query, [name, email, hashedPassword], (err, result) => {
    if (err) return res.status(500).send('Erro ao registrar usuário');
    res.status(201).send('Usuário registrado com sucesso');
  });
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  connection.query(query, [email], async (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar usuário');
    if (results.length === 0) return res.status(404).send('Usuário não encontrado');

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Credenciais inválidas');

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login bem-sucedido', token });
  });
});

// Middleware de autenticação
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).send('Token não fornecido');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send('Token inválido');
    req.user = decoded;
    next();
  });
};

// Rota protegida
app.get('/dashboard', authenticateJWT, (req, res) => {
  res.send('Bem-vindo ao seu painel');
});
 
app.get('/', (req, res) => {
  res.send('API doadev rodando!');
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
