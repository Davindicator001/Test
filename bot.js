const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.4'],
        printQRInTerminal: true // This will print the QR code to the terminal
    });

    sock.ev.on('creds.update', saveCreds);

    // Your phone number
    const phoneNumber = '+2349051217349';
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('⚠️ Connection closed, reconnecting...');
                startBot(); // Auto-reconnect
            }
        } else if (connection === 'open') {
            console.log('✅ Connection established!');
        } else {
            console.log('ℹ️ Connection update:', update);
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
