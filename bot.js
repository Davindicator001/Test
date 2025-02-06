const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const puppeteer = require('puppeteer');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.4']
    });

    sock.ev.on('creds.update', saveCreds);

    // Your phone number
    const phoneNumber = '+2349051217349'; // Your number
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
                await scanQRCodeWithPuppeteer(qr);  // Scan the QR code using Puppeteer
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

async function scanQRCodeWithPuppeteer(qrCodeData) {
    const browser = await puppeteer.launch({ headless: false }); // Set to false to see the browser window
    const page = await browser.newPage();

    // Navigate to the WhatsApp Web login page
    await page.goto('https://web.whatsapp.com');
    
    // Wait for the page to load completely
    await page.waitForSelector('canvas');

    // Scan the QR code that is provided by Baileys
    await page.waitForSelector('canvas');
    await page.evaluate((qrData) => {
        // Inject the QR code from Baileys to the page
        const canvas = document.querySelector('canvas');
        const context = canvas.getContext('2d');
        const img = new Image();
        img.src = qrData;
        img.onload = () => context.drawImage(img, 0, 0);
    }, qrCodeData);

    console.log("📱 Scanning QR code...");

    // Wait for the page to show the 'scanning' process
    await page.waitForSelector('.two');
    
    // Extract the pairing code (this might require you to wait until it is ready)
    const pairingCode = await page.evaluate(() => {
        // You need to find the element that contains the pairing code
        const pairingElement = document.querySelector('span[title="Your WhatsApp Web Pairing Code"]');
        return pairingElement ? pairingElement.textContent : null;
    });

    if (pairingCode) {
        console.log(`📱 Pairing Code: ${pairingCode}`);
    } else {
        console.log("❌ Pairing Code not found");
    }

    await browser.close();
}

startBot().catch((err) => {
    console.error("❌ Error:", err);
});
