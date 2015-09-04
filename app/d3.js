(function () {
    $.getJSON('cycle.json')
        .then(function(data) {
            console.log(data);
            var d = [];
            d.push(data[0]);

            drawGraph(d);
        });


    function drawGraph(data) {
        var hm, coverTemp;

        //var coverTemp = 36.6;
        //var hm = 16;

        // Prepare data
        var parseDate = d3.time.format("%Y-%m-%d").parse;
        data.forEach(function (d) {
            d.date = parseDate(d.date);
            d.temperature = +d.temperature;
        });
        var dates = data.map(function getDate(data) {
            return data.date;
        }).sort(function (a, b) {
            return new Date(a) - new Date(b);
        });
        data.push({date: d3.time.day.offset(dates[dates.length - 1], +1), temperature: 0});
console.log("a", dates[0], d3.time.day.offset(dates[0], 30));

        // SVG Canvas
        var svgMargin = [20,20,20,150]; // margins
        var svgWidth = svgMargin[3] + (data.length * 20) - svgMargin[1] - svgMargin[3]; // width
        var svgHeight = 500 - svgMargin[0] - svgMargin[2]; // height

        var graph = d3.select("svg")
            .attr("width", svgWidth + svgMargin[1] + svgMargin[3])
            .attr("height", svgHeight + svgMargin[0] + svgMargin[2])
            .append("svg:g")
            .attr("transform", "translate(" + svgMargin[3] + "," + svgMargin[0] + ")");

        // Cycle Graph
        var cycleGraphHeight = svgHeight * 0.65;
        var cycleGraphWidth = svgWidth;
        var x = d3.time.scale().domain([dates[0], d3.time.day.offset(dates[0], 12)]).range([0, cycleGraphWidth]);
        var y = d3.scale.linear().domain([35.9, 37.5]).range([cycleGraphHeight, 0]);
        var line = d3.svg.line()
            .x(function (d) {
                return x(d.date) + 10;
            })
            .y(function (d) {
                return y(d.temperature);
            });

        // Mark the hm
        if(hm) {
            graph.append('svg:rect')
                .attr('class', 'hm-marker')
                .attr('width', 20)
                .attr('height', cycleGraphHeight)
                .attr('transform', 'translate(' + (x(data[hm - 1].date)) + ', 0)');
        }

        graph.append('svg:rect')
            .attr('class', 'unfruchtbar')
            .attr('width', x(d3.time.day.offset(data[0].date, 5)))
            .attr('height', cycleGraphHeight)
            .attr('transform', 'translate(0, 0)');

        // Mark the CoverLine
        if (coverTemp) {
            graph.append('svg:line')
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

        var xAxis = d3.svg.axis().scale(x).tickValues([dates[0], d3.time.day.offset(dates[0], 30)]).tickSize(-cycleGraphHeight);
        graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + cycleGraphHeight + ")")
            .call(xAxis);

        var yAxisLeft = d3.svg.axis().scale(y).tickValues(d3.range(35.9, 37.5, 0.1)).tickSize(-cycleGraphWidth).orient("left");
        graph.append("svg:g")
            .attr("class", "y axis")
            .call(yAxisLeft);


        // line with bubbles
        graph.selectAll('.temperaturePath')
            .data(data)
            .enter()
            .append("svg:line")
            .attr("class", function (d, i) {
                var classes = ['temperaturePath'];

                if (d.exclude || (i > 0 && data[i - 1].exclude)) {
                    classes.push('excludedValue');
                }

                return classes.join(' ');
            })
            .attr("x1", function (d, i) {
                if (i > 0) {
                    return x(data[i - 1].date) + 10
                }
            })
            .attr("y1", function (d, i) {
                if (i > 0) {
                    return y(data[i - 1].temperature)
                }
            })
            .attr("x2", function (d) {
                return x(d.date) + 10
            })
            .attr("y2", function (d, i) {
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
        graph.selectAll('.temperatureBubble')
            .data(data)
            .enter()
            .append('circle')
            .attr("class", 'temperatureBubble')
            .attr("transform", function (d) {
                return "translate(" + x(d3.time.hour.offset(d.date, 12)) + "," + y(d.temperature) + ")";
            })
            .style("display", function (d) {
                return d.temperature === 0 ? "none" : null;
            })
            .attr("r", '4');

        // Le Daycounter
        graph.selectAll('.daycounter')
            .data(data)
            .enter()
            .append("svg:text")
            .attr("class", 'daycounter')
            .attr("transform", function (d) {
                return "translate(" + x(d3.time.hour.offset(d.date, 12)) + "," + (cycleGraphHeight + 15) + ")";
            })
            .style("font-size", "10px")
            .attr("text-anchor", "middle")
            .style("fill", "black")
            .text(function (d, i) {
                return i + 1;
            });
    }

})();