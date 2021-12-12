const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();
const log = require('./logger');


app.use(express.static('./'));
app.use(express.json());
app.use(cors());


app.get('/api/goods', (request, response) => {
    console.log('/goods route handler', request.ip);
    fs.readFile('./goods.json', 'utf-8', (err, data) => {
        if (err) {
            console.log('Read goods.json error!', err);
            response.send('Read goods.json error!');
            return;
        }

        return response.send(data);
    })
});


app.get('/api/basket-goods', (request, response) => {
    console.log('/basket-goods route handler', request.ip);
    fs.readFile('./basket-goods.json', 'utf-8', (err, data) => {
        if (err) {
            console.log('Read basket-goods.json error!', err);
            response.send('Read basket-goods.json error!');
            return;
        }

        const basket = JSON.parse(data);
        const total = basket.reduce((acc, cur) => acc + (cur.price * cur.quantity), 0);

        return response.json({
            total,
            contents: basket,
        });
    })
});


app.post('/api/basket-goods', (request, response) => {
    console.log('/basket-goods POST route handler', request.ip);
    fs.readFile('./basket-goods.json', 'utf-8', (err, data) => {
        if (err) {
            console.log('Read basket-goods.json error!', err);
            response.send('Read basket-goods.json error!');
            return;
        }

        const basket = JSON.parse(data);
        const item = request.body;
        console.log(request.body);

        const itemIndex = basket.findIndex((goodsItem) => goodsItem.id === item.id);
        if (itemIndex > -1) {
            basket[itemIndex].quantity += 1;
        } else {
            basket.push({...item, quantity: 1});
        }

        log('ADD', item.id);

        fs.writeFile('./basket-goods.json', JSON.stringify(basket), (err) => {

            if (err) {
                console.log('Write basket-goods.json error!', err);
                response.json({
                    status: 0,
                    message: 'Write basket-goods.json error',
                    error: err,
                });

                return;
            }
            response.json({status: 1});
        });

    });
});


app.delete('/api/basket-goods/:id', (req, res) => {
    fs.readFile('./basket-goods.json', 'utf-8', (err, data) => {
        if (err) {
            console.log('Read basket-goods.json error!', err);
            res.send('Read basket-goods.json error!');
            return;
        }

        let basket = JSON.parse(data);
        const id = parseInt(req.params.id);
        console.log(req.params);

        basket = basket.filter((goodsItem) => goodsItem.id !== id);

        log('DELETE', id);


        fs.writeFile('./basket-goods.json', JSON.stringify(basket), (err) => {

            if (err) {
                console.log('Write basket-goods.json error!', err);
                res.json({
                    status: 0,
                    message: 'Write basket-goods.json error',
                    error: err,
                });

                return;
            }
            res.json({status: 1});
        });

    });
});


app.listen(3000, () => {
    console.log('App is running @ http://localhost: 3000');
});




