var express = require('express');
var router = express.Router();
var Patient = require("../models/patient");
var Physician = require("../models/physician");
//Authentication FOR LATER
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const secret = fs.readFileSync(__dirname + '/../keys/jwtkey').toString();

//var express = require('express');
//var router = express.Router();
///var Patient = require("../models/patient");

// CRUD implementations
// https://learn.zybooks.com/zybook/ARIZONAECE413513HongFall2021/chapter/8/section/2

router.post("/create", function(req, res) {
    Patient.findOne({ email: req.body.email }, function(err, patient) {
        if (err) res.status(401).json({ success: false, err: err });
        else if (patient) {
            

            res.status(401).json({ success: false, msg: "This email has already been used. Try again!" });
        }
        else {
            const passwordHash = bcrypt.hashSync(req.body.password, 10);

            const newPatient = new Patient({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: passwordHash,
                device: req.body.device
            });

            newPatient.save(function(err, patient) {
                if (err) {
                    console.log("ERROR");
                    res.status(400).send(err);
                }
                else {
                    let msgStr = `Patient (${req.body.first_name} ${req.body.last_name}) account created!`;
                    res.status(201).json(msgStr);
                    console.log(msgStr);
                }
            });
        }
    });
       
});

router.get('/readAll', function(req, res) {
    Patient.find(function(err, docs) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            res.status(201).json(docs);
        }
    });
});


router.post("/logIn", function(req, res) {
    if (!req.body.email || !req.body.password) {
        res.status(401).json({ msg: "Missing email and/or password" });
        return;
    }
    // Get user from the database
    Patient.findOne({ email: req.body.email }, function(err, patient) {
        
        if (err) {
            res.status(400).send(err);
        }
        else if (!patient) {
            // Username not in the database
            res.status(401).json({ msg: "Login failure!! No email found." });
        }
        else {
            if (bcrypt.compareSync(req.body.password, patient.password)) {
                const token = jwt.encode({ email: patient.email }, secret);
                //update user's last access time
                patient.lastAccess = new Date();
                patient.save((err, patient) => {
                    console.log("User's LastAccess has been update.");
                });
                // Send back a token that contains the user's username
                res.status(201).json({ success: true, token: token, msg: "Login success" });
            }
            else {
                res.status(401).json({ success: false, msg: "Email or password invalid." });
            }
        }
    });
});

router.get("/status", function(req, res) {
    // See if the X-Auth header is set
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ success: false, msg: "Missing X-Auth header" });
    }

    // X-Auth should contain the token 
    const token = req.headers["x-auth"];
    try {
        const decoded = jwt.decode(token, secret);
        console.log(decoded.email)
        // Send back info
        Patient.find({ email: decoded.email }, "first_name last_name email device lastAccess physician", function(err, users) {
            if (err) {
                res.status(400).json({ success: false, message: "Error contacting DB. Please contact support." });
            }
            else {
                res.status(200).json(users);
            }
        });
    }
    catch (ex) {
        res.status(401).json({ success: false, message: "Invalid JWT" });
    }
});

router.post("/updateInfo", async function(req, res) {
    const { _id, first_name, last_name,  password, physician, device } = req.body
    
    let updateObject = {};
    
    if (first_name) {
        updateObject.first_name = first_name;
    }

    if (last_name) {
        updateObject.last_name = last_name;
    }
    if (device) {
        updateObject.device = device;
    }
    if (password) {
        const passwordHash = bcrypt.hashSync(password, 10);
        updateObject.password = passwordHash;
    }
    if (physician) {
        await Physician.findOne({ email: physician }, function(err, phys) {
            if (err) res.status(401).json({ success: false, err: err });
            else if (phys) {
                updateObject.physician = phys.email;
                Patient.findOneAndUpdate({ _id: _id }, { "$set": updateObject }, { new: true }, function(err, doc) {
                    if (err) {
                        let msgStr = `Something wrong....`;
                        return res.status(201).json({ message: msgStr, err: err });
                    } else {
                        let msgStr;
                        if (doc == null) {
                            msgStr = `Patient info does not exist in DB.`;
                        } else {
                            msgStr = `Patient info has been updated.`;
                        }

                        return res.status(201).json(msgStr);
                    }
                });
            }
            else {
                res.status(401).json({
                    success: false, msg: `No physician found with email ${physician}`
                });
            }
        });
    }
    
    else {
        console.log(updateObject);
        console.log(_id);
        Patient.findOneAndUpdate({ _id: _id }, { "$set":updateObject }, { new: true }, function(err, doc) {
            if (err) {
                let msgStr = `Something wrong....`;
                return res.status(201).json({ message: msgStr, err: err });
            } else {
                let msgStr;
                if (doc == null) {
                    msgStr = `Patient info does not exist in DB.`;
                } else {
                    msgStr = `Patient info has been updated.`;
                }

                return res.status(201).json(msgStr);
            }
        });
     
    }
    
});

  




module.exports = router;