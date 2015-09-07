'use strict';

angular.module('de.stekoe.nfp')
    .service('SymptothermalMethodService', ['TemperatureService', 'CervixService', function (TemperatureService, CervixService) {
        return {
            evaluate: evaluate,
            getLastFertileDay: getLastFertileDay,
            isFertileDay: isFertileDay
        };

        function evaluate(measurements) {
            return {
                last: getLastFertileDay(measurements),
                hm: TemperatureService.evaluateMenstrualCycle(measurements)
            }
        }

        function getLastFertileDay(measurements) {
            if(measurements.length <= 0) {
                return false;
            }

            var t = TemperatureService.evaluateMenstrualCycle(measurements);
            var c = CervixService.getPeaks(measurements);

            if(c && c.length > 0) {
                c = c.filter(function(cervixDay) {
                    return cervixDay >= t.day && cervixDay <= t.day + 2;
                }).pop();

                if(c) {
                    return c + 3;
                } else {
                    return t.day + 2;
                }
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