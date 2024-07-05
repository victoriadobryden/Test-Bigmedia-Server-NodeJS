Ext.define('Bigmedia.view.det.DetLogo', {
    extend: 'Ext.window.Window',

    requires: [
        'Bigmedia.view.drag.Image',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.field.File'
    ],

    reference: 'detlogo',

    title: 'Logo image',
    width: 500,
    height: 600,
    collapsible: false,
    minWidth: 300,
    minHeight: 380,
    layout: 'fit',
    resizable: true,
    modal: true,
    referenceHolder: true,
    // defaultFocus: 'LogoName',
    closeAction: 'hide',

    items: [{
        xtype: 'form',
        reference: 'windowForm',
        modelValidation: true,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        border: false,
        bodyPadding: 10,

        fieldDefaults: {
            msgTarget: 'side',
            labelAlign: 'top',
            labelWidth: 200,
            margin: '0 0 10px 0',
            margin: 0
        },
        defaults: {
            margin: '0 0 10px 0',
            margin: 0
        },

        items: [
            {
                xtype: 'drag-image',
                imageFormat: 'image/png',
                padding: '10px 0',
                flex: 1
            }, {
                xtype: 'filefield',
                accept: 'image/*',
                // margin: '10px 0',
                margin: 0,
                emptyText: Bigmedia.Locales.detLogoSelectImageEmptyText,
                // fieldLabel: 'or You can select file from disk:',
                name: 'photo-path',
                buttonText: '',
                buttonConfig: {
                    iconCls: 'x-fa fa-file-image-o'
                },
                listeners: {
                    change: function (filefield, value) {
                        var input = filefield.fileInputEl.dom;
                        if (input.files && input.files[0]) {
                            filefield.up('form').down('drag-image').getController().loadImage(input.files[0]);
                        }
                    }
                }
            }
        ],
        buttons: [{
            text: Bigmedia.Locales.btnCancelText,
            handler: function(btn) {
                var view = btn.up('window');
                // view.lookupReference('windowForm').getForm().reset();
                view.hide();
            }
        }, {
            text: Bigmedia.Locales.btnSaveText,
            handler: function(btn) {
                var detLogo = btn.up('window'),
                    formPanel = detLogo.lookupReference('windowForm'),
                    form = formPanel.getForm(),
                    dragImage = detLogo.down('drag-image');

                if (form.isValid()) {
                    detLogo.fireEvent('imagesave');
                    // if (dragImage.imageChanged && dragImage.dataURL) {
                    //     theLogo.set('subjectBlob', dragImage.dataURL);
                    // }
                    // if (theLogo.store) {
                    //     if (dragImage.imageChanged && dragImage.dataURL) {
                    //         theLogo.store.on('update',function(store, record){
                    //             record.load();
                    //         }, {single: true});
                    //     }
                    //     theLogo.store.sync();
                    // } else {
                    //     var mainView = detLogo.up('mainviewport'),
                    //         campCard = mainView.down('campcard');
                    //     var store = campCard.lookupViewModel().get('curCamp.Logos');
                    //     store.add(theLogo);
                    //     store.sync();
                    // }
                    form.reset();
                    detLogo.hide();
                }
            }
        }]
    }],

    getDataURL: function () {
        var dragImage = this.down('drag-image');
        return dragImage.dataURL;
    },

    listeners: {
        show: function (detLogo) {
            var logoURL = detLogo.getViewModel().get('logoURL'),
                body = detLogo.body,
                dragImage = detLogo.down('drag-image'),
                image = body.down('.drag-image-content'),
                label = body.down('.drag-file-label'),
                icon = body.down('.drag-file-icon'),
                fileField = detLogo.down('filefield');
            dragImage.imageChanged = false;
            dragImage.dataURL = logoURL;
            if (!logoURL) {
                this.lookupReference('windowForm').getForm().reset();
            }
            if (logoURL) {
                image.setStyle('background-image', 'url(' + logoURL + ')');
                label.setStyle('visibility', 'hidden');
                icon.setStyle('visibility', 'hidden');
                fileField.setRawValue(null);
            } else {
                image.setStyle('background-image', 'none');
                label.setStyle('visibility', 'visible');
                icon.setStyle('visibility', 'visible');
            }
        }
    }
});
