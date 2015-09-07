'use strict';

describe('SymptoThermalMethod', function() {
    var SymptoThermalMethod,
        Cervix;

    beforeEach(module('de.stekoe.nfp'));
    beforeEach(inject(function(_SymptothermalMethodService_, _Cervix_) {
        SymptoThermalMethod = _SymptothermalMethodService_;
        Cervix = _Cervix_;
    }));

    it('example cycle 1.', function() {
        var measurements = [
            {temperature: 36.50},
            {temperature: 36.35},
            {temperature: 36.45, cervix: Cervix.t},
            {temperature: 36.45, cervix: Cervix.f},
            {temperature: 36.35, cervix: Cervix.s},
            {temperature: 36.40, cervix: Cervix.S},
            {temperature: 36.50, cervix: Cervix.S}, // 1st cervix peak, day 7
            {temperature: 36.45, cervix: Cervix.s},
            {temperature: 36.45, cervix: Cervix.o},
            {temperature: 36.65, cervix: Cervix.o}, // 1st HM, day 10
            {temperature: 36.65, cervix: Cervix.S}, // 2nd cervix peak, day 11
            {temperature: 36.70, cervix: Cervix.t},
            {temperature: 36.70, cervix: Cervix.o},
            {temperature: 36.65, cervix: Cervix.t}, // Cervix done, day 14
            {temperature: 36.75},
            {temperature: 36.70},
            {temperature: 36.65}
        ];

        var getLastFertileDay = SymptoThermalMethod.getLastFertileDay(measurements);
        expect(getLastFertileDay).toBe(14);
    });

    it('evaluates cycle having cervix peak after temperature evaluation.', function() {
        var measurements = [
            {temperature: 36.70, cervix: Cervix.t},
            {temperature: 36.65, cervix: Cervix.t},
            {temperature: 36.60, cervix: Cervix.t},
            {temperature: 36.55, cervix: Cervix.t},
            {temperature: 36.60, cervix: Cervix.f},
            {temperature: 36.65, cervix: Cervix.s},
            {temperature: 36.70, cervix: Cervix.s},
            {temperature: 36.65, cervix: Cervix.S},
            {temperature: 36.80, cervix: Cervix.S}, // 1st HM, day 9
            {temperature: 36.75, cervix: Cervix.S}, // cervix peak, day 10
            {temperature: 36.90, cervix: Cervix.s},
            {temperature:     0, cervix: Cervix.o},
            {temperature:     0, cervix: Cervix.o} // cervix done, day 13
        ];

        var getLastFertileDay = SymptoThermalMethod.getLastFertileDay(measurements);
        expect(getLastFertileDay).toBe(13);
    });

    it('evaluates cycle having finished cervix evaluation before temperature evaluation.', function() {
        var measurements = [
            {temperature: 36.70, cervix: Cervix.t},
            {temperature: 36.65, cervix: Cervix.f},
            {temperature: 36.60, cervix: Cervix.s},
            {temperature: 36.55, cervix: Cervix.s},
            {temperature: 36.60, cervix: Cervix.S},
            {temperature: 36.65, cervix: Cervix.S},
            {temperature: 36.70, cervix: Cervix.S},
            {temperature: 36.65, cervix: Cervix.S},
            {temperature: 36.80, cervix: Cervix.o},
            {temperature: 36.75, cervix: Cervix.o},
            {temperature: 36.90, cervix: Cervix.o}
        ];

        var getLastFertileDay = SymptoThermalMethod.getLastFertileDay(measurements);
        expect(getLastFertileDay).toBe(11);
    });

    it('evaluates cycle having cervix peak after finished evaluation.', function() {
        var measurements = [
            {temperature: 36.75, cervix: Cervix.f},
            {temperature: 36.65, cervix: Cervix.f},
            {temperature: 36.70, cervix: Cervix.s},
            {temperature: 36.80, cervix: Cervix.s},
            {temperature: 36.75, cervix: Cervix.S},
            {temperature: 36.75, cervix: Cervix.S},
            {temperature: 36.95, cervix: Cervix.s},
            {temperature: 36.95, cervix: Cervix.o},
            {temperature: 37.00, cervix: Cervix.o},
            {temperature: 37.00, cervix: Cervix.S}, // Cervix peak after finished evaluation
            {temperature: 36.95, cervix: Cervix.o},
            {temperature: 37.05},
            {temperature: 37.00},
            {temperature: 36.90}
        ];

        var getLastFertileDay = SymptoThermalMethod.getLastFertileDay(measurements);
        expect(getLastFertileDay).toBe(9);

        for(var day = 6; day <= 9; day++) {
            expect(SymptoThermalMethod.isFertileDay(measurements, day)).toBeTruthy();
        }
    });

    it('respects 5-Day-Rule.', function() {
        expect(SymptoThermalMethod.isFertileDay([], 1)).toBeFalsy();
        expect(SymptoThermalMethod.isFertileDay([], 2)).toBeFalsy();
        expect(SymptoThermalMethod.isFertileDay([], 3)).toBeFalsy();
        expect(SymptoThermalMethod.isFertileDay([], 4)).toBeFalsy();
        expect(SymptoThermalMethod.isFertileDay([], 5)).toBeFalsy();
        expect(SymptoThermalMethod.isFertileDay([], 6)).toBeTruthy();
    });
});
