const express = require("express");
const bodyParser = require("body-parser");
const aggregateRoute = require("./api/aggregate");

const app = express();
app.use(bodyParser.json());
app.use("/api/aggregate", aggregateRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));