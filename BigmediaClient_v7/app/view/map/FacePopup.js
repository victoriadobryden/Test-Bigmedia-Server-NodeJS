Ext.define('Bigmedia.view.map.FacePopup',{
    extend: 'Ext.Container',

    xtype: 'facepopup',

    requires: [
        'Bigmedia.view.map.FacePopupController',
        'Ext.ux.rating.Picker'
    ],

    cls: 'ol-popup',
    width: 280,
    height: 250,
    header: false,
    // don't work
    // resizable: {
    //     target: 'elToResize',
    //     handles: 'all',
    //     dynamic: true,
    //     pinned: true,
    //     preserveRation: true,
    //     minWidth: 280,
    //     minHeight: 250,
    //     listeners: {
    //         resizedrag: function () {
    //             console.log('here');
    //         },
    //         beforeresize: function () {
    //             console.log('here');
    //         },
    //         resize: function () {
    //             console.log('here');
    //         }
    //     }
    // },

    controller: 'facepopup',

    config: {
        record: null,
        map: null
    },

    padding: 8,

    viewModel: {
        data: {
            gridRecord: null,
            popupFace: null,
            popupPhotoId: null,
            origFace: null,
            btnIcon: 'plus',
            btnHidden: false
        }
    },

    layout: {
        type: 'auto'
        // ,
        // align: 'stretch'
    },

    updateRecord: function (newVal) {
        var me = this,
            origStore = Ext.getStore('Faces'),
            thirdpartyStore = Ext.getStore('ThirdPartyBoards');
            vm = me.getViewModel(),
            cartStore = me.getMap().getCartStore();
        if (!cartStore) {
            vm.set('btnHidden', true);
        } else {
            if(cartStore.indexOf(newVal) >= 0) {
                vm.set('btnIcon', 'minus');
            } else {
                vm.set('btnIcon', 'plus');
            }
        }
        if (me.carouselTimer) {
            clearTimeout(me.carouselTimer);
            delete me.carouselTimer;
            if (me.carouselPhoto) {
                delete me.carouselPhoto;
            }
        }
        // delete(me.photos);
        vm.set('gridRecord', newVal);
        if (newVal.get('face')) {
            vm.set('popupFace', newVal.get('face'));
        } else {
            vm.set('popupFace', newVal);
        }
        // vm.notify();
        if (newVal) {
            var faceId = me.getViewModel().get('popupFace.id');
            var origFace = origStore.getById(faceId);
            if (!origFace) {
                origFace = thirdpartyStore.getById(faceId);
            }
            vm.set('origFace', origFace);
            vm.set('popupPhotoId', newVal.get('popupPhotoId'));
            // me.lookup('like').setPressed(newVal.get('decision') === 'A');
            // me.lookup('dislike').setPressed(newVal.get('decision') === 'D');
            // me.lookup('rating').setValue(newVal.get('customRating') || 0);

            var photos = vm.get('popupFace.photos');
            var showCarousel = function (photos) {
                if (!photos || photos.length === 0) {
                    var img = me.down('#facephoto');
                    me.carouselPhoto = null;
                    if (img) {
                        img.setStyle('background-image', 'url(/photohub/doors/' + newVal.get('doorsNo') + ')');
                    }
                    return;
                }
                me.photos = photos.map(function(item){
                    var img = new Image;
                    if (item.id) {
                        img.src = 'http://www.bigmedia.ua/cgi/getphoto_.pl?id=' + item.id;
                    } else if (item.src) {
                        img.src = item.src;
                    }
                    return img;});
                me.photoIndex = 0;
                var img = me.down('#facephoto');
                if (img) {
                    me.carouselPhoto = function () {
                        me.photoIndex = (me.photoIndex + 1) % me.photos.length;
                        if (img.getEl().dom) {
                            img.setStyle('background-image', 'url(' + me.photos[me.photoIndex].src + ')');
                        }
                        me.carouselTimer = setTimeout(me.carouselPhoto, 2000);
                    }
                    // tip.carouselPhoto();
                    if (img.getEl().dom) {
                        img.setStyle('background-image', 'url(' + me.photos[me.photoIndex].src + ')');
                    }
                }
                me.carouselTimer = setTimeout(me.carouselPhoto, 2000);
            }
            if (photos && photos.length>0) {
                showCarousel(photos);
            } else if (!origFace) {
                if (newVal.get('doorsNo')) {
                    var img = me.down('#facephoto');
                    me.carouselPhoto = null;
                    if (img && img.getEl().dom) {
                        img.setStyle('background-image', 'url(/photohub/doors/' + newVal.get('doorsNo') + ')');
                    }
                }
            } else if (origFace.get('urlPhoto')) {
                var img = me.down('#facephoto');
                me.carouselPhoto = null;
                if (img && img.getEl().dom) {
                    img.setStyle('background-image', 'url(' + origFace.get('urlPhoto') + ')');
                }
            } else {
                var facesInfoStore = Ext.getStore('FacesInfo');
                var photoId = vm.get('popupFace.id');
                var info = facesInfoStore.getById(photoId);
                if (!info) {
                    Bigmedia.model.FaceInfo.load(photoId, {
                        success: function (record, operation) {
                            facesInfoStore.add(record);
                            showCarousel(record.get('photos'));
                        },
                        failure: function () {
                            if (origFace.get('doorsNo')) {
                                var img = me.down('#facephoto');
                                me.carouselPhoto = null;
                                if (img && img.getEl().dom) {
                                    img.setStyle('background-image', 'url(/photohub/doors/' + origFace.get('doorsNo') + ')');
                                }
                            }
                        }
                    });
                } else {
                    showCarousel(info.get('photos'));
                }
            }
        }
    },

    suspendCarousel: function () {
        var me = this;
        if (me.carouselTimer) {
            clearTimeout(me.carouselTimer);
            delete me.carouselTimer;
        }
    },
    resumeCarousel: function () {
        if (this.carouselPhoto) {
            this.carouselPhoto();
        }
    },

    // html: '<div id="popup" class="ol-popup">' +
    //   '<a href="#" id="popup-closer" class="ol-popup-closer"></a>' +
    //   '<div id="popup-content"></div>' +
    // '</div>'

    items: [
        {
            type: 'container',
            baseCls: '',
            // style: {
            //     color: '#FFFFFF',
            //     backgroundColor: 'transparent'
            // },
            itemId: 'faceinfo',
            width: '100%',
            height: 40,
            padding: '0 0 8 0',
            cls: 'face-info',
            bind: {
                html: '<b>{popupFace.num}</b> - ' +
                    Bigmedia.Locales.colCity + ': <b>{popupFace.city}</b>. ' +
                    Bigmedia.Locales.colSize + ': <b>{popupFace.size}</b><br>' +
                    Bigmedia.Locales.colAddress + ': <b><span data-qtip="{popupFace.address}">{popupFace.address}</span></b>'
            }
        },
        {
            type: 'component',
            reference: 'facephoto',
            itemId: 'facephoto',
            width: '100%',
            // flex: 1,
            height: 152,
            cls: 'face-photo',
            listeners: {
                afterrender: function (item) {
                    var tip = item.up('facepopup');
                    item.getEl().dom.onclick = function() {
                        if (tip.carouselPhoto) {
                            window.open(
                                tip.photos[tip.photoIndex].src,
                                '_blank'
                            );
                        } else {
                            // console.log(item.getEl().dom.style);
                            var url = item.getEl().dom.style.backgroundImage;
                            url = url.match(/url\(\"(.*)\"\)/)[1];
                            window.open(
                                 url,
                                 '_blank'
                            );
                        }
                    }
                    item.getEl().dom.onmouseover = function() {
                        tip.suspendCarousel();
                    }
                    item.getEl().dom.onmouseout = function() {
                        tip.resumeCarousel();
                    }
                }
            }
        },
                {
                    xtype: 'container',
                    width: '100%',
                    cls: 'face-toolbar',
                    height: 40,
                    // padding: '8px 0px 0px 0px',
                    layout: {
                        type: 'auto'
                        // type: 'hbox',
                        // align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'checkbox',
                            reference: 'selectedInGrid',
                            cls: 'face-selected',
                            boxLabel: Bigmedia.Locales.mapFacePopupSelectedLabel,
                            flex: 1,
                            bind: {
                                value: '{gridRecord.selected}'
                            },
                            listeners: {
                                change: function (chb, value) {
                                    var rec = chb.up('facepopup').getViewModel().get('gridRecord');
                                    var map = chb.up('facepopup').getMap();
                                    if (!map) { return; }
                                    // var cartStore = Ext.getStore('ShoppingCart');
                                    var cartStore = map.getCartStore();
                                    var grid;
                                    if (cartStore && cartStore.getById(rec.getId()) && map.getCartGrid()) {
                                        grid = map.getCartGrid();
                                    } else {
                                        grid = map.getGrid();
                                    }
                                    if (!grid) { return; }
                                    if (value) {
                                        if (grid.select) {
                                            grid.select([rec],true);
                                        }
                                        else {
                                            grid.getView().focusRow(rec);
                                            grid.getSelectionModel().select([rec], true);
                                        }
                                    } else {
                                        if (grid.deselect) {
                                            grid.deselect([rec]);
                                        }
                                        else {
                                            grid.getSelectionModel().deselect([rec]);
                                        }
                                    }
                                    // var store = rec.getStore();
                                    // var grid;
                                    // if (store === map.getCartStore()) {
                                    //     grid = map.getCartGrid();
                                    // } else {
                                    //     grid = map.getGrid();
                                    // }
                                    // rec.set('selected',value);
                                }
                            }
                        },
                        // {
                        //     xtype: 'container',
                        //     flex: 1
                        // },
                        {
                            xtype: 'button',
                            reference: 'like',
                            enableToggle: true,
                            toggleGroup: 'like',
                            bind: {
                                pressed: '{origFace.inCart}',
                                iconCls: 'x-fa fa-{btnIcon}',
                                hidden: '{btnHidden}'
                            },
                            cls: 'face-like',
                            listeners: {
                                afterrender: function (btn) {
                                    btn.getEl().dom.onclick = function (evt) {
                                        var event = new Ext.event.Event(evt);
                                        btn.onClick(event);
                                    }
                                },
                                click: function (btn) {
                                    var rec = btn.up('facepopup').getViewModel().get('origFace');
                                    // var cartStore = Ext.getStore('ShoppingCart');
                                    var map = btn.up('facepopup').getMap();
                                    if (!map) {
                                        return;
                                    }
                                    // var mapView = map.up('facesmapview');
                                    // if (mapView) {
                                    //     mapView.lookupViewModel().set('replaceMode', true);
                                    //     map.setReplaceFaceId(rec.getId());
                                    // }
                                    // TODO: replace for
                                    var cartStore = map.getCartStore();
                                    // var globalCart = Ext.getStore('ShoppingCart');
                                    if (btn.pressed) {
                                        rec.set({inCart: true, selected: false}, {silent: true});
                                        if (map.getActions().add) {
                                            Ext.callback(map.getActions().add, map.getActions().scope, [rec]);
                                        } else {
                                            cartStore.add(rec);
                                        }
                                    } else {
                                        rec.set({inCart: false, selected: false}, {silent: true});
                                        if (map.getActions().remove) {
                                            Ext.callback(map.getActions().remove, map.getActions().scope, [rec]);
                                        } else {
                                            cartStore.remove(rec);
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
        //     ]
        // }
    ],

    listeners: {
        hide: function (tip) {
            if (tip.carouselTimer) {
                clearTimeout(tip.carouselTimer);
                delete tip.carouselTimer;
            }
            delete(tip.photos);
        }
    }

});
