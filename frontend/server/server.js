import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { Server } from 'socket.io';
import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { mkdir } from 'fs/promises';
import http from 'http';

console.log('Entering server.js');

const __dirname = path.resolve();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  },
  timeout: 50000, // 50 seconds
  allowEIO3: true, // Allow older clients to connect
  transports: ['websocket', 'polling'], // Enable WebSocket and polling
  pingTimeout: 25000, // Ping timeout (25 seconds)
  pingInterval: 20000, // Ping interval (20 seconds)
  reconnection: true, // Enable reconnection
  reconnectionAttempts: Infinity, // Unlimited reconnection attempts
  reconnectionDelay: 1000, // 1-second reconnection delay
});

// Store active processes
const activeProcesses = new Map();

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
mkdir(tempDir, { recursive: true }).catch(console.error);

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const process = activeProcesses.get(socket.id);
    if (process) {
      process.kill();
      activeProcesses.delete(socket.id);
    }
  });
});

// Check if Python is available
function checkPythonAvailability() {
  return new Promise((resolve, reject) => {
    exec('python --version', (error, stdout, stderr) => {
      if (error) {
        reject(`Python not found: ${stderr || error.message}`);
      } else {
        resolve(`Python found: ${stdout}`);
      }
    });
  });
}

// Start comparison process
app.post('/api/start-check', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = path.join(tempDir, `${Date.now()}.jpg`);
    console.log('Saving image to:', imagePath);
    await fs.writeFile(imagePath, req.file.buffer);

    console.log("Calling Bumble automation script...");
    
    // Emit an event indicating the Bumble automation has started
    io.emit('bumble_called', { message: 'Bumble automation script initiated' });

    // Check if Python is available
    try {
      const pythonStatus = await checkPythonAvailability();
      console.log(pythonStatus);
    } catch (err) {
      console.error('Error: ', err);
      return res.status(500).json({ error: 'Python is not available on the system' });
    }

    const pythonExecutable = 'C:\\Program Files\\Python310\\python.exe'; // Adjust this path if necessary
    const pythonScriptPath = path.join(__dirname, 'bumble_automation.py');

    const pythonProcess = spawn(
      pythonExecutable,
      [
        pythonScriptPath,
        imagePath,
        '--email', process.env.BUMBLE_EMAIL,
        '--password', process.env.BUMBLE_PASSWORD,
        '--socket-id', process.env.VITE_API_URL
      ]
    );

    console.log('Python script spawned successfully.');

    const sessionId = socket.id; // Use the socket ID for the session
    activeProcesses.set(sessionId, pythonProcess);
    console.log('Started Python process with sessionId:', sessionId);

    pythonProcess.stdout.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Python process output:', message);
        io.to(socket.id).emit('comparison_update', message); // Emit to specific socket
      } catch (e) {
        console.log('Python stdout error:', data.toString());
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
      io.to(socket.id).emit('error', { message: 'Process error occurred' }); // Emit to specific socket
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      activeProcesses.delete(sessionId);
      fs.unlink(imagePath).catch(console.error);
    });

    res.json({ sessionId });
  } catch (error) {
    console.error('Error starting process:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop comparison process
app.post('/api/stop-check', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const process = activeProcesses.get(sessionId);

  if (process) {
    console.log('Stopping process with sessionId:', sessionId);
    process.kill();
    activeProcesses.delete(sessionId);
    res.json({ message: 'Process stopped successfully' });
  } else {
    console.log('Process not found for sessionId:', sessionId);
    res.status(404).json({ error: 'Process not found' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// import express from 'express';
// import multer from 'multer';
// import cors from 'cors';
// import { Server } from 'socket.io';
// import { spawn, exec } from 'child_process';  // Import exec to run a shell command
// import path from 'path';
// import fs from 'fs/promises';
// import { mkdir } from 'fs/promises';
// import http from 'http';

// console.log('entering server.js')

// const __dirname = path.resolve();
// const app = express();
// const upload = multer({ storage: multer.memoryStorage() });
// app.use(cors());
// app.use(express.json());

// // Create HTTP server
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   },
//   timeout: 50000, // 50 seconds
//   allowEIO3: true, // Allow older clients to connect
//   transports: ['websocket', 'polling'], // Enable WebSocket and polling
//   pingTimeout: 25000, // Ping timeout (25 seconds)
//   pingInterval: 20000, // Ping interval (20 seconds)
//   reconnection: true, // Enable reconnection
//   reconnectionAttempts: Infinity, // Unlimited reconnection attempts
//   reconnectionDelay: 1000, // 1-second reconnection delay
// });

// // Store active processes
// const activeProcesses = new Map();

// // Ensure temp directory exists
// const tempDir = path.join(__dirname, 'temp');
// mkdir(tempDir, { recursive: true }).catch(console.error);

// // Handle WebSocket connections
// io.on('connection', (socket) => {
//   console.log('Client connected');
//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//     const process = activeProcesses.get(socket.id);
//     if (process) {
//       process.kill();
//       activeProcesses.delete(socket.id);
//     }
//   });
// });

// // Check if Python is available
// function checkPythonAvailability() {
//   return new Promise((resolve, reject) => {
//     exec('python --version', (error, stdout, stderr) => {
//       if (error) {
//         reject(`Python not found: ${stderr || error.message}`);
//       } else {
//         resolve(`Python found: ${stdout}`);
//       }
//     });
//   });
// }

// // Start comparison process
// app.post('/api/start-check', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image file provided' });
//     }

//     const imagePath = path.join(tempDir, `${Date.now()}.jpg`);
//     console.log('Saving image to:', imagePath);
//     await fs.writeFile(imagePath, req.file.buffer);

//     console.log("Calling Bumble automation script...");
//     io.emit('bumble_called', { message: 'Bumble automation script initiated' });

//     // Check if Python is available
//     try {
//       const pythonStatus = await checkPythonAvailability();
//       console.log(pythonStatus);  // Log Python status
//     } catch (err) {
//       console.error('Error: ', err);
//       return res.status(500).json({ error: 'Python is not available on the system' });
//     }

//     // Use full path to global Python (adjust this path if necessary)
//     const pythonExecutable = 'C:\\Program Files\\Python310\\python.exe'; // Global Python path
//     const pythonScriptPath = './bumble_automation.py';

//     // const pythonProcess = spawn(
//     //   pythonExecutable, // Use the global Python executable
//     //   [
//     //     path.join(__dirname, 'bumble_automation.py'),
//     //     imagePath,
//     //     '--email', 's1973sp@gmail.com',
//     //     '--password', 'DaRkLaNd@16'
//     //   ]
//     // );


//     const pythonProcess = spawn(
//       pythonExecutable, 
//       [
//         pythonScriptPath, // Now using the relative path
//         imagePath,
//         '--email', process.env.BUMBLE_EMAIL,
//         '--password', process.env.BUMBLE_PASSWORD
//         // '--email', 's1973sp@gmail.com',
//         // '--password', 'DaRkLaNd@16'
//       ]
//     );

//     console.log('Python script spawned successfully.');

//     const sessionId = Date.now().toString();
//     activeProcesses.set(sessionId, pythonProcess);
//     console.log('Started Python process with sessionId:', sessionId);

//     pythonProcess.stdout.on('data', (data) => {
//       try {
//         const message = JSON.parse(data.toString());
//         console.log('Python process output:', message);
//         io.emit('comparison_update', message);
//       } catch (e) {
//         console.log('Python stdout error:', data.toString());
//       }
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       console.error('Python stderr:', data.toString());
//       io.emit('error', { message: 'Process error occurred' });
//     });

//     pythonProcess.on('close', (code) => {
//       console.log(`Python process exited with code ${code}`);
//       activeProcesses.delete(sessionId);
//       fs.unlink(imagePath).catch(console.error);
//     });

//     res.json({ sessionId });
//   } catch (error) {
//     console.error('Error starting process:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Stop comparison process
// app.post('/api/stop-check', async (req, res) => {
//   const { sessionId } = req.body;

//   if (!sessionId) {
//     return res.status(400).json({ error: 'Session ID is required' });
//   }

//   const process = activeProcesses.get(sessionId);

//   if (process) {
//     console.log('Stopping process with sessionId:', sessionId);
//     process.kill();
//     activeProcesses.delete(sessionId);
//     res.json({ message: 'Process stopped successfully' });
//   } else {
//     console.log('Process not found for sessionId:', sessionId);
//     res.status(404).json({ error: 'Process not found' });
//   }
// });

// // Start server
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });





// import express from 'express';
// import multer from 'multer';
// import cors from 'cors';
// import { Server } from 'socket.io';
// import { spawn } from 'child_process';
// import path from 'path';
// import fs from 'fs/promises';
// import { mkdir } from 'fs/promises';
// import http from 'http';

// console.log('entering server.js')

// const __dirname = path.resolve();
// const app = express();
// const upload = multer({ storage: multer.memoryStorage() });
// app.use(cors());
// app.use(express.json());

// // Create HTTP server
// const server = http.createServer(app);

// // Setup Socket.IO
// // const io = new Server(server, {
// //   cors: {
// //     origin: "http://localhost:5173", // adjust if needed to match the frontend's port
// //     methods: ["GET", "POST"]
// //   }
// // });

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   },
//   timeout: 50000, // 50 seconds
//   allowEIO3: true, // Allow older clients to connect
//   transports: ['websocket', 'polling'], // Enable WebSocket and polling
//   pingTimeout: 25000, // Ping timeout (25 seconds)
//   pingInterval: 20000, // Ping interval (20 seconds)
//   reconnection: true, // Enable reconnection
//   reconnectionAttempts: Infinity, // Unlimited reconnection attempts
//   reconnectionDelay: 1000, // 1-second reconnection delay
// });

// // Store active processes
// const activeProcesses = new Map();

// // Ensure temp directory exists
// const tempDir = path.join(__dirname, 'temp');
// mkdir(tempDir, { recursive: true }).catch(console.error);

// // Handle WebSocket connections
// io.on('connection', (socket) => {
//   console.log('Client connected');

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//     const process = activeProcesses.get(socket.id);
//     if (process) {
//       process.kill();
//       activeProcesses.delete(socket.id);
//     }
//   });
// });

// // Start comparison process
// app.post('/api/start-check', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image file provided' });
//     }

//     const imagePath = path.join(tempDir, `${Date.now()}.jpg`);
//     console.log('Saving image to:', imagePath);
//     await fs.writeFile(imagePath, req.file.buffer);

//     console.log("Calling Bumble automation script...");
//     io.emit('bumble_called', { message: 'Bumble automation script initiated' });

//     const pythonProcess = spawn('C:\\Users\\mange\\AppData\\Roaming\\Python\\Python310\\Scripts\\python.exe', [
//       path.join(__dirname, 'bumble_automation.py'),
//       imagePath,
//       '--email', 's1973sp@gmail.com',
//       '--password', 'DaRkLaNd@16'
//     ]);
    
//     console.log('Python script spawned successfully.');

//     const sessionId = Date.now().toString();
//     activeProcesses.set(sessionId, pythonProcess);
//     console.log('Started Python process with sessionId:', sessionId);

//     pythonProcess.stdout.on('data', (data) => {
//       try {
//         const message = JSON.parse(data.toString());
//         console.log('Python process output:', message);
//         io.emit('comparison_update', message);
//       } catch (e) {
//         console.log('Python stdout error:', data.toString());
//       }
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       console.error('Python stderr:', data.toString());
//       io.emit('error', { message: 'Process error occurred' });
//     });

//     pythonProcess.on('close', (code) => {
//       console.log(`Python process exited with code ${code}`);
//       activeProcesses.delete(sessionId);
//       fs.unlink(imagePath).catch(console.error);
//     });

//     res.json({ sessionId });
//   } catch (error) {
//     console.error('Error starting process:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Stop comparison process
// app.post('/api/stop-check', async (req, res) => {
//   const { sessionId } = req.body;

//   if (!sessionId) {
//     return res.status(400).json({ error: 'Session ID is required' });
//   }

//   const process = activeProcesses.get(sessionId);

//   if (process) {
//     console.log('Stopping process with sessionId:', sessionId);
//     process.kill();
//     activeProcesses.delete(sessionId);
//     res.json({ message: 'Process stopped successfully' });
//   } else {
//     console.log('Process not found for sessionId:', sessionId);
//     res.status(404).json({ error: 'Process not found' });
//   }
// });

// // Start server
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });





















