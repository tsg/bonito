(function() {
  'use strict';

  var app = angular.module('svggraph-directive', []);

  /**
   * Draws a graph using D3. The data, the width and height parameters are
   * required.
   */
  app.directive('svggraph', ['d3', function(d3) {
    return {
      restrict: 'E',
      scope: {
        data: '='  // bi-directional data binding
      },
      link: function(scope, element, attrs) {
        var svg = d3.select(element[0])
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('class', 'svggraph');

        // on window resize, re-render d3 canvas
        window.onresize = function() {
          return scope.$apply();
        };
        scope.$watch(function() {
            return angular.element(window)[0].innerWidth;
          }, function() {
            return scope.render(scope.data);
          }
        );

        // watch for data changes and re-render
        scope.$watch('data', function(newVals, oldVals) {
          return scope.render(newVals);
        }, true);

        // config
        var margin = {
          top: parseInt(attrs.marginTop) || 20,
          right: parseInt(attrs.marginRight) || 20,
          bottom: parseInt(attrs.marginBottom) || 30,
          left: parseInt(attrs.marginLeft) || 35
        };
        // width and height are mandatory parameters
        var totalWidth = parseInt(attrs.width);
        var totalHeight = parseInt(attrs.height);



        // define rendering function
        scope.render = function(data) {
          // clean
          svg.selectAll('*').remove();

          var width = totalWidth - margin.left - margin.right;
          var height = totalHeight - margin.top - margin.bottom;

          var chart = svg.append('g')
            .attr('class', 'chart')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', 'translate(' + margin.left +', ' + margin.bottom + ')');

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
            .tickFormat(d3.format('s'));  // iso prefixes

          x.domain(d3.extent(data, function(d) { return d.ts; }));
          y.domain([0, d3.max(data, function(d) { return d.value; })]);

          // line
          var line = d3.svg.line()
            .x(function(d) { return x(d.ts); })
            .y(function(d) { return y(d.value); });

          chart.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line);

          // draw axes
          chart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

          chart.append('g')
              .attr('class', 'y axis')
              .call(yAxis)
            .append('text')
              .attr('transform', 'rotate(-90)')
              .attr('y', 6)
              .attr('x', -height + 6)
              .attr('dy', '.71em')
              .style('text-anchor', 'beggining')
              .text('Requests/s');

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
