var myApp = angular.module('myApp', ['chart.js']);
var canvas = document.getElementById('myChart'),
    ctx = canvas.getContext('2d'),
    startingData = {
        labels: [0, 1],
        datasets: [
            {
                label: "DataSet 1",
                backgroundColor: "rgba(220, 220, 220, 0.5)",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                data: [0, 1]
            }
        ]
    };

var config = {
    type: 'line',
    data: startingData,
};

var myLiveChart = new Chart(ctx, config);
var socket = io();

myApp.controller('myController', function ($scope, $http, $interval) {
    $scope.appName = 'Chart JS';
    $scope.timerRunning = false;

    $scope.chartList = [
        { name: 'lineChart', diplayName: 'Line Chart', chartClass: 'chart chart-line' },
        { name: 'pieChart', diplayName: 'Pie Chart', chartClass: 'chart chart-line' },
        { name: 'stackedBarChart', diplayName: 'Stacked Bar Chart', chartClass: 'chart chart-line' }
        /// { name: 'gaugeChart', diplayName: 'Gauge Chart', chartClass: 'chart chart-line' }
    ];

    $scope.labels = [0];
    $scope.data = [[0], [0]];

    /// Start Draw Chart
    $scope.startDrawChart = function () {
        socket.emit("updateChartData");
        $scope.timerRunning = true;
    }

    /// Stop Draw Chart
    $scope.stopDrawChart = function () {
        socket.emit("stopChartDataUpdate");
        $scope.timerRunning = false;
    }

    /// Generate Chart Data.
    $scope.GenerateChartData = function () {
        if ($scope.timerRunning == false) {
            $interval.cancel(interval);
        };

        realTimeData = {
            "label": index,
            "point": Math.sin(index)
        };

        /// Real Time Data Post
        $http.post('/api/realChart', realTimeData)
            .then(function (response) {
                /// Refresh Real Time Chart
                config.data.datasets[0].data.push(response.data.point);
                config.data.labels.push(response.data.label);

                myLiveChart.update();
            })
            .catch(function (response) {
                console.log("Fail");
            });

        index++;
    }

    $scope.update = function () {
        /// Select Chart and Change Chart Data
        $scope.stopDrawChart();
        if (myLiveChart) {
            myLiveChart.destroy();
        }

        switch ($scope.selectedChart.name) {
            case "lineChart":
                config.type = 'line';
                break;

            case "pieChart":
                config.type = 'pie';
                break;

            case "stackedBarChart":
                config.type = 'bar';
                config.options.scales.xAxes[0].stacked = true;
                config.options.scales.yAxes[0].stacked = true;
                break;
            case "gaugeChart":
                config.type = 'doughnut';
                config.data = {
                    labels: ["Red", "Blue"],
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                        ],
                        borderWidth: 1
                    }]
                };

                config.options = {
                    rotation: 1 * Math.PI,
                    circumference: 1 * Math.PI
                };

                Chart.pluginService.register({
                    beforeDraw: function (chart) {
                        var width = chart.chart.width,
                            height = chart.chart.height,
                            ctx = chart.chart.ctx;

                        ctx.restore();
                        var fontSize = (height / 114).toFixed(2);
                        ctx.font = fontSize + "em sans-serif";
                        ctx.textBaseline = "bottom";

                        var text = "75%",
                            textX = Math.round((width - ctx.measureText(text).width) / 2),
                            textY = height;

                        ctx.fillText(text, textX, textY);
                        ctx.save();
                    }
                });
                break;
        }

        myLiveChart = new Chart(ctx, config);
    }

    /// Update Chart Data From Server.
    socket.on('updateChartData', function (data) {
        config.data.datasets[0].data.push(data.point);
        config.data.labels.push(data.label);

        myLiveChart.update();
    });
});