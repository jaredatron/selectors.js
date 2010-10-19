# Selectos.js

Dry Evented Javascript

Selectors.js allows you to take a css like approach to event handling in Javascript. Much like you would define a background color for elements matching a given selector so can you define an onClick event handler.

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