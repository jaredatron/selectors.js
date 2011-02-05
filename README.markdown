# Selectors.js

**Dry Evented Javascript**

## Selectors.js is three things:

  0. A css selector registry
  0. A sweet event delegation API
  0. A simple inheritance system

### A css selector registry

If you've ever written a moderately complex web application chances are you've found your self
duplicating css selectors all over your javascript.

    // maybe like this?

    function focusPost(post){
      $('#posts > .post').removeClass('focused');
      post.addClass('focused');
    }

    $('#posts > .post').live('mouseenter', function(e){
      focusPost($(this));
    });

This approach can easily become a nightmare when you realize you need to tweak your markup.
Selectors.js makes this easier by allowing you to register named css selectors in a tree and
then easily query for them by name. This helps you dry up your code and makes updating your
markup super easy. Like so:

*NOTE: the code below is using the `S` (as in Selector) function not the `$` (dollar) function*

    // register two new selectors named posts and post
    S('body')
      .down('posts','ul.posts')
        .down('post','li.post')
      .end()
    .end();

    function focusPost(post){
      S('post').get().removeClass('focused');
      post.addClass('focused');
    }

    S('post').mouseenter(function(e){
      focusPost(this);
    });

### A sweet event delegation API

  Selectors.js is similar to jQuery except it operates soley on CSS selectors and never DOM nodes.

    // contining with the above example

    // we get the post selector
    var post_selector = S('post');   //-> #<Selector: value="li.post">

    // you can use it to query the dom using jQuery
    var posts = post_selector.get(); //-> jQuery('html body ul.posts li.post')

    // you can define additional selectors
    post_selector.down('title','h3') //-> #<Selector: value="h3">

    // you can query for child selectors
    post_selector.down('title')      //-> #<Selector: value="h3">

    // can register delegated event handlers (with some nice slight changes)
    post_selector.click(function(e){
      this instanceof jQuery; //-> true
    });

### A simple class system

  Possibly the best part of Selectors.js is the ability to extend jQuery collections of specific
  selectors.

    S('post')
      .extend({
        delete: function(){
          alert('deleting "'+this.down('title').text()+'"')
        }
      })



## ---

*NOTE: the code below is using the `S` (as in Selector) function not the `$` (dollar) function*

The `S` method is used to query the selector registry. The html and body elements are defined by
default

    S('html');            //-> #<Selector: value="html">
    S('body');            //-> #<Selector: value="body">

    S('html').toString(); //-> html
    S('body').toString(); //-> html body

The following code registers two new selectors:

    S('body')
      .down('posts','ul.posts')
        .down('post','li.post')
      .end()
    .end();

You can query for them like this:

    S('posts').toString(); //-> html body ul.posts
    S('post').toString();  //-> html body ul.posts li.post

You can be as specific as you want

    S('html body posts post').toString();  //-> html body ul.posts li.post
    S('body post').toString();             //-> html body ul.posts li.post

And then use them like this:

    S('post').mouseenter(function(e){
      S('post').get().removeClass('focused');
      $(this).addClass('focused');
    });

Then say later you decide to drop the post classname off the li element and just consider
all immediate decedents of ul.posts a post you only have to change your selector in one place
like so:

    S('body')
      .down('posts','ul.posts')
        .down('post','> li')
      .end()
    .end();

The S function allows you to query the selector tree much like the $ function lets you query the
DOM.

#### Given the following tree:

    S('body')
      .down('header', '#header')
        .down('nav', '> ul.nav')
          .down('login-button', '> li.login').end()
        .end()
        .down('login-form', 'form.login')
          .down('login-button', 'input[type="submit"]').end()
        .end()
      .end()
    ;

#### Here are some example queries:

    S('header').toString();                  //-> html body #header
    S('nav').toString();                     //-> html body #header > ul.nav
    S('login-button').toString();            //-> html body #header > ul.nav > li.login

#### When searching for a selector by name Selectors will return the shallowest match. For example:

    S('login-form').toString();              //-> html body #header form.login
    S('login-form login-button').toString(); //-> html body #header form.login input[type="submit"]


### Functions

#### `down` both defines and queries for a child selector

  If given two arguments down defined an immediate child selector.
    S('body').down('header', '#header')     //-> #<Selector: value="#header">
    S('body').down('header', '#header')     //-> Error: "selector "header" already defined"


#### `tree` lets you view the entire selector index

    S('body').tree().toString();
    /*->
                   : html
      body         : html body
      header       : html body #header
      nav          : html body #header > ul.nav
      login-button : html body #header > ul.nav > li.login
      login-form   : html body #header form.login
      login-button : html body #header form.login input[type="submit"]
    */

#### `up` and `down` functions allow you to extract relative selectors like so:

    S('header').to('login-form login-button') //-> form.login input[type="submit"]
    S('login-button').from('nav');            //-> > li.login








#### For example
  lets say you want all the links on your page with an href of "#" to do nothing when clicked

    Selector('body a[href="#"]').click(function(event){
      event.preventDefault();
    });


## Naming Selectors

  The down function allows you to specify the name and value of child selector

#### For example

  lets say you had the following header and navigation menu markup

    <html>
      <head/>
      <body>
        <div class="header"></div>
          <ul class="nav">
            <li>home</li>
            <li>signin</li>
          </ul>
        </div>
      </body>
    </html

  you could define this hierarchy in javascript like this:

    S('body')
      .down('header', '> .header')
        .down('nav', '> ul.nav')
          .down('button', '> li').end()
        .end()
      .end()
    ;

##### please note these examples are using the S as in Sam not $ as in the bling of jQuery

  now you can query for these selectors by name using the S method like so:

    S('header').toString();
    //-> "html body > .header"

    S('nav').toString();
    //-> "html body > .header > ul.nav"

    S('header nav button').toString();
    //-> "html body > .header > ul.nav > li"

    S('header button').toString();
    //-> "html body > .header > ul.nav > li"

  you can also search for sub-selectors using the down method

    S('header').down('nav').toString();
    //-> "html body > .header > ul.nav"


## Author

  Selectors.js was written by Jared Grippe [jared@jaredgrippe.me](http://jaredgrippe.me)