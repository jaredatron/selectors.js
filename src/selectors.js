;(function(window, undefined) {

  var _Selector                = window.Selector,
      _S                       = window.S,
      SPACES                   = /\s*/,
      COMMA                    = /\s*,\s*/,
      VALID_SELECTOR_NAME      = /^[a-z0-9_-]+$/i,
      VALID_SELECTOR_QUERY     = /^[ a-z0-9_-]+$/i,
      SURROUNDING_WHITE_SPACE  = /^[\s\n]*|[\s\n]*$/g,
      NAME_REGEXP              = /{name}/g,
      SELECTOR_VALUE_SHORTHAND = {
        ''    :'{name}',
        '.'   :'.{name}',
        '#'   :'#{name}',
        '[]'  :'[{name}]',
        '>'   :'> {name}',
        '>.'  :'> .{name}',
        '>#'  :'> #{name}',
        '>[]' :'> [{name}]'
      },
      ROOT_SELECTOR;

  function Partial(value){
    this.value = strip(value || '');
    this.partials = {};
  }
  extend(Partial.prototype, {
    toString: function(){
      return this.value;
    },
    tree: (function() {

      function tree(nested){
        var
          partial  = this,
          partials = partial.partials,
          tree     = {},
          subtree  = (!nested && partial.value) ? tree['`'+partial.value+'`'] = {} : tree,
          name;

        for (name in partials)
          subtree[name+' `'+partials[name].value+'`'] = partials[name].tree(true);

        if (!nested) tree.toString = function toString(){ return treeToString(null, partial); };

        return tree;
      }

      function treeToString(name, partial, prefix){
        var
          root      = name === null,
          value     = root || !prefix ? partial.toString() : prefix+' '+partial.toString(),
          names     = [name||''],
          selectors = [value],
          partials  = partial.partials,
          data, string, i;

        for (name in partials) {
          data = treeToString(name, partials[name], value);
          names = names.concat(data[0]);
          selectors = selectors.concat(data[1]);
        }

        return root ? dataToString(names, selectors) : [names, selectors];
      }

      function dataToString(names, selectors){
        var
          string = [],
          length = 0,
          name, i, l;

        for (i=0; i < names.length; i++) {
          l = names[i].length;
          length = l > length ? l : length;
        }

        for (i=0; i < names.length; i++) {
          name = names[i];
          while(name.length < length) name += ' ';
          if (selectors[i]) string.push( name+' : '+selectors[i] );
        }

        return string.join("\n");
      }

      return tree;
    })(),
    clone: function(value){
      var clone = new Partial(value);
      clone.partials = this.partials;
      return clone;
    }
  });


  /* A refernce to a Selector Partial
   * Usage:
   *
   *   new Selector( selector [Selector] )
   *   - return a clone of the given selector
   *
   *   new Selector( root [Partial] )
   *   - returns a reference to a root Partial
   *
   *   new Selector( parent [Selector], name [String], previous [Selector] )
   *   - returns a reference to the parents child partial named the given name
   *
   *   new Selector( parent [Selector], partial [Partial], previous [Selector] )
   *   - returns a reference to a bastard child partial of the given parent
   *
   */
  function Selector(parent, name, previous){
    if (parent instanceof Partial){
      this.partial = parent;

    }else{
      if (name){
        // create a reference to a bastard
        if (name instanceof Partial){
          this.name     = null;
          this.partial     = name;

        // create a reference to the partial named...
        }else{
          this.name     = name;
          this.partial     = parent.partial.partials[name];
          if (this.partial instanceof Partial); else throw 'selector "'+name+'" not found';
        }
        this.parent   = parent;
        this.previous = previous;

      // clone selector
      }else{
        this.parent = parent.parent;
        this.name   = parent.name;
        this.partial   = parent.partial;
      }
    }
  }
  extend(Selector.prototype, {
    toString: function(){
      var value = this.partial.value, parentValues;
      if (this.parent); else return this.partial.value;
      return joinSelectors(this.parent.toString(), this.partial.value);

      // parentValues = this.parent.toString().split(/\s*,\s*/);
      // if (parentValues.length === 0 || (parentValues.length === 1 && parentValues[0] === "")) return value;
      // return parentValues.map(function(parentValue){ return parentValue+' '+value }).join(', ');
    },

    down: (function() {

      return function(name, value){
        var selector;
        if (name); else throw 'selector cannot be blank';

        if (arguments.length === 2) {
          value = String(value);
          if (VALID_SELECTOR_NAME.test(name)); else throw 'invalid selector name "'+name+'"';
          if (name in this.partial.partials) throw 'selector "'+name+'" already defined';

          value = value.replace(SPACES,'');
          if (value in SELECTOR_VALUE_SHORTHAND) value = SELECTOR_VALUE_SHORTHAND[value];
          value = value.replace(NAME_REGEXP, name);

          this.partial.partials[name] = new Partial(value);
          return new Selector(this, name, this);
        }

        selector = findShallowest(name, this);
        if (selector); else throw new Error('selector "'+name+'" not found');
        selector.previous = this;
        return selector;
      };

      function findShallowest(name, selector){
        var names = strip(name).split(/\s+/), selectors = [selector];
        while(names.length) selectors = findAll (names.shift(), selectors, names.length === 0);
        return selectors[0];
      }

      function findAll(name, selectors, returnFirstMatch){
        var selector, n, matches = [], childSelector, childSelectors = [];

        while(selectors.length){
          selector = selectors.shift();
          for (n in selector.partial.partials){
            childSelector = new Selector(selector, n);
            childSelectors.push(childSelector);
            if (n === name) {
              if (returnFirstMatch) return [childSelector];
              matches.push(childSelector);
            }
          }
        }

        if (childSelectors.length) matches = matches.concat(findAll(name, childSelectors));

        return matches;
      }

    })(),

    up: (function() {

      return function(query){
        if (query); else return this.parent.clone();

        if (VALID_SELECTOR_QUERY.test(query)); else throw 'invalid selector query "'+query+'"';

        var name,
            names = query.split(/\s+/),
            matches = parentsNamed(names.pop(), this),
            match;

        while(names.length){
          name = names.pop();
          matches = matches.filter(function(selector){
            return parentsNamed(name, selector, true) === true;
          });
        }

        if (matches.length === 0) throw 'selector "'+query+'" not found';

        match = matches.shift().clone();
        match.previous = this;
        return match;
      };

      function parentsNamed(name, selector, first){
        var parents = [], parent = selector.parent;
        while(parent){
          if (parent.name == name){
            if (first) return true;
            parents.push(parent);
          }
          parent = parent.parent;
        }
        return parents;
      }

    })(),

    to: function(query){
      var selector = (query instanceof Selector) ? query : this.down(query);

      if (!selector.childOf(this)) throw '"'+selector+'" is not a child of "'+this+'"';

      return (this.toString() === '') ?
        selector.toString() :
        selector.toString().replace(new RegExp('^'+this+' '), '')
      ;
    },

    from: function(query){
      if ('parent' in this); else throw 'from cannot be called on a root selector';
      if (query); else throw 'selector cannot be blank';
      if (query instanceof Selector) return query.to(this);
      return this.up(query).to(this);
    },

    when: function(value){
      if (typeof value !== 'string') throw new TypeError('first argument to "when" must be a string');
      var newValue = joinSelectors(this.partial.value, value, true),
          selector = this.clone();
      selector.partial = this.partial.clone(newValue);
      selector.previous = this;
      return selector;
    },

    plus: function(value){
      if (typeof value !== 'string') throw new TypeError('first argument to "plus" must be a string');
      var newValue = joinSelectors(this.partial.value, value, false),
          selector = this.clone();
      selector.partial = this.partial.clone(newValue);
      selector.previous = this;
      return selector;
    },

    end: function(){
      return this.previous || this;
    },

    tree: function(){
      return this.partial.tree();
    },

    clone: function(){
      return new Selector(this);
    },

    childOf: function(parent){
      if (parent instanceof Selector); else return false;
      var selector = this;
      while(selector){
        if (parent.partial === selector.partial) return true;
        selector = selector.parent;
      }
      return false;
    },

    selectors: function(){
      var
        selectors = [],
        partials  = this.partial.partials,
        name;

      for (name in partials)
        selectors.push(new Selector(this, name, this));

      return selectors;
    }
  });


  function RootSelector(value){
    return new Selector(new Partial(value));
  }

  window.Selector = function Selector(value){
    return new RootSelector(value);
  };
  window.Selector.prototype = Selector.prototype;
  window.Selector.Partial = Partial;
  window.Selector.Selector = Selector;

  ROOT_SELECTOR = window.Selector();
  function S(name){
    return arguments.length ? ROOT_SELECTOR.down(name) : ROOT_SELECTOR;
  };
  S().down('html','html').down('body','body');
  window.S = S;




  // Helpers

  function extend(object, extension){
    for (var p in extension) object[p] = extension[p];
  }

  function strip(string){
    return string.replace(SURROUNDING_WHITE_SPACE,'');
  }

  function joinSelectors(parent, child, noSpace){
    if (parent); else return child;
    var parentValues = parent.split(COMMA).map(strip),
        childValues  =  child.split(COMMA).map(strip),
        values       = [],
        space        = noSpace ? '' : ' ';

    parentValues.forEach(function(left){
      childValues.forEach(function(right){
        values.push(left+space+right);
      });
    });

    return values.join(', ');
  }

})(this);