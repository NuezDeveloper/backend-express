var express = require('express');

var fileUpload = require('express-fileupload');

var fs = require('fs');

var app = express();

var User = require('../models/user');
var Doctor = require('../models/doctor');
var Hospital = require('../models/hospital');

app.use(fileUpload());

// Rutas
app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    // collection types
    var validTypes = ['hospitals', 'doctors', 'users'];
    if (validTypes.indexOf(type) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            message: 'Tipo de colección no válida'
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No ha seleccionado nada',
            message: 'debe seleccionar una imagen'
        });
    }

    // Get file name
    var file = req.files.image;
    var cutname = file.name.split('.');
    var extensionfile = cutname[cutname.length - 1];

    // We accept only these extensions
    var validExtensions = ['png', 'jpg', 'gif', 'jpeg'];

    if (validExtensions.indexOf(extensionfile) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extensión de la imagen no válida',
            message: 'Las extensiones válidas son ' + validExtensions.join(', ')
        });
    }

    // Customized file name
    var filename = `${id}-${ new Date().getMilliseconds() }.${extensionfile}`;

    // Move file from temporal to path
    var path = `./uploads/${type}/${filename}`;

    file.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                erros: err
            });
        }




    });
    uploadByType(type, id, filename, res);

});


function uploadByType(type, id, filename, res) {

    if (type === 'users') {

        User.findById(id, (err, user) => {

            if (!user) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Algo ha salido mal',
                    errors: err
                });
            }

            var oldPath = './uploads/users/' + user.img;

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            user.img = filename;

            user.save((err, updateduser) => {

                updateduser.password = ':)';

                if (err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Algo ha salido mal',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    user: updateduser
                });

            });

        });

    }

    if (type === 'doctors') {

        Doctor.findById(id, (err, doctor) => {

            if (!doctor) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Algo ha salido mal',
                    errors: err
                });
            }

            var oldPath = './uploads/doctors/' + doctor.img;

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            doctor.img = filename;

            doctor.save((err, updateddoctor) => {

                if (err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Algo ha salido mal',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    doctor: updateddoctor
                });

            });

        });

    }

    if (type === 'hospitals') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Algo ha salido mal',
                    errors: err
                });
            }

            var oldPath = './uploads/hospitals/' + hospital.img;

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            hospital.img = filename;

            hospital.save((err, updatedhospital) => {

                if (err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Algo ha salido mal',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: updatedhospital
                });

            });

        });

    }


}

module.exports = app;