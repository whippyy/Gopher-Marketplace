FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Expose the port Render expects (3000)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
