;(function() {
  var undefined;

  module("Selector");

  test("Selector", function() {
    expect( Selector().toString()            ).toBe('');
    expect( Selector('').toString()          ).toBe('');
    expect( Selector('html body').toString() ).toBe('html body');


    expect( Selector('html body').toString() ).toBe('html body');

  });

  test("Selector#down", function() {

    var root;

    expect( Selector().down('a','a').toString() ).toBe('a');

    root = Selector('html body');
    expect( root.down('header', '#header').toString() ).toBe('html body #header');
    expect( root.down('header'           ).toString() ).toBe('html body #header');


    expect(function(){ root.down('bad name', 'bad.name'); }).toThrow('selector names cannot have spaces');
    expect(function(){ root.down('nonexistant');          }).toThrow('selector "nonexistant" not found');

  });

  test('Selector#end', function(){
    var root = Selector();
    root
      .down('html', 'html')
        .down('body', 'body')
          .down('header',  '> .header').end()
          .down('content', '> .content').end()
          .down('footer',  '> .footer').end()
        .end()
      .end()
    ;

    DEBUG = root;
    console.dir(root);

    expect( root.down('html').end()                       ).toBe(root);
    expect( root.down('html').down('body').end()          ).toBeTheSameSelectorAs( root.down('html') );
    expect( root.down('html').down('body').end().end()    ).toBe(root);






  });


  //
  // test("Selector", function() {
  //   expect(Selector    ).toBeA(Function);
  //   expect(new Selector).toBeA(Selector);
  //   expect(Selector()  ).toBeA(Selector);
  //
  //   expect(Selector())
  //     .toNotHaveProperty('parentSelector')
  //     .toNotHaveProperty('name');
  //   expect(Selector().end                 ).toBe(undefined);
  //   expect(Selector().value()             ).toEqual('');
  //   expect(Selector().toString()          ).toEqual("[root selector]");
  //   expect(Selector("> .head").value()    ).toEqual("> .head");
  //   expect(Selector("> .head").fullValue()).toEqual("> .head");
  // });
  //
  // test('selector.plus', function(){
  //   expect(function(){ Selector().plus(); }).toThrowA(TypeError);
  //
  //   var header = new Selector("> .header"),
  //       logo   = header.plus('> logo'),
  //       image  = logo.plus('> img');
  //
  //   expect(logo.value()     ).toEqual("> logo");
  //   expect(logo.fullValue() ).toEqual("> .header > logo");
  //   expect(logo.end         ).toBe(header);
  //   expect(image.value()    ).toEqual("> img");
  //   expect(image.fullValue()).toEqual("> .header > logo > img");
  //   expect(image.end        ).toBe(logo);
  // });

})();