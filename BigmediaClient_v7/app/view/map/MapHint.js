Ext.define('Bigmedia.view.map.MapHint',{
    extend: 'Ext.Container',

    xtype: 'maphint',

    // requires: [
    // ],

    cls: 'ol-hint',
    width: 220,
    // minWidth: 200,
    // height: 50,
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

    config: {
        record: null,
        map: null,
        popupHtml: null
    },

    padding: 5,

    viewModel: {
        data: {
            gridRecord: null,
            popupRecord: null,
            popupHtml: null
            // popupHtml: '<b>{popupRecord.name}</b><br>' +
            //     '{popupRecord.city}<br>' +
            //     '<span data-qtip="{popupRecord.address}">{popupRecord.address} {popupRecord.housenumber}</span>'
        }
    },

    layout: {
        type: 'container'
        // ,
        // align: 'stretch'
    },

    updateRecord: function (newVal) {
        var me = this,
            vm = me.getViewModel();
        vm.set('gridRecord', newVal);
        vm.set('popupRecord', newVal);
        // vm.notify();
    },

    updatePopupHtml: function (newVal) {
        var me = this;
        if (newVal) {
            me.getViewModel().set('popupHtml', newVal);
        }
    },

    // html: '<div id="popup" class="ol-popup">' +
    //   '<a href="#" id="popup-closer" class="ol-popup-closer"></a>' +
    //   '<div id="popup-content"></div>' +
    // '</div>'

    items: [
        {
            type: 'component',
            baseCls: '',
            // style: {
            //     color: '#FFFFFF',
            //     backgroundColor: 'transparent'
            // },
            // itemId: 'faceinfo',
            width: 'auto',
            height: 'auto',
            // padding: '0 0 8 0',
            cls: 'hint-info',
            bind: {
                // html: '<b>{popupRecord.name}</b><br>' +
                    // '{popupRecord.city}<br>' +
                    // '<span data-qtip="{popupRecord.address}">{popupRecord.address} {popupRecord.housenumber}</span>'
                html: '{popupHtml}'
            }
        }
    ],

    listeners: {
        hide: function (tip) {
            // if (tip.carouselTimer) {
            //     clearTimeout(tip.carouselTimer);
            //     delete tip.carouselTimer;
            // }
            // delete(tip.photos);
        }
    }

});
