(function() {
  'use strict';

  var module = angular.module('bonitoTimepicker');

  module.constant('quickRanges', [
    { from: 'now/d',    to: 'now',       display: 'The day so far',        section: 0 },
    { from: 'now/w',    to: 'now',       display: 'Week to date',          section: 0 },
    { from: 'now/M',    to: 'now',       display: 'Month to date',         section: 0 },
    { from: 'now/y',    to: 'now',       display: 'Year to date',          section: 0 },
    { from: 'now/d',    to: 'now+1d/d',  display: 'Today',                 section: 0 },
    { from: 'now/w',    to: 'now+1w/w',  display: 'This week',             section: 0 },
    { from: 'now/M',    to: 'now+1M/M',  display: 'This month',            section: 0 },
    { from: 'now/y',    to: 'now+1y/y',  display: 'This year',             section: 0 },

    { from: 'now-1d/d', to: 'now/d',    display: 'Yesterday',             section: 1 },
    { from: 'now-2d/d', to: 'now-1d/d', display: 'Day before yesterday',  section: 1 },
    { from: 'now-7d/d', to: 'now-6d/d', display: 'This day last week',    section: 1 },
    { from: 'now-1w/w', to: 'now/w',    display: 'Previous week',         section: 1 },
    { from: 'now-1M/M', to: 'now/M',    display: 'Previous month',        section: 1 },
    { from: 'now-1y/y', to: 'now/y',    display: 'Previous year',         section: 1 },

    { from: 'now-15m',  to: 'now',      display: 'Last 15 minutes',       section: 2 },
    { from: 'now-30m',  to: 'now',      display: 'Last 30 minutes',       section: 2 },
    { from: 'now-1h',   to: 'now',      display: 'Last 1 hour',           section: 2 },
    { from: 'now-4h',   to: 'now',      display: 'Last 4 hours',          section: 2 },
    { from: 'now-12h',  to: 'now',      display: 'Last 12 hours',         section: 2 },
    { from: 'now-24h',  to: 'now',      display: 'Last 24 hours',         section: 2 },
    { from: 'now-7d',   to: 'now',      display: 'Last 7 days',           section: 2 },
    { from: 'now-30d',  to: 'now',      display: 'Last 30 days',          section: 2 },
  ]);

})();
