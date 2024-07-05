Ext.define('Bigmedia.view.dialog.DlgIconStyle', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Bigmedia.view.dialog.DlgIconImage',
        'Ext.ux.colorpick.Selector'
    ],

    reference: 'dlgiconstyle',

    viewModel: {
        data: {
            iconStyle: 'default',
            isCategoryChecked: false,
            color: '0099CC'
        }
    },

    title: 'Icon style',
    width: 600,
    height: 580,
    collapsible: false,
    minWidth: 300,
    minHeight: 380,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    resizable: true,
    modal: true,
    referenceHolder: true,
    // defaultFocus: 'posterName',
    closeAction: 'destroy',

    items: [
        {
            xtype: 'container',
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    width: 220,
                    items: [
                        {
                            xtype: 'radiogroup',
                            fieldLabel: 'Select icon type',
                            labelAlign: 'top',
                            padding: 10,
                            columns: 1,
                            vertical: true,
                            width: '100%',
                            simpleValue: true,
                            bind: '{iconStyle}',
                            items: [
                                { boxLabel: 'Default icon', reference: 'chbdefault', inputValue: 'default', checked: true },
                                { boxLabel: 'Standard type icon', reference: 'chbcategory', inputValue: 'category'},
                                { boxLabel: 'Custom image icon', reference: 'chbcustom', inputValue: 'custom'}
                            ]
                        },
                        {
                            xtype: 'panel',
                            title: 'Preview',
                            flex: 1
                        }
                    ]
                }, {
                    xtype: 'container',
                    layout: 'fit',
                    flex: 1,
                    items: [
                        {
                            xtype: 'panel',
                            padding: 20,
                            html: 'Default circle style for icon.',
                            flex: 1,
                            bind: {
                                hidden: '{iconStyle !== "default"}'
                            }
                        }, {
                            xtype: 'panel',
                            html: 'Category',
                            flex: 1,
                            layout: 'fit',
                            bind: {
                                hidden: '{iconStyle !== "category"}'
                            },
                            items: [{
                                xtype: 'treepanel',
                                // id: 'treePoiCat',
                                store: 'PoiCategoriesTree',
                                //store: null,
                                reference: 'treecat',
                                rootVisible: false,
                                selModel: {
                                    type: 'rowmodel',
                                    mode: 'SINGLE'
                                },
                                listeners: {
                                    beforecheckchange: function (node, checked) {
                                        var me = this,
                                            vm = me.lookupViewModel();
                                        if (!node.isLeaf()) {
                                            return false;
                                        }
                                        me.getChecked().forEach(function(n){
                                            n.set('checked', false);
                                        });
                                        vm.set('isCategoryChecked', me.getChecked().length > 0);
                                    },
                                    checkchange: function () {
                                        var me = this,
                                            vm = me.lookupViewModel();
                                        vm.set('isCategoryChecked', me.getChecked().length > 0);
                                    }
                                },
                                columns: [{
                                    xtype: 'treecolumn',
                                    text: 'POI',
                                    dataIndex: 'name',
                                    flex: 1
                                },
                                {
                                    // xtype: 'treecolumn',
                                    text: 'Icon',
                                    dataIndex: 'iconPath',
                                    width: 80,
                                    renderer: function (value) {
                                        return '<img src="resources/images/symbols/' + value + '"';
                                    }
                                }]
                                // ,
                                // listeners: {
                                //     checkchange: function (node, checked) {
                                //         function checkChange (item) {
                                //             //if (item !== node) {
                                //                 item.set('checked', checked);
                                //             //}
                                //             if (item.childNodes.length > 0) {
                                //                 var children = item.childNodes;
                                //                 children.forEach(function (child) {
                                //                     checkChange(child);
                                //                 });
                                //             }
                                //         }
                                //         checkChange(node);
                                //         var me = this;
                                //         me.up('wizardpage').setIsCompleted(this.getChecked().length > 0);
                                //         if (me.deferId) {
                                //             Ext.undefer(me.deferId);
                                //         }
                                //         me.deferId = Ext.defer(me.up('window').getController().updateSearchCondition, 1000, me.up('window').getController());
                                //     }
                                // }
                            }]
                        }, {
                            xtype: 'panel',
                            html: 'Custom',
                            flex: 1,
                            bind: {
                                hidden: '{iconStyle !== "custom"}'
                            },
                            layout: 'fit',
                            items: [{
                                xtype: 'grid',
                                reference: 'usericons',
                                store: 'UserIcons',
                                allowDeselect: true,
                                selModel: {
                                    type: 'checkboxmodel',
                                    mode: 'SINGLE'
                                },
                                tbar: [
                                    { xtype: 'button', text: 'Create', handler: function () {
                                        var me = this,
                                            win = me.up('window'),
                                            iconStore = Ext.getStore('UserIcons'),
                                            dlg = Ext.create('Bigmedia.view.dialog.DlgIconImage', {
                                                record: iconStore.add({})[0]
                                            });
                                        dlg.show();
                                    }}, '->', {
                                        xtype: 'button', text: 'Remove',
                                        iconCls: 'x-fa fa-trash',
                                        bind: {
                                            disabled: '{!usericons.selection}'
                                        },
                                        handler: function () {
                                            var me = this,
                                                win = me.up('window'),
                                                grid = win.lookup('usericons'),
                                                iconStore = Ext.getStore('UserIcons');
                                            var arr = grid.getSelectionModel().getSelection();
                                            Ext.create('Ext.window.MessageBox', {
                                                // set closeAction to 'destroy' if this instance is not
                                                // intended to be reused by the application
                                                closeAction: 'destroy',
                                                alwaysOnTop: true,
                                                modal: true
                                            }).show({
                                                title: 'Are you sure?',
                                                message: 'Do you want to remove selected images?',
                                                buttons: Ext.Msg.YESNO,
                                                icon: Ext.Msg.QUESTION,
                                                fn: function(btn) {
                                                    if (btn === 'yes') {
                                                        // view.getStore().removeAll();
                                                        iconStore.remove(arr);
                                                        iconStore.sync();
                                                    } else {
                                                        // console.log('Cancel pressed');
                                                    }
                                                }
                                            });
                                        }
                                    }
                                ],
                                columns: [
                                    // { text: 'ID', dataIndex: 'id'},
                                    { text: 'Icon image',
                                        dataIndex: 'id',
                                        sortable: false,
                                        width: 250,
                                        renderer: function(value){
                                            var url = 'api/v1/icons/' + value + '/image';
                                            var res = '<div class="poster-picture"></div>';
                                            if (value && url ) { //&& value.id
                                                res = '<a href="' + url + '" target="_blank"><div class="poster-picture" style="background-image: url(' + url + ')"></div></a>';
                                            }
                                            return res;
                                        }
                                    },
                                    { xtype:'datecolumn', format: 'd.m.Y H:i', text: 'createdAt', dataIndex: 'createdAt'}
                                ]
                            }]
                        }
                    ]
                }
            ]
        }, {
            xtype: 'panel',
            collapsed: false,
            collapsible: true,
            title: 'Color',
            layout: 'fit',
            height: 200,
            items: [
                {
                    xtype: 'colorselector',
                    flex: 1,
                    bind: {
                        value: '{color}'
                        // hidden: '{iconStyle === "custom"}'
                    }
                }
            ]
        }
    ],
    buttons: [{
        text: Bigmedia.Locales.btnCancelText,
        handler: function(btn) {
            var view = btn.up('window');
            // view.lookupReference('windowForm').getForm().reset();
            view.close();
        }
    }, {
        text: Bigmedia.Locales.btnSaveText,
        bind: {
            disabled: '{!(iconStyle === "default" || (iconStyle === "category" && isCategoryChecked) || (iconStyle === "custom" && usericons.selection))}'
            // disabled: '{(iconStyle === "custom") && !usericons.selection}'
            //
        },
        handler: function(btn) {
            var win = btn.up('window'),
                vm = win.getViewModel(),
                treeCat = win.lookup('treecat'),
                userIcons = win.lookup('usericons');
            try {
                win.fireEventArgs('selectedstyle', [{
                    type: vm.get('iconStyle'),
                    color: vm.get('color'),
                    categoryId: (vm.get('iconStyle') === 'category' && vm.get('isCategoryChecked')) ? treeCat.getChecked()[0].getId() : null,
                    iconId: vm.get('iconStyle') === 'custom' ? userIcons.getSelectionModel().getSelection()[0].getId() : null
                }]);
            } catch (e) {
                console.error('error validate dialog: %o', e);
            } finally {
                win.close();
            }
        }
    }]
});
