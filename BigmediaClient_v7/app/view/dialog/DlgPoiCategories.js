Ext.define("Bigmedia.view.dialog.DlgPoiCategories", {
    extend: "Ext.window.Window",

    requires: [
        "Bigmedia.view.dialog.DlgPoiCategoriesController",
        "Bigmedia.view.dialog.DlgPoiCategoriesModel",
        'Ext.ux.statusbar.StatusBar',
        "Bigmedia.store.PoiLinkCatFaces"
    ],

    controller: "dialog-dlgpoicategories",
    // viewModel: {
    //     type: "dialog-dlgpoicategories"
    // },

    width: 400,
    height: 500,
    modal: true,
    hidden: true,
    autoDestroy: false,
    autoShow: false,
    closeAction: 'hide',
    title: Bigmedia.Locales.dlgPoiCategoriesTitle,
    layout: 'fit',
    items: {
        xtype: 'container',
        layout: 'vbox',
        defaults: {
            collapsed: true,
            padding: 3,
            margin: 3
        },
        items: [{
            xtype: 'fieldset',
            reference: 'fieldsetDistBefore',
            //flex: 1,
            title: Bigmedia.Locales.dlgPoiCategoriesFieldSetParams,
            //checkboxToggle: true,
            collapsible: true,
            width: '100%',
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: true
            },
            items: [
                {
                    xtype: 'slider',
                    // id: 'sliderPoiDist',
                    maxValue: 1000,
                    value: 1000,
                    increment: 10,
                    reference: 'Dstn',
                    fieldLabel: Bigmedia.Locales.dlgPoiCategoriesDistanceLabel,
                    width: 350,
                    labelWidth: 200,
                    listeners:{
                        changecomplete: 'onParamsChanged'
                    }
                },
                {
                    xtype: 'checkbox',
                    // id: 'chbPoiBefore',
                    reference: 'Bfr',
                    fieldLabel: Bigmedia.Locales.dlgPoiCategoriesBeforeLabel,
                    labelWidth: 200,
                    checked: false,
                    listeners:{
                        change: 'onParamsChanged'
                    }
                }
            ]
        }, {
            xtype: 'fieldset',
            reference:'fieldsetPoiTreeCat',
            flex: 1,
            title: Bigmedia.Locales.dlgPoiCategoriesFieldSetCat,
            //checkboxToggle: true,
            //collapsed: false,
            collapsible: true,
            width: '100%',
            layout: 'fit',
            defaults: {
                hideEmptyLabel: true
            },
            items: {
                xtype: 'treepanel',
                // id: 'treePoiCat',
                store: new Bigmedia.store.PoiLinkCatFaces,
                //store: null,
                //store:{
                //    type: 'poilinkcatfaces'
                //},
                reference: 'treeCat',
                rootVisible: false,
                columns: [{
                    xtype: 'treecolumn',
                    text: 'POI',
                    dataIndex: 'name',
                    flex: 1
                }, {
                    text: 'Faces',
                    dataIndex: 'addCount',
                    width: 100
                }],
                listeners: {
                    checkchange: 'onTreeCheckChanged'
                }
            },
            listeners: {
                beforeexpand: 'onFieldsetTreeCatExpand'
            }
        }, {
            xtype: 'fieldset',
            reference:'fieldsetPoiSearch',
            title: Bigmedia.Locales.dlgPoiCategoriesFieldSetPoiSearch,
            //checkboxToggle: true,
            collapsible: true,
            width: '100%',
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: true
            },
            items: {
                xtype: 'tagfield',
                reference: 'poisearch',
                layout: 'fit',
                flex: 1,
                queryParam: 'pname',
                typeAhead: false,
                hideTrigger: true,
                queryMode: 'remote',
                minChars: 3,
                filterPickList: true,
                triggerOnClick: false,
                displayField: 'name',
                valueField: 'name',
                publishes: 'value',
                labelTpl: new Ext.XTemplate('{name}<tpl if="addCount &gt; 0"><span class="tagfield-badge">{addCount}</span></tpl>', {
                        disableFormats: true
                    }
                ),
                tpl: new Ext.XTemplate(
                    '<ul class="x-list-plain"><tpl for=".">',
                    '<li role="option" class="x-boundlist-item <tpl if="addCount &lt;= 0">x-boundlist-item-disabled</tpl>">{name}<tpl if="addCount &gt; 0"><span class="tagfield-badge">+{addCount}</span></tpl></li>', //{[this.inGrid(values.id, targetGrid, filterField)]}
                    '</tpl></ul>',
                    {
                        disableFormats: true
                    }
                ),
                listeners: {
                    beforeselect: function (combo, record) {
                        return record.get('addCount') > 0;
                    },
                    change: 'onPoiValueChanged'
                },
                store: {
                    type: 'poisearch'
                }
            }
        }]
    },
    bbar: Ext.create('Ext.ux.StatusBar', {
        reference: 'statusBar',

        // defaults to use when the status is cleared:
        defaultText: Bigmedia.Locales.dlgPoiCategoriesStatusDefault,
        defaultIconCls: 'default-icon',

        // values to set initially:
        text: Bigmedia.Locales.dlgPoiCategoriesStatusDefault,
        iconCls: 'default-icon',
        //,
        //// any standard Toolbar items:
        items: [
            ' '
        ]
    }),
    buttons: [
        {
            text: Bigmedia.Locales.dlgPoiCategoriesCancelBtnLabel,
            listeners: {
                // Call is routed to our ViewController (Ticket.view.user.UserController) but
                // the "closeView" method is a helper inherited from Ext.app.ViewController.
                click: 'onCloseWindowClick'
            }
        }, '->',
        {
            text: Bigmedia.Locales.dlgPoiCategoriesCreateBtnLabel,
            reference: 'btnCreateFilter',
            //enabled: false,
            listeners: {
                click: 'onCreateFilterClick'
            }
        }
    ],
    listeners: {
        show: 'onShowView'
    },
    // initialize: function () {
    //     var me = this;
    //     me.addDocked(Ext.create('Ext.ux.statusbar.StatusBar', {
    //         reference: 'statusBar',
    //
    //         // defaults to use when the status is cleared:
    //         defaultText: Bigmedia.Locales.dlgPoiCategoriesStatusDefault,
    //         defaultIconCls: 'default-icon',
    //         dock: 'bottom',
    //
    //         // values to set initially:
    //         text: Bigmedia.Locales.dlgPoiCategoriesStatusDefault,
    //         iconCls: 'default-icon',
    //         //,
    //         //// any standard Toolbar items:
    //         items: [
    //             ' '
    //         ]
    //     }));
    // },
    showDialog: function (cbTag) {
        this.cbPoiTag = cbTag;
        this.show();
    }
});
