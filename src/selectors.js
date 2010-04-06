var S, Selector;

(function(global, undefined) {

  // Constants
  var VALID_SELECTOR_NAME          = /^[a-z0-9_-]+$/i,
      VALID_SELECTOR_VALUE         = /^[\sa-z0-9>&"#:=._\[\]\(\)]+$/i,
      VALID_ALT_SELECTOR_VALUE     = /^[\sa-z0-9>"#:=._\[\]\(\)&]*$/i,
      VALID_SELECTOR_QUERY         = /^[\sa-z0-9_-]+$/i,
      NAME_REGEXP                  = /{name}/g,
      SURROUNDING_WHITE_SPACE      = /(^\s*|\s*$)/g,
      SELECTOR_DEF_VALUE_SHORTHAND = {
        '.'   :'.{name}',
        '#'   :'#{name}',
        '[]'  :'[{name}]',
        '>'   :'> {name}',
        '>.'  :'> .{name}',
        '>#'  :'> #{name}',
        '>[]' :'> [{name}]'
      },
      LEADING_UNDERSCORE           = /^_/,
      TRAILING_UNDERSCORE          = /_$/,
      SELECTOR_ALT_VALUE_SHORTHAND = {
        '&.'   :'&.{name}',
        '&#'   :'&#{name}',
        '&[]'  :'&[{name}]'
      };


  // Helpers
  function extend(object, extension){
    for (var p in extension) object[p] = extension[p];
  }

  function Delegate(object){
    if (object){
      Delegate.prototype = object;
      return new Delegate;
    }
  }


  /** Selector
    *   A simple object who's toString method stores the selector's value
    *   and who's properties/values are sub selectors
   **/
  function Selector(value, super_selector){
    var selector = super_selector ? new Delegate(super_selector) : this;
    value || (value = null);
    selector.valueOf = function valueOf(){ return value; };
    return selector;
  }

  /** SelectorReference
    *   A wrapper for a selector and it's parent selector
    *
    *   new SelectorReference(selector);
    *     - return a refernce for the given selector
    *   new SelectorReference(selectorReference, name);
    *     - return a refernce for the child selector of the given name of the given selector
   **/
  function SelectorReference(selector, name, end){
    if (selector instanceof Selector){
      this.childSelectors = selector;
    }else{
      if (name){
        this.parentSelector = selector.clone();
        if (name in selector.childSelectors){
          this.childSelectors = selector.childSelectors[name];
          this.name           = name;
          this.end            = end || selector;
        }else throw new TypeError("'"+selector+"' has no child selectors matching '"+name+"'");
      }else{
        this.parentSelector = selector.parentSelector;
        this.childSelectors = selector.childSelectors;
        this.name           = selector.name;
        this.end            = end || selector.parentSelector;
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
      if (typeof name === "undefined" || VALID_SELECTOR_NAME.test(name)); else
        throw new TypeError("selector name '"+name+"' must match "+VALID_SELECTOR_NAME);

      if (!value) value = name;
      if (value in SELECTOR_DEF_VALUE_SHORTHAND) value = SELECTOR_DEF_VALUE_SHORTHAND[value];
      value = value.replace(NAME_REGEXP, name);


      this.childSelectors[name] = new Selector(value);
      return new SelectorReference(this, name);
    },

    alt: function(name, value){
      if (this.parentSelector instanceof SelectorReference); else
        throw new TypeError('you can only create alternate versions of selectors with a parent');

      if (typeof name !== "string")
        throw new TypeError('the first argument to alt must be a string');

      if (!VALID_SELECTOR_NAME.test(name))
        throw new TypeError("selector name '"+name+"' does not match "+VALID_SELECTOR_NAME);


      if (VALID_ALT_SELECTOR_VALUE.test(value)); else
        throw new TypeError("selector value '"+value+"' does not match "+VALID_ALT_SELECTOR_VALUE);

      if (typeof value === 'undefined')
        value = this.value()+'.'+name.replace(LEADING_UNDERSCORE, '').replace(TRAILING_UNDERSCORE, '');

      if (value in SELECTOR_ALT_VALUE_SHORTHAND) value = SELECTOR_ALT_VALUE_SHORTHAND[value];
      value = value.replace(NAME_REGEXP, name.replace(LEADING_UNDERSCORE, '').replace(TRAILING_UNDERSCORE, ''));

      value = value.replace(/&/g, this.value());
      if (LEADING_UNDERSCORE.test(name))  name = this.name+name;
      if (TRAILING_UNDERSCORE.test(name)) name = name+this.name;

      this.parentSelector.childSelectors[name] = new Selector(value, this.childSelectors);
      return new SelectorReference(this.parentSelector, name, this);
    },

    // turns this selector into an anonymous selector
    remove: function(){
      if (this.parentSelector){
        delete this.parentSelector.childSelectors[this.name];
        delete this.parentSelector;
        delete this.name;
      }
      return this;
    },


    down: (function() {

      function down(query){
        var names = query.replace(SURROUNDING_WHITE_SPACE,'').split(/\s+/), selectors = [this];
        while(names.length) selectors = findAllChildrenNamed(names.shift(), selectors, names.length === 0);
        if (selectors[0]){
          selectors[0].end = this;
          return selectors[0];
        }else{
          throw new Error('selector not found');
        }
      }


      function findAllChildrenNamed(name, selectors, return_first_match){
        var n, parent_selector, child_selector, child_selectors = [], matches = [];

        while(selectors.length){
          parent_selector = selectors.shift();
          for (n in parent_selector.childSelectors){
            child_selector = new SelectorReference(parent_selector, n);
            child_selectors.push(child_selector);
            if (name === n){
              if (return_first_match) return [child_selector];
              matches.push(child_selector);
            }
          }
        }

        if (child_selectors.length)
          matches = matches.concat( findAllChildrenNamed(name, child_selectors) );

        return matches;
      }

      return down;

    })(),


    // searches for and returns the deepest matching parent selector
    up: function(name){
      var n, selector = this.parentSelector;
      if (typeof name === 'undefined'){
        while(selector){
          if (!selector.parentSelector) return new SelectorReference(selector);
          selector = selector.parentSelector;
        }
      }
      // TODO refactor this now that SelectorRefernces know their name
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


  function S(query){ return S.down(query); }
  extend(S, new AnonymousSelectorReference);
  delete S.toString;
  S.def('html').def('body').end.def('head');

  global.S = S;
  global.Selector = AnonymousSelectorReference;

})(this);
