const path = require('path'); // Importa o módulo 'path' para manipulação de caminhos de arquivos
const express = require('express'); // Importa o módulo 'express' para criar o servidor
const Guest = require('./models/guest'); // Importa o modelo 'Guest' para gerenciar convidados
const app = express(); // Cria uma instância do aplicativo Express
const mongoose = require('mongoose'); // Importa o módulo 'mongoose' para interagir com o MongoDB

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/guestlist') // Conecta ao banco de dados 'guestlist'
  .then(() => console.log('Conectado ao MongoDB')) // Mensagem de sucesso na conexão
  .catch(err => console.error('Não foi possível conectar ao MongoDB...', err)); // Mensagem de erro na conexão

app.use(express.json()); // Middleware para analisar requisições JSON
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos do diretório 'public'

// Rota para obter todos os convidados
app.get('/guests', async (req, res) => { // Rota GET para '/guests'
    try {
      const guests = await Guest.find();  // Busca todos os convidados no banco de dados
      res.json(guests);  // Retorna a lista de convidados em formato JSON
    } catch (err) {
      console.error('Erro ao buscar convidados:', err); // Mensagem de erro no console
      res.status(500).json({ error: 'Erro ao buscar convidados.' }); // Retorna erro 500
    }
});

// Rota para adicionar um convidado
app.post('/guests', async (req, res) => { // Rota POST para '/guests'
  const { name, age } = req.body; // Extrai 'name' e 'age' do corpo da requisição

  const guest = new Guest({ name, age }); // Cria uma nova instância de convidado
  try {
      await guest.save(); // Salva o convidado no banco de dados
      res.status(201).json(guest); // Retorna o convidado adicionado com status 201
  } catch (err) {
      console.error('Erro ao adicionar convidado:', err); // Mensagem de erro no console
      res.status(500).json({ error: 'Erro ao adicionar convidado.' }); // Retorna erro 500
  }
});

// Rota para atualizar um convidado
app.put('/guests/:id', async (req, res) => { // Rota PUT para '/guests/:id'
    const { id } = req.params; // Obtém o ID do convidado da URL
    const { name, age } = req.body; // Extrai 'name' e 'age' do corpo da requisição

    try {
        const guest = await Guest.findByIdAndUpdate(id, { name, age }, { new: true }); // Atualiza o convidado
        if (!guest) {
            return res.status(404).json({ error: 'Convidado não encontrado' }); // Mensagem de erro se o convidado não for encontrado
        }
        res.json(guest); // Retorna o convidado atualizado
    } catch (err) {
        console.error('Erro ao atualizar convidado:', err); // Mensagem de erro no console
        res.status(500).json({ error: 'Erro ao atualizar convidado' }); // Retorna erro 500
    }
});

// Rota para deletar um convidado
app.delete('/guests/:id', async (req, res) => { // Rota DELETE para '/guests/:id'
  await Guest.findByIdAndDelete(req.params.id); // Deleta o convidado pelo ID
  res.status(204).send(); // Não há conteúdo para retornar
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000; // Define a porta do servidor
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`)); // Mensagem indicando que o servidor está rodando
