var S, Selector;

(function(global, undefined) {

  // Constants
  var VALID_SELECTOR_NAME  = /^[a-zA-Z0-9_-]+$/,
      VALID_SELECTOR_QUERY = /^[a-zA-Z0-9\s_-]+$/,
      SELECTOR_DEF_VALUE_SHORTHAND = {
        '.'   :'.{name}',
        '#'   :'#{name}',
        '[]'  :'[{name}]',
        '>'   :'> {name}',
        '>.'  :'> .{name}',
        '>#'  :'> #{name}',
        '>[]' :'> [{name}]'
      };

  // Helpers
  function extend(object, extension){
    for (var p in extension) object[p] = extension[p];
  }
  

  /** Selector
    *   A simple object who's toString method stores the selector's value
    *   and who's properties/values are sub selectors
   **/
  function Selector(value){
    value || (value = null);
    this.valueOf = function valueOf(){ return value; };
  }

  /** SelectorReference
    *   A wrapper for a selector and it's parent selector
    *
    *   new SelectorReference(selector);
    *     - return a refernce for the given selector
    *   new SelectorReference(selectorReference, name);
    *     - return a refernce for the child selector of the given name of the given selector
   **/
  function SelectorReference(selector, name){
    if (selector instanceof Selector){
      this.childSelectors = selector;
    }else{
      if (name){
        this.parentSelector = selector.clone();
        if (name in selector.childSelectors)
          this.childSelectors = selector.childSelectors[name];
        else
          throw new TypeError('"'+selector+'" has no child selectors matching "'+name+'"');
      }else{
        this.parentSelector = selector.parentSelector;
        this.childSelectors = selector.childSelectors;
      }
    }
  }

  function AnonymousSelectorReference(value){
    return new SelectorReference(new Selector(value));
  }
  AnonymousSelectorReference.prototype = SelectorReference.prototype;


  extend(SelectorReference.prototype, {
    toString: function(){
      return this.childSelectors.valueOf() ? this.fullValue() : "[root selector]";
    },
    value: function(value){
      if (typeof value === 'string'){
        this.childSelectors.toString = function toString(){ return value; };
        return this;
      }else{
        return this.childSelectors.valueOf();
      }
    },
    fullValue: function(){
      // TODO replace with `return selector.from();`
      var parent_selector = this.parentSelector, value = this.value();
      while(parent_selector){
        if (parent_selector.value()) value = parent_selector.value()+' '+value;
        parent_selector = parent_selector.parentSelector;
      }
      return value;
    },
    clone: function(){
      return new SelectorReference(this);
    },

    // returns an anonymous, unamed child selector
    plus: function(value){
      if (typeof value !== 'string')
        throw new TypeError('first argument to plus must be a string');

      var selector = new AnonymousSelectorReference(value);
      selector.parentSelector = this.clone();
      selector.end = this;
      return selector;
    },
    // defines a named child selector and returns it
    def: function(name, value){
      if (VALID_SELECTOR_NAME.test(name)); else
        throw new TypeError('selector name "'+name+'" must match '+VALID_SELECTOR_NAME);

      if (!value) value = name;
      if (value in SELECTOR_DEF_VALUE_SHORTHAND) value = SELECTOR_DEF_VALUE_SHORTHAND[value];
      value = value.replace(/{name}/g, name);

      var child_selector = this.plus(value);
      this.childSelectors[name] = child_selector.childSelectors;
      return child_selector;
    },
    
    // turns this selector into an anonymous selector
    remove: function(){
      if (this.parentSelector){
        for (var name in this.parentSelector.childSelectors)
          if (this.parentSelector.childSelectors[name] === this.childSelectors)
            delete this.parentSelector.childSelectors[name];
        delete this.parentSelector;
      }
      return this;
    },


    // searches for and returns the shallowest matching child selector
    down: function(name){
      if (name in this.childSelectors); else throw new Error('selector not found');
      var child = new SelectorReference(this, name);
      child.end = this;
      return child;
    },
    // searches for and returns the deepest matching parent selector
    up: function(name){
      var n, selector = this.parentSelector;
      if (typeof name === 'undefined'){
        while(selector){
          if (!selector.parentSelector) return new SelectorReference(selector);
          selector = selector.parentSelector;
        }
      }
      while(selector){
        if (selector.parentSelector)
          for (n in selector.parentSelector.childSelectors)
            if (selector.parentSelector.childSelectors[n] === selector.childSelectors) 
              if (name === n) return new SelectorReference(selector.parentSelector, name);
        selector = selector.parentSelector;
      }
      throw new Error('selector not found');
    },
    


    audit: function(prefix){
      var list = {}, name, childSelector, childSelectorList, n;
      prefix || (prefix = '');

      for (name in this.childSelectors){
        if (this.childSelectors[name] instanceof Selector){
          childSelector     = new SelectorReference(this, name);
          list[prefix+name] = childSelector.fullValue();
          extend(list, childSelector.audit(prefix+name+' '));
        }
      };
      return list;
    },

  });

  
  function S(name){ return S.down(name); }
  extend(S, new AnonymousSelectorReference);
  S.def('html').def('body');

  global.S = S;
  global.Selector = AnonymousSelectorReference;

})(this);
