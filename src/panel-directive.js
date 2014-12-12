(function() {
  'use strict';

  var app = angular.module('panel-directive', []);

  app.directive('svgpanel', ['d3', function(d3) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        var svg = d3.select(element[0])
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('class', 'svgpanel');

        // on window resize, re-render d3 canvas
        window.onresize = function() {
          return scope.$apply();
        };
        scope.$watch(function(){
            return angular.element(window)[0].innerWidth;
          }, function(){
            return scope.render(scope.panel.values);
          }
        );

        // watch for data changes and re-render
        scope.$watch('panel', function(newVals, oldVals) {
          return scope.render(newVals.values);
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
          svg.selectAll("*").remove();

          var width = totalWidth - margin.left - margin.right;
          var height = totalHeight - margin.top - margin.bottom;

          var chart = svg.append('g')
            .attr('class', 'chart')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', 'translate(' + margin.left +', ' + margin.bottom + ')');

          console.log("height", height);

          // scales & axes
          var x = d3.time.scale()
            .range([0, width]);
          var y = d3.scale.linear()
            .range([height, 0]);

          var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');
          var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickFormat(d3.format('s'));  // iso prefixes

          x.domain(d3.extent(data, function(d) { return d.ts; }));
          y.domain([0, d3.max(data, function(d) { return d.value; })]);

          // area
          var area = d3.svg.area()
            .x(function(d) { return x(d.ts); })
            .y0(height)
            .y1(function(d) { return y(d.value); });

          chart.append('path')
            .datum(data)
            .attr('class', 'area')
            .attr('d', area);

          // draw axes
          chart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

          chart.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Requests/s");
        };
      }
    };
  }]);
})();
