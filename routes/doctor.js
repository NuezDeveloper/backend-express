var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();

var Doctor = require('../models/doctor');

// Rutas
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Doctor.find({})
        .skip(desde)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec(
            (err, doctors) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar médico',
                        errors: err
                    });
                }
                Doctor.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        doctors: doctors
                    });
                });
            });
});



// Update user
app.put('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Doctor.findById(id, (err, doctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar doctor',
                errors: err
            });
        }
        if (!doctor) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El doctor no existe',
                errors: { message: 'no existe un doctor con ese ID' }
            });
        }

        doctor.name = body.name;
        doctor.user = req.user;
        doctor.hospital = body.hospital;

        doctor.save((err, saveddoctor) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar doctor',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                doctor: saveddoctor
            });

        });
    });

});



// Create new user
app.post('/', mdAuth.verifyToken, (req, res) => {
    var body = req.body;

    doctor = new Doctor({
        name: body.name,
        img: body.img,
        user: req.user,
        hospital: body.hospital
    });

    doctor.save((err, saveddoctor) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear doctor',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            doctor: saveddoctor,
            usertoken: req.user
        });

    });

});

// delete user
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;

    Doctor.findByIdAndRemove(id, (err, deleteddoctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar doctor',
                errors: err
            });
        }

        if (!deleteddoctor) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el ID',
                errors: { message: 'No existe el ID' }
            });
        }

        res.status(200).json({
            ok: true,
            doctor: deleteddoctor
        });
    });



});



module.exports = app;