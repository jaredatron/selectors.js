;(function() {
  QUnit.jsDump.parsers.selector = function(selector){
    return selector.parentSelector ? '[Selector:'+selector+']' : selector.toString();
  };

  function typeOf( obj ){
    return (obj instanceof Selector) ? 'selector' : typeOf.$super.apply(this, arguments);
  }
  typeOf.$super = QUnit.jsDump.typeOf; QUnit.jsDump.typeOf = typeOf;

  expect.prototype.toBeASelector = function(message){
    return this.each(function(actual){
      expect(actual.childSelectors).toBeAnInstanceOf(Selector, "expecting '"+QUnit.jsDump.parse(actual)+"' to be a Selector");
    });
  };

  expect.prototype.toBeTheSameSelectorAs = function(expected, message){
    if (expected instanceof Selector); else throw new Error('toBeTheSameSelectorAs requies that the given object be a Selector');
    return this.each(function(actual){
      if (actual instanceof Selector); else throw new Error('toBeTheSameSelectorAs requies that the actual object be a Selector');
      strictEqual(actual.childSelectors, expected.childSelectors,
        "expecting '"+QUnit.jsDump.parse(actual)+"' to reference the same selector as '"+QUnit.jsDump.parse(expected)+"'");
    });
  };

  expect.prototype.toNotBeTheSameSelectorAs = function(expected, message){
    if (expected instanceof Selector); else throw new Error('toNotBeTheSameSelectorAs requies that the given object be a Selector');
    return this.each(function(actual){
      if (actual instanceof Selector); else throw new Error('toNotBeTheSameSelectorAs requies that the actual object be a Selector');
      notStrictEqual(actual.childSelectors, expected.childSelectors,
        "expecting '"+actual+"' to not reference the same selector as '"+expected+"'");
    });
  };
  
  expect.prototype.toReferenceTheSameHtmlElementsAs = function(expected, message){
    if (expected instanceof jQuery); else throw new Error('toReferenceTheSameHtmlElementsAs requies that the given object be a jQuery collection');
    return this.each(function(actual){
      if (actual instanceof jQuery); else throw new Error('toReferenceTheSameHtmlElementsAs requies that the actual object be a jQuery collection');
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