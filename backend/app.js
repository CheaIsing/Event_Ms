require("dotenv").config()
const bodyParser = require("body-parser");
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload');

const authRoute = require("./routes/auth.route");
const profileRoute = require("./routes/profile.route");

const app = express();
const port = 3000;

app.set(express.json());  
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
// app.use("/api/events", );


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

