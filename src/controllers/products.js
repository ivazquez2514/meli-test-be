const https = require('https');

function getProducts(req, res) {
    try {
        https.get('https://api.mercadolibre.com/sites/MLA/search?q=perfume', (httpsResponse) => {
            const data = [];
            httpsResponse.on('data', (chunk) => {
                data.push(chunk);
            })

            httpsResponse.on('end', () => {
                const products = JSON.parse(Buffer.concat(data).toString());

                res.status(200).json({
                    products,
                })
            });
        })
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    getProducts,
}