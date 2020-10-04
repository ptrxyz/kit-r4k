if (typeof jQuery == "function") {
	$(document).ready( function () {
		$("ol[reversed]").each(function() {
			$(this).css("counter-reset", "section " + ($(this).children("li").length + 1))
		})
		$(".last_change,.header_copyright").css("bottom", $("div.footer-meta-navigation").css("height"))
		/*
			Parameter ermöglichen das automatische Springen zu offenen Tabs und Akkordeons 
			https://www.oe.kit.edu/123.php?tab=["2016","2015"]
		*/
		try {
			var tab_click = new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true
			})
			const queryString = window.location.search
			const urlParams = new URLSearchParams(queryString)
			json = urlParams.get('tab')
			struct = JSON.parse(json)
			for (i in struct) {
				if ($("#toggle-head_" + struct[i]).length) {
					document.getElementById("toggle-head_" + struct[i]).dispatchEvent(tab_click)
					$("#toggle-head_" + struct[i]).parents(".tab-panel").each(function() {
						document.getElementById($(this).attr("aria-labelledby")).dispatchEvent(tab_click)
					})
					$("#toggle-head_" + struct[i]).parents(".toggle-head").each(function() {
						document.getElementById($(this).attr("id")).dispatchEvent(tab_click)
					})
				}
				if ($("#tab-" + struct[i]).length) {
					document.getElementById("tab-" + struct[i]).dispatchEvent(tab_click)
					$("#tab-" + struct[i]).parents(".tab-panel").each(function() {
						document.getElementById($(this).attr("aria-labelledby")).dispatchEvent(tab_click)
					})
					$("#tab-" + struct[i]).parents(".toggle-head").each(function() {
						document.getElementById($(this).attr("id")).dispatchEvent(tab_click)
					})
				}
			}
		}
		catch(e) {}

		$(".text figure").each(function() {
			if ($(this).css("float") == "right") $(this).css("margin-left", "0.625rem")
		})

		if ($("a.kit_fancybox").fancybox) {
			$("a.kit_fancybox").fancybox({})
		}

		$("#meta_search_label").on("click", function() {
			$("#meta_search_input").focus()
		})
		$("#side_widget_search_label").on("click", function() {
			$("#side_widget_search_input").focus()
		})

		function fix_banner() {
			if (window.document.documentMode) {
				$(".outer_banner").each( function() {
					img = $(this).find(".img-container img").attr("src")
					$(this).find(".img-container img").attr("src", "").attr("alt", "")
					$(this).find(".banner").css({"background-size":"75%", "background-position-x":"100%", "background-position-y":"25%", "background-repeat":"no-repeat", "background-image": "url(" + img + ")"})
				})
				$(".service-tile").each( function() {
					img = $(this).find(".container img").attr("src")
					$(this).find(".container img").attr("src", "").attr("alt", "")
					$(this).find(".container").css({"background-size":"100vh", "background-position-x":"50%", "background-position-y":"50%", "background-repeat":"no-repeat", "background-image": "url(" + img + ")"})
				})
			}
			$(".outer_banner").each(function() {
				if (window.innerWidth > 900) {
					$("#banner_" + $(this).attr("rel")).css({"max-width":"none", "position":"absolute", "width":$(window).width(), "left":"-" + ($(this).position().left) + "px", "margin-top":"0"})
				}
				else {
					$("#banner_" + $(this).attr("rel")).css({"position":"static", "width":"auto", "left":"0px", "margin-top":"0"})
				}
				bannerimagewidth = "100%"
				if (parseInt($("#banner_" + $(this).attr("rel") + " .img-container img")[0].naturalWidth) != 0) bannerimagewidth = $("#banner_" + $(this).attr("rel") + " .img-container img")[0].naturalWidth + "px"
				$("#banner_" + $(this).attr("rel") + " .img-container img").css({"width":bannerimagewidth, "height":$("#banner_" + $(this).attr("rel") + " .content-wrap").css("height")})
				if (window.innerWidth > 900) {
					$(this).css({"position":"relative", "width":$(window).width(), "max-width":$(window).width(), "height":$("#banner_" + $(this).attr("rel")).css("height")})
				}
				else {
					$(this).css({"position":"relative", "width":"auto", "max-width":"auto", "height":$("#banner_" + $(this).attr("rel")).css("height")})
				}
			})
		}
		if ($(".outer_banner").length > 0) {
			fix_banner()
			$(window).on("resize", fix_banner)
		}

		function fix_fixed_elements() {
			grid_iterator = 0
			if (window.innerWidth > 1280) {
				for (var key in grid_array) {
					$("#" + grid_array[key]["id"]).css("grid-row", grid_array[key]["row"])
				}
			}
			else if ((window.innerWidth > 900) && (window.innerWidth <= 1280)) {
				for (var key in grid_array) {
					if (grid_iterator < parseInt(grid_array[key]["row"])) grid_iterator = parseInt(grid_array[key]["row"])
					$("#" + grid_array[key]["id"]).css("grid-row", grid_iterator)
					if (grid_array[key]["size"] == "two-third") grid_iterator++
				}
			}
			else if ((window.innerWidth > 768) && (window.innerWidth <= 900)) {
				for (var key in grid_array) {
					if (grid_iterator < parseInt(grid_array[key]["row"])) grid_iterator = parseInt(grid_array[key]["row"])
					$("#" + grid_array[key]["id"]).css("grid-row", grid_iterator)
					if ((grid_array[key]["size"] == "two-third") || (grid_array[key]["size"] == "half")) grid_iterator++
				}
			}
			else if (window.innerWidth <= 768) {
				for (var key in grid_array) {
					if (grid_iterator < parseInt(grid_array[key]["row"])) grid_iterator = parseInt(grid_array[key]["row"])
					$("#" + grid_array[key]["id"]).css("grid-row", grid_iterator)
					grid_iterator++
				}
			}
		}

		var grid_array = []
		i = 0
		$(".content-wrap>.content>*").each(function() {
			if (!isNaN(parseInt($(this).css("grid-row")))) {
				size = ""
				if ($(this).hasClass("third")) size = "third"
				else if ($(this).hasClass("half")) size = "half"
				else if ($(this).hasClass("two-third")) size = "two-third"
				if (size != "") {
					grid_array[i] = {
						"id": $(this).attr("id"),
						"row": $(this).css("grid-row"),
						"size": size
					}
					i++
				}
			}
		})
		grid_array.sort(function(a,b) {
			if (a["size"] == "two-third") va = 8
			if (a["size"] == "half") va = 6
			if (a["size"] == "third") va = 4
			if (b["size"] == "two-third") vb = 8
			if (b["size"] == "half") vb = 6
			if (b["size"] == "third") vb = 4
			return vb - va
		})
		grid_array.sort(function(a,b) {
			return parseInt(a["row"]) - parseInt(b["row"])
		})
		if (grid_array.length > 0) {
			fix_fixed_elements()
			$(window).on("resize", fix_fixed_elements)
		}


		// Externe Links als solche kennzeichnen
		/*
		$("#middle-row a[href*='://']:not(:has(img)):not(:has(svg)):not(.dummy), #right-row a[href*='://']:not(:has(img)):not(:has(svg)):not(.dummy)").each( function() {
			href = $(this).attr("href")
			host = href.split(/\/+/g)[1]
			if (host != location.host) {
				if ((!$(this).attr("target")) && (host.indexOf('.kit.edu') == -1)) $(this).attr("target", "_blank")
				if ($(this).attr("title"))
					$(this).attr("title", $(this).attr("title") + " (externer Link: " + href + ")");
				else
					$(this).attr("title", "externer Link: " + href);
				$(this).append('&nbsp;<img class="external_link_symbol" src="<%img_external_link%>" alt="External Link" />')
			}
		})
		$(".external_link_symbol").css({"float": "none", "margin": "0"})
		*/
	})
}
/*
var _paq = window._paq || [];
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
	var u="https://tinki-wiki.scc.kit.edu/matomo/";
	_paq.push(['setTrackerUrl', u+'matomo.php']);
	_paq.push(['setSiteId', '3']);
	var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
	g.type='text/javascript';
	g.async=true;
	g.defer=true;
	g.src=u+'matomo.js';
	s.parentNode.insertBefore(g,s);
})();
*/
function noSpam() {
	var a = document.getElementsByTagName("a");
	for (var i = 0; i < a.length; i++) {
		if ( (a[i].href.search(/emailform\b/) != -1) && (a[i].className.search(/force_form\b/) == -1) ) {
			var nodes = a[i].childNodes;
			var email = '';
			for (var j = 0; j < nodes.length; j++) {
				if (nodes[j].innerHTML) {
					if (nodes[j].className.search(/caption/) == -1) {
						email += nodes[j].innerHTML; 
					}
				} else {
					email += nodes[j].data; 
				}
			}
			email = email.replace(/\u00a0/g, ' '); // &nbsp; in Leerzeichen wandeln
			email = email.replace(/\s/g, '.');
			email = email.replace(/∂/g, '@');
			if (email.search(/@/) != -1) a[i].href = "mailto:" + email;
		}
	}
}
function autoHeightAnimate(element, time){
	var curHeight = element.height(), autoHeight = element.css('height', 'auto').height(); // Get Auto Height
	element.height(curHeight);
	element.stop().animate({ height: autoHeight }, time);
}
function collapseFAQ() {
	(function(){
		var s = window.location.search.substring(1).split('&');
		if(!s.length) return;
		window.$_GET = {};
		for(var i  = 0; i < s.length; i++) {
			var parts = s[i].split('=');
			window.$_GET[unescape(parts[0])] = unescape(parts[1]);
		}
	}())
	question_found = false
	question = null
	answer_found = false
	answer = new Array()
	pair = 0
	$(".faq_answer, .faq_question").each( function() {
		if ($(this).hasClass("faq_question")) {
			if (answer_found) { // es wurde vorher schon mindestens eine Antwort gefunden
				if (question_found) { // zu diesen vorherigen Antworten gab es auch eine Frage
					pair++ // also haben wir ein Paar aus Frage und Antwort(en) gefunden
					for (var i=0; i<answer.length; i++) {
						answer[i].addClass("faq_" + pair + "_" + (i + 1)) // Antworten eindeutig markieren
						// answer[i].addClass("toggle-body")
						answer[i].attr("id", "toggle-body-" + pair) // Antworten eindeutig markieren
						answer[i].removeClass("faq_answer")
						answer[i].css({"height":"0", "overflow":"hidden", "display":"none"})
						question.attr("rel", question.attr("rel") + pair + "_" + (i + 1) + " ") // zur Frage gehörige Antworten in REL Attr merken
					}
					question.addClass("heading")
					question.wrap("<div class='toggle-head' id='toggle-head-" + pair + "'></div>")
					$("#toggle-head-" + pair).attr("rel", question.attr("rel"))
					$("#faq_dummy").remove()

					$("#toggle-head-" + pair).on("click", function() {
						answers = $.trim($(this).attr("rel")).split(" ")
						for (var i=0; i<answers.length; i++) {
							if ($(".faq_" + answers[i]).height() > 0) {
								$(this).children().first().removeClass("active")
								$(".faq_" + answers[i]).stop().animate({"height":"0"}, "fast", function() {$(this).css({"display":"none"})})
							}
							else {
								$(".faq_" + answers[i]).css({"display":"block"})
								$(this).children().first().addClass("active")
								autoHeightAnimate($(".faq_" + answers[i]), "fast")
							}
						}
					})

					question.removeClass('faq_question')
				}
				answer = new Array()
				answer_found = false
			}
			question_found = true
			question = $(this)
			question.attr("rel", "")
		}
		if ((question_found) && ($(this).hasClass("faq_answer"))) {
			answer_found = true
			answer.push($(this))
		}
	})
	if (answer_found) {
		if (question_found) { // zu diesen vorherigen Antworten gab es auch eine Frage
			pair++ // also haben wir ein Paar aus Frage und Antwort(en) gefunden
			for (var i=0; i<answer.length; i++) {
				answer[i].addClass("faq_" + pair + "_" + (i + 1)) // Antworten eindeutig markieren
				// answer[i].addClass("toggle-body")
				answer[i].attr("id", "toggle-body-" + pair) // Antworten eindeutig markieren
				answer[i].removeClass("faq_answer")
				answer[i].css({"height":"0", "overflow":"hidden"})
				question.attr("rel", question.attr("rel") + pair + "_" + (i + 1) + " ") // zur Frage gehörige Antworten in REL Attr merken
			}
			question.addClass("heading")
			question.wrap("<div class='toggle-head' id='toggle-head-" + pair + "'></div>")
			$("#toggle-head-" + pair).attr("rel", question.attr("rel"))
			$("#faq_dummy").remove()

			$("#toggle-head-" + pair).click( function() {
				answers = $.trim($(this).attr("rel")).split(" ")
				for (var i=0; i<answers.length; i++) {
					if ($(".faq_" + answers[i]).height() > 0) {
						$(this).children().first().removeClass("active")
						$(".faq_" + answers[i]).stop().animate({"height":"0"}, "fast", function() {$(this).css({"display":"none"})})
					}
					else {
						$(".faq_" + answers[i]).css({"display":"block"})
						$(this).children().first().addClass("active")
						autoHeightAnimate($(".faq_" + answers[i]), "fast")
					}
				}
			})

			question.removeClass('faq_question')
		} 
		answer = new Array()
		answer_found = false
	}
	// $(".toggle-head").on("click", function() {$(this).blur()})
}