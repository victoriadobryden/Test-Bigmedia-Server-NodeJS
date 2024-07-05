Ext.define('Bigmedia.view.dialog.DlgImportPoiFromFile', {
  extend: 'Ext.window.Window',
  xtype: 'dlgimportpoifromfile',

  title: 'Import POI from file',

  layout: 'fit',
  modal: true,
  width: 440,
  height: 200,
  resizable: true,
  closable: true,
  closeAction: 'destroy',
  referenceHolder: true,
  items: [{
      xtype: 'form',
      // title: 'Upload POI',
        width: 400,
        bodyPadding: 10,
        // frame: true,
        // renderTo: Ext.getBody(),
        items: [{
            xtype: 'filefield',
            name: 'pois',
            reference: 'poifile',
            fieldLabel: 'POI file',
            labelWidth: 50,
            msgTarget: 'side',
            allowBlank: false,
            anchor: '100%',
            buttonText: 'Select file...'
        }],

        buttons: [{
            text: 'Upload',
            handler: function() {
                var form = this.up('form').getForm(),
                    win = this.up('window'),
                    field = win.lookup('poifile');
                if(form.isValid()) {
                    win.fireEventArgs('uploadfile', [field.fileInputEl.dom.files[0]]);
                    win.close();
                    // form.submit({
                    //     url: 'photo-upload.php',
                    //     waitMsg: 'Uploading your photo...',
                    //     success: function(fp, o) {
                    //         Ext.Msg.alert('Success', 'Your photo "' + o.result.file +
                    //                                  '" has been uploaded.');
                    //     }
                    // });
                }
            }
        }]
  }]
});
