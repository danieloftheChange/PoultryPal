# Use an Alpine-based Node.js image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies, ignoring peer dependency conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the port that the app runs on
EXPOSE 5173

# Default command to run the app
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
