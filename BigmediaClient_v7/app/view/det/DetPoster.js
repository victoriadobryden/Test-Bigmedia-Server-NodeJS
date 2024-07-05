Ext.define('Bigmedia.view.det.DetPoster', {
    extend: 'Ext.window.Window',

    requires: [
        'Bigmedia.view.drag.Image',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.field.File'
    ],

    reference: 'detposter',

    title: Bigmedia.Locales.detPosterTitle,
    width: 500,
    height: 600,
    collapsible: false,
    minWidth: 300,
    minHeight: 380,
    layout: 'fit',
    resizable: true,
    modal: true,
    referenceHolder: true,
    defaultFocus: 'posterName',
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

        items: [{
                xtype: 'textfield',
                name: 'posterName',
                itemId: 'posterName',
                fieldLabel: Bigmedia.Locales.detPosterNameLabel,
                allowBlank: false,
                bind: {
                    value: '{thePoster.name}'
                }
            }, {
                xtype: 'drag-image',
                padding: '10px 0',
                flex: 1
            }, {
                xtype: 'filefield',
                accept: 'image/*',
                // margin: '10px 0',
                margin: 0,
                emptyText: Bigmedia.Locales.detPosterSelectImageEmptyText,
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
                var detPoster = btn.up('window'),
                    formPanel = detPoster.lookupReference('windowForm'),
                    form = formPanel.getForm(),
                    dragImage = detPoster.down('drag-image');

                if (form.isValid()) {
                    // In a real application, this would submit the form to the configured url
                    // form.submit();
                    var thePoster = detPoster.getViewModel().get('thePoster');
                    if (dragImage.imageChanged && dragImage.dataURL) {
                        thePoster.set('subjectBlob', dragImage.dataURL);
                    }
                    if (thePoster.store) {
                        if (dragImage.imageChanged && dragImage.dataURL) {
                            thePoster.store.on('update',function(store, record){
                                record.load();
                            }, {single: true});
                        }
                        thePoster.store.sync();
                    } else {
                        var mainView = detPoster.up('mainviewport'),
                            campCard = mainView.down('campcard');
                        var store = campCard.lookupViewModel().get('curCamp.posters');
                        store.add(thePoster);
                        store.sync();
                    }

                    form.reset();
                    detPoster.hide();
                }
            }
        }]
    }],

    listeners: {
        show: function (detPoster) {
            var thePoster = detPoster.getViewModel().get('thePoster'),
                body = detPoster.body,
                dragImage = detPoster.down('drag-image'),
                image = body.down('.drag-image-content'),
                label = body.down('.drag-file-label'),
                icon = body.down('.drag-file-icon'),
                fileField = detPoster.down('filefield');
            dragImage.imageChanged = false;
            dragImage.dataURL = null;
            if (thePoster.phantom) {
                // console.log('phantom');
                this.lookupReference('windowForm').getForm().reset();
            }
            if (thePoster.get('subjectId')) {
                image.setStyle('background-image', 'url(/api/v1/subjects/' + thePoster.get('subjectId') + '/image.jpeg)');
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
