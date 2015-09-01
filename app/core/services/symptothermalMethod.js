'use strict';

angular.module('de.stekoe.nfp')
    .service('SymptothermalMethodService', ['TemperatureService', 'CervixService', function (TemperatureService, CervixService) {
        return {
            getLastFertileDay: getLastFertileDay,
            isFertileDay: isFertileDay
        };

        function getLastFertileDay(measurements) {
            if(measurements.length <= 0) {
                return false;
            }

            var t = TemperatureService.evaluateMenstrualCycle(measurements);
            var c = CervixService.getPeaks(measurements);

            var tempLast3rdDay = t.day + 2;

            c = c.filter(function(t) {
                return t <= tempLast3rdDay;
            }).pop();

            if(c) {
                return c + 3;
            } else {
                return tempLast3rdDay;
            }

            return false;
        }

        function isFertileDay(measurements, day) {
            if(!is5DayRule(day)) {
                var evaluateCycle = getLastFertileDay(measurements);
                if(getLastFertileDay(measurements)) {
                    return (day - 1) < evaluateCycle;
                }
                return true;
            }

            return false;

            function is5DayRule(day) {
                return day >= 1 && day <= 5;
            }
        }
    }]);