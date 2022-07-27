require("dotenv").config();

const express = require("express");
const app = express();
const compression = require("compression");
const cors = require("cors");
const dbService = require("./services/db.service");

app.use(cors());
app.use(compression());
app.use(express.json());

const startApp = async function () {
  try {
    console.log("Application is attempting to connect to database...");
    await dbService.connect();

    console.log("Database connection successful");
    console.log("Starting App");

    const PORT = process.env.PORT || 4500;

    app.listen(PORT, () => {
      console.log(`API is live on port ${PORT}`);

      app.use('/api', require('./routes/api.routes'));
    });
  } catch (error) {
    console.error("Application failed to start: " + error);

    process.exit(1);
  }
};

startApp();
