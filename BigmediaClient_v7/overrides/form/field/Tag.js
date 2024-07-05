/**
 * Created by Alexander.Ustilov on 28.01.2016.
 */
Ext.define('Ext.overrides.form.field.Tag', {
  override: 'Ext.form.field.Tag',

  getMultiSelectItemMarkup: function() {
    var me = this,
      childElCls = (me._getChildElCls && me._getChildElCls()) || ''; // hook for rtl cls

    if (!me.multiSelectItemTpl) {
      if (!me.labelTpl) {
        me.labelTpl = '{' + me.displayField + '}';
      }
      me.labelTpl = me.lookupTpl('labelTpl');

      if (me.tipTpl) {
        me.tipTpl = me.lookupTpl('tipTpl');
      }

      me.multiSelectItemTpl = new Ext.XTemplate([
        '<tpl for=".">',
        '<li data-selectionIndex="{[xindex - 1]}" data-recordId="{internalId}" class="' + me.tagItemCls + childElCls,
        '<tpl if="this.isSelected(values)">',
        ' ' + me.tagSelectedCls,
        '</tpl>',
        '{%',
        'values = values.data;',
        '%}',
        me.tipTpl ? '" data-qtip="{[this.getTip(values)]}">' : '">',
        '<div class="' + me.tagItemTextCls + '">{[this.getItemLabel(values)]}</div>',
        '<div class="' + me.tagItemCloseCls + childElCls + '"></div>' ,
        '</li>' ,
        '</tpl>',
        {
          isSelected: function(rec) {
            return me.selectionModel.isSelected(rec);
          },
          getItemLabel: function(values) {
            //return Ext.String.htmlEncode(me.labelTpl.apply(values));
            return me.labelTpl.apply(values);
          },
          getTip: function(values) {
            return Ext.String.htmlEncode(me.tipTpl.apply(values));
          },
          strict: true
        }
      ]);
    }
    if (!me.multiSelectItemTpl.isTemplate) {
      me.multiSelectItemTpl = this.lookupTpl('multiSelectItemTpl');
    }

    return me.multiSelectItemTpl.apply(me.valueCollection.getRange());
  }
});
