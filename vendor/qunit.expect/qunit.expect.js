function expect(actual){
  if (this instanceof expect); else return new expect(actual);
  this.actual = actual;
};
(function() {

  [
    ['to equal',             'toEqual',          equals          ],
    ['to eot equal',         'toNotEqual',       notEqual        ],
    ['to be',                'toBe',             strictEqual     ],
    ['to no be',             'toNotBe',          notStrictEqual  ],
    ['to deep equal',        'toDeepEqual',      deepEqual       ],
    ['to not deep equal',    'toNotDeepEqual',   notDeepEqual    ],
    ['to be an instance of', 'toBeAnInstanceOf', toBeAnInstanceOf],
    ['to throw',             'toThrow',          toThrow         ],
    ['to throw a',           'toThrowA',         toThrowA        ]
  ].forEach(function(data){
    expect.prototype[data[1]] = function(expected, message){
      message = message ? message : '(expected: '+QUnit.jsDump.parse(this.actual)+' '+data[1]+' '+QUnit.jsDump.parse(expected)+'  =====';
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


})();