// import express from 'express';
// import multer from 'multer';
// import cors from 'cors';
// import { Server } from 'socket.io';
// import { spawn } from 'child_process';
// import path from 'path';
// import fs from 'fs/promises';
// import { mkdir } from 'fs/promises';
// import http from 'http';

// const __dirname = path.resolve();
// const app = express();
// const upload = multer({ storage: multer.memoryStorage() });

// app.use(cors());
// app.use(express.json());

// // Create HTTP server
// const server = http.createServer(app);

// // Setup Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // adjust if needed to match the frontend's port
//     methods: ["GET", "POST"]
//   }
// });

// // Store active processes
// const activeProcesses = new Map();

// // Ensure temp directory exists
// const tempDir = path.join(__dirname, 'temp');
// mkdir(tempDir, { recursive: true }).catch(console.error);

// // Handle WebSocket connections
// io.on('connection', (socket) => {
//   console.log('Client connected');

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//     const process = activeProcesses.get(socket.id);
//     if (process) {
//       process.kill();
//       activeProcesses.delete(socket.id);
//     }
//   });
// });

// // Start comparison process
// app.post('/api/start-check', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image file provided' });
//     }

//     const imagePath = path.join(tempDir, `${Date.now()}.jpg`);
//     console.log('Saving image to:', imagePath);
//     await fs.writeFile(imagePath, req.file.buffer);

