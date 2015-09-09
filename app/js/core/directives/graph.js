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
            var maxDateCount = (data.measurements.length < 30) ? 30 : Math.floor(data.measurements.length / 10) * 10 + 10;
            for (var i = data.measurements.length; i < maxDateCount; i++) {
                data.measurements.push({
                    date: d3.time.day.offset(data.measurements[i - 1].date, 1)
                });
            }

            // SVG Canvas
            var graphs = {
                dates: {
                    height: 100
                },
                zt: {
                    height: 20,
                    marginTop: 400
                },
                temperature: {
                    height: 300,
                    marginTop: 100
                },
                cervix: {
                    height: 20,
                    marginTop: 420
                },
                love: {
                    height: 20,
                    marginTop: 460
                }
            };

            var graphTypes = Object.keys(graphs);
            var sumGraphHeights = graphTypes
                .map(function (graphType) {
                    return graphs[graphType];
                })
                .reduce(function (prev, cur) {
                    return prev + cur.height;
                }, 0);

            console.log(data.measurements.length);

            var svgMargin = [0, 0, 0, 75]; // margins
            var svgHeight = (sumGraphHeights + graphs[graphTypes[graphTypes.length - 1]].height) + svgMargin[0] + svgMargin[2];
            var svgWidth = ((data.measurements.length) * 20); // width
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
            if(data.evaluated) {
                drawTemperatureGraph();
            }
            drawCycleDayNumbers();

            drawSimpleGraph("Mens", {
                marginTop: 420, symbolFn: function (d) {
                    return ['#mens-', MenstruationService.getSymbol(d.menstruation)].join('');
                }
            });
            drawSimpleGraph("Zervix", {
                marginTop: 440, symbolFn: function (d) {
                    var symbol = CervixService.getSymbol(d.cervix);
                    return (symbol) ? ['#cervix-', symbol].join('') : null;
                }
            });
            drawSimpleGraph("Love", {
                marginTop: graphs.love.marginTop, symbolFn: function (d) {
                    var clazz = ['#'];
                    if (d.love === 1) {
                        clazz.push('heart');
                    } else if (d.love === 2) {
                        clazz.push('heart-safe');
                    }
                    return clazz.join('')
                }
            });

            function drawCycleDayNumbers() {
                var cycleDayNumber = canvas.append('svg:g');
                cycleDayNumber.selectAll('.day')
                    .data(data.measurements.map(function(d) { return d.date; }))
                    .enter()
                    .append('svg:text')
                    .attr('class', function (d) {
                        var classes = ['day'];
                        if (isWeekend(d)) {
                            classes.push('weekend');
                        }
                        return classes.join(' ');
                    })
                    .attr('text-anchor', 'middle')
                    .attr('transform', function (d) {
                        var xVal = (d) ? x(d3.time.hour.offset(d, 12)) : 0;
                        return 'translate(' + xVal + ', ' + (graphs.zt.marginTop + 15) + ')'
                    })
                    .text(function (d, i) {
                        return i + 1;
                    });
                cycleDayNumber.append('text')
                    .attr('text-anchor', 'end')
                    .attr('transform', 'translate(-3, 415)')
                    .text("ZT");
            }

            function drawDates() {
                var dateGraph = canvas.append('svg:g')
                    .attr('class', 'dates')
                    .attr('transform', 'translate(0, ' + (graphs.dates.marginTop || 0) + ')');

                dateGraph.selectAll('.date')
                    .data(data.measurements.map(function(d) { return d.date; }))
                    .enter()
                    .append('svg:text')
                    .attr('class', function (d) {
                        var classes = ['date'];
                        if (isWeekend(d)) {
                            classes.push('weekend');
                        }
                        return classes.join(' ');
                    })
                    .attr('transform', function (d) {
                        var xVal = (d) ? x(d3.time.hour.offset(d, 16)) : 0;
                        return 'translate(' + xVal + ', ' + (graphs.dates.height - 50) + ')  rotate(-90)'
                    })
                    .text(function (d) {
                        if(d) {
                            var date = locale.timeFormat("%a %d.%m");
                            return date(d);
                        }
                    });

                dateGraph.selectAll('.time')
                    .data(data.measurements)
                    .enter()
                    .append('svg:text')
                    .attr('class', function (d) {
                        var classes = ['time'];
                        if (isWeekend(d.date)) {
                            classes.push('weekend');
                        }
                        return classes.join(' ');
                    })
                    .attr('transform', function (d) {
                        var xVal = (d) ? x(d3.time.hour.offset(d, 16)) : 0;
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
                        .attr("x1", x(measurements[hm - 5].date))
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
                    .data(data.measurements)
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
                        if (i > 0 && i <= measurements.length && measurements[i - 1].temperature) {
                            return y(measurements[i - 1].temperature)
                        }
                    })
                    .attr("x2", function (d) {
                        return (d.date) ? x(d3.time.hour.offset(d.date, 12)) : 0;
                    })
                    .attr("y2", function (d) {
                        return (d.temperature) ? y(d.temperature) : 0;
                    })
                    .style("display", function (d, i) {
                        return (i !== 0 && d.temperature && d.temperature >= 0) ? null : "none";
                    });
                temperatureGraph.selectAll('.temperatureBubble')
                    .data(measurements)
                    .enter()
                    .append('circle')
                    .attr("class", 'temperatureBubble')
                    .attr("transform", function (d) {
                        var xVal = (d.date) ? x(d3.time.hour.offset(d.date, 12)) : 0;
                        var yVal = (d.temperature) ? y(d.temperature) : 0;
                        return "translate(" + xVal + "," + yVal + ")";
                    })
                    .style("display", function (d) {
                        return (d.temperature && d.temperature >= 0) ? null : "none";
                    })
                    .attr("r", '2.5')
                    .on('mouseover', function (d, i) {
                        var tooltip = createTooltip("Messung " + (i + 1) + ": " + d.temperature + "°C");
                        tooltip.style("top", (d3.event.pageY - 10) + "px")
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("visibility", "visible");
                    });
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

                cervixGraph.append('text')
                    .attr('text-anchor', 'end')
                    .attr('transform', 'translate(-3, 15)')
                    .text(label);
            }

            function isWeekend(date) {
                if(date) {
                    var dayOfWeek = date.getDay();
                    return dayOfWeek === 0 || dayOfWeek === 6;
                }
            }

            function createTooltip(text) {
                var tooltip = d3.select('.tooltip');
                if (tooltip.empty()) {
                    tooltip = d3.select("body")
                        .append('div')
                        .attr('class', 'tooltip');
                }

                tooltip.text(text);

                return tooltip;
            }
        }
    });