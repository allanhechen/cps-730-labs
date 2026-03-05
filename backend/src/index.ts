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
import cors from 'cors';

import express from 'express';
const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173',
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

db.init()
    .then(() => {
        app.listen(3000, () => console.log('Listening on port 3000'));
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
