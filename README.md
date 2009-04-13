# Repeatable JSON serializations

So far I have recursive sort working (using JS's built-in `array.sort()`) and I have ghetto float rounding working.

The tests are designed to be run using CouchDB. To run them yourself, you need CouchApp. In the canonical-json directory run `couchapp push mydb` and then browse in Futon to the design doc that it creates. You should see a link to run the tests in the test runner. Click it. It should sorta look like what you see here: [http://jchrisa.net:5984/_utils/couch_tests.html?/canon/_design/canon/tests.js](http://jchrisa.net:5984/_utils/couch_tests.html?/canon/_design/canon/tests.js)

I'm happy to accept pull requests that consist of nothing but failing tests. I'm also happy to accept requests that make such tests pass.

Cheers!

### High-level overview of doc-signing process

Serialize JSON object to be signed into a string.

Load the user's private and public keys.

Sign the string with the private key.

Create a singature object, which has:
  the signature string
  the public key
  the serialization function (or a URL to it)
  
Example final document

    {
      "_id" : "89a7stdg235",
      "_rev" : "1-26476513",
      "signed-content" : {
        "message" : "I said this and I meant it.",
        "date" : "2009/04/09 15:54:08",
        "author" : {
          "name" : "J. Chris Anderson",
          "url" : "http://jchrisa.net",
          "photo" : "http://jchrisa.net/profile.jpg"
        }
      },
      "signature" : {
        "content-hash" : "s7d23fiu7g34awb47e32rso7d54fn3sdf==",
        "content-serializer" : {
          "code" : "http://jchrisa.net/repeatable-json-0.2.2.js",
          "decimal-precision" : 4
        },
        "public-key" : "5s2457d357f47io46u135h35as5df135oi235ugs4a35df57ou7y5g1s5d5f58ou1s3d4f==",
        "signed-hash" : "h235h345h3147j23j35g1235344j3246h46jg3245j==",
      },
      "foo" : ["this content is not signed", "it's just here"]
    }
