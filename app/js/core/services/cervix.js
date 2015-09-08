'use strict';

angular.module('de.stekoe.nfp')
    .constant('Cervix', {
        t: 0,
        o: 1,
        f: 2,
        s: 3,
        S: 4
    })
    .service('CervixService', ['Cervix', function (Cervix) {
        return {
            getPeaks: getPeaks,
            getSymbol: getSymbol
        };

        /**
         * Calculates all cervix peaks of the given measurements.
         *
         * @param measurements Array containing objects having "cervix" property.
         * @returns {Array} Day of Cervix Peak
         */
        function getPeaks(measurements) {
            var highestValue = 0;
            return measurements
                .map(function (measurement, index) {
                    if (measurement.cervix >= highestValue && index + 3 < measurements.length) {
                        var hm1 = measurements[index + 1].cervix || 0;
                        var hm2 = measurements[index + 2].cervix || 0;
                        var hm3 = measurements[index + 3].cervix || 0;

                        if (hm1 < measurement.cervix && hm2 < measurement.cervix && hm3 < measurement.cervix) {
                            highestValue = measurement.cervix;
                            return index + 1;
                        }
                    }
                }).filter(function (v) {
                    return !!v;
                });
        }

        function getSymbol(quality) {
            return Object.keys(Cervix).filter(function (s) {
                return Cervix[s] === quality;
            })[0];
        }
    }]);