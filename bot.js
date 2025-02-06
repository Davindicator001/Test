const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.4']
    });

    sock.ev.on('creds.update', saveCreds);

    // Your phone number
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
            }

            // This should log the pairing code (if available)
            if (update && update.pairingCode) {
                console.log(`🟢 Pairing Code: ${update.pairingCode}`);
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

startBot().catch((err) => {
    console.error("❌ Error:", err);
});
