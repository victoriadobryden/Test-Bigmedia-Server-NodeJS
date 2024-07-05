Ext.define('Bigmedia.store.PoiCats', {
    extend: 'Ext.data.Store',
    alias: 'store.poicats',
    storeId: 'PoiCats',

    model: {
        fields: [
            {
                name: 'id'
            },
            {
                name: 'name_ukr'
            },
            {
                name: 'name_ru'
            },
            {
                name: 'name_en'
            },
            {
                name: 'name',
                calculate: function (data) {
                    return data['name_' + Bigmedia.Locales.currentLocale] || data['name_ru'] || '';
                }
            },
            {
                name: 'icon'
            }
        ]
    },

    data: [
        {
            id: 1,
            name_ru: 'Магазины авто',
            name_ukr: 'Магазины авто',
            name_en: 'Магазины авто',
            icon: ''
        }, {
            id: 2,
            name_ru: 'HiFi аппаратура',
            name_ukr: 'HiFi аппаратура',
            name_en: 'HiFi аппаратура',
            icon: 'shop/hifi'
        }, {
            id: 3,
            name_ru: 'Автозапчасти',
            name_ukr: 'Автозапчасти',
            name_en: 'Автозапчасти',
            icon: 'shop/car_parts'
        }, {
            id: 4,
            name_ru: 'Культура, досуг',
            name_ukr: 'Культура, досуг',
            name_en: 'Культура, досуг',
            icon: ''
        }, {
            id: 6,
            name_ru: 'Цирк',
            name_ukr: 'Цирк',
            name_en: 'Цирк',
            icon: ''
        }, {
            id: 10,
            name_ru: 'Посольства',
            name_ukr: 'Посольства',
            name_en: 'Посольства',
            icon: 'amenity/embassy'
        }, {
            id: 11,
            name_ru: 'Еда',
            name_ukr: 'Еда',
            name_en: 'Еда',
            icon: ''
        }, {
            id: 12,
            name_ru: 'Бар',
            name_ukr: 'Бар',
            name_en: 'Бар',
            icon: 'amenity/bar'
        }, {
            id: 13,
            name_ru: 'Кафе',
            name_ukr: 'Кафе',
            name_en: 'Кафе',
            icon: 'amenity/cafe'
        }, {
            id: 14,
            name_ru: 'Летнее кафе',
            name_ukr: 'Летнее кафе',
            name_en: 'Летнее кафе',
            icon: ''
        }, {
            id: 15,
            name_ru: 'Паб',
            name_ukr: 'Паб',
            name_en: 'Паб',
            icon: 'amenity/pub'
        }, {
            id: 16,
            name_ru: 'Ресторан',
            name_ukr: 'Ресторан',
            name_en: 'Ресторан',
            icon: 'amenity/restaurant'
        }, {
            id: 17,
            name_ru: 'Ресторанный дворик',
            name_ukr: 'Ресторанный дворик',
            name_en: 'Ресторанный дворик',
            icon: ''
        }, {
            id: 18,
            name_ru: 'Фастфуд',
            name_ukr: 'Фастфуд',
            name_en: 'Фастфуд',
            icon: ''
        }, {
            id: 19,
            name_ru: 'Магазины электроники',
            name_ukr: 'Магазины электроники',
            name_en: 'Магазины электроники',
            icon: ''
        }, {
            id: 162,
            name_ru: 'Здоровье',
            name_ukr: 'Здоровье',
            name_en: 'Здоровье',
            icon: ''
        }, {
            id: 163,
            name_ru: 'Аптека',
            name_ukr: 'Аптека',
            name_en: 'Аптека',
            icon: ''
        }, {
            id: 164,
            name_ru: 'Больница',
            name_ukr: 'Больница',
            name_en: 'Больница',
            icon: ''
        }, {
            id: 165,
            name_ru: 'Поликлиника, клиника',
            name_ukr: 'Поликлиника, клиника',
            name_en: 'Поликлиника, клиника',
            icon: ''
        }, {
            id: 166,
            name_ru: 'Ветлечебница',
            name_ukr: 'Ветлечебница',
            name_en: 'Ветлечебница',
            icon: ''
        }, {
            id: 167,
            name_ru: 'Стоматология',
            name_ukr: 'Стоматология',
            name_en: 'Стоматология',
            icon: ''
        }, {
            id: 168,
            name_ru: 'Оптика',
            name_ukr: 'Оптика',
            name_en: 'Оптика',
            icon: ''
        }, {
            id: 169,
            name_ru: 'Зоопарк',
            name_ukr: 'Зоопарк',
            name_en: 'Зоопарк',
            icon: ''
        }, {
            id: 170,
            name_ru: 'Кинотеатр',
            name_ukr: 'Кинотеатр',
            name_en: 'Кинотеатр',
            icon: ''
        }, {
            id: 171,
            name_ru: 'Театр, концертный зал',
            name_ukr: 'Театр, концертный зал',
            name_en: 'Театр, концертный зал',
            icon: ''
        }, {
            id: 173,
            name_ru: 'Автосалон',
            name_ukr: 'Автосалон',
            name_en: 'Автосалон',
            icon: ''
        }, {
            id: 174,
            name_ru: 'Магазины активный отдых',
            name_ukr: 'Магазины активный отдых',
            name_en: 'Магазины активный отдых',
            icon: ''
        }, {
            id: 175,
            name_ru: 'Активный отдых',
            name_ukr: 'Активный отдых',
            name_en: 'Активный отдых',
            icon: ''
        }, {
            id: 176,
            name_ru: 'Магазины Lux',
            name_ukr: 'Магазины Lux',
            name_en: 'Магазины Lux',
            icon: ''
        }, {
            id: 177,
            name_ru: 'Бутик',
            name_ukr: 'Бутик',
            name_en: 'Бутик',
            icon: ''
        }, {
            id: 178,
            name_ru: 'Магазины',
            name_ukr: 'Магазины',
            name_en: 'Магазины',
            icon: ''
        }, {
            id: 179,
            name_ru: 'Бытовая химия, косметика',
            name_ukr: 'Бытовая химия, косметика',
            name_en: 'Бытовая химия, косметика',
            icon: ''
        }, {
            id: 180,
            name_ru: 'Велосипеды',
            name_ukr: 'Велосипеды',
            name_en: 'Велосипеды',
            icon: ''
        }, {
            id: 181,
            name_ru: 'Магазины строительство и ремонт',
            name_ukr: 'Магазины строительство и ремонт',
            name_en: 'Магазины строительство и ремонт',
            icon: ''
        }, {
            id: 182,
            name_ru: 'Декор и оформление',
            name_ukr: 'Декор и оформление',
            name_en: 'Декор и оформление',
            icon: ''
        }, {
            id: 183,
            name_ru: 'Детские товары',
            name_ukr: 'Детские товары',
            name_en: 'Детские товары',
            icon: ''
        }, {
            id: 184,
            name_ru: 'Зоомагазин',
            name_ukr: 'Зоомагазин',
            name_en: 'Зоомагазин',
            icon: ''
        }, {
            id: 185,
            name_ru: 'Игрушки',
            name_ukr: 'Игрушки',
            name_en: 'Игрушки',
            icon: ''
        }, {
            id: 186,
            name_ru: 'Инструменты и стройматериалы',
            name_ukr: 'Инструменты и стройматериалы',
            name_en: 'Инструменты и стройматериалы',
            icon: ''
        }, {
            id: 187,
            name_ru: 'Канцелярские товары',
            name_ukr: 'Канцелярские товары',
            name_en: 'Канцелярские товары',
            icon: ''
        }, {
            id: 188,
            name_ru: 'Книжный',
            name_ukr: 'Книжный',
            name_en: 'Книжный',
            icon: ''
        }, {
            id: 189,
            name_ru: 'Компьютеры, оргтехника',
            name_ukr: 'Компьютеры, оргтехника',
            name_en: 'Компьютеры, оргтехника',
            icon: ''
        }, {
            id: 190,
            name_ru: 'Косметика, парфюмерия',
            name_ukr: 'Косметика, парфюмерия',
            name_en: 'Косметика, парфюмерия',
            icon: ''
        }, {
            id: 191,
            name_ru: 'Кухни на заказ',
            name_ukr: 'Кухни на заказ',
            name_en: 'Кухни на заказ',
            icon: ''
        }, {
            id: 192,
            name_ru: 'Мебель',
            name_ukr: 'Мебель',
            name_en: 'Мебель',
            icon: ''
        }, {
            id: 193,
            name_ru: 'Мотоциклы',
            name_ukr: 'Мотоциклы',
            name_en: 'Мотоциклы',
            icon: ''
        }, {
            id: 194,
            name_ru: 'Музыкальные инструменты',
            name_ukr: 'Музыкальные инструменты',
            name_en: 'Музыкальные инструменты',
            icon: ''
        }, {
            id: 195,
            name_ru: 'Продукты',
            name_ukr: 'Продукты',
            name_en: 'Продукты',
            icon: ''
        }, {
            id: 196,
            name_ru: 'Натуральные продукты',
            name_ukr: 'Натуральные продукты',
            name_en: 'Натуральные продукты',
            icon: ''
        }, {
            id: 197,
            name_ru: 'Магазины обувь, одежда и текстиль',
            name_ukr: 'Магазины обувь, одежда и текстиль',
            name_en: 'Магазины обувь, одежда и текстиль',
            icon: ''
        }, {
            id: 198,
            name_ru: 'Обувь',
            name_ukr: 'Обувь',
            name_en: 'Обувь',
            icon: ''
        }, {
            id: 199,
            name_ru: 'Одежда',
            name_ukr: 'Одежда',
            name_en: 'Одежда',
            icon: ''
        }, {
            id: 200,
            name_ru: 'Охота',
            name_ukr: 'Охота',
            name_en: 'Охота',
            icon: ''
        }, {
            id: 201,
            name_ru: 'Подарки, сувениры',
            name_ukr: 'Подарки, сувениры',
            name_en: 'Подарки, сувениры',
            icon: ''
        }, {
            id: 202,
            name_ru: 'Постельное бельё',
            name_ukr: 'Постельное бельё',
            name_en: 'Постельное бельё',
            icon: ''
        }, {
            id: 203,
            name_ru: 'Туризм',
            name_ukr: 'Туризм',
            name_en: 'Туризм',
            icon: ''
        }, {
            id: 204,
            name_ru: 'Продажа, бронирование билетов',
            name_ukr: 'Продажа, бронирование билетов',
            name_en: 'Продажа, бронирование билетов',
            icon: ''
        }, {
            id: 205,
            name_ru: 'Булочная',
            name_ukr: 'Булочная',
            name_en: 'Булочная',
            icon: ''
        }, {
            id: 206,
            name_ru: 'Винно-водочный',
            name_ukr: 'Винно-водочный',
            name_en: 'Винно-водочный',
            icon: ''
        }, {
            id: 207,
            name_ru: 'Кондитерская',
            name_ukr: 'Кондитерская',
            name_en: 'Кондитерская',
            icon: ''
        }, {
            id: 208,
            name_ru: 'Магазин',
            name_ukr: 'Магазин',
            name_en: 'Магазин',
            icon: ''
        }, {
            id: 209,
            name_ru: 'Морепродукты',
            name_ukr: 'Морепродукты',
            name_en: 'Морепродукты',
            icon: ''
        }, {
            id: 210,
            name_ru: 'Мясная лавка',
            name_ukr: 'Мясная лавка',
            name_en: 'Мясная лавка',
            icon: ''
        }, {
            id: 211,
            name_ru: 'Напитки',
            name_ukr: 'Напитки',
            name_en: 'Напитки',
            icon: ''
        }, {
            id: 212,
            name_ru: 'Овощи, фрукты',
            name_ukr: 'Овощи, фрукты',
            name_en: 'Овощи, фрукты',
            icon: ''
        }, {
            id: 213,
            name_ru: 'Чай',
            name_ukr: 'Чай',
            name_en: 'Чай',
            icon: ''
        }, {
            id: 214,
            name_ru: 'Радиодетали',
            name_ukr: 'Радиодетали',
            name_en: 'Радиодетали',
            icon: ''
        }, {
            id: 215,
            name_ru: 'Рыболов',
            name_ukr: 'Рыболов',
            name_en: 'Рыболов',
            icon: ''
        }, {
            id: 216,
            name_ru: 'Рынок, базар',
            name_ukr: 'Рынок, базар',
            name_en: 'Рынок, базар',
            icon: ''
        }, {
            id: 217,
            name_ru: 'Салон связи',
            name_ukr: 'Салон связи',
            name_en: 'Салон связи',
            icon: ''
        }, {
            id: 218,
            name_ru: 'Сантехника, ванные, душевые, фурнитура',
            name_ukr: 'Сантехника, ванные, душевые, фурнитура',
            name_en: 'Сантехника, ванные, душевые, фурнитура',
            icon: ''
        }, {
            id: 219,
            name_ru: 'Семена, садовые принадлежности',
            name_ukr: 'Семена, садовые принадлежности',
            name_en: 'Семена, садовые принадлежности',
            icon: ''
        }, {
            id: 220,
            name_ru: 'Скобяные изделия и инструмент',
            name_ukr: 'Скобяные изделия и инструмент',
            name_en: 'Скобяные изделия и инструмент',
            icon: ''
        }, {
            id: 221,
            name_ru: 'Спорттовары',
            name_ukr: 'Спорттовары',
            name_en: 'Спорттовары',
            icon: ''
        }, {
            id: 222,
            name_ru: 'Сумки, чемоданы',
            name_ukr: 'Сумки, чемоданы',
            name_en: 'Сумки, чемоданы',
            icon: ''
        }, {
            id: 223,
            name_ru: 'Супермаркет',
            name_ukr: 'Супермаркет',
            name_en: 'Супермаркет',
            icon: ''
        }, {
            id: 224,
            name_ru: 'Табак',
            name_ukr: 'Табак',
            name_en: 'Табак',
            icon: ''
        }, {
            id: 225,
            name_ru: 'Ткани',
            name_ukr: 'Ткани',
            name_en: 'Ткани',
            icon: ''
        }, {
            id: 226,
            name_ru: 'Торговый центр',
            name_ukr: 'Торговый центр',
            name_en: 'Торговый центр',
            icon: ''
        }, {
            id: 227,
            name_ru: 'Универмаг',
            name_ukr: 'Универмаг',
            name_en: 'Универмаг',
            icon: ''
        }, {
            id: 228,
            name_ru: 'Хозяйственные товары',
            name_ukr: 'Хозяйственные товары',
            name_en: 'Хозяйственные товары',
            icon: ''
        }, {
            id: 229,
            name_ru: 'Цветы',
            name_ukr: 'Цветы',
            name_en: 'Цветы',
            icon: ''
        }, {
            id: 230,
            name_ru: 'Шторы, портьеры',
            name_ukr: 'Шторы, портьеры',
            name_en: 'Шторы, портьеры',
            icon: ''
        }, {
            id: 231,
            name_ru: 'Электроника',
            name_ukr: 'Электроника',
            name_en: 'Электроника',
            icon: ''
        }, {
            id: 232,
            name_ru: 'Ювелирный магазин',
            name_ukr: 'Ювелирный магазин',
            name_en: 'Ювелирный магазин',
            icon: ''
        }, {
            id: 233,
            name_ru: 'Образование',
            name_ukr: 'Образование',
            name_en: 'Образование',
            icon: ''
        }, {
            id: 234,
            name_ru: 'Автошкола',
            name_ukr: 'Автошкола',
            name_en: 'Автошкола',
            icon: ''
        }, {
            id: 235,
            name_ru: 'Детский сад',
            name_ukr: 'Детский сад',
            name_en: 'Детский сад',
            icon: ''
        }, {
            id: 236,
            name_ru: 'Институт',
            name_ukr: 'Институт',
            name_en: 'Институт',
            icon: ''
        }, {
            id: 237,
            name_ru: 'Колледж',
            name_ukr: 'Колледж',
            name_en: 'Колледж',
            icon: ''
        }, {
            id: 238,
            name_ru: 'Школа',
            name_ukr: 'Школа',
            name_en: 'Школа',
            icon: ''
        }, {
            id: 239,
            name_ru: 'Образовательное учреждение (администрация)',
            name_ukr: 'Образовательное учреждение (администрация)',
            name_en: 'Образовательное учреждение (администрация)',
            icon: ''
        }, {
            id: 240,
            name_ru: 'Организации ',
            name_ukr: 'Организации ',
            name_en: 'Организации ',
            icon: ''
        }, {
            id: 241,
            name_ru: 'Агентство недвижимости',
            name_ukr: 'Агентство недвижимости',
            name_en: 'Агентство недвижимости',
            icon: ''
        }, {
            id: 242,
            name_ru: 'Общественная организация',
            name_ukr: 'Общественная организация',
            name_en: 'Общественная организация',
            icon: ''
        }, {
            id: 243,
            name_ru: 'Страховая компания',
            name_ukr: 'Страховая компания',
            name_en: 'Страховая компания',
            icon: ''
        }, {
            id: 244,
            name_ru: 'Телекоммуникационная компания',
            name_ukr: 'Телекоммуникационная компания',
            name_en: 'Телекоммуникационная компания',
            icon: ''
        }, {
            id: 245,
            name_ru: 'Юридические услуги',
            name_ukr: 'Юридические услуги',
            name_en: 'Юридические услуги',
            icon: ''
        }, {
            id: 246,
            name_ru: 'Нотариус',
            name_ukr: 'Нотариус',
            name_en: 'Нотариус',
            icon: ''
        }, {
            id: 247,
            name_ru: 'Спорт и развлечения',
            name_ukr: 'Спорт и развлечения',
            name_en: 'Спорт и развлечения',
            icon: ''
        }, {
            id: 248,
            name_ru: 'Аквапарк',
            name_ukr: 'Аквапарк',
            name_en: 'Аквапарк',
            icon: ''
        }, {
            id: 249,
            name_ru: 'Бассейн',
            name_ukr: 'Бассейн',
            name_en: 'Бассейн',
            icon: ''
        }, {
            id: 250,
            name_ru: 'Беговая дорожка',
            name_ukr: 'Беговая дорожка',
            name_en: 'Беговая дорожка',
            icon: ''
        }, {
            id: 251,
            name_ru: 'Детская площадка',
            name_ukr: 'Детская площадка',
            name_en: 'Детская площадка',
            icon: ''
        }, {
            id: 252,
            name_ru: 'Каток',
            name_ukr: 'Каток',
            name_en: 'Каток',
            icon: ''
        }, {
            id: 253,
            name_ru: 'Мини-гольф',
            name_ukr: 'Мини-гольф',
            name_en: 'Мини-гольф',
            icon: ''
        }, {
            id: 254,
            name_ru: 'Ночной клуб',
            name_ukr: 'Ночной клуб',
            name_en: 'Ночной клуб',
            icon: ''
        }, {
            id: 255,
            name_ru: 'Парк',
            name_ukr: 'Парк',
            name_en: 'Парк',
            icon: ''
        }, {
            id: 256,
            name_ru: 'Парк развлечений',
            name_ukr: 'Парк развлечений',
            name_en: 'Парк развлечений',
            icon: ''
        }, {
            id: 257,
            name_ru: 'Пляжный комплекс',
            name_ukr: 'Пляжный комплекс',
            name_en: 'Пляжный комплекс',
            icon: ''
        }, {
            id: 258,
            name_ru: 'Поле для гольфа',
            name_ukr: 'Поле для гольфа',
            name_en: 'Поле для гольфа',
            icon: ''
        }, {
            id: 259,
            name_ru: 'Спортивная площадка, поле, корт',
            name_ukr: 'Спортивная площадка, поле, корт',
            name_en: 'Спортивная площадка, поле, корт',
            icon: ''
        }, {
            id: 260,
            name_ru: 'Спортивный клуб',
            name_ukr: 'Спортивный клуб',
            name_en: 'Спортивный клуб',
            icon: ''
        }, {
            id: 261,
            name_ru: 'Спортивный центр',
            name_ukr: 'Спортивный центр',
            name_en: 'Спортивный центр',
            icon: ''
        }, {
            id: 262,
            name_ru: 'Стадион',
            name_ukr: 'Стадион',
            name_en: 'Стадион',
            icon: ''
        }, {
            id: 263,
            name_ru: 'Пляж',
            name_ukr: 'Пляж',
            name_en: 'Пляж',
            icon: ''
        }, {
            id: 264,
            name_ru: 'Транспорт',
            name_ukr: 'Транспорт',
            name_en: 'Транспорт',
            icon: ''
        }, {
            id: 265,
            name_ru: 'Аэропорт/аэродром',
            name_ukr: 'Аэропорт/аэродром',
            name_en: 'Аэропорт/аэродром',
            icon: ''
        }, {
            id: 266,
            name_ru: 'Автомойка',
            name_ukr: 'Автомойка',
            name_en: 'Автомойка',
            icon: ''
        }, {
            id: 267,
            name_ru: 'Автосервис',
            name_ukr: 'Автосервис',
            name_en: 'Автосервис',
            icon: ''
        }, {
            id: 268,
            name_ru: 'Шиномонтаж',
            name_ukr: 'Шиномонтаж',
            name_en: 'Шиномонтаж',
            icon: ''
        }, {
            id: 269,
            name_ru: 'Заправка',
            name_ukr: 'Заправка',
            name_en: 'Заправка',
            icon: ''
        }, {
            id: 270,
            name_ru: 'Автовокзал',
            name_ukr: 'Автовокзал',
            name_en: 'Автовокзал',
            icon: ''
        }, {
            id: 271,
            name_ru: 'Вход в метро',
            name_ukr: 'Вход в метро',
            name_en: 'Вход в метро',
            icon: ''
        }, {
            id: 272,
            name_ru: 'Ж/д платформа',
            name_ukr: 'Ж/д платформа',
            name_en: 'Ж/д платформа',
            icon: ''
        }, {
            id: 273,
            name_ru: 'Ж/д станция',
            name_ukr: 'Ж/д станция',
            name_en: 'Ж/д станция',
            icon: ''
        }, {
            id: 274,
            name_ru: 'Остановка автобуса',
            name_ukr: 'Остановка автобуса',
            name_en: 'Остановка автобуса',
            icon: ''
        }, {
            id: 275,
            name_ru: 'Остановка трамвая',
            name_ukr: 'Остановка трамвая',
            name_en: 'Остановка трамвая',
            icon: ''
        }, {
            id: 276,
            name_ru: 'Арт-объект',
            name_ukr: 'Арт-объект',
            name_en: 'Арт-объект',
            icon: ''
        }, {
            id: 277,
            name_ru: 'Достопримечательность',
            name_ukr: 'Достопримечательность',
            name_en: 'Достопримечательность',
            icon: ''
        }, {
            id: 278,
            name_ru: 'Замок',
            name_ukr: 'Замок',
            name_en: 'Замок',
            icon: ''
        }, {
            id: 279,
            name_ru: 'Исторические руины',
            name_ukr: 'Исторические руины',
            name_en: 'Исторические руины',
            icon: ''
        }, {
            id: 280,
            name_ru: 'Мемориал, памятник',
            name_ukr: 'Мемориал, памятник',
            name_en: 'Мемориал, памятник',
            icon: ''
        }, {
            id: 281,
            name_ru: 'Монумент (памятник)',
            name_ukr: 'Монумент (памятник)',
            name_en: 'Монумент (памятник)',
            icon: ''
        }, {
            id: 282,
            name_ru: 'Музей',
            name_ukr: 'Музей',
            name_en: 'Музей',
            icon: ''
        }, {
            id: 283,
            name_ru: 'Посольство',
            name_ukr: 'Посольство',
            name_en: 'Посольство',
            icon: ''
        }, {
            id: 284,
            name_ru: 'Гостевой дом',
            name_ukr: 'Гостевой дом',
            name_en: 'Гостевой дом',
            icon: ''
        }, {
            id: 285,
            name_ru: 'Гостиница',
            name_ukr: 'Гостиница',
            name_en: 'Гостиница',
            icon: ''
        }, {
            id: 286,
            name_ru: 'Мотель',
            name_ukr: 'Мотель',
            name_en: 'Мотель',
            icon: ''
        }, {
            id: 287,
            name_ru: 'Хостел',
            name_ukr: 'Хостел',
            name_en: 'Хостел',
            icon: ''
        }, {
            id: 288,
            name_ru: 'Турагентство',
            name_ukr: 'Турагентство',
            name_en: 'Турагентство',
            icon: ''
        }, {
            id: 289,
            name_ru: 'Услуги ',
            name_ukr: 'Услуги ',
            name_en: 'Услуги ',
            icon: ''
        }, {
            id: 290,
            name_ru: 'Ателье',
            name_ukr: 'Ателье',
            name_en: 'Ателье',
            icon: ''
        }, {
            id: 291,
            name_ru: 'Интернет-кафе',
            name_ukr: 'Интернет-кафе',
            name_en: 'Интернет-кафе',
            icon: ''
        }, {
            id: 292,
            name_ru: 'Маникюрный салон',
            name_ukr: 'Маникюрный салон',
            name_en: 'Маникюрный салон',
            icon: ''
        }, {
            id: 293,
            name_ru: 'Массажный салон',
            name_ukr: 'Массажный салон',
            name_en: 'Массажный салон',
            icon: ''
        }, {
            id: 294,
            name_ru: 'Парикмахерская',
            name_ukr: 'Парикмахерская',
            name_en: 'Парикмахерская',
            icon: ''
        }, {
            id: 295,
            name_ru: 'Почта',
            name_ukr: 'Почта',
            name_en: 'Почта',
            icon: ''
        }, {
            id: 296,
            name_ru: 'Салон красоты',
            name_ukr: 'Салон красоты',
            name_en: 'Салон красоты',
            icon: ''
        }, {
            id: 297,
            name_ru: 'Химчистка',
            name_ukr: 'Химчистка',
            name_en: 'Химчистка',
            icon: ''
        }, {
            id: 298,
            name_ru: 'Финансы ',
            name_ukr: 'Финансы ',
            name_en: 'Финансы ',
            icon: ''
        }, {
            id: 299,
            name_ru: 'Банк',
            name_ukr: 'Банк',
            name_en: 'Банк',
            icon: ''
        }, {
            id: 300,
            name_ru: 'Ломбард',
            name_ukr: 'Ломбард',
            name_en: 'Ломбард',
            icon: ''
        }, {
            id: 301,
            name_ru: 'Обмен валют',
            name_ukr: 'Обмен валют',
            name_en: 'Обмен валют'
        }
    ],

    autoLoad: true
});
