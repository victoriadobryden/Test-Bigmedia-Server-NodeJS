Ext.define('Bigmedia.view.dialog.DlgAutoPlanSplit',{
  extend: 'Bigmedia.view.dialog.MaterialDialog',

  requires: [
    'Bigmedia.component.CustomNumberField',
    'Bigmedia.component.AutoPlanCityParams',
    'Bigmedia.component.AutoPlanSplitOperator',
    'Bigmedia.component.AutoPlanSplitSize'
  ],

  xtype: 'dlgautoplansplit',

  closeAction: 'destroy',

  referenceHolder: true,

  // controller: 'dialog-dlgautoplansplit',
  viewModel: {
    stores: {
      operators: {
        fields: ['name']
      },
      sizes: {
        fields: ['name', 'maxValue']
      }
    },
    data: {
      city: null,
      hideAddOperator: false,
      totalSelOperators: [],
      totalSelSizes: []
    }
  },

  config: {
    city: null,
    params: null,
    cityRec: null
  },

  updateParams: function (newVal) {
    var me = this,
      vm = me.getViewModel(),
      oStore = vm.getStore('operators'),
      sStore = vm.getStore('sizes'),
      toAdd = [];
    newVal.operators.forEach((o) => {
      toAdd.push({name: o});
    });
    oStore.add(toAdd);
    toAdd = [];
    newVal.sizes.forEach((s) => {
      toAdd.push({name: s.name, maxValue: s.totalCount});
    });
    sStore.add(toAdd);
  },

  updateCity: function (newVal) {
    this.getViewModel().set('city', newVal);
  },

  onUpdateOperators: function () {
    var me = this,
      vm = me.getViewModel(),
      splitOperators = me.lookup('splitoperators'),
      newSelOperators = [];
    for (var i = 0; i < splitOperators.items.getCount(); i++) {
      var item = splitOperators.items.getAt(i);
      if (item.isXType('autoplansplitoperator')) {
        newSelOperators.push(item.getValue().operator);
      }
    }
    vm.set('totalSelOperators', newSelOperators);
  },

  onUpdateSizes: function () {
    var me = this,
      vm = me.getViewModel(),
      splitSizes = me.lookup('splitsizes'),
      newSelSizes = [];
    for (var i = 0; i < splitSizes.items.getCount(); i++) {
      var item = splitSizes.items.getAt(i);
      if (item.isXType('autoplansplitsize')) {
        newSelSizes.push(item.getValue().size);
      }
    }
    vm.set('totalSelSizes', newSelSizes);
  },

  title: 'Спліти',

  // header: {
  //   items: [
  //
  //   ]
  // },

  tools: [
    {
      type: 'prev',
      callback: function (win) {
        win.close();
      }
    }
  ],

  titlePosition: 1,

  closable: false,

  resizable: false,

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  items: [
    {
      xtype: 'component',
      // html: 'City'
      bind: {
        html: '<span style="font-weight: bold; font-size: 2em; line-height: 1.3em">{city}</span>'
      }
    },
    {
      xtype: 'container',
      layout: 'anchor',
      flex: 1,
      layout: 'fit',
      items: [
        {
          xtype: 'tabpanel',
          plain: true,
          items: [
            {
              reference: 'splitoperators',
              title: 'По операторам',
              scrollable: 'y',
              layout: {
                type: 'vbox',
                align: 'stretch'
              },
              items: [
                {
                  xtype: 'button',
                  text: 'Додати оператора',
                  iconCls: 'x-fa fa-plus',
                  bind: {
                    hidden: '{hideAddOperator}'
                  },
                  handler: function (btn) {
                    var parent = btn.up(),
                      ix = parent.items.getCount() - 1,
                      dlg = btn.up('window'),
                      oStore = dlg.getViewModel().getStore('operators'),
                      totalSelOperators = dlg.getViewModel().get('totalSelOperators'),
                      first;
                    oStore.each((o) => {
                      if (totalSelOperators.indexOf(o.get('name')) < 0) {
                        first = o.get('name');
                        return false;
                      }
                    })
                    if (first) {
                      parent.insert(ix, {
                        xtype: 'autoplansplitoperator',
                        oStore: oStore,
                        bind: {
                          selOperators: '{totalSelOperators}'
                        },
                        initData: {
                          operator: {
                            value: first,
                            readOnly: false
                          }
                        },
                        listeners: {
                          validitychange: function (split, isValid) {
                            // console.log(totalSelOperators,'hideAddOperator++',isValid,oStore);
                            dlg.getViewModel().set('hideAddOperator', !isValid)
                            // dlg.getViewModel().set('hideAddSize', (totalSelOperators.length===oStore.getCount()))
                          },
                          valuechanged: function () {
                            Ext.callback(dlg.onUpdateOperators, dlg);
                          },
                          removeclick: function (split) {
                            parent.remove(split);
                            Ext.callback(dlg.onUpdateOperators, dlg);
                          }
                        }
                      })
                    }
                  }
                }
              ]
            },
            {
              reference: 'splitsizes',
              title: 'По форматам',
              scrollable: 'y',
              layout: {
                type: 'vbox',
                align: 'stretch'
              },
              items: [
                {
                  xtype: 'button',
                  text: 'Додати формат',
                  iconCls: 'x-fa fa-plus',
                  bind: {
                    hidden: '{hideAddSize}'
                  },
                  handler: function (btn) {
                    var parent = btn.up(),
                      ix = parent.items.getCount() - 1,
                      dlg = btn.up('window'),
                      sStore = dlg.getViewModel().getStore('sizes'),
                      totalSelSizes = dlg.getViewModel().get('totalSelSizes'),
                      first;
                    sStore.each((s) => {
                      if (totalSelSizes.indexOf(s.get('name')) < 0) {
                        first = s.get('name');
                        return false;
                      }
                    })
                    if (first) {
                      parent.insert(ix, {
                        xtype: 'autoplansplitsize',
                        sStore: sStore,
                        bind: {
                          selSizes: '{totalSelSizes}'
                        },
                        initData: {
                          size: first,
                          // maxValue:
                        },
                        listeners: {
                          validitychange: function (split, isValid) {
                            // console.log(split,isValid);
                            // dlg.getViewModel().set('hideAddSize', (totalSelSizes.length===sStore.getCount()))
                            dlg.getViewModel().set('hideAddSize', !isValid)
                          },
                          valuechanged: function () {
                            Ext.callback(dlg.onUpdateSizes, dlg);
                          },
                          removeclick: function (split) {
                            parent.remove(split);
                            Ext.callback(dlg.onUpdateSizes, dlg);
                          }
                        }
                      })
                    }
                  }
                }
              ]
            }
          ]
        },
      ]
    }
  ],

  bbar: {
    items: [
      // {
      //   scale: 'large',
      //   ui: 'base-blue',
      //   text: 'Назад',
      //   bind: {
      //     hidden: '{!(step == 2)}'
      //   },
      //   handler: function (btn) {
      //     btn.up('window').getViewModel().set('step', 1);
      //   }
      // },
      '->',
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Зберегти',
        handler: function (btn) {
          var win = btn.up('window');
          var oData = [],
            sData = [],
            splitOperators = win.lookup('splitoperators'),
            splitSizes = win.lookup('splitsizes');
          for (var i = 0; i < splitOperators.items.getCount(); i++) {
            var item = splitOperators.items.getAt(i);
            if (item.isXType('autoplansplitoperator')) {
              oData.push(item.getValue());
            }
          }
          for (var i = 0; i < splitSizes.items.getCount(); i++) {
            var item = splitSizes.items.getAt(i);
            if (item.isXType('autoplansplitsize')) {
              sData.push(item.getValue());
            }
          }
          win.fireEvent('saveclick', {oData: oData, sData: sData});
          win.close();
        }
      }
    ]
  },

  listeners: {
    render: function () {
      var me = this,
        vm = me.getViewModel(),
        oStore = vm.getStore('operators'),
        splitOperators = me.lookup('splitoperators'),
        oData = me.getParams().oData,
        sStore = vm.getStore('sizes'),
        splitSizes = me.lookup('splitsizes'),
        sData = me.getParams().sData;
      if (oData) {
        oData.forEach((data, ix) => {
          splitOperators.insert(ix, {
            xtype: 'autoplansplitoperator',
            oStore: oStore,
            bind: {
              selOperators: '{totaSelOperators}'
            },
            initData: {
              operator: {
                value: data.operator,
                readOnly: data.operator == 'BIGMEDIA'
              },
              min: {
                value: data.min,
                minValue: data.operator == 'BIGMEDIA' ? 25 : 0
              },
              max: {
                value: data.max,
                minValue: data.operator == 'BIGMEDIA' ? 25 : 0
              }
            },
            removable: data.operator != 'BIGMEDIA',
            listeners: {
              validitychange: function (split, isValid) {
                // console.log(oData.length,oStore.getCount(),'hideAddOperator',isValid, (oData.length===oStore.getCount()));
                me.getViewModel().set('hideAddOperator', (oData.length===oStore.getCount()))
                // dlg.getViewModel().set('hideAddOperator', !isValid)
              },
              valuechanged: function () {
                Ext.callback(me.onUpdateOperators, me);
              },
              removeclick: function (split) {
                splitOperators.remove(split);
                Ext.callback(me.onUpdateOperators, me);
              }
            }
          });
        });
      } else if (oStore.findExact('name','BIGMEDIA') >= 0) {
        vm.set('totalSelOperators', ['BIGMEDIA']);
        splitOperators.insert(0, {
          xtype: 'autoplansplitoperator',
          oStore: oStore,
          bind: {
            selOperators: '{totaSelOperators}'
          },
          initData: {
            operator: {
              value: 'BIGMEDIA',
              readOnly: true
            },
            min: {
              value: 25,
              minValue: 25
            },
            max: {
              value: null,
              minValue: 25
            }
          },
          removable: false
        });
      }

      if (sData) {
        sData.forEach((data, ix) => {
          splitSizes.insert(ix, {
            xtype: 'autoplansplitsize',
            sStore: sStore,
            bind: {
              selSizes: '{totaSelSizes}'
            },
            initData: {
              size: data.size,
              count: data.count
            },
            listeners: {
              validitychange: function (split, isValid) {
                // console.log(sData,sStore,isValid);
                me.getViewModel().set('hideAddSize', (sData.length===sStore.getCount()))
                // me.getViewModel().set('hideAddSize', !isValid)
              },
              valuechanged: function () {
                Ext.callback(me.onUpdateSizes, me);
              },
              removeclick: function (split) {
                splitSizes.remove(split);
                Ext.callback(me.onUpdateSizes, me);
              }
            }
          });
        });
      }
    }
    // close: 'onDestroy'
  }
});
