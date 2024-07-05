Ext.define('Bigmedia.view.dialog.DlgAutoPlanNoob',{
  extend: 'Ext.window.Window',

  requires: [
    'Bigmedia.view.dialog.DlgAutoPlanNoobController',
    'Bigmedia.view.dialog.DlgAutoPlanNoobModel',
    'Bigmedia.component.CustomNumberField',
    'Ext.slider.Single',
    'Bigmedia.component.PoiCatSimplePanel',
    'Bigmedia.view.dialog.DlgNoobSaveResult',
    'Ext.layout.container.Accordion',
    'Bigmedia.view.dialog.DlgAutoPlanNoobFinish'
  ],

  controller: 'dialog-dlgautoplannoob',
  viewModel: {
    type: 'dialog-dlgautoplannoob'
  },

  closeAction: 'destroy',

  width: '100%',
  height: '100%',

  header: false,

  maximized: true,

  layout: 'fit',

  items: [
    {
      xtype: 'container',
      layout: {
        type: 'hbox',
        align: 'stretch',
        pack: 'center'
      },
      reference: 'step0',
      bind: {
        hidden: '{step !== 0}'
      },
      items: [
        {
          xtype: 'container',
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          width: 600,
          items: [
            {
              bind: {
                html: '<span style="font-weight: bold; font-size: 11px; color: #111">Вітаємо в bigmedia assistant</span>'
              },
              padding: '80 0 20 0'
            },
            {
              html: '<span style="font-weight: bold; font-size: 4em; line-height: 1.3em">Спланувати кампанію автоматично в 4 кроки</span>',
              margin: '0 0 30px 0'
            },
            {
              xtype: 'container',
              items: [
                {
                  xtype: 'button',
                  scale: 'large',
                  ui: 'base-blue',
                  text: 'Розпочати',
                  handler: function (btn) {
                    btn.up('window').getViewModel().set('step', 1);
                  }
                }
              ]
            },
            {
              flex: 2
            },
            { html: '<hr style="border-top: 1px solid #eee">'},
            {
              html: '<span style="font-size: 10px; color: #111">Я досвідчений користувач і створю кампанію самостійно - <a href="#faces">Експертний режим</a></span>',
              padding: '40 0'
            }
          ]
        }
      ]
    },
    {
      xtype: 'container',
      reference: 'step1',
      layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
      },
      scrollable: 'y',
      bind: {
        hidden: '{!(step > 0)}'
      },

      // defaults: {
      //   width: '100%'
      // },
      items: [
        {
          xtype: 'container',
          layout: {
            type: 'center'
          },
          items: [
            {
              xtype: 'container',
              // width: '80%',
              // minWidth: 600,
              bind: {
                hidden: '{!(step == 1)}'
              },
              // height: '100%',
              layout: {
                type: 'vbox',
                align: 'stretch'
              },
              items: [
                {
                  padding: '30 0',
                  html: '<span style="font-weight: bold; font-size: 2em; line-height: 1.3em">Виберіть період проведення кампанії</span>'
                },
                {
                  xtype: 'customdaterange',
                  reference: 'daterange',
                  startDate: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+1, 1)),
                  endDate: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth()+2, 0)),
                  hideDaysMode: true,
                  // bind: {
                  //   startDate: '{startDate}',
                  //   endDate: '{endDate}'
                  // },
                  listeners: {
                    periodchanged: 'onDateRangePeriodChanged',
                    // selectperiod: function (range) {
                      //   range.up('menu').hide();
                      // }
                    }
                }
              ]
            },
            {
              xtype: 'container',
              width: 400,
              minWidth: 400,
              bind: {
                hidden: '{!(step == 2)}'
              },
              // height: '100%',
              layout: {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
              },
              items: [
                {
                  // width: 600,
                  padding: '30 0 10 0',
                  html: '<span style="font-weight: bold; font-size: 2em; line-height: 1.3em">Оберіть населенні пункти кампанії</span>'
                },
                {
                  style: 'border: 1px solid #e2e2e2; border-radius: 5px',
                  margin: '20px 0 10px 0',
                  padding: 10,
                  // width: 600,
                  layout: {
                    type: 'vbox',
                    align: 'stretch'
                  },
                  items: [
                    {
                      xtype: 'radio',
                      name: 'planCities',
                      boxLabel: 'Обласні центри',
                      reference: 'oblCenterRadio',
                      inputValue: 'oblCenter',
                      bind: '{oblCenters}',
                      listeners: {
                        change: 'onCityRadioChange'
                      }
                    },
                    {
                      margin: '0 0 0 35px',
                      bind: {
                        html: '<span>Київ, Кропивницький, Луцьк, Львів, Миколаїв, Одеса та ще 16 міст</span>'
                      }
                    }, {
                      xtype: 'container',
                      scrollable: 'y',
                      height: 200,
                      bind: {
                        hidden: '{!oblCenters}'
                      },
                      items: [
                        {
                          xtype: 'grid',
                          reference: 'gridobl',
                          flex: 1,
                          bind: {
                            store: '{obls}',
                          },
                          selModel: {
                            type: 'checkboxmodel',
                            checkOnly: true
                          },
                          columns: [
                            {
                              dataIndex: 'name',
                              text: 'Назва',
                              flex: 1,
                              sortable: true,
                              menuDisabled: true
                            }
                          ],
                          listeners: {
                            selectionchange: 'onCitiesSelectionChange'
                          }
                        }
                      ]
                    },
                  ]
                },
                {
                  style: 'border: 1px solid #e2e2e2; border-radius: 5px',
                  margin: '20px 0 10px 0',
                  padding: 10,
                  // width: 600,
                  layout: {
                    type: 'vbox',
                    align: 'stretch'
                  },
                  items: [
                    {
                      xtype: 'radio',
                      name: 'planCities',
                      boxLabel: 'Західна Україна',
                      reference: 'westUkraineRadio',
                      inputValue: 'westUkraine',
                      bind: '{westUkraine}',
                      listeners: {
                        change: 'onCityRadioChange'
                      }
                    },
                    {
                      margin: '0 0 0 35px',
                      bind: {
                        html: '<span>Львів, Чернівці, Рівне, Івано-Франківськ та ще 3 міста</span>'
                      }
                    }, {
                      xtype: 'container',
                      scrollable: 'y',
                      height: 200,
                      bind: {
                        hidden: '{!westUkraine}'
                      },
                      items: [
                        {
                          xtype: 'grid',
                          reference: 'gridwest',
                          flex: 1,
                          bind: {
                            store: '{west}',
                          },
                          selModel: {
                            type: 'checkboxmodel',
                            //type: 'rowmodel',
                            checkOnly: true
                          },
                          columns: [
                            {
                              dataIndex: 'name',
                              text: 'Назва',
                              flex: 1,
                              sortable: true,
                              menuDisabled: true
                            }
                          ],
                          listeners: {
                            selectionchange: 'onCitiesSelectionChange'
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  style: 'border: 1px solid #e2e2e2; border-radius: 5px',
                  margin: '20px 0 10px 0',
                  padding: 10,
                  // width: 600,
                  layout: {
                    type: 'vbox',
                    align: 'stretch'
                  },
                  items: [
                    {
                      xtype: 'radio',
                      name: 'planCities',
                      boxLabel: 'Міста-мільйонники',
                      reference: 'milCitiesRadio',
                      bind: '{milCities}',
                      listeners: {
                        change: 'onCityRadioChange'
                      }
                    },
                    {
                      margin: '0 0 0 35px',
                      bind: {
                        html: '<span>Київ, Львів, Одеса, Харків, Запоріжжя, Дніпро</span>'
                      }
                    }, {
                      xtype: 'container',
                      scrollable: 'y',
                      height: 200,
                      bind: {
                        hidden: '{!milCities}'
                      },
                      items: [
                        {
                          xtype: 'grid',
                          reference: 'gridmil',
                          flex: 1,
                          bind: {
                            store: '{millions}',
                          },
                          selModel: {
                            type: 'checkboxmodel',
                            //type: 'rowmodel',
                            checkOnly: true
                          },
                          columns: [
                            {
                              dataIndex: 'name',
                              text: 'Назва',
                              flex: 1,
                              sortable: true,
                              menuDisabled: true
                            }
                          ],
                          listeners: {
                            selectionchange: 'onCitiesSelectionChange'
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  style: 'border: 1px solid #e2e2e2; border-radius: 5px',
                  margin: '20px 0 10px 0',
                  padding: 10,
                  // width: 400,
                  // width: 400,
                  layout: {
                    type: 'vbox',
                    align: 'stretch'
                  },
                  items: [
                    {
                      xtype: 'radio',
                      name: 'planCities',
                      boxLabel: 'Обрати серед всіх міст',
                      reference: 'manualCitiesRadio',
                      bind: '{manualCities}',
                      listeners: {
                        change: 'onCityRadioChange'
                      }
                    },
                    {
                      margin: '0 0 0 35px',
                      bind: {
                        html: '<span></span>'
                      }
                    }, {
                      xtype: 'container',
                      scrollable: 'y',
                      height: 200,
                      bind: {
                        hidden: '{!manualCities}'
                      },
                      items: [
                        {
                          xtype: 'grid',
                          reference: 'gridall',
                          flex: 1,
                          bind: {
                            store: '{allCities}',
                          },
                          selModel: {
                            type: 'checkboxmodel',
                            //type: 'rowmodel',
                            checkOnly: true
                          },
                          columns: [
                            {
                              dataIndex: 'name',
                              text: 'Назва',
                              flex: 1,
                              sortable: true,
                              menuDisabled: true
                            }
                          ],
                          listeners: {
                            selectionchange: 'onCitiesSelectionChange'
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              xtype: 'container',
              width: 400,
              minWidth: 400,
              bind: {
                hidden: '{!(step == 3)}'
              },
              height: '100%',
              layout: {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
              },
              items: [
                {
                  padding: '30 0 10 0',
                  html: '<span style="font-weight: bold; font-size: 2em; line-height: 1.3em">Вкажіть бюджет, кількість щитів та охоплення кампанії</span>'
                },
                {
                  layout: {
                    type: 'hbox',
                    align: 'stretch'
                  },
                  flex: 1,
                  width: '100%',
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
                  ]
                },
                {
                  xtype: 'container',
                  reference: 'citiesparamscontainer',
                  layout: 'anchor',
                  defaults: {
                    anchor: '100%'
                  },
                }
              ]
            },
            {
              xtype: 'container',
              width: 400,
              minWidth: 400,
              bind: {
                hidden: '{!(step == 4)}'
              },
              height: '100%',
              items: [
                {
                  padding: '30 0 10 0',
                  html: '<span style="font-weight: bold; font-size: 2em; line-height: 1.3em">Виберіть бажане розташування носіїв</span><br><span style="font-weight: normal; font-size: 1.4em; line-height: 1.0em">(не обов\'язково)</span>'
                },
                {
                  xtype: 'container',
                  reference: 'poicatsaccordion',
                  layout: {
                    type: 'accordion',
                    hideCollapseTool: true,
                    vertical: true
                  },
                  flex: 1,
                  items: [
                    {
                      xtype: 'poicatsimplepanel',
                      cat: {
                        id: 162
                      }
                    },
                    {
                      xtype: 'poicatsimplepanel',
                      cat: {
                        id: 4
                      }
                    },
                    {
                      xtype: 'poicatsimplepanel',
                      cat: {
                        id: 178
                      }
                    },
                    {
                      xtype: 'poicatsimplepanel',
                      cat: {
                        id: 233
                      }
                    },
                    {
                      xtype: 'poicatsimplepanel',
                      cat: {
                        id: 247
                      }
                    },
                    {
                      xtype: 'poicatsimplepanel',
                      cat: {
                        id: 11
                      }
                    }
                  ]
                }
              ]
            },
            {
              layout: 'fit',
              reference: 'step5',
              bind: {
                hidden: '{step != 5}'
              },
              height: '100%',
              items: [
                {
                  xtype: 'container',
                  width: 400,
                  minWidth: 400,
                  layout: {
                    type: 'vbox',
                    pack: 'middle',
                    align: 'stretch'
                  },

                  defaults: {
                    width: '100%'
                  },
                  items: [
                    {
                      padding: '50 0 40 0',
                      bind: {
                        html: '<span style="font-size: 13px; color: #111; line-height: 16px">Зачекайте, будь ласка.<br>Готуємо варіанти рекламних кампаній з-поміж {facesCount} рекламних щитів...</span>'
                      }
                    },
                    { flex: 1},
                    {
                      xtype: 'progressbar',
                      reference: 'progress',
                      hidden: true
                    },
                    {
                      html: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: rgb(255, 255, 255) none repeat scroll 0% 0%; display: block;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                      <rect fill="#0289d1" x="15" y="15" width="30" height="30" rx="3" ry="3">
                      <animate attributeName="x" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="-1.8333333333333333s"></animate>
                      <animate attributeName="y" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="-1.3333333333333333s"></animate>
                      </rect><rect fill="#d11724" x="15" y="15" width="30" height="30" rx="3" ry="3">
                      <animate attributeName="x" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="-1.1666666666666667s"></animate>
                      <animate attributeName="y" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="-0.6666666666666666s"></animate>
                      </rect><rect fill="#31a851" x="15" y="15" width="30" height="30" rx="3" ry="3">
                      <animate attributeName="x" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="-0.5s"></animate>
                      <animate attributeName="y" dur="2s" repeatCount="indefinite" keyTimes="0;0.083;0.25;0.333;0.5;0.583;0.75;0.833;1" values="15;55;55;55;55;15;15;15;15" begin="0s"></animate>
                      </rect>
                      </svg>`
                    },
                    { flex: 1}
                  ]
                }
              ]
            },
            {
              xtype: 'container',
              reference: 'step6',
              width: 400,
              minWidth: 400,
              layout: {
                type: 'vbox',
                align: 'stretch'
              },
              scrollable: 'y',
              bind: {
                hidden: '{step != 6}'
              },

              defaults: {
                width: '100%'
              },
              items: [
                {
                  padding: '30 0 20 0',
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
                        boxLabel: 'Дешевші борди · {minPrice.boards} бордів',
                      },
                      reference: 'minPrice'
                    },
                    {
                      margin: '0 0 0 35px',
                      bind: {
                        html: '<span>Бюджет - {minPrice.budget:number("0")}грн. Покриття - {minPrice.coverage:number("0.00")}%. OTS - {minPrice.sumOts:number("0")}</span>'
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
                        boxLabel: 'Ексклюзивні щити · {maxCoverage.boards} бордів',
                      },
                      reference: 'maxCoverage'
                    },
                    {
                      margin: '0 0 0 35px',
                      bind: {
                        html: '<span>Бюджет - {maxCoverage.budget:number("0")}грн. Покриття - {maxCoverage.coverage:number("0.00")}%. OTS - {maxCoverage.sumOts:number("0")}</span>'
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
                        boxLabel: 'Оптимальний · {optimal.boards} бордів',
                      },
                      reference: 'optimal'
                    },
                    {
                      margin: '0 0 0 35px',
                      bind: {
                        html: '<span>Бюджет - {optimal.budget:number("0")}грн. Покриття - {optimal.coverage:number("0.00")}%. OTS - {optimal.sumOts:number("0")}</span>'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
      ]
    },
    {
      xtype: 'simplefinish',
      reference: 'simplefinish',
      floated: true,
      hidden: true
    }
  ],

  tbar: {
      xtype: 'container',
      reference: 'tbar',
      layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
      },
      bind: {
        hidden: '{!(step > 0)}'
      },
      hidden: true,
      items: [
        {
          padding: '5 0',
          layout: {
            type: 'hbox',
            align: 'center'
          },
          items:[
            {
              width: 220,
              height: 30,
              style: 'border-right: 1px solid #eee',
              html: '<div style="background: center / contain no-repeat url(resources/images/bma.png); width: 220px; height: 30px"></div>"'
            },
            {
              bind: {
                hidden: '{!(step > 0 && step < 5)}'
              },
              layout: {
                type: 'hbox',
                pack: 'start'
              },
              items: [
                {
                  padding: '0 10',
                  // style: '',
                  bind: {
                    html: '<span style="{step == 1 ? "color: #027dc0;" : ""}{step > 0 ? "font-weight: bolder" : ""}">1. Період</span>'
                  }
                },
                {
                  html: '<i class="fas fa-chevron-right" style="font-size: 7px;"></i>'
                },
                {
                  padding: '0 10',
                  bind: {
                    html: '<span style="{step == 2 ? "color: #027dc0;" : ""}{step > 1 ? "font-weight: bolder" : ""}">2. Покриття</span>'
                  }
                  // html: '2. Покриття'
                },
                {
                  html: '<i class="fas fa-chevron-right" style="font-size: 7px;"></i>'
                },
                {
                  padding: '0 10',
                  bind: {
                    html: '<span style="{step == 3 ? "color: #027dc0;" : ""}{step > 2 ? "font-weight: bolder" : ""}">3. Бюджет</span>'
                  }
                  // html: '3. Бюджет'
                },
                {
                  html: '<i class="fas fa-chevron-right" style="font-size: 7px;"></i>'
                },
                {
                  padding: '0 10',
                  bind: {
                    html: '<span style="{step == 4 ? "color: #027dc0;" : ""}{step > 3 ? "font-weight: bolder" : ""}">4. Розташування</span>'
                  }
                  // html: '4. Розташування'
                }
              ]
            }
          ]
        },
        {
          html: '<hr style="border-top: 1px solid #eee">'
        }
      ]
  },

  bbar: {
    bind: {
      hidden: '{!step}'
    },
    hidden: true,
    items: [
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Назад',
        bind: {
          hidden: '{step == 0 || (step > 4 && step < 6)}'
        },
        handler: function (btn) {
          var vm = btn.up('window').getViewModel(),
            step = vm.get('step');
          if (step == 6) {
            vm.set('step', step - 2);
          } else {
            vm.set('step', step - 1);
          }
        }
      },
      '->',
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Далі',
        bind: {
          hidden: '{step > 3}',
          disabled: '{disabledNext}'
        },
        handler: function (btn) {
          var vm = btn.up('window').getViewModel(),
            step = vm.get('step');
          vm.set('step', step + 1);
        }
      },
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Почати підбір',
        bind: {
          hidden: '{!(step == 4)}'
        },
        handler: 'onStartClick'
      },
      {
        scale: 'large',
        ui: 'base-blue',
        text: 'Вибрати',
        bind: {
          hidden: '{!(step == 6)}'
        },
        handler: 'onSelectClick'
      }
    ]
  },

  listeners: {
    beforedestroy: 'onDestroy'
  }
});
