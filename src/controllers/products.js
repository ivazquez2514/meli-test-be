const https = require('https');

function getProducts(req, res) {
    try {
        https.get(`https://api.mercadolibre.com/sites/MLA/search?q=${req.query.q}`, (httpsResponse) => {
            const data = [];

            httpsResponse.on('error', () => {
                res.status(500).json({
                    msg: 'Something went wrong.'
                })
                return;
            })

            httpsResponse.on('data', (chunk) => {
                data.push(chunk);
            })

            httpsResponse.on('end', () => {
                const meliResponse = JSON.parse(Buffer.concat(data).toString());

                res.status(200).json({
                    categories: meliResponse.filters.find((filter) => filter.id === 'category')?.values[0]?.path_from_root.map((item) => item.name) || [],
                    items: meliResponse.results?.map((item) => ({
                        id: item.id,
                        title: item.title,
                        condition: item.condition,
                        price: {
                            currency: item.currency_id,
                            amount: item.price,
                        },
                        free_shipping: item.shipping?.free_shipping,
                        picture: item.thumbnail,
                    })),
                    originalObject: meliResponse,
                })
            });
        })
    } catch (error) {
        res.status(500).json({
            msg: 'Something went wrong.'
        })
    }
}

function getHttpsRequestAsPromise(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (httpsResponse) => {
            const data = [];
            
            httpsResponse.on('data', (chunk) => {
                data.push(chunk);
            });

            httpsResponse.on('end', () => {
                const response = JSON.parse(Buffer.concat(data).toString());

                if (response.error) {
                    if (response.error === 'not_found') {
                        reject({
                            status: 404,
                            error: response.error,
                        })
                        return;
                    }

                    reject({
                        status: 500,
                        error: response.error,
                    });
                    return;
                } 

                resolve(response);
            })

            httpsResponse.on('error', (error) => {
                reject({
                    status: 500,
                    error
                });
            })
        })
    })
}

async function getProductDetail(req, res) {
    try {
        Promise
            .all([
                getHttpsRequestAsPromise(`https://api.mercadolibre.com/items/${req.params.id}`),
                getHttpsRequestAsPromise(`https://api.mercadolibre.com/items/${req.params.id}/description`),
            ])
            .then(([detailResponse, descriptionResponse]) => {
                res.json({
                    id: detailResponse?.id,
                    title: detailResponse?.title,
                    condition: detailResponse.condition,
                    price: {
                        currency: detailResponse.currency_id,
                        amount: detailResponse.price,
                    },
                    free_shipping: detailResponse.shipping?.free_shipping,
                    picture: detailResponse.pictures[0]?.url || '',
                    sold_quantity: detailResponse?.sold_quantity,
                    description: descriptionResponse?.plain_text || '',
                });
            }).catch((error) => {
                res.status(error?.status || 500).json({
                    error: error.error,
                    msg: 'Oops!, something went wrong',
                });
            });
    } catch (error) {
        res.status(500).json({
            msg: 'Something went wrong.'
        })
    }
}

module.exports = {
    getProducts,
    getProductDetail,
}