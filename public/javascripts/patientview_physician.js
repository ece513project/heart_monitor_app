

let Data;

$(function() {
    $('#select_patient').change(get_chart);
    $('#loadDetailedView').click(function() {

        daily_report($('#select_patient').val());
    });

    $.ajax({
        url: '/physicians/status',
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json'
    })
        .done(function(data, textStatus, jqXHR) {
            read_all_patients();
            
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            window.location.replace("../display.html");
        });


});

function read_all_patients() {
    $.ajax({
        url: '/physicians/read_all',
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
                var name = res.first_name[i]
                var device = res.device[i]
                $("#select_patient").append(`<option value="${device}">${name}</option>`);
            }
            console.log(res);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            window.location.replace("display.html");
        });
}

function get_chart() {
    device = $('#select_patient').val();
    
    console.log(device);
    weekly_report(device);
    
}

function weekly_report(device) {
    let txdata = {
        device: device,
        published_at: new Date(),
    };
    $.ajax({
        url: '/api/weekly_patient_data',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
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
            }   , {});
            
            $('#meanHR').html(mean(res.HR));
            $('#maxHR').html(max(res.HR));
            $('#minHR').html(min(res.HR));
            plot_bar_chart(res);
        })
        .fail(function(data, textStatus, jqXHR) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        });

    function plot_bar_chart(res) {
        let HR = res.HR;
        let SPO2 = res.SPO2;
        console.log(res);
        //bar chart
        var chart = document.getElementById("barChart").getContext('2d');
        var myBarChart = new Chart(chart, {
            type: 'bar',
            data: {
                labels: ['HR-Mean', 'HR-Min', 'HR-Max', 'SPO2-Mean', 'SPO2-Max', 'SPO2-Min'],
                datasets: [{
                    label: 'Sensor Values',
                    data: [mean(HR), min(HR), max(HR), mean(SPO2), max(SPO2), min(SPO2)],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 205, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    };
};

function daily_report(device) {
    let txdata = {
        device: device,
        current_date: $('#selectedDate').val(),
    };
    $.ajax({
        url: '/api/daily_patient_data',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
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
            }, {});

            line_chart(res);
        })
        .fail(function(data, textStatus, jqXHR) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        });
    //line
    function line_chart(Data) {
        console.log(Data);
        var chart1 = document.getElementById("heartRateChart").getContext('2d');
        var chart2 = document.getElementById("SPO2Chart").getContext('2d');

        var HRChart = new Chart(chart1, {
            type: 'line',
            data: {
                labels: Data.published_at,
                datasets: [{
                    label: "HR",
                    data: Data.HR,
                    backgroundColor: [
                        'rgba(251, 1, 17, .2)',
                    ],
                    borderColor: [
                        'rgba(156, 1, 17, .7)',
                    ],
                    borderWidth: 2
                }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                scales: {
                    label: {
                        type: 'time',
                        time: {
                            unit: 'month'
                        }
                    }
                }
            }
        });
        var SPO2Chart = new Chart(chart2, {
            type: 'line',
            data: {
                labels: Data.published_at,
                datasets: [
                    {
                        label: "SPO2",
                        data: Data.SPO2,
                        backgroundColor: [
                            'rgba(8, 208, 69, .2)',
                        ],
                        borderColor: [
                            'rgba(8, 87, 69, .7)',
                        ],
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                scales: {
                    label: {
                        type: 'time',
                        time: {
                            unit: 'month'
                        }
                    }
                }
            }
        });
    }
}

function mean(data) {
    const filtered = data.filter(item => item !== 0);
    const sum = filtered.reduce((a, b) => a + b);
    const avg = sum / filtered.length;
    console.log(avg);
    return Math.round(avg);
}

function min(data) {
    const filtered = data.filter(item => item !== 0);
    Min = Math.min.apply(Math, filtered);
    console.log(Min);
    return Min;
}

function max(data) {
    const filtered = data.filter(item => item !== 0);
    Max = Math.max.apply(Math, filtered);
    console.log(Max);
    return Max;
}