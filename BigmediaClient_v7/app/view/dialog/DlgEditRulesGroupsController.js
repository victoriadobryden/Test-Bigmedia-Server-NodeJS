Ext.define('Bigmedia.view.dialog.DlgEditRulesGroupsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dialog-dlgeditrulesgroups',

    requires: [
        'Bigmedia.view.dialog.DlgImportGroups',
        'Bigmedia.view.dialog.DlgEditRule',
        'Ext.exporter.File',
        'Bigmedia.view.dialog.DlgImportRules'
    ],

    onImportRulesImportClick: function (btn) {
        var me = this,
            destinationGroup = Ext.getStore('RulesGroups').getById(me.importRulesDialog.destinationGroupId),
            rulesObj = me.importRulesDialog.selectedObj,
            rules = Object.keys(rulesObj).map(function(ruleId){
                return rulesObj[ruleId].copy(null);
            });
        // console.log(rules);
        var groupsGrid = me.importRulesDialog.child('grid'),
            groups = groupsGrid.getSelectionModel().getSelection();
        groups.forEach(function(group){
            group.rules().each(function (rule) {
                if (!rulesObj[rule.getId()]) {
                    rules.push(rule.copy(null));
                }
            });
        });
        destinationGroup.rules().add(rules);
        destinationGroup.rules().sync();
        me.importRulesDialog = Ext.destroy(me.importRulesDialog);
    },

    onImportRulesCancelClick: function (btn) {
        this.importRulesDialog = Ext.destroy(this.importRulesDialog);
    },

    onImportRulesToolClick: function (btn) {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            grid = btn.up('grid'),
            store = vm.getStore('groupsForImport');
        store.removeFilter('filterDestinationGroup');
        store.addFilter({
            id: 'filterDestinationGroup',
            property: 'id',
            operator: '!=',
            value: grid.getParentGroup().getId()
        });
        me.importRulesDialog = view.add({
            xtype: 'dlgimportrules',
            destinationGroupId: grid.getParentGroup().getId(),
            listeners: {
                close: function () {
                    me.importRulesDialog = Ext.destroy(me.importRulesDialog);
                }
            }
        });
        me.importRulesDialog.show();
    },

    onAddGroupClick: function (btn) {
        Ext.getStore('RulesGroups').add({name: Bigmedia.Locales.discountBuilder.newGroupName});
      // var me = this;
      // me.getViewModel().getStore('groups').add({name: 'New Group'});
      // me.getViewModel().getStore('groups').sync();
    },

    onImportGroupsImportClick: function (btn) {
        var me = this,
            grid = me.lookup('importGroupGrid'),
            store = Ext.getStore('RulesGroups');
        grid.getSelectionModel().getSelection().forEach(function(group){
        // var copyGroup = me.getViewModel().getStore('groups').add(group.copy(null))[0],
            var copyGroup = store.add(group.copy(null))[0],
                copyRules = [];
            group.rules().each(function(rule){
                copyRules.push(rule.copy(null));
            });
            if (copyRules.length > 0) {
                copyGroup.rules().add(copyRules);
                copyGroup.rules().sync();
            }
        });
        me.importGroupsDialog = Ext.destroy(me.importGroupsDialog);
    },

    onImportGroupsCancelClick: function (btn) {
        this.importGroupsDialog = Ext.destroy(this.importGroupsDialog);
    },

    onImportClick: function (btn) {
        var me = this,
            view = me.getView();
      me.importGroupsDialog = view.add({
        xtype: 'dlgimportgroups',
        listeners: {
          close: function () {
            me.importGroupsDialog = Ext.destroy(me.importGroupsDialog);
          }
        }
      });
      me.importGroupsDialog.show();
    },

    uploadFileChange: function (field, value) {
      var me = this,
        reader = new FileReader();
      reader.onload = function(){
        try {
          var text = reader.result;
          var arr = JSON.parse(text);
          me.lookup('importGroupGrid').getStore().loadRawData(arr, true);
        } catch (e) {
          Ext.Msg.alert('File import error', 'File can not be imported: wrong file format.');
        } finally {

        }
        // console.log(arr);
      };
      reader.readAsText(field.fileInputEl.dom.files[0]);
    },

    onSaveToFileClick: function (btn) {
      var me = this,
        dlg = me.groupsDialog,
        grid = me.lookup('groupGrid'),
        arr = grid.getSelectionModel().getSelection().map(function(group){
          group.rules().load();
          return group.getData(true);
        });
      Ext.exporter.File.saveAs(JSON.stringify(arr), 'groups.json');
    },

    onAddRuleToolClick: function (btn) {
      // console.log(grid.getAssociatedEntity());
      var grid = btn.up('grid'),
        group = grid.getStore().getAssociatedEntity();
      this.createDialog(group.rules().add({})[0]);
    },

    onEditRuleActionClick: function (grid, rowIndex, colIndex) {
      var rec = grid.getStore().getAt(rowIndex);
      this.createDialog(rec);
    },

    onRemoveRuleActionClick: function (grid, rowIndex, colIndex) {
      var rec = grid.getStore().getAt(rowIndex);
      Ext.Msg.confirm(Bigmedia.Locales.discountBuilder.msgRemoveRuleTitle, Bigmedia.Locales.discountBuilder.msgRemoveText, function(btn, text){
        if (btn == 'yes'){
          rec.erase();
            // process text value and close...
        }
      });
    },

    onRemoveGroupClick: function (button) {
      var group = button.getWidgetRecord();
      Ext.Msg.confirm(Bigmedia.Locales.discountBuilder.msgRemoveGroupTitle, Bigmedia.Locales.discountBuilder.msgRemoveText, function(btn, text){
        if (btn == 'yes'){
            group.rules().removeAll();
            group.rules().sync();
            group.drop();
        }
      });
    },

    onSaveClick: function () {
        // Save the changes pending in the dialog's child session back to the
        // parent session.
        var dialog = this.dialog,
            form = this.lookupReference('form'),
            isEdit = this.isEdit,
            id;

        if (form.isValid()) {
            // if (!isEdit) {
            //     // Since we're not editing, we have a newly inserted record. Grab the id of
            //     // that record that exists in the child session
            //     id = dialog.getViewModel().get('theRule').id;
            // }
            // dialog.getSession().save();
            // if (!isEdit) {
            //     // Use the id of that child record to find the phantom in the parent session,
            //     // we can then use it to insert the record into our store
            //     this.getStore('rules').insert(0, this.getSession().getRecord('Rule', id));
            // }
            // this.getStore('rules').sync();
            // this.getViewModel().get('theGroup.rules').sync();
            this.dialog.getViewModel().get('theRule').save();
            this.dialog = Ext.destroy(this.dialog);
        }
    },

    onCancelClick: function () {
      // this.getStore('rules').rejectChanges();
      // this.dialog.getViewModel().get('theRule').store.rejectChanges();
      this.dialog.getViewModel().get('theRule').reject();
      this.dialog = Ext.destroy(this.dialog);
    },

    createDialog: function (record) {
      var me = this,
        view = me.getView();
      me.isEdit = !!record;
      me.dialog = view.add({
        xtype: 'dlgeditrule',
        viewModel: {
          data: {
            title: record ? Bigmedia.Locales.discountBuilder.dlgEditRuleTitle: Bigmedia.Locales.discountBuilder.addRuleTitle,
            theRule: record || this.getViewModel().get('theGroup.rules').add({})[0]
            // theRule: record || this.getStore('rules').add({})[0]
            // {
            //     type: 'Rule',
            //     create: true
            //   }
          }
          // If we are passed a record, a copy of it will be created in the newly spawned session.
          // Otherwise, create a new phantom company in the child.
          // links: {
          //   theRule: record || {
          //     type: 'Rule',
          //     create: true
          //   }
          // }
        },

        listeners: {
            close: function () {
                me.dialog.getViewModel().get('theRule').reject();
                me.dialog = Ext.destroy(this.dialog);
            }
        }

        // Creates a child session that will spawn from the current session
        // of this view.
        // session: true
      });

      this.dialog.show();
    }
});
