;(function() {
  var undefined;

  QUnit.jsDump.parsers.selector = function(selector){
    return selector.parentSelector ? '[Selector:'+selector+']' : selector.toString();
  };

  function typeOf( obj ){
    return (obj instanceof Selector) ? 'selector' : typeOf.$super.apply(this, arguments);
  }
  typeOf.$super = QUnit.jsDump.typeOf; QUnit.jsDump.typeOf = typeOf;

  expect.prototype.toBeTheSameSelectorAs = function(expected, message){
    return this.each(function(actual){
      strictEqual(actual.childSelectors, expected.childSelectors,
        "expecting '"+actual+"' to reference the same selector as '"+expected+"'");
    });
  };

  expect.prototype.toNotBeTheSameSelectorAs = function(expected, message){
    return this.each(function(actual){
      notStrictEqual(actual.childSelectors, expected.childSelectors,
        "expecting '"+actual+"' to not reference the same selector as '"+expected+"'");
    });
  };

  module("Selector");

  test("Selector", function() {
    expect(Selector    ).toBeA(Function);
    expect(new Selector).toBeA(Selector);
    expect(Selector()  ).toBeA(Selector);

    expect(Selector())
      .toNotHaveProperty('parentSelector')
      .toNotHaveProperty('name');
    expect(Selector().end                 ).toBe(undefined);
    expect(Selector().value()             ).toEqual('');
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

    expect(content.end)            .toBe(body);
    expect(content.parentSelector) .toNotBe(body);
    expect(content.parentSelector) .toBeTheSameSelectorAs(body);
    expect(body.end)               .toBe(html);
    expect(body.parentSelector)    .toNotBe(html);
    expect(body.parentSelector)    .toBeTheSameSelectorAs(html);
    expect(html.end)               .toBe(undefined);

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
        .toThrow("selector name '"+BAD_CHARACTERS[n]+"' does not match /^[a-z0-9_-]+$/i");

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

    // testing selector inheritance
    var dead_dog = dog.alt('dead_');

    bone = dog.def('bone');
    expect(             dog.down('bone')).toBeTheSameSelectorAs(bone);
    expect(        dead_dog.down('bone')).toBeTheSameSelectorAs(bone);

    var huge_dog = dog.alt('huge_');
    expect(huge_dog             ).toNotBeTheSameSelectorAs(dog);
    expect(huge_dog.down('bone')).toBeTheSameSelectorAs(bone);

    var living_dead_dog = dead_dog.alt('living');
    expect( living_dead_dog.down('bone')).toBeTheSameSelectorAs(bone);

    var leash = dog.def('leash');
    expect(            dog.down('leash')).toBeTheSameSelectorAs(leash);
    expect(       huge_dog.down('leash')).toBeTheSameSelectorAs(leash);
    expect(       dead_dog.down('leash')).toBeTheSameSelectorAs(leash);
    expect(living_dead_dog.down('leash')).toBeTheSameSelectorAs(leash);

    var rotting_meat = dead_dog.def('rotting-meat');
    expect(function(){      dog.down('rotting-meat'); }).toThrow('selector not found');
    expect(function(){ huge_dog.down('rotting-meat'); }).toThrow('selector not found');
    expect(            dead_dog.down('rotting-meat')   ).toBeTheSameSelectorAs(rotting_meat);
    expect(     living_dead_dog.down('rotting-meat')   ).toBeTheSameSelectorAs(rotting_meat);

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

    expect(selector.down('html').value()        ).toEqual('html');
    expect(selector.down('html').fullValue()    ).toEqual('html');
    expect(selector.down('html').toString()     ).toEqual('html');
    expect(selector.down('html')                ).toNotBe(selector.down('html'));
    expect(selector.down('html')                ).toBeTheSameSelectorAs(selector.down('html'));
    expect(selector.down('html').end            ).toBe(selector);
    expect(selector.down('html').parentSelector ).toNotBe(selector);
    expect(selector.down('html').parentSelector ).toBeTheSameSelectorAs(selector);

    expect(selector.down('body').value()        ).toEqual('body');
    expect(selector.down('body').fullValue()    ).toEqual('html body');
    expect(selector.down('body').toString()     ).toEqual('html body');

    expect(selector.down('content').value()     ).toEqual('> .content');
    expect(selector.down('content').fullValue() ).toEqual('html body > .content');
    expect(selector.down('content').toString()  ).toEqual('html body > .content');

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




    var content = selector.down('content');
    expect(content.up('body').toString()).toEqual('html body');
    expect(content.up('html').toString()).toEqual('html');
    expect(content.up(      ).toString()).toEqual('[root selector]');





    // infinate recursion tests
    var loop = Selector('#loop');
        loop.def('child').childSelectors.loop_copy = loop.childSelectors;

    expect(function(){ loop.down('child');                 }).toNotThrow('selector not found');
    expect(function(){ loop.down('loop_copy');             }).toNotThrow('selector not found');
    expect(function(){ loop.down('child loop_copy');       }).toNotThrow('selector not found');
    expect(function(){ loop.down('child loop_copy child'); }).toNotThrow('selector not found');
  });

  test('selector.to, selector.from', function(){
    var selector = Selector();
    selector.def('html').def('body').def('content', '>.').def('profile', '>.').def('content', '>.');

    // To
    expect(function(){ Selector().to(Selector()); }).toThrow("[root selector] is not a child of [root selector]");
    expect(function(){ selector.to();             }).toThrow('query is undefined');
    expect(function(){ selector.to('bad_name');   }).toThrow('selector not found');

    expect(selector.to('content')                      ).toEqual('html body > .content');
    expect(selector.to('profile content')              ).toEqual('html body > .content > .profile > .content');
    expect(selector.down('html').to('content')         ).toEqual('body > .content');
    expect(selector.down('html').to('profile content') ).toEqual('body > .content > .profile > .content');
    expect(selector.down('body').to('content')         ).toEqual('> .content');
    expect(selector.down('body').to('profile content') ).toEqual('> .content > .profile > .content');
    expect(selector.down('content').to('content')      ).toEqual('> .profile > .content');

    var body_selector = selector.down('body'),
        profile_content_selector = selector.down('profile content');

    expect(selector.to(body_selector)                         ).toEqual('html body');
    expect(selector.to(profile_content_selector)              ).toEqual('html body > .content > .profile > .content');
    expect(selector.down('html').to(body_selector)            ).toEqual('body');
    expect(selector.down('html').to(profile_content_selector) ).toEqual('body > .content > .profile > .content');

    // From
    expect(function(){ selector.from();                          }).toThrow('from cannot be called on a root selector');
    expect(function(){ selector.down('body').from('bad_name');   }).toThrow('selector not found');

    expect(selector.down('body').from('html')            ).toEqual('body');
    expect(selector.down('content').from('html')         ).toEqual('body > .content');
    expect(selector.down('profile content').from('html') ).toEqual('body > .content > .profile > .content');
    expect(selector.down('profile content').from()       ).toEqual('html body > .content > .profile > .content');
  });

  test('selector.parentSelectors', function(){
    var parent_selectors = Selector().def('html').def('body').def('content').def('image').parentSelectors();

    expect(parent_selectors.length).toBe(4);
    expect(parent_selectors[0].toString()).toEqual('html body content');
    expect(parent_selectors[1].toString()).toEqual('html body');
    expect(parent_selectors[2].toString()).toEqual('html');
    expect(parent_selectors[3].toString()).toEqual('[root selector]');
  });

  test('selector.childOf', function(){
    var parent = Selector('parent'),
        child = parent.def('child');

    expect(child.childOf()            ).toBe(false);
    expect(child.childOf(new Selector)).toBe(false);
    expect(child.childOf(parent)      ).toBe(true);
    expect(parent.childOf(child)      ).toBe(false);
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
    var selectors, audit;

    selectors = Selector()
    .def('html')
      .def('body')
        .def('header', '>.').end
        .def('content', '>.').end
        .def('footer', '>.').end
      .end
    .end;

    var audit = selectors.audit();
    expect( audit["html"]              ).toEqual("html");
    expect( audit["html body"]         ).toEqual("html body");
    expect( audit["html body header"]  ).toEqual("html body > .header");
    expect( audit["html body content"] ).toEqual("html body > .content");
    expect( audit["html body footer"]  ).toEqual("html body > .footer");

    // infinate recursion tests
    selectors = Selector()
    .def('parent')
      .alt('small_').end
      .def('child')
        .alt('small_').end
      .end
    .end;
    // manually creating an infinate loop
    selectors.down('child').childSelectors.parent = selectors.down('parent').childSelectors;

    audit = selectors.audit();
    expect( audit.toString().match(/\n/g).length     ).toBe(12);
    expect( audit["parent"]                          ).toEqual("parent");
    expect( audit["parent child"]                    ).toEqual("parent child");
    expect( audit["parent child parent"]             ).toEqual("parent child parent");
    expect( audit["parent child parent child"]       ).toEqual("parent child parent child");
    expect( audit["parent child parent small_child"] ).toEqual("parent child parent child.small");
    expect( audit["parent small_child"]              ).toEqual("parent child.small");
    expect( audit["parent small_child parent"]       ).toEqual("parent child.small parent");
    expect( audit["small_parent"]                    ).toEqual("parent.small");
    expect( audit["small_parent child"]              ).toEqual("parent.small child");
    expect( audit["small_parent child parent"]       ).toEqual("parent.small child parent");
    expect( audit["small_parent small_child"]        ).toEqual("parent.small child.small");
    expect( audit["small_parent small_child parent"] ).toEqual("parent.small child.small parent");


    expect(audit.toString()).toBe(
      'parent                              parent\n'+
      'parent child                        parent child\n'+
      'parent child parent                 parent child parent\n'+
      'parent child parent child           parent child parent child\n'+
      'parent child parent small_child     parent child parent child.small\n'+
      'parent small_child                  parent child.small\n'+
      'parent small_child parent           parent child.small parent\n'+
      'small_parent                        parent.small\n'+
      'small_parent child                  parent.small child\n'+
      'small_parent child parent           parent.small child parent\n'+
      'small_parent small_child            parent.small child.small\n'+
      'small_parent small_child parent     parent.small child.small parent\n'
    );
  });

  test('S', function(){
    expect(S('html').toString()).toEqual('html');
  });

})();