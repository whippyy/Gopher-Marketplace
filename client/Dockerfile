FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
EXPOSE 3000
CMD ["sh", "-c", "echo 'Building at runtime...' && npm run build && npm start"] 