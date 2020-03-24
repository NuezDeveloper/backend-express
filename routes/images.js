var express = require('express');

var app = express();

const path = require('path');

const fs = require('fs');


// Rutas
app.get('/:type/:img', (req, res, next) => {

    var type = req.params.type;
    var img = req.params.img;

    var imagePath = path.resolve(__dirname, `../uploads/${type}/${img}`);

    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        var noImagePath = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(noImagePath);
    }
});

module.exports = app;