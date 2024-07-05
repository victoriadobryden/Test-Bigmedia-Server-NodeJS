Ext.define("Bigmedia.view.grid.Replaces", {
    extend: "Ext.grid.Panel",

    requires: [
        'Bigmedia.view.grid.ReplacesController'
    ],

    controller: 'grid-replaces',

    xtype: 'replaces-grid',

    plugins: {
        gridfilters: true
    },

    // bufferedRenderer: false,
    columnLines: true,
    padding: 0,
    bodyPadding: 0,
    margin: 0,
    referenceHolder: true,
    split: false,
    stateful: true,
    // forceFit: true,
    viewConfig: {
        cartStore: null,
        trackOver: false,
        stripeRows: true,
        enableTextSelection: false,
        markDirty: false
    },
    trackMouseOver: false,

    viewModel: {
        data: {
            hiddenToolBar: false,
            hiddenStatusBar: false,
            visiblePrice: false
        }
    },

    config: {
        // hideToolBar: false,
        // hideStatusBar: false,
        // showToolbar: false,
        showPrice: true,
        // showAddToCart: true,
        showDelete: true,
        detFace: null
        // ,
        // showRowStatus: true
    },

    initComponent: function () {
        this.callParent();
        this.enableBubble(['radiuschanged', 'addclick', 'replaceclick', 'sourcechanged']);
    },

    updateHideToolBar: function (newVal) {
        var me = this;
        me.getViewModel().set('hiddenToolBar', newVal);
    },

    updateHideStatusBar: function (newVal) {
        var me = this;
        me.getViewModel().set('hiddenStatusBar', newVal);
    },

    updateShowPrice: function (newVal) {
        var me = this;
        me.getViewModel().set('visiblePrice', newVal);
    },

    updateShowDelete: function (newVal) {
        var me = this;
        me.getViewModel().set('showDelete', newVal);
    },

    updateShowAddToCart: function (newVal) {
        var me = this;
        me.getViewModel().set('showAddToCart', newVal);
    },

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        reference: 'toolBar',
        bind: {
            hidden: '{!showToolbar}'
        },
        items: [
            {
                text: 'Configure', //TODO
                xtype: 'button',
                reference: 'configbtn',
                iconCls: 'x-fa fa-cogs',
                // disabled: true,
                listeners: {
                    click: 'onConfigClick'
                }
            }, '->',
            {
                xtype: 'slider',
                fieldLabel: 'Radius',
                labelWidth: 80,
                bind: {
                    value: '{replaceRadius}'
                },
                minValue: 10,
                maxValue: 2000,
                width: 400,
                useTips: true,
                tipText: function(thumb){
                    return thumb.value < 1000 ? thumb.value + ' m' : Math.round(thumb.value / 1000 * 100) / 100 + ' km';
                },
                listeners: {
                    changecomplete: 'onRadiusChange'
                }
            }
        ]
    }
    // , {
    //     xtype: 'statusbar',
    //     dock: 'bottom',
    //     reference: 'statusGrid',
    //     bind: {
    //         hidden: '{hiddenStatusBar}'
    //     },
    //     defaultText: '',
    //     defaultIconCls: 'default-icon',
    //     text: '',
    //     iconCls: 'x-status-ready',
    //     busyText: Bigmedia.Locales.statusBarLoading
    // }
    ],

    // title: Bigmedia.Locales.facesTitle,
    header: false,

    columns: [
        {
            text: Bigmedia.Locales.colDoorsNo,
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'doorsNo',
            groupable: false,
            hideable: false,
            draggable: false,
            width: 60,
            filter: {
                type: 'string'
            }
            // ,
            // locked: true
            //,
            //filter: 'number'
        },{
            text: 'SupplierNo',
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'supplierNo',
            groupable: false,
            hideable: true,
            hidden: false,
            draggable: false,
            width: 80,
            filter: {
                type: 'string'
            }
            // ,
            // locked: true
            //,
            //filter: 'number'
        }, {
            text: 'Distance',
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'distance',
            groupable: false,
            width: 60,
            filter: 'number'
            //,
            //renderer: function(value) {
            //    return Math.round(value * 100)/100;
            //}
        }, {
            text: Bigmedia.Locales.colSupplier,
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'supplier',
            groupable: false,
            width: 120,
            filter: 'list'
        }, {
            text: Bigmedia.Locales.colAddress,
            tdCls: 'tip',
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
        }
        , {
            text: Bigmedia.Locales.colCat,
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'catab',
            groupable: false,
            width: 40,
            filter: 'list'
        }, {
            text: Bigmedia.Locales.colSize,
            tdCls: 'tip',
            sortable: true,
            dataIndex: 'size',
            groupable: false,
            width: 100,
            filter: 'list'
        },
        // // {
        // //     text: Bigmedia.Locales.colLight,
        // //     sortable: true,
        // //     dataIndex: 'light',
        // //     groupable: false,
        // //     width: 40,
        // //     filter: 'list',
        // //     align: 'center',
        // //     width: 40,
        // //     renderer: function(value) {
        // //         var res = '';
        // //         switch (value) {
        // //             case '+':
        // //                 res = '<span class="x-fa fa-lightbulb-o" style="color: #ffd633"></span>';
        // //                 break;
        // //             case 'off':
        // //                 res = '<span class="x-fa fa-lightbulb-o" style="color: #8c8c8c"></span>';
        // //                 break;
        // //         }
        // //         return res;
        // //     }
        // // },
        // // {
        // //     text: Bigmedia.Locales.colNetwork,
        // //     sortable: true,
        // //     dataIndex: 'network',
        // //     groupable: false,
        // //     width: 100,
        // //     filter: 'list'
        // // },
        // // {
        // //     text: Bigmedia.Locales.colZone,
        // //     sortable: true,
        // //     dataIndex: 'zone',
        // //     groupable: false,
        // //     width: 90,
        // //     filter: 'list'
        // // }
        // // , {
        // //     text: Bigmedia.Locales.colRating,
        // //     sortable: true,
        // //     dataIndex: 'rating',
        // //     xtype: 'widgetcolumn',
        // //     widget: {
        // //         xtype: 'rating',
        // //         trackOver: false,
        // //         disabled: true
        // //         //,
        // //         //listeners: {
        // //         //    beforechange: function(){ return false;}
        // //         //}
        // //     },
        // //     groupable: false,
        // //     width: 90,
        // //     filter: 'list'
        // // }
        {
            text: Bigmedia.Locales.colGRP,
            tdCls: 'tip',
            xtype: 'templatecolumn',
            sortable: true,
            dataIndex: 'grp',
            groupable: false,
            tpl: '{grp}{deltaGrp}',
            width: 60,
            filter: 'number'
            //,
            //renderer: function(value) {
            //    return Math.round(value * 100)/100;
            //}
        }, {
            text: Bigmedia.Locales.colOTS,
            tdCls: 'tip',
            xtype: 'templatecolumn',
            sortable: true,
            dataIndex: 'ots',
            tpl: '{ots}{deltaOts}',
            groupable: false,
            width: 60,
            filter: 'number'
        }
        // // , {
        // //     text: Bigmedia.Locales.colDoorsNo,
        // //     sortable: true,
        // //     dataIndex: 'doors_no',
        // //     groupable: false,
        // //     // hidden: true,
        // //     width: 60,
        // //     filter: {
        // //         type: 'string',
        // //         itemDefaults: {
        // //             emptyText: Bigmedia.Locales.gridColumnStrFilterText
        // //         }
        // //     }
        // // }
        , {
            text: 'Price',
            tdCls: 'tip',
            // bind: {
            //     hidden: '{!visiblePrice}'
            // },
            xtype: 'templatecolumn',
            width: 100,
            sortable: true,
            reference: 'columnprice',
            dataIndex: 'finalPrice',
            // xtype: 'widgetcolumn',
            // hidden: true,
            hideable: false,
            filter: 'number',
            tpl: '{finalPrice}{deltaPrice}',
            // ,
            // width: 220,
            // minWidth: 150,
            // widget: {
            //     xtype: 'occupancystate'
            // }
        }
        // , {
        //     text: Bigmedia.Locales.colOccupancy,
        //     sortable: false,
        //     dataIndex: 'occupancy',
        //     // xtype: 'widgetcolumn',
        //     hidden: true,
        //     hideable: false
        //     // ,
        //     // width: 220,
        //     // minWidth: 150,
        //     // widget: {
        //     //     xtype: 'occupancystate'
        //     // }
        // }
        // {
        //     xtype:'actioncolumn',
        //     width:50,
        //     bind: {
        //         hidden: '{!showAddToCart}'
        //     },
        //     items: [{
        //         iconCls: 'x-fa fa-cart-arrow-down',
        //         tooltip: 'Add to cart',
        //         handler: 'addFaceToCartAction'
        //     }]
        // },
        ,
        {
            xtype:'actioncolumn',
            width:70,
            items: [{
                iconCls: 'x-fa fa-retweet',
                bind: {
                    disabled: '{!replaceFaceId}'
                },
                tooltip: 'Replace',
                handler: 'onReplaceClick'
                // function(tableView, rowIndex, colIndex) {
                //     var rec = tableView.getStore().getAt(rowIndex),
                //         cartStore = tableView.lookupViewModel().get('cartStore'),
                //         replaceFaceId = tableView.lookupViewModel().get('replaceFaceId');
                //     if (cartStore) {
                //         var faceToRemove = cartStore.getById(replaceFaceId);
                //         if (faceToRemove) {
                //             cartStore.remove(faceToRemove);
                //             cartStore.add(rec);
                //         }
                //     }
                // }
            },
            { xtype: 'tbspacer' }, {
                iconCls: 'x-fa fa-plus',
                tooltip: 'Add',
                handler: 'onAddClick'
                // function(tableView, rowIndex, colIndex) {
                //     var rec = tableView.getStore().getAt(rowIndex);
                //     var cartStore = tableView.lookupViewModel().get('cartStore');
                //     if (cartStore) {
                //         cartStore.add(rec);
                //     }
                // }
            }]
        }
        // , {
        //     text: '',
        //     width: 50,
        //     xtype: 'widgetcolumn',
        //     groupable: false,
        //     hidable: false,
        //     sizeable: false,
        //     bind: {
        //         hidden: '{!showAddToCart}'
        //     },
        //     sortable: false,
        //     ignoreExport: true,
        //     widget: {
        //         width: 40,
        //         xtype: 'button',
        //         iconCls: 'x-fa fa-cart-arrow-down',
        //         handler: function(btn) {
        //             var rec = btn.getWidgetRecord();
        //             btn.up('faces-grid').getController().addFaceToCart(rec.get('id'));
        //         }
        //     }
        // }
        // , {
        //     text: '',
        //     width: 50,
        //     xtype: 'widgetcolumn',
        //     groupable: false,
        //     hidable: false,
        //     sortable: false,
        //     sizeable: false,
        //     ignoreExport: true,
        //     bind: {
        //         hidden: '{!showDelete}'
        //     },
        //     widget: {
        //         width: 40,
        //         // textAlign: 'left',
        //         xtype: 'button',
        //         iconCls: 'x-fa fa-minus',
        //         handler: function (btn) {
        //             var rec = btn.getWidgetRecord(),
        //                 grid = btn.up('grid');
        //             grid.fireEventArgs('deleterecord', [grid, rec]);
        //         }
        //     }
        // }
    ],

    // updateStore: function (newVal, oldVal) {
    //     console.log('updateStore');
    //     console.log(oldVal);
    //     console.log(newVal);
    //     var me = this;
    //     if (oldVal) {
    //         oldVal.removeListener('datachanged', me.updateStatusBar);
    //     }
    //     if (newVal) {
    //         newVal.addListener('datachanged', me.updateStatusBar, me);
    //     }
    // },

    listeners: {
        render: function (grid) {
            var view = grid.getView();
            grid.tip = Ext.create('Ext.tip.ToolTip', {
                // The overall target element.
                target: view.getId(),
                // Each grid row causes its own separate show and hide.
                delegate: view.itemSelector + ' .tip',
                // Moving within the row should not hide the tip.
                trackMouse: true,
                // Render immediately so that tip.body can be referenced prior to the first show.
                // renderTo: Ext.getBody(),
                listeners: {
                    // Change content dynamically depending on which element triggered the show.
                    beforeshow: function (tip) {
                        var tipGridView = tip.target.component,
                            rec = tipGridView.getRecord(tip.triggerElement);
                        // tip.update(rec.get('address'));
                        tip.update(rec.get('doorsNo') + '(' + rec.get('supplierNo') + ') ' + rec.get('city') + ', ' + rec.get('address'));
                    }
                }
            });
        },
        destroy: function (grid) {
            delete grid.tip;
        },
        // show: 'onGridShow',
        reconfigure: function (grid, store, columns, oldStore, oldColumns) {
            // if (store !== oldStore) {
            //     if (oldStore) {
            //         oldStore.removeListener('datachanged', grid.getController().onStoreDataChanged);
            //         oldStore.removeListener('beforeload', grid.getController().onStoreBeforeLoad);
            //         oldStore.removeListener('load', grid.getController().onStoreLoad);
            //     }
            //     if (store) {
            //         store.addListener('datachanged', grid.getController().onStoreDataChanged, grid.getController());
            //         store.addListener('beforeload', grid.getController().onStoreBeforeLoad, grid.getController());
            //         store.addListener('load', grid.getController().onStoreLoad, grid.getController());
            //     }
            //     var sb = grid.lookupReference("statusGrid")
            //     grid.updateStatusBar();
            //     if (store && store.isLoading()) {
            //         if (sb) {
            //             sb.showBusy();
            //         }
            //     }
            // }
            // grid.getView().refresh();
            // grid.resumeLayouts();
        },

        selectionchange: function (grid, selected) {
            var store = grid.getStore(),
                filters = store.getFilters();
            // if(filters !== undefined && filters.getByKey('filterselected')){
            //     if(grid.getSelection().length == 0){
            //         store.removeFilter('filterselected');
            //     } else {
            //         store.removeFilter('filterselected', true);
            //         var ids = grid.getSelection().map(function (item) {
            //             return item.id;
            //         });
            //         var fltr = new Ext.util.Filter({
            //             property: 'id',
            //             id: 'filterselected',
            //             operator: 'in',
            //             value: ids
            //         });
            //         store.addFilter(fltr);
            //     }
            // }
        }
    }
});
