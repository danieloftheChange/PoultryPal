import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "./config/logger.js";
import connectToMongoDB from "./config/db.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./config/swagger.js";
import farmRoutes from "./src/farm/farm.routes.js";
import userRoutes from "./src/users/users.routes.js";
import diagnosisRoutes from "./src/diagnosis/diagnosis.routes.js";
import houseRoutes from "./src/house/house.routes.js";
import stockRoutes from "./src/stock/stock.routes.js";
import batchRoutes from "./src/batch/batch.routes.js";
import productionRoutes from "./src/production/production.routes.js";
import monitoringRoutes from "./src/monitoring/monitoring.routes.js";

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api/v1/farm", farmRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/diagnosis", diagnosisRoutes);
app.use("/api/v1/house", houseRoutes);
app.use("/api/v1/stock", stockRoutes);
app.use("/api/v1/batch", batchRoutes);
app.use("/api/v1/production", productionRoutes);
app.use("/api/v1/monitoring", monitoringRoutes);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB and start the server
connectToMongoDB()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {  
      logger.info(`Server is running on http://0.0.0.0:${port}`);
    });
  })
  .catch((error) => {
    console.error(
      "Failed to start server due to MongoDB connection error:",
      error
    );
  });

export default app;
