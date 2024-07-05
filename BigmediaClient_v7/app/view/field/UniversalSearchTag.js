Ext.define("Bigmedia.view.field.UniversalSearchTag", {
    extend: "Ext.form.field.Tag",
    xtype: "universalsearchtag",

    requires: [
        "Bigmedia.Locales",
        'Bigmedia.store.Search'
    ],

    // controller: 'field-universalsearchtag',
    store: {
        type: 'search'
    },
    cls: 'searchIcon',

    queryParam: 'q',
    typeAhead: false,
    // hideTrigger: true,
    queryMode: 'remote',
    minChars: 3,
    //enableKeyEvents: true,
    triggerOnClick: false,

    displayField: 'short',
    valueField: 'faces',
    filterPickList: true,

    publishes: 'value',
    labelTpl: new Ext.XTemplate('{short}', {
        disableFormats: true
      }
    ),

    tipTpl: new Ext.XTemplate(Bigmedia.Locales.refTagTip, {disableFormats: true}
    ),
    tpl: new Ext.XTemplate(
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">[{type}]-{name}</li>', //{[this.inGrid(values.id, targetGrid, filterField)]}
        '</tpl></ul>',
        {
            disableFormats: true
        }
    ),
    // listeners: {
    //     beforeselect: function (combo, record) {
    //         return record.get('addCount') > 0;
    //     },
    //     change: 'onTagValueChanged'
    // }
});
