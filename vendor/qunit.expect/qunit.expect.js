function expect(actual, context){
  if (this instanceof expect); else return new expect(actual);
  if (typeof actual === 'function') this.context = context;
  this.actual = actual;
};
(function() {

  [
    ['to equal',             'toEqual',           equals             ],
    ['to not equal',         'toNotEqual',        notEqual           ],
    ['to be',                'toBe',              strictEqual        ],
    ['to no be',             'toNotBe',           notStrictEqual     ],
    ['to deep equal',        'toDeepEqual',       deepEqual          ],
    ['to not deep equal',    'toNotDeepEqual',    notDeepEqual       ],
    ['to be an instance of', 'toBeAnInstanceOf',  toBeAnInstanceOf   ],
    ['to throw',             'toThrow',           toThrow            ],
    ['to throw a',           'toThrowA',          toThrowA           ],
    ['to have property',     'toHaveProperty',    toHaveProperty     ],
    ['to not have property', 'toNotHaveProperty', toNotHaveProperty  ]
  ].forEach(function(data){
    expect.prototype[data[1]] = function(expected, message){
      var expected_as_string = QUnit.jsDump.parse(expected),
          actual_as_string   = typeof this.actual === 'function' ?
            '`'+this.actual.toString().split("\n").slice(1,-1).join("\n").replace(/\n/g, ' ')+'`' :
            QUnit.jsDump.parse(this.actual);

      message = message ? message : '(expected: '+actual_as_string+' '+data[1]+' '+expected_as_string;
      data[2](this.actual, expected, message);
      return this;
    };
  });

  function toBeAnInstanceOf(actual, expected, message){
    ok(actual instanceof expected, message);
    return this;
  };

  function toThrow(actual, expected, message){
    var error_message;
    if (typeof actual !== "function") throw new Error('functions only fool!');
    if (expected instanceof Error) expected = expected.message;
    try{ actual(); }catch(error){ error_message = error.message; }
    equals(error_message, expected, message);
    return this;
  };

  function toThrowA(actual, expected, message){
    var error;
    if (typeof actual !== "function") throw new Error('functions only fool!');
    try{ actual(); }catch(e){ error = e; }
    toBeAnInstanceOf(error, expected, message);
    return this;
  };

  function toHaveProperty(actual, expected, message){
    ok(!(expected in Selector), message);
    return this;
  }

  function toNotHaveProperty(){

  }


})();
