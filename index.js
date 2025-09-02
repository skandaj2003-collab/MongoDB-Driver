const express = require("express");
const bodyParser = require("body-parser");
const aggregateRoute = require("./api/aggregate");
const trainingRoute = require("./api/training_system");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/aggregate", aggregateRoute);
app.use("/api/training_system", trainingRoute)

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));