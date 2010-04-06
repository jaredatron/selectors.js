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
    if (typeof value === 'undefined') value = '';
    if (value instanceof String) value = String(value);
    if (typeof value !== 'string') throw new Error('Selector value must be a string');
    var selector = super_selector ? new Delegate(super_selector) : this;
    selector.toString = function toString(){ return value; };
    return selector;
  }
  // Selector.prototype.toString = function toString(){ return '<Selector:"'+this.valueOf()+'">'; };

  /** SelectorReference
    *   A wrapper for a selector and it's parent selector
    *
    *   new SelectorReference(value);
    *     - returns a refernce for a selector of the given value
    *
    *   new SelectorReference(selector);
    *     - returns a refernce for the given selector
    *
    *   new SelectorReference(selectorReference);
    *     - returns a clone of the given selector refernce
    *
    *   new SelectorReference(selectorReference, name);
    *     - returns a refernce for the child selector of the given name of the given selector
   **/
  function SelectorReference(selector, name, end){
    if (selector instanceof SelectorReference){
      if (name){
        this.parentSelector = selector.clone();
        if (name in selector.childSelectors && selector.childSelectors[name] instanceof Selector){
          this.childSelectors = selector.childSelectors[name];
          this.name           = name;
          this.end            = end || selector;
        }else throw new TypeError("'"+selector+"' has no child selectors named '"+name+"'");
      }else{
        this.parentSelector = selector.parentSelector;
        this.childSelectors = selector.childSelectors;
        this.name           = selector.name;
        this.end            = end || selector.end || selector.parentSelector;
      }
    }else if (selector instanceof SelectorReference){
      this.childSelectors = selector;
      this.end            = end;
    }else{
      this.childSelectors = new Selector(selector);
      this.end            = end;
    }
  }

  extend(SelectorReference.prototype, {
    //
    toString: function(){
      return this.childSelectors.toString() ? this.fullValue() : "[root selector]";
    },
    //
    value: function(value){
      if (typeof value === 'string'){
        this.childSelectors.toString = function toString(){ return value; };
        return this;
      }else{
        return this.childSelectors.toString();
      }
    },
    //
    fullValue: function(){
      // TODO replace with `return selector.from();`
      var parent_selector = this.parentSelector, value = this.value();
      while(parent_selector){
        if (parent_selector.value()) value = parent_selector.value()+' '+value;
        parent_selector = parent_selector.parentSelector;
      }
      return value;
    },
    //
    clone: function(){
      return new SelectorReference(this);
    },
    //
    parentSelectors: function(){
      var selectors = [], selector = this.parentSelector;
      while(selector){
        selectors.push(new SelectorReference(selector));
        selector = selector.parentSelector;
      }
      return selectors;
    },
    //
    childOf: function(selector){
      return (selector instanceof SelectorReference) ?
        this.parentSelectors().filter(function(parent){
          return parent.childSelectors === selector.childSelectors;
        }).length > 0
      : false;
    },
    // returns an anonymous, unamed child selector
    plus: function(value){
      if (typeof value !== 'string')
        throw new TypeError('first argument to plus must be a string');

      var selector = new SelectorReference(value);
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
    //
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
    //
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

      function findAllChildrenNamed(name, selectors, return_first_match, all_selectors){
        var n, parent_selector, child_selector, child_selectors = [], matches = [];
        all_selectors = all_selectors || [];

        while(selectors.length){
          parent_selector = selectors.shift();
          if (all_selectors.indexOf(parent_selector.childSelectors) === -1){
            all_selectors.push(parent_selector.childSelectors);

            for (n in parent_selector.childSelectors){
              if (parent_selector.childSelectors[n] instanceof Selector){
                child_selector = new SelectorReference(parent_selector, n);
                child_selectors.push(child_selector);
                if (name === n){
                  if (return_first_match) return [child_selector];
                  matches.push(child_selector);
                }
              }
            }
          }
        }

        if (child_selectors.length)
          matches = matches.concat( findAllChildrenNamed(name, child_selectors, false, all_selectors) );

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
      while(selector){
        if (selector.parentSelector && selector.parentSelector.childSelectors[name] === selector.childSelectors)
          return new SelectorReference(selector.parentSelector, name);
        selector = selector.parentSelector;
      }
      throw new Error('selector not found');
    },
    //
    to: function(query){
      var selector = (query instanceof SelectorReference) ? query : this.down(query);

      if (!selector.childOf(this)) throw new Error(selector+' is not a child of '+this);

      return (this.value() === '') ?
        selector.toString() :
        selector.toString().replace(new RegExp('^'+this+' '), '')
      ;
    },
    //
    from: function(query){
      if (this.value() === '') throw new Error('from cannot be called on a root selector');
      return (query instanceof SelectorReference) ? query.to(this) : this.up(query).to(this);
    },
    //
    audit: function(prefix, selectors, skip_gandchildren){
      var list = new SelectorsList, n, name, child_selector;
      selectors || (selectors = [this.childSelectors]);
      prefix || (prefix = '');

      for (name in this.childSelectors){
        if (this.childSelectors[name] instanceof Selector){
          child_selector = new SelectorReference(this, name);
          list[prefix+name] = child_selector.toString();

          if (selectors.indexOf(child_selector.childSelectors) === -1){
            selectors.push(child_selector.childSelectors);
            if (!skip_gandchildren)
              extend(list, child_selector.audit(prefix+name+' ', selectors));
          }else{
            if (!skip_gandchildren)
              extend(list, child_selector.audit(prefix+name+' ', selectors, true));
          }

        }
      };

      return list;
    }
  });

  // The object returned by audit
  function SelectorsList(){}
  SelectorsList.prototype.toString = function(){
    var string = '', length = 0, name, value;

    for (name in this)
      if (name !== 'toString')
        length = name.length > length ? name.length : length;

    for (name in this){
      value = this[name];
      if (name !== 'toString'){
        while(name.length < length) name += ' ';
        string += name+'     '+value+"\n";
      }
    };

    return string;
  };

  (function() {

    global.Selector = function Selector(value){ return new SelectorReference(value); };
    global.Selector.prototype = SelectorReference.prototype;
    global.Selector.InternalSelector = Selector;

    var p, ROOT_SELECTOR = global.Selector();
    global.S = function S(query){ return ROOT_SELECTOR.down(query); }
    global.S.tree = ROOT_SELECTOR.childSelectors;
    for (p in ROOT_SELECTOR) (function(p){
      if ( p !== 'toString' && p !== 'valueOf' && typeof ROOT_SELECTOR[p] === 'function')
        global.S[p] = function(){ return ROOT_SELECTOR[p].apply(ROOT_SELECTOR, arguments); }
    })(p);

    S.def('html').def('body').end.def('head');

  })();

})(this);
