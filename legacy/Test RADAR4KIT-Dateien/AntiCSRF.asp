

if (!window.csrf) {

	window.csrf = (function() {

		var blankHtml = "/CMS/blank.htm";
		// detect IE9, 10, IE11 or IE-Edge
		var isIE_Edge = (navigator.userAgent.toLowerCase().indexOf(" edge\/") > -1);
		var isIE = (navigator.appName === "Microsoft Internet Explorer") || (navigator.userAgent.toLowerCase().indexOf("rv:11") > -1) || isIE_Edge;	
        var isIE9 = (IeBrowserVersion(navigator.userAgent) == 9);
		var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
        var antiCsrfModuleIsActive = "1" === "1";

		/**
		 * Overwrites the currently loaded document with an empty one. 
		 * <p>
		 * Do not kill the document the script is running in!
		 *
		 * @param doc The document to be reset
		 */
		function resetDocument(doc) {
			doc.open();
			doc.write("<html><body></body></html>");
			doc.close();
		}

		/**
		 * Creates an anchor in a document and executes click on it.
		 *
		 * @param doc Document to to create the anchor in.
		 * @param url Location to set in attribute 'href'.
		 * @param target Target to set in attribute 'target'. If undefined the attribute will be obmitted.
		 */
		function createAnchorAndExecuteClick(doc, url, target) {
			var a = doc.createElement("a");
			a.setAttribute("href", url);
			if (target) {
				a.setAttribute("target", target);
			}
			a.style.display = "none";
			doc.body.appendChild(a);
			a.click();
		}
	 
		// Override window.open to ensure that the Http referer header field
		// is set when using the Microsoft Internet Explorer
		if (isIE && antiCsrfModuleIsActive) {
             // backing up native window.open so that we can work around some problems with IE9 
             if (isIE9) {
                window.nativeOpen = window.open;
                window.otmsIsIE9 = true;
             }

			window.open = (function(open) {
				return function (url, name, features, replace) {
					var wnd = open(blankHtml, name, features, replace);

					if (!url) {
						// Do not apply workaround if an empty URL was passed.
						return wnd;
					}

					resetDocument(wnd.document);
					createAnchorAndExecuteClick(wnd.document, url);

					return wnd;
				};

			}(window.open));

		} // if isIE

		/**
		 * Wrapper for a native location object. Provides a similar, but
		 * simplified API for compatibility.
		 *
		 * @typedef {Object} LocationObjectWrapper
		 * @method assign
		 * @method replace
		 * @method reload
		 */

		/**
		 * Create a proxy that manually causes the browser to add the referrer
		 * header field when navigating unsing the location object.
		 *
		 * @param doc Document to whose location object calls should be passed.
		 * @return {LocationObjectWrapper} The wrapper object.
		 */
		function createLocationObjectForIe(doc) {
			return {
				assign: function (url) {
					var target;

					if (!doc.body) {
						resetDocument(doc);
					} else if(doc.body.nodeName === "FRAMESET") {
						// When we deal with a frameset, we cannot simply create an achor element inside the frameset
						// element. But we could create a new child frame and create the anchor there instead.
						var frame = doc.createElement("frame");

						// connect the frame element to the DOM. Do this at first or the following stuff wont work!
						doc.body.appendChild(frame);

						frame.setAttribute("src", "javascript:''");      // this will create the contentDocument
						doc = frame.contentWindow.document;              // switch doc to frame content
						resetDocument(doc)                               // this will reset the DOM and create the body element

						// We also need to take care about the target of the link. Because the child frames open up new
						// documents where the anchor would load the referred page into, we must specifiy '_parent'
						// as the anchor target in order to replace the frameset's content and not just the content of the
						// frame.
						target = "_parent";
					}

					// If we haven't created a new document (that would
					// always get the caller's URL as the base URL), we
					// need to add a base tag to the document we're
					// inserting a link into. Otherwise, the browser would
					// use the URL of doc as the base URL, instead of the
					// URL of the caller.
					var base = doc.getElementsByTagName("base")[0];
					if (!base) {
						base = doc.createElement("base");
						var head = doc.getElementsByTagName("head")[0];

						// In most cases, this mechanism is not needed (only if
						// caller and target frame are located in different
						// folders), so if we fail to get the head element,
						// doing nothing is a relatively safe bet
						if (head) {
							head.appendChild(base);
						}
					}
					base.setAttribute("href", document.location.href);

					createAnchorAndExecuteClick(doc, url, target);
				},

				replace: function(url) {
					return this.assign(url);
				},

				reload: function (forceGet) {
					//return doc.location.reload(forceGet);
             		return doc.location.replace(doc.location.href);
				}
			};
		}

		/**
		 * Creates a proxy to work around problems with firefox's 
		 * implementation of "location.assign()" and relative URLs:
		 *
		 * - If the target frame is empty (i.e., its location.href equals 
		 *   "about:blank", the call does not have an effect.
		 *
		 * - If the target frame already contains a document, the URL passed
		 *   to "location.assign()" is interpreted as relative to the currently
		 *   loaded document. As a result, subsequent calls like 
		 *   "location.assign('/my_path/x.htm')" will result in URLs like 
		 *   "/my_path/my_path/my_path/x.htm" being loaded into the frame
		 *   (ultimately leading to 404 HTTP responses).
		 *
		 * @param doc Document to whose location object calls should be passed.
		 * @return {LocationObjectWrapper} The wrapper object.
		 */        
		function createLocationObjectForFirefox(doc) {
			var l = doc.location;
			return {
				assign: function(url) {
					// The actual workaround just assigns the URL to 
					// "document.location". Note that assigning to
					// the local variable "l" does *not* work.
					doc.location = url;
				},
				replace: function(url) { return l.replace(url); },
				reload: function(forceGet) { return l.reload(forceGet); }
			};
		}

		/**
		 * Creates a location object proxy that simply passes on calls to
		 * a native location object.
		 *
		 * @param doc Document to whose location object calls should be passed.
		 * @return {LocationObjectWrapper} The wrapper object.
		 */
		function createLocationObjectProxy(doc) {
			var l = doc.location;
			return {
				assign: function(url) { return l.assign(url); },
				replace: function(url) { return l.replace(url); },
				reload: function(forceGet) { return l.reload(forceGet); }
			};
		}

		/**
		 * Adds stubs for location object properties which are not supported,
		 * which, when accessed, throw an exception. Does nothing in browsers
		 * which do not support Object.defineProperty.
		 *
		 * @param proxyObject the object to define property stubs on
		 */
		function tryAddPropertyStubs(proxyObject) {
			if (typeof Object.defineProperty !== "function") {
				return;
			}
			function nope() {
				throw new Error("You tried to access a property which would be available " +
					"on a DOM location object, but is not available on a " +
					"location object proxy returned by csrf.getLocation().");
			}
			var propertyNames = ("protocol host hostname port pathname " +
				"search href hash username password origin").split(" ");
			for (var i = 0; i < propertyNames.length; i++) {
				try {
					Object.defineProperty(proxyObject, propertyNames[i], {
						configurable: false, enumerable: false,
						get: nope, set: nope
					});
				}
				catch(e) {}
			}
		}

		return {
			/**
			 * Wraps the location object of the specified document with an
			 * object that ensures that when changing location, the referrer is
			 * sent, even in older Internet Explorers that don't support it
			 * directly.
			 *
			 * @param docOrWin Optionally, window to whose location object
			 *      calls should be passed, or the window's document. If none
			 *      is given, uses the current window's document.
			 * @return Wrapper for the location object.
			 */
			getLocation: function(docOrWin) {
				var doc = document;
				if (docOrWin) {
					doc = docOrWin.document || docOrWin;
				}
				var proxyObject;

				if (isIE) {
					proxyObject = createLocationObjectForIe(doc)
				} else if (isFirefox) {
					proxyObject = createLocationObjectForFirefox(doc)
				} else {
					proxyObject = createLocationObjectProxy(doc);
				}

				tryAddPropertyStubs(proxyObject);
				return proxyObject;
			},

			/**
			 * Calls a function when the document of a window has become 'ready'.
			 * In order for this to work, make sure the window really loads a
			 * page so that the 'onload' event gets fired.
			 *
			 * @param wnd The window object ot listen at. If the argument is
			 *            'undefined' then the top window is used instead.
			 * @param fn The callback function to call, when the document became
			 *           ready. The callback interface is fn(wnd) where wnd
			 *           will be the window that has become ready so its document
			 *           can be accessed and modified now.
			 */
			onWindowReady: function (wnd, fn) {
				if (!fn) {
					throw new Error("onDocumentReady requires a callback " + 
						"function to be passed");
				}


				wnd = wnd || window;

				if (window.chrome) {
					wnd.addEventListener("load", function() { fn(wnd); });
				} else {
					// For IE browsers wait until
					// wnd.document.open() is possible.
					// Otherwise an access denied error may occur.
					var check = true;                  
					while (check) {
						try {
							wnd.document.open();
							wnd.document.close();
							check = false;
						}
						catch (e) {
						}
					}

					fn(wnd);
				}
			}
		}
	}());
}
   /**
     * Retrieves the major version of the user's browser only if it's
     * Internet Explorer. See xcmsfunctions.asp.
     *
     * @param userAgent The user agent string that came with the HTTP request.
     * @return The major version of the browser as an integer; or, if the
     *         browser is not Internet Explorer, 0.
     */
    function IeBrowserVersion(userAgent) {
        if (!userAgent) {
            // No user agent string supplied
            return 0;
        }

        var msieVersion = 0;
        var matchUserAgent = userAgent.match(/MSIE (\d+\.)/);
        if (matchUserAgent && matchUserAgent[1]) {
            msieVersion = parseInt(matchUserAgent[1]);
            var matchTrident = userAgent.match(/Trident\/(\d+\.)/);
            var tridentVersion = matchTrident && matchTrident[1] ? parseInt(matchTrident[1]) : 0; 

            //Extended check is needed, because the detect MSIE version number may be incorrect.
            //Example: The MSIE version is 7, but the Trident is 5. Then the used browser is IE9.
            if (msieVersion < 8 && tridentVersion > 0) {
                //Explanation:
                //Since IE8 the major Trident version grows by one.
                //IE8  => Trident/4.0
                //IE9  => Trident/5.0
                //IE10 => Trident/6.0
                msieVersion = msieVersion + tridentVersion - 3;
            }
        }
        else if( userAgent.toLowerCase().indexOf("rv:11") > -1 ) {
            msieVersion = 11;
        }
        return msieVersion;
    }
