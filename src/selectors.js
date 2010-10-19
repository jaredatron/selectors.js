;(function(window, undefined) {

  var _Selector                = window.Selector,
      _S                       = window.S,
      SPACES                   = /\s*/,
      VALID_SELECTOR_NAME      = /^[a-z0-9_-]+$/i,
      VALID_SELECTOR_QUERY     = /^[ a-z0-9_-]+$/i,
      SURROUNDING_WHITE_SPACE  = /(^\s*|\s*$)/g,
      NAME_REGEXP              = /{name}/g,
      SELECTOR_VALUE_SHORTHAND = {
        '.'   :'.{name}',
        '#'   :'#{name}',
        '[]'  :'[{name}]',
        '>'   :'> {name}',
        '>.'  :'> .{name}',
        '>#'  :'> #{name}',
        '>[]' :'> [{name}]'
      };

  function Partial(value, superPartial){
    if (superPartial){
      this.value = superPartial.value + value;
      this.partials = superPartial.partials;
    }else{
      this.value = value || '';
      this.partials = {};
    }
  }
  extend(Partial.prototype, {
    toString: function(){
      return this.value;
    },
    tree: function(){
      var tree  = {},
          partials = this.partials,
          name;
      for (name in partials) tree[name+' "'+partials[name].value+'"'] = partials[name].tree();
      return tree;
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
      if (this.parent){
        var parentValue = this.parent.toString();
        return parentValue ? parentValue+' '+this.partial.value : this.partial.value;
      }else{
        return this.partial.value;
      }
    },

    down: (function() {

      return function(name, value){
        var selector;
        if (name); else throw 'selector cannot be blank';

        if (arguments.length === 2) {
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
        var names = name.replace(SURROUNDING_WHITE_SPACE,'').split(/\s+/), selectors = [selector];
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
            matches = parentsNamed(names.pop(), this);

        while(names.length){
          name = names.pop();
          matches = matches.filter(function(selector){
            return parentsNamed(name, selector, true) === true;
          });
        }

        if (matches.length === 0) throw 'selector "'+query+'" not found';

        return matches.shift().clone();
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
      return new Selector(this.parent, new Partial(value, this.partial), this);
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
    }
  });


  function RootSelector(value){
    return new Selector(new Partial(value));
  }

  window.Selector = function Selector(value){
    return new RootSelector(value);
  };
  window.Selector.prototype = Selector.prototype;

  function S(){
    return S.root.down.apply(S.root, arguments);
  };
  S.root = window.Selector();
  S('html','html').down('body','body');
  window.S = S;




  // Helpers

  function extend(object, extension){
    for (var p in extension) object[p] = extension[p];
  }

  function create(object){
    function constructor(){};
    constructor.prototype = object;
    return new constructor;
  }

})(this);