Ext.define("Bigmedia.view.authentication.ShoppingCart", {
    extend: 'Bigmedia.view.authentication.LockingWindow',
    //extend: 'Ext.window.Window',
    xtype: 'shoppingcartform',

    requires: [
        "Bigmedia.view.authentication.ShoppingCartController",
        "Bigmedia.view.authentication.ShoppingCartModel",
        'Bigmedia.view.authentication.Dialog',
        'Ext.container.Container',
        'Ext.form.field.Text',
        'Ext.form.field.Checkbox',
        'Ext.button.Button',
        'Bigmedia.view.grid.Faces',
        'Ext.ux.statusbar.StatusBar'
    ],

    title: Bigmedia.Locales.cartTitle,
    //defaultFocus: 'authdialog', // Focus the Auth Form to force field focus as well
    closable: true,
    closeAction: "hide",
    // autoShow: false,
    // hidden: true,

    //layout: {
    //    type: 'vbox',
    //    //,
    //    align: 'middle',
    //    pack: 'center'
    //},
    // layout: 'center',
    layout: 'center',

    controller: "authentication-shoppingcart",
    viewModel: {
        // formulas: {
        //     isAnonymous: function () {
        //         return Bigmedia.Vars.getUser().get('id') === 'anonymous';
        //     }
        // }
        data: {
            isAnonymous: true
        }
    },
    // viewModel: {
    //     type: "authentication-shoppingcart"
    // },

    items: [
        // {
        //     xtype: 'container',
        //     width: '80%',
        //     height: '80%'
        //     layout: 'fit',
        //     items:
        {
            // anchor: '80% 80%',
            xtype: 'panel',
            bodyPadding: '20 20',
            cls: 'auth-dialog-login',
            header: false,
            scrollable: true,
            width: '70%',
            height: '80%',
            // width: 800,
            // anchor: '0 80%',
            //height: 700,
            layout: {
                type: 'vbox',
                align: 'stretch',
                //,
                pack: 'center'
            },
            defaults: {
                margin: '5 0'
            },
            items: [
                {
                    xtype: 'grid',
                    //xtype: 'faces-grid',
                    id: 'cartGrid',
                    reference: 'cartGrid',
                    flex: 1,
                    store: 'ShoppingCart',
                    selModel: {
                        type: 'checkboxmodel',
                        //type: 'rowmodel',
                        checkOnly: true
                    },
                    bbar: {
                        //id: 'statusCartGrid',
                        xtype: 'statusbar',
                        reference: 'statusCartGrid',

                        // defaults to use when the status is cleared:
                        defaultText: '',
                        defaultIconCls: 'default-icon',

                        // values to set initially:
                        text: 'Ready',
                        iconCls: 'ready-icon',

                        busyText: Bigmedia.Locales.statusBarLoading,

                        items: [
                            {
                                text: Bigmedia.Locales.cartBtnRemoveFromCart,
                                reference: 'removefromcartbtn',
                                iconCls: 'x-fa fa-trash',
                                disabled: true,
                                listeners: {
                                    click: 'removeFromCart'
                                }
                            },
                            {
                                reference: 'exportbtn',
                                text: Bigmedia.Locales.gridBtnExportToExcelText,
                                iconCls: 'x-fa fa-file-excel-o',
                                listeners: {
                                    click: "exportToExcel"
                                }
                            }]
                    },
                    //,
                    //title: Bigmedia.Locales.facesTitle,

                    columns: [
                        {
                            xtype: 'rownumberer',
                            width: 40,
                            sortable: false,
                            locked: true
                        },
                        {
                            text: Bigmedia.Locales.colFaceNum,
                            sortable: true,
                            dataIndex: 'num',
                            groupable: false,
                            width: 80
                            //,
                            //filter: 'number'
                        }, {
                            text: Bigmedia.Locales.colCity,
                            sortable: true,
                            dataIndex: 'city',
                            groupable: false,
                            width: 120,
                            filter: 'list'
                        }, {
                            text: Bigmedia.Locales.colAddress,
                            sortable: true,
                            dataIndex: 'address',
                            flex: 1,
                            groupable: false,
                            width: 250,
                            filter: {
                                type: 'string',
                                itemDefaults: {
                                    emptyText: Bigmedia.Locales.gridColumnStrFilterText
                                }
                            }
                        }, {
                            text: Bigmedia.Locales.colCat,
                            sortable: true,
                            dataIndex: 'catab',
                            groupable: false,
                            width: 40,
                            filter: 'list'
                        }, {
                            text: Bigmedia.Locales.colSize,
                            sortable: true,
                            dataIndex: 'size',
                            groupable: false,
                            width: 100,
                            filter: 'list'
                        }, {
                            text: Bigmedia.Locales.colNetwork,
                            sortable: true,
                            dataIndex: 'network',
                            groupable: false,
                            hidden: true,
                            width: 100,
                            filter: 'list'
                        }, {
                            text: Bigmedia.Locales.colZone,
                            sortable: true,
                            dataIndex: 'zone',
                            groupable: false,
                            width: 90,
                            filter: 'list'
                        }
                        // , {
                        //     text: Bigmedia.Locales.colRating,
                        //     sortable: true,
                        //     dataIndex: 'rating',
                        //     xtype: 'widgetcolumn',
                        //     hidden: true,
                        //     widget: {
                        //         xtype: 'rating',
                        //         trackOver: false,
                        //         disabled: true
                        //         //,
                        //         //listeners: {
                        //         //    beforechange: function(){ return false;}
                        //         //}
                        //     },
                        //     groupable: false,
                        //     width: 90,
                        //     filter: 'list'
                        // }
                        ,{
                            text: Bigmedia.Locales.colGRP,
                            sortable: true,
                            dataIndex: 'grp',
                            groupable: false,
                            width: 60,
                            hidden: true,
                            filter: 'number'
                            //,
                            //renderer: function(value) {
                            //    return Math.round(value * 100)/100;
                            //}
                        }, {
                            text: Bigmedia.Locales.colOTS,
                            sortable: true,
                            dataIndex: 'ots',
                            groupable: false,
                            width: 60,
                            hidden: true,
                            filter: 'number'
                        }, {
                            text: Bigmedia.Locales.colDoorsNo,
                            sortable: true,
                            dataIndex: 'doors_no',
                            groupable: false,
                            // hidden: true,
                            width: 60,
                            hidden: true,
                            filter: {
                                type: 'string',
                                itemDefaults: {
                                    emptyText: Bigmedia.Locales.gridColumnStrFilterText
                                }
                            }
                        }, {
                            text: Bigmedia.Locales.colOccupancy,
                            sortable: false,
                            dataIndex: 'occupancy',
                            xtype: 'widgetcolumn',
                            width: 220,
                            minWidth: 150,
                            hidden: true,
                            widget: {
                                xtype: 'occupancystate'
                            }
                        }
                        , {
                            //text: '',
                            width: 40,
                            xtype: 'widgetcolumn',
                            draggable: false,
                            hideable: false,
                            groupable: false,
                            sortable: false,
                            menuDisabled: true,
                            tooltip: Bigmedia.Locales.cartBtnRemoveItemTooltip,
                            //dataIndex: 'inCart',
                            widget: {
                                //width: 40,
                                //textAlign: 'left',
                                xtype: 'button',
                                cls: 'delete-focus-bg', //x-btn-header
                                ui: 'shopping-cart',
                                iconCls: 'x-fa fa-trash',
                                listeners: {
                                    click: 'removeItemFromCart'
                                }
                                //handler: function (btn) {
                                //    var rec = btn.getWidgetRecord();
                                //    //rec.set('inCart', false);
                                //    var facesStore = Ext.getStore('Faces'),
                                //        cartStore = Ext.getStore('ShoppingCart');
                                //    facesStore.getById(rec.id).set('inCart', false);
                                //    cartStore.remove(rec);
                                //}
                            }
                        }
                    ],
                    listeners: {
                        celldblclick: 'onDoubleClick',
                        selectionchange: 'onGridSelectionChange'
                    }
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'button',
                            scale: 'large',
                            ui: 'gray',
                            iconAlign: 'left',
                            iconCls: 'x-fa fa-angle-left',
                            text: Bigmedia.Locales.cartBtnBackToFacesText,
                            //listeners: {
                            //        click: 'backToFaces'
                            //    }
                            handler: 'backToFaces'
                        },
                        {
                            flex: 1
                        },
                        {
                            xtype: 'button',
                            reference: 'campaignBtn',
                            scale: 'large',
                            ui: 'soft-green',
                            iconAlign: 'right',
                            iconCls: 'x-fa fa-briefcase',
                            text: Bigmedia.Locales.cartBtnCampaignText,
                            bind: {
                                hidden: '{isAnonymous}'
                            },
                            //formBind: true
                            //,
                            listeners: {
                               click: 'onCampaignButton'
                            }
                        },
                        {
                            xtype: 'button',
                            reference: 'checkoutBtn',
                            scale: 'large',
                            ui: 'soft-green',
                            iconAlign: 'right',
                            iconCls: 'x-fa fa-angle-right',
                            bind: {
                                hidden: '{!isAnonymous}'
                            },
                            text: Bigmedia.Locales.cartBtnCheckoutText,
                            href: '#checkout',
                            hrefTarget: '_self'
                            //formBind: true
                            //,
                            //listeners: {
                            //    click: 'onCheckoutButton'
                            //}
                        }
                    ]
                }
            ]
        }
    // }
    ],

    // initialize: function () {
    //     var me = this,
    //         grid = me.down('grid'),
    //         statusBar = Ext.create('Ext.ux.StatusBar', {
    //             //id: 'statusCartGrid',
    //             reference: 'statusCartGrid',
    //
    //             // defaults to use when the status is cleared:
    //             defaultText: '',
    //             defaultIconCls: 'default-icon',
    //
    //             // values to set initially:
    //             text: 'Ready',
    //             iconCls: 'ready-icon',
    //             dock: 'bottom',
    //
    //             busyText: Bigmedia.Locales.statusBarLoading,
    //
    //             items: [
    //                 {
    //                     text: Bigmedia.Locales.cartBtnRemoveFromCart,
    //                     reference: 'removefromcartbtn',
    //                     iconCls: 'x-fa fa-trash',
    //                     disabled: true,
    //                     listeners: {
    //                         click: 'removeFromCart'
    //                     }
    //                 },
    //                 {
    //                     reference: 'exportbtn',
    //                     text: Bigmedia.Locales.gridBtnExportToExcelText,
    //                     iconCls: 'x-fa fa-file-excel-o',
    //                     listeners: {
    //                         click: "exportToExcel"
    //                     }
    //                 }]
    //         });
    //     grid.addDocked(statusBar);
    // },

    listeners: {
        close: function (win) {
            //Ext.util.History.back();
            this.getController().redirectTo('#');
        },
        show: function () {
            this.getController().updateStatusBar(this.lookupReference('cartGrid').getStore());
        }
    }
});
