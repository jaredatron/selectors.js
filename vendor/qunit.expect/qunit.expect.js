var expect;
;(function() {

  expect = function expect(object){
    return new Expect(arguments);
  };
  expect.prototype = Expect.prototype;

  function Expect(objects){
    this.objects = Array.prototype.slice.apply(objects);
  };
  Expect.prototype.each = function(block){
    var self = this;
    self.objects.forEach(function(object){ block.call(self, object); });
    return self;
  };


  [
    ['to equal',             'toEqual',           equals             ],
    ['to not equal',         'toNotEqual',        notEqual           ],
    ['to be',                'toBe',              strictEqual        ],
    ['to no be',             'toNotBe',           notStrictEqual     ],
    ['to deep equal',        'toDeepEqual',       deepEqual          ],
    ['to not deep equal',    'toNotDeepEqual',    notDeepEqual       ],
    ['to be an instance of', 'toBeAnInstanceOf',  toBeAnInstanceOf   ],
    ['to throw',             'toThrow',           toThrow            ],
    ['to not throw',         'toNotThrow',        toNotThrow         ],
    ['to throw a',           'toThrowA',          toThrowA           ],
    ['to Not throw a',       'toNotThrowA',       toNotThrowA        ],
    ['to have property',     'toHaveProperty',    toHaveProperty     ],
    ['to not have property', 'toNotHaveProperty', toNotHaveProperty  ]
  ].forEach(function(data){
    Expect.prototype[data[1]] = function(expected, message){
      return this.each(function(actual){
        var expected_as_string = QUnit.jsDump.parse(expected),
            actual_as_string   = typeof actual === 'function' ?
              '`'+actual.toString().split("\n").slice(1,-1).join("\n").replace(/\n/g, ' ')+'`' :
              QUnit.jsDump.parse(actual);

        message = message ? message : '(expected: '+actual_as_string+' '+data[0]+' '+expected_as_string;
        data[2](actual, expected, message);
      });
    };
  });

  function toBeAnInstanceOf(actual, expected, message){
    ok(actual instanceof expected, message);
    return this;
  };
  function toThrow(actual, expected, message){
    equals.apply(null, captureErrorMessage(actual, expected, message));
    return this;
  };
  function toNotThrow(actual, expected, message){
    notEqual.apply(null, captureErrorMessage(actual, expected, message));
    return this;
  };
  function toThrowA(actual, expected, message){
    toBeAnInstanceOf(captureError(actual), expected, message);
    return this;
  };
  function toNotThrowA(actual, expected, message){
    toNotBeAnInstanceOf(captureError(actual), expected, message);
    return this;
  };
  function toHaveProperty(actual, expected, message){
    ok(expected in actual, message);
    return this;
  }
  function toNotHaveProperty(actual, expected, message){
    ok(!(expected in actual), message);
    return this;
  }


  function captureError(actual){
    if (typeof actual !== "function") throw new Error('functions only fool!');
    try{ actual(); }catch(e){ return e; }
  }
  function captureErrorMessage(actual, expected, message){
    var error = captureError(actual);
    if (error    && error.message   ) error    = error.message;
    if (expected && expected.message) expected = expected.message;
    return [error, expected, message];
  }

})();
