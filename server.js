const uuidv4 = require('uuid/v4');

// server.js

const express = require('express');
const ws = require('ws');
// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new ws.Server({ server });

//sends data to all open connections
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(data);
    }
  });
};

//broadcasts user count to all open connections
const broadcastOnlineUserCount = () => {
  wss.broadcast(JSON.stringify({
    type: 'onlineUserCount',
    userCount: wss.clients.size,
  }));
};

const generateRandomColor = () => {
  const colorList =
  ['#a3164a', '#39b509', '#db7713', '#c41609', '#0aa2af',
   '#6e0d89', '#95ad0c', '#ff2b2b', '#d89102', '#186825'];
  const color = colorList[Math.floor(Math.random()*colorList.length)];
  return color;
}

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {

  //assigns a client a color
  const usercolor = generateRandomColor();

  //updates user count when a new client connects
  broadcastOnlineUserCount();

  console.log('Client connected');

  ws.on('message', (message) => {
    receivedMessage = (JSON.parse(message));

    //checks type of incoming message
    if(receivedMessage.type === 'postMessage'){
      const newMessage = {
        type: 'incomingMessage',
        id: uuidv4(),
        username: receivedMessage.username,
        content: receivedMessage.content,
        userColor: usercolor,
      };
      //sends incomingMessage to all open clients
      wss.broadcast(JSON.stringify(newMessage));

    } else if (receivedMessage.type === 'postNotification'){
      const newNotification = {
        type: 'incomingNotification',
        id: uuidv4(),
        content: receivedMessage.content,
      };
      //sends incomingNotification to all open clients
      wss.broadcast(JSON.stringify(newNotification));
    };
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected');
    //updates user count when a client disconnects
    broadcastOnlineUserCount();
  });
});