//     // const pythonProcess = spawn('python', [
//     //   path.join(__dirname, 'bumble_automation.py'),
//     //   imagePath,
//     //   '--email', process.env.BUMBLE_EMAIL,
//     //   '--password', process.env.BUMBLE_PASSWORD

//     console.log("calling bumble_automation.py")
//     const pythonProcess = spawn('python', [
//       path.join(__dirname, 'bumble_automation.py'),
//       imagePath,
//       '--email', 's1973sp@gmail.com',
//       '--password', 'DaRkLaNd@16'
//     ]);

//     const sessionId = Date.now().toString();
//     activeProcesses.set(sessionId, pythonProcess);
//     console.log('Started Python process with sessionId:', sessionId);

//     pythonProcess.stdout.on('data', (data) => {
//       try {
//         const message = JSON.parse(data.toString());
//         console.log('Python process output:', message);
//         io.emit('comparison_update', message);
//       } catch (e) {
//         console.log('Python stdout error:', data.toString());
//       }
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       console.error('Python stderr:', data.toString());
//       io.emit('error', { message: 'Process error occurred' });
//     });

//     pythonProcess.on('close', (code) => {
//       console.log(`Python process exited with code ${code}`);
//       activeProcesses.delete(sessionId);
//       fs.unlink(imagePath).catch(console.error);
//     });

