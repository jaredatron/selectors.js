;(function() {
  var undefined;
  module("Selector");

  test("Selector", function() {
    expect(typeof Selector).toEqual('function');

    expect(new Selector).toBeAnInstanceOf(Selector);
    expect(Selector()).toBeAnInstanceOf(Selector);

    // ROOT SELECTOR
    expect(Selector().value()).toEqual(null);
    expect(Selector().toString()).toEqual("[root selector]");
    expect(!('parentSelector' in (Selector))).toBe(true, "selector should not have a parentSelector property");

    expect(Selector("> .head").value()).toEqual("> .head");
    expect(Selector("> .head").fullValue()).toEqual("> .head");
  });

  test('selector.plus', function(){
    expect(function(){ Selector().plus(); }).toThrowA(TypeError);

    var head_selector = new Selector("> .head");
    var head_logo_selector = head_selector.plus('> logo');
    expect(head_logo_selector.value()).toEqual("> logo");
    expect(head_logo_selector.fullValue()).toEqual("> .head > logo");

    var head_logo_image_selector = head_logo_selector.plus('> img');
    expect(head_logo_image_selector.value()).toEqual("> img");
    expect(head_logo_image_selector.fullValue()).toEqual("> .head > logo > img");
  });

  test('selector.def', function(){
    var html    = Selector('html'),
        body    = html.def('body', 'body'),
        content = body.def('content', '> #content');

    expect(content.end)                           .toBe(body);
    expect(content.parentSelector)                .toNotBe(body);
    expect(content.parentSelector.childSelectors) .toBe(body.childSelectors);
    expect(body.end)                              .toBe(html);
    expect(body.parentSelector)                   .toNotBe(html);
    expect(body.parentSelector.childSelectors)    .toBe(html.childSelectors);
    expect(html.end)                              .toBe(undefined);

    expect(content.value())    .toEqual('> #content');
    expect(content.fullValue()).toEqual('html body > #content');
    expect(content.toString()) .toEqual('html body > #content');
    expect(body.value())       .toEqual('body');
    expect(body.fullValue())   .toEqual('html body');
    expect(body.toString())    .toEqual('html body');

    [ [''   , 'name'    ],
      ['.'  , '.name'   ],
      ['#'  , '#name'   ],
      ['[]' , '[name]'  ],
      ['>'  , '> name'  ],
      ['>.' , '> .name' ],
      ['>#' , '> #name' ],
      ['>[]', '> [name]']
    ].forEach(function(shortcut){
      expect(Selector().def("name", shortcut[0]).value()).toEqual(shortcut[1]);
    });

  });

  test('selector.down, selector.up', function(){
    var selector = Selector();

    selector
      .def('html')
        .def('body')
          .def('content', '>.').end
        .end
      .end
    ;

    expect(function(){ selector.down(); }).toThrow('selector not found');

    expect( selector.down('html').value()       ).toEqual('html');
    expect( selector.down('html').fullValue()   ).toEqual('html');
    expect( selector.down('html').toString()    ).toEqual('html');

    expect( selector.down('html').down('body').value()     ).toEqual('body');
    expect( selector.down('html').down('body').fullValue() ).toEqual('html body');
    expect( selector.down('html').down('body').toString()  ).toEqual('html body');

    expect( selector.down('html').down('body').down('content').value()     ).toEqual('> .content');
    expect( selector.down('html').down('body').down('content').fullValue() ).toEqual('html body > .content');
    expect( selector.down('html').down('body').down('content').toString()  ).toEqual('html body > .content');

    expect( selector.down('html')                               ).toNotBe(selector.down('html'));
    expect( selector.down('html').childSelectors                ).toBe(selector.down('html').childSelectors);
    expect( selector.down('html').end                           ).toBe(selector);
    expect( selector.down('html').parentSelector                ).toNotBe(selector);
    expect( selector.down('html').parentSelector.childSelectors ).toBe(selector.childSelectors);

    var content = selector.down('html').down('body').down('content');
    expect(content.up('body').toString()).toEqual('html body');
    expect(content.up('html').toString()).toEqual('html');
    expect(content.up()      .toString()).toEqual('[root selector]');
  });

  test('selector.remove', function(){
    var p = Selector('p').def('img').end;
    p.down('img').remove();
    expect(function(){ p.down('img'); }).toThrow('selector not found');
  });

  test('selector.clone', function(){
    var content = Selector('#content'), clone = content.clone();
    expect(content !== clone    ).toBe(true, 'clone should not return the same object');
    expect(clone.value()        ).toEqual(content.value());
    expect(clone.fullValue()    ).toEqual(content.fullValue());
    expect(clone.childSelectors ).toBe(content.childSelectors);
  });

  test("selector.audit()", function() {
    var selector = Selector()
    .def('html')
      .def('body')
        .def('header', '>.').end
        .def('content', '>.').end
        .def('footer', '>.').end
      .end
    .end;

    var audit = selector.audit();
    expect( audit["html"]              ).toEqual("html");
    expect( audit["html body"]         ).toEqual("html body");
    expect( audit["html body header"]  ).toEqual("html body > .header");
    expect( audit["html body content"] ).toEqual("html body > .content");
    expect( audit["html body footer"]  ).toEqual("html body > .footer");
  });

  test('S', function(){
    expect(S('html').toString()).toEqual('html');
  });

})();