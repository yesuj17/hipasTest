angular
    .module('wemsAnalysisApp', ['chart.js'])
    .controller('WemsAnalysisController', ['$scope', '$http', '$window', WemsAnalysisController]);

function WemsAnalysisController($scope, $http, $window) {
    var vm = this;

    $window.onload = initializeAnalysisData;

    ////////////////////////////////////////////////////// 
    // Initialize Analysis Data
    function initializeAnalysisData() {
        var currentDate = new Date();
        var startDate = currentDate;
        var endDate = currentDate;
        var period = {
            startDate: startDate,
            endDate: endDate
        }

        var analysisData = getAnalysisData(period);
        initializePowerData(analysisData);
        initializeCumulativeCycleTimeData(analysisData);
        initializePowerEfficiency(analysisData);
    }

    // Initialize Power Data
    function initializePowerData(analysisData) {
        refreshPowerData(analysisData);
    }

    // Initialize Cumulative Cycle Time Data
    function initializeCumulativeCycleTimeData() {
    }

    // Initialize Power Efficiency
    function initializePowerEfficiency() {
    }

    // Refresh Analysis Data
    function refreshAnalysisData(period) {
        var analysisData = getAnalysisData(period);

        refreshPowerData(analysisData);
        refreshCumulativeCycleTimeData(analysisData);
        refreshPowerEfficiency(analysisData);
    }

    // Refresh Power Data
    function refreshPowerData(analysisData) {
        var ctx = document
            .getElementById('wemsPowerContent')
            .getContext('2d');

        var labels = getDateLabel();
        var datasets = getPowerDataSet();
        var powerData = {
            labels: labels,
            datasets: datasets
        };

        var options = {
            title: {
                display: true,
                text: '사용 전력량',
                position: 'top',
                fontSize: 14
            },
            animation: {
                duration: 10,
            },
            tooltips: {
                mode: 'label',
                callbacks: {
                    label: function (tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].label + ": " + getNumberWithCommas(tooltipItem.yLabel);
                    }
                }
            },
            scales: {
                xAxes: [{
                    stacked: true,
                    gridLines: { display: false },
                    scaleLabel: {
                        display: true,
                        labelString: '( hr )'
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        callback: function (value) { return getNumberWithCommas(value); },
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '( kW )'
                    }
                }],
            },
            legend: { display: true }
        };

        var config = {
            type: 'bar',
            data: powerData,
            options: options
        };

        new Chart(ctx, config);
    }

    // Refresh Cumulative Cycle Time Data
    function refreshCumulativeCycleTimeData(analysisData) {
    }

    // Refresh Power Efficiency
    function refreshPowerEfficiency(analysisData) {
    }

    // Get Analysis Data
    function getAnalysisData(period) {
        var config = {
            params: period,
            headers: { 'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==' }
        }

        return $http.get('/wems/analysisData/', config)
            .then(getAnalysisDataComplete)
            .catch(getAnalysisDataFailed);

        function getAnalysisDataComplete(data, status, headers, config) {
            return data.data;
        }

        function getAnalysisDataFailed(e) {  
            var newMessage = 'XHR Failed for getPowerData'
            if (e.data && e.data.description) {
                newMessage = newMessage + '\n' + e.data.description;
            }
            e.data.description = newMessage;
            logger.error(newMessage);
            return $q.reject(e);
        }
    }

    function getNumberWithCommas(item) {
        return item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Get Date Label
    function getDateLabel() {
        return ["1", "2", "3", "4", "5", "6",
            "7", "8", "9", "10", "11", "12",
            "13", "14", "15", "16", "17", "18",
            "19", "20", "21", "22", "23", "24"];
    }

    // Get Power Data Set
    function getPowerDataSet() {
        var device1 = [21000, 22000, 26000, 35000, 55000, 55000, 56000, 59000, 60000, 61000, 60100, 62000,
            1000, 1200, 1300, 1400, 1060, 2030, 2070, 4000, 4100, 4020, 4030, 4050];
        var device2 = [1000, 1200, 1300, 1400, 1060, 2030, 2070, 4000, 4100, 4020, 4030, 4050,
            21000, 22000, 26000, 35000, 55000, 55000, 56000, 59000, 60000, 61000, 60100, 62000];
        var device3 = [21000, 22000, 26000, 35000, 55000, 55000, 56000, 59000, 60000, 61000, 60100, 62000,
            1000, 1200, 1300, 1400, 1060, 2030, 2070, 4000, 4100, 4020, 4030, 4050];
        var device4 = [1000, 1200, 1300, 1400, 1060, 2030, 2070, 4000, 4100, 4020, 4030, 4050,
            21000, 22000, 26000, 35000, 55000, 55000, 56000, 59000, 60000, 61000, 60100, 62000];
        var lastYear = [22000, 23200, 27300, 36400, 56060, 57030, 58070, 63000, 64100, 65020, 64130, 66050,
            21000, 22000, 26000, 35000, 55000, 55000, 56000, 59000, 60000, 61000, 60100, 62000];

        return [
            {
                label: '1호기',
                data: device1,
                backgroundColor: "rgba(55, 160, 225, 0.7)",
                hoverBackgroundColor: "rgba(55, 160, 225, 0.7)",
                hoverBorderWidth: 2,
                hoverBorderColor: 'lightgrey'
            },
            {
                label: '2호기',
                data: device2,
                backgroundColor: "rgba(225, 58, 55, 0.7)",
                hoverBackgroundColor: "rgba(225, 58, 55, 0.7)",
                hoverBorderWidth: 2,
                hoverBorderColor: 'lightgrey'
            },
            {
                label: '3호기',
                data: device3,
                backgroundColor: "rgba(55, 0, 225, 0.7)",
                hoverBackgroundColor: "rgba(55, 0, 225, 0.7)",
                hoverBorderWidth: 2,
                hoverBorderColor: 'lightgrey'
            },
            {
                label: '4호기',
                data: device4,
                backgroundColor: "rgba(225, 0, 55, 0.7)",
                hoverBackgroundColor: "rgba(225, 0, 55, 0.7)",
                hoverBorderWidth: 2,
                hoverBorderColor: 'lightgrey'
            },
            {
                label: '작년',
                type: 'line',  // override the default type
                fill: false,
                backgroundColor: "black",
                borderColor: "black",
                data: lastYear,
                options: {
                    elements: {
                        line: {
                            tension: 0, // disables bezier curves
                        }
                    }
                }
            }
        ];
    }
}   


    