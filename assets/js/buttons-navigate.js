(function($) {
    skel.breakpoints({
        xlarge: '(max-width: 1680px)',

        large: '(max-width: 1280px)',
        medium: '(max-width: 980px)',
        small:

            '(max-width: 736px)',
        xsmall: '(max-width: 480px)',
        xxsmall:

            '(max-width: 360px)'
    });
    $(function() {
        var $window = $(window),
            $document = $(document),
            $body = $('body'),

            $wrapper = $('#wrapper'),
            $footer = $('#footer');
        $window.on('load', function() {
            window.setTimeout(function()

                {
                    $body.removeClass('is-loading-0');
                    window.setTimeout(function() {
                        $body.removeClass('is-loading-1');

                    }, 1500);
                }, 100);
        });
        $('form').placeholder();
        var $wrapper = $('#wrapper'),

            $panels = $wrapper.children('.panel'),
            locked = true;
        $panels.not($panels.first()).addClass('inactive').hide();

        $panels.each(function() {
            var $this = $(this),
                $image = $this.children('.image'),

                $img = $image.find('img'),
                position = $img.data('position');
            $image.css('background-image', 'url(' + $img.attr('src') + ')');
            if (position) $image.css('background-position', position);
            $img.hide();
        });
        window.setTimeout(function() {
            locked = false;
        }, 1250);
        $('a[href^="#"]')
            .on('click', function(event) {
                var $this = $(this),
                    id = $this.attr('href'),
                    $panel = $(id),
                    $ul = $this.parents('ul'),
                    delay = 0;
                event.preventDefault();
                event.stopPropagation();
                if (locked) return;
                locked = true;
                $this.addClass('active');
                if ($ul.hasClass('spinX') || $ul.hasClass('spinY')) delay = 250;
                window.setTimeout(function() {
                    $panels.addClass('inactive');
                    $footer.addClass('inactive');
                    window.setTimeout(function() {
                        $panels.hide();
                        $panel.show();
                        $document.scrollTop(0);
                        window.setTimeout(function() {
                            $panel.removeClass('inactive');
                            $this.removeClass('active');
                            locked = false;
                            $window.triggerHandler('--refresh');
                            window.setTimeout(function() {
                                $footer.removeClass('inactive');
                            }, 250);
                        }, 100);
                    }, 350);
                }, delay);
            });
        if (skel.vars.IEVersion < 12) {
            $window.on('--refresh',
                function() {
                    $wrapper.css('height', 'auto');
                    window.setTimeout(function() {
                        var h = $wrapper.height(),
                            wh = $window.height();
                        if (h < wh) $wrapper.css('height', '100vh');
                    }, 0);
                    if (skel.vars.IEVersion < 10) {
                        var $panel = $('.panel').not('.inactive'),
                            $image = $panel.find('.image'),
                            $content = $panel.find('.content'),

                            ih = $image.height(),
                            ch = $content.height(),
                            x = Math.max(ih, ch);

                        $image.css('min-height', x + 'px');
                        $content.css('min-height', x + 'px');
                    }
                });
            $window.on('load', function()

                {
                    $window.triggerHandler('--refresh');
                });
            $('.spinX').removeClass('spinX');
            $('.spinY').removeClass('spinY');

        }

    });

})

(jQuery);