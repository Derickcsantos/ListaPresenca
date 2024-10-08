const path = require('path'); // Importa o módulo 'path' para manipulação de caminhos de arquivos 
const express = require('express'); // Importa o módulo 'express' para criar o servidor
const Guest = require('./models/guest'); // Importa o modelo 'Guest' para gerenciar convidados
const app = express(); // Cria uma instância do aplicativo Express
const mongoose = require('mongoose'); // Importa o módulo 'mongoose' para interagir com o MongoDB

// Conectar ao MongoDB Atlas usando variáveis de ambiente
const mongoURI = process.env.MONGO_URI; // Usa a variável de ambiente MONGO_URI

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout depois de 5 segundos
  socketTimeoutMS: 45000 // Timeout no socket após 45 segundos
})
.then(() => console.log('Conectado ao MongoDB Atlas'))
.catch(err => console.error('Erro na conexão com MongoDB:', err));



app.use(express.json()); // Middleware para analisar requisições JSON
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos do diretório 'public'

// Rota para obter todos os convidados
app.get('/guests', async (req, res) => {
    try {
      const guests = await Guest.find(); // Busca todos os convidados no banco de dados
      res.json(guests); // Retorna a lista de convidados em formato JSON
    } catch (err) {
      console.error('Erro ao buscar convidados:', err);
      res.status(500).json({ error: 'Erro ao buscar convidados.' });
    }
});

// Rota para adicionar um convidado
app.post('/guests', async (req, res) => {
  const { name, age } = req.body;
  const guest = new Guest({ name, age });
  try {
      await guest.save();
      res.status(201).json(guest);
  } catch (err) {
      console.error('Erro ao adicionar convidado:', err);
      res.status(500).json({ error: 'Erro ao adicionar convidado.' });
  }
});

// Rota para atualizar um convidado
app.put('/guests/:id', async (req, res) => {
    const { id } = req.params;
    const { name, age } = req.body;

    try {
        const guest = await Guest.findByIdAndUpdate(id, { name, age }, { new: true });
        if (!guest) {
            return res.status(404).json({ error: 'Convidado não encontrado' });
        }
        res.json(guest);
    } catch (err) {
        console.error('Erro ao atualizar convidado:', err);
        res.status(500).json({ error: 'Erro ao atualizar convidado' });
    }
});

// Rota para deletar um convidado
app.delete('/guests/:id', async (req, res) => {
  await Guest.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
console.log("MongoDB URI:", process.env.MONGO_URI);
