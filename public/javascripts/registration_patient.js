function createPatient() {
    // Data validation
    const firstName = $("#first_name").val();
    const lastName = $("#last_name").val();
    const email = $("#email").val();
    const password = $("#password").val();
    const passwordConfirm = $("#passwordConfirm").val();
    const device = $("#device").val();

    //Validation Regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,20}$/;

    let validationErrors = [];
    displayErrors(validationErrors);

    //Check for First and Last Name
    if (firstName === "") {
        highlightField($("#first_name"));
        validationErrors.push("First name is required.");
    } else {
        removeHighlight($("#first_name"));
    }

    if (lastName === "") {
        highlightField($("#last_name"));
        validationErrors.push("Last name is required.");
    } else {
        removeHighlight($("#last_name"));
    }

    // Check email format
    if (email === "" || !emailRegex.test(email)) {
        highlightField($("#email"));
        validationErrors.push("Valid email is required.");
    } else {
        removeHighlight($("#email"));
    }

    //Check Password
    if (password === "") {
        highlightField($("#password"));
        validationErrors.push("Password is required.");
    } else if (!passwordRegex.test(password)) {
        highlightField($("#password"));
        validationErrors.push("Password must be 10-20 characters with at least one lowercase, one uppercase, and one number.");
    } else {
        removeHighlight($("#password"));
    }
    if (passwordConfirm === "" || passwordConfirm !== password) {
        highlightField($("#passwordConfirm"));
        validationErrors.push("Password confirmation does not match.");
    } else {
        removeHighlight($("#passwordConfirm"));
    }

    //Check Device
    if (device === "") {
        highlightField($("#device"));
        validationErrors.push("Device ID is required.");
    } else {
        removeHighlight($("#device"));
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
    let txdata = {
        first_name: $("#first_name").val(),
        last_name: $("#last_name").val(),
        email: $("#email").val(),
        password: $("#password").val(),
        device: $("#device").val()
    };

    $.ajax({
        url: '/patients/create',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
        .done(function (data, textStatus, jqXHR) {
            $('#rxData').css({
                'border': '3px solid green',
                'padding': '10px',
                'color': 'green'
            });
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
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
function readAll() {
    console.log("ReadAll");
    $.ajax({
        url: '/patients/readAll',
        method: 'GET'
    })
        .done(function(data, textStatus, jqXHR) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("FAIL");

            $('#rxData').html(JSON.stringify(jqXHR, null, 2));
        });
}

   
$(function () {
    $('#btnCreate').click(createPatient);
  
});
