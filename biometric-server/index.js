const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Enable CORS for Socket.io and Express
app.use(cors());
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// The ZKTeco device sends data in plain text, not JSON!
app.use(express.text({ type: '*/*' })); 

// Port must be EXACTLY what is set in your machine's "Cloud Server Settings"
const PORT = 8080;

// Socket.io connection logging
io.on('connection', (socket) => {
    console.log(`🔌 Frontend Dashboard Connected (Socket ID: ${socket.id})`);
});

// 1. Device Registration / Handshake
app.get('/iclock/cdata', (req, res) => {
    const { SN } = req.query;
    console.log(`[ADMS] ✅ Device Connected! Serial Number: ${SN}`);
    res.send("OK");
});

// 2. Device checking if the server has any commands for it
app.get('/iclock/getrequest', (req, res) => {
    res.send("OK");
});

// 3. Device pushing Attendance Data (Punches)
app.post('/iclock/cdata', (req, res) => {
    const { SN, table } = req.query;
    const body = req.body;

    console.log(`[ADMS] 📥 Incoming Data from Device: ${SN} (Type: ${table})`);
    
    // 'ATTLOG' means attendance logs (punches)
    if (table === 'ATTLOG') {
        console.log("\n=== New Live Punch! ===");
        console.log(body);
        console.log("===========================\n");
        
        // ZKTeco sends punches separated by newlines
        const punches = body.trim().split('\n');
        
        punches.forEach(punch => {
            if(!punch) return;
            // Example format: 1    2026-06-22 15:30:00    1    15
            const parts = punch.split('\t');
            if (parts.length >= 2) {
                const userId = parts[0];
                const timestamp = parts[1];
                
                const punchData = {
                    userId,
                    timestamp,
                    deviceSn: SN
                };

                // 🔥 EMIT THE PUNCH LIVE TO THE FRONTEND DASHBOARD!
                io.emit('live_punch', punchData);
            }
        });
    }

    // Must respond with "OK"
    res.send("OK");
});

// Start the ADMS Server with WebSockets
server.listen(PORT, () => {
    console.log(`☁️ ADMS Live Cloud Server is RUNNING on port ${PORT}`);
    console.log(`Listening for biometric machines and Live Dashboard connections...`);
});
