var express = require('express');
var moment = require('moment');
var router = express.Router();
var particle_db = require("../models/particle");

//FOR TESTING 
//router.get('/readAll', function (req, res) {
//    particle_db.find(function (err, docs) {
//        if (err) {
//            let msgStr = `Something wrong....`;
//            res.status(201).json({ message: msgStr });
//        }
//        else {
//            res.status(201).json(docs);
//        }
//    });
//});

router.post('/read_patient_data', function(req, res) {
    particle_db.find({ device: req.body.device }, function (err, docs) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            res.status(201).json(docs);
        }
    });
});

router.post('/weekly_patient_data', function (req, res) {
    const end = moment(req.body.current_date).startOf('day').toDate();
    const start = moment(req.body.current_date).startOf('day').subtract(7, 'day').toDate();
    console.log(end);
    console.log(start);
    //console.log("HELLO");
    particle_db.find({
        $and: [
            {
                device: req.body.device
            },
            {
                createdAt: { $gte: start, $lt: end }
            }
        ]
    }, function (err, docs) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            
            res.status(201).json(docs);
        }
    });
});

router.post('/daily_patient_data', function (req, res) {
    const end = moment(req.body.current_date).endOf('day').toDate();
    const start = moment(req.body.current_date).startOf('day').toDate();
    console.log(end);
    console.log(start);
    console.log('start:', start);
    console.log('end:', end);
    console.log('req.body.current_date:', req.body.current_date);

    //Sconsole.log("HELLO");
    
    particle_db.find({
        $and: [
            {
                device: req.body.device
            },
            {
                published_at: { $gte: start, $lt: end }
            }
        ]
    }, function (err, docs) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            res.status(201).json(docs);
        }
    });
});
//For the webhook
router.post("/create", function (req, res) {
    res.status(200);
    console.log(req.body);

    let HR_Value;
    let SPO2_Value;

    if (req.body.HR === "-999") {
        HR_Value = 0;
    } else {
        HR_Value = req.body.HR;
    }

    if (req.body.SPO2 === "-999") {
        SPO2_Value = 0;
    } else {
        SPO2_Value = req.body.SPO2;
    }

    const newParticle = new particle_db({
        device: req.body.coreid,
        HR: HR_Value,
        SPO2: SPO2_Value,
        published_at: req.body.published_at,
    });
    newParticle.save(function (err, device) {
        if (err) {
            var errormsg = { "error": "Error Saving Data." }
            res.status(400).send(errormsg);
        }
        else {
            var msg = { "response": "Data recorded." }
            res.status(201).json(msg);
        }
    });
});

module.exports = router;