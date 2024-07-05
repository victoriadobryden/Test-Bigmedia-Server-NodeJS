Ext.define('Bigmedia.carousel.CarouselContainer', {
    extend: 'Ext.container.Container',
    xtype: 'carousel',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    defaults: {flex: 1},
    config: {
        single: true
    },
    //, style: {
    //    background: 'url(http://3.bp.blogspot.com/-kanvyoXSOSs/Tsi0W496bzI/AAAAAAAAAG8/-Bq53wJqaqM/s320/carbonfibre.png)'
    //}
    // renderTpl: '',

    initComponent: function () {
        var me = this;

        //me.on('carouselchange', this.onC);

        me.callParent(arguments);

        me.on('add', me.itemsAdd, me, {buffer: 20});
        me.on('remove', me.itemRemove, me);
        me.on('afterlayout', function(c, layout){
            // layout.innerCt.el.setTop(0);
            // console.log(me.el.first());
            // console.log('afterlayout');
            // me.el.first().setStyle('top', '0px');
            me.el.first().setTop(0);
            // me.el.first().show();

            // console.log(me.el.first().getTop());
            // if (me.currentItem) {
            //     layout.innerCt.el.setLeft(-me.currentItem.el.getLeft());
            // }
            // console.log(layout);
        });
        me.on('childmove', function(c, layout){
            // layout.innerCt.el.setTop(0);
            // console.log(me.el.first());
            console.log('childmove');
            // me.el.first().setStyle('top', '0px');
            // me.el.first().setTop(0);
            // console.log(me.el.first().getTop());
            // if (me.currentItem) {
            //     layout.innerCt.el.setLeft(-me.currentItem.el.getLeft());
            // }
            // console.log(layout);
        });
    },
    itemsAdd: function () {
        var me = this;
        me.syncSizeToOwner();
        me.setSingle(me.items.items.length <= 1);
        // if (!me.currentItem) {
          me.currentItem = me.items.items[0];
        me.showChild(me.currentItem);
        // }
        //this.fireEvent('carouselitemsadd');
    },
    itemRemove: function () {
        var me = this;
        me.setSingle(me.items.items.length <= 1);
    },
    onDocMouseup: function (e) {
        var me = this;
        me.drag = false;
        var children = me.items.items;
        var parentLeft = me.ownerCt.el.getLeft();
        var rule = 1000000;
        var target;
        Ext.each(children, function (div, i) {
            l = Math.abs(div.el.getLeft() - parentLeft);
            if (l < rule) {
                rule = l;
                target = div;
            }
        });
        me.showChild(target);
        e.stopEvent();
    },
    onMousedown: function (e) {
        e.stopEvent();    // prevents selecting the underlying text and whatnot
        var me = this;
        me.drag = true;
        me.startX = e.getX();
        var par = me.el.first();
        par.on({
            mousemove: function (e) {
                e.stopEvent();    // prevents selecting the underlying text and whatnot
                if (me.drag) {
                    var rate = 1;
                    if (par.getLeft() > me.ownerCt.el.getLeft() || par.getRight() < me.ownerCt.el.getRight()) {
                        rate = 2;
                    }
                    par.move('l', (me.startX - e.getX()) / rate, false);
                    me.startX = e.getX();
                }
            }
        });
    },
    syncSizeToOwner: function () {
        var me = this;
        if (me.ownerCt && me.ownerCt.el) {
            me.setSize(me.ownerCt.el.getWidth() * me.items.items.length, me.ownerCt.el.getHeight());
        }
    },
    showChild: function (item) {
        if(! item){ return;}
        var me = this,
            left = item.el.getLeft() - me.el.getLeft();
        me.el.first().move('l', left, true);
        me.currentItem = item;
        me.fireEvent('itemchange', me, item);
    },
    nextChild: function () {
        var me = this;
        var next = me.currentItem.nextSibling();
        me.showChild(next || me.items.items[0]);
    },
    previousChild: function () {
        var me = this;
        var next = me.currentItem.previousSibling();
        me.showChild(next || me.items.items[me.items.items.length - 1]);
    },
    onRender: function () {
        var me = this;

        me.currentItem = me.items.items[0];

        if (me.ownerCt) {
            me.relayEvents(me.ownerCt, ['resize'], 'owner');
            me.on({
                ownerresize: me.syncSizeToOwner
            });
        }

        // me.mon(Ext.getBody(), 'mouseup', me.onDocMouseup, me);
        me.mon(Ext.fly(me.el.dom), 'mouseup', me.onDocMouseup, me);
        me.mon(Ext.fly(me.el.dom), 'mousedown', me.onMousedown, me);

        me.callParent(arguments);
    }
});
