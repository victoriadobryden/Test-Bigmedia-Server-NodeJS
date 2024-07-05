Ext.define('Bigmedia.view.drag.Image', {
    extend: 'Ext.panel.Panel',
    xtype: 'drag-image',
    controller: 'drag-image',

    requires: [
        'Ext.layout.container.Fit',
        'Bigmedia.view.drag.ImageController'
    ],

    title: Bigmedia.Locales.dragImageTitle,
    header: false,
    width: 500,
    height: 300,
    // bodyPadding: 5,
    layout: 'fit',

    config: {
        imageFormat: "image/jpeg",
        maxImageWidth: 1024,
        maxImageHeight: 1024,
        imageQuality: 0.8
    },

    bodyCls: 'drag-file-ct',

    html: '<div class="drag-image-content"></div>' +
        '<div class="drag-file-label">' +
            Bigmedia.Locales.dragImageDropText + '<br>' +
        '<div class="drag-file-icon"></div>' +
        '</div>'
});
