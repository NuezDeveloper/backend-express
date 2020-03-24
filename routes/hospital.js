var express = require('express');
//var bcrypt = require('bcryptjs');

var mdAuth = require('../middlewares/auth');

var app = express();

var Hospital = require('../models/hospital');

// Rutas
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('user', 'name email')
        .exec(
            (err, hospitals) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar hospital',
                        errors: err
                    });
                }
                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        hospitals: hospitals
                    });
                });
            });
});



// Update hospital
app.put('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital no existe',
                errors: { message: 'no existe un hospital con ese ID' }
            });
        }

        hospital.name = body.name;
        hospital.user = req.user;

        hospital.save((err, savedhospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: savedhospital
            });

        });
    });

});



// Create new hospital
app.post('/', mdAuth.verifyToken, (req, res) => {
    var body = req.body;

    hospital = new Hospital({
        name: body.name,
        img: body.img,
        user: req.user
    });

    hospital.save((err, savedhospital) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: savedhospital,
            usertoken: req.user
        });

    });

});

// delete hospital
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, deletedHospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!deletedHospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el ID',
                errors: { message: 'No existe el ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: deletedHospital
        });
    });



});



module.exports = app;