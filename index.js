const { makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

// Auth state (saved in "auth_info.json")
const { state, saveState } = useSingleFileAuthState("./auth_info.json");

// Initialize WhatsApp bot
async function startBot() {
  const sock = makeWASocket({
    printQRInTerminal: true, // Show QR in terminal
    auth: state,
  });

  // Save session on connection update
  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;
    if (connection === "close") saveState();
    if (qr) console.log("Scan QR Code to log in!");
  });

  // Listen for incoming messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const message = messages[0];
    if (!message.message) return;

    const sender = message.key.remoteJid; // User's WhatsApp ID
    const text = message.message.conversation || "";

    console.log(`Message from ${sender}: ${text}`);

    // Reply to "hi"
    if (text.toLowerCase() === "hi") {
      await sock.sendMessage(sender, { text: "Hello! 👋" });
    }
  });
}

startBot().catch((err) => console.error("Bot error:", err));
