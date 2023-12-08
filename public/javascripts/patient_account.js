// public/javasciprts/account.js

let Data;

$(function() {


    $.ajax({
        url: '/patients/status',
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json'
    })
        .done(function(data, textStatus, jqXHR) {
            const patient = data[0];
            
            // $('#rxData').html(JSON.stringify(data, null, 2));
            $('#first_name').html(data[0].first_name);
            $('#last_name').html(data[0].last_name);
            $('#email').html(data[0].email);
            $('#physician').html(data[0].physician);
            $('#device').html(data[0].device);
            read_all_physicians();
            Data = data[0];
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            window.location.replace("../display.html");
        });
});

function read_all_physicians() {
    $.ajax({
        url: '/patients/read_all',
        method: 'GET',
        dataType: 'json'
    })
        .done(function(data, textStatus, jqXHR) {
            const res = data.reduce((a, b) => {
                for (let i in b) {
                    if (!a[i]) {
                        a[i] = [];
                    }
                    a[i].push(b[i]);
                }
                return a;
            }, {})

            for (let i = 0; i < res.first_name.length; i++) {
                var first_name = res.first_name[i];
                var last_name = res.last_name[i];
                var email = res.email[i];
                //var device = res.device[i]
                $("#select_physician").append(`<option value="${email}">${first_name} ${last_name}</option>`);
            }
            console.log(res);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            window.location.replace("display.html");
        });
}


function updatePatient() {
    $('#rxData').html("");
    $('#rxData').css({ 'border': 'none' });
    // Data validation
    const firstName = $("#upfirst_name").val();
    const lastName = $("#uplast_name").val();   
    const password = $("#uppassword").val();
    const passwordConfirm = $("#uppasswordConfirm").val();
    //const physician = $("#upphysician").val();
    const physician = $("select_physician").val();
    //const device = $("#updevice").val();
    const add_device = $("#add_device").val();
    const remove_device = $("#remove_device").val();
    //Validation Regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,20}$/;

    let validationErrors = [];
    displayErrors(validationErrors);


    //Check Password
    if (password != "" && passwordConfirm === "") {
        highlightField($("#uppassword"));
        validationErrors.push("Must confirm password change.");

    }
    else if (passwordConfirm != "" && password === "") {
        highlightField($("#uppasswordConfirm"));
        validationErrors.push("Must fill out both password fields.");

    }
    else {
        removeHighlight($("#uppasswordConfirm"));
        removeHighlight($("#uppassword"));
    }
    if (password != "" && passwordConfirm != "") {
        if (!passwordRegex.test(password)) {
            highlightField($("#uppassword"));
            validationErrors.push("Password must be 10-20 characters with at least one lowercase, one uppercase, and one number.");
        } else {
            removeHighlight($("#uppassword"));
        }
        if (passwordConfirm !== password) {
            highlightField($("#uppasswordConfirm"));
            validationErrors.push("Password confirmation does not match.");
        } else {
            removeHighlight($("#uppasswordConfirm"));
        }
    }
    
    if (validationErrors.length > 0) {
        displayErrors(validationErrors);
    } else {
        makeAPICall();
    }
}
function highlightField(field) {
    field.css("border", "2px solid red");
}

function removeHighlight(field) {
    field.css("border", "");
}

function displayErrors(errors) {
    if (errors.length != 0) {
        $('#formErrors').css({
            'border': '3px solid red',
            'padding': '10px',

        });
    }
    else {
        $('#formErrors').css({
            'border': 'none'
        });
    }
    $('#formErrors').html(errors.join("<br>"));
}
function makeAPICall() {
    let txdata = {};
    
    txdata._id = Data._id;
    // Check each field and include it in txdata if it's not empty
    if ($("#upfirst_name").val()) {
        txdata.first_name = $("#upfirst_name").val();
    }

    if ($("#uplast_name").val()) {
        txdata.last_name = $("#uplast_name").val();
    }

    if ($("#upemail").val()) {
        txdata.email = $("#upemail").val();
    }

    if ($("#uppassword").val()) {
        txdata.password = $("#uppassword").val();
    }
    if ($("#select_physician").val()) {
        txdata.physician = $("#select_physician").val();
        console.log(txdata.physician);
    }

    //if ($("#upphysician").val()) {
        //txdata.physician = $("#upphysician").val();
    //}

    if ($("#updevice").val()) {
        txdata.device = $("#updevice").val();
    }
    

    // Check if txdata is empty, if yes, do not make the API call
    if ($.isEmptyObject(txdata)) {
        console.log("No fields to update.");
        return;
    }
    console.log(txdata);
    $.ajax({
        url: '/patients/updateInfo',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
        .done(function(data, textStatus, jqXHR) {
            $('#rxData').css({
                'border': '3px solid green',
                'padding': '10px',
                'color': 'green'
            });
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("Request failed:");
            console.log("Status: " + textStatus);
            console.log("Error: " + errorThrown);
            // Access the responseJSON property and extract the msg property
            const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.msg : "Unknown error";

            // Display the error message in your UI or wherever you want
            $('#rxData').css({
                'border': '3px solid red',
                'padding': '10px',
                'color': 'red'
            });
            $('#rxData').html(errorMessage);
        });
}
$(function() {
    $('#btnUpdate').click(updatePatient);
});