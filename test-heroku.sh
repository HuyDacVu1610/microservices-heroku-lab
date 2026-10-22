#!/bin/bash
# Thay URL dưới đây bằng GATEWAY_URL của bạn nếu chạy ở cửa sổ terminal mới
GATEWAY_URL="${GATEWAY_URL:-https://your-username-api-gateway.herokuapp.com}"

echo "Testing API Gateway..."
curl -s "$GATEWAY_URL/"

echo -e "\n\nTesting health checks..."
curl -s "$GATEWAY_URL/health"

echo -e "\n\nTesting Users service..."
curl -s "$GATEWAY_URL/users"

echo -e "\n\nCreating new user..."
curl -s -X POST "$GATEWAY_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@heroku.com"}'

echo -e "\n\nTesting Products service..."
curl -s "$GATEWAY_URL/products"

echo -e "\n\nCreating new product..."
curl -s -X POST "$GATEWAY_URL/products" \
  -H "Content-Type: application/json" \
  -d '{"name": "Heroku Product", "price": 50, "stock": 100}'

echo -e "\n\nCreating order..."
curl -s -X POST "$GATEWAY_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "productId": 1, "quantity": 2}'

echo -e "\n\nGetting all orders..."
curl -s "$GATEWAY_URL/orders"
echo ""
