const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Your phone number (replace with your actual phone number)
const MY_PHONE_NUMBER = 'YOUR_PHONE_NUMBER@c.us';  // Replace with your actual phone number

// Create a new client
const client = new Client();

// Event listener for QR code generation
client.on('qr', (qr) => {
    // Print QR code to the terminal
    qrcode.generate(qr, { small: true });
});

// Event listener for when the client is ready
client.on('ready', () => {
    console.log('Client is ready!');
});

// Event listener for incoming messages
client.on('message', async (message) => {
    // Check if the message is from your phone number and contains the text "ping"
    if (message.from === MY_PHONE_NUMBER && message.body.toLowerCase() === 'ping') {
        // Reply with "pong"
        await message.reply('pong');
        console.log('Pong replied!');
    }
});

// Initialize the client
client.initialize();
