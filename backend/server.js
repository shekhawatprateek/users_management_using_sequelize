require('dotenv').config();
const express = require('express');
const cors = require('cors')
const { connectDB, sequelize } = require('./config/db');
const User = require('./models/user.model');
const userRoute = require('./routes/user.route')

const PORT = process.env.PORT || 8000;
const app = express();

connectDB();
app.use(cors())
app.use(express.json())
app.use('/v1/user', userRoute)

sequelize.sync()
    .then(() => {
        console.log("Database synced and tables created.");
    })
    .catch((err) => {
        console.log("Failed to sync database: ", err.message);
    });


app.get('/', (req, res) => {
    res.send("Server and Database are connected!");
});



app.listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
});