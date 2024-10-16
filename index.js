import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';
import { Server } from 'socket.io';
import createLogger from './src/logger.js';
import createConfig from './src/config/config-mgr.js';
import createDB from './src/db.js';

/**
 * The logger instance
 *
 */
const logger = createLogger('server');
/**
 * Configuration instance
 *
 */
const config = await createConfig();
/**
 * Database connection instance
 *
 */
const database = await createDB(config);

/**
 * The main entry point of the application
 * if the clusters are enabled, the primary process will fork the workers
 * otherwise, the server will run in a single process
 */
if (cluster.isPrimary) {
    const numCPUs = availableParallelism();
    database.init();
    let cpus = config.clusters ? numCPUs: 1;
    for (let i = 0; i < cpus; i++) {
        cluster.fork({
            PORT: config.basePort + i
        });
    }
    setupPrimary();
} else {
    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
        connectionStateRecovery: {},
        adapter: createAdapter()
    });

    const __dirname = dirname(fileURLToPath(import.meta.url));

    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, 'html/index.html'));
    });

    io.on('connection', async (socket) => {
        logger.debug('new user connected');
        io.emit('connection', "new user connected");
        socket.on('chat message', async (nickname, msg, clientOffset, callback) => {
            logger.chat(nickname, msg);
            const result = database.insertMessage(nickname, msg, clientOffset);
            io.emit('chat message',nickname, msg, result.lastID);
            callback();
            socket.on('disconnect', () => {
                io.emit('connection', "user disconnected");
                logger.debug('user disconnected');
            });
        });

        if (!socket.recovered) {
            logger.debug('socket not recovered');
            database.retreiveMesaages((nickname, msg, id) => {
                socket.emit('chat message',nickname, msg, id);
            });
        }
    });

    server.listen(process.env.PORT, () => {
        logger.highlight(`Running at http://localhost:${process.env.PORT}`);
    }).on('error', (e) => {
        logger.error('Error starting server', e);
    });
}