$(document).ready(function() {
    $('textarea').keyup(function() {
        var textarea = $(this);
        var cursor = $(this).get(0).selectionStart;
        var text = $(this).val();
        var search = /@(\w*)/g;
        var hit;
        var pos = $(this).textareaHelper('caretPos');
        var areapos = $(this).position();
        while (hit = search.exec(text)) {
            if (hit.index <= cursor && hit.index + hit[0].length >= cursor && hit[1].length >= 3) {
                
                var pre = text.substring(0, hit.index);
                var post = text.substring(hit.index + hit[0].length, text.length);
                //console.log(hit);
                $.ajax({
                    type: "POST",
                    url: STUDIP.URLHelper.getURL('plugins.php/annotationhelperplugin/show'),
                    data: {search: hit[1]},
                    dataType: "json"
                })
                        .done(function(json) {
                            if (json.length > 0) {
                                var box = $('#annotation_box');
                                if (box.length < 1) {
                                    box = $('<ul>').attr("id", "annotation_box");
                                    $('body').append(box);
                                }
                                box.html('');
                                $.each(json, function(index, value) {
                                    box.append($('<li>').html(value.name).data('new', pre + '@' + value.username + post));
                                });

                                // Set click action
                                $('#annotation_box li').click(function() {
                                    textarea.val($(this).data('new'));
                                    textarea.focus();
                                });

                                box.css('left', pos.left + areapos.left + 20);
                                box.css('top', pos.top + areapos.top);
                            } else {
                                $('#annotation_box').remove();
                            }
                        });
            } else {
                $('#annotation_box').remove();
            }
        }
        ;
    })
            .focusout(function() {
                setTimeout(function() {$('#annotation_box').remove()}, 300);
            });
});