'use strict';

angular.module('de.stekoe.nfp')
    .service('TemperatureService', [function () {
        return {
            get1stHM: get1stHM,
            round: round,
            evaluateMenstrualCycle: evaluateMenstrualCycle
        };

        /**
         * Finds the first higher measurement.
         *
         * A higher measurement is found when a value is higher than its six preceding values.
         *
         * @param measurements
         * @returns {Object} Day number of first higher measurement.
         */
        function get1stHM(measurements) {
            var hmCandidate = 0,
                coverTemp = 0,
                previousDays = [],
                hm = 0;

            measurements
                .map(function (measure, idx, arr) {
                    measure.temperature = round(measure.temperature);
                    var prev = [];
                    if(!measure.exclude) {
                        for (var i = 1; arr[idx - i] && prev.length < 6; i++) {
                            if(!arr[idx - i].exclude) {
                                prev.push(arr[idx - i]);
                            }
                        }
                        if (prev.length === 6) {
                            var hms = prev.filter(function (p) {
                                return p.temperature >= measure.temperature;
                            });
                            if(hmCandidate === 0 && hms.length === 0) {
                                coverTemp = Math.max.apply(null, prev.map(function(d) { return d.temperature; }));
                                previousDays = prev;
                                hm = measure.temperature;
                                hmCandidate = idx;
                            }
                        }
                    }
                });

            return {
                day: (hmCandidate > 0) ? hmCandidate + 1 : 0,
                hm: hm,
                previousDays: previousDays,
                coverTemp: coverTemp
            };
        }

        /**
         * Evaluates the temperature values of the menstrual cycle.
         *
         * @param measurements
         * @returns {*} Object containing information about the evaluated cycle, or false when the temperature couldn't be evaluated.
         */
        function evaluateMenstrualCycle(measurements) {
            var hm = get1stHM(measurements);

            if (hm.day != 0) {
                // Check one after the other because combination is not allowed
                if (evaluateUsingDefaultRule(hm, measurements)) {
                    hm.rule = {name:'default'};
                    return hm;
                } else if (evaluateUsingFirstExceptionalRule(hm, measurements)) {
                    hm.rule = {name:'1st Exceptional Rule'};
                    return hm;
                } else if (evaluateUsingSecondExceptionalRule(hm, measurements)) {
                    hm.rule = {name:'2nd Exceptional Rule'};
                    return hm;
                }
            }

            return false;

            /**
             * Checks whether temperature can be evaluated using default rule.
             *
             * Default rule: The next two succeeding temperature values are higher than the cover temperature.
             * The last value has to be at least 0.2°C higher than the cover temperature.
             *
             * @param hm Day of the first higher measurement
             * @param coverTemp The current cover temperature
             * @param measurements Array of all measurements
             * @returns {boolean} true if temperature has been evaluated using default rule, false otherwise.
             */
            function evaluateUsingDefaultRule(hm, measurements) {
                var hms = [];
                for (var i = hm.day; i <= measurements.length && hms.length < 2; i++) {
                    if (measurements[i] && !measurements[i].exclude) {
                        hms.push(measurements[i].temperature);
                    }
                }
                return (hms.length === 2 && hms[0] > hm.coverTemp && round(hms[1] - 0.2) >= hm.coverTemp);
            }

            /**
             * Checks whether temperature can be evaluated using first exceptional rule.
             *
             * Exceptional Rule 1: Starting from the higher measurement, all succeeding three values have to be higher
             * than the cover temp.
             *
             * <img src="doc/nfp/temperature_exception_1.png">
             *
             * @param hm Day of the first higher measurement
             * @param measurements Array of all measurements
             * @returns {boolean} true if rule can be applied and temperature has been evaluated, false otherwise.
             */
            function evaluateUsingFirstExceptionalRule(hm, measurements) {
                if (hm.day + 2 <= measurements.length) {
                    var hm2 = measurements[hm.day].temperature;
                    var hm3 = measurements[hm.day + 1].temperature;
                    var hm4 = measurements[hm.day + 2].temperature;

                    if (hm2 > hm.coverTemp && hm3 > hm.coverTemp && hm4 > hm.coverTemp) {
                        return true;
                    }
                }

                return false;
            }

            /**
             * Checks whether temperature can be evaluated using second exceptional rule.
             *
             * Exceptional Rule 2: Starting from the higher measurement, if one value is below the cover temp, a fourth
             * value has to be 0.2°C higher than the cover temp.
             *
             * <img src="doc/nfp/temperature_exception_2.png">
             *
             * @param hm Day of the first higher measurement
             * @param measurements Array of all measurements
             * @returns {boolean} true if rule can be applied and temperature has been evaluated, false otherwise.
             */
            function evaluateUsingSecondExceptionalRule(hm, measurements) {
                if (hm.day + 2 <= measurements.length) {
                    var hm2 = measurements[hm.day].temperature;
                    var hm3 = measurements[hm.day + 1].temperature;
                    var hm4 = measurements[hm.day + 2].temperature;

                    if (hm2 <= hm.coverTemp && hm3 > hm.coverTemp && Math.round((hm4 - 0.2) * 100) / 100 >= hm.coverTemp) {
                        return true;
                    }
                }

                return false;
            }
        }

        /**
         * Round function according to NFP rules how to round temperature values.
         *
         * @param temperature
         * @returns {*}
         */
        function round(temperature) {
            var temp = Math.round(temperature * 100);
            var lastDigit = temp % 10;

            var result;
            if (lastDigit >= 0 && lastDigit <= 2) {
                result = (temp - lastDigit) / 100;
            }
            else if (lastDigit >= 3 && lastDigit <= 7) {
                result = (temp + 5 - lastDigit) / 100;
            }
            else if (lastDigit >= 8) {
                result = (temp + 10 - lastDigit) / 100;
            }
            return result;
        }
    }]);