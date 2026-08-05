const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e8
});

const python = spawn('python', ['pose_estimation.py'], { shell: true });

python.stdout.on('data', (data) => {
  try {
    const output = data.toString().trim();
    const json = JSON.parse(output);
    io.emit('pose-data', json);
  } catch (e) {
    // ログは無視
  }
});

python.stderr.on('data', (data) => {
  console.error(`Python Error: ${data}`);
});

python.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('video-frame', (dataURL) => {
    try {
      if (python.stdin.writable) {
        python.stdin.write(dataURL + '\n');
      }
    } catch (err) {
      console.error('Frame write error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Node.js Server running on port ${PORT}`);
});