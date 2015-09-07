'use strict';

angular.module('de.stekoe.nfp', [
    'de.stekoe.nfp.core'
])
    .controller('IndexController', function ($scope, $http, Cervix, SymptothermalMethodService) {

        var exampleCycle = [
            {"date": "2015-09-01", "time": "06:30", "temperature": 36.70, "menstruation": 2},
            {"date": "2015-09-02", "time": "06:00", "temperature": 36.65, "menstruation": 2},
            {"date": "2015-09-03", "time": "06:00", "temperature": 36.55, "menstruation": 4},
            {"date": "2015-09-04", "time": "06:00", "temperature": 36.60, "menstruation": 3},
            {"date": "2015-09-05", "time": "06:00", "temperature": 36.60, "menstruation": 1},
            {"date": "2015-09-06", "time": "06:00", "temperature": 36.50, "cervix": Cervix.f},
            {"date": "2015-09-07", "time": "06:00", "temperature": 36.55, "cervix": Cervix.f},
            {"date": "2015-09-08", "time": "06:00", "temperature": 36.55, "cervix": Cervix.s},
            {"date": "2015-09-09", "time": "06:00", "temperature": 36.60, "cervix": Cervix.s},
            {"date": "2015-09-10", "time": "06:00", "temperature": 36.45, "cervix": Cervix.S},
            {"date": "2015-09-11", "time": "06:00", "temperature": 36.50, "cervix": Cervix.S},
            {"date": "2015-09-12", "time": "08:15", "temperature": 36.50, "cervix": Cervix.s},
            {"date": "2015-09-13", "time": "06:00", "temperature": 36.40, "cervix": Cervix.o, "exclude": true},
            {"date": "2015-09-14", "time": "06:00", "temperature": 36.45, "cervix": Cervix.o},
            {"date": "2015-09-15", "time": "06:00", "temperature": 36.60, "cervix": Cervix.S},
            {"date": "2015-09-16", "time": "06:00", "temperature": 36.80, "cervix": Cervix.o},
            {"date": "2015-09-17", "time": "06:00", "temperature": 36.90},
            {"date": "2015-09-18", "time": "06:00", "temperature": 36.95},
            {"date": "2015-09-19", "time": "06:00", "temperature": 36.90},
            {"date": "2015-09-20", "time": "06:00", "temperature": 36.95},
            {"date": "2015-09-21", "time": "06:00", "temperature": 37.05},
            {"date": "2015-09-22", "time": "06:00", "temperature": 36.90},
            {"date": "2015-09-23", "time": "06:00", "temperature": 36.95},
            {"date": "2015-09-24", "time": "06:00", "temperature": 36.90},
            {"date": "2015-09-25", "time": "06:00", "temperature": 37.20},
            {"date": "2015-09-26", "time": "06:00", "temperature": 36.95},
            {"date": "2015-09-27", "time": "06:00", "temperature": 36.90},
            {"date": "2015-09-28", "time": "06:00", "temperature": 36.70}
        ];


        getCycle('cycle/cycle2.json');

        function getCycle(url) {
            $http.get(url)
                .then(function (resp) {
                    var data = exampleCycle;

                    var parseDate = d3.time.format("%Y-%m-%d").parse;
                    data.forEach(function (d) {
                        d.date = parseDate(d.date);
                        d.temperature = +d.temperature;
                    });
                    var dates = data.map(function getDate(data) {
                        return data.date;
                    }).sort(function (a, b) {
                        return new Date(a) - new Date(b);
                    });
                    data.push({date: d3.time.day.offset(dates[dates.length - 1], +1), temperature: 0});
                    $scope.data = {
                        measurements: data,
                        evaluated: SymptothermalMethodService.evaluate(data)
                    };
                })

        }
    });
