Ext.define('Bigmedia.view.det.DetMonitoring', {
    extend: 'Ext.window.Window',

    requires: [
        'Bigmedia.view.drag.Image',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.field.File'
    ],
    
    xtype: 'detmonitoring',
    // reference: 'detmonitoring',
    title: Bigmedia.Locales.detMotinoringTitle,
    width: 500,
    height: 600,
    collapsible: false,
    minWidth: 300,
    minHeight: 380,
    layout: 'fit',
    resizable: true,
    modal: true,
    referenceHolder: true,
    defaultFocus: 'brandId',
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
            msgTarget: 'brandId',
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
                name: 'Advevents',
                itemId: 'Advevents',
                fieldLabel: Bigmedia.Locales.detMonitoringBrandName,
                allowBlank: false,
                bind: {
                    value: '{monitoring.Advevents}'
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
                //emptyText: Bigmedia.Locales.detMonitoringSelectImageEmptyText,
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
                var detmonitoring = btn.up('window'),
                    formPanel = detmonitoring.lookupReference('windowForm'),
                    form = formPanel.getForm(),
                    dragImage = detmonitoring.down('drag-image');

                if (form.isValid()) {
                    // In a real application, this would submit the form to the configured url
                    // form.submit();
                    var theMonitoring = detmonitoring.getViewModel().get('theMonitoring');
                    if (dragImage.imageChanged && dragImage.dataURL) {
                        theMonitoring.set('subjectBlob', dragImage.dataURL);
                    }
                    if (theMonitoring.store) {
                        if (dragImage.imageChanged && dragImage.dataURL) {
                            theMonitoring.store.on('update',function(store, record){
                                record.load();
                            }, {single: true});
                        }
                        theMonitoring.store.sync();
                    } else {
                        var mainView = detmonitoring.up('mainviewport'),
                            campCard = mainView.down('campcard');
                        var store = campCard.lookupViewModel().get('DataMonitoring');
                        store.add(thePoster);
                        store.sync();
                    }

                    form.reset();
                    detmonitoring.hide();
                }
            }
        }]
    }],

    listeners: {
        show: function (detMonitoring) {
            // console.log('theMonitoring-->',theMonitoring)
            // var theMonitoring = detMonitoring.getViewModel().get('theMonitoring'),
            //     body = detMonitoring.body,
            //     dragImage = detMonitoring.down('drag-image'),
            //     image = body.down('.drag-image-content'),
            //     label = body.down('.drag-file-label'),
            //     icon = body.down('.drag-file-icon'),
            //     fileField = detMonitoring.down('filefield');
            // dragImage.imageChanged = false;
            // dragImage.dataURL = null;
            // if (theMonitoring.phantom) {
            //     // console.log('phantom');
            //     this.lookupReference('windowForm').getForm().reset();
            // }
            // console.log('theMonitoring-->',theMonitoring)
            // if (theMonitoring.get('subjectId')) {
            //     image.setStyle('background-image', 'url(/api/v1/subjects/' + theMonitoring.get('subjectId') + '/image.jpeg)');
            //     label.setStyle('visibility', 'hidden');
            //     icon.setStyle('visibility', 'hidden');
            //     fileField.setRawValue(null);
            // } else {
            //     image.setStyle('background-image', 'none');
            //     label.setStyle('visibility', 'visible');
            //     icon.setStyle('visibility', 'visible');
            // }
        }
    }
});
