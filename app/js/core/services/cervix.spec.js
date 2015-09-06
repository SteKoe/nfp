'use strict';

describe('CervixService', function () {
    var cervixService,
        Cervix;

    beforeEach(module('de.stekoe.nfp'));
    beforeEach(inject(function (_CervixService_, _Cervix_) {
        cervixService = _CervixService_;
        Cervix = _Cervix_;
    }));

    it('calculates peak for easy cycle.', function () {
        var fixture = [
            {cervix: Cervix.t},
            {cervix: Cervix.f},
            {cervix: Cervix.s},
            {cervix: Cervix.s},
            {cervix: Cervix.S},
            {cervix: Cervix.S},
            {cervix: Cervix.S}, // PEAK, day 7
            {cervix: Cervix.s},
            {cervix: Cervix.o},
            {cervix: Cervix.o},
            {cervix: Cervix.o},
            {cervix: Cervix.t},
            {cervix: Cervix.t}
        ];

        expect(cervixService.getPeaks(fixture)).toEqual([7]);
    });

    it('calculates peak for more complex cycle.', function () {
        var fixture = [
            {cervix: Cervix.o},
            {cervix: Cervix.f},
            {cervix: Cervix.s},
            {cervix: Cervix.S},
            {cervix: Cervix.S},
            {cervix: Cervix.s},
            {cervix: Cervix.s},
            {cervix: Cervix.S}, // peak, day 8
            {cervix: Cervix.o},
            {cervix: Cervix.t},
            {cervix: Cervix.t}
        ];

        expect(cervixService.getPeaks(fixture)).toEqual([8]);
    });

    it('finishes calulation after 3 days.', function () {
        var fixture = [
            {cervix: Cervix.t},
            {cervix: Cervix.f},
            {cervix: Cervix.s},
            {cervix: Cervix.s},
            {cervix: Cervix.S},
            {cervix: Cervix.S},
            {cervix: Cervix.S}, // PEAK, day 7
            {cervix: Cervix.s}, // 1
            {cervix: Cervix.o}, // 2
            {cervix: Cervix.o}, // 3
            {cervix: Cervix.S},
            {cervix: Cervix.t},
            {cervix: Cervix.t}
        ];

        expect(cervixService.getPeaks(fixture)).toEqual([7]);
    });

    it('finishes calulation after 3 days.', function () {
        var fixture = [
            {cervix: Cervix.t},
            {cervix: Cervix.f},
            {cervix: Cervix.s},
            {cervix: Cervix.S},
            {cervix: Cervix.S}, // Peak, day 5
            {cervix: Cervix.s},
            {cervix: Cervix.o},
            {cervix: Cervix.o},
            {cervix: Cervix.S}, // 2nd Peak, day 9
            {cervix: Cervix.t},
            {cervix: Cervix.o},
            {cervix: Cervix.t}
        ];

        expect(cervixService.getPeaks(fixture)).toEqual([5,9]);
    });
});
