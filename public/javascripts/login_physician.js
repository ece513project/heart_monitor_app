function login() {

    let txdata = {
        email: $('#email').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: '/physicians/logIn',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
        .done(function(data, textStatus, jqXHR) {
            localStorage.setItem("token", data.token);
            window.location.replace("physician_account_info.html");
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
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
    $('#submit').click(login);
});