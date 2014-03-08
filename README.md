# DOMPurify

DOMPurify is a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML and SVG. It's written in JavaScript and works in all modern browsers (Safari, Opera (15+), Internet Explorer (10+), Firefox and Chrome - as well as almost anything else using Blink or WebKit). DOMPurify is written by security people who have vast background in web attacks and XSS. Fear not.

## What does it do?

DOMPurify sanitizes HTML and prevents XSS attacks. You can feed DOMPurify with string full of dirty HTML and it will return a string with clean HTML. DOMPurify will strip out everything that contains dangerous HTML and thereby prevent XSS attacks and other nastiness. It's also damn bloody fast. We use the technologies the browser provides and turn them into an XSS filter. The faster your browser, the faster DOMPurify will be.

## How do I use it?

It's easy. Just include DOMPurify on your website. 

```html
<script type="text/javascript" src="purify.js"></script>
```

Afterwards you can sanitize strings by executing the following code:

```javascript
var clean = DOMPurify.sanitize(dirty);
```

If you're using an [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) module loader like [Require.js](http://requirejs.org/), you can load this script asynchronously as well:

```javascript
require(['dompurify'], function(DOMPurify) {
    var clean = DOMPurify.sanitize(dirty);
};
```

## Is there a demo?

Of course there is a demo! [Play with DOMPurify](https://cure53.de/purify)

## Some samples please?

How does purified markup look like? Well, [the demo](https://cure53.de/purify) shows it for a big bunch of nasty elements. But let's also show some smaller examples!

```javascript
DOMPurify.sanitize('<img src=x onerror=alert(1)//>'); // becomes <img src="x">
DOMPurify.sanitize('<svg><g/onload=alert(2)//<p>'); // becomes <svg><g></g></svg>
DOMPurify.sanitize('<p>abc<iframe/\/src=jAva&Tab;script:alert(3)>def'); // becomes <p>abc</p>
DOMPurify.sanitize('<math><mi//xlink:href="data:x,<script>alert(4)</script>">'); // becomes <math></math>

DOMPurify.sanitize('<TABLE><tr><td>HELLO</tr></TABL>'); // becomes <table><tbody><tr><td>HELLO</td></tr></tbody></table>
DOMPurify.sanitize('<UL><li><A HREF=//google.com>click</UL>'); // becomes <ul><li><a href="//google.com">click</a></li></ul>
```

## What is supported?

DOMPurify currently supports HTML5, SVG and MathML. DOMPurify per default allows CSS, HTML custom data attributes. DOMPurify also supports the Shadow DOM - and sanitizes DOM templates recursively. DOMPurify also allows you to sanitize HTML for being used with the jQuery `$()` method - you know, that case when it's used as a HTML factory: `$("<svg onload=alert(1)>")`.

## Can I configure it?

Yes. The included default configuration values are pretty good already - but you can of course override them:

```javascript
// allow only <b>
var clean = DOMPurify.sanitize(dirty, {ALLOWED_TAGS: ['b']});

// allow only <b> with style attributes (for whatever reason)
var clean = DOMPurify.sanitize(dirty, {ALLOWED_TAGS: ['b', 'q'], ALLOWED_ATTR: ['style']});

// prohibit HTML5 data attributes (default is true)
var clean = DOMPurify.sanitize(dirty, {ALLOW_DATA_ATTR: false});

// return a DOM instead of an HTML string (default is false)
var clean = DOMPurify.sanitize(dirty, {RETURN_DOM: true});

// return entire document including <html> tags (default is false)
var clean = DOMPurify.sanitize(dirty, {WHOLE_DOCUMENT: true});

// make output safe for usage in jQuery's $() method (default is false)
var clean = DOMPurify.sanitize(dirty, {SAFE_FOR_JQUERY: true});

// disable DOM Clobbering protection on output (default is true, handle with care!)
var clean = DOMPurify.sanitize(dirty, {SANITIZE_DOM: false});
```

## What's on the road-map?

A lot. We want to support as many safe tags and attributes as possible. Currently, we work on extending the SVG support. Future versions will also allow to pass in a DOM or HTML element, get a DOM or an element back, reliably prevent leakage via HTTP requests, proxy HTTP requests etc. etc.

## Who contributed?

Several people need to be listed here! [@garethheyes](https://twitter.com/garethheyes) for invaluable help, [@shafigullin](https://twitter.com/shafigullin) for breaking the library multiple times and thereby strengthening it, [@mmrupp](https://twitter.com/mmrupp) for doing the same. Big thanks also go to [@mathias](https://twitter.com/mathias), [@cgvwzq](https://twitter.com/cgvwzq), [@robbertatwork](https://twitter.com/robbertatwork) and [@giutro](https://twitter.com/giutro)!
