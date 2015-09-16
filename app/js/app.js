'use strict';

angular.module('de.stekoe.nfp', [
    'ngMaterial',
    'pascalprecht.translate',

    'de.stekoe.nfp.core'
])
    .config(function ($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'lang/',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('de');
    })
    .controller('IndexController', function ($scope, $http, Cervix, CervixTypes, MenstruationTypes, SymptothermalMethodService) {
        $scope.currentDay = {};

        $scope.cervixTypes = CervixTypes;
        $scope.mensisTypes = MenstruationTypes;

        $scope.showDateInfo = function (day) {
            console.log(day);
            $scope.currentDay = day;
        };

        getCycle('cycle/cycle2.json');
        function getCycle(url) {
            $http.get(url)
                .then(function (resp) {
                    var data = resp.data;
                    var dateFormatter = d3.time.format("%Y-%m-%d");
                    data.forEach(function (d) {
                        d.date = dateFormatter.parse(d.date);
                        d.temperature = +d.temperature;
                        if(dateFormatter(new Date()) === dateFormatter(d.date)) {
                            $scope.currentDay = d;
                        }
                    });
                    $scope.data = {
                        measurements: data,
                        evaluated: SymptothermalMethodService.evaluate(data)
                    };
                })

        }
    });
