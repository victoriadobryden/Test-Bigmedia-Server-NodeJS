Ext.define('Bigmedia.view.autoselectfaces.AutoPlanResult',{
    extend: 'Ext.panel.Panel',

    xtype: 'autoplanresult',

    requires: [
        'Bigmedia.view.map.Map',
        'Bigmedia.view.chart.CoverageInteractive'
    ],

    // variantFmt: [
    //     Ext.String.format(Bigmedia.Locales.simpleResult.btnDescription, 'minBudget')
    // ].join(''),

    // controller: 'researchresult',
    // viewModel: {
    //     // stores: {
    //     //     resStore: {
    //     //         source: '{resSource}'
    //     //     }
    //     // },
    //     data: {
    //         // planStore: null,
    //         resStore: null,
    //         minBudget: null,
    //         optimum: null,
    //         maxCov: null
    //     }
    // },

    referenceHolder: true,

    initComponent: function() {
        var me = this;
        me.callParent();
        var grid = me.lookup('resgrid'),
            map = me.lookup('resmap'),
            detFace = me.lookup('detface');
        map.setCartGrid(grid);
        grid.setDetFace(detFace);
        map.setDetFace(detFace);
    },

    safeClean: function () {
        var me = this;
    },

    layout: {
        type: 'hbox',
        align: 'stretch',
        pack: 'center'
    },

    items: [
        {
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'center'
            },
            width: 200,
            items: [
                {
                    xtype: 'grid',
                    hideHeaders: true,
                    reference: 'vargrid',
                    flex: 1,
                    scrollable: 'y',
                    selModel: {
                        type: 'rowmodel',
                        mode: 'SINGLE',
                        allowDeselect: false
                    },
                    resetFocusPosition: true,
                    bind: {
                        store: '{chainedVarStore}',
                        selection: '{selectedVariant}'
                    },
                    viewConfig: {
                        enableTextSelection: false,
                        markDirty: false
                    },
                    tbar: [
                        {
                            itemId: 'prev',
                            iconCls: 'x-fa fa-chevron-left',
                            tooltip: 'Previous',
                            overflowText: 'Previous',
                            // disabled: true,
                            handler: function (btn) {
                                var vm = btn.lookupViewModel(),
                                    store = vm.get('planStore'),
                                    city = vm.get('selectedCity'),
                                    ix = store.indexOf(city);
                                if (ix > 0) {
                                    vm.set('selectedCity', store.getAt(ix - 1));
                                }
                            }
                        },
                        // '-',
                        {
                            xtype: 'combobox',
                            displayField: 'name',
                            valueField: 'id',
                            reference: 'combocity',
                            flex: 1,
                            // fieldLabel: 'Select city',
                            editable: false,
                            forceSelection: true,
                            queryMode: 'local',
                            triggerAction: 'all',
                            bind: {
                                // store: '{planStore}',
                                store: '{resCitiesStore}',
                                selection: '{selectedCity}'
                            }
                            // ,
                            // listeners: {
                            //     select: function (combo, record) {
                            //         var planVarStore = combo.lookupViewModel().get('planVarStore');
                            //         // planVarStore.filter
                            //         // ['MinPrice', 'MaxGRPDivPrice', 'MaxCoverage']
                            //         // var panel = combo.up('autoplanresult'),
                            //         // view = panel.up('window');
                            //         // panel.safeClean();
                            //         // view.resMaxCov.add(record.get('MaxCoverage'));
                            //         // if (!panel.getStoreMaxCov()) {
                            //         //     panel.setStoreMaxCov(view.resMaxCov);
                            //         // }
                            //         // view.resMinBudget.add(record.get('MinPrice'));
                            //         // if (!panel.getStoreMinBudget) {
                            //         //     panel.setStoreMinBudget(view.resMinBudget);
                            //         // }
                            //         // view.resOptimum.add(record.get('MaxGRPDivPrice'));
                            //         // if (!panel.getStoreOptimum) {
                            //         //     panel.setStoreOptimum(view.resOptimum);
                            //         // }
                            //     }
                            // }
                        },
                        // '-',
                        {
                            itemId: 'next',
                            iconCls: 'x-fa fa-chevron-right',
                            tooltip: 'Next',
                            overflowText: 'Next',
                            // disabled: true,
                            handler: function (btn) {
                                var vm = btn.lookupViewModel(),
                                    store = vm.get('planStore'),
                                    city = vm.get('selectedCity'),
                                    ix = store.indexOf(city);
                                if (ix < store.getCount() - 1) {
                                    vm.set('selectedCity', store.getAt(ix + 1));
                                }
                            }
                        }
                    ],
                    columns: [
                        {
                            xtype: 'checkcolumn',
                            dataIndex: 'selected',
                            sortable: false,
                            width: 20
                        },
                        {
                            dataIndex: 'descr',
                            flex: 1,
                            sortable: false
            //                 ,
            //                 renderer: function (value, p, record) {
            //                     return Ext.String.format(Bigmedia.Locales.simpleResult.btnDescription, record.get('boards'), record.get('ots'), record.get('coverage'), Ext.util.Format.currency(Math.round(record.get('cpt') * 100) / 100), Ext.util.Format.currency(Math.round(record.get('budget'))));
            //                     // return Ext.String.format(this.topicFmt,
            // // value, record.get('forumtitle'), record.getId(), record.get('forumid'));
            //                 },
                        }
                    ],

                    // bbar: {
                    //     xtype: 'pagingtoolbar',
                    //     displayInfo: false,
                    //     beforePageText: '',
                    //     afterPageText: '',
                    //     inputItemWidth: 0,
                    //     emptyMsg: "No variants to display"
                    // }
                },
                // {
                //     xtype: 'component',
                //     html: Bigmedia.Locales.simpleResult.descrVariantsText,
                //     margin: '0 0 10 0'
                // },
                // {
                //     xtype: 'container',
                //     width: '100%',
                //     layout: {
                //         type: 'hbox',
                //         align: 'stretch',
                //         pack: 'center'
                //     },
                //     items: [
                //         {
                //             xtype: 'button',
                //             bind: {
                //                 // text: Bigmedia.Locales.simpleResult.btnMinPriceText
                //                 text: {
                //                     bindTo: Bigmedia.Locales.simpleResult.btnMinPriceName + '<br>' + Ext.String.format(Bigmedia.Locales.simpleResult.btnDescription, 'minBudget'),
                //                     deep: true
                //                 }
                //             },
                //             reference: 'minBudgetBtn',
                //             flex: 1,
                //             toggleGroup: 'Variants',
                //             allowDepress: false,
                //             pressed: true,
                //             handler: function (btn) {
                //                 // console.log(btn.up('simpleresearchresult').getStoreMinBudget());
                //                 btn.up('autoplanresult').getViewModel().set('resStore', btn.up('autoplanresult').getStoreMinBudget());
                //                 // btn.up('simpleresearchresult').getViewModel().set('resSource', btn.up('simpleresearchresult').getStoreMinBudget());
                //             }
                //         },
                //         {
                //             xtype: 'checkbox',
                //             listeners: {
                //                 change: function () {
                //                     console.log('checked');
                //                 }
                //             }
                //         }
                //     ]
                // },
                // {
                //     xtype: 'button',
                //     bind: {
                //         text: {
                //             bindTo: Bigmedia.Locales.simpleResult.btnOptimumName + '<br>' + Ext.String.format(Bigmedia.Locales.simpleResult.btnDescription, 'optimum'),
                //             deep: true
                //         }
                //     },
                //     handler: function (btn) {
                //         // console.log(btn.up('simpleresearchresult').getStoreOptimum());
                //         btn.up('autoplanresult').getViewModel().set('resStore', btn.up('autoplanresult').getStoreOptimum());
                //         // btn.up('simpleresearchresult').getViewModel().set('resSource', btn.up('simpleresearchresult').getStoreOptimum());
                //     }
                // },
                // {
                //     xtype: 'button',
                //     bind: {
                //         text: {
                //             bindTo: Bigmedia.Locales.simpleResult.btnMaxCoverageName + '<br>' + Ext.String.format(Bigmedia.Locales.simpleResult.btnDescription, 'maxCov'),
                //             deep: true
                //         }
                //     },
                //     handler: function (btn) {
                //         // console.log(btn.up('simpleresearchresult').getStoreMaxCov());
                //         btn.up('autoplanresult').getViewModel().set('resStore', btn.up('autoplanresult').getStoreMaxCov());
                //         // btn.up('simpleresearchresult').getViewModel().set('resSource', btn.up('simpleresearchresult').getStoreMaxCov());
                //     }
                // },
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-undo',
                    toggleGroup: null,
                    enableToggle: false,
                    ui: 'soft-red',
                    text: 'Back',
                    handler: function (btn) {
                        // console.log(btn.up('simpleresearchresult').getStoreMinBudget());
                        // btn.up('simpleresearchresult').getStoreMinBudget().reload();
                        // console.log(btn.up('simpleresearchresult').getStoreMinBudget());
                        // btn.up('simpleresearchresult').getStoreMaxCov().reload();
                        // btn.up('simpleresearchresult').getStoreOptimum().reload();
                        // // console.log(btn.up('simpleresearchresult').getStoreMinBudget());
                        var panel = btn.up('autoplanresult');
                        // panel.safeClean();
                        // panel.lookup('minBudgetBtn').setPressed(true);
                        // panel.getViewModel().set('resStore', me.getStoreMinBudget());
                        // panel.lookup('resultTabPanel').setActiveItem(0);
                        panel.fireEvent('goback');
                        // btn.up('wizardform').goTo(0);
                    }
                }
            ]
        },
        {
            flex: 1,
            // layout: 'fit',
            xtype: 'tabpanel',
            reference: 'resultTabPanel',
            margin: '0 0 0 5',
            defaults: {
                layout: 'fit'
            },
            items: [
                {
                    title: Bigmedia.Locales.simpleResult.tabListMapTitle,
                    layout: 'border',
                    // layout: 'fit',
                    items: [
                        {
                            xtype: 'faces-grid',
                            selModel: {
                                type: 'rowmodel',
                                mode: 'SINGLE',
                                listeners: {
                                    focuschange: function (selModel, oldFocused, newFocused) {
                                        var tView = selModel.view;
                                        if (!newFocused) {
                                            if (oldFocused) {
                                                tView.oldFocused = oldFocused;
                                            }
                                            return;
                                        }
                                        if (oldFocused) {
                                            tView.removeRowCls(oldFocused, 'bm-row-focused');
                                        }
                                        if (tView.oldFocused) {
                                            tView.removeRowCls(tView.oldFocused, 'bm-row-focused');
                                        }
                                        if (newFocused) {
                                            tView.addRowCls(newFocused, 'bm-row-focused');
                                        }
                                    }
                                }
                            },
                            region: 'center',
                            plugins: {},
                            stateful: false,
                            reference: 'resgrid',
                            hideToolBar: true,
                            showPrice: true,
                            showAddToCart: false,
                            showDelete: true,
                            // bufferedRenderer: false,
                            bind: {
                                store: '{selectedVariant.faces}'
                            },
                            columns: [
                                {
                                    text: Bigmedia.Locales.colDoorsNo,
                                    sortable: true,
                                    dataIndex: 'doors_no',
                                    groupable: false,
                                    locked: true,
                                    width: 60,
                                    filter: {
                                        type: 'string',
                                        itemDefaults: {
                                            emptyText: Bigmedia.Locales.gridColumnStrFilterText
                                        }
                                    }
                                }, {
                                    text: Bigmedia.Locales.colFaceNum,
                                    sortable: true,
                                    dataIndex: 'num',
                                    groupable: false,
                                    hidden: true,
                                    hideable: true,
                                    draggable: false,
                                    width: 80,
                                    locked: true
                                }, {
                                    text: Bigmedia.Locales.colSupplier,
                                    sortable: true,
                                    dataIndex: 'supplier',
                                    hidable: true,
                                    groupable: true,
                                    width: 100,
                                    filter: 'list'
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
                                    // flex: 1,
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
                                    text: Bigmedia.Locales.colLight,
                                    sortable: true,
                                    dataIndex: 'light',
                                    groupable: false,
                                    width: 40,
                                    filter: 'list',
                                    align: 'center',
                                    width: 40,
                                    renderer: function(value) {
                                        var res = '';
                                        switch (value) {
                                            case '+':
                                            res = '<span class="x-fa fa-lightbulb-o" style="color: #ffd633"></span>';
                                            break;
                                            case 'off':
                                            res = '<span class="x-fa fa-lightbulb-o" style="color: #8c8c8c"></span>';
                                            break;
                                        }
                                        return res;
                                    }
                                }, {
                                    text: Bigmedia.Locales.colNetwork,
                                    sortable: true,
                                    dataIndex: 'network',
                                    groupable: false,
                                    width: 100,
                                    filter: 'list',
                                    hidden: true
                                }, {
                                    text: Bigmedia.Locales.colZone,
                                    sortable: true,
                                    dataIndex: 'zone',
                                    groupable: false,
                                    width: 90,
                                    filter: 'list',
                                    hidden: true
                                }, {
                                    text: Bigmedia.Locales.colGRP,
                                    sortable: true,
                                    dataIndex: 'grp',
                                    groupable: false,
                                    width: 60,
                                    filter: 'number'
                                }, {
                                    text: Bigmedia.Locales.colOTS,
                                    sortable: true,
                                    dataIndex: 'ots',
                                    groupable: false,
                                    width: 60,
                                    filter: 'number'
                                }, {
                                    text: 'Price',
                                    bind: {
                                        hidden: '{!visiblePrice}'
                                    },
                                    width: 60,
                                    sortable: true,
                                    reference: 'columnprice',
                                    dataIndex: 'price',
                                    // xtype: 'widgetcolumn',
                                    hidden: true,
                                    hideable: false,
                                    filter: 'number'
                                }, {
                                    text: 'Net',
                                    bind: {
                                        hidden: '{!visiblePrice}'
                                    },
                                    width: 60,
                                    sortable: true,
                                    reference: 'columnnetprice',
                                    dataIndex: 'netPrice',
                                    // xtype: 'widgetcolumn',
                                    hidden: true,
                                    hideable: false,
                                    filter: 'number'
                                }, {
                                    text: 'Total',
                                    bind: {
                                        hidden: '{!visiblePrice}'
                                    },
                                    width: 60,
                                    sortable: true,
                                    reference: 'columntotalprice',
                                    dataIndex: 'finalPrice',
                                    // xtype: 'widgetcolumn',
                                    hidden: true,
                                    hideable: false,
                                    filter: 'number'
                                }, {
                                    xtype:'actioncolumn',
                                    width:50,
                                    bind: {
                                        hidden: '{!showDelete}'
                                    },
                                    items: [{
                                        iconCls: 'x-fa fa-minus',
                                        tooltip: 'Delete',
                                        handler: function(tableView, rowIndex, colIndex) {
                                            var rec = tableView.getStore().getAt(rowIndex);
                                            tableView.getStore().remove(rec);
                                            // tableView.ownerGrid.fireEventArgs('deleterecord', [tableView.ownerGrid, rec]);
                                        }
                                    }]
                                }
                            ]
                            // ,
                            // listeners: {
                                //     deleterecord: function (grid, rec) {
                                    //         grid.getStore().remove(rec);
                                    //         var vm = grid.lookupViewModel(),
                                    //             sv = vm.get('selectedVariant'),
                                    //             stat = sv.getCovStat();
                                    //         sv.set({
                                        //             boards: grid.getStore().getCount(),
                                        //             ots: grid.getStore().sum('ots'),
                                        //             grp: grid.getStore().sum('grp'),
                                        //             coverage: Math.round(stat.covMax * stat.grps * 100 / (stat.covMax + stat.grps)) / 100,
                                        //             budget: grid.getStore().sum('finalPrice')
                                        //         });
                                        //
                                        //         grid.up('autoplanresult').lookup('vargrid').getView().refresh();
                                        //     }
                                        // }
                                    },
                                    {
                                        xtype: 'panel',
                                        header: false,
                                        layout: 'fit',
                                        width: 400,
                                        split: true,
                                        region: 'east',
                                        // collapsed: true,
                                        collapsible: true,
                                        items: [
                                            {
                                                // xtype: 'facesmap',
                                                xtype: 'facesmapview',
                                                toolbarHidden: true,
                                                reference: 'resmap',
                                                faceAsCircleRes: 60,
                                                bind: {
                                                    replaceStore: '{repStore}'
                                                }
                                                // ,
                                                // bind: {
                                                    //     cartStore: '{resStore}'
                                                    // }
                                                }
                                        ]
                                    }
                        // {
                        //     xtype: 'panel',
                        //     width: '100%',
                        //     height: '100%',
                        //     items: [
                        //         {
                        //             xtype: 'panel',
                        //             layout: 'fit',
                        //             region: 'center',
                        //             // header: false,
                        //             items: [
                        //             ]
                        //         },
                        //     ]
                        // }
                    ]
                },
                // {
                //     title: 'Карта',
                //     items: [
                //     ]
                // },
                {
                    title: Bigmedia.Locales.simpleResult.tabCoverageTitle,
                    items: [
                        {
                            //TODO
                            xtype: 'chartscoverageinteractive',
                            reference: 'chartcoverage',
                            header: false,
                            hideCitiesBar: true,
                            bind: {
                                // facesStore: '{resStore}'
                                facesStore: '{selectedVariant.faces}'
                            }
                        }
                    ]
                },
                {
                    title: Bigmedia.Locales.simpleResult.tabChartsTitle,
                    items: [
                        {
                            xtype: 'campstat',
                            // height: '100%',
                            bind: {
                                source: '{selectedVariant.faces}'
                            }
                        }
                    ]
                },
                {
                    title: Bigmedia.Locales.simpleResult.tabMediaPlanTitle,
                    items: [
                        {
                            xtype: 'pivot-planvariant',
                            bind: {
                                source: '{selectedVariant.faces}'
                            }
                        }
                    ]
                }
            ]
        },
        {
            xtype: 'detface',
            reference: 'detface',
            // stateId: 'detFaceFacesView',
            stateful: {
                x: true,
                y: true,
                width: true,
                height: true
            },
            constrainHeader: true,
            // title: 'Face #',
            closeAction: 'hide',
            // Force the Window to be within its parent
            // constrain: true,
            hidden: true,
            collapsible: false,
            bodyPadding: 0,
            // autoShow: true,
            // alwaysOnTop: true,
            // x: 0,
            // y: 0,
            width: 300,
            heigth: 250,
            closable: true
        }
    ]
});
