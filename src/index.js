const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000
const productsRoutes = require('./routes/products');

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/items', productsRoutes)

app.listen(port, () => {
    console.log('App up and running!');
})