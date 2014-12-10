Tests
=====

The testing approach follows mostly the approach from the [AngularJs
tutorial] [angular-tutorial]. It uses Karma for unit tests and Protactor for
"end-to-end" tests.

To run all unit tests:

    grunt test

To run the e2e test, you need first to download the Selenium webdriver:

    ./node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update

Make sure you have the app running in one terminal window:

      grunt dev

and then run in another window:

     grunt protractor


 [angular-tutorial]: https://docs.angularjs.org/tutorial
