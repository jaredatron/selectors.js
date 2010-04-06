;(function() {
  
  QUnit.jsDump.parsers.selector = function(selector){
    return selector.parentSelector ? '[Selector:'+selector+']' : selector.toString();
  };

  function typeOf( obj ){
    return (obj instanceof Selector) ? 'selector' : typeOf.$super.apply(this, arguments);
  }
  typeOf.$super = QUnit.jsDump.typeOf; QUnit.jsDump.typeOf = typeOf;


  expect.prototype.toBeTheSameSelectorAs = function(expected, message){
    return this.each(function(actual){
      strictEqual(actual.childSelectors, expected.childSelectors,
        "expecting '"+QUnit.jsDump.parse(actual)+"' to reference the same selector as '"+QUnit.jsDump.parse(expected)+"'");
    });
  };

  expect.prototype.toNotBeTheSameSelectorAs = function(expected, message){
    return this.each(function(actual){
      notStrictEqual(actual.childSelectors, expected.childSelectors,
        "expecting '"+actual+"' to not reference the same selector as '"+expected+"'");
    });
  };
  
  expect.prototype.toReferenceTheSameHtmlElementsAs = function(expected, message){
    return this.each(function(actual){
      deepEqual(actual.get(), expected.get(),
        "expecting '"+QUnit.jsDump.parse(actual)+"' to reference the same html elements as '"+QUnit.jsDump.parse(expected)+"'");
    });
  };
  
  expect.prototype.toNotReferenceTheSameHtmlElementsAs = function(expected, message){
    return this.each(function(actual){
      notDeepEqual(actual.get(), expected.get(),
        "expecting '"+QUnit.jsDump.parse(actual)+"' to not reference the same html elements as '"+QUnit.jsDump.parse(expected)+"'");
    });
  };

  
})();