const db = require("../db");

const patientSchema = new db.Schema({
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    device: { type: String, default: "No Device" },
    add_device: [{ type: String, default: "No Device" }],
    lastAccess: { type: Date, default: Date.now },
    physician: { type: String, default: "No Physician" },
    
});


const Patient = db.model("Patient", patientSchema);

module.exports = Patient;