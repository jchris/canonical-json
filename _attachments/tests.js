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
    T(c == '{"baz":{"abba":1,"fabba":2,"zabba":3},"foo":"bar","zam":"zing"}');
  },
  floats_rounded : function() {
    CJSON.floatPrecision = 2;
    var obj = {
      tiny : (1/99999999999999999999999999),
      third : (1/3),
      sixes : (2/3)
    };
    var c = CJSON.stringify(obj);
    // maybe I would prefer if tiny were 0.00
    T(c == '{"sixes":0.67,"third":0.33,"tiny":0}');
  }
}