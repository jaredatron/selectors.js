;(function(jQuery, Selector) {

  if (!jQuery)   throw new Error('jquery.selectors.js requires jQuery 1.4.2 or later');
  if (!Selector) throw new Error('jquery.selectors.js requires Selectors 0.1 or later');

  var DOCUMENT = $(document);

  jQuery.prototype.extend({
    toSelector: function(){
      return Selector(this.selector);
    },
    to: function to(query){
      return this.toSelector().to(query);
    },
    from: function from(query){
      return this.toSelector().from(query);
    },
    up: function up(query, when){
      var selector = this.toSelector().up(query);
      if (when) selector = selector.when(when);
      return selector.fromjQuery(
        this.parents(selector.toString())
      );
    },
    down: function down(query, when){
      var self       = this.toSelector(),
          selector   = self.down(query);
      if (when) selector = selector.when(when);
      return selector.fromjQuery(
        this.find(selector.from(self).toString())
      );
    }
  });

  jQuery.extend(Selector.prototype, {
    fromjQuery: function(collection){
      var selector = this;
      selector.extend();
      collection = jQuery.merge(create(selector.partial.prototype), jQuery(collection));
      collection.toSelector = function toSelector(){ return selector; };
      return collection;
    },
    get: function(){
      return this.fromjQuery(jQuery(this.toString()));
    },
    bind: function(types, data, fn){
      var selector = this, type;

      if (typeof data === 'function'){
        fn = data; data = undefined;
      }

      if (typeof types === 'string'){
        DOCUMENT.delegate(this.toString(), types, data, function(){
          return fn.apply(selector.fromjQuery(this), arguments);
        });
      }else{
        for (type in types) this.bind(type, undefined, types[type]);
      }

      return this;
    },
    extend: function(extension){
      this.partial.prototype || (this.partial.prototype = jQuery([]));
      if (extension) this.partial.prototype.extend(extension);
      return this;
    }
  });

  ("blur focus focusin focusout load resize scroll unload click dblclick "+
   "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave "+
   "change select submit keydown keypress keyup error").split(" ").forEach(function(name) {
    Selector.prototype[name] = function(data, fn) { return this.bind(name, data, fn); };
  });


  function create(object){
    function constructor(){};
    constructor.prototype = object;
    return new constructor;
  }

})(jQuery, Selector);