const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // Disable QR code display
    });

    // Save authentication state when updated
    sock.ev.on('creds.update', saveCreds);

    // Your phone number
    const phoneNumber = '+2349051217349';
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    // Listen for pairing code and log it
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, pairingCode } = update;

        if (pairingCode) {
            console.log(`🚀 Pairing Code for ${phoneNumber}: ${pairingCode}`);
        }

        if (connection === 'open') {
            console.log('✅ Connection established!');
        } else if (connection === 'close') {
            console.log('⚠️ Connection closed, reconnecting...');
            startBot(); // Auto-reconnect
        } else {
            console.log('ℹ️ Connection update:', update);
        }
    });

    // Authenticate with your phone number
    sock.user = { id: formattedPhone };

    // Handle incoming messages
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

startBot().catch((err) => {
    console.error("❌ Error:", err);
});
