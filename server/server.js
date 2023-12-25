import express from 'express'
import path from 'path';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import sqlite3 from 'sqlite3';








 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT ?? 3000;
const app = express();
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

const server = createServer(app)

server.listen(port, () => {
    console.log(`Started at ${port}`);
  });

  const io = new Server(server, {
    connectionStateRecovery: {}
  })

  
  
  dotenv.config();
  
  // Specify the SQLite database file path
  const dbFilePath = './database.db';
  
  // Create a new SQLite database connection
  const db = new sqlite3.Database(dbFilePath,sqlite3.OPEN_READWRITE, (err) => {if (err) {console.error(err.message);}});
  
  //Create table
  const sql = `CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
  )`;
  
  db.run(sql);


io.on('connection', (socket) => {
  socket.on('chat message', async (msg) => {
    let result;
    try {
      console.log(msg)
    
      result = await db.execute({
        sql: `INSERT INTO messages (content) VALUES (:content)`,
        args: { content: msg }
      });
    } catch (e) {
      console.error(e)
      return
    }
  
    io.emit('chat message', msg, result.lastInsertRowid.toString())
  })
  
  })
  
  
