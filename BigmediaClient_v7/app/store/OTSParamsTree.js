Ext.define('Bigmedia.store.OTSParamsTree', {
  extend: 'Ext.data.TreeStore',

  storeId: 'OTSParamsTree',
  alias: 'store.OTSParamsTree',
  root: {
    expanded: true,
    children: [
      {
        text: 'Вікова група',
        expanded: true,
        checked: true,
        children: [
          {
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
          }
          // ,{
          //   text: 'Іншиій',
          //   code: 'Іншиій',
          //   group: 'age',
          //   leaf: true,
          //   checked: true
          // }
        ]
      }, {
        text: 'Рівень доходу',
        expanded: true,
        checked: true,
        children: [
          {
          // TODO: when receive data for this category
            text: 'Низький',
            qtip: 'дохід до 5 тис.грн.',
            //qtip: 'не вистачає на одяг',
            code: 'Low',
            group: 'incomeLevel',
            leaf: true,
            checked: true
          },{
            text: 'Нижче середнього',
            qtip: 'дохід від 5 до 10 тис.грн.',
            //qtip: 'не вистачає на техніку',
            code: 'BelowAverage',
            group: 'incomeLevel',
            leaf: true,
            checked: true
          },{
            text: 'Середній',
            qtip: 'дохід від 10 до 20 тис.грн.',
            //qtip: 'не вистачає на техніку',
            code: 'Average',
            group: 'incomeLevel',
            leaf: true,
            checked: true
          },{
            text: 'Вище середнього',
            qtip: 'дохід від 20 до 30 тис.грн.',
            //qtip: 'не вистачає на техніку',
            code: 'AboveAverage',
            group: 'incomeLevel',
            leaf: true,
            checked: true
          }, {
            text: 'Високий',
            qtip: 'дохід від 30 тис.грн.',
            // qtip: 'вистачає на дорогі покупки',
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
            code: 'Male',
            group: 'sex',
            leaf: true,
            checked: true
          }, {
            id: 'sex_female',
            text: 'Жінки',
            code: 'Female',
            group: 'sex',
            leaf: true,
            checked: true
          }
        ]
       }
       ,{
        text: 'День тижня',
        expanded: true,
        checked: true,
        children: [
          {
            text: 'Понеділок',
            code: 'Monday',
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'Вівторок',
            code: 'Tuesday',
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'Середа',
            code: 'Wednesday',
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'Четвер',
            code: 'Thursday',
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'П\'ятниця',
            code: 'Friday',
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'Субота',
            code: 'Saturday',
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }, {
            text: 'Неділя',
            code: 'Sunday',
            group: 'daysOfWeek',
            leaf: true,
            checked: true
          }
        ]
        }
      //   ,{
      //   text: '',
      //   expanded: true,
      //   // checked: true,
      //   children: [
      //     {
      //       text: '',
      //       code: 'groupDataUnique',
      //       group: 'groupData',
      //       leaf: true,
      //       // checked: true
      //     },
      //     {
      //       text: '',
      //       code: 'groupDataFull',
      //       group: 'groupData',
      //       leaf: true,
      //       // checked: true
      //     }
      //   ]
      // }

      //  ,{
      //   text: 'День тижня',
      //   expanded: true,
      //   checked: true,
      //   children: [
      //     {
      //       text: 'Понеділок',
      //       code: 1,
      //       group: 'daysOfWeek',
      //       leaf: true,
      //       checked: true
      //     }, {
      //       text: 'Вівторок',
      //       code: 2,
      //       group: 'daysOfWeek',
      //       leaf: true,
      //       checked: true
      //     }, {
      //       text: 'Середа',
      //       code: 3,
      //       group: 'daysOfWeek',
      //       leaf: true,
      //       checked: true
      //     }, {
      //       text: 'Четвер',
      //       code: 4,
      //       group: 'daysOfWeek',
      //       leaf: true,
      //       checked: true
      //     }, {
      //       text: 'П\'ятниця',
      //       code: 5,
      //       group: 'daysOfWeek',
      //       leaf: true,
      //       checked: true
      //     }, {
      //       text: 'Субота',
      //       code: 6,
      //       group: 'daysOfWeek',
      //       leaf: true,
      //       checked: true
      //     }, {
      //       text: 'Неділя',
      //       code: 7,
      //       group: 'daysOfWeek',
      //       leaf: true,
      //       checked: true
      //     }
      //   ]
      // }
      
    ]
  },
  fields: [
    { name: 'text' },
    { name: 'code' },
    { name: 'group' }
  ]
});
