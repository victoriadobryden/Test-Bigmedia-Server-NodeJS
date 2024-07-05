Ext.define('Bigmedia.view.dialog.DlgIconImage', {
    extend: 'Ext.window.Window',

    requires: [
        'Bigmedia.view.drag.Image',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.field.File'
    ],

    reference: 'dlgiconimage',

    viewModel: {
        data: {
            theIcon: null
        }
    },

    config: {
        record: null
    },

    updateRecord: function (newVal) {
        var me = this,
            vm = me.getViewModel();
        vm.set('theIcon', newVal);
    },

    title: 'Custom icon style',
    alwaysOnTop: true,
    width: 300,
    height: 380,
    collapsible: false,
    minWidth: 300,
    minHeight: 380,
    layout: 'fit',
    resizable: true,
    modal: true,
    referenceHolder: true,
    // defaultFocus: 'posterName',
    closeAction: 'destroy',

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
            // {
            //     xtype: 'textfield',
            //     name: 'posterName',
            //     itemId: 'posterName',
            //     fieldLabel: Bigmedia.Locales.detPosterNameLabel,
            //     allowBlank: false,
            //     bind: {
            //         value: '{thePoster.name}'
            //     }
            // },
            {
                xtype: 'drag-image',
                maxImageWidth: 120,
                maxImageHeight: 120,
                imageFormat: 'image/png',
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
                var view = btn.up('window'),
                    vm = view.getViewModel(),
                    theIcon = vm.get('theIcon');
                theIcon.store.rejectChanges();
                // view.lookupReference('windowForm').getForm().reset();
                view.close();
            }
        }, {
            text: Bigmedia.Locales.btnSaveText,
            handler: function(btn) {
                var detIcon = btn.up('window'),
                    formPanel = detIcon.lookupReference('windowForm'),
                    form = formPanel.getForm(),
                    dragImage = detIcon.down('drag-image');

                if (form.isValid()) {
                    // In a real application, this would submit the form to the configured url
                    // form.submit();
                    var theIcon = detIcon.getViewModel().get('theIcon');
                    if (dragImage.imageChanged && dragImage.dataURL) {
                        theIcon.set('iconBlob', dragImage.dataURL);
                    }
                    if (theIcon.store) {
                        if (dragImage.imageChanged && dragImage.dataURL) {
                            theIcon.store.on('update',function(store, record){
                                record.load();
                            }, {single: true});
                        }
                        theIcon.store.sync();
                    }
                    //  else {
                    //     var mainView = detIcon.up('mainviewport'),
                    //         campCard = mainView.down('campcard');
                    //     var store = campCard.lookupViewModel().get('curCamp.posters');
                    //     store.add(thePoster);
                    //     store.sync();
                    // }

                    form.reset();
                    detIcon.hide();
                }
            }
        }]
    }],

    listeners: {
        show: function (detIcon) {
            var theIcon = detIcon.getViewModel().get('theIcon'),
                body = detIcon.body,
                dragImage = detIcon.down('drag-image'),
                image = body.down('.drag-image-content'),
                label = body.down('.drag-file-label'),
                icon = body.down('.drag-file-icon'),
                fileField = detIcon.down('filefield');
            dragImage.imageChanged = false;
            dragImage.dataURL = null;
            if (theIcon.phantom) {
                // console.log('phantom');
                this.lookupReference('windowForm').getForm().reset();
            }
            if (theIcon.getId() && !theIcon.phantom) {
                image.setStyle('background-image', 'url(/api/v1/icons/' + theIcon.getId() + '/image)');
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
