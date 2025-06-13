const { Client, LocalAuth } = require('@nexor/wb');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: false // Set to true for production
    }
});

client.on('qr', (qr) => {
    console.log('Scan the QR code below to log in:');
    console.log(qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg) => {
    console.log('Message received:', msg.body);

    // Simple echo bot
    if (msg.body.toLowerCase() === 'ping') {
        await msg.reply('pong');
    }
    
    // Greeting response
    else if (msg.body.toLowerCase().includes('hello')) {
        await msg.reply('Hello there! How can I help you?');
    }
    
    // Default response
    else if (msg.body) {
        await msg.reply('Thanks for your message! I\'m a simple bot.');
    }
});

client.initialize().catch(err => {
    console.error('Initialization error:', err);
});
