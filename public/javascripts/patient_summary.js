

let Data;

$(function() {
    
    $.ajax({
        url: '/patients/status',
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json'
    })
        .done(function(data, textStatus, jqXHR) {
            // $('#rxData').html(JSON.stringify(data, null, 2));
            weekly_report(data[0]);
            $('#loadDetailedView').click(function() {

                daily_report(data[0]);
            });
           
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            window.location.replace("../display.html");
        });
});

function weekly_report(Data) {
    let txdata = {
        device: Data.device,
        current_date: new Date(),
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
            }, {});
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
        var bar = document.getElementById("barChart").getContext('2d');
        var summary= new Chart(bar, {
            type: 'bar',
            data: {
                labels: ['HR-Mean', 'HR-Min', 'HR-Max', 'SPO2-Mean', 'SPO2-Min', 'SPO2-Max'],
                datasets: [{
                    //label: ["Particle Readings"],
                    data: [mean(HR), min(HR), max(HR), mean(SPO2), min(SPO2), max(SPO2)],
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
                legend: { display: false },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                title: {
                    display: true,
                    text: "Summary of Particle Readings"
                }
            }
        });
    };
};

function daily_report(Data) {
    let txdata = {
        device: Data.device,
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
            console.log('Selected Date:', $('#selectedDate').val());

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


