import * as WebSocket from 'ws';

// Armazene as conexões WebSocket dos usuários
const clients = new Map();
const port = 8080;

export const sendMessage = (userId, message) => {
  const client = clients.get(userId);
  if (client) {
    client.send(JSON.stringify(message));
  } else {
    console.log(`Usuário com userId ${userId} não encontrado.`);
  }
};

export const startWs = () => {
  const wss = new WebSocket.Server({ port: process.env.PORT || 3000 });

  wss.on('connection', (ws: WebSocket, req) => {

    const userId = new URL(req.url, 'http://seu-servidor.com').searchParams.get('userId');

    clients.set(userId, ws);
    console.log(userId);

    ws.on('message', (message: any) => {

      console.log('Mensagem recebida: ' + message);
  
      sendMessage(userId, `Olá ${userId}`)
    });
  
    ws.on('close', () => {
      console.log('Conexão fechada');

      clients.delete(userId);
    });
  });
  
  console.log(`Servidor WebSocket iniciado na porta ${port}`);
};


