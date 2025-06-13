const { default: makeWASocket, useMultiFileAuthState } = require('@joanimi/baileys')
const fs = require('fs')

// Path to store auth credentials
const authFile = './auth_info.json'
const { state, saveState } = useMultiFileAuthState(authFile)

async function startBot() {
    const sock = makeWASocket({ 
        auth: state
    })

    // Save credentials on update
    sock.ev.on('creds.update', saveState)

    // Log connection status
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            // Reconnect if disconnected
            startBot()
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp')
        }
    })

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return // Ignore if from self or no message

        const senderId = msg.key.remoteJid
        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text

        // Log received message
        console.log(`Message from ${senderId}: ${messageText}`)

        // Simple reply logic
        if (messageText && messageText.toLowerCase() === 'hello') {
            await sock.sendMessage(senderId, { text: 'Hi there! How can I help you?' })
        } else if (messageText && messageText.toLowerCase() === 'bye') {
            await sock.sendMessage(senderId, { text: 'Goodbye! Have a great day!' })
        }
    })
}

startBot()
