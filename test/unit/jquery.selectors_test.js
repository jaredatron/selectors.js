;(function() {

  var undefined, events = $(document).delegate('a','a',function(){}).data().events.live = [];

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

  test("selector.bind", function() {
    expect(Selector().bind).toBeAnInstanceOf(Function);

    var handler = function(){}, data = {};

    expect(events.length).toEqual(0);

    Selector('a').bind('test', data, handler);
    expect(events[0].selector).toEqual('a');
    expect(events[0].origType).toEqual('test');
    expect(events[0].data    ).toBe(data);
    expect(events[0].handler ).toBe(handler);

    Selector('a').bind('test', handler);
    expect(events[1].selector).toEqual('a');
    expect(events[1].origType).toEqual('test');
    expect(events[1].handler ).toBe(handler);

    Selector('span').bind({test: handler});
    expect(events[2].selector).toEqual('span');
    expect(events[2].origType).toEqual('test');
    expect(events[2].handler ).toBe(handler);

    events.length = 0;
  });

  module("jQuery");

  test('jQuery().toSelector', function(){
    expect( $('html body').toSelector().toString()  ).toBe('html body');
    expect( S('body').get().toSelector()            ).toBeTheSameSelectorAs(S('body'));
    expect( S('body').get().toSelector().up('html') ).toBeTheSameSelectorAs(S('html'));
  });

  test('jQuery().to, jQuery().to', function(){

  });

  test('jQuery().up, jQuery().down', function(){
    var html = S('html').get();
    expect( html.down('content')           ).toReferenceTheSameHtmlElementsAs( $('html body > .content')                       );
    expect( html.down('profile')           ).toReferenceTheSameHtmlElementsAs( $('html body > .content > .profile')            );
    expect( html.down('profile content')   ).toReferenceTheSameHtmlElementsAs( $('html body > .content > .profile > .content') );
    expect( html.down('profile').down('content')   ).toReferenceTheSameHtmlElementsAs( $('html body > .content > .profile > .content') );
  });


})();