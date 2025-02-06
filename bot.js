const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const client = new Client();

// Define the phone number
const MY_PHONE_NUMBER = '09051217349@c.us';  // Your phone number

// Listen for the 'qr' event
client.on('qr', (qr) => {
    // Print the QR code to the console
    qrcode.generate(qr, { small: true });
    console.log('QR Code generated! Scan it with your WhatsApp mobile app.');
});

// Listen for the 'ready' event
client.on('ready', () => {
    console.log('Client is ready!');
});

// Listen for incoming messages
client.on('message', async message => {
    if (message.body.toLowerCase() === 'ping' && message.from === MY_PHONE_NUMBER) {
        // Only respond if the message is from the correct phone number
        client.sendMessage(message.from, 'pong');
    }
});

// Initialize the client
client.initialize();
