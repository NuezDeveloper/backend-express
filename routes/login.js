var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');


// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// ===============================
// Google Auth
// ===============================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                message: 'error de token'
            });
        });


    User.findOne({ email: googleUser.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar usuario',
                errors: err
            });
        }

        if (userDB) {
            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar autenticación normal'
                });
            } else {
                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 });


                res.status(200).json({
                    ok: true,
                    user: userDB,
                    id: userDB._id,
                    token: token
                });
            }
        } else {
            var user = new User();
            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';

            user.save((err, userDB) => {

                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 });


                res.status(200).json({
                    ok: true,
                    user: userDB,
                    id: userDB._id,
                    token: token
                });

            });

        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     message: 'ok',
    //     googleUser: googleUser
    // });

});


// ===============================
// Normal Auth
// ===============================

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