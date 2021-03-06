module.exports = function (config) {
    config.set({

        basePath: './',

        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-aria/angular-aria.min.js',
            'app/bower_components/angular-animate/angular-animate.min.js',
            'app/bower_components/angular-material/angular-material.min.js',
            'app/bower_components/angular-mocks/angular-mocks.js',

            'app/js/app.js',
            'app/js/core/module.js',
            'app/js/core/**/*.js',

            'app/js/**/*.spec.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['PhantomJS'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
