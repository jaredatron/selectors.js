Selector('html')


S('body')
  .down('header',  '#').end()
  .down('content', '#').end()
  .down('footer',  '#').end()
;


.when(':visible').click()


S('body')
  .down('header', '#')
    .down('logo', '>.')
      .when('large', '.large')
        .click(function(){
          this.up('header')
        })
      .end()
    .end()
  .end()
.end()

S('logo').when('large')
  .click(function(){
    this.up('header')
  })
;

$('body')
  .find('#header')
    .find('> .logo')
      .and(':visible')
        .live('click', function(){
          this.up('body #header > .logo')
        })
      .end()
    .end()
  .end()
.end();




// future features


// easy defin syntax
S.define
  ('list', 'ul#list')
    ('item', '> li')
      ('button', '> a.button').end
    .end
  .end
.end;
