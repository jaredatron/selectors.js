;(function() {

  module("Selector");

  test("Selector", function() {
    ok(typeof Selector === 'function', "Selector should be a function");
  });

  test("new Selector", function() {
    var error;

    ok(new Selector instanceof Selector, "Selector should be an instance of Selector");
    ok(Selector() instanceof Selector, "Selector should be an instance of Selector");

    // ROOT SELECTOR
    ok(Selector().value() === null, "new Selector().value() should === null");
    ok(Selector().toString() === "[root selector]", 'selector.toString() should === "[root selector]"');
    ok(!('parentSelector' in (Selector)), "selector should not have a parentSelector property");


    error = false;
    try{ Selector().plus(); }catch(e){ error = e; }
    ok(error instanceof TypeError, 'when plus passed a non-string it throws an error');

    var head_selector = new Selector("> .head");
    equals(head_selector.value(), "> .head", 'selector.value() should return the value given');
    equals(head_selector.fullValue(), "> .head", 'selector.fullValue() should return the value given');

    var head_logo_selector = head_selector.plus('> logo');
    equals(head_logo_selector.value(), "> logo");
    equals(head_logo_selector.fullValue(), "> .head > logo");

    var head_logo_image_selector = head_logo_selector.plus('> img');
    equals(head_logo_image_selector.value(), "> img");
    equals(head_logo_image_selector.fullValue(), "> .head > logo > img");

    var html = Selector('html');
    var body = html.def('body', 'body');
    var content = body.def('content', '> #content');
    ok(body.end === html, 'selector.def(name, value).end should === selector');
    ok(content.end.end === html, 'selector.def(name, value).def(name, value).end.end should === selector');
    ok(body.parentSelector !== html, 'selector.def(name, value).end should === selector');
    ok(content.parentSelector.parentSelector !== html, 'selector.def(name, value).def(name, value).end.end should === selector');

    equals(body.fullValue(), 'html body');
    equals(content.fullValue(), 'html body > #content');

    var content_clone = content.clone();
    ok(content !== content_clone, 'clone should not return the same object');
    equals(content.value(), content_clone.value());
    equals(content.fullValue(), content_clone.fullValue());

    equals(html.down('body').value(), body.value());
    equals(html.down('body').fullValue(), 'html body');
    equals(html.down('body').down('content').value(), content.value());
    equals(html.down('body').down('content').fullValue(), 'html body > #content');

    ok(html.down('body') !== html.down('body'), 'html.down("body") should always returns a new reference object');
    ok(html.down('body').parentSelector !== html, 'html.down("body").parentSelector should not equal html');

    equals(content.up().value(), html.value());
    equals(content.up('body').value(), body.value());

    content.remove();
    error = false;
    try{ body.down('content') }catch(e){ error = e; }
    ok(error.message === 'selector not found', 'remove should remove the selector from its parent selector');
  });

})();