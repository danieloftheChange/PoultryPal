import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PoultryPal API",
      version: "1.0.0",
      description: "API documentation for the PoultryPal application",
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || "http://localhost:3000/api/v1",
        description: "API Server",
      },
      {
        url: "http://127.0.0.1:3000/api/v1",
        description: "Local Development Server",
      },
    ],
  },
  apis: [
    path.join(__dirname, "../src/*/*.routes.js"),
    path.join(__dirname, "../src/*/*.controller.js"),
  ],
};

export default swaggerOptions;
