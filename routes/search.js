var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

// Búsqueda por colección
app.get('/collection/:table/:search', (req, res) => {

    var search = req.params.search;

    var regex = new RegExp(search, 'i');

    var table = req.params.table;

    var promise;

    switch (table) {

        case 'user':
            promise = searchUsers(regex);
            break;
        case 'doctor':
            promise = searchDoctors(regex);
            break;
        case 'hospital':
            promise = searchHospitals(regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                message: 'Something went wrong'
            });

    }

    promise.then(data => {
        res.status(200).json({
            ok: false,
            [table]: data
        });
    });



});



// Búsqueda global
app.get('/all/:search', (req, res, next) => {

    var search = req.params.search;

    var regex = new RegExp(search, 'i');

    Promise.all(
        [searchHospitals(regex),
            searchDoctors(regex),
            searchUsers(regex)
        ]).then(resp => {
        res.status(200).json({
            ok: true,
            hospitals: resp[0],
            doctors: resp[1],
            users: resp[2]
        });
    });
});


function searchHospitals(regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ name: regex })
            .populate('user', 'name email')
            .exec((err, hospitals) => {

                if (err) {
                    reject('error al cargar hospitales');
                } else {
                    resolve(hospitals);
                }

            });

    });

}


function searchDoctors(regex) {

    return new Promise((resolve, reject) => {

        Doctor.find({ name: regex })
            .populate('user', 'name email')
            .populate('hospital', 'name')
            .exec((err, doctors) => {

                if (err) {
                    reject('error al cargar médicos');
                } else {
                    resolve(doctors);
                }

            });

    });

}

function searchUsers(regex) {

    return new Promise((resolve, reject) => {

        User.find({}, 'name email role')
            .or([{ name: regex }, { email: regex }])
            .exec((err, users) => {

                if (err) {
                    reject('Error al cargar usuarios');
                } else {
                    resolve(users);
                }

            });

    });

}

module.exports = app;