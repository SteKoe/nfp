'use strict';

describe('TemperatureService', function () {
    var evaluableMenstrualCycle = [
        {temperature: 36.70},
        {temperature: 36.65},
        {temperature: 36.55},
        {temperature: 36.60},
        {temperature: 36.60},
        {temperature: 36.50},
        {temperature: 36.55},
        {temperature: 36.55},
        {temperature: 36.60},
        {temperature: 36.45},
        {temperature: 36.50},
        {temperature: 36.50},
        {temperature: 36.40},
        {temperature: 36.45},
        {temperature: 36.60}, // Cover Temperature
        {temperature: 36.80}, // 1st HM, day 16
        {temperature: 36.90},
        {temperature: 36.95},
        {temperature: 36.90},
        {temperature: 36.95},
        {temperature: 36.85},
        {temperature: 36.90},
        {temperature: 36.95},
        {temperature: 36.90},
        {temperature: 36.95},
        {temperature: 36.95},
        {temperature: 36.90},
        {temperature: 36.70}
    ];

    var temperatureService;

    beforeEach(module('de.stekoe.nfp'));
    beforeEach(inject(function (_TemperatureService_) {
        temperatureService = _TemperatureService_;
    }));

    it('returns -1 when no HM is found.', function () {
        expect(temperatureService.get1stHM([])).toBe(0);
    });

    it('returns 15 as first HM.', function () {
        expect(temperatureService.get1stHM(evaluableMenstrualCycle)).toBe(16);
    });

    it('returns 36.6 as cover temperature.', function () {
        expect(temperatureService.getCoverTemperature(evaluableMenstrualCycle)).toBe(36.6);
    });

    it('rounds values according to NFP rules.', function () {
        var fixtures = [
            [36.50, 36.50],
            [36.51, 36.50],
            [36.52, 36.50],
            [36.53, 36.55],
            [36.54, 36.55],
            [36.55, 36.55],
            [36.56, 36.55],
            [36.57, 36.55],
            [36.58, 36.60],
            [36.59, 36.60],
            [36.60, 36.60]
        ];

        fixtures.forEach(function (value) {
            expect(temperatureService.round(value[0])).toBe(value[1]);
        })
    });

    it('returns object when cycle can be evaluated.', function () {
        var evaluation = temperatureService.evaluateMenstrualCycle(evaluableMenstrualCycle);

        expect(evaluation.hm).toEqual({temperature: 36.8});
        expect(evaluation.day).toEqual(16);
        expect(evaluation.rule.name).toBe('default');
        expect(evaluation.coverTemp).toBe(36.6);
    });

    it('can evaluate cycle using first exceptional rule.', function () {
        var temps = [
            {temperature: 36.70},
            {temperature: 36.80},
            {temperature: 36.75},
            {temperature: 36.70},
            {temperature: 36.65},
            {temperature: 36.60},
            {temperature: 36.55},
            {temperature: 36.60},
            {temperature: 36.65},
            {temperature: 36.70}, // Cover Temp
            {temperature: 36.60},
            {temperature: 36.75}, // 1st HM, day 12
            {temperature: 36.80},
            {temperature: 36.85},
            {temperature: 36.80}
        ];

        expect(temperatureService.getCoverTemperature(temps)).toBe(36.7);
        expect(temperatureService.get1stHM(temps)).toBe(12);

        var evaluation = temperatureService.evaluateMenstrualCycle(temps);
        expect(evaluation).not.toBeFalsy();
        expect(evaluation.hm).toEqual({temperature: 36.75});
        expect(evaluation.day).toEqual(12);
        expect(evaluation.rule.name).toBe('1st Exceptional Rule');
        expect(evaluation.coverTemp).toBe(36.7);
    });

    it('can evaluate cycle using second exceptional rule.', function () {
        var temps = [
            {temperature: 36.70},
            {temperature: 36.80},
            {temperature: 36.75},
            {temperature: 36.70},
            {temperature: 36.65},
            {temperature: 36.60},
            {temperature: 36.55},
            {temperature: 36.60},
            {temperature: 36.65},
            {temperature: 36.70}, // cover temperature
            {temperature: 36.60},
            {temperature: 36.80}, // 1st HM, day 12
            {temperature: 36.65},
            {temperature: 36.80},
            {temperature: 36.90}
        ];

        expect(temperatureService.getCoverTemperature(temps)).toBe(36.7);
        expect(temperatureService.get1stHM(temps)).toBe(12);

        var evaluation = temperatureService.evaluateMenstrualCycle(temps);
        expect(evaluation).not.toBeFalsy();
        expect(evaluation.hm).toEqual({temperature: 36.8});
        expect(evaluation.day).toEqual(12);
        expect(evaluation.rule.name).toBe('2nd Exceptional Rule');
        expect(evaluation.coverTemp).toBe(36.7);
    });

    it('can evaluate cycle having missing temps.', function () {
        var cycle = [{}, {}, {}, {}, {}];
        cycle = cycle.concat(evaluableMenstrualCycle.slice(0));
        expect(temperatureService.get1stHM(cycle)).toBe(21);
    });

    it('can handle just one measurement.', function() {
        var cycle = [{
            temperature: 36.70
        }];

        expect(temperatureService.evaluateMenstrualCycle(cycle)).toBe(false);
    });
});
