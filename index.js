;(function(factory){
if(typeof define == 'function' && define.amd){
    //seajs or requirejs environment
    define(['jquery', 'class'], factory);
}else if(typeof module === 'object' && typeof module.exports == 'object'){
    module.exports = factory(
        require('jquery'),
        require('class')
    );
}else{
    factory(window.jQuery, window.jQuery.klass);
}
})(function($, Class){
var Proxy = $.proxy;
var DropList = Class.$factory('droplist', {
    initialize: function(opt){
        this.options = $.extend({
            items: {},
            list: null,
            dom: null,
            container: document.body,
            width: false,
            height: false,
            hover: true,
            defaultValue: null,
            selectedClassName: ''
        }, opt || {});

        this.init();
    },

    init: function(){
        var self = this, options = self.options;

        self.value = '';

        self.$wraper = $('<div class="ui3-droplist"><span class="ui3-droplist-selected"></span><i class="ui3-droplist-arrow"></i></div>').appendTo(options.container);
        self.$list = $('<ul class="ui3-droplist-list"></ul>').appendTo(self.$wraper);

        self.$dom = options.dom ? $(options.dom) : null;
        self.setList(options.dom || options.list || options.items, options.defaultValue);
        self.initEvent();
        self.setSize(options.width, options.height);
    },

    initEvent: function(){
        var self = this, options = self.options;

        if(self.options.hover){
            self.$wraper.hover(Proxy(self.open, self), Proxy(self.close, self));
        }else{
            self.$wraper.find('ui3-droplist-selected').click(Proxy(self.toggle, self));

            self.$wraper.click(function(e){
                e.stopPropagation();
            });

            self.o2s(document, 'click', Proxy(self.close, self));
        }

        self.$list.delegate('.ui3-droplist-item', 'click', function(){
            var $this = $(this);
            var key = $this.attr('data-droplist-key'), value = $this.attr('data-droplist-value');

            self.close();
            self.setValue(value, key);
        });
    },

    open: function(){
        var self = this;

        if(!self.$wraper.hasClass('ui3-droplist-disabled')){
            self.$wraper.addClass('ui3-droplist-open');
            self.trigger('open');
        }
    },

    close: function(){
        var self = this;

        if(!self.$wraper.hasClass('ui3-droplist-disabled')){
            self.$wraper.removeClass('ui3-droplist-open');
            self.trigger('close');
        }
    },

    toggle: function(){
        var self = this;
        self.$list.is(':visible') ? self.close() : self.open();
    },

    setList: function(list, defaultValue, defaultKey){
        var self = this, $dom;

        if(list.nodeType || list instanceof $ || typeof list == 'string'){
            $dom = $(list);
            list = self.dom2list(list);
        }


        self.$list.html(DropList.createListHtml(list));
        self.setSize();

        if(self.$dom && (!$dom || $dom.get(0) !== self.$dom.get(0))){
            self.$dom.html(DropList.createDomHtml(list));
        }

        if(defaultValue){
            self.setValue(defaultValue, defaultKey);
        }else{
            var $first = $('.ui3-droplist-item:first', self.list);
            self.setValue($first.attr('data-droplist-value'), $first.attr('data-droplist-key'));
        }
    },

    setSize: function(width, height){
        var self = this;

        self.$list.css('width', 'auto');
        self.$wraper.add(self.$list).css('width', width || self.$list.width());

        if(height){
            self.$wraper.css('height', height);
            self.$wraper.find('.ui3-droplist-selected, .ui3-droplist-group-label, .ui3-droplist-item').css('line-height', height + 'px');
        }
    },

    setValue: function(value, key){
        var self = this;
        var className = self.options.selectedClassName;

        if(className){
            self.$list.find('.ui3-droplist-item').removeClass(className);
        }

        var $item = self.$list.find('[data-droplist-value="' + value + '"]');

        if($item.length){
            className && $item.addClass(className);
            
            if(!key){
                key = $item.attr('data-droplist-key');
            }    
        }

        self.$wraper.find('.ui3-droplist-selected').html(key);
        self.value = value;
        self.$dom && self.$dom.val(value);
        self.trigger('select', [value, key]);
    },

    getValue: function(){
        return this.value;
    },

    dom2list: function(dom, ungroup){
        var obj = {}, self = this;

        if(!ungroup){
            $('> optgroup', dom).each(function(){
                obj[$(this).attr('label')] = self.dom2list(this, true);
            });
        }

        $('> option', dom).each(function(){
            obj[$(this).html()] = this.value;
        });

        return obj;
    },

    disable: function(){
        var self = this;

        self.$wraper.addClass('ui3-droplist-disabled');
        self.$dom && self.$dom.attr('disabled', true);
    },

    enable: function(){
        var self = this;

        self.$wraper.addClass('ui3-droplist-disabled');
        self.$dom && self.$dom.removeAttr('disabled');
    },

    destroy: function(){
        var self = this;

        self.$wraper.remove();
        self.ofs(document, 'click');
        self.$dom && (self.$dom = null);
    }
});

DropList.createListHtml = function(list){
    var html = [];

    $.each(list, function(key, item){
        if(typeof item == 'object' && item){
            html.push('\
                <li class="ui3-droplist-group">\
                    <span href="javascript:;" class="ui3-droplist-group-label">' + key + '</span>\
                    <ul>' + DropList.createListHtml(item, multiple) + '</ul>\
                </li>'
            );
        }else{
            html.push('<li class="ui3-droplist-item" data-droplist-key="' + key + '" data-droplist-value="' + item + '" title="' + key + '">' + key + '</li>');
        }
    });

    return html.join('');
};

DropList.createDomHtml = function(list){
    var html = [];

    $.each(list, function(key, item){
        if(typeof item == 'object' && item){
            html.push('<optgroup label="' + key + '">' + DropList.createDomHtml(item) + '</optgroup>');
        }else{
            html.push('<option value="' + item + '">' + key + '</option>');
        }
    });

    return html.join('');
};

DropList.ARROW_WIDTH = 5;

return DropList;

});