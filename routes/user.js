var express = require('express');
var bcrypt = require('bcryptjs');

var mdAuth = require('../middlewares/auth');

var app = express();

var User = require('../models/user');

// Rutas
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    User.find({}, 'name email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, users) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar usuario',
                        errors: err
                    });
                }
                User.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        users: users
                    });

                });
            });
});



// Update user
app.put('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!user) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario no existe',
                errors: { message: 'no existe un usuario con ese ID' }
            });
        }

        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save((err, saveduser) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            saveduser.password = ':)';

            res.status(200).json({
                ok: true,
                user: saveduser
            });

        });
    });

});



// Create new user
app.post('/', mdAuth.verifyToken, (req, res) => {
    var body = req.body;

    user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, saveduser) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: saveduser,
            usertoken: req.user
        });

    });

});

// delete user
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;

    User.findByIdAndRemove(id, (err, deletedUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!deletedUser) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el ID',
                errors: { message: 'No existe el ID' }
            });
        }

        res.status(200).json({
            ok: true,
            user: deletedUser
        });
    });



});



module.exports = app;