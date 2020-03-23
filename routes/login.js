var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');

app.post('/', (req, res) => {

    var body = req.body;

    User.findOne({ email: body.email }, (err, dbUser) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar usuario',
                errors: err
            });
        }

        if (!dbUser) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, dbUser.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        // Crear un token
        dbUser.password = ':)';
        var token = jwt.sign({ user: dbUser }, SEED, { expiresIn: 14400 });


        res.status(200).json({
            ok: true,
            user: dbUser,
            id: dbUser._id,
            token: token,
            message: 'Login post correcto'
        });

    });


});



module.exports = app;