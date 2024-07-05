Ext.define("Bigmedia.view.dialog.DlgLinkFacesToPOISettings", {
  extend: "Ext.window.Window",

  xtype: 'dlglinkfacestopoisettings',

  requires: [
    'Ext.tree.plugin.TreeViewDragDrop',
    'Ext.tree.Panel'
  ],

  config: {
    maximumFaces: null
  },

  updateMaximumFaces: function (newVal) {
    this.getViewModel().set('localmaximumfaces', newVal);
  },

  viewModel: {
    data: {
      localmaximumfaces: null,
      fTree: new Ext.data.TreeStore({
        root: {
          expanded: true,
          children: []
        },
        fields: [ { name: 'text'} ]
      }),
      lprTree: new Ext.data.TreeStore({
        root: {
          expanded: true,
          children: []
        },
        fields: [ { name: 'text'} ]
      })
    }
  },

  // initComponent: function () {
  //   this.callParent();
  //   this.enableBubble(['radiuschanged', 'addclick', 'replaceclick', 'sourcechanged']);
  // },

  // updatePoiStore: function (newVal) {
  //   // this.getViewModel().set('poiStore', newVal);
  //   this.lookup('poigrid').setStore(newVal);
  // },

  width: 300,
  minWidth: 300,
  height: 400,
  minHeight: 300,
  autoShow: false,
  alwaysOnTop: true,
  closeAction: "hide",
  modal: true,
  closable: true,
  collapsible: false,
  hideCollapseTool: true,
  maskClickAction: 'hide',
  title: 'Налаштування фільтра площин',
  referenceHolder: true,
  bodyPadding: 10,
  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  bbar: {
    items: [
      {
        xtype: 'button',
        text: 'Скасувати',
        handler: function (btn) {
          btn.up('window').close();
        }
      }, {
        xtype: 'tbspacer',
        flex: 1
      }, {
        xtype: 'button',
        text: 'Зберегти',
        handler: function (btn) {
          btn.up('window').fireEvent('savesettings', btn.up('window'));
          btn.up('window').close();
        }
      }
    ]
  },

  items: [
    {
      width: '100%',
      xtype: 'numberfield',
      bind: {
        value: '{localmaximumfaces}'
      },
      minValue: 1,
      maxValue: 100,
      step: 1,
      fieldLabel: 'Обмежити кількість площин (max)'
    },
    {
      xtype: 'tabpanel',
      flex: 1,
      items: [
        {
          title: 'Критерії відбору',
          layout: 'fit',
          items: [{
            xtype: 'treepanel',
            rootVisible: false,
            useArrows: true,
            frame: true,
            bind: {
              store: '{lprTree}'
            },
            viewConfig: {
              plugins: {
                treeviewdragdrop: {
                  containerScroll: true
                }
              }
            },
          }]
        }, {
          title: 'Пріоритет форматів',
          layout: 'fit',
          items: [{
            xtype: 'treepanel',
            rootVisible: false,
            checkPropagation: 'down',
            bind: {
              store: '{fTree}'
            },
            viewConfig: {
              plugins: {
                treeviewdragdrop: {
                  containerScroll: true
                }
              }
            }
          }]
        }
      ]
    }
  ],
  listeners: {
    show: function (dlg) {
      var vm = dlg.getViewModel(),
      fTreeStore = Ext.getStore('FormatsTree'),
      lprTreeStore = Ext.getStore('LinkPoiRulesTree');
      vm.get('fTree').getRoot().removeAll();
      fTreeStore.getRoot().eachChild((child) => {
        vm.get('fTree').getRoot().appendChild(child.copy());
      })
      vm.get('lprTree').getRoot().removeAll();
      lprTreeStore.getRoot().eachChild((child) => {
        vm.get('lprTree').getRoot().appendChild(child.copy());
      })
      vm.set('localmaximumfaces', dlg.getMaximumFaces())
    },
    savesettings: function (dlg) {
      var vm = dlg.getViewModel(),
      fTreeStore = Ext.getStore('FormatsTree'),
      lprTreeStore = Ext.getStore('LinkPoiRulesTree');
      fTreeStore.getRoot().removeAll();
      vm.get('fTree').getRoot().eachChild((child) => {
        fTreeStore.getRoot().appendChild(child.copy());
      })
      lprTreeStore.getRoot().removeAll();
      vm.get('lprTree').getRoot().eachChild((child) => {
        lprTreeStore.getRoot().appendChild(child.copy());
      })
      // console.log(vm.get('localmaximumfaces'));
      dlg.setMaximumFaces(vm.get('localmaximumfaces'));
    }
  }
});
