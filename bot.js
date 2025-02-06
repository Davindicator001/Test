const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const puppeteer = require('puppeteer'); // Puppeteer for scanning QR code

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.4']
    });

    sock.ev.on('creds.update', saveCreds);

    // Your phone number
    const phoneNumber = '+2349051217349'; // Use your sister's number or your own
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'open') {
            console.log('✅ Connection established!');
        } else if (connection === 'close') {
            console.log('⚠️ Connection closed, reconnecting...');
            startBot(); // Auto-reconnect
        } else {
            console.log('ℹ️ Connection update:', update);
            if (qr) {
                console.log(`🚀 QR Code: ${qr}`);
                // Initiate Puppeteer to scan the QR code
                await scanQRCodeWithPuppeteer(qr);
            }
        }
    });

    sock.user = { id: formattedPhone };

    sock.ev.on('messages.upsert', async (msg) => {
        const message = msg.messages[0];
        if (!message.message) return;

        const sender = message.key.remoteJid;
        const textMessage = message.message.conversation || "";

        if (textMessage.toLowerCase() === "ping") {
            await sock.sendMessage(sender, { text: "pong" });
            console.log("Ping received, sent pong.");
        }
    });

    console.log("🤖 Bot is running...");
}

// Puppeteer function to scan the QR code
async function scanQRCodeWithPuppeteer(qrCode) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://web.whatsapp.com/');
    
    // Wait for the QR code to load
    await page.waitForSelector('canvas');

    console.log('🚀 QR code is being scanned...');

    // Scan the QR Code
    const scannedCode = await page.evaluate((qr) => {
        const qrCanvas = document.querySelector('canvas');
        return qrCanvas.toDataURL(); // You can adjust this based on the QR code you want to capture.
    }, qrCode);

    console.log(`🤖 Pairing code: ${scannedCode}`);

    // Close the browser after scanning
    await browser.close();
}

startBot().catch((err) => {
    console.error("❌ Error:", err);
});
