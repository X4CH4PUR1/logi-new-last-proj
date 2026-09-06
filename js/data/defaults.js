window.Logi = window.Logi || {};
Logi.data = Logi.data || {};
Logi.data.defaults = (function () {


  const DEFAULT_CONTENT = {
    version: 1,

    texts: {
      heroBadge: {
        en: 'LOGIMOTORS LTD — RUSTAVI, GEORGIA',
        ka: 'შპს ლოგიმოტორსი — რუსთავი, საქართველო',
        ru: 'ООО «ЛОГИМОТОРС» — РУСТАВИ, ГРУЗИЯ',
      },
      heroTitle: {
        en: 'Machines that move your business',
        ka: 'ტექნიკა, რომელიც თქვენს ბიზნესს ამოძრავებს',
        ru: 'Техника, которая движет ваш бизнес',
      },
      heroSub: {
        en: 'Sale, rent, service and spare parts for every type of forklift — gasoline, diesel, electric. Any brand. Working in Georgia since 1999.',
        ka: 'ნებისმიერი ტიპის ავტოსატვირთველას გაყიდვა, გაქირავება, სერვისი და სათადარიგო ნაწილები — ბენზინი, დიზელი, ელექტრო. ნებისმიერი ბრენდი. ვმუშაობთ საქართველოში 1999 წლიდან.',
        ru: 'Продажа, аренда, сервис и запчасти для любых погрузчиков — бензин, дизель, электро. Любой бренд. Работаем в Грузии с 1999 года.',
      },
      about1: {
        en: 'The core of our business is the service of warehouse machinery, the sale of new and used warehouse equipment, and the full volume of spare parts required for regenerative repair. We work with warehouse machinery of any manufacturer — any brand.',
        ka: 'ჩვენი საქმიანობის ძირითადი მიმართულებაა სასაწყობე ტექნიკის სერვისი, ახალი და მეორადი ტექნიკის გაყიდვა და აღდგენითი შეკეთებისთვის საჭირო სათადარიგო ნაწილების სრული ასორტიმენტი. ვმუშაობთ ნებისმიერი მწარმოებლის ტექნიკაზე — ნებისმიერი ბრენდი.',
        ru: 'Основное направление деятельности — сервис складской техники, продажа новой и б/у складской техники, а также весь объём запчастей, необходимых для восстановительного ремонта. Мы работаем с техникой любых производителей — любой бренд.',
      },
      about2: {
        en: 'The concept of LOGIMOTORS LTD is to create the best conditions for the customer when purchasing the machinery or spare parts they need — with minimal delivery timeframes, guaranteed quality and a price that matches their choice.',
        ka: 'შპს „ლოგიმოტორსის“ კონცეფციაა შეუქმნას მომხმარებელს საუკეთესო პირობები საჭირო ტექნიკის ან ნაწილების შესაძენად — მიწოდების მინიმალური ვადებით, ხარისხის გარანტიით და მისთვის შესაფერისი ფასით.',
        ru: 'Концепция компании LOGIMOTORS LTD — создать для клиента лучшие условия при покупке необходимой техники или запчастей: минимальные сроки поставки, гарантия качества и цена, соответствующая его выбору.',
      },
      about3: {
        en: 'Our policy is focused on the customer and their priorities. Our employees are always ready for a meaningful dialogue to agree on mutually acceptable conditions for machinery service and parts delivery. We are always open to cooperation — get to know us, and you will appreciate the advantages of working with LOGIMOTORS LTD.',
        ka: 'კომპანიის პოლიტიკა ორიენტირებულია მომხმარებელზე და მის პრიორიტეტებზე. ჩვენი თანამშრომლები ყოველთვის მზად არიან შინაარსიანი დიალოგისთვის, რათა შეთანხმდნენ ურთიერთმისაღებ პირობებზე ტექნიკის მომსახურებასა და ნაწილების მიწოდებაზე. ჩვენ ყოველთვის ღია ვართ თანამშრომლობისთვის — გაგვიცანით და დარწმუნდებით „ლოგიმოტორსთან“ მუშაობის უპირატესობებში.',
        ru: 'Политика компании ориентирована на клиента и его приоритеты. Наши сотрудники всегда готовы к конструктивному диалогу для согласования взаимоприемлемых условий обслуживания техники и поставки запчастей. Мы всегда открыты к сотрудничеству — познакомившись с нами, вы оцените все преимущества работы с LOGIMOTORS LTD.',
      },
      serviceIntro: {
        en: 'Regenerative repair, scheduled maintenance and diagnostics for forklifts of any brand — gasoline, diesel and electric. Original and analog spare parts with minimal delivery timeframes.',
        ka: 'აღდგენითი შეკეთება, გეგმიური მომსახურება და დიაგნოსტიკა ნებისმიერი ბრენდის სატვირთველისთვის — ბენზინი, დიზელი, ელექტრო. ორიგინალი და ანალოგი ნაწილები მიწოდების მინიმალური ვადებით.',
        ru: 'Восстановительный ремонт, плановое обслуживание и диагностика погрузчиков любых брендов — бензин, дизель, электро. Оригинальные и аналоговые запчасти с минимальными сроками поставки.',
      },
      metaDescription: {
        en: 'LOGIMOTORS LTD, Rustavi — sale, rent, service and spare parts for forklifts of any brand. Gasoline, diesel and electric. Working in Georgia since 1999.',
        ka: 'შპს ლოგიმოტორსი, რუსთავი — ნებისმიერი ბრენდის ავტოსატვირთველას გაყიდვა, გაქირავება, სერვისი და სათადარიგო ნაწილები. ვმუშაობთ 1999 წლიდან.',
        ru: 'ООО «ЛОГИМОТОРС», Рустави — продажа, аренда, сервис и запчасти для погрузчиков любых брендов. Бензин, дизель, электро. Работаем с 1999 года.',
      },
    },

    brand: {
      short: 'LOGI',
      full: 'LOGIMOTORS',
    },

    heroPills: [
      { en: '1.5 – 5.0 t', ka: '1.5 – 5.0 ტ', ru: '1,5 – 5,0 т' },
      { en: 'ELECTRIC', ka: 'ელექტრო', ru: 'ЭЛЕКТРО' },
      { en: 'DIESEL · GAS', ka: 'დიზელი · გაზი', ru: 'ДИЗЕЛЬ · ГАЗ' },
      { en: '24/7', ka: '24/7', ru: '24/7' },
    ],

    brands:
      'TOYOTA · LINDE · HYSTER · KOMATSU · JUNGHEINRICH · STILL · CAT · NISSAN · MITSUBISHI · CROWN · TCM · CLARK · HELI · DOOSAN · ANY BRAND · ',

    services: [
      {
        id: 'sale',
        num: '01',
        title: { en: 'Sale', ka: 'გაყიდვა', ru: 'Продажа' },
        desc: {
          en: 'New and used forklifts of any brand — gasoline, diesel and electric — selected for your tasks and budget.',
          ka: 'ახალი და მეორადი ავტოსატვირთველები ნებისმიერი ბრენდის — ბენზინი, დიზელი, ელექტრო — თქვენი ამოცანებისა და ბიუჯეტისთვის.',
          ru: 'Новые и б/у погрузчики любых брендов — бензин, дизель, электро — под ваши задачи и бюджет.',
        },
      },
      {
        id: 'rent',
        num: '02',
        title: { en: 'Rent', ka: 'გაქირავება', ru: 'Аренда' },
        desc: {
          en: 'Short- and long-term rental with maintenance included. A machine on your site within days.',
          ka: 'მოკლე და გრძელვადიანი გაქირავება მომსახურებით. ტექნიკა თქვენს ობიექტზე რამდენიმე დღეში.',
          ru: 'Краткосрочная и долгосрочная аренда с обслуживанием. Техника на вашем объекте за считанные дни.',
        },
      },
      {
        id: 'service',
        num: '03',
        title: {
          en: 'Service & repair',
          ka: 'სერვისი და შეკეთება',
          ru: 'Сервис и ремонт',
        },
        desc: {
          en: 'Diagnostics, scheduled maintenance and full regenerative repair for warehouse machinery of any manufacturer.',
          ka: 'დიაგნოსტიკა, გეგმიური მომსახურება და სრული აღდგენითი შეკეთება ნებისმიერი მწარმოებლის სასაწყობე ტექნიკისთვის.',
          ru: 'Диагностика, плановое обслуживание и полный восстановительный ремонт складской техники любого производителя.',
        },
      },
      {
        id: 'parts',
        num: '04',
        title: {
          en: 'Spare parts',
          ka: 'სათადარიგო ნაწილები',
          ru: 'Запчасти',
        },
        desc: {
          en: 'The full volume of spare parts for regenerative repair — original and analog — with minimal delivery timeframes.',
          ka: 'აღდგენითი შეკეთებისთვის საჭირო ნაწილების სრული ასორტიმენტი — ორიგინალი და ანალოგი — მიწოდების მინიმალური ვადებით.',
          ru: 'Весь объём запчастей для восстановительного ремонта — оригинал и аналог — с минимальными сроками поставки.',
        },
      },
      {
        id: 'wheels',
        num: '05',
        title: {
          en: 'Wheels & tyres',
          ka: 'ბორბლები და საბურავები',
          ru: 'Колёса и шины',
        },
        desc: {
          en: 'Polyurethane, solid and pneumatic wheels for every type of forklift and pallet truck.',
          ka: 'პოლიურეთანის, მთლიანი და პნევმატური ბორბლები ყველა ტიპის სატვირთველისა და პალეტის ურიკისთვის.',
          ru: 'Полиуретановые, цельнолитые и пневматические колёса для всех типов погрузчиков и тележек.',
        },
      },
    ],

    foundedYear: 1999,

    stats: [
      { id: 'years', sinceYear: 1999, suffix: '+', labelKey: 'statYears' },
      { id: 'machines', value: 3500, suffix: '+', labelKey: 'statMachines' },
      { id: 'parts', value: 80000, suffix: '+', labelKey: 'statParts' },
      { id: 'support', value: 24, suffix: '/7', labelKey: 'statSupport' },
    ],

    categories: [
      { key: 'parts', label: { en: 'Parts', ka: 'ნაწილები', ru: 'Запчасти' } },
      { key: 'wheels', label: { en: 'Wheels', ka: 'თვლები', ru: 'Колёса' } },
    ],
    fuels: [
      { key: 'electric', label: { en: 'Electric', ka: 'ელექტრო', ru: 'Электро' } },
      { key: 'diesel', label: { en: 'Diesel', ka: 'დიზელი', ru: 'Дизель' } },
      { key: 'gasoline', label: { en: 'Gasoline / LPG', ka: 'ბენზინი / გაზი', ru: 'Бензин / Газ' } },
    ],

    products: [
      {
        id: 'p1',
        cat: 'forklift',
        mode: 'sale',
        fuel: 'electric',
        cond: 'used',
        brand: 'Toyota',
        name: {
          en: 'Toyota 8FBE20 electric forklift',
          ka: 'Toyota 8FBE20 ელექტრო სატვირთველა',
          ru: 'Электропогрузчик Toyota 8FBE20',
        },
        price: 14900,
        unit: '',
        capacity: '2.0 t',
        lift: '4.5 m',
        year: '2019',
        images: [],
        desc: { ka: '', en: '', ru: '' },
      },
      {
        id: 'p2',
        cat: 'forklift',
        mode: 'sale',
        fuel: 'gasoline',
        cond: 'used',
        brand: 'Linde',
        name: {
          en: 'Linde H25T LPG forklift',
          ka: 'Linde H25T გაზის სატვირთველა',
          ru: 'Газовый погрузчик Linde H25T',
        },
        price: 18500,
        unit: '',
        capacity: '2.5 t',
        lift: '3.7 m',
        year: '2018',
        images: [],
        desc: { ka: '', en: '', ru: '' },
      },
      {
        id: 'p3',
        cat: 'forklift',
        mode: 'sale',
        fuel: 'diesel',
        cond: 'used',
        brand: 'Hyster',
        name: {
          en: 'Hyster H3.0FT diesel forklift',
          ka: 'Hyster H3.0FT დიზელის სატვირთველა',
          ru: 'Дизельный погрузчик Hyster H3.0FT',
        },
        price: 16800,
        unit: '',
        capacity: '3.0 t',
        lift: '4.0 m',
        year: '2017',
        images: [],
        desc: { ka: '', en: '', ru: '' },
      },
      {
        id: 'p4',
        cat: 'forklift',
        mode: 'sale',
        fuel: 'electric',
        cond: 'new',
        brand: 'Jungheinrich',
        name: {
          en: 'Jungheinrich EFG 216 — new',
          ka: 'Jungheinrich EFG 216 — ახალი',
          ru: 'Jungheinrich EFG 216 — новый',
        },
        price: 32900,
        unit: '',
        capacity: '1.6 t',
        lift: '5.0 m',
        year: '2026',
        images: [],
        desc: { ka: '', en: '', ru: '' },
      },
      {
        id: 'p5',
        cat: 'forklift',
        mode: 'rent',
        fuel: 'diesel',
        cond: 'used',
        brand: 'Komatsu',
        name: {
          en: 'Komatsu FD30T — rental',
          ka: 'Komatsu FD30T — გაქირავება',
          ru: 'Komatsu FD30T — аренда',
        },
        price: 780,
        unit: 'mo',
        capacity: '3.0 t',
        lift: '4.0 m',
        year: '2020',
        images: [],
        desc: { ka: '', en: '', ru: '' },
      },
      {
        id: 'p6',
        cat: 'forklift',
        mode: 'rent',
        fuel: 'electric',
        cond: 'used',
        brand: 'Still',
        name: {
          en: 'Still RX20 — rental',
          ka: 'Still RX20 — გაქირავება',
          ru: 'Still RX20 — аренда',
        },
        price: 650,
        unit: 'mo',
        capacity: '2.0 t',
        lift: '4.2 m',
        year: '2021',
        images: [],
        desc: { ka: '', en: '', ru: '' },
      },
      {
        id: 'p7',
        cat: 'wheels',
        mode: 'sale',
        fuel: '',
        cond: 'new',
        brand: 'Universal',
        name: {
          en: 'Polyurethane wheel set (4 pcs)',
          ka: 'პოლიურეთანის ბორბლების კომპლექტი (4 ც)',
          ru: 'Комплект полиуретановых колёс (4 шт)',
        },
        price: 240,
        unit: '',
        capacity: '',
        lift: '',
        year: '',
        images: [],
        desc: { ka: '', en: '', ru: '' },
      },
      {
        id: 'p8',
        cat: 'parts',
        mode: 'sale',
        fuel: '',
        cond: 'new',
        brand: 'Universal',
        name: {
          en: 'Mast roller & chain kit',
          ka: 'ანძის გორგოლაჭებისა და ჯაჭვის კომპლექტი',
          ru: 'Комплект роликов мачты и цепи',
        },
        price: 390,
        unit: '',
        capacity: '',
        lift: '',
        year: '',
        images: [],
        desc: { ka: '', en: '', ru: '' },
      },
    ],

    news: [
      {
        id: 'n1',
        date: '2026-06-12',
        img: '',
        title: {
          en: 'New arrivals: electric Jungheinrich EFG series in stock',
          ka: 'ახალი ჩამოსვლა: ელექტრო Jungheinrich EFG სერია მარაგშია',
          ru: 'Новое поступление: электрические Jungheinrich серии EFG на складе',
        },
        body: {
          en: 'A fresh batch of Jungheinrich EFG 216 electric forklifts has arrived at our Rustavi warehouse. Lithium-ready, 1.6 t capacity, available for immediate delivery.',
          ka: 'ჩვენს რუსთავის საწყობში ჩამოვიდა Jungheinrich EFG 216 ელექტრო სატვირთველების ახალი პარტია. 1.6 ტ ტვირთამწეობა, მზადაა დაუყოვნებელი მიწოდებისთვის.',
          ru: 'На наш склад в Рустави прибыла новая партия электропогрузчиков Jungheinrich EFG 216. Грузоподъёмность 1,6 т, доступны к немедленной поставке.',
        },
      },
      {
        id: 'n2',
        date: '2026-04-03',
        img: '',
        title: {
          en: 'Rental fleet expanded — 12 new machines',
          ka: 'გაქირავების პარკი გაფართოვდა — 12 ახალი ერთეული',
          ru: 'Арендный парк расширен — 12 новых машин',
        },
        body: {
          en: 'We added 12 machines to our rental fleet: diesel Komatsu and electric Still units from 1.5 to 3.5 tons. Short- and long-term contracts with service included.',
          ka: 'გაქირავების პარკს დაემატა 12 ერთეული: დიზელის Komatsu და ელექტრო Still 1.5-დან 3.5 ტონამდე. მოკლე და გრძელვადიანი კონტრაქტები მომსახურებით.',
          ru: 'Мы добавили в арендный парк 12 машин: дизельные Komatsu и электрические Still от 1,5 до 3,5 тонн. Краткосрочные и долгосрочные контракты с обслуживанием.',
        },
      },
      {
        id: 'n3',
        date: '2026-02-18',
        img: '',
        title: {
          en: '24/7 service support now available in Rustavi and Tbilisi',
          ka: '24/7 სერვის-მხარდაჭერა უკვე ხელმისაწვდომია რუსთავსა და თბილისში',
          ru: 'Сервисная поддержка 24/7 теперь доступна в Рустави и Тбилиси',
        },
        body: {
          en: 'Our mobile service teams now respond around the clock. One call — and a technician with parts is on the way to your warehouse.',
          ka: 'ჩვენი მობილური სერვის-ჯგუფები ახლა მთელი საათის განმავლობაში მუშაობენ. ერთი ზარი — და ტექნიკოსი ნაწილებით უკვე გზაშია თქვენი საწყობისკენ.',
          ru: 'Наши мобильные сервисные бригады теперь работают круглосуточно. Один звонок — и техник с запчастями уже едет на ваш склад.',
        },
      },
    ],

    gallery: [
      {
        id: 'g1',
        img: '',
        caption: {
          en: 'Warehouse fleet',
          ka: 'საწყობის ტექნიკა',
          ru: 'Складской парк',
        },
      },
      {
        id: 'g2',
        img: '',
        caption: { en: 'Service bay', ka: 'სასერვისო ცენტრი', ru: 'Сервисная зона' },
      },
      {
        id: 'g3',
        img: '',
        caption: {
          en: 'Parts warehouse',
          ka: 'ნაწილების საწყობი',
          ru: 'Склад запчастей',
        },
      },
      {
        id: 'g4',
        img: '',
        caption: { en: 'Delivery day', ka: 'მიწოდების დღე', ru: 'День поставки' },
      },
      {
        id: 'g5',
        img: '',
        caption: {
          en: 'Team at work',
          ka: 'გუნდი მუშაობისას',
          ru: 'Команда за работой',
        },
      },
      {
        id: 'g6',
        img: '',
        caption: {
          en: 'Rental yard',
          ka: 'გაქირავების ეზო',
          ru: 'Арендная площадка',
        },
      },
    ],

    social: [
      {
        id: 'facebook',
        type: 'facebook',
        label: 'Facebook',
        url: 'https://www.facebook.com/profile.php?id=61592609919589',
      },
      {
        id: 'whatsapp-1',
        type: 'whatsapp',
        label: 'WhatsApp (599) 585 148',
        number: '+995599585148',
      },
      {
        id: 'whatsapp-2',
        type: 'whatsapp',
        label: 'WhatsApp (555) 502 502',
        number: '+995555502502',
      },
    ],

    contacts: {
      address: {
        en: '21 Gagarin St, Rustavi, Georgia',
        ka: 'რუსთავი, გაგარინის ქუჩა 21',
        ru: 'г. Рустави, ул. Гагарина 21',
      },
      legal: {
        en: 'LOGIMOTORS LTD',
        ka: 'შპს ლოგიმოტორსი',
        ru: 'ООО «ЛОГИМОТОРС»',
      },
      hours: {
        en: 'Mon–Fri 9:00–18:00 · Sat 10:00–15:00',
        ka: 'ორშ–პარ 9:00–18:00 · შაბ 10:00–15:00',
        ru: 'Пн–Пт 9:00–18:00 · Сб 10:00–15:00',
      },
      phone1: '(599) 585 148',
      phone2: '(555) 502 502',
      phone1Dial: '+995599585148',
      phone2Dial: '+995555502502',
      email: 'logi@logimotors.com',
      web: 'www.logimotors.com',
      idCode: '416289171',
      mapLat: 41.5425058,
      mapLon: 45.0236142,
      mapZoom: 17,
      mapPinConfirmed: true,
      mapEmbed: '',
    },

    strings: { ka: {}, en: {}, ru: {} },

    settings: {
      defaultLang: 'en',
      defaultTheme: 'night',
      formEndpoint: '',
      pinHash: null,
      hiddenPages: [],
      hiddenLangs: [],
    },
  };

  return { DEFAULT_CONTENT };
})();
