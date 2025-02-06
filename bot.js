
// Import necessary libraries
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Create a new client with Local Authentication for saving session data
const client = new Client({
    authStrategy: new LocalAuth(),  // Ensures session is saved
});

// Replace with the bot's WhatsApp number (use the full international format, e.g. '+1234567890')
const botNumber = '+2349051217349';

// When the client is ready (authenticated)
client.on('ready', () => {
    console.log('Bot is ready!');
});

// Show the QR code when authentication is needed
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Respond to incoming messages
client.on('message', message => {
    // Check if the message is "ping" and if it's from the bot's number
    if (message.body.toLowerCase() === 'ping' && message.from === botNumber) {
        // Send a "pong" response
        message.reply('pong');
    }
});

// Initialize the client
client.initialize();
