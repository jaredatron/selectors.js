;(function(jQuery, Selector) {

  if (!jQuery)   throw new Error('jquery.selectors.js requires jQuery 1.4.2 or later');
  if (!Selector) throw new Error('jquery.selectors.js requires Selectors 0.1 or later');

  var DOCUMENT = $(document);

  jQuery.prototype.extend({
    toSelector: function toSelector(){
      return new Selector(this.selector);
    },
    to: function to(query){
      return this.toSelector().to(query);
    },
    from: function from(query){
      return this.toSelector().from(query);
    },
    up: function up(query, plus){
      var selector = this.toSelector().up(query);
      if (plus) selector = selector.plus(plus);
      return newCollectionFor(selector, this.parents(selector.toString()));
    },
    down: function down(query, plus){
      var parent_selector = this.toSelector(),
          selector        = parent_selector.down(query);
      if (plus) selector = selector.plus(plus);
      return newCollectionFor(selector, this.find(selector.from(parent_selector)));
    }
  });

  function newCollectionFor(selector, collection){
    collection || (collection = selector.toString());
    collection = jQuery(collection);
    if (selector.childSelectors.prototype)
      collection = jQuery.merge(new Delegate(selector.childSelectors.prototype), collection);

    collection.toSelector = function toSelector(){ return selector; };
    return collection;
  }

  jQuery.extend(Selector.prototype, {
    get: function(){
      var selector = this, collection = newCollectionFor(selector, this.toString());
      return collection;
    },
    bind: function(types, data, fn){
      var selector = this, type;

      if (typeof data === 'function'){
        fn = data; data = undefined;
      }

      if (typeof types === 'string')
        DOCUMENT.delegate(this.toString(), types, data, function(){
          return fn.apply(newCollectionFor(selector, this), arguments);
        });
      else
        for (type in types) this.bind(type, undefined, types[type]);

      return this;
    },
    extend: function(extension){
      this.childSelectors.prototype || (this.childSelectors.prototype = new Delegate(jQuery.prototype));
      this.childSelectors.prototype.extend(extension);
      return this;
    }
  });

  ("blur focus focusin focusout load resize scroll unload click dblclick "+
   "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave "+
   "change select submit keydown keypress keyup error").split(" ").forEach(function(name) {
    Selector.prototype[name] = function(data, fn) { return this.bind(name, data, fn); };
  });







  function Delegate(object){
    if (object){
      Delegate.prototype = object;
      return new Delegate;
    }
  }

})(jQuery, Selector);