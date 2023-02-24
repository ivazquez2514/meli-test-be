const express = require('express');
const app = express();
const port = 3000
const productsRoutes = require('./routes/products');


app.use('/products', productsRoutes)

app.listen(port, () => {
    console.log('App up and running!');
})