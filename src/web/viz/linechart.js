(function() {
  'use strict';

  var module = angular.module('bonitoViz');

  /**
   * Draws a graph using D3. The data, the width and height parameters are
   * required.
   */
  module.directive('bonitoLinechart', ['d3', 'formatters', function(d3, formatters) {
    return {
      restrict: 'E',
      scope: {
        data: '=',  // bi-directional data binding
        height: '=',
        width: '=',
        planetSize: '='   // relative planet size to other panels
      },
      link: function(scope, element, attrs) {

        // re-render on window-width changes
        angular.element(window).on('resize', function(ev) {
          scope.render(scope.data);
        });

        // watch for data changes and re-render
        scope.$watch('data', function(newVals, oldVals) {
          return scope.render(newVals);
        }, true);
        scope.$watch('planetSize', function(newVals, oldVals) {
          return scope.render(scope.data);
        }, true);

        // config
        var margin = {
          top: parseInt(attrs.marginTop) || 20,
          right: parseInt(attrs.marginRight) || 20,
          bottom: parseInt(attrs.marginBottom) || 30,
          left: parseInt(attrs.marginLeft) || 35
        };

        var ylabel = attrs.ylabel || '';
        var type = attrs.type || 'line';
        var datatype = attrs.datatype || 'number';

        var formatterFunc;
        if (datatype === 'duration') {
          formatterFunc = function(value) {
            return formatters.formatDuration(value, 0);
          };
        } else {
          formatterFunc = d3.format('s');   // iso prefixes
        }


        // define rendering function
        scope.render = function(data) {
          // clean
          d3.select(element[0])
            .select('svg').remove();

          var totalWidth = scope.width || element.parent().innerWidth();
          var totalHeight = scope.height;

          var width = totalWidth - margin.left - margin.right;
          var height = totalHeight - margin.top - margin.bottom;

          var svg = d3.select(element[0])
            .append('svg')
            .attr('width', totalWidth)
            .attr('height', totalHeight)
            .attr('class', 'svggraph');

          var chart = svg.append('g')
            .attr('class', 'chart')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', 'translate(' + margin.left +', ' + margin.bottom + ')');

          if (!isNaN(scope.planetSize)) {
            // add size 'planet'
            chart.append('g')
              .attr('class', 'planet')
              .attr('transform',
                  'translate(' + (width * 3/4) + ',' +  (height/2.4) + ')')
              .append('circle')
                .attr('r', (totalHeight/1.8) * scope.planetSize);
          }

          // scales & axes
          var x = d3.time.scale()
            .range([0, width]);
          var y = d3.scale.linear()
            .range([height, 0]);

          var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(8);
          var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5)
            .tickFormat(formatterFunc);

          x.domain(d3.extent(data, function(d) { return d.ts; }));
          y.domain([0, d3.max(data, function(d) { return d.value; })]);

          if (type != 'area') {
            // line
            var line = d3.svg.line()
              .x(function(d) { return x(d.ts); })
              .y(function(d) { return y(d.value); });

            chart.append('path')
              .datum(data)
              .attr('class', 'line')
              .attr('d', line);
          } else {
            // area
            var area = d3.svg.area()
              .x(function(d) { return x(d.ts); })
              .y0(height)
              .y1(function(d) { return y(d.value); });

            chart.append('path')
              .datum(data)
              .attr('class', 'area')
              .attr('d', area);
          }

          // draw axes
          chart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

          chart.append('g')
              .attr('class', 'y axis')
              .call(yAxis)
            .append('text')
              .attr('class', 'label')
              .attr('transform', 'rotate(-90)')
              .attr('y', 6)
              .attr('x', -height + 6)
              .attr('dy', '.71em')
              .style('text-anchor', 'beggining')
              .text(ylabel);

          // draw grid
          chart.append('g')
            .attr('class', 'grid')
            .call(xAxis
              .tickSize(height, 0, 0)
              .tickFormat(''));
          chart.append('g')
            .attr('class', 'grid')
            .call(yAxis
              .tickSize(-width, 0, 0)
              .tickFormat(''));

          // tooltip system, based on
          // http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html
          var focus = chart.append('g')
            .style('display', 'none');

          focus.append('circle')
            .attr('class', 'focus-circle')
            .attr('r', 4);
          focus.append('text')
            .attr('class', 'focus-value-label')
            .attr('dx', 8)
            .attr('dy', '-.3em');
          focus.append('text')
            .attr('class', 'focus-ts-label')
            .attr('dx', 8)
            .attr('dy', '1em');

          var formatComas = d3.format('0,000');
          var formatTs = d3.time.format('%H:%M:%S');
          var mousemove = function() {
            var bisectTs = d3.bisector(function(d) { return d.ts; }).left,
              x0 = x.invert(d3.mouse(this)[0]),
              i = bisectTs(data, x0, 1),
              d0 = data[i-1],
              d1 = data[i],
              d = x0 - d0.ts > d1.ts - x0 ? d1 : d0;

            focus.select('circle.focus-circle')
              .attr('transform',
                'translate(' + x(d.ts) + ', ' + y(d.value) + ')');

            focus.select('text.focus-value-label')
              .attr('transform',
                'translate(' + x(d.ts) + ', ' + y(d.value) + ')')
              .text(formatComas(d.value));
            focus.select('text.focus-ts-label')
              .attr('transform',
                'translate(' + x(d.ts) + ', ' + y(d.value) + ')')
              .text(formatTs(d.ts));
          };

          chart.append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .on('mouseover', function() { focus.style('display', null); })
            .on('mouseout', function() { focus.style('display', 'none'); })
            .on('mousemove', mousemove);
        };
      }
    };
  }]);
})();
