loadScript("/canon/_design/canon/cjson.js");

var couchTests = {
  basic : function() {
    var c = CJSON.stringify({foo : "bar"});
    T(c == '{"foo":"bar"}');
  },
  sorted_by_key : function() {
    var obj = {
      "foo" : "bar",
      "baz" : "bam",
      "zam" : "zing"
    };
    var c = CJSON.stringify(obj);
    console.log(c);
    T(c == '{"baz":"bam","foo":"bar","zam":"zing"}');
  },
  sorted_recursive : function() {
    var obj = {
      "foo" : "bar",
      "baz" : {
        "zabba" : 3,
        "abba" : 1,
        "fabba" : 2
      },
      "zam" : "zing"
    };
    var c = CJSON.stringify(obj);
    console.log(c);
    T(c == '{"baz":{"abba":1,"fabba":2,"zabba":3},"foo":"bar","zam":"zing"}');
  },
  
}