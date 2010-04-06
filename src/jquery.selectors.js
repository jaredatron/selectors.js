;(function(jQuery, Selector) {

  if (!jQuery)   throw new Error('jquery.selectors.js requires jQuery 1.4.2 or later');
  if (!Selector) throw new Error('jquery.selectors.js requires Selectors 0.1 or later');

  var DOCUMENT = $(document);

  $.fn.extend({
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

      var collection = this.parents(selector.toString());
      collection.toSelector = function toSelector(){ return selector; };
      return collection;
    },
    down: function down(query, plus){
      var parent_selector = this.toSelector(),
          selector        = parent_selector.down(query);
      if (plus) selector = selector.plus(plus);

      var collection = this.find(selector.from(parent_selector));
      collection.toSelector = function toSelector(){ return selector; };
      return collection;
    }
  });

  $.extend(Selector.prototype, {
    get: function(){
      var selector = this, collection = $(this.toString());
      collection.toSelector = function toSelector(){ return selector; };
      return collection;
    },
    bind: function(types, data, handler){
      var event_name, selector = this.fullValue();

      if (typeof types === 'string')
        DOCUMENT.delegate(selector, types, data, handler);
      else
        for (event_name in types)
          DOCUMENT.delegate(selector, event_name, types[event_name]);

      return this;
    }
  });

})(jQuery, Selector);