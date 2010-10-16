;(function() {

  var 
      VALID_SELECTOR_NAME = /^[a-z0-9_-]+$/i;
      

  Selector = function Selector(value){
    return new NodeReference(undefined, new Node(value));
  };
  Selector.prototype = NodeReference.prototype;

  function Node(value){
    this.value = value || '';
    this.nodes = {};
  }
  Node.prototype.toString = function(){
    return '<Node: "'+this.value+'">';
  }

  function NodeReference(parent, name, previous){
    if (parent){
      this.node     = parent.node.nodes[name];
      if (this.node instanceof Node); else throw 'selector "'+name+'" not found';
      this.parent   = parent; // NodeReference
      this.previous = previous;

    // Handles root selector reference case
    }else{
      this.node     = name;
    }
  }
  extend(NodeReference.prototype, {
    toString: function(){
      if (this.parent){
        var parentValue = this.parent.toString();
        return parentValue ? parentValue+' '+this.node.value : this.node.value;
      }else{
        return this.node.value;
      }
    },
    down: function(name, value){
      if (arguments.length === 2) {
        if (VALID_SELECTOR_NAME.test(name)); else throw 'selector names cannot have spaces';
        this.node.nodes[name] = new Node(value);
      }
      return new NodeReference(this, name, this);
    },
    end: function(){
      return this.previous;
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