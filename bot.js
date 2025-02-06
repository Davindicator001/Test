const { default: makeWASocket, useSingleFileAuthState, makeWALegacySocket } = require('@whiskeysockets/baileys');
const fs = require('fs');

// Load authentication state
const { state, saveState } = useSingleFileAuthState('session.json');

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // Disable QR code display
    });

    // Save authentication state when updated
    sock.ev.on('creds.update', saveState);

    // Listen for pairing code and log it instead of showing QR code
    sock.ev.on('connection.update', (update) => {
        const { pairingCode, connection } = update;

        if (pairingCode) {
            console.log(`Pairing Code for ${phoneNumber}: ${pairingCode}`);
        }

        if (connection === 'open') {
            console.log('Connection established!');
        } else if (connection === 'close') {
            console.log('Connection closed, reconnecting...');
            startBot(); // Auto-reconnect
        }
    });

    // Set the bot's phone number
    const phoneNumber = '+2349051217349';
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    sock.user = { id: `${formattedPhone}@s.whatsapp.net` };

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (msg) => {
        const message = msg.messages[0];
        if (!message.message) return; // Ignore system messages

        const sender = message.key.remoteJid;
        const textMessage = message.message.conversation || "";

        if (textMessage.toLowerCase() === "ping") {
            await sock.sendMessage(sender, { text: "pong" });
            console.log("Ping received, sent pong.");
        }
    });

    console.log("Bot is running...");
}

startBot().catch((err) => {
    console.error("Error:", err);
});
