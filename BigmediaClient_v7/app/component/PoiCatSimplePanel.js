Ext.define('Bigmedia.component.PoiCatSimplePanel', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.poicatsimplepanel',

  config: {
    cat: null //{id, children: []}
  },

  updateCat: function (cat) {
    var store = Ext.getStore('PoiCategoriesTree'),
      me = this,
      children = me.getViewModel().getStore('children');
    if (!store.isLoaded()) {
      store.on('load', function() {
        me.loadCatNodes(cat);
        // var rec = store.getNodeById(cat.id);
        // if (rec) {
        //   me.getViewModel().set('catName', rec.get('name'));
        //   me.setIconCls(rec.get('iconCls'));
        // }
        // var childrenTextArr = []
        // cat.children.forEach((id) => {
        //   var child = store.getNodeById(id);
        //   if (child) {
        //     children.add({
        //       id: child.getId(),
        //       name: child.get('name')
        //     })
        //     if (childrenTextArr.length < 5) {
        //       childrenTextArr.push(child.get('name'))
        //     }
        //   }
        // });
        // var childrenText = childrenTextArr.join(', ')
        // if (children.getCount() > 5) {
        //   childrenText += ' та ще ' + (children.getCount() - childrenTextArr.length).toString()
        // }
        // me.getViewModel().set('childrenText', childrenText);
      })
      return;
    }
    me.loadCatNodes(cat);
    // var rec = store.getNodeById(cat.id);
    // if (rec) {
    //   me.getViewModel().set('catName', rec.get('name'));
    //   me.setIconCls(rec.get('iconCls'));
    // }
    // var childrenTextArr = []
    // cat.children.forEach((id) => {
    //   var child = store.getNodeById(id);
    //   if (child) {
    //     children.add({
    //       id: child.getId(),
    //       name: child.get('name')
    //     })
    //     if (childrenTextArr.length < 5) {
    //       childrenTextArr.push(child.get('name'))
    //     }
    //   }
    // });
    // var childrenText = childrenTextArr.join(', ')
    // if (children.getCount() > 5) {
    //   childrenText += ' та ще ' + (children.getCount() - childrenTextArr.length).toString()
    // }
    // me.getViewModel().set('childrenText', childrenText);
  },

  getChildren: function (node) {
    var me = this,
      res = [];
    node.childNodes.forEach((child) => {
      if (!child.childNodes.length) {
        res.push(child)
      } else {
        res = res.concat(me.getChildren(child))
      }
    })
    return res;
  },

  loadCatNodes: function (cat) {
    var store = Ext.getStore('PoiCategoriesTree'),
      me = this,
      children = me.getViewModel().getStore('children');
    var rec = store.getNodeById(cat.id),
      childrenArr;
    if (rec) {
      me.getViewModel().set('catName', rec.get('name'));
      me.setIconCls(rec.get('iconCls'));
      childrenArr = me.getChildren(rec);
      var childrenTextArr = []
      childrenArr.forEach((child) => {
        children.add({
          id: child.getId(),
          name: child.get('name')
        })
        if (childrenTextArr.length < 5) {
          childrenTextArr.push(child.get('name'))
        }
      });
      var childrenText = childrenTextArr.join(', ')
      if (children.getCount() > 5) {
        childrenText += ' та ще ' + (children.getCount() - childrenTextArr.length).toString()
      }
      me.getViewModel().set('childrenText', childrenText);
    }
  },

  getSelCats: function () {
    var grid = this.lookup('cats'),
      res = [];
    grid.getSelectionModel().getSelection().forEach((sel)=>res.push(sel.getId()));
    return res;
  },

  bind: {
    title: '{catName}<br><span style="font-size: 12px; font-weight: normal;">{selCount > 0 ? "Вибрано · " + selCount : childrenText}</span>'
  },

  style: 'border: 1px solid #e2e2e2; border-radius: 5px',
  margin: '10px 0 5px 0',

  referenceHolder: true,

  viewModel: {
    stores: {
      children: {
        fields: ['id', 'name'],
        // data: [{id: 4, name: 'Some category'},
          // {id: 199, name: 'Some category - 2'}]
      }
    },
    data: {
      catName: null,
      childrenText: null,
      selCount: 0
    }
  },

  items: [
    {
      xtype: 'grid',
      reference: 'cats',
      bind: {
        store: '{children}'
      },
      selModel: {
        type: 'checkboxmodel',
        checkOnly: true
      },
      columnLines: false,
      // hideHeaders: true,
      columns: [
        { text: 'Вибрати всі',
          dataIndex: 'name',
          sortable: false,
          menuDisabled: true
        }
      ],
      listeners: {
        selectionchange: function (grid, selected) {
          this.up('panel').getViewModel().set('selCount', selected.length);
        }
      }
    }
  ]
});
