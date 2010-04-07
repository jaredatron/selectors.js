# selectors.js

selectors.js is designed for projects that deal with heaps of css selectors and need a way to store and manage them. And a lot more. =]

At its core selectors.js allows you to define the tree of your css selectors and then enables you to move from element(s) to element(s) with ease.

## Please Note! S() !== $()

selectors.js is built on top of jQuery but it uses S (capitol s) and does not change $ (the dollar sign) in any way.

S() queries for a selector by name

$() does the jquery thing

## Documentation:

Lets say you have the following markup

    <html>
      <body>
        <div class="header">
          <div class="logo">
            <img src="" />
          </div>
        </div>
        <div class="footer"></div>
      </body>
    </html>
    </code>

The following is how you would define your selector tree

    S('body')
      .def('header', '> .header')
        .def('logo', '> .log')
          .def('image', '> img').end
        .end
      .end
      .def('footer', '> .footer')
        .def('image', '> img').end
      .end
    ;

Now you can query for whatever selector you like by name

    S('header').toString();
    //-> "html body > .header"

    S('logo').toString();
    //-> "html body > .header > .logo"

    S('header logo').toString();
    //-> "html body > .header > .logo"

    S('image').toString();
    //-> "html body > .footer > img"

    S('header image').toString();
    //-> "html body > .header > .logo > img"

### up and down
The up and down methods allow you to traverse from one selector to another

    S('html').down('body').toString();
    //-> "html body"

    S('body').up('html').toString();
    //-> "html"

    S('footer image').up('body').down('header logo image').toString();
    //-> "html body > .header > .logo > img"

### get
A Selector can easily be used to query the DOM for elements matching its value

    S('body').get();
    //-> [body]

### more ups and downs
when querying the DOM for elements using a Selector the collection you get back is able to query other elements using their selector names

    var body = S('body').get();
    //-> [body]

    body.down('header');
    //-> [div.header]

    body.down('footer image').up('html').down('logo image');
    //-> [img]


### bind
a bind method is available to for easy event delegation

    S('header logo image').bind('click', function(){ ... });
    // AKA
    $(document).delegate("html body > .header > .logo > img", 'click', function(){ ... });


binding delegated event handlers are called a little differently then in standard jQuery. The differences is that `this` is a jQuery collection instead of the bare DOM element

    S('header logo image').click(function(event, data){
      this instanceof jQuery;
      //-> true
    });

this makes doing tasks like this a lot simpler

    S('header logo image').click(function(){ this.up('body').remove(); });

### Anonymous Selectors
if you don't want to mess with defining trees of selectors but you still want the power of a Selector object you can create anonymous Selectors like so

    var links = Selector('a[href]');

    links.toString();
    //-> "a[href]"

    links.click(function(){ alert(this.attr('href')+' link clicked'); });

anonymous selectors can still have descendants

    var image_links = links.def('image', 'img');

    image_links.toString();
    //-> "a[href] img"

or if you just want create another one off selector from an existing one you can add to it with the plus method

    var image_links = links.plus('> img');

    image_links.toString();
    //-> "a[href] > img"

### extend

extend allows you to add properties to the jQuery collection a given selector returns to you.

    S('header logo image')
      .extend({
        goBig: function(){
          this.css('height', '1000px').css('width', '1000px')
        }
      });

    S('header logo image').get().goBig;
    //-> function

    S('footer image').get().goBig;
    //-> undefined

throw super simple event delegation in the mix and you have a very powerful DSL

    Selector('img')
      .extend('goBig', function(){
          this.css('height', '1000px').css('width', '1000px')
      })
      .click(function(){
        this.goBig();
      })
    ;

# Examples

see [example.html](http://github.com/deadlyicon/selectors.js/blob/master/example.html)