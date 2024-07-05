Ext.define("Bigmedia.view.dialog.DlgSearchPoi", {
    extend: "Ext.window.Window",

    requires: [
        "Bigmedia.view.dialog.DlgSearchPoiController",
        'Ext.ux.statusbar.StatusBar',
        "Bigmedia.store.PoiLinkCatFaces",
        'Ext.tree.Panel',
        'Ext.ux.FieldReplicator'
    ],

    controller: "dialog-dlgsearchpoi",
    // viewModel: {
    //     type: "dialog-dlgpoicategories"
    // },

    config: {
        poiStore: null
    },

    width: 500,
    height: 600,
    modal: true,
    hidden: true,
    autoDestroy: true,
    autoShow: true,
    alwaysOnTop: true,
    closeAction: 'destroy',
    title: 'Search POI',
    layout: 'fit',
    bbar: {
        xtype: 'statusbar',
        reference: 'searchstatus',
        defaultText: 'Select category to find POI',
        defaultIconCls: 'default-icon',

        // values to set initially:
        // text: 'Ready',
        iconCls: 'x-ready-icon',

        // any standard Toolbar items:
    },
    items: [
        {
            xtype: 'wizardform',
            reference: 'wizard',
            defaults: {
                header: false,
                xtype: 'wizardpage'
            },
            items: [
                {
                    xtype: 'wizardpage',
                    title: 'POI categories',
                    reference: 'poicat',
                    // iconCls: 'x-fa fa-calendar',
                    layout: {
                        type: 'fit'
                    },
                    // hideNextButton: true,
                    // hidePrevButton: true,
                    items: [
                        {
                            xtype: 'treepanel',
                            // id: 'treePoiCat',
                            store: 'PoiCategoriesTree',
                            //store: null,
                            reference: 'treeCat',
                            rootVisible: false,
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
                            }],
                            listeners: {
                                checkchange: function (node, checked) {
                                    function checkChange (item) {
                                        //if (item !== node) {
                                            item.set('checked', checked);
                                        //}
                                        if (item.childNodes.length > 0) {
                                            var children = item.childNodes;
                                            children.forEach(function (child) {
                                                checkChange(child);
                                            });
                                        }
                                    }
                                    checkChange(node);
                                    var me = this;
                                    me.up('wizardpage').setIsCompleted(this.getChecked().length > 0);
                                    if (me.deferId) {
                                        Ext.undefer(me.deferId);
                                    }
                                    me.deferId = Ext.defer(me.up('window').getController().updateSearchCondition, 1000, me.up('window').getController());
                                }
                            }
                        }
                    ]
                }, {
                    xtype: 'wizardpage',
                    title: 'POI name',
                    // reference: 'poicat',
                    // iconCls: 'x-fa fa-calendar',
                    layout: {
                        type: 'vbox',
                        align: 'stretch',
                        pack: 'center'
                    },
                    hideNextButton: true,
                    items: [{
                        xtype: 'container',
                        scrollable: true,
                        flex: 1,
                        layout: 'anchor',
                        reference: 'poinamecontainer',
                        items: [{
                            xtype: 'textfield',
                            plugins: {
                                fieldreplicator: true
                            },
                            fieldLabel: 'Name',
                            anchor: '0',
                            selectOnTab: false,
                            name: 'poiname',
                            onReplicate: function () {
                                // this.getStore().clearFilter();
                            },
                            listeners: {
                                change: function (field, newVal, oldVal) {
                                    if (this.deferId) {
                                        Ext.undefer(this.deferId);
                                    }
                                    this.deferId = Ext.defer(this.up('window').getController().updateSearchCondition, 500, this.up('window').getController());
                                }
                            }
                        }]
                    }, {
                        xtype: 'button',
                        text: 'Get POIs',
                        listeners: {
                            click: function (btn) {
                                this.up('window').getController().onGetPOIClick();
                            }
                        }
                    }]
                }
            ]
        }
    ],
    listeners: {
        show: 'onShowView'
    },
    showDialog: function (cbTag) {
        this.cbPoiTag = cbTag;
        this.show();
    }
});
