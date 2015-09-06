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
         * @param measurements Array containing objects having "cervix" property.
         * @returns {number} Day of Cervix Peak
         */
        function getPeaks(measurements) {
            var highestValue = 0;
            var cervixPeaks = [];

            measurements.forEach(function (measurement, index) {
                if (measurement.cervix >= highestValue && index + 3 < measurements.length) {
                    var hm1 = measurements[index + 1].cervix || 0;
                    var hm2 = measurements[index + 2].cervix || 0;
                    var hm3 = measurements[index + 3].cervix || 0;

                    if (hm1 < measurement.cervix && hm2 < measurement.cervix && hm3 < measurement.cervix) {
                        highestValue = measurement.cervix;
                        cervixPeaks.push(index + 1);
                    }
                }
            });

            return cervixPeaks;
        }

        function getSymbol(quality) {
            var a = Object.keys(Cervix).filter(function (s) {
                return Cervix[s] === quality;
            })[0];
            return a;
        }
    }]);