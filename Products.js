require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { Sequelize } = require("sequelize");
const app = express();
const port = process.env.PORT || 3400;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sequelize = new Sequelize(
    `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`,
    {
        dialect: "postgres",
        protocol: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false 
            }
        }
    }
);

sequelize.sync().then(() => { console.log("Database is connected") })
.catch((err) => {
    console.log(err);
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

testConnection();

app.get('/products', async (request, response) => {
    try {
        const productsQuery = await pool.query('SELECT * FROM products');
        const reviewsQuery = await pool.query('SELECT * FROM product_reviews');
        
        const products = productsQuery.rows.map(product => {
            const reviews = reviewsQuery.rows.filter(review => review.product_id === product.id);
            return {
                ...product,
                reviews: reviews 
            };
        });

        response.status(200).json(products);
    } catch (error) {
        console.error('Error executing query', error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
