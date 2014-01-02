(function(window, $) {
    function testVisibility(cls) {
        var el = $('<div />').addClass(cls).appendTo('body'),
            visible = el.css('display') !== 'none';
        el.remove();
        return visible;
    }
    $(window).on('resize', function() {
        $.each(breakpoints, function(size) {
            breakpoints[size] = testVisibility('visible-'+size);
            if(breakpoints[size]) {
                handlers[size].forEach(function(handler) {
                    handler();
                });
            }
        });
    });

    var body = $(window.document).find('body'),
        handlers = {
            xs: [],
            sm: [],
            md: [],
            lg: []
        },
        breakpoints = {
            xs: testVisibility('visible-xs'),
            sm: testVisibility('visible-sm'),
            md: testVisibility('visible-md'),
            lg: testVisibility('visible-lg')
        };
    window.registerOnSize = function registerOnSize(size, handler) {
        if(typeof handler === 'undefined') {
            registerOnSize(['xs', 'sm', 'md', 'lg'], size)
        }
        else if (typeof size === 'array') {
            size.forEach(function(size) {
                registerOnSize(size, handler)
            });
        }
        else {
            if(breakpoints[size]) {
                handler();
            }
            handlers[size].push(handler);
        }
    }
})(window, jQuery);