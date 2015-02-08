(function() {
  'use strict';

  var module = angular.module('bonitoViz', [
    'bonitoFormatters',
    'bonitoColors'
  ]);

  module.directive('bonitoBarchart', ['d3', 'formatters', '$window',
    function(d3, formatters) {
    return {
      restrict: 'E',
      scope: {
        data: '=',  // bi-directional data binding
        height: '=',
        width: '='
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

        // config
        var margin = {
          top: parseInt(attrs.marginTop) || 20,
          right: parseInt(attrs.marginRight) || 30,
          bottom: parseInt(attrs.marginBottom) || 30,
          left: parseInt(attrs.marginLeft) || 40
        };

        var type = attrs.type || 'vertical';
        var datatype = attrs.datatype || 'number';

        var formatterFunc;
        if (datatype === 'duration') {
          formatterFunc = function(value) {
            return formatters.formatDuration(value, 0);
          };
        } else {
          formatterFunc = d3.format('s');   // iso prefixes
        }

        // in horizontal mode we need a minimum left margin
        if (type === 'horizontal' && margin.left < 100) {
          margin.left = 100;
        }


        // define rendering function
        scope.render = function(data) {
          // clean
          d3.select(element[0])
            .select('svg').remove();

          if (_.isEmpty(data)) {
            return;
          }

          // make sure data is sorted descending by value
          data = _.sortBy(data, function(d) { return -d.value; });

          var totalWidth = scope.width || element.parent().innerWidth();
          var totalHeight = parseInt(scope.height) || 200;

          var width = totalWidth - margin.left - margin.right;
          var height = totalHeight - margin.top - margin.bottom;

          var svg = d3.select(element[0])
            .append('svg')
            .attr('width', totalWidth)
            .attr('height', totalHeight)
            .attr('class', 'svggraph');

          var chart = svg.append('g')
            .attr('class', 'bonito-barchart')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', 'translate(' + margin.left +', ' + margin.bottom + ')');

          if (type === 'horizontal') {
            scope.renderHorizontal(data, width, height, chart);
          } else {
            scope.renderVertical(data, width, height, chart);
          }

        };

        scope.renderVertical = function(data, width, height, chart) {
          var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], 0.1);
          x.domain(data.map(function(d) { return d.name; }));

          var y = d3.scale.linear()
            .range([height, 0]);
          y.domain([0, d3.max(data, function(d) { return d.value; })]);

          // Axes
          var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

          var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickFormat(formatterFunc);

          chart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

          chart.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

          // Bars
          chart.selectAll('.bar')
            .data(data)
          .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', function(d) { return x(d.name); })
            .attr('y', function(d) { return y(d.value); })
            .attr('height', function(d) { return height - y(d.value); })
            .attr('width', x.rangeBand());
        };

        scope.renderHorizontal = function(data, width, height, chart) {
          var y = d3.scale.ordinal()
            .rangeRoundBands([0, height], 0.1);
          y.domain(data.map(function(d) { return d.name; }));

          var x = d3.scale.linear()
            .range([0, width]);
          x.domain([0, d3.max(data, function(d) { return d.value; })]);

          // Axes
          var xAxis = d3.svg.axis()
            .scale(x)
            .orient('top')
            .tickFormat(formatterFunc);

          var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickFormat(function (v) { return formatters.trimString(v, 23);});

          chart.append('g')
            .attr('class', 'x axis')
            .call(xAxis);

          chart.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

          // Bars
          chart.selectAll('.bar')
            .data(data)
          .enter().append('rect')
            .attr('class', 'bar')
            .attr('y', function(d) { return y(d.name); })
            .attr('width', function(d) { return x(d.value); })
            .attr('height', y.rangeBand());
        };
      }
    };
  }]);
})();
