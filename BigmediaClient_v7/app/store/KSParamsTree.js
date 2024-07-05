Ext.define('Bigmedia.store.KSParamsTree', {
  extend: 'Ext.data.TreeStore',

  storeId: 'KSParamsTree',
  alias: 'store.KSParamsTree',
  root: {
    expanded: true,
    children: [
      {
        text: 'Version 2',
        checked: false,
        group: 'version',
        code: 'ver2',
        leaf: true
      },
      {
        text: 'Вікова група',
        expanded: true,
        checked: true,
        children: [
          {
            text: '0-17',
            code: '0-17',
            group: 'age',
            leaf: true,
            checked: true
          }, {
            text: '18-24',
            code: '18-24',
            group: 'age',
            leaf: true,
            checked: true
          }, {
            text: '25-34',
            code: '25-34',
            group: 'age',
            leaf: true,
            checked: true
          }, {
            text: '35-44',
            code: '35-44',
            group: 'age',
            leaf: true,
            checked: true
          }, {
            text: '45-54',
            code: '45-54',
            group: 'age',
            leaf: true,
            checked: true
          }, {
            text: '55-64',
            code: '55-64',
            group: 'age',
            leaf: true,
            checked: true
          }, {
            text: '65+',
            code: '65+',
            group: 'age',
            leaf: true,
            checked: true
          }
        ]
      }, {
        text: 'Рівень доходу',
        expanded: true,
        checked: true,
        children: [
          {
          // TODO: when receive data for this category
            text: 'Низький',
            qtip: 'не вистачає на одяг',
            code: 'Low',
            group: 'incomeLevel',
            leaf: true,
            checked: true
          }, {
            text: 'Середній',
            qtip: 'не вистачає на техніку',
            code: 'Medium',
            group: 'incomeLevel',
            leaf: true,
            checked: true
          }, {
            text: 'Високий',
            qtip: 'вистачає на дорогі покупки',
            code: 'High',
            group: 'incomeLevel',
            leaf: true,
            checked: true
          }
        ]
      }, {
        text: 'Стать',
        expanded: true,
        checked: true,
        children: [
          {
            id: 'sex_male',
            text: 'Чоловіки',
            code: 'male',
            group: 'sex',
            leaf: true,
            checked: true
          }, {
            id: 'sex_female',
            text: 'Жінки',
            code: 'female',
            group: 'sex',
            leaf: true,
            checked: true
          }
        ]
      }, {
        text: 'День тижня',
        expanded: true,
        checked: true,
        children: [
          {
            text: 'Понеділок',
            code: 1,
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'Вівторок',
            code: 2,
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'Середа',
            code: 3,
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'Четвер',
            code: 4,
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'П\'ятниця',
            code: 5,
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'Субота',
            code: 6,
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'Неділя',
            code: 7,
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }
        ]
      }, {
        text: 'Часовий проміжок',
        expanded: true,
        checked: true,
        children: [
          {
            text: '00-08',
            code: '00-08',
            group: 'hours',
            leaf: true,
            checked: true
          }, {
            text: '08-12',
            code: '08-12',
            group: 'hours',
            leaf: true,
            checked: true
          }, {
            text: '12-17',
            code: '12-17',
            group: 'hours',
            leaf: true,
            checked: true
          }, {
            text: '17-21',
            code: '17-21',
            group: 'hours',
            leaf: true,
            checked: true
          }, {
            text: '21-00',
            code: '21-00',
            group: 'hours',
            leaf: true,
            checked: true
          }
        ]
      }, {
        text: 'Тип абонента',
        expanded: true,
        checked: true,
        children: [
          {
            text: 'Дім',
            code: 'cnt_only_home',
            group: 'types',
            leaf: true,
            checked: true
          }, {
            text: 'Робота',
            code: 'cnt_only_work',
            group: 'types',
            leaf: true,
            checked: true
          }, {
            text: 'Дім-робота',
            code: 'cnt_home_work',
            group: 'types',
            leaf: true,
            checked: true
          }, {
            text: 'Транзит',
            code: 'cnt_transit',
            group: 'types',
            leaf: true,
            checked: true
          }
          // , {
          //   text: 'cnt_all_subs',
          //   code: 'cnt_all_subs',
          //   group: 'columns',
          //   leaf: true,
          //   checked: true
          // }, {
          //   text: 'cnt_home_general',
          //   code: 'cnt_home_general',
          //   group: 'columns',
          //   leaf: true,
          //   checked: false
          // }, {
          //   text: 'cnt_work_general',
          //   code: 'cnt_work_general',
          //   group: 'columns',
          //   leaf: true,
          //   checked: false
          // }
        ]
      }
      // , {
      //   text: 'Врахувати долю 45%',
      //   code: 'considermarketshare',
      //   group: 'param',
      //   checked: false,
      //   leaf: true
      // }
    ]
  },
  fields: [
    { name: 'text' },
    { name: 'code' },
    { name: 'group' }
  ]
});
