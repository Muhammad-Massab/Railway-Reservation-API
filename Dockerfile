# Use official Node.js 16 image
FROM node:16

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose the app port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]