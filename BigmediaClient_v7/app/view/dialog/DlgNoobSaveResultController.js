Ext.define('Bigmedia.view.dialog.DlgNoobSaveResultController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.dialog-dlgnoobsaveresult',

  onSendClick: function () {
    var me = this,
      view = me.getView();
    view.fireEventArgs('send', [{email: me.lookup('useremail').getValue(), phone: me.lookup('userphone').getValue()}]);
    view.close();
  }

});
