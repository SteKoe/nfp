'use strict';

angular.module('de.stekoe.nfp')
    .service('TemperatureService', [function () {
        return {
            get1stHM: get1stHM,
            getCoverTemperature: getCoverTemperature,
            round: round,
            evaluateMenstrualCycle: evaluateMenstrualCycle
        };

        /**
         * Finds the first higher measurement.
         *
         * A higher measurement is found when a value is higher than its six preceding values.
         *
         * @param measurements
         * @returns {number} Day number of first higher measurement.
         */
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

        /**
         * Evaluates the temperature values of the menstrual cycle.
         *
         * @param measurements
         * @returns {*} Object containing information about the evaluated cycle, or false when the temperature couldn't be evaluated.
         */
        function evaluateMenstrualCycle(measurements) {
            var hm = get1stHM(measurements) - 1;
            var coverTemp = getCoverTemperature(measurements);

            if(hm != -1) {
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
            function evaluateUsingDefaultRule(hm, coverTemp, measurements) {
                if (hm + 2 < measurements.length) {
                    var hm2 = measurements[hm + 1].temperature;
                    var hm3 = measurements[hm + 2].temperature;
                    if (hm2 > coverTemp && round(hm3 - 0.2) >= coverTemp) {
                        return true;
                    }
                }

                return false;
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
             * @param coverTemp The current cover temperature
             * @param measurements Array of all measurements
             * @returns {boolean} true if rule can be applied and temperature has been evaluated, false otherwise.
             */
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

            /**
             * Checks whether temperature can be evaluated using second exceptional rule.
             *
             * Exceptional Rule 2: Starting from the higher measurement, if one value is below the cover temp, a fourth
             * value has to be 0.2°C higher than the cover temp.
             *
             * <img src="doc/nfp/temperature_exception_2.png">
             *
             * @param hm Day of the first higher measurement
             * @param coverTemp The current cover temperature
             * @param measurements Array of all measurements
             * @returns {boolean} true if rule can be applied and temperature has been evaluated, false otherwise.
             */
            function evaluateUsingSecondExeptionalRule(hm, coverTemp, measurements) {
                if (hm + 3 <= measurements.length) {
                    var hm2 = measurements[hm + 1].temperature;
                    var hm3 = measurements[hm + 2].temperature;
                    var hm4 = measurements[hm + 3].temperature;

                    if (hm2 <= coverTemp && hm3 > coverTemp && Math.round((hm4 - 0.2) * 100) / 100 >= coverTemp) {
                        return true;
                    }
                }

                return false;
            }
        }

        /**
         * Get the cover temperature.
         *
         * The cover temperature is the highest value of the last six values, which are lower than the current value.
         *
         * @param measurements
         * @returns {number|undefined}
         */
        function getCoverTemperature(measurements) {
            var hm = get1stHM(measurements) - 1;

            var t = measurements
                .slice(hm - 6, hm)
                .map(function (measurement) {
                    return measurement.temperature;
                });

            return Math.max.apply(null, t) || undefined;
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