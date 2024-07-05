
Ext.define("Bigmedia.view.field.SelectedFilterTag",{
    extend: "Ext.form.field.Tag",
    xtype: "selectedfiltertag",

    requires: [
        "Bigmedia.view.field.SelectedFilterTagController",
        "Bigmedia.view.field.SelectedFilterTagModel"
    ],

    controller: "field-selectedfiltertag",
    // viewModel: {
    //     type: "field-selectedfiltertag"
    // },

    store: new Ext.data.Store({
        fields: [
            {name: 'id', type: 'int'},
            {name: 'name', type: 'string'},
            {name: 'totalCount', type: 'int', defaultValue: '0'},
            {name: 'addCount', type: 'int', defaultValue: '0'}
        ],
        data: [
            {id: 0, name: Bigmedia.Locales.selectedFilterUnselected},
            {id: 1, name: Bigmedia.Locales.selectedFilterSelected}
        ]
    }),

    typeAhead: false,
    editable: false,
    selectOnFocus: false,
    hideTrigger: false,
    queryMode: 'local',
    triggerOnClick: true,

    filterField: 'selected',
    //labelWidth: 60,
    displayField: 'name',
    valueField: 'id',
    filterPickList: true,
    labelTpl: new Ext.XTemplate('{name}<tpl if="addCount &gt; 0"><span class="tagfield-badge">{addCount}</span></tpl>', { //{[this.inGrid(values.id, targetGrid, filterField)]}
            disableFormats: true
        }
    ),

    tipTpl: new Ext.XTemplate(Bigmedia.Locales.refTagTip, {disableFormats: true}
    ),
    tpl: new Ext.XTemplate(
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item <tpl if="addCount &lt;= 0">x-boundlist-item-disabled</tpl>">{name}<tpl if="addCount &gt; 0"><span class="tagfield-badge">{addCount}</span></tpl></li>', //{[this.inGrid(values.id, targetGrid, filterField)]}
        '</tpl></ul>',
        {
            disableFormats: true
        }
    ),
    setTargetStore: function(store){
        this.targetStore = store;
        this.getController().connectToStore(store);
    },
    setTargetGrid: function(grid){
        this.targetGrid = grid;
        this.getController().connectToGrid(grid);
    },
    initComponent: function () {
        this.onBefore('expand', 'onBeforeTagExpand', this.getController());
        this.callParent([arguments]);
    },
    listeners: {
        //keypress: function (combo, e, eOpts) {
        //    //if(combo.getRawValue().length > combo.minChars){
        //    //    this.recalcRefData();
        //    //    this.getPicker().refresh();
        //    //}
        //},
        beforeselect: function (combo, record) {
            return record.get('addCount') > 0;
        },
        change: 'onTagValueChanged'
    }
});
