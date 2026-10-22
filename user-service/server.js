const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

app.get('/users', (req, res) => {
    res.json(users);
});

app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

app.post('/users', (req, res) => {
    const { name, email } = req.body;
    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    users[userIndex] = { ...users[userIndex], ...req.body };
    res.json(users[userIndex]);
});

app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    users = users.filter(u => u.id !== userId);
    res.status(204).send();
});

app.get('/health', (req, res) => {
    res.json({ service: 'user-service', status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({ service: 'User Service', version: '1.0.0' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));