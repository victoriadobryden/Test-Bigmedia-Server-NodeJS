Ext.define('Bigmedia.view.dialog.DlgAutoPlan',{
  extend: 'Bigmedia.view.dialog.MaterialDialog',

  requires: [
    'Bigmedia.view.dialog.DlgAutoPlanController',
    'Bigmedia.view.dialog.DlgAutoPlanModel',
    'Bigmedia.component.CustomNumberField',
    'Bigmedia.component.AutoPlanCityParams',
    'Ext.slider.Single'
  ],

  controller: 'dialog-dlgautoplan',
  viewModel: {
    type: 'dialog-dlgautoplan'
  },

  title: 'Спланувати кампанію',

  layout: 'fit',

  items: [
    {
      xtype: 'container',
      reference: 'step1',
      bind: {
        hidden: '{step != 1}'
      },

      layout: 'anchor',
      defaults: {
        anchor: '100%'
      },
      scrollable: 'y',
      items: [
        {
          bind: {
            html: '<span style="font-size: 10px; color: #111">Крок {step} з {steps}</span>'
          }
        },
        {
          html: '<span style="font-weight: bold; font-size: 2em; line-height: 1.3em">Вкажіть бюджет, кількість щитів та охоплення кампанії</span>'
        },
        {
          html: '<span style="font-weight: bold; font-size: 12px; line-height: 13px">Загальний</span>',
          margin: '20px 0 5px 0'
        },
        {
          layout: {
            type: 'hbox',
            align: 'stretch'
          },
          defaults: {
            labelAlign: 'top',
            hideTrigger: false,
            allowDecimals: false
          },
          items: [
            {
              xtype: 'customnumberfield',
              fieldLabel: 'Бюджет',
              labelStyle: 'z-index: 1',
              step: 1000,
              ui: 'plannerfield',
              grow: true,
              flex: 1,
              minValue: 0,
              triggers: {
                hryvnia: {
                  cls: 'x-fa fa-hryvnia'
                }
              },
              listeners: {
                change: 'onTotalBudgetChange'
              }
            },
            // {
              //   xtype: 'textfield',
              //   editable: false,
              //   hideEmptyLabel: false,
              //   ui: 'plannerfield',
              //   grow: true,
              //   width: 15,
              //   tabIndex: -1,
              //   value: '₴'
              // },
              {
                xtype: 'customnumberfield',
                fieldLabel: 'Охоплення',
                labelStyle: 'z-index: 1',
                ui: 'plannerfield',
                padding: '0 0 0 10px',
                grow: true,
                step: 1,
                width: 100,
                minValue: 1,
                maxValue: 100,
                triggers: {
                  percent: {
                    weight: -1,
                    cls: 'x-fa fa-percent'
                  }
                },
                listeners: {
                  change: 'onCoverageChange'
                }
              },
              // {
                //   xtype: 'textfield',
                //   editable: false,
                //   grow: true,
                //   hideEmptyLabel: false,
                //   ui: 'plannerfield',
                //   width: 15,
                //   tabIndex: -1,
                //   value: '%'
                // }
              ]
            },
            // {
            //   flex: 1,
            //   // layout: 'fit',
            //   scrollable: 'y',
            //   items: [
                {
                  xtype: 'container',
                  reference: 'cities',
                  // layout: {
                  //   type: 'vbox',
                  //   align: 'stretch'
                  // }
                  layout: 'anchor',
                  defaults: {
                    anchor: '100%'
                  },
                }
              // ]
            // }
          ]
    },
    {
      xtype: 'container',
      reference: 'step2',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      scrollable: 'y',
      bind: {
        hidden: '{step != 2}'
      },

      defaults: {
        width: '100%'
      },
      items: [
        {
          bind: {
            html: '<span style="font-size: 10px; color: #111">Крок {step} з {steps}</span>'
          }
        },
        {
          html: '<span style="font-weight: bold; font-size: 2em; line-height: 1.3em">Тонкі налаштування автопідбору</span>'
        },
        {
          html: '<span style="font-weight: bold; font-size: 12px; line-height: 13px">Спліти між сторонами</span>',
          margin: '20px 0 5px 0'
        },
        {
          xtype: 'slider',
          bind: '{A}',
          margin: 0,
        },
        {
          layout: {
            type: 'hbox',
            align: 'stretch'
          },
          items: [
            { bind: { html: 'A - {A}%'}},
            { flex: 1},
            { bind: { html: 'B - {B}%'}}
          ]
        },
        {
          html: '<span style="font-weight: bold; font-size: 12px; line-height: 13px">Додаткові налаштування</span>',
          margin: '20px 0 5px 0'
        },
        {
          xtype: 'customnumberfield',
          fieldLabel: 'На одній вулиці не більше (щитів)',
          labelAlign: 'top',
          labelStyle: 'z-index: 1',
          // labelWidth: 300,
          minValue: 1,
          ui: 'plannerfield',
          width: '100%',
          bind: '{maxOnStreet}'
        },
        {
          xtype: 'customnumberfield',
          fieldLabel: 'Щити на одній вулиці один до одного не ближче ніж (м)',
          labelAlign: 'top',
          labelStyle: 'z-index: 1',
          // labelWidth: 300,
          minValue: 1,
          ui: 'plannerfield',
          width: '100%',
          bind: '{minDistanceOnStreet}'
        },
        {
          xtype: 'customnumberfield',
          fieldLabel: 'Мінімальна відстань між довільними щитами (м)',
          labelAlign: 'top',
          labelStyle: 'z-index: 1',
          // labelWidth: 300,
          minValue: 1,
          ui: 'plannerfield',
          width: '100%',
          bind: '{minDistance}'
        },
        {
          xtype: 'customnumberfield',
          fieldLabel: 'OTS',
          labelStyle: 'z-index: 1',
          labelAlign: 'top',
          ui: 'plannerfield',
          // labelWidth: 300,
          minValue: 0,
          maxValue: 150,
          width: '100%',
          bind: '{otsFrom}'
        }
      ]
    }, {
      xtype: 'container',
      reference: 'step3',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      bind: {
        hidden: '{step != 3}'
      },
      height: '100%',

      defaults: {
        width: '100%'
      },
      items: [
        {
          bind: {
            html: '<span style="font-size: 10px; color: #111">Зачекайте, будь ласка, готуємо варіанти рекламних кампаній...</span>'
          }
        },
        { flex: 1},
        {
          xtype: 'progressbar',
          reference: 'progress'
        },
        { flex: 1}
      ]
    }, {
      xtype: 'container',
      reference: 'step4',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      scrollable: 'y',
      bind: {
        hidden: '{step != 4}'
      },

      defaults: {
        width: '100%'
      },
      items: [
        {
          html: '<span style="font-weight: bold; font-size: 2em; line-height: 1.3em">Виберіть варіант, який найкраще відповідає вашим потребам</span>'
        },
        {
          style: 'border: 1px solid #e2e2e2; border-radius: 5px',
          margin: '20px 0 10px 0',
          padding: 10,
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          items: [
            {
              xtype: 'radio',
              name: 'planVariant',
              bind: {
                boxLabel: 'Дешевші щити • <b>{minPrice.boards}</b> бордів',
              },
              reference: 'minPrice'
            },
            {
              margin: '0 0 0 35px',
              bind: {
                html: '<span>Бюджет - <b>{minPrice.budget:number("0,000")} грн</b>. Покриття - <b>{minPrice.coverage:number("0.00")}%</b>. OTS - <b>{minPrice.sumOts:number("0,000")}</b></span>'
              }
            }
          ]
        },
        {
          style: 'border: 1px solid #e2e2e2; border-radius: 5px',
          margin: '20px 0 10px 0',
          padding: 10,
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          items: [
            {
              xtype: 'radio',
              name: 'planVariant',
              bind: {
                boxLabel: 'Ексклюзивні щити • <b>{maxCoverage.boards}</b> бордів',
              },
              reference: 'maxCoverage'
            },
            {
              margin: '0 0 0 35px',
              bind: {
                html: '<span>Бюджет - <b>{maxCoverage.budget:number("0,000")} грн</b>. Покриття - <b>{maxCoverage.coverage:number("0.00")}%</b>. OTS - <b>{maxCoverage.sumOts:number("0,000")}</b></span>'
              }
            }
          ]
        },
        {
          style: 'border: 1px solid #e2e2e2; border-radius: 5px',
          margin: '20px 0 10px 0',
          padding: 10,
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          items: [
            {
              xtype: 'radio',
              name: 'planVariant',
              bind: {
                boxLabel: 'Оптимальний • <b>{optimal.boards}</b> бордів',
              },
              reference: 'optimal'
            },
            {
              margin: '0 0 0 35px',
              bind: {
                html: '<span>Бюджет - <b>{optimal.budget:number("0,000")} грн</b>. Покриття - <b>{optimal.coverage:number("0.00")}%</b>. OTS - <b>{optimal.sumOts:number("0,000")}</b></span>'
              }
            }
          ]
        }
      ]
    }
  ],

  bbar: {
    items: [
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Назад',
        bind: {
          hidden: '{!(step == 2)}'
        },
        handler: function (btn) {
          btn.up('window').getViewModel().set('step', 1);
        }
      },
      '->',
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Далі',
        bind: {
          hidden: '{!(step == 1)}'
        },
        handler: function (btn) {
          btn.up('window').getViewModel().set('step', 2);
        }
      },
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Почати підбір',
        bind: {
          hidden: '{!(step == 2)}'
        },
        handler: 'onStartClick'
      },
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Вибрати',
        bind: {
          hidden: '{!(step == 4)}'
        },
        handler: 'onSelectClick'
      }
    ]
  },

  listeners: {
    close: 'onDestroy'
  }
});
