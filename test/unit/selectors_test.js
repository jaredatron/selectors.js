;(function(undefined) {

  module("Selector");

  test("Selector", function() {
    expect( Selector().toString()            ).toBe('');
    expect( Selector('').toString()          ).toBe('');
    expect( Selector('html body').toString() ).toBe('html body');
    expect( Selector('html body').toString() ).toBe('html body');
  });

  test('Selector#name', function(){
    expect( Selector().down('steve','steve').name ).toBe('steve');
  });

  test("Selector#down", function() {

    var body = Selector('body');
        header = body.down('header',  '> .header');

    body
      .down('header')
        .down('logo', 'img').end()
        .down('a',  'a').end()
      .end()
      .down('a',  'a').end()
    .end();


    expect(function(){ body.down('%', '.'); }).toThrow('invalid selector name "%"');
    expect(function(){ body.down('two words', '.'); }).toThrow('invalid selector name "two words"');

    expect(function(){
      body.down('double', '> .double');
      body.down('double', '> .double');
    }).toThrow('selector "double" already defined');

    expect( Selector().down('a',' a ').toString() ).toBe('a');

    expect( body.down('content', '#content').toString() ).toBe('body #content');
    expect( body.down('content'            ).toString() ).toBe('body #content');

    expect(function(){ body.down('bad name', 'bad.name'); }).toThrow('invalid selector name "bad name"');
    expect(function(){ body.down('nonexistant');          }).toThrow('selector "nonexistant" not found');



    expect( body.down('header'      ).toString() ).toBe('body > .header');
    expect( body.down('logo'        ).toString() ).toBe('body > .header img');
    expect( body.down('a'           ).toString() ).toBe('body a');
    expect( body.down('header logo' ).toString() ).toBe('body > .header img');
    expect( body.down('header a'    ).toString() ).toBe('body > .header a');

    expect( body.down('header').up() ).toNotBe(body).toBeTheSameSelectorAs(body);
    expect( header.down('logo').up('header') ).toNotBe(header).toBeTheSameSelectorAs(header);

    expect( body.down('header'      ).end().toString() ).toBe('body');
    expect( body.down('logo'        ).end().toString() ).toBe('body');
    expect( body.down('a'           ).end().toString() ).toBe('body');
    expect( body.down('header logo' ).end().toString() ).toBe('body');
    expect( body.down('header a'    ).end().toString() ).toBe('body');
  });

  test("Selector#up", function(){
    var root = Selector(),
        bottom = root
          .down('a','.').down('b','.').down('c','.')
          .down('z','.')
          .down('a','.').down('b','.').down('c','.')
          .down('bottom', '.'),
        z = root.down('z');

    expect(function(){ bottom.up('l m n'); }).toThrow('selector "l m n" not found');
    expect(function(){ bottom.up('% /'); }).toThrow('invalid selector query "% /"');
    expect( bottom.up().toString() ).toBe('.a .b .c .z .a .b .c');
    expect( root.down('a').up()    ).toNotBe(root).toBeTheSameSelectorAs(root);
    expect(    z.down('a').up('z') ).toNotBe(z   ).toBeTheSameSelectorAs(z   );

    expect( bottom.up('a b c z a b c').toString() ).toBe('.a .b .c .z .a .b .c');
    expect( bottom.up('a b c z a b'  ).toString() ).toBe('.a .b .c .z .a .b'   );
    expect( bottom.up('a b c z a'    ).toString() ).toBe('.a .b .c .z .a'      );
    expect( bottom.up('a b c z'      ).toString() ).toBe('.a .b .c .z'         );
    expect( bottom.up('a b c'        ).toString() ).toBe('.a .b .c .z .a .b .c');
    expect( bottom.up('a b'          ).toString() ).toBe('.a .b .c .z .a .b'   );
    expect( bottom.up('a'            ).toString() ).toBe('.a .b .c .z .a'      );

    expect( bottom.up('c').end().toString()                   ).toBe('.a .b .c .z .a .b .c .bottom');
    expect( bottom.up('c').up('b').end().toString()           ).toBe('.a .b .c .z .a .b .c');
    expect( bottom.up('c').up('b').up('a').end().toString()   ).toBe('.a .b .c .z .a .b');

  });

  test("Selector#down shorthand", function() {

    var root = Selector();

    expect( root.down('header','>.').toString() ).toBe('> .header');
    // expect( root.down('header','>.').toString() ).toBe('> .header');


    [ ['.'  , '.name'   ],
      ['#'  , '#name'   ],
      ['[]' , '[name]'  ],
      ['>'  , '> name'  ],
      ['>.' , '> .name' ],
      ['>#' , '> #name' ],
      ['>[]', '> [name]']
    ].forEach(function(shortcut){
      expect( Selector().down("name", shortcut[0]).toString() ).toEqual(shortcut[1]);
    });

  });

  test('Selector#to', function(){
    var root = Selector();
        a    = root.down('a','.a');
        b    =    a.down('b','.b');
        c    =    b.down('c','.c');
        d    =    c.down('d','.d');

    expect(function(){ root.to(); }).toThrow('selector cannot be blank');

    expect( root.to('a') ).toBe('.a');
    expect( root.to('b') ).toBe('.a .b');
    expect( root.to('c') ).toBe('.a .b .c');
    expect( root.to('d') ).toBe('.a .b .c .d');

    expect( a.to('b') ).toBe('.b');
    expect( a.to('c') ).toBe('.b .c');
    expect( a.to('d') ).toBe('.b .c .d');

    expect( b.to('c') ).toBe('.c');
    expect( b.to('d') ).toBe('.c .d');

    expect( c.to('d') ).toBe('.d');


    expect( root.to( a ) ).toBe('.a');
    expect( root.to( b ) ).toBe('.a .b');
    expect( root.to( c ) ).toBe('.a .b .c');
    expect( root.to( d ) ).toBe('.a .b .c .d');

    expect( a.to( b ) ).toBe('.b');
    expect( a.to( c ) ).toBe('.b .c');
    expect( a.to( d ) ).toBe('.b .c .d');

    expect( b.to( c ) ).toBe('.c');
    expect( b.to( d ) ).toBe('.c .d');

    expect( c.to( d ) ).toBe('.d');

  });

  test('Selector#from', function(){
    var root = Selector();
        a    = root.down('a','.a');
        b    =    a.down('b','.b');
        c    =    b.down('c','.c');
        d    =    c.down('d','.d');

    expect(function(){ root.from(); }).toThrow('from cannot be called on a root selector');
    expect(function(){ d.from(); }).toThrow('selector cannot be blank');

    expect( d.from('a') ).toBe('.b .c .d');
    expect( d.from('b') ).toBe('.c .d');
    expect( d.from('c') ).toBe('.d');

    expect( c.from('b') ).toBe('.c');
    expect( c.from('a') ).toBe('.b .c');

    expect( d.from( a ) ).toBe('.b .c .d');
    expect( d.from( b ) ).toBe('.c .d');
    expect( d.from( c ) ).toBe('.d');

    expect( c.from( b ) ).toBe('.c');
    expect( c.from( a ) ).toBe('.b .c');
  });

  test('Selector#end', function(){
    var root = Selector(), html, body;

    expect(root.end()).toBe(root);

    root
      .down('html', 'html')
        .down('body', 'body')
          .down('header',  '> .header').end()
          .down('content', '> .content').end()
          .down('footer',  '> .footer').end()
        .end()
      .end()
    ;

    expect( root.down('html'             ).end() ).toBeTheSameSelectorAs(root);
    expect( root.down('body'             ).end() ).toBeTheSameSelectorAs(root);
    expect( root.down('header'           ).end() ).toBeTheSameSelectorAs(root);
    expect( root.down('content'          ).end() ).toBeTheSameSelectorAs(root);
    expect( root.down('footer'           ).end() ).toBeTheSameSelectorAs(root);
    expect( root.down('html body'        ).end() ).toBeTheSameSelectorAs(root);
    expect( root.down('html header'      ).end() ).toBeTheSameSelectorAs(root);
    expect( root.down('html content'     ).end() ).toBeTheSameSelectorAs(root);
    expect( root.down('html footer'      ).end() ).toBeTheSameSelectorAs(root);
    expect( root.down('html body header' ).end() ).toBeTheSameSelectorAs(root);
    expect( root.down('html body content').end() ).toBeTheSameSelectorAs(root);
    expect( root.down('html body footer' ).end() ).toBeTheSameSelectorAs(root);

    html = root.down('html');
    expect( html.down('body'             ).end() ).toBeTheSameSelectorAs(html);
    expect( html.down('header'           ).end() ).toBeTheSameSelectorAs(html);
    expect( html.down('content'          ).end() ).toBeTheSameSelectorAs(html);
    expect( html.down('footer'           ).end() ).toBeTheSameSelectorAs(html);
    expect( html.down('body'             ).end() ).toBeTheSameSelectorAs(html);
    expect( html.down('header'           ).end() ).toBeTheSameSelectorAs(html);
    expect( html.down('content'          ).end() ).toBeTheSameSelectorAs(html);
    expect( html.down('footer'           ).end() ).toBeTheSameSelectorAs(html);
    expect( html.down('body header'      ).end() ).toBeTheSameSelectorAs(html);
    expect( html.down('body content'     ).end() ).toBeTheSameSelectorAs(html);
    expect( html.down('body footer'      ).end() ).toBeTheSameSelectorAs(html);

    body = root.down('body');
    expect( body.down('header'           ).end() ).toBeTheSameSelectorAs(body);
    expect( body.down('content'          ).end() ).toBeTheSameSelectorAs(body);
    expect( body.down('footer'           ).end() ).toBeTheSameSelectorAs(body);

  });

  test('Selector#when', function(){

    var root = Selector('html');
    root
      .down('a', '.')
        .down('b', '.');

    expect(function(){ root.when(); }).toThrow('first argument to "when" must be a string');

    expect( root.down('a').when(':visible').toString()                         ).toBe('html .a:visible'   );
    expect( root.down('a').when(':visible').end().toString()                   ).toBe('html .a'           );
    expect( root.down('a').when(':visible').down('b').toString()               ).toBe('html .a:visible .b');
    expect( root.down('a').when(':visible').down('b').end().toString()         ).toBe('html .a:visible'   );

    expect( root.down('a').when(':visible').down('b').up('a').toString()       ).toBe('html .a:visible'   );
    expect( root.down('a').when(':visible').down('b').up('a').end().toString() ).toBe('html .a:visible .b');
    expect( root.down('a').when(':visible').down('b').end().toString()         ).toBe('html .a:visible'   );
    expect( root.down('a').when(':visible').down('b').end().end().toString()   ).toBe('html .a'           );

  });

  test('Selector#plus', function(){

    var root = Selector('html');
    root
      .down('a', '.')
        .down('b', '.');

    expect(function(){ root.plus(); }).toThrow('first argument to "plus" must be a string');

    expect( root.down('a').plus('span').toString()                        ).toBe('html .a span');
    expect( root.down('a').plus('span').end().toString()                  ).toBe('html .a');
    expect( root.down('a').plus('span').down('b').toString()              ).toBe('html .a span .b');
    expect( root.down('a').plus('span').down('b').up('a').toString()      ).toBe('html .a span');
    expect( root.down('a').plus('span').down('b').up('a').up().toString() ).toBe('html');

    expect( root.down('a').plus('span').down('b').end().toString()        ).toBe('html .a span');
    expect( root.down('a').plus('span').down('b').end().end().toString()  ).toBe('html .a'     );

  });

  test('Selector#tree', function(){
    var map = Selector();
    map
      .down('a', '#a')
        .down('b', '.b')
          .down('c','c').end()
        .end()
      .end()
    ;

    expect(map.tree()).toDeepEqual({
      'a "#a"': {
        'b ".b"': {
          'c "c"': { }
         }
       }
     });

  });

  test('Selector#clone', function(){
    var selector = Selector();
    expect(selector.clone()).toNotBe(selector).toBeTheSameSelectorAs(selector);
  });

  test('Selector#childOf', function(){
    var god        = Selector('god'),
        parent     = god.down('parent','.'),
        child      = parent.down('child','.'),
        grandChild = child.down('grand-child','.'),
        brother    = god.down('brother','.'),
        stranger   = Selector('stranger');

    expect(      child.childOf(parent) ).toBe(true);
    expect( grandChild.childOf(parent) ).toBe(true);
    expect(    brother.childOf(parent) ).toBe(false);
    expect(   stranger.childOf(parent) ).toBe(false);

  });

  test('selectors with commas', function(){
    var root = Selector();
    root
      .down('buttons', 'a, input')
        .down('text', 'span');

    expect( root.down('buttons').toString()                               ).toBe('a, input');
    expect( root.down('buttons').when(':visible').toString()              ).toBe('a:visible, input:visible');
    expect( root.down('buttons').down('text').toString()                  ).toBe('a span, input span');
    expect( root.down('buttons').down('text').when(':visible').toString() ).toBe('a span:visible, input span:visible');

  });

})();