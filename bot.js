const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');

// Initialize WhatsApp Web client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }, // We want Puppeteer to control the browser
});

// This will capture the QR code and allow scanning using Puppeteer
client.on('qr', async (qr) => {
    console.log('QR RECEIVED', qr);

    // Use Puppeteer to open the QR code in WhatsApp Web and scan it
    await scanQRCodeWithPuppeteer(qr);
});

// This will let us know when the client is ready
client.on('ready', () => {
    console.log('Client is ready!');

    // Send a message to your number after authentication
    sendMessageToMyNumber('09051217349', 'Hello, this is an automated message!');
});

// Start the client
client.initialize();

// Function to scan QR code using Puppeteer
async function scanQRCodeWithPuppeteer(qrCode) {
    // Launch Puppeteer browser instance
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Go to WhatsApp Web
    await page.goto('https://web.whatsapp.com');

    // Wait for QR code to load
    await page.waitForSelector('canvas');

    console.log('QR code is being scanned...');

    // Capture the QR code from the canvas element
    const pairingCode = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        return canvas.toDataURL();  // You can adjust this based on the QR code you want to capture
    });

    console.log(`Pairing Code: ${pairingCode}`);

    // Close Puppeteer browser after scanning
    await browser.close();
}

// Function to send a message from your number after QR scan
async function sendMessageToMyNumber(phoneNumber, message) {
    const chat = await client.getChatById(`${phoneNumber}@c.us`);
    await chat.sendMessage(message);
    console.log(`Message sent to ${phoneNumber}: ${message}`);
}

client.on('message', message => {
    // Respond to a message
    if (message.body === 'ping') {
        message.reply('pong');
    }
});
