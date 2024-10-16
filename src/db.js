import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import createLogger from './logger.js';
const logger = createLogger('database');


export default async function getDb(config) {
    const database = await open({
        filename: config.dbFileName,
        driver: sqlite3.Database
    })
    return {
        db: database,
        init: async () => {
            if (config.freshStart) {
                logger.warning('Fresh start, Dropping tables', 1);
                await database.exec('DROP TABLE IF EXISTS messages');
            }
            await database.exec(`
            CREATE TABLE IF NOT EXISTS messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              client_offset TEXT UNIQUE,
              nickname TEXT,
              content TEXT
            )`);
        },
        insertMessage: async (nickname,msg, clientOffset) => {
            let result;
            try {
                result = await database.run('INSERT INTO messages (nickname, content, client_offset) VALUES (?, ?, ?)', nickname ,msg, clientOffset);
            } catch (e) {
                if (e.errno === 19 /* SQLITE_CONSTRAINT */) {
                    logger.error('SQLITE_CONSTRAINT', e);
                } else {
                    logger.error(`Error Inserting Message: ${msg} client:${clientOffset}`, e);
                }
                return result;
            }
        },
        retreiveMesaages: async (callback,since = 0) => {
            try {
                await database.each('SELECT id, nickname, content FROM messages WHERE id > ?',since, (_err, row) => {
                        if(_err){
                            logger.error('Error fetching messages', _err);
                        } else {
                            callback(row.nickname, row.content, row.id);
                        }
                    }
                )
            } catch (e) {
                logger.error('Error fetching messages', e);
            }
        },
    }
}
