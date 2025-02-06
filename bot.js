
const { WAConnection, MessageType } = require('@adiwajshing/baileys');
const fs = require('fs');
const readline = require('readline');

async function startBot() {
    const conn = new WAConnection();

    // Collect the phone number to link to the bot
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    phoneNumber = '+2349051217349'

        // Make sure the phone number is correctly formatted
        const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');

        // Load previous session if it exists
        conn.loadAuthInfo('session.json');

        // Log pairing code when it's needed
        conn.on('open', () => {
            console.log(`Pairing code: conn.base64EncodedAuthInfo().toString()`);
        });

        // When the connection is open, save the session to avoid pairing code on future runs
        conn.on('open', () => {
            console.log('Connection is open');
            fs.writeFileSync('session.json', JSON.stringify(conn.base64EncodedAuthInfo(), null, 2));
        });

        // Authenticate the bot with the phone number
conn.user.jid = `{formattedPhone}@s.whatsapp.net`;

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
};
startBot().catch((err) => {
    console.log('Error:', err);
});
