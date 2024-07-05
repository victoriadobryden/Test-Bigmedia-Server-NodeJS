Ext.define('Bigmedia.component.CustomNumberField',{
  extend: 'Ext.form.field.Number',
  alias: 'widget.customnumberfield',

  initComponent: function() {
    var me = this;
    me.callParent();
    me.getTriggers().spinner.hidden = true;
  }

});
