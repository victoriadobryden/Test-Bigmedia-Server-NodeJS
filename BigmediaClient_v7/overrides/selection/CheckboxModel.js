/**
 * Created by Alexander.Ustilov on 19.02.2016.
 */
/**
 * Deselects all records in the view.
 * @param {Boolean} [suppressEvent] True to suppress any deselect events
 */
Ext.define('Ext.overrides.selection.CheckboxModel', {
  override: 'Ext.selection.CheckboxModel',
  //deselectAll: function (suppressEvent) {
  //  var me = this;
  //
  //  me.suspendChanges();
  //  me.selected.clear();
  //  me.resumeChanges();
  //
  //  if (!suppressEvent && !me.destroyed) {
  //    me.maybeFireSelectionChange(true);
  //  }
  //}
  //,
  doDeselect: function(records, suppressEvent) {
    var me = this,
      selected = me.selected,
      i = 0,
      len, record,
      attempted = 0,
      accepted = 0,
      commit;

    if (me.locked || !me.store) {
      return false;
    }

    if (typeof records === "number") {
      // No matching record, jump out
      record = me.store.getAt(records);
      if (!record) {
        return false;
      }
      records = [record];
    } else if (!Ext.isArray(records)) {
      records = [records];
    }

    var clearAll = me.store.getTotalCount() === records.length;

    commit = function() {
      ++accepted;
      if(! clearAll) {
        selected.remove(record);
      }
      if (record === me.selectionStart) {
        me.selectionStart = null;
      }
    };

    len = records.length;

    me.suspendChanges();
    for (; i < len; i++) {
      record = records[i];
      if (me.isSelected(record)) {
        if (me.lastSelected === record) {
          me.lastSelected = selected.last();
        }
        ++attempted;
        me.onSelectChange(record, false, suppressEvent, commit);
        if (me.destroyed) {
          return false;
        }
      }
    }
    me.resumeChanges();

    if(clearAll){
      selected.clear();
    }

    // fire selchange if there was a change and there is no suppressEvent flag
    me.maybeFireSelectionChange(accepted > 0 && !suppressEvent);
    return accepted === attempted;
  }
  //,
  //onSelectChange: function() {
  //  this.callParent(arguments);
  //  if (!this.suspendChange) {
  //    this.updateHeaderState();
  //  }
  //}
});