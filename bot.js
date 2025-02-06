const { chromium } = require('playwright');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.4']
    });

    sock.ev.on('creds.update', saveCreds);

    // Your phone number (formatted for WhatsApp)
    const phoneNumber = '+2349051217349';
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
                // Capture and feed the QR code to Playwright here
                await scanQRCodeWithPlaywright(qr);
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

async function scanQRCodeWithPlaywright(qr) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://web.whatsapp.com/');

    console.log('Waiting for QR code to appear...');

    // Wait for the QR code to appear on WhatsApp Web page
    await page.waitForSelector('canvas[aria-label="Scan me!"]');
    
    // Screenshot the QR code
    const qrCodeImage = await page.screenshot({ path: 'whatsapp_qr.png' });

    console.log('QR Code captured, please scan it manually with your phone.');

    // You can send the qrCodeImage to the phone or save for manual scanning
    // Once scanned manually, Baileys should successfully connect.

    await browser.close();
}

startBot().catch((err) => {
    console.error("❌ Error:", err);
});