//     res.json({ sessionId });
//   } catch (error) {
//     console.error('Error starting process:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Stop comparison process
// app.post('/api/stop-check', async (req, res) => {
//   const { sessionId } = req.body;

//   if (!sessionId) {
//     return res.status(400).json({ error: 'Session ID is required' });
//   }

//   const process = activeProcesses.get(sessionId);

//   if (process) {
//     console.log('Stopping process with sessionId:', sessionId);
//     process.kill();
//     activeProcesses.delete(sessionId);
//     res.json({ message: 'Process stopped successfully' });
//   } else {
//     console.log('Process not found for sessionId:', sessionId);
//     res.status(404).json({ error: 'Process not found' });
//   }
// });

// // Start server
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



// import express from 'express';
// import multer from 'multer';
// import cors from 'cors';
// import { Server } from 'socket.io';
// import { spawn } from 'child_process';
// import path from 'path';
// import fs from 'fs/promises';
// import { mkdir } from 'fs/promises';
// import http from 'http';

// const __dirname = path.resolve();
// const app = express();
// const upload = multer({ storage: multer.memoryStorage() });


// app.use(cors());
// app.use(express.json());

// // Create HTTP server
// // import http from 'http';
// const server = http.createServer(app);

// // Setup Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   }
// });

// // Store active processes
// const activeProcesses = new Map();

