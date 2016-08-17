'use strict';

var extractor = require('./extractor');
var hattori = require('./hattori');
var _ = require('underscore');

var rule = extractor.supported(document.URL);
var hattoriRule = hattori.supported(document.URL);

if(rule) {
    console.log('Hello, this is Scholar Ninja content script. Parsing', rule);

    var message = extractor.extract(document, rule);

    if(message) {
        var port = chrome.runtime.connect({name: 'content'});
        port.postMessage(message);
    }
}

if(hattoriRule) {
    console.log('Hello, this is Scholar Ninja content script. Enhancing', hattoriRule);

    var url = hattori.cleanUrl(document.URL);

    if(url) {
        var port = chrome.runtime.connect({name: 'hattori'});
        port.postMessage(url);
        port.onMessage.addListener(function(response) {
            if(response.results.length === 0) {
                return false;
            }
            console.log(response);
            var elem_sidebar = $('.repository-sidebar .only-with-full-nav');

            elem_sidebar.append('<div class="hattori_container"><p>See also:</p><div class="navigation" style="text-align: center"><a href="#" class="hattori-arrow prev"><span class="octicon octicon-arrow-small-left"></span> Prev</a> <span id="hattori_counter"></span> <a href="#" class="hattori-arrow next">Next <span class="octicon octicon-arrow-small-right"></span></a></div><div class="hattori_slide_container"><div id="hattori"><ul></ul></div></div><div class="scholar_ninja"><a href="https://twitter.com/ScholarNinja">Powered by <img src="' + chrome.extension.getURL('images/icon.svg') + '" height="12px"></a></div></div>');
            var elem_ul = $('#hattori ul');

            _.each(response.results, function(result) {
                var html = '<li><div class="hattori_slide"><p><a href="' + result.html_url + '"><strong><span class="octicon octicon-repo"></span> ' + result.full_name + '</strong></a> by <a href="' + result.owner.html_url + '"><strong>' + result.owner.login + '</a></strong> <span title="Citations"><span class="octicon octicon-link-external"></span>' + result.citations + '</span><span title="Stars"><span class="octicon octicon-star"></span>' + result.stargazers_count + '</span><span title="Forks"><span class="octicon octicon-git-branch"></span>' + result.forks_count + '</span></p><p class="description">' + result.description + '</p></div></li>';
                elem_ul.append(html);
            });

            $(function() {
                $('.hattori_container').show();

                var unslider = $('#hattori').unslider({
                    speed: 250,
                    delay: false,
                    complete: function (elem) {
                        console.log(elem);
                        var data = elem.data('unslider');
                        $('#hattori_counter').html((data.i + 1) + '/' + data.li.length);
                    }
                });

                var data = unslider.data('unslider');

                $('#hattori_counter').html('1/' + data.li.length);

                $('.hattori-arrow').click(function(e) {
                    e.preventDefault();
                    var fn = this.className.split(' ')[1];
                    // Either do unslider.data('unslider').next() or .prev() depending on the className
                    unslider.data('unslider')[fn]();
                });

            });
        });

    }
}
