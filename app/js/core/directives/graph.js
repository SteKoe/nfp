angular.module('de.stekoe.nfp.core')
    .directive('graph', function (CervixService, MenstruationService) {
        var svgElement;

        var de_DE = {
            "decimal": ".",
            "thousands": ",",
            "grouping": [3],
            "currency": ["EUR", ""],
            "dateTime": "%a %b %e %X %Y",
            "date": "%m.%d.%Y",
            "time": "%H:%M",
            "periods": ["AM", "PM"],
            "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
            "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
            "months": ["Januar", "Februrar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
            "shortMonths": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
        };
        var locale = d3.locale(de_DE);

        return {
            templateUrl: '/js/core/directives/graph.html',
            link: function (scope, element) {
                svgElement = element.find('svg')[0];
                scope.$watch('data', function () {
                    if (scope.data) {
                        drawGraph(scope.data);
                    }
                });
            }
        };

        function drawGraph(data) {
            var measurements = data.measurements;
            var dates = [];
            var maxDateCount = (measurements.length < 30) ? 30 : Math.floor(measurements.length / 10) * 10 + 10;
            for (var i = 0; i < maxDateCount; i++) {
                dates.push(d3.time.day.offset(measurements[0].date, i));
            }

            // SVG Canvas
            var graphs = {
                dates: {
                    height: 100
                },
                temperature: {
                    height: 300,
                    marginTop: 100
                },
                cervix: {
                    height: 20,
                    marginTop: 420
                }
            };

            var sumGraphHeights = Object.keys(graphs)
                .map(function (graphType) {
                    return graphs[graphType];
                })
                .reduce(function (prev, cur) {
                    return prev + cur.height;
                }, 0);


            var svgMargin = [5, 5, 5, 75]; // margins
            var svgHeight = (sumGraphHeights + 100) + svgMargin[0] + svgMargin[2];
            var svgWidth = svgMargin[3] + (40 * 15) - svgMargin[1] - svgMargin[3]; // width
            var graphWidth = svgWidth;

            var canvas = d3.select(svgElement)
                .attr("width", svgWidth + svgMargin[1] + svgMargin[3])
                .attr("height", svgHeight + svgMargin[0] + svgMargin[2])
                .append("svg:g")
                .attr("class", "graphs")
                .attr("transform", "translate(" + svgMargin[3] + "," + svgMargin[0] + ")");

            var minDateCount = maxDateCount;
            var minDate = data.measurements[0].date;
            var maxDate = d3.time.day.offset(minDate, minDateCount);
            var x = d3.time.scale()
                .domain([minDate, maxDate])
                .range([0, graphWidth]);
            var xAxis = d3.svg.axis().scale(x)
                .ticks(minDateCount)
                .tickSize(svgHeight);
            canvas.append("svg:g")
                .attr("class", "x axis")
                .call(xAxis);

            drawDates();
            drawCycleDayNumbers();
            drawTemperatureGraph();

            var symbolFn = function (d) {
                var symbol = CervixService.getSymbol(d.cervix);
                return (symbol) ? ['#cervix-', symbol].join('') : null;
            };
            drawSimpleGraph("Mens", {
                marginTop: 420, symbolFn: function (d) {
                    return ['#mens-', MenstruationService.getSymbol(d.menstruation)].join('');
                }
            });
            drawSimpleGraph("Zervix", {marginTop: 440, symbolFn: symbolFn});

            function drawCycleDayNumbers() {
                var cycleDayNumber = canvas.append('svg:g');
                cycleDayNumber.selectAll('.day')
                    .data(dates)
                    .enter()
                    .append('svg:text')
                    .attr('class', 'day')
                    .attr('text-anchor', 'middle')
                    .attr('transform', function (d) {
                        return 'translate(' + x(d3.time.hour.offset(d, 12)) + ', 415)'
                    })
                    .text(function (d, i) {
                        return i + 1;
                    });
                var t = cycleDayNumber.append('text')
                    .attr('text-anchor', 'right')
                    .text("ZT");

                var textWidth = t[0][0].clientWidth;
                t.attr('transform', 'translate(' + -(3 + textWidth) + ', 415)');
            }

            function drawDates() {
                var dateGraph = canvas.append('svg:g')
                    .attr('class', 'dates')
                    .attr('transform', 'translate(0, ' + (graphs.dates.marginTop || 0) + ')');

                dateGraph.selectAll('.date')
                    .data(dates)
                    .enter()
                    .append('svg:text')
                    .attr('class', 'date')
                    .attr('transform', function (d, i) {
                        var offset = d3.time.hour.offset(d, 16);
                        return 'translate(' + x(offset) + ', ' + (graphs.dates.height - 50) + ')  rotate(-90)'
                    })
                    .text(function (d) {
                        var date = locale.timeFormat("%a %d.%m");
                        return date(d);
                    });

                dateGraph.selectAll('.time')
                    .data(data.measurements)
                    .enter()
                    .append('svg:text')
                    .attr('class', 'time')
                    .attr('transform', function (d) {
                        return 'translate(' + x(d3.time.hour.offset(d.date, 16)) + ', ' + (graphs.dates.height - 5) + ')  rotate(-90)'
                    })
                    .text(function (d) {
                        return d.time;
                    })
            }

            function drawTemperatureGraph() {
                var hm = data.evaluated.hm.day,
                    last = data.evaluated.last,
                    coverTemp = data.evaluated.hm.coverTemp,
                    measurements = data.measurements;

                var temperatureGraph = canvas.append('svg:g')
                    .attr('class', 'temperature-graph')
                    .attr('transform', 'translate(0, ' + (graphs.temperature.marginTop || 0) + ')');

                // Cycle Graph
                var y = d3.scale.linear()
                    .domain([35.9, 37.5])
                    .range([graphs.temperature.height, 0]);

                temperatureGraph.append('svg:rect')
                    .attr('class', 'unfruchtbar')
                    .attr('width', x(d3.time.day.offset(measurements[0].date, 5)))
                    .attr('height', graphs.temperature.height)
                    .attr('transform', 'translate(0, 0)');
                if (last) {
                    var offsetX = x(d3.time.hour.offset(measurements[last - 1].date, 12));
                    temperatureGraph.append('svg:rect')
                        .attr('class', 'unfruchtbar')
                        .attr('width', graphWidth - offsetX)
                        .attr('height', graphs.temperature.height)
                        .attr('transform', 'translate(' + offsetX + ', 0)');
                }
                // Mark the hm
                if (hm) {
                    temperatureGraph.append('svg:rect')
                        .attr('class', 'hm-marker')
                        .attr('width', 60)
                        .attr('height', graphs.temperature.height)
                        .attr('transform', 'translate(' + (x(measurements[hm - 3].date)) + ', 0)');
                }

                var xAxis = d3.svg.axis().scale(x)
                    .ticks(minDateCount)
                    .tickSize(graphs.temperature.height);
                temperatureGraph.append("svg:g")
                    .attr("class", "x axis")
                    .call(xAxis);

                var yAxisLeft = d3.svg.axis().scale(y)
                    .tickValues(d3.range(35.9, 37.5, 0.1))
                    .tickSize(-graphWidth)
                    .orient("left");
                temperatureGraph.append("svg:g")
                    .attr("class", "y axis")
                    .call(yAxisLeft);

                // Mark the CoverLine
                if (coverTemp) {
                    temperatureGraph.append('svg:line')
                        .attr('id', 'coverline')
                        .attr("x1", 0)
                        .attr("y1", function () {
                            return y(coverTemp)
                        })
                        .attr("x2", svgWidth)
                        .attr("y2", function () {
                            return y(coverTemp)
                        });
                }

                // line with bubbles
                temperatureGraph.selectAll('.temperaturePath')
                    .remove()
                    .data(measurements)
                    .enter()
                    .append("svg:line")
                    .attr("class", function (d, i) {
                        var classes = ['temperaturePath'];
                        if (d.exclude || (i > 0 && measurements[i - 1].exclude)) {
                            classes.push('excludedValue');
                        }
                        return classes.join(' ');
                    })
                    .attr("x1", function (d, i) {
                        if (i > 0) {
                            return x(d3.time.hour.offset(measurements[i - 1].date, 12));
                        }
                    })
                    .attr("y1", function (d, i) {
                        if (i > 0) {
                            return y(measurements[i - 1].temperature)
                        }
                    })
                    .attr("x2", function (d) {
                        return x(d3.time.hour.offset(d.date, 12));
                    })
                    .attr("y2", function (d) {
                        return y(d.temperature)
                    })
                    .style("display", function (d, i) {
                        if (i === 0) {
                            return "none";
                        } else if (!d.temperature || d.temperature === 0) {
                            return "none";
                        } else {
                            return null;
                        }
                    });
                temperatureGraph.selectAll('.temperatureBubble')
                    .data(measurements)
                    .enter()
                    .append('circle')
                    .attr("class", 'temperatureBubble')
                    .attr("transform", function (d) {
                        return "translate(" + x(d3.time.hour.offset(d.date, 12)) + "," + y(d.temperature) + ")";
                    })
                    .style("display", function (d) {
                        return d.temperature === 0 ? "none" : null;
                    })
                    .attr("r", '2.5');
            }

            // == LE GRAPH DE CERVIX =====
            function drawSimpleGraph(label, options) {
                var type = label.toLowerCase();

                var cervixGraph = canvas.append('svg:g')
                    .attr('class', ['graph', type].join(' '))
                    .attr("transform", "translate(0," + (options.marginTop || 0) + ")");

                var s = cervixGraph.selectAll(['.', type].join(''))
                    .data(data.measurements)
                    .enter();

                if (options.symbolFn) {
                    s.append('use')
                        .attr("class", type)
                        .attr("xlink:href", options.symbolFn)
                        .attr('width', 14)
                        .attr('height', 20)
                        .attr("transform", function (d) {
                            return "translate(" + (x(d.date) + 3) + ", 0)";
                        });
                } else if (options.textFn) {
                    s.append('text')
                        .attr("class", type)
                        .text(options.textFn)
                        .attr('text-anchor', 'middle')
                        .attr("transform", function (d) {
                            return "translate(" + (x(d3.time.hour.offset(d.date, 12))) + ", 15)";
                        });
                }

                var t = cervixGraph.append('text')
                    .attr('text-anchor', 'right')
                    .text(label);

                var textWidth = t[0][0].clientWidth;
                t.attr('transform', 'translate(' + -(3 + textWidth) + ', 15)');
            }
        }


    });