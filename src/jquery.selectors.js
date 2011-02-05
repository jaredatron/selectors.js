;(function(jQuery, Selector) {

  if (!jQuery)   throw new Error('jquery.selectors.js requires jQuery 1.5 or later');
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
      return selector.jQuery(this.parents(selector.toString()));
    },
    down: function down(query, when){
      var self       = this.toSelector(),
          selector   = self.down(query);
      if (when) selector = selector.when(when);
      return selector.jQuery(this.find(selector.from(self).toString()));
    }
  });

  jQuery.extend(Selector.prototype, {
    jQuery: function jQuerySubclassWrapper(){
      var
        selector = this,
        sub      = selector.partial.jQuery;

      if (!sub){
        sub = selector.partial.jQuery = jQuery.sub();
        sub.fn.toSelector = function toSelector(){
          return selector.clone();
        };
      }

      return sub.apply(this, arguments);
    },
    get: function(){
      return this.jQuery(this.toString());
    },
    bind: function(types, data, fn){
      var selector = this, type;

      if (typeof data === 'function'){
        fn = data; data = undefined;
      }

      if (typeof types === 'string'){
        DOCUMENT.delegate(this.toString(), types, data, function(){
          return fn.apply(selector.jQuery(this), arguments);
        });
      }else{
        for (type in types) this.bind(type, undefined, types[type]);
      }

      return this;
    },
    extend: function(extension){
      if (extension) this.jQuery().constructor.fn.extend(extension);
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