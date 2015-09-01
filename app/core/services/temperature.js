'use strict';

angular.module('de.stekoe.nfp')
    .service('TemperatureService', [function () {
        return {
            get1stHM: get1stHM,
            getCoverTemperature: getCoverTemperature,
            round: round,
            evaluateMenstrualCycle: evaluateMenstrualCycle
        };

        function get1stHM(measurements) {
            var hmCandidate = 0;
            var startIndex;

            measurements.
                map(function (measure) {
                    measure.temperature = round(measure.temperature);
                    return measure;
                })
                .forEach(function (measure, index) {
                    var endIndex = hmCandidate || index;
                    startIndex = (hmCandidate || index) - 6;
                    var valuesToCheck = measurements.slice(startIndex, endIndex)
                        .filter(function (value) {
                            return value.temperature < measure.temperature;
                        });

                    if (valuesToCheck.length === 6 && !hmCandidate) {
                        hmCandidate = index;
                    }
                });

            return (hmCandidate > 0) ? hmCandidate + 1 : 0;
        }

        function evaluateMenstrualCycle(measurements) {
            var hm = get1stHM(measurements) - 1;
            var coverTemp = getCoverTemperature(measurements);

            // Check one after the other because combination is not allowed
            if (evaluateUsingDefaultRule(hm, coverTemp, measurements)) {
                return {
                    hm: measurements[hm],
                    day: hm + 1,
                    coverTemp: coverTemp,
                    rule: {
                        name: 'default'
                    }
                };
            } else if (evaluateUsingFirstExeptionalRule(hm, coverTemp, measurements)) {
                return {
                    hm: measurements[hm],
                    day: hm + 1,
                    coverTemp: coverTemp,
                    rule: {
                        name: '1st Exceptional Rule'
                    }
                };
            } else if (evaluateUsingSecondExeptionalRule(hm, coverTemp, measurements)) {
                return {
                    hm: measurements[hm],
                    day: hm + 1,
                    coverTemp: coverTemp,
                    rule: {
                        name: '2nd Exceptional Rule'
                    }
                };
            }

            return false;

            function evaluateUsingDefaultRule(hm, coverTemp, measurements) {
                if (hm + 2 <= measurements.length) {
                    var hm2 = measurements[hm + 1].temperature;
                    var hm3 = measurements[hm + 2].temperature;
                    if (hm2 > coverTemp && round(hm3 - 0.2) >= coverTemp) {
                        return true;
                    }
                }

                return false;
            }

            function evaluateUsingFirstExeptionalRule(hm, coverTemp, measurements) {
                if (hm + 3 <= measurements.length) {
                    var hm2 = measurements[hm + 1].temperature;
                    var hm3 = measurements[hm + 2].temperature;
                    var hm4 = measurements[hm + 3].temperature;

                    if (hm2 > coverTemp && hm3 > coverTemp && hm4 > coverTemp) {
                        return true;
                    }
                }

                return false;
            }

            function evaluateUsingSecondExeptionalRule(hm, coverTemp, measurements) {
                if (hm + 3 <= measurements.length) {
                    var hm2 = measurements[hm + 1].temperature;
                    var hm3 = measurements[hm + 2].temperature;
                    var hm4 = measurements[hm + 3].temperature;

                    if (hm2 <= coverTemp && hm3 > coverTemp && Math.round((hm4-0.2) * 100) / 100 >= coverTemp) {
                        return true;
                    }
                }

                return false;
            }
        }

        function getCoverTemperature(measurements) {
            var hm = get1stHM(measurements) - 1;

            var t = measurements
                .slice(hm - 6, hm)
                .map(function (measurement) {
                    return measurement.temperature;
                });

            return Math.max.apply(null, t) || undefined;
        }

        function round(temperature) {
            var temp = Math.round(temperature * 100);
            var lastDigit = temp % 10;

            var result;
            // 0 ... 2
            if (lastDigit >= 0 && lastDigit <= 2) {
                result = (temp - lastDigit) / 100;
            }
            // 3 ... 7
            else if (lastDigit >= 3 && lastDigit <= 7) {
                result = (temp + 5 - lastDigit) / 100;
            }
            // 8 ...
            else if (lastDigit >= 8) {
                result = (temp + 10 - lastDigit) / 100;
            }
            return result;
        }

    }]);