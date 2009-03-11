# Repeatable JSON serializations

So far I have recursive sort working (using JS's built-in `array.sort()`) and I have ghetto float rounding working.

The tests are designed to be run using CouchDB. To run them yourself, you need CouchApp. In the canonical-json directory run `couchapp push mydb` and then browse in Futon to the design doc that it creates. You should see a link to run the tests in the test runner. Click it. It should sorta look like what you see here: [http://jchrisa.net:5984/_utils/couch_tests.html?/canon/_design/canon/tests.js](http://jchrisa.net:5984/_utils/couch_tests.html?/canon/_design/canon/tests.js)

I'm happy to accept pull requests that consist of nothing but failing tests. I'm also happy to accept requests that make such tests pass.

Cheers!