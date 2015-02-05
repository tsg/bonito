(function() {
  'use strict';

  var module = angular.module('bonitoViz');

  module.directive('bonitoHistogram', ['d3', 'formatters', 'colors',
      function(d3, formatters, colors) {
    return {
      restrict: 'E',
      scope: {
        data: '=',  // bi-directional data binding
        height: '=',
        width: '='
      },
      link: function(scope, element, attrs) {

        //watch for resizes
        scope.$watch(function() {
            return [element.parent().innerWidth(), element.parent().innerHeight()].join('x');
          }, function(newVals) {
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
          right: parseInt(attrs.marginRight) || 30,
          bottom: parseInt(attrs.marginBottom) || 30,
          left: parseInt(attrs.marginLeft) || 40
        };
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
          var totalHeight = parseInt(scope.height) || 200;

          var width = totalWidth - margin.left - margin.right;
          var height = totalHeight - margin.top - margin.bottom;

          var svg = d3.select(element[0])
            .append('svg')
            .attr('width', totalWidth)
            .attr('height', totalHeight)
            .attr('class', 'svggraph');

          var dx = data[1].value - data[0].value;

          var x = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.value; }) + dx])
            .range([0, width]);

          var color = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.value; }) + dx])
            .range([colors['@brand-success'], colors['@brand-danger']]);

          var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.count; })])
            .range([height, 0]);

          var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .tickFormat(formatterFunc);

          var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickFormat(d3.format('s')); // iso prefixes

          var chart = svg.append('g')
            .attr('class', 'bonito-histogram')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', 'translate(' + margin.left +', ' + margin.bottom + ')');

          // Axes
          chart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

          chart.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

          // Bars
          var bar = chart.selectAll('.bar')
            .data(data)
          .enter().append('g')
            .attr('class', 'bar')
            .attr('transform', function(d) { return 'translate(' + x(d.value) + ',' + y(d.count) + ')'; });


          bar.append('rect')
            .attr('x', 2)
            .style('fill', function(d) {return color(d.value);})
            .attr('width', (width / data.length) - 4)
            .attr('height', function(d) { return height - y(d.count); });


        };
      }
    };
  }]);
})();
