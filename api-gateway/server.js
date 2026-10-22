const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

app.get('/health', async (req, res) => {
    const healthChecks = {
        gateway: { status: 'healthy', timestamp: new Date().toISOString() },
        services: {}
    };
    
    try {
        await fetch(`${USER_SERVICE_URL}/health`);
        healthChecks.services.userService = { status: 'healthy', url: USER_SERVICE_URL };
    } catch (error) {
        healthChecks.services.userService = { status: 'unhealthy', url: USER_SERVICE_URL, error: error.message };
    }
    
    try {
        await fetch(`${PRODUCT_SERVICE_URL}/health`);
        healthChecks.services.productService = { status: 'healthy', url: PRODUCT_SERVICE_URL };
    } catch (error) {
        healthChecks.services.productService = { status: 'unhealthy', url: PRODUCT_SERVICE_URL, error: error.message };
    }
    
    try {
        await fetch(`${ORDER_SERVICE_URL}/health`);
        healthChecks.services.orderService = { status: 'healthy', url: ORDER_SERVICE_URL };
    } catch (error) {
        healthChecks.services.orderService = { status: 'unhealthy', url: ORDER_SERVICE_URL, error: error.message };
    }
    
    res.json(healthChecks);
});

const createProxyWithErrorHandling = (target, pathRewrite = {}) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite,
        timeout: 10000,
        onError: (err, req, res) => {
            console.error(`Proxy error for ${req.url}:`, err.message);
            res.status(503).json({
                error: 'Service temporarily unavailable',
                service: target,
                timestamp: new Date().toISOString()
            });
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`Proxying ${req.method} ${req.originalUrl} to ${target}`);
        }
    });
};

// Đặt Proxy TRƯỚC express.json() để không làm hỏng body stream của POST/PUT/PATCH
app.use('/users', createProxyWithErrorHandling(USER_SERVICE_URL, { '^/users/health': '/health' }));
app.use('/products', createProxyWithErrorHandling(PRODUCT_SERVICE_URL, { '^/products/health': '/health' }));
app.use('/orders', createProxyWithErrorHandling(ORDER_SERVICE_URL, { '^/orders/health': '/health' }));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Microservices API Gateway',
        version: '1.0.0',
        services: {
            userService: USER_SERVICE_URL,
            productService: PRODUCT_SERVICE_URL,
            orderService: ORDER_SERVICE_URL
        },
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));