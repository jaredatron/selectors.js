;(function() {

  var undefined, events = $(document).delegate('a','a',function(){}).data().events.live = []; events.length = 0;

  module("Selector");

  $('html body').append($(
    '<div class="content" style="display:none">'+
      '<div class="profile">'+
        '<div class="content">'+
          '<img src=""/>'+
        '</div>'+
      '</div>'+
    '</div>'
  ));

  S('body')
    .def('content', '>.')
      .def('profile', '>.')
        .def('content', '>.')
          .def('image', '> img').end
        .end
      .end
    .end
  .end;

  test('selector.get', function(){
    var body_selector   = S('body'),
        body_collection = $('body');

    expect( body_selector.get().toSelector()       ).toBeTheSameSelectorAs(body_selector);
    expect( body_selector.get()                    ).toReferenceTheSameHtmlElementsAs(body_collection);
    expect( body_selector.plus('> .content').get() ).toReferenceTheSameHtmlElementsAs(body_collection.find('> .content'));
  });

  test("selector.bind", 5, function() {
    var data, handler;

    data = {};
    handler = function(event, data){
      expect(this).toBeAnInstanceOf(jQuery).toReferenceTheSameHtmlElementsAs($('body'));
    };
    S('body').bind('click', data, handler);
    expect(events[0].selector).toEqual('html body');
    expect(events[0].origType).toEqual('click');
    expect(events[0].data    ).toBe(data);
    $('body').trigger('click');

    events.length = 0;
  });

  test('selector.extend', 2, function(){
    S('profile')
      .extend({
        addFriend: function(){}
      })
    ;

    expect( S('profile').get().addFriend ).toBeA(Function);

    S('profile').click(function(){ expect(this.addFriend).toBeA(Function); }).get().click();
  });

  module("jQuery");

  test('jQuery().toSelector', function(){
    expect( $('html body').toSelector().toString()  ).toBe('html body');
    expect( S('body').get().toSelector()            ).toBeTheSameSelectorAs(S('body'));
    expect( S('body').get().toSelector().up('html') ).toBeTheSameSelectorAs(S('html'));
  });

  test('jQuery().up, jQuery().down', function(){
    // Up
    expect( S('profile content').get().up()                       ).toReferenceTheSameHtmlElementsAs( $('html body > .content > .profile') );
    expect( S('profile content').get().up('content')              ).toReferenceTheSameHtmlElementsAs( $('html body > .content')            );

    // Down with additional selector
    expect( S('profile content').get().up('body', 'a[href]')      ).toReferenceTheSameHtmlElementsAs( $('html body a[href]') );

    // Down
    expect( S('html').get().down('content')                       ).toReferenceTheSameHtmlElementsAs( $('html body > .content')                       );
    expect( S('html').get().down('profile')                       ).toReferenceTheSameHtmlElementsAs( $('html body > .content > .profile')            );
    expect( S('html').get().down('profile content')               ).toReferenceTheSameHtmlElementsAs( $('html body > .content > .profile > .content') );
    expect( S('html').get().down('profile').down('content')       ).toReferenceTheSameHtmlElementsAs( $('html body > .content > .profile > .content') );

    // Down with additional selector
    expect( S('html').get().down('profile content', '> img')      ).toReferenceTheSameHtmlElementsAs( $('html body > .content > .profile > .content > img') );

    expect( S('profile content').get().up()                       ).toReferenceTheSameHtmlElementsAs( $('html body > .content > .profile') );
    expect( S('profile content').get().up().up()                  ).toReferenceTheSameHtmlElementsAs( $('html body > .content')            );
    expect( S('profile content').get().up().up().up()             ).toReferenceTheSameHtmlElementsAs( $('body')                            );
    expect( S('profile content').get().up().up().up().up()        ).toReferenceTheSameHtmlElementsAs( $('html')                            );
    expect( S('profile content').get().up().up().up().up().up()   ).toReferenceTheSameHtmlElementsAs( $()                                  );

  });


  test('jQuery().to, jQuery().from', function(){
    function test(from, to){
      expect( S(from).get().to(to)    ).toEqual( S(from).to(to)         );
      expect( S(to).get().from(from)  ).toEqual( S(to).get().from(from) );
    }
    test('html', 'body');
    test('html', 'content');
    test('html', 'profile content');
    test('content', 'profile content');
  });


})();