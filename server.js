const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('./db');

const app = express();

// CORS liberado para todas as origens
app.use(cors());
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

// --- ROTAS DE METAS (goals) ---
// Aqui sem autenticação, usando user_id fixo = 1

// Listar metas
app.get('/goals', (req, res) => {
  const userId = 1; // usuário fixo por enquanto
  const query = 'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC';
  connection.query(query, [userId], (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar metas');
    res.json(results);
  });
});

// Criar nova meta
app.post('/goals', (req, res) => {
  const userId = 1; // usuário fixo
  const { title, description } = req.body;

  if (!title) return res.status(400).send('Título é obrigatório');

  const query = 'INSERT INTO goals (title, description, user_id) VALUES (?, ?, ?)';
  connection.query(query, [title, description, userId], (err, result) => {
    if (err) return res.status(500).send('Erro ao criar meta');

    const newGoal = {
      id: result.insertId,
      title,
      description,
      completed: false,
    };
    res.status(201).json(newGoal);
  });
});

// Atualizar meta (título, descrição e/ou completed)
app.put('/goals/:id', (req, res) => {
  const userId = 1;
  const goalId = req.params.id;
  const { title, description, completed } = req.body;

  const fields = [];
  const values = [];

  if (title !== undefined) {
    fields.push("title = ?");
    values.push(title);
  }

  if (description !== undefined) {
    fields.push("description = ?");
    values.push(description);
  }

  if (completed !== undefined) {
    fields.push("completed = ?");
    values.push(completed);
  }

  if (fields.length === 0) {
    return res.status(400).send("Nenhum campo para atualizar");
  }

  const query = `
    UPDATE goals
    SET ${fields.join(', ')}
    WHERE id = ? AND user_id = ?
  `;

  values.push(goalId, userId);

  connection.query(query, values, (err, result) => {
    if (err) return res.status(500).send('Erro ao atualizar meta');
    if (result.affectedRows === 0) return res.status(404).send('Meta não encontrada');
    res.send('Meta atualizada com sucesso');
  });
});

// Deletar meta
app.delete('/goals/:id', (req, res) => {
  const userId = 1; // usuário fixo
  const goalId = req.params.id;

  const query = 'DELETE FROM goals WHERE id = ? AND user_id = ?';
  connection.query(query, [goalId, userId], (err, result) => {
    if (err) return res.status(500).send('Erro ao deletar meta');
    if (result.affectedRows === 0) return res.status(404).send('Meta não encontrada');
    res.send('Meta deletada com sucesso');
  });
});

// Rota para alteração de senha (sem autenticação)
app.put('/change-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).send('Informe email e nova senha');
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE users SET password = ? WHERE email = ?';

    connection.query(query, [hashedPassword, email], (err, result) => {
      if (err) return res.status(500).send('Erro ao atualizar senha');
      if (result.affectedRows === 0) return res.status(404).send('Email não encontrado');
      res.send('Senha atualizada com sucesso');
    });
  } catch {
    res.status(500).send('Erro no servidor');
  }
});

app.get('/', (req, res) => {
  res.send('API doadev rodando!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
