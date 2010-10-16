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

    var body;

    expect( Selector().down('a','a').toString() ).toBe('a');

    body = Selector('body');
    expect( body.down('content', '#content').toString() ).toBe('body #content');
    expect( body.down('content'            ).toString() ).toBe('body #content');

    expect(function(){ body.down('bad name', 'bad.name'); }).toThrow('invalid selector name "bad name"');
    expect(function(){ body.down('nonexistant');          }).toThrow('selector "nonexistant" not found');

    expect(function(){
      body.down('double', '> .double');
      body.down('double', '> .double');
    }).toThrow('selector "double" already defined');


    body
      .down('header',  '> .header')
        .down('logo', 'img').end()
        .down('a',  'a').end()
      .end()
      .down('a',  'a').end()
    .end();

    expect( body.down('header'      ).toString() ).toBe('body > .header');
    expect( body.down('logo'        ).toString() ).toBe('body > .header img');
    expect( body.down('a'           ).toString() ).toBe('body a');
    expect( body.down('header logo' ).toString() ).toBe('body > .header img');
    expect( body.down('header a'    ).toString() ).toBe('body > .header a');

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

  test('Selector#end', function(){
    var root = Selector(), html, body;

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
      .down('a', 'a')
        .down('span', 'span');

    expect( root.down('a').down('span').toString()                      ).toBe('html a span');
    expect( root.down('a').when(':hover').down('span').toString()       ).toBe('html a:hover span');
    expect( root.down('a').when(':hover').down('span').end().toString() ).toBe( root.down('a').when(':hover').toString() );

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

})();