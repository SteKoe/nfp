'use strict';

angular.module('de.stekoe.nfp')
    .service('SymptothermalMethodService', ['TemperatureService', 'CervixService', function (TemperatureService, CervixService) {
        return {
            evaluate: evaluate,
            getLastFertileDay: getLastFertileDay,
            isFertileDay: isFertileDay
        };

        function evaluate(measurements) {
            var exclusions = measurements.filter(function(d) {
                return d.exclude;
            });

            return {
                last: getLastFertileDay(measurements),
                hm: TemperatureService.evaluateMenstrualCycle(measurements),
                exclusions: exclusions
            }
        }

        function getLastFertileDay(measurements) {
            if(measurements.length <= 0) {
                return false;
            }

            var lastFertileDay = 0;
            var t = TemperatureService.evaluateMenstrualCycle(measurements);
            var c = CervixService.getPeaks(measurements);

            if(c && c.length > 0) {
                var filtered = c.filter(function(cervixDay) {
                    return cervixDay >= t.day && cervixDay <= t.day + 2;
                }).pop();
                if(filtered) {
                    lastFertileDay = filtered + 3;
                    measurements[filtered].cervixPeak = true;
                    measurements[filtered + 3].lastFertile = true;
                } else {
                    lastFertileDay = t.day + 2;
                    var t2 = c.filter(function (cervixDay) {
                        return cervixDay <= t.day;
                    }).pop();
                    measurements[t2 - 1].cervixPeak = true;
                    measurements[t.day].lastFertile = true;
                }

                return lastFertileDay;
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