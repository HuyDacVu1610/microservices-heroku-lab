const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

let orders = [];

app.get('/orders', (req, res) => res.json(orders));

app.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
});

app.post('/orders', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        
        try {
            await axios.get(`${USER_SERVICE_URL}/users/${userId}`, { timeout: 5000 });
        } catch (error) {
            return res.status(400).json({ error: 'Invalid user or user service unavailable' });
        }
        
        let product;
        try {
            const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/products/${productId}`, { timeout: 5000 });
            product = productResponse.data;
        } catch (error) {
            return res.status(400).json({ error: 'Invalid product or product service unavailable' });
        }
        
        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }
        
        try {
            await axios.patch(`${PRODUCT_SERVICE_URL}/products/${productId}/stock`, { quantity }, { timeout: 5000 });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update product stock' });
        }
        
        const newOrder = {
            id: orders.length + 1,
            userId: parseInt(userId),
            productId: parseInt(productId),
            quantity: parseInt(quantity),
            totalPrice: product.price * quantity,
            status: 'completed',
            createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
    res.json({
        service: 'order-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        dependencies: { userService: USER_SERVICE_URL, productService: PRODUCT_SERVICE_URL }
    });
});

app.get('/', (req, res) => {
    res.json({ service: 'Order Service', version: '1.0.0' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));