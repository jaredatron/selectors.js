;(function() {
  var undefined;
  module("Selector");

  test("Selector", function() {
    expect(Selector    ).toBeAnInstanceOf(Function);
    expect(new Selector).toBeAnInstanceOf(Selector);
    expect(Selector()  ).toBeAnInstanceOf(Selector);

    expect(Selector())
      .toNotHaveProperty('parentSelector')
      .toNotHaveProperty('name')
      .toNotHaveProperty('end');
    expect(Selector().value()             ).toEqual(null);
    expect(Selector().toString()          ).toEqual("[root selector]");
    expect(Selector("> .head").value()    ).toEqual("> .head");
    expect(Selector("> .head").fullValue()).toEqual("> .head");
  });

  test('selector.plus', function(){
    expect(function(){ Selector().plus(); }).toThrowA(TypeError);

    var header = new Selector("> .header"),
        logo   = header.plus('> logo'),
        image  = logo.plus('> img');

    expect(logo.value()     ).toEqual("> logo");
    expect(logo.fullValue() ).toEqual("> .header > logo");
    expect(logo.end         ).toBe(header);
    expect(image.value()    ).toEqual("> img");
    expect(image.fullValue()).toEqual("> .header > logo > img");
    expect(image.end        ).toBe(logo);
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

  test('selector.alt', function(){
    var dog = Selector('html').def('dog','>.');

    expect(function(){ Selector().alt(); }).toThrow('you can only create alternate versions of selectors with a parent');
    expect(function(){ dog.alt();        }).toThrow('the first argument to alt must be a string');

    var n, BAD_CHARACTERS = new String('>.#^!@#$%*()');
    for (n in BAD_CHARACTERS)
      expect(Function('Selector().def("div").alt("'+BAD_CHARACTERS[n]+'");'))
        .toThrow('selector name "'+BAD_CHARACTERS[n]+'" does not match /^[a-z0-9_-]+$/i');

    expect( dog.alt('red_').toString() ).toEqual('html > .dog.red');
    expect( dog.alt('red_').end ).toBe(dog);

    [['&.',      '> .dog.red' ],
     ['&#',      '> .dog#red' ],
     ['&[]',     '> .dog[red]']].forEach(function(data){
      expect( dog.alt('red_', data[0]).value() ).toEqual(data[1]);
    });

    expect( Selector().def('dog','>.').alt('red'  ).name ).toEqual('red');
    expect( Selector().def('dog','>.').alt('red_' ).name ).toEqual('red_dog');
    expect( Selector().def('dog','>.').alt('_red_').name ).toEqual('dog_red_dog');
    expect( Selector().def('dog','>.').alt('_red' ).name ).toEqual('dog_red');
  });

  test('selector.down, selector.up', function(){
    var selector = Selector();

    selector
      .def('html')
        .def('body')
          .def('header', '>.')
            .def('content', '>.')
            .end
          .end
          .def('content', '>.')
            .def('profile', '>.')
              .def('content', '>.')
              .end
            .end
          .end
        .end
      .end
    ;

    expect(function(){ selector.down();       }).toThrow('query is undefined');
    expect(function(){ selector.down('nope'); }).toThrow('selector not found');

    expect(selector.down('html').value()       ).toEqual('html');
    expect(selector.down('html').fullValue()   ).toEqual('html');
    expect(selector.down('html').toString()    ).toEqual('html');

    expect(selector.down('html').down('body').value()     ).toEqual('body');
    expect(selector.down('html').down('body').fullValue() ).toEqual('html body');
    expect(selector.down('html').down('body').toString()  ).toEqual('html body');

    expect(selector.down('html').down('body').down('content').value()     ).toEqual('> .content');
    expect(selector.down('html').down('body').down('content').fullValue() ).toEqual('html body > .content');
    expect(selector.down('html').down('body').down('content').toString()  ).toEqual('html body > .content');

    expect(selector.down('html')                               ).toNotBe(selector.down('html'));
    expect(selector.down('html').childSelectors                ).toBe(selector.down('html').childSelectors);
    expect(selector.down('html').end                           ).toBe(selector);
    expect(selector.down('html').parentSelector                ).toNotBe(selector);
    expect(selector.down('html').parentSelector.childSelectors ).toBe(selector.childSelectors);

    var content = selector.down('html').down('body').down('content');
    expect(content.up('body').toString()).toEqual('html body');
    expect(content.up('html').toString()).toEqual('html');
    expect(content.up()      .toString()).toEqual('[root selector]');

    expect(selector.down('content').toString()                 ).toEqual('html body > .content');
    expect(selector.down('body content').toString()            ).toEqual('html body > .content');
    expect(selector.down('header content').toString()          ).toEqual('html body > .header > .content');
    expect(selector.down('profile content').toString()         ).toEqual('html body > .content > .profile > .content');
    expect(selector.down('content content').toString()         ).toEqual('html body > .content > .profile > .content');
    expect(selector.down('body profile content').toString()    ).toEqual('html body > .content > .profile > .content');
    expect(selector.down(' body  ').down('content').toString() ).toEqual('html body > .content');
    expect(selector.down(' header').down('content').toString() ).toEqual('html body > .header > .content');
    expect(selector.down('profile').down('content').toString() ).toEqual('html body > .content > .profile > .content');

    expect(function(){ selector.down('header profile'); }).toThrow('selector not found');
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
    expect(clone.parentSelector ).toBe(content.parentSelector);
    expect(clone.name           ).toEqual(content.name);
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