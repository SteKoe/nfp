'use strict';

angular.module('de.stekoe.nfp', [
    'ngMaterial',
    'de.stekoe.nfp.core'
])
    .controller('IndexController', function ($scope, $http, Cervix, SymptothermalMethodService) {
        getCycle('cycle/cycle2.json');

        $scope.myDate = new Date();

        function getCycle(url) {
            $http.get(url)
                .then(function (resp) {
                    var data = resp.data;
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
