// Requires
var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables
var app = express();

// Connect database
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (err, res) => {
    if (err) throw err;

    console.log('Data Base working');

});

// Settings
app.set('port', process.env.PORT || 3000);

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(app.get('port'), function() {
    console.log('Express server on port ', app.get('port'));
});