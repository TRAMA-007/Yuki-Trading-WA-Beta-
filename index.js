const { default: makeWASocket, useMultiFileAuthState , DisconnectReason } = require('@adiwajshing/baileys');
const fs = require('fs');
const qrcode = require('qrcode-terminal');


async function start() {
  const { state, saveState } = await useMultiFileAuthState('./auth_info.json');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // We'll handle QR code manually
  });

sock.ev.on('creds.update', () => {
  saveState();
});
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('Scan the QR code:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log('Reconnecting...');
        start();
      } else {
        console.log('Disconnected. Please restart the bot.');
      }
    } else if (connection === 'open') {
      console.log('Connected!');
    }
  });

  sock.ev.on('messages.upsert', async (messageUpdate) => {
    if (messageUpdate.type !== 'notify') return;
    const msg = messageUpdate.messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const messageType = Object.keys(msg.message)[0];

    if (messageType === 'conversation') {
      const text = msg.message.conversation;
      console.log(`Received message: ${text}`);

      await sock.sendMessage(from, { text: `You said: ${text}` });
    }
  });
}

start();
