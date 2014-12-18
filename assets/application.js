(function ($) {
    var annotation_box = $('<ul id="annotation_box"></ul>'),
        current_needle = false,
        hide_timeout   = false,
        fetch_timeout  = false,
        search_url;

    $(annotation_box).on('hover', 'li', function (event) {
        $(this).toggleClass('current-item', event.type === 'mouseenter');
    });

    function keyHandler(event) {
        var keycode = event.keyCode || event.charCode,
            items   = annotation_box.children(),
            current = items.filter('.current-item'),
            next    = false;

        if (keycode === 38) {
            // Move up
            if (current.length === 0 || current.is(':first-child')) {
                next = items.filter(':last-child');
            } else {
                next = current.prev();
            }
        } else if (keycode === 40) {
            // Move down
            if (current.length === 0 || current.is(':last-child')) {
                next = items.filter(':first-child');
            } else {
                next = current.next();
            }
        } else if (keycode === 13 && current.length !== 0) {
            // Select item
            current.click();
        } else if (keycode === 27) {
            // Close box
            hideBox(0);
        } else {
            return;
        }

        if (next) {
            next.addClass('current-item').siblings().removeClass('current-item');
        }

        return false;
    }

    function showBox(data, textarea, needle, pre, post) {
        clearTimeout(hide_timeout);

        if (data.length === 0) {
            annotation_box.hide();
            return;
        }

        var pos = $(textarea).textareaHelper('caretPos'),
            areapos = $(textarea).position(),
            current = false,
            regexp  = new RegExp('(' + needle + ')', 'gi');

        if (annotation_box.is(':visible')) {
            current = annotation_box.find('.current-item').data('username');
        }

        annotation_box.empty();

        $.each(data, function() {
            var item = $('<li>');
            item.html(this.name.replace(regexp, '<strong>$1</strong>'));
            $('<img>').attr('src', this.avatar).prependTo(item);
            item.data({
                replacement: pre + '@' + this.username + post,
                cursor: (pre + '@' + this.username).length,
                username: this.username
            });
            if (this.username === current) {
                item.addClass('current-item');
            }
            annotation_box.append(item);
        });

        // Set click action
        $('li', annotation_box).click(function() {
            var data = $(this).data();
            textarea.val(data.replacement);
            textarea[0].setSelectionRange(data.cursor, data.cursor);
            textarea.focus();

            current_needle = data.username;
            hideBox(0);
        });

        annotation_box.css({
            left: pos.left + areapos.left + 20,
            top: pos.top + areapos.top
        });

        if (annotation_box.is(':hidden')) {
            $(document).on('keypress', 'textarea', keyHandler);
            annotation_box.show();
        }
    }

    function hideBox(delay) {
        clearTimeout(hide_timeout);
        clearTimeout(fetch_timeout);

        if (delay) {
            hide_timeout = setTimeout(hideBox, delay);
        } else if (!annotation_box.is(':hidden')) {
            $(document).off('keypress', 'textarea', keyHandler);
            annotation_box.hide();
            if (delay !== 0) {
                current_needle = false;
            }
        }
    }

    $(document).on('keyup', 'textarea', function(event) {
        var textarea = $(this);
        var cursor = $(this).get(0).selectionStart;
        var text = $(this).val();
        var search = /(?:^|\W)@([\w-_@]{3,}|"[\w- ]{3,}"?)/gi;
        var hit;

        while (hit = search.exec(text)) {
            if (hit.index + 1 <= cursor && hit.index + hit[0].length >= cursor) {
                var pre = text.substring(0, hit.index + hit[0].indexOf('@'));
                var post = text.substring(hit.index + hit[0].length, text.length);
                var needle = hit[1];
                if (needle[0] === '"') {
                    needle = needle.substr(1);
                }
                if (needle[needle.length -1] === '"') {
                    needle = needle.substr(0, needle.length - 1);
                }

                if (needle !== current_needle) {
                    clearTimeout(fetch_timeout);
                    fetch_timeout = setTimeout(function () {
                        $.getJSON(search_url, {needle: needle}, function (json) {
                            showBox(json, textarea, needle, pre, post);
                        });
                    }, 300);
                    current_needle = needle;
                }

                return;
            }
        }

        hideBox();
    }).on('focusout', 'textarea', function() {
        hideBox(300);
    });

    // Inject box element into dom
    $(document).ready(function () {
        annotation_box.hide().appendTo('body');
        search_url = STUDIP.URLHelper.getURL('plugins.php/annotationhelperplugin/search');

    });
    
    STUDIP.AnnotationBox = {
        enable: function () {},
        disable: function () {}
    }
}(jQuery));