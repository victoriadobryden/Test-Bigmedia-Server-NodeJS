Ext.define('Bigmedia.view.det.DetFace', {
    extend: 'Ext.window.Window',

    requires: [
        'Bigmedia.view.drag.Image',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.field.File',
        'Bigmedia.view.det.DetSchema'
    ],
    xtype: 'detface',
    title: '',
    width: 300,
    height: 250,
    collapsible: false,
    minWidth: 250,
    minHeight: 180,
    layout: 'fit',
    resizable: true,
    modal: false,
    referenceHolder: true,
    closeAction: 'hide',

    config: {
        record: null,
        face: null,
        map: null
    },

    viewModel: {
        data: {
            record: null
        }
    },

    listeners: {
      show: function (detface) {
        // console.log('listeners show',detface)
        var detSchema = detface.up().lookup('detschema');
        if (detSchema && !detSchema.rendered) {
          detSchema.setHidden(false);
        }
      }
    },

    updateRecord: function (newVal) {
        var me = this;
        me.setFace(newVal);
    },

    updateFace: function (newVal) {
        // console.log('updateFace -> ',newVal)
        var me = this,
        doors = me.up().lookup('doorsphoto');
        me.getViewModel().set('record', newVal);
        var carousel = me.lookup('carousel');
        if (newVal) {
            if(newVal.get('doorsNo')!=null){
                doors.setTitle('DoorsNo. ' + newVal.get('doorsNo'));
                // doors.setHtml('<div style="background: "></div>')
                doors.setBodyStyle('background', 'center / cover no-repeat url(/photohub/doors/' + newVal.get('doorsNo') + ')');
            }
            var title = newVal.get('supplierNo') + (newVal.get('doorsNo') ? ' (' + newVal.get('doorsNo') + ')' : '');
            me.setTitle(title);
            // console.log(`newVal.get('photos') ->${newVal.get('photos')}, newVal.get('photoUrl')-> ${newVal.get('photoUrl')}`);
            if (newVal.get('photos') || newVal.get('photoUrl')) {
                // Proposals
                carousel.setFace(newVal);
            } else {
                var facesInfoStore = Ext.getStore('FacesInfo'),
                    photoId = newVal.getId(),
                    faceId = newVal.get('faceId');
                // console.log('newVal', newVal );
                // console.log('sideId', sideId );
                var info = facesInfoStore.getById(photoId);
                // var info = facesInfoStore.getById(faceId);
                // console.log('info', info );
                if (!info) {
                     Bigmedia.model.FaceInfo.load(photoId, {
                    // Bigmedia.model.FaceInfo.load(faceId, {
                        success: function (record, operation) {
                            // console.log(record);
                            facesInfoStore.add(record);
                            if (record.get('photos')) {
                                carousel.setFace(record);
                            } else {
                                carousel.setFace(newVal);
                            }
                        },
                        failure: function () {
                            carousel.setFace(newVal);
                        },
                    });
                } else {
                    if (info.get('photos')) {
                        carousel.setFace(info);
                    } else {
                        carousel.setFace(newVal);
                    }
                }
            }
            me.show();
        } else {
            carousel.setFace(null);
            me.setTitle('');
            doors.setTitle('');
            doors.setBodyStyle('background', '#FFFFFF');
        }
        var detSchema = me.up().lookup('detschema');
        detSchema.setFace(newVal);
    },

    updateMap: function (newVal) {
        // var me = this;
        // if (newVal) {
        //     var schema = me.lookup('detschema');
        //     schema.setMap(newVal);
        // }
    },

    items: [
        {
            xtype: 'panel',
            layout: 'fit',
            items: {
                xtype: 'facephotoscarousel',
                reference: 'carousel'
            }
        }
        // , {
        //     xtype: 'window',
        //     title: '',
        //     reference: 'doorsphoto',
        //     alwaysOnTop: true,
        //     hidden: true,
        //     closeAction: 'hide',
        //     width: 300,
        //     height: 250,
        //     collapsible: false,
        //     minWidth: 250,
        //     minHeight: 180,
        //     layout: 'fit',
        //     resizable: true,
        //     modal: false,
        // }
        // , {
        //     xtype: 'detschema',
        //     title: '',
        //     reference: 'detschema',
        //     alwaysOnTop: true,
        //     hidden: false,
        //     closeAction: 'hide',
        //     width: 300,
        //     height: 250,
        //     collapsible: false,
        //     minWidth: 250,
        //     minHeight: 180,
        //     layout: 'fit',
        //     resizable: true,
        //     modal: false,
        //     listeners: {
        //       boxready: function (schema) {
        //         var detface = schema.up('detface');
        //         schema.setX(detface.getX() + detface.getWidth());
        //         schema.setY(detface.getY());
        //         console.log([schema.getX(), schema.getY()]);
        //       }
        //     }
        // }
    ],

    tools: [
      {
        iconCls: 'x-fas fa-map-marked-alt',
        handler: function (btn, pressed) {
            var me = this,
                win = me.up('window'),
                detschema = win.up().lookup('detschema');
                // detschema = win.lookup('detschema');
            detschema.setHidden(!detschema.getHidden());
        }
      },
        {
            iconCls: 'x-fa fa-binoculars',
            // xtype: 'button',
            bind: {
                disabled: '{!record.doorsNo}'
                // pressed: '{!doorsphoto.hidden}'
            },
            // padding: 0, margin: 0,
            // enableToggle: true,
            handler: function (btn, pressed) {
                var me = this,
                    win = me.up('window'),
                    doorsWin = win.up().lookup('doorsphoto');
                if (!win.getFace() || !win.getFace().get('doorsNo')) {
                    return;
                }
                doorsWin.setHidden(!doorsWin.getHidden());
            }
        }
    ]
});
