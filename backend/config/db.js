const { Sequelize } = require("sequelize");


const db_host = process.env.DB_HOST;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;
const db_name = process.env.DB_NAME;

// console.log(db_host)
// console.log(db_user)
// console.log(db_password)
// console.log(db_name)


const sequelize = new Sequelize(db_name, db_user, db_password, {
  host: db_host,
  dialect: "mysql", // Tells Sequelize which database engine to use
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database Connected");
  } catch (error) {
    console.log("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

module.exports = {connectDB, sequelize}
