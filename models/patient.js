const db = require("../db");

const patientSchema = new db.Schema({
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    lastAccess: { type: Date, default: Date.now },
    physician: { type: String, default: "Physician 1" },
    device_name: { type: String, default: "No Device" },
    device_sn: { type: String, default: "No Device" }
});


const Patient = db.model("Patient", patientSchema);

module.exports = Patient;