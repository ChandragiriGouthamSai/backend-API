const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3400; 

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "12345",
    database: "postgres"
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
