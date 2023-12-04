var express = require('express');
var router = express.Router();
var Physician = require("../models/physician");
var Patient = require("../models/patient");
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
    Physician.findOne({ email: req.body.email }, function(err, physician) {
        if (err) res.status(401).json({ success: false, err: err });
        else if (physician) {


            res.status(401).json({ success: false, msg: "This email has already been used. Try again!" });
        }
        else {
            const passwordHash = bcrypt.hashSync(req.body.password, 10);

            const newPhysician = new Physician({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: passwordHash
            });

            newPhysician.save(function(err, physician) {
                if (err) {
                    console.log("ERROR");
                    res.status(400).send(err);
                }
                else {
                    let msgStr = `Physician (${req.body.first_name} ${req.body.last_name}) account created!`;
                    res.status(201).json(msgStr);
                    console.log(msgStr);
                }
            });
        }
    });

});

router.get('/readAll', function(req, res) {
    Physician.find(function(err, docs) {
        if (err) {
            let msgStr = `Something wrong....`;
            res.status(201).json({ message: msgStr });
        }
        else {
            res.status(201).json(docs);
        }
    });
});

router.get('/read_all', function(req, res) {
    Patient.find({}, "first_name device", function(err, docs) {
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
    Physician.findOne({ email: req.body.email }, function(err, physician) {
        if (err) {
            res.status(400).send(err);
        }
        else if (!physician) {
            // Username not in the database
            res.status(401).json({ msg: "Login failure!! No email found." });
        }
        else {
            if (bcrypt.compareSync(req.body.password, physician.password)) {
                const token = jwt.encode({ email: physician.email }, secret);
                //update user's last access time
                physician.lastAccess = new Date();
                physician.save((err, physician) => {
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
        Physician.find({ email: decoded.email }, "first_name last_name email", function(err, users) {
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
    const { _id, first_name, last_name, password } = req.body

    let updateObject = {};

    if (first_name) {
        updateObject.first_name = first_name;
    }

    if (last_name) {
        updateObject.last_name = last_name;
    }
   
    if (password) {
        const passwordHash = bcrypt.hashSync(password, 10);
        updateObject.password = passwordHash;
    }
   
    if (updateObject != null) {
        Physician.findOneAndUpdate({ _id: _id }, { "$set": updateObject }, { new: true }, function(err, doc) {
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