Ext.define("Bigmedia.view.field.SplitsField", {
    extend: "Ext.Panel",
    xtype: "splitsfield",

    requires: [
        'Ext.chart.interactions.ItemEdit',
        'Ext.chart.CartesianChart',
    ],

    config: {
        facesStore: null,
        dimensionField: null,
        dimensionName: null,
        store: null,
        series: null,
        limits: null
    },

    getSplits: function () {
        var me = this,
            chart = me.lookup('chart'),
            rec = chart.getStore().getAt(0),
            res = {};
        me.getSeries().title.forEach(function(title, ix){
            res[title] = rec.get('data' + ix);
        });
        return res;
    },

    updateFacesStore: function (newVal, oldVal) {
        var me = this;
        if (newVal) {
            newVal.on('datachanged', me.onFacesStoreChanged, me);
        }
    },

    onFacesStoreChanged: function (srcStore) {
        var me = this,
            group = {};
        srcStore.each(function(rec){
            if (!group[rec.get(me.getDimensionField())]) {
                group[rec.get(me.getDimensionField())] = [];
            }
            group[rec.get(me.getDimensionField())].push(rec);
        });
        var dataRec = { dimension: me.getDimensionName()},
            fieldsArray = ['dimension'],
            titleArray = [],
            yFieldArray = [],
            labelArray = [];
        Object.keys(group).forEach(function(key, ix){
            dataRec['data' + ix] = Math.round(group[key].length / srcStore.getCount() * 100);
            dataRec['name' + ix] = key;
            fieldsArray.push('data' + ix, 'name' + ix);
            titleArray.push(key);
            yFieldArray.push('data' + ix);
            labelArray.push('name' + ix);
        });
        var store = new Ext.data.Store({
            data: [
                dataRec
            ],
            fields: fieldsArray,
            autoLoad: true,
            proxy: { type: 'memory'}
        });
        me.setStore(store);
        me.setSeries({
            title: titleArray,
            xField: 'dimension',
            yField: yFieldArray,
            labelField: labelArray
        });
        // series: {
        //     title: ['Bigmedia', 'Other'],
        //     xField: 'dimension',
        //     yField: ['data1', 'data2']
        // }
    },

    updateStore: function (newVal) {
        // console.log(this);
        var me = this,
            chart = me.lookup('chart');
            // chart = me.down('#cartesian');
        // console.log(chart);
        if (newVal && chart) {
            chart.setStore(newVal);
        }
    },

    updateSeries: function (newVal) {
        var me = this,
            chart = me.lookup('chart');
        if (newVal && chart) {
            if (newVal.xField) {
                // chart.getAxes()[1].setFields([newVal.xField]);
                // chart.getSeries().setXField(newVal.xField);
            }
            if (newVal.yField) {
                // chart.getAxes()[0].setFields(newVal.yField);
                chart.getSeries()[0].setYField(newVal.yField);
            }
            if (newVal.title) {
                chart.getSeries()[0].setTitle(newVal.title);
            }
            if (newVal.labelField) {
                chart.getSeries()[0].setLabel({
                    field: newVal.labelField,
                    font: '11px Helvetica',
                    // display: 'outside',
                    display: 'insideStart',
                    renderer: me.onSeriesLabelRender
                });
            }
            chart.redraw();
        }
    },

    width: '100%',
    height: 80,
    layout: 'fit',
    // constructor: function(config) {
    //     console.log('constructor');
    // },
    onSeriesLabelRender: function (text, sprite, config, rendererData, index) {
        // var me = this,
        //     chart = me.lookup('chart'),
        //     prefix = chart.getSeries()[0].getTitle()[index];
        // console.log(sprite.getField());
        return text;
    },
    controller: {
        init: function (view) {
            var me = this,
                chart = me.lookup('chart');
            // console.log([view.getSeries(), view.getStore()]);
            view.updateSeries(view.getSeries());
            view.updateStore(view.getStore());
        },
        onSeriesLabelRender: function (text, sprite, config, rendererData, index) {
            // var me = this,
            //     chart = me.lookup('chart'),
            //     prefix = chart.getSeries()[0].getTitle()[index];
            // console.log(sprite.getField());
            return text;
        },

        onAxisLabelRender: function (axis, label, layoutContext) {
            // Custom renderer overrides the native axis label renderer.
            // Since we don't want to do anything fancy with the value
            // ourselves except appending a '%' sign, but at the same time
            // don't want to loose the formatting done by the native renderer,
            // we let the native renderer process the value first.
            return layoutContext.renderer(label) + '%';
        },

        onSeriesTooltipRender: function (tooltip, record, item) {
            var fieldIndex = Ext.Array.indexOf(item.series.getYField(), item.field),
                browser = item.series.getTitle()[fieldIndex];

            tooltip.setHtml(browser + ' - ' + record.get(item.field) + '%');
        },

        onColumnRender: function (v) {
            return v + '%';
        },

        onPreview: function () {
            if (Ext.isIE8) {
                Ext.Msg.alert('Unsupported Operation', 'This operation requires a newer version of Internet Explorer.');
                return;
            }
            var chart = this.lookup('chart');
            chart.preview();
        }
    },
    items: [{
        xtype: 'cartesian',
        reference: 'chart',
        height: '100%',
        width: '100%',
        listeners: {
            beginitemedit: function(chart, interaction, item) {
                chart.prevItemValue = item.record.get(item.field);
            },
            enditemedit: function(chart, interaction, item, target) {
                var yField = item.series.getYField(),
                    yIndex = yField.indexOf(target.yField),
                    nIndex = (yIndex < (yField.length - 1)) ? yIndex + 1 : yIndex - 1,
                    nField = yField[nIndex],
                    pIndex = (yIndex > 0) ? yIndex - 1 : -1,
                    pField = (pIndex >= 0) ? yField[pIndex] : null,
                    curValue = Math.round(item.record.get(item.field)),
                    updRec = {},
                    limits = chart.up('splitsfield').getLimits(),
                    titles = item.series.getTitle(),
                    index = +item.field.replace(/\D/g,'');
                // step: 5%
                var rounded = (curValue >= 0) ? Math.floor(curValue / 10) * 10 : Math.ceil(curValue / 10) * 10;
                    part = Math.abs(curValue - rounded);
                // console.log([part, curValue]);
                if (!(part === 0 || part === 5)) {
                    if (part <= 2) {
                        curValue = rounded;
                    } else if (part >=8) {
                        curValue = rounded + (curValue<0 ? (-1) : 1) * 10;
                    } else {
                        curValue = rounded + (curValue<0 ? (-1) : 1) * 5;
                    }
                }
                if (limits && limits[titles[index]] && limits[titles[index]].min > curValue) {
                    // updRec[target.yField] = chart.prevItemValue;
                    // item.record.set(updRec);
                    // chart.redraw();
                    // return;
                    curValue = limits[titles[index]].min;
                }
                var delta = curValue - chart.prevItemValue;
                if (curValue < -1) {
                    if (!pField) {
                        updRec[target.yField] = chart.prevItemValue;
                        item.record.set(updRec);
                        chart.redraw();
                        return;
                    } else {
                        if (item.record.get(pField) <= Math.abs(curValue)) {
                            updRec[pField] = 0;
                            updRec[target.yField] = item.record.get(pField) + chart.prevItemValue;
                        } else {
                            updRec[pField] = item.record.get(pField) + curValue;
                            updRec[target.yField] = chart.prevItemValue - curValue;
                        }
                        item.record.set(updRec);
                        chart.redraw();
                        return;
                    }
                } else if (curValue < 1) {
                    updRec[nField] = item.record.get(nField) + chart.prevItemValue;
                    updRec[target.yField] = 0;
                    item.record.set(updRec);
                    chart.redraw();
                    return;
                }
                if (delta > 0) {
                    if (item.record.get(nField) - delta < 0) {
                        delta = delta - item.record.get(nField);
                        updRec[nField] = 0;
                        updRec[target.yField] = curValue - delta;
                    } else {
                        updRec[nField] = item.record.get(nField) - delta;
                        updRec[target.yField] = curValue;
                    }
                } else {
                    updRec[nField] = item.record.get(nField) - delta;
                    updRec[target.yField] = curValue;
                }
                item.record.set(updRec);
                chart.redraw();
            }
        },
        interactions: [{
            type: 'itemedit',
            style: {
                lineWidth: 2
            },
            tooltip: {
                renderer: function (tooltip, item, target, e) {
                    // var parts = [];
                    // if (target.yField) {
                    //     parts.push(target.yField + ': ' + target.yValue);
                    // }
                    // tooltip.setHtml(parts.join('<br>'));
                    var curValue = Math.round(target.yValue),
                        chart = item.series.getChart();
                    if (curValue < 0) {
                        curValue = chart.prevItemValue - curValue;
                    }
                    // step: 5%
                    var part = curValue - Math.floor(curValue / 10) * 10;
                    if (!(part === 0 || part === 5)) {
                        if (part <= 2) {
                            curValue = Math.floor(curValue / 10) * 10;
                        } else if (part >=8) {
                            curValue = Math.floor(curValue / 10) * 10 + 10;
                        } else {
                            curValue = curValue = Math.floor(curValue / 10) * 10 + 5;
                        }
                    }
                    tooltip.setHtml(item.sprite.labelCfg.text + ' - ' + curValue + '%');
                },
                constrainPosition: true,
                shrinkWrapDock: true,
                autoHide: true,
                trackMouse: true,
                mouseOffset: [20, 20]
            }
            // ,
            // listeners: {
            //     enditemedit: function(chart, interaction, item, target) {
            //         console.log([item, target]);
            //     }
            // }
        }],
        flipXY: true,
        axes: [
            {
                type: 'numeric',
                fields: 'data0',
                position: 'bottom',
                grid: true,
                minimum: 0,
                maximum: 100,
                majorTickSteps: 10,
                renderer: 'onAxisLabelRender'
            }, {
                type: 'category',
                fields: 'dimension',
                position: 'left',
                label: {
                    hidden: true
                },
                grid: false
            }
        ],
        series: [{
            type: 'bar',
            fullStack: true,
            title: [ 'A', 'B' ],
            xField: 'dimension',
            yField: [ 'data0', 'data1' ],
            axis: 'bottom',
            label: {
                field: [ 'name0', 'name1' ],
                display: 'insideStart',
                renderer: 'onSeriesLabelRender'
            },
            stacked: true,

            style: {
                opacity: 0.80
            },
            highlight: {
                fillStyle: 'yellow'
            },
            tooltip: {
                trackMouse: true,
                renderer: 'onSeriesTooltipRender'
            }
        }]
    }]
});
