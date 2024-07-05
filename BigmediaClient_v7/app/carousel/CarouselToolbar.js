Ext.define('Bigmedia.carousel.CarouselToolbar', {
    extend: 'Ext.toolbar.Toolbar',

    requires: [
        "Ext.draw.Component",
        "Ext.draw.plugin.SpriteEvents"
    ],

    xtype: 'bmcarouseltoolbar',

    directionals: true,

    style: {
        'background-color': 'transparent !important'
    },

    initComponent: function () {
        var me = this;

        me.items = [{
            xtype: 'tbfill'
        }, {
            xtype: 'tbfill'
        }]

        me.callParent(arguments);
    },
    handleCarouselEvents: function (carousel) {
        var me = this;
        me.relayEvents(carousel, ['itemchange','add'], 'carousel');
        me.on('carouselitemchange', me.onCarouselChange, me, {buffer: 20});
        me.on('carouseladd', me.onCarouselItemsAdd, me, {buffer: 20});
    },
    onCarouselItemsAdd: function () {
        //console.log('before initSprites');
        this.initSprites();
        this.down('draw').getSurface().renderFrame();
    },
    initSprites: function () {
        var me = this,
            index = me.items.indexOf(me.down('tbfill')),
            circles = [], x = 0, r = 5, i = 0,
            draw = me.down('draw');
        //Ext.suspendLayouts();
        if(draw){
            me.remove(draw, true);
        }
        Ext.each(me.ownerCt.down('carousel').items.items, function (item) {
        // Ext.each(me.floatParent.down('carousel').items.items, function (item) {
            var config = {
                type: 'circle'
                , cx: x + r
                , cy: r
                , index: i
                , r: r
                , fillStyle: '#5fa2dd'
                , fillOpacity: i == 0 ? .8 : .4
                , group: 'carousel'
            };
            circles.push(config);
            x += 5 + r * 2;
            i++;
        });
        me.insert(index + 1, {
            plugins: ['spriteevents'],
            xtype: 'draw'
            , height: r * 2 + 1
            , width: i * (r * 2 + 5) - 4
            , sprites: circles,
            style: {
                'background': 'transparent'
            },
            bodyStyle: {
                background: 'transparent'
            },
            listeners: {
                spriteclick: function (item, event) {
                    var sprite = item && item.sprite;
                    if (sprite) {
                        sprite.setAttributes({fillOpacity: .4}, true);
                        var carousel = me.ownerCt.down('carousel');
                        carousel.showChild(carousel.items.items[sprite.index]);
                        sprite.getSurface().renderFrame();
                    }
                },
                spritemouseover: function (item, event) {
                    var sprite = item && item.sprite;
                    if (sprite) {

                    }
                },
                spritemouseout: function (item, event) {
                    var sprite = item && item.sprite;
                    if (sprite) {

                    }
                }
            }
        });
        //Ext.resumeLayouts();
    },
    onCarouselChange: function (carousel, item) {
        var me = this;
        var navSprites = me.down('draw').getSprites(); //.getSprites(); //Surface().getGroup('carousel');
        navSprites.forEach(function (s) {
            s.setAttributes({fillOpacity: .4}, true);
        });
        var i = carousel.items.indexOf(item);
        Ext.each(navSprites, function (s) {
            if (s.index == i) {
                s.setAttributes({fillOpacity: .8}, true)
                //s.animate({
                //    to: {
                //        opacity: .7
                //    }
                //});
            }
        });
        me.down('draw').getSurface().renderFrame();
    }
    , onRender: function () {
        var me = this;

        var prev = {
            // text: '<'
            iconCls: 'x-fa fa-chevron-left'
            , handler: function () {
                me.ownerCt.down('carousel').previousChild();
            }
        };

        var next = {
            // text: '>'
            iconCls: 'x-fa fa-chevron-right'
            , handler: function () {
                me.ownerCt.down('carousel').nextChild();
            }
        };

        Ext.suspendLayouts();
        if (me.directionals) {
            me.insert(0, prev);
            me.insert(me.items.items.length, next);
        }

        this.initSprites();

        //var index = me.items.indexOf(me.down('tbfill'));
        //var circles = [];
        //var x = 0, r = 5;
        //var i = 0;
        //Ext.each(me.ownerCt.down('carousel').items.items, function (item) {
        //    var config = {
        //        type: 'circle'
        //        , cx: x + r
        //        , cy: r
        //        , index: i
        //        , r: r
        //        , fillStyle: '#5fa2dd'
        //        , fillOpacity: i == 0 ? .7 : .2
        //        , group: 'carousel'
        //    };
        //    circles.push(config);
        //    x += 5 + r * 2;
        //    i++;
        //});
        //me.insert(index + 1, {
        //    plugins: ['spriteevents'],
        //    xtype: 'draw'
        //    , height: r * 2 + 1
        //    , width: i * (r * 2 + 5) - 4
        //    , sprites: circles,
        //    listeners: {
        //        spriteclick: function (item, event) {
        //            var sprite = item && item.sprite;
        //            if (sprite) {
        //                sprite.setAttributes({fillOpacity: .2}, true);
        //                var carousel = me.ownerCt.down('carousel');
        //                carousel.showChild(carousel.items.items[sprite.index]);
        //                sprite.getSurface().renderFrame();
        //            }
        //        },
        //        spritemouseover: function (item, event) {
        //            var sprite = item && item.sprite;
        //            if (sprite) {
        //
        //            }
        //        },
        //        spritemouseout: function (item, event) {
        //            var sprite = item && item.sprite;
        //            if (sprite) {
        //
        //            }
        //        }
        //    }
        //});

        Ext.resumeLayouts();

        //Ext.defer(function () {
        //    var c = me.down('draw').getSprites();
        //    //console.log(c); //surface.getGroup('carousel');
        //    Ext.each(c, function (s) {
        //        console.log(s);
        //        s.on({
        //            click: function (s) {
        //                c.setAttributes({opacity: .2}, true);
        //                var carousel = me.ownerCt.down('carousel');
        //                carousel.showChild(carousel.items.items[s.index]);
        //            }
        //        });
        //    });
        //}, 2);

        var carousel = me.ownerCt.down('carousel');
        // var carousel = me.floatParent.down('carousel');
        if (carousel) {
            me.handleCarouselEvents(carousel);
        }

        me.callParent(arguments);
    }
});
