
const { WAConnection, MessageType } = require('@adiwajshing/baileys');
const fs = require('fs');

async function startBot() {
    const conn = new WAConnection();

    // Load previous session if it exists, else it will generate a new session on first run
    conn.loadAuthInfo('session.json');

    // Log QR code when it's needed
    conn.on('qr', qr => {
        console.log('Scan this QR code in WhatsApp to authenticate:');
        console.log(qr);  // This will log the QR code for the first-time pairing
    });

    // When the connection is open, save the session to avoid QR on future runs
    conn.on('open', () => {
        console.log('Connection is open');
        fs.writeFileSync('session.json', JSON.stringify(conn.base64EncodedAuthInfo(), null, 2));
    });

    // Respond to "ping" with "pong"
    conn.on('chat-update', async (chat) => {
        if (!chat.hasNewMessage) return;
        const message = chat.messages.all()[0];

        // Check if the message is from the bot number
        if (message.key.remoteJid === conn.user.jid) {
            // Check if the message content is 'ping'
            if (message.message.conversation === 'ping') {
                console.log('Ping received, sending pong...');
                await conn.sendMessage(message.key.remoteJid, 'pong', MessageType.text);
            }
        }
    });

    // Initialize the connection
    await conn.connect();
}

startBot().catch((err) => {
    console.log('Error:', err);
});
