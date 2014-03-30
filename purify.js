/* jshint boss: true */
/* global Text */
;(function(root, factory) {
    'use strict';
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        root.DOMPurify = factory();
    }
}(this, function() {
    'use strict';

    var DOMPurify = {};
    DOMPurify.sanitize = function(dirty, cfg) {

        /**
         * We consider the elements and attributes below to be safe. Ideally
         * don't add any new ones but feel free to remove unwanted ones.
         */

        /* allowed element names */
        var ALLOWED_TAGS = [

            // HTML
            'a','abbr','acronym','address','area','article','aside','audio','b',
            'bdi','bdo','big','blink','blockquote','body','br','button','canvas',
            'caption','center','cite','code','col','colgroup','content','data',
            'datalist','dd','decorator','del','details','dfn','dir','div','dl','dt',
            'element','em','fieldset','figcaption','figure','font','footer','form',
            'h1','h2','h3','h4','h5','h6','head','header','hgroup','hr','html','i',
            'img','input','ins','kbd','label','legend','li','main','map','mark',
            'marquee','menu','menuitem','meter','nav','nobr','ol','optgroup',
            'option','output','p','pre','progress','q','rp','rt','ruby','s','samp',
            'section','select','shadow','small','source','spacer','span','strike',
            'strong','style','sub','summary','sup','table','tbody','td','template',
            'textarea','tfoot','th','thead','time','tr','track','tt','u','ul','var',
            'video','wbr',

            // SVG
            'svg','altglyph','altglyphdef','altglyphitem','animatecolor',
            'animatemotion','animatetransform','circle','clippath','defs','desc',
            'ellipse','font','g','glyph','glyphref','hkern','image','line',
            'lineargradient','marker','mask','metadata','mpath','path','pattern',
            'polygon','polyline','radialgradient','rect','stop','switch','symbol',
            'text','textpath','title','tref','tspan','view','vkern',

            //MathML
            'math','menclose','merror','mfenced','mfrac','mglyph','mi','mlabeledtr',
            'mmuliscripts','mn','mo','mover','mpadded','mphantom','mroot','mrow',
            'ms','mpspace','msqrt','mystyle','msub','msup','msubsup','mtable','mtd',
            'mtext','mtr','munder','munderover',

            //Text
            '#text'
        ];

        /* Decide if custom data attributes are okay */
        var ALLOW_DATA_ATTR = true;

        /* Allowed attribute names */
        var ALLOWED_ATTR = [

            // HTML
            'name', 'id','href','action','class','title','alt','src','type',
            'height','width', 'method','rev','rel','accept','align','autocomplete',
            'xmlns','bgcolor','border','checked','cite','color','cols','colspan',
            'coords','datetime','default','dir','disabled','download','enctype',
            'for','headers','hidden','high','hreflang','ismap','label','lang',
            'list','loop', 'low','max','maxlength','media','min','multiple',
            'novalidate','open','optimum','pattern','placeholder','poster',
            'preload','pubdate','radiogroup','readonly','required','reversed',
            'rows','rowspan','spellcheck','scope','selected','shape','size','span',
            'srclang','start','step','style','summary','tabindex','usemap','value',

            // SVG
            'accent-height','accumulate','additivive','alignment-baseline',
            'ascent','azimuth','baseline-shift','bias','clip','clip-path',
            'clip-rule','color','color-interpolation','color-interpolation-filters',
            'color-profile','color-rendering','cx','cy','d','dy','dy','direction',
            'display','divisor','dur','elevation','end','fill','fill-opacity',
            'fill-rule','filter','flood-color','flood-opacity','font-family',
            'font-size','font-size-adjust','font-stretch','font-style','font-variant',
            'front-weight','image-rendering','in','in2','k1','k2','k3','k4','kerning',
            'letter-spacing','lighting-color','local','marker-end','marker-mid',
            'marker-start','max','mask','mode','min','operator','opacity','order',
            'overflow','paint-order','path','points','r','rx','ry','radius','restart',
            'scale','seed','shape-rendering','stop-color','stop-opacity',
            'stroke-dasharray','stroke-dashoffset','stroke-linecap','stroke-linejoin',
            'stroke-miterlimit','stroke-opacity','stroke','stroke-width','transform',
            'text-anchor','text-decoration','text-rendering','u1','u2','viewbox',
            'visibility','word-spacing','wrap','writing-mode','x','x1','x2','y',
            'y1','y2','z',

            // MathML
            'accent','accentunder','bevelled','close','columnsalign','columnlines',
            'columnspan','denomalign','depth','display','displaystyle','fence',
            'frame','largeop','length','linethickness','lspace','lquote',
            'mathbackground','mathcolor','mathsize','mathvariant','maxsize',
            'minsize','movablelimits','notation','numalign','open','rowalign',
            'rowlines','rowspacing','rowspan','rspace','rquote','scriptlevel',
            'scriptminsize','scriptsizemultiplier','selection','separator',
            'separators','stretchy','subscriptshift','supscriptshift','symmetric',
            'voffset',

            // XML
            'xlink:href','xml:id','xlink:title','xml:space'
        ];

        /* Decide if document with <html>... should be returned */
        var WHOLE_DOCUMENT = false;

        /* Decide if a DOM node or a string should be returned */
        var RETURN_DOM = false;

        /* Output should be safe for jQuery's $() factory? */
        var SAFE_FOR_JQUERY = false;

        /* Output should be free from DOM clobbering attacks? */
        var SANITIZE_DOM = true;

        /* Keep element content when removing element? */
        var KEEP_CONTENT = true;

        /* Ideally, do not touch anything below this line */
        /* ______________________________________________ */

        /**
         * _parseConfig
         *
         * @param  optional config literal
         */
        var _parseConfig = function(cfg) {
            cfg.ALLOWED_ATTR    ? ALLOWED_ATTR    = cfg.ALLOWED_ATTR    : null;
            cfg.ALLOWED_TAGS    ? ALLOWED_TAGS    = cfg.ALLOWED_TAGS    : null;
            cfg.ALLOW_DATA_ATTR ? ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR : null;
            cfg.SAFE_FOR_JQUERY ? SAFE_FOR_JQUERY = cfg.SAFE_FOR_JQUERY : null;
            cfg.WHOLE_DOCUMENT  ? WHOLE_DOCUMENT  = cfg.WHOLE_DOCUMENT  : null;
            cfg.RETURN_DOM      ? RETURN_DOM      = cfg.RETURN_DOM      : null;
            cfg.SANITIZE_DOM    ? SANITIZE_DOM    = cfg.SANITIZE_DOM    : null;
            cfg.KEEP_CONTENT    ? KEEP_CONTENT    = cfg.KEEP_CONTENT    : null;
        };

        /**
         * _createIterator
         *
         * @param  document/fragment to create iterator for
         * @return iterator instance
         */
        var _createIterator = function(doc) {
            return document.createNodeIterator(
                doc,
                NodeFilter.SHOW_ELEMENT
                | NodeFilter.SHOW_COMMENT
                | NodeFilter.SHOW_TEXT,
                function() { return NodeFilter.FILTER_ACCEPT; },
                false
            );
        };

        /**
         * _isClobbered
         *
         * @param  element to check for clobbering attacks
         * @return true if clobbered, false if safe
         */
        var _isClobbered = function(elm) {
            if(elm instanceof Text) {
                return false;
            }
            if (
                (elm.children && !(elm.children instanceof HTMLCollection))
                || typeof elm.nodeName !== 'string'
                || typeof elm.textContent !== 'string'
                || typeof elm.nodeType !== 'number'
                || typeof elm.COMMENT_NODE !== 'number'
                || typeof elm.setAttribute !== 'function'
                || typeof elm.cloneNode !== 'function'
                || typeof elm.removeAttributeNode !== 'function'
                || typeof elm.insertAdjacentHTML !== 'function'
                || typeof elm.attributes.item !== 'function'
            ) {
                return true;
            }
            return false;
        };

        /**
         * _sanitizeElements
         *
         * @protect removeChild
         * @protect nodeType
         * @protect nodeName
         * @protect textContent
         * @protect currentNode
         * @protect insertAdjacentHTML
         *
         * @param   node to check for permission to exist
         * @return  true if node was killed, false if left alive
         */
        var _sanitizeElements = function(currentNode) {
            if (
                _isClobbered(currentNode)
                || currentNode.nodeType === currentNode.COMMENT_NODE
                || ALLOWED_TAGS.indexOf(currentNode.nodeName.toLowerCase()) === -1
            ) {
                if(KEEP_CONTENT && currentNode.insertAdjacentHTML){
                    try {
                        currentNode.insertAdjacentHTML('AfterEnd', currentNode.innerHTML);
                    } catch(e) {}
                }
                currentNode.parentNode.removeChild(currentNode);
                return true;
            }
            if (SAFE_FOR_JQUERY && !currentNode.firstElementChild) {
                currentNode.textContent = currentNode.textContent.replace(/</g, '&lt;');
            }
            return false;
        };

        /**
         * _sanitizeAttributes
         *
         * @protect attributes
         * @protect removeAttribiuteNode
         * @protect setAttribute
         * @protect cloneNode
         *
         * @param   node to sanitize
         * @return  void
         */
        var _sanitizeAttributes = function(currentNode) {
            var regex = /^(\w+script|data):/gi,
                clonedNode = currentNode.cloneNode(true),
                tmp, clobbering;

            /* Check if we have attributes; if not we might have a text node */
            if(currentNode.attributes) {

                /* Go backwards over all attributes; safely remove bad ones */
                for (var attr = currentNode.attributes.length-1; attr >= 0; attr--) {
                    tmp = clonedNode.attributes[attr];
                    clobbering = false;
                    currentNode.removeAttribute(currentNode.attributes[attr].name);

                    if (tmp instanceof Attr) {
                        if(SANITIZE_DOM) {
                            if(tmp.name === 'id' && window[tmp.value]) {
                                clobbering = true;
                            }
                            if(tmp.name === 'name' && document[tmp.value]){
                                clobbering = true;
                            }
                        }

                        /* Safely handle custom data attributes */
                        if (
                            (ALLOWED_ATTR.indexOf(tmp.name.toLowerCase()) > -1 ||
                            (ALLOW_DATA_ATTR && tmp.name.match(/^data-[\w-]+/i)))
                            && !tmp.value.replace(/[\x00-\x20]/g,'').match(regex)
                            && !clobbering
                        ) {
                            currentNode.setAttribute(tmp.name, tmp.value);
                        }
                    }
            }
            }
        };

        /**
         * _sanitizeShadowDOM
         *
         * @param  fragment to iterate over recursively
         * @return void
         */
        var _sanitizeShadowDOM = function(fragment) {
            var shadowNode;
            var shadowIterator = _createIterator(fragment);

            while (shadowNode = shadowIterator.nextNode()) {

                /* Sanitize tags and elements */
                if (_sanitizeElements(shadowNode)) {
                    continue;
                }

                /* Deep shadow DOM detected */
                if (shadowNode.content instanceof DocumentFragment) {
                    _sanitizeShadowDOM(shadowNode.content);
                }

                /* Check attributes, sanitize if necessary */
                _sanitizeAttributes(shadowNode);
            }
        };

        /* Assign config vars */
        cfg ? _parseConfig(cfg) : null;

        /* Create documents to map markup to */
        var dom = document.implementation.createHTMLDocument('');
            dom.body.parentNode.removeChild(dom.body.parentNode.firstElementChild);
            dom.body.outerHTML = dirty;

        /* Work on whole document or just its body */
        var body = WHOLE_DOCUMENT ? dom.body.parentNode : dom.body;
        if (
            !(dom.body instanceof HTMLBodyElement) ||
            !(dom.body instanceof HTMLHtmlElement)
        ) {
            var freshdom = document.implementation.createHTMLDocument('');
            body = WHOLE_DOCUMENT
                ? freshdom.getElementsByTagName.call(dom,'html')[0]
                : freshdom.getElementsByTagName.call(dom,'body')[0];
        }

        /* Early exit in case document is empty */
        if(typeof body === 'undefined') {
            return '';
        }

        /* Get node iterator */
        var currentNode;
        var nodeIterator = _createIterator(body);

        /* Now start iterating over the created document */
        while (currentNode = nodeIterator.nextNode()) {
            /* Sanitize tags and elements */
            if (_sanitizeElements(currentNode)) {
                continue;
            }

            /* Shadow DOM detected, sanitize it */
            if (currentNode.content instanceof DocumentFragment) {
                _sanitizeShadowDOM(currentNode.content);
            }

            /* Check attributes, sanitize if necessary */
            _sanitizeAttributes(currentNode);
        }

        /* Return sanitized string or DOM */
        if (RETURN_DOM) {
            return body;
        }
        return WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    };
    return DOMPurify;
}));
