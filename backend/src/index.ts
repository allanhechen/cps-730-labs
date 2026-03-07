import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import db from './persistence/index';
import getItems from './routes/getItems';
import addItem from './routes/addItem';
import updateItem from './routes/updateItem';
import deleteItem from './routes/deleteItem';
import getCategories from './routes/getCategories';
import addCategory from './routes/addCategory';
import addItemToCategory from './routes/addItemToCategory';
import removeItemFromCategory from './routes/removeItemFromCategory';
import updateItemPriority from './routes/updateItemPriority';

dotenv.config();

const PORT = process.env.PORT || 3000;
const DB_LOCATION = process.env.SQLITE_DB_LOCATION || '/etc/todos/todo.db';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

app.use(
    cors({
        origin: CLIENT_ORIGIN,
    }),
);

app.use(express.json());

app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

app.get('/categories', getCategories);
app.post('/categories', addCategory);
app.post('/items/:itemId/categories', addItemToCategory);
app.delete('/items/:itemId/categories', removeItemFromCategory);

app.put('/items/:id/priority', updateItemPriority);

db.init(DB_LOCATION)
    .then(() => {
        app.listen(PORT, () => console.log('Listening on port 3000'));
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => {
            console.log('Shutdown complete.');
            process.exit(0);
        });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
