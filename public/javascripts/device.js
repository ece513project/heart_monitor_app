// public/javascripts/device.js

let Data;

$(function () {
    $('#btnUpdate').click(Update_device);

    $.ajax({
        url: '/patient/status',
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json'
    })
        .done(function (data, textStatus, jqXHR) {
            $('#device').val(data[0].device;           
            Data = data[0];
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            window.location.replace("../display.html");
        });
});

function Update_device() {
    
    if ($('#device').val() === "") {
        window.alert("invalid device ID!");
        return;
    }
    if ($('#device').val() === "No Device") {
        window.alert("invalid device ID!");
        return;
    }
    
    let txdata = {
        _id: Data._id,
        device: $('#device').val(),
    };

    $.ajax({
        url: '/patient/update_device',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
        .done(function (data, textStatus, jqXHR) {
            $('#rxData').html(data.message);
        })
        .fail(function (data, textStatus, jqXHR) {
            $('#rxData').html(Jdata.message);
        });
}