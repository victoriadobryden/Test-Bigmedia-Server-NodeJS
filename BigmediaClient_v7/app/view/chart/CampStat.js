Ext.define('Bigmedia.view.chart.CampStat', {
    extend: 'Ext.panel.Panel',
    xtype: 'campstat',

    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Line',
        'Ext.chart.series.Pie',
        'Ext.chart.interactions.ItemHighlight',
        'Ext.chart.interactions.Rotate',
        'Bigmedia.view.chart.CampStatPolar',
        'Bigmedia.view.chart.CampStatModel',
        'Bigmedia.view.chart.CampStatController'
    ],

    viewModel: {
        type: 'campstat'
    },

    controller: 'campstat',

    config: {
        source: null,
        citiesHidden: true
    },

    updateCitiesHidden: function (newVal) {
        this.getViewModel().set('citiesHidden', newVal);
    },

    updateSource: function (newVal, oldVal) {
        var me = this,
            vm = me.getViewModel();
        // if (oldVal) {
        //     oldVal.un('datachanged', me.sourceDataChanged);
        // }
        // if (newVal) {
        //     newVal.on('datachanged', me.sourceDataChanged, me);
        // }
        vm.set('srcStore', newVal);
        // me.recalcStores();
    },

    width: '100%',

    layout: {
        type: 'hbox',
        align: 'begin',
        pack: 'center'
    },

    items: [
        {
            xtype: 'cartesian',
            colors: [
                '#458fd2'
            ],
            width: 250,
            height: '100%',
            bind: {
                store: '{campByCities}',
                hidden: '{citiesHidden}'
            },
            reference: 'citiesBars',
            interactions: ['itemhighlight'],
            insetPadding: '10 30 10 10',
            flipXY: true,
            axes: [{
                type: 'numeric',
                fields: 'count',
                hidden: true,
                minimum: 0,
                position: 'bottom'
            },{
                type: 'category',
                fields: 'label',
                // grid: {
                //     odd: {
                //         fill: '#e8e8e8'
                //     }
                // },
                // hidden: true,
                position: 'left'
            }],
            // series: [{
            //     type: 'bar',
            //     xField: 'value',
            //     yField: [
            //         'count'
            //     ]
            // }],
            series: {
                type: 'bar',
                xField: 'label',
                yField: 'count',
                // colors: [
                //     '#0b3c5d'
                // ],
                style: {
                    minGapWidth: 10
                },
                highlight: {
                    strokeStyle: 'black',
                    fillStyle: 'gold'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get('label');

                        tooltip.setHtml(xVal + ' - ' +
                            record.get('count') + ' ' + Bigmedia.Locales.dashboardProposalsTooltipSidesText);
                    }
                },
                label: {
                    field: 'count',
                    orientation: 'horizontal',
                    display: 'insideEnd'
                    // ,
                    // renderer: function (value) {
                    //     return value.toFixed(1);
                    // }
                }
            },
            platformConfig: {
                phone: {
                    // On a phone the whole view becomes a vertical strip of charts,
                    // which makes it impossible to scroll the view if touch action
                    // started on a chart. So we use a custom touchAction config.
                    touchAction: {
                        panX: true,
                        panY: true
                    }
                },
                '!phone': {
                    interactions: {
                        type: 'panzoom',
                        zoomOnPanGesture: true
                    }
                }
            },
            listeners: {
                itemhighlight: 'onCityItemHighlight'
            }
        },
        {
            xtype: 'container',
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'center'
            },
            height: '100%',
            flex: 1,
            items: [
                {
                    xtype: 'container',
                    flex: 1,
                    layout: {
                        type: 'hbox',
                        align: 'stretch',
                        pack: 'center'
                    },
                    items: [
                        {
                            xtype: 'campstatpolar',
                            bind: {
                                store: '{campBySizes}'
                            },
                            flex: 1
                            // reference: 'finalChart',
                            // itemId: 'finalChart',

                        },
                        {
                            xtype: 'campstatpolar',
                            bind: '{campByCatabs}',
                            flex: 1
                            // reference: 'finalChart',
                            // itemId: 'finalChart',

                        }
                    ]
                }, {
                    xtype: 'container',
                    flex: 1,
                    layout: {
                        type: 'hbox',
                        align: 'stretch',
                        pack: 'center'
                    },
                    items: [
                        {
                            xtype: 'campstatpolar',
                            bind: '{campByNetworks}',
                            flex: 1
                            // reference: 'finalChart',
                            // itemId: 'finalChart',

                        },
                        {
                            xtype: 'campstatpolar',
                            bind: '{campBySuppliers}',
                            flex: 1
                            // reference: 'finalChart',
                            // itemId: 'finalChart',

                        }
                    ]
                }
            ]
        }
    ]

});

//     {
//         xtype: 'container',
//         layout: {
//             type: 'vbox',
//             align: 'stretch',
//             pack: 'left'
//         },
//         items: [
//             {
//                 xtype: 'radiogroup',
//                 columns: 1,
//                 items: [
//                     {boxLabel: 'Cities', name: 'rg', inputValue: 'finalByCities'},
//                     {boxLabel: 'Sizes', name: 'rg', inputValue: 'finalBySizes', checked: true},
//                     {boxLabel: 'Networks', name: 'rg', inputValue: 'finalByNetwork'},
//                     {boxLabel: 'A/B', name: 'rg', inputValue: 'finalByCatab'}
//                 ],
//                 listeners: {
//                     change: function (rg, newVal) {
//                         var vm = rg.lookupViewModel(),
//                         chartStore = vm.get('finalChartStore');
//                         chartStore.removeAll();
//                         // console.log(newVal);
//                         var groups = vm.get(newVal.rg).getGroups();
//                         groups.each(function(group){
//                             chartStore.add({
//                                 label: group.getGroupKey(),
//                                 budget: group.sum('finalPrice'),
//                                 quantity: group.count()
//                             })
//                         });
//                     }
//                 }
//             },
//             {
//                 xtype: 'radiogroup',
//                 columns: 1,
//                 items: [
//                     {boxLabel: 'Budget', name: 'af', inputValue: 'budget'},
//                     {boxLabel: 'Faces', name: 'af', inputValue: 'quantity'}
//                 ],
//                 bind: {
//                     value: '{rgAngleField}'
//                 }
//             }
//         ]
//     },
//     {
//         xtype: 'polar',
//         reference: 'finalChart',
//         itemId: 'finalChart',
//         theme: 'default-gradients',
//         flex: 1,
//         width: '100%',
//         insetPadding: 0,
//         innerPadding: 10,
//         bind: '{finalChartStore}',
//         legend: false,
//         // {
//         //     // type: 'dom',
//         //     docked: 'right',
//         // },
//         interactions: ['rotate'], //, 'itemhighlight'
//         series: [
//             {
//                 type: 'pie',
//                 angleField: 'budget',
//                 // bind: {
//                 //     hidden: '{angleField!="budget"}'
//                 // },
//                 donut: 80,
//                 colors: ['#94ae0a',
//                 '#115fa6',
//                 '#a61120',
//                 '#ff8809',
//                 '#ffd13e',
//                 '#a61187',
//                 '#24ad9a',
//                 '#7c7474',
//                 '#a66111'],
//                 label: {
//                     field: 'label',
//                     calloutLine: {
//                         length: 60,
//                         width: 3
//                         // specifying 'color' is also possible here
//                     }
//                 },
//                 // highlight: true,
//                 tooltip: {
//                     trackMouse: true,
//                     renderer: function (tooltip, record, item) {
//                         var xVal = record.get('label');
//                         tooltip.setHtml(xVal + ' - ' +
//                         record.get(item.field));
//                     }
//                 }
//             },
//             {
//                 type: 'pie',
//                 angleField: 'quantity',
//                 radiusFactor: 70,
//                 donut: 20,
//                 showInLegend: false,
//                 // bind: {
//                 //     hidden: '{angleField!="quantity"}'
//                 // },
//                 colors: ['#94ae0a',
//                 '#115fa6',
//                 '#a61120',
//                 '#ff8809',
//                 '#ffd13e',
//                 '#a61187',
//                 '#24ad9a',
//                 '#7c7474',
//                 '#a66111'],
//                 label: {
//                     field: 'label'
//                 //     calloutLine: {
//                 //         length: 60,
//                 //         width: 3
//                 //         // specifying 'color' is also possible here
//                 //     }
//                 },
//                 // highlight: true,
//                 tooltip: {
//                     trackMouse: true,
//                     renderer: function (tooltip, record, item) {
//                         var xVal = record.get('label');
//                         tooltip.setHtml(xVal + ' - ' +
//                         record.get(item.field));
//                     }
//                 }
//             }
//         ]
//     }
