# Bonito

Bonito is (or will be) a web-ui for the [Packetbeat](http://packetbeat.com)
monitoring system.

It is meant to be used as a complementary to Kibana for visualizing the
performance data collected by Packetbeat and indexed in Elasticsearch.

Unlike Kibana, Bonito relies on a given structure for the data and has a focus
on visualisations for application performance monitoring. Like Kibana, it is very
configurable with regards to the specifics of the data, like the field names.
This means you can use it also for data that is not collected via Packetbeat,
it just works out of the box with Packetbeat.

# Status

Bonito is developed in the open but not ready yet. We expect a first public
release to be available in March 2015.

# Screenshots

  ![Microservices monitoring](/screenshots/services.png?raw=true)

  ![Application performance dashboard](/screenshots/perfdash.png?raw=true)
