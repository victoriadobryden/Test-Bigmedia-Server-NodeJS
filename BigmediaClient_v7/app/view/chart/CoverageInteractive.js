Ext.define('Bigmedia.view.chart.CoverageInteractive', {
    extend: 'Ext.panel.Panel',
    xtype: 'chartscoverageinteractive',

    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Line',
        // 'Ext.chart.series.Pie',
        'Ext.chart.interactions.ItemHighlight',
        'Bigmedia.view.chart.CoverageController',
        'Ext.chart.interactions.Rotate'
    ],

    controller: 'coverage',
    viewModel: {
        type: 'coverage'
    },

    config: {
        facesStore: null,
        mapView: null,
        hideCitiesBar: false
    },

    layout: {
        type: 'vbox',
        pack: 'center',
        align: 'stretch'
    },

    title: 'Coverage',
    iconCls: 'x-fa fa-line-chart',

    height: 600,
    // width: 600,

    updateHideCitiesBar: function (newVal) {
        // console.log(newVal);
        this.getViewModel().set('hideCitiesBar', newVal);
    },

    updateFacesStore: function (newVal, oldVal) {
        var me = this;
        me.getViewModel().getStore('allCovers').removeAll();
        if (oldVal) {
            oldVal.un('add', me.getController().onFacesStoreAdd);
            oldVal.un('remove', me.getController().onFacesStoreRemove);
            oldVal.un('clear', me.getController().onFacesStoreClear, me.getController());
            oldVal.un('load', me.getController().loadData);
        }
        if (newVal) {
            newVal.on('add', me.getController().onFacesStoreAdd, me.getController());
            newVal.on('remove', me.getController().onFacesStoreRemove, me.getController());
            newVal.on('clear', me.getController().onFacesStoreClear, me.getController());
            newVal.on('load', me.getController().loadData, me.getController());
            me.getController().loadData(newVal);
        }
    },

    updateMapView: function (newVal, oldVal) {
        // console.log(newVal);
        if (newVal) {
            this.getController().updateMapData();
        }
    },

    // tbar: {
    //     layout: {
    //         type: 'hbox'
    //     },
    //     width: '100%',
    //     items: [
    //         {
    //             xtype: 'combobox',
    //             fieldLabel: 'Choose City',
    //             bind: {
    //                 store: '{comboStore}',
    //                 value: '{cityId}'
    //             },
    //             queryMode: 'local',
    //             displayField: 'cityName',
    //             valueField: 'id_city'
    //         }
    //     ]
    // },

    items: [
        // {
        //     xtype: 'polar',
        //     width: 200,
        //     // height: 600,
        //     bind: '{citiesData}',
        //     // animation: false,
        //     interactions: ['itemhighlight'],
        //     background: 'white',
        //     // sprites: {
        //     //     id: 'cityName',
        //     //     type: 'text',
        //     //     fillStyle: 'black',
        //     //     text: '',
        //     //     textBaseline: 'top',
        //     //     textAlign: 'center',
        //     //     font: 'bold 30px Charter, Georgia, "Droid Serif"',
        //     //     x: 400,
        //     //     y: 120
        //     // },
        //     series: [
        //         {
        //             type: 'pie',
        //             angleField: 'count',
        //             donut: 30,
        //             // rotation: -Math.PI/60,
        //             subStyle: {
        //                 strokeStyle: 'white',
        //                 lineWidth: 1
        //             },
        //             label: {
        //                 field: 'value',
        //                 display: 'auto',
        //                 orientation: '',
        //                 // fillStyle: 'white',
        //                 fontWeight: 'bold',
        //                 fontSize: 13,
        //                 fontFamily: 'Tahoma, "Trebuchet MS", "Droid Sans"'
        //                 // ,
        //                 // renderer: 'onLabelRender2012'
        //             },
        //             // highlight: true,
        //             tooltip: {
        //                 trackMouse: true,
        //                 renderer: function (tooltip, record, item) {
        //                     var xVal = record.get('value');
        //                     tooltip.setHtml(xVal + ' - ' +
        //                         record.get('count') + ' ' + Presenter.Locales.dashboardProposalsTooltipSidesText);
        //                 }
        //             }
        //             // ,
        //             // renderer: 'onSliceRender2012'
        //         }
        //     ],
        //     listeners: {
        //         itemhighlight: 'onCityItemHighlight'
        //     }
        // },
        {
            xtype: 'cartesian',
            reference: 'chartCoverage',
            flex: true,
            width: '100%',
            animation: false,
            bind: {
                store: '{coverStore}'
            },
            insetPadding: {
                top: 55,
                right: 20,
                bottom: 10,
                left: 20
            },
            legend: {
                type: 'sprite',
                docked: 'right'
            },
            sprites: {
                id: 'cityName',
                type: 'text',
                fillStyle: 'black',
                text: '',
                textBaseline: 'top',
                textAlign: 'left',
                font: 'bold 30px Charter, Georgia, "Droid Serif"',
                x: 100,
                y: 10
            },
            // sprites: [{
            //     type: 'text',
            //     bind: {
            //         text: 'cityId: {cityId}',
            //     },
            //     fontSize: 22,
            //     width: 100,
            //     height: 30,
            //     x: 40, // the sprite x position
            //     y: 20  // the sprite y position
            // }],
            axes: [{
                type: 'numeric',
                adjustByMajorUnit: true,
                // minimum: 0,
                // maximum: 100,
                // increment: 10,
                fields: ['covMax', 'one', 'three', 'five', 'ten', 'fifteen', 'twenty', 'thirty', 'fourty', 'fifty', 'sixty', 'seventy', 'eighty' ],
                position: 'left',
                grid: true
                // ,
                // limits: [{
                //     value: 30,
                //     line: {
                //         strokeStyle: 'red',
                //         lineDash: [6, 3],
                //         title: {
                //             text: 'Best coverage',
                //             fontSize: 14
                //         }
                //     }
                // }]
                // renderer: 'onAxisLabelRender'
            }, {
                type: 'numeric',
                title: 'Day',
                fields: 'day',
                position: 'bottom',
                minimum: 1,
                majorTickSteps: 29,
                maximum: 30,
                style: {
                    textPadding: 0 // remove extra padding between labels to make sure no labels are skipped
                },
                // grid: true,
                label: {
                    rotate: {
                        degrees: -45
                    }
                }
            }],
            series: [
            //     {
            //     type: 'line',
            //     xField: 'day',
            //     yField: 'covMax',
            //     title: 'Cov(max)',
            //     smooth: true,
            //     style: {
            //         lineWidth: 1
            //     },
            //     marker: {
            //         radius: 4
            //     },
            //     highlight: {
            //         fillStyle: '#000',
            //         radius: 5,
            //         lineWidth: 2,
            //         strokeStyle: '#fff'
            //     },
            //     tooltip: {
            //         renderer: function (tooltip, record, item) {
            //             // console.log([record, item]);
            //             var xVal = record.get(item.field);
            //             xVal = Math.round(xVal * 100) / 100;
            //             tooltip.setHtml('Cov<sub>max</sub> = ' + xVal);
            //             //
            //             // tooltip.setHtml(xVal + ' - ' +
            //             //     record.get('count') + ' ' + Presenter.Locales.dashboardProposalsTooltipSidesText);
            //         }
            //     }
            // },
            {
                type: 'line',
                xField: 'day',
                yField: 'one',
                title: '1+',
                smooth: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('1<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'three',
                title: '3+',
                smooth: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('3<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'five',
                title: '5+',
                smooth: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('5<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'ten',
                title: '10+',
                smooth: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('10<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'fifteen',
                title: '15+',
                smooth: true,
                hidden: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('15<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'twenty',
                title: '20+',
                smooth: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('20<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'thirty',
                title: '30+',
                hidden: true,
                smooth: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('30<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'fourty',
                title: '40+',
                smooth: true,
                hidden: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('40<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'fifty',
                title: '50+',
                smooth: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('50<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'sixty',
                title: '60+',
                smooth: true,
                hidden: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('60<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'seventy',
                title: '70+',
                smooth: true,
                hidden: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('70<sup>+</sup> = ' + xVal);
                    }
                }
            }, {
                type: 'line',
                xField: 'day',
                yField: 'eighty',
                title: '80+',
                smooth: true,
                hidden: true,
                style: {
                    lineWidth: 1
                },
                marker: {
                    radius: 4
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var xVal = record.get(item.field);
                        xVal = Math.round(xVal * 100) / 100;
                        tooltip.setHtml('80<sup>+</sup> = ' + xVal);
                    }
                }
            }]
            // ,
            // listeners: {
            //     itemhighlight: 'onItemHighlight',
            //     afterrender: 'onBeforeRender'
            // }
        },
        {
            xtype: 'cartesian',
            colors: [
                '#458fd2'
            ],
            height: 170,
            bind: {
                store: '{citiesData}',
                hidden: '{hideCitiesBar}'
            },
            reference: 'citiesBars',
            interactions: ['itemhighlight'],
            axes: [{
                type: 'category',
                fields: [
                    'value'
                ],
                // hidden: true,
                position: 'bottom'
            },{
                type: 'numeric',
                minimum: 0,
                fields: [
                    'count'
                ],
                grid: {
                    odd: {
                        fill: '#e8e8e8'
                    }
                },
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
                xField: 'value',
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
                        var xVal = record.get('value');

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
        }
    ]
    // ,
    //
    // listeners: {
    //     beforerender: 'onBeforeRender'
    // }
});