// // Ensure temp directory exists
// const tempDir = path.join(__dirname, 'temp');
// mkdir(tempDir, { recursive: true }).catch(console.error);

// // Handle WebSocket connections
// io.on('connection', (socket) => {
//   console.log('Client connected');

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//     // Clean up any active processes for this socket
//     const process = activeProcesses.get(socket.id);
//     if (process) {
//       process.kill();
//       activeProcesses.delete(socket.id);
//     }
//   });
// });

// // Start comparison process
// app.post('/api/start-check', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image file provided' });
//     }

//     const imagePath = path.join(tempDir, `${Date.now()}.jpg`);
//     await fs.writeFile(imagePath, req.file.buffer);

//     const pythonProcess = spawn('python', [
//       path.join(__dirname, 'bumble_automation.py'),
//       imagePath,
//       '--email', process.env.BUMBLE_EMAIL,
//       '--password', process.env.BUMBLE_PASSWORD
//     ]);

//     const sessionId = Date.now().toString();
//     activeProcesses.set(sessionId, pythonProcess);

//     // Handle Python process output
//     pythonProcess.stdout.on('data', (data) => {
//       try {
//         const message = JSON.parse(data.toString());
//         io.emit('comparison_update', message);
//       } catch (e) {
//         console.log('Python output:', data.toString());
//       }
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       console.error('Python error:', data.toString());
//       io.emit('error', { message: 'Process error occurred' });
//     });

//     pythonProcess.on('close', (code) => {
//       console.log(`Python process exited with code ${code}`);
//       activeProcesses.delete(sessionId);
//       // Clean up temporary file
//       fs.unlink(imagePath).catch(console.error);
//     });

//     res.json({ sessionId });
//   } catch (error) {
//     console.error('Error starting process:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Stop comparison process
// app.post('/api/stop-check', async (req, res) => {
//   const { sessionId } = req.body;
  
//   if (!sessionId) {
//     return res.status(400).json({ error: 'Session ID is required' });
//   }

//   const process = activeProcesses.get(sessionId);
  
//   if (process) {
//     process.kill();
//     activeProcesses.delete(sessionId);
//     res.json({ message: 'Process stopped successfully' });
//   } else {
//     res.status(404).json({ error: 'Process not found' });
//   }
// });

// // Get process status
// app.get('/api/status/:sessionId', (req, res) => {
//   const { sessionId } = req.params;
//   const isActive = activeProcesses.has(sessionId);
//   res.json({ active: isActive });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // Start server
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Cleanup on server shutdown
// process.on('SIGINT', async () => {
//   console.log('Shutting down server...');
  
//   // Kill all running processes
//   for (const [sessionId, process] of activeProcesses) {
//     process.kill();
//     activeProcesses.delete(sessionId);
//   }

//   // Clean up temp directory
//   try {
//     const files = await fs.readdir(tempDir);
//     await Promise.all(
//       files.map(file => fs.unlink(path.join(tempDir, file)))
//     );
//   } catch (error) {
//     console.error('Error cleaning up temp files:', error);
//   }

//   process.exit(0);
// });