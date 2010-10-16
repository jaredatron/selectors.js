function Selector(value){
  return new Selector.Selector(undefined, new Selector.Node(value));
}

;(function() {

  var SPACES                   = /\s*/,
      VALID_SELECTOR_NAME      = /^[a-z0-9_-]+$/i,
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

  window.Selector.Selector = Selector;
  window.Selector.Node     = Node;
  window.Selector.prototype = Selector.prototype;

  function Node(value){
    this.value = value || '';
    this.nodes = {};
  }
  extend(Node.prototype, {
    toString: function(){
      return '<Node: "'+this.value+'">';
    },
    tree: function(){
      var tree  = {},
          nodes = this.nodes
          name;
      for (name in nodes) tree[name+' "'+nodes[name].value+'"'] = nodes[name].tree();
      return tree;
    }
  })

  function Selector(parent, name, previous){
    if (parent){
      this.node     = parent.node.nodes[name];
      if (this.node instanceof Node); else throw 'selector "'+name+'" not found';
      this.parent   = parent; // Selector
      this.previous = previous;

    // Handles root selector reference case
    }else{
      this.node     = name;
    }
  }
  extend(Selector.prototype, {
    toString: function(){
      if (this.parent){
        var parentValue = this.parent.toString();
        return parentValue ? parentValue+' '+this.node.value : this.node.value;
      }else{
        return this.node.value;
      }
    },

    down: (function() {

      return function(name, value){
        var selector;
        if (name); else throw 'invalid selector name "'+name+'"';

        if (arguments.length === 2) {
          if (VALID_SELECTOR_NAME.test(name)); else throw 'invalid selector name "'+name+'"';
          if (name in this.node.nodes) throw 'selector "'+name+'" already defined';

          value = value.replace(SPACES,'');
          if (value in SELECTOR_VALUE_SHORTHAND) value = SELECTOR_VALUE_SHORTHAND[value];
          value = value.replace(NAME_REGEXP, name);

          this.node.nodes[name] = new Node(value);
          return new Selector(this, name, this);
        }

        selector = findShallowest(name, this);
        if (selector); else throw new Error('selector "'+name+'" not found');
        selector.previous = this;
        return selector;
      }

      function findShallowest(name, selector){
        var names = name.replace(SURROUNDING_WHITE_SPACE,'').split(/\s+/), selectors = [selector];
        while(names.length) selectors = findAll (names.shift(), selectors, names.length === 0);
        return selectors[0];
      }

      function findAll(name, selectors, returnFirstMatch){
        var selector, n, matches = [], childSelector, childSelectors = [];

        while(selector = selectors.shift()){
          for (n in selector.node.nodes){
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


    end: function(){
      return this.previous;
    },

    tree: function(){
      return this.node.tree();
    }
  });



  // Helpers

  function extend(object, extension){
    for (var p in extension) object[p] = extension[p];
  }

  function create(object){
    function constructor(){};
    constructor.prototype = object;
    return new constructor;
  }

})();