'use strict';

angular.module('de.stekoe.nfp')
    .service('MenstruationService', [function () {
        return {
            getSymbol: getSymbol
        };

        function getSymbol(mens) {
            var result = "";
            if(mens && mens > 0) {
                switch (mens) {
                    case 1:
                        result =  "schmier";
                        break;
                    case 2:
                        result = "leicht";
                        break;
                    case 3:
                        result = "normal";
                        break;
                    case 4:
                        result = "stark";
                        break;
                    default:
                        result = "";
                }
            }

            return result;
        }
    }]);