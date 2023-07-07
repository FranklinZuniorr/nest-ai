import * as WebSocket from 'ws';

// Armazene as conexões WebSocket dos usuários
const clients = new Map();

function sendMessage(userId, message) {
  const client = clients.get(userId);
  if (client) {
    client.send(message);
  }
};

export const startWs = () => {
  // Crie um novo servidor WebSocket
  const wss = new WebSocket.Server({ port: 8080 });

  
  // Lidere com a conexão de novos clientes
  wss.on('connection', (ws: WebSocket) => {
    // Lógica para lidar com a conexão do cliente

    ws.send();
  
    // Receba mensagens do cliente
    ws.on('message', (message: string) => {
      const data = message;


      console.log('Mensagem recebida: ' + message);
  
      // Envie uma mensagem de volta para o cliente
      /* ws.send('Oi meu querido, tudo bem (;?'); */
    });
  
    // Lide com o fechamento da conexão pelo cliente
    ws.on('close', () => {
      console.log('Conexão fechada');
    });
  });
  
  console.log('Servidor WebSocket iniciado na porta 8080');
};
