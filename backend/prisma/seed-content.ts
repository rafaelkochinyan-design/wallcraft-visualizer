/**
 * seed-content.ts — демо контент для полного сайта WallCraft
 *
 * Запуск: cd backend && npx ts-node prisma/seed-content.ts
 *
 * Заполняет: HeroSlides, Projects, Gallery, Blog, Designers,
 *            TeamMembers, Dealers, Partners, PageContent
 *
 * Изображения: Unsplash (бесплатные для демо).
 * Полностью идемпотентен — удаляет старые демо-данные и пересоздаёт.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Unsplash image helpers ──────────────────────────────────────────────────
const U = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`
const UQ = (q: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${q}?w=${w}&h=${h}&fit=crop&q=80`

// ── Image library (interior design / architecture) ──────────────────────────
const IMG = {
  // Hero banners — wide, dramatic interiors
  hero1: U('1616486338812-3dadae4b4ace', 1600, 900),  // modern living room
  hero2: U('1618221195710-dd6b41faaea6', 1600, 900),  // minimal white interior
  hero3: U('1600210492486-724fe5c67fb0', 1600, 900),  // luxury living room

  // Projects — full interiors
  proj1: U('1583847268964-b28dc8f51f92', 1200, 800),  // living room couch
  proj2: U('1497366216548-37526070297c', 1200, 800),  // office space
  proj3: U('1566195992011-5f6b21e539aa', 1200, 800),  // hotel room
  proj4: U('1560448204-e02f11c3d0e2', 1200, 800),     // bedroom minimal

  // Gallery — various spaces
  gal1: U('1631679706909-1844bbd07221', 900, 700),    // designer wall
  gal2: U('1567016432779-094069958ea5', 900, 700),    // bedroom wall
  gal3: U('1556905055-8f358a7a47b2', 900, 700),       // modern living
  gal4: U('1493809842364-78817add7ffb', 900, 700),    // warm interior
  gal5: U('1618220179428-22790b461013', 900, 700),    // minimal space
  gal6: U('1615873968403-89583b7cb40b', 900, 700),    // dark room
  gal7: U('1600607687939-ce8a6c25118c', 900, 700),    // light interior
  gal8: U('1507089947368-19c1da9775ae', 900, 700),    // office interior

  // Blog covers
  blog1: U('1616486338812-3dadae4b4ace', 800, 500),
  blog2: U('1618221195710-dd6b41faaea6', 800, 500),
  blog3: U('1600210492486-724fe5c67fb0', 800, 500),

  // Portraits (designers / team)
  person1: U('1544005313-94ddf0286df2', 400, 400),    // woman portrait
  person2: U('1507003211169-0a1dd7228f2d', 400, 400), // man portrait
  person3: U('1494790108377-be9c29b29330', 400, 400), // woman portrait
  person4: U('1500648767791-00dcc994a43e', 400, 400), // man portrait
  person5: U('1438761681033-6461ffad8d80', 400, 400), // woman portrait

  // Partner logos (solid color placeholder — use real logos in prod)
  logo1: 'https://placehold.co/240x80/f5f0eb/8b7355?text=Plum+Armenia&font=raleway',
  logo2: 'https://placehold.co/240x80/f5f0eb/8b7355?text=Bosch+AM&font=raleway',
  logo3: 'https://placehold.co/240x80/f5f0eb/8b7355?text=Delta+Group&font=raleway',
  logo4: 'https://placehold.co/240x80/f5f0eb/8b7355?text=ArchiStudio&font=raleway',
  logo5: 'https://placehold.co/240x80/f5f0eb/8b7355?text=HomeStyle&font=raleway',
}

async function main() {
  console.log('Seeding demo content...\n')

  const tenant = await prisma.tenant.findUnique({ where: { slug: 'wallcraft' } })
  if (!tenant) {
    console.error('Tenant "wallcraft" not found. Run seed.ts first!')
    process.exit(1)
  }
  const tid = tenant.id

  // ── Clear old demo content ──────────────────────────────────────────────
  console.log('Clearing old content...')
  await prisma.heroSlide.deleteMany({ where: { tenant_id: tid } })
  await prisma.galleryItem.deleteMany({ where: { tenant_id: tid } })
  await prisma.project.deleteMany({ where: { tenant_id: tid } })
  await prisma.blogPost.deleteMany({ where: { tenant_id: tid } })
  await prisma.designer.deleteMany({ where: { tenant_id: tid } })
  await prisma.teamMember.deleteMany({ where: { tenant_id: tid } })
  await prisma.dealer.deleteMany({ where: { tenant_id: tid } })
  await prisma.partner.deleteMany({ where: { tenant_id: tid } })
  await prisma.pageContent.deleteMany({ where: { tenant_id: tid } })

  // ── 1. Hero Slides ──────────────────────────────────────────────────────
  console.log('Creating hero slides...')
  await prisma.heroSlide.createMany({ data: [
    {
      tenant_id: tid, image_url: IMG.hero1, sort_order: 0, active: true,
      headline:    { ru: 'Создайте интерьер своей мечты',  en: 'Design Your Dream Interior',        am: 'Ստեղծեք Ձեր երազած ինտերիերը' },
      subheadline: { ru: '3D панели премиум-класса для жилых и коммерческих пространств', en: 'Premium 3D wall panels for residential and commercial spaces', am: 'Պրեմիում 3D պատի պանելներ բնակելի և առևտրային տարածքների համար' },
      cta_label:   { ru: 'Смотреть коллекцию',  en: 'View Collection',  am: 'Դիտել հավաքածուն' },
      cta_url: '/products',
    },
    {
      tenant_id: tid, image_url: IMG.hero2, sort_order: 1, active: true,
      headline:    { ru: 'Попробуйте в 3D прямо сейчас', en: 'Try It in 3D Right Now',           am: '3D-ում փորձեք հենց հիմա' },
      subheadline: { ru: 'Наш уникальный визуализатор поможет подобрать панели для вашей стены', en: 'Our unique visualizer helps you pick panels for your wall', am: 'Մեր եզակի վիզուալայինացուցիչը կօգնի ընտրել պանելներ ձեր պատի համար' },
      cta_label:   { ru: 'Открыть визуализатор', en: 'Open Visualizer', am: 'Բացել վիզուալայինացուցիչ' },
      cta_url: '/visualizer',
    },
    {
      tenant_id: tid, image_url: IMG.hero3, sort_order: 2, active: true,
      headline:    { ru: 'Коллекция 2024',        en: 'Collection 2024',          am: '2024 հավաքածու' },
      subheadline: { ru: '40+ моделей, индивидуальный подбор, установка под ключ', en: '40+ models, custom selection, turnkey installation', am: '40+ մոդел, անհատական ​​ընտրություն, բանալի-ձեռք տեղադրում' },
      cta_label:   { ru: 'Узнать подробнее',      en: 'Learn More',               am: 'Իմանալ ավելին' },
      cta_url: '/about',
    },
  ]})
  console.log('  ✓ 3 hero slides')

  // ── 2. Projects ─────────────────────────────────────────────────────────
  console.log('Creating projects...')
  await prisma.project.createMany({ data: [
    {
      tenant_id: tid, slug: 'gostinaya-yerevan-2024', sort_order: 0, active: true,
      title:       'Гостиная в Ереване',
      cover_url:   IMG.proj1,
      images:      [IMG.proj1, IMG.gal1, IMG.gal3],
      space_type:  'living_room',
      description: 'Современная гостиная с панелями Консул А и Drop. Площадь стены 12 м². Тёплая подсветка подчёркивает рельеф панелей.',
    },
    {
      tenant_id: tid, slug: 'ofis-it-kompanii', sort_order: 1, active: true,
      title:       'Офис IT-компании',
      cover_url:   IMG.proj2,
      images:      [IMG.proj2, IMG.gal8, IMG.gal5],
      space_type:  'office',
      description: 'Представительский офис с акустическими 3D панелями Asia C-03. Стена переговорной комнаты 8 м². Снижение шума до 30%.',
    },
    {
      tenant_id: tid, slug: 'butik-otel-cascade', sort_order: 2, active: true,
      title:       'Бутик-отель Cascade',
      cover_url:   IMG.proj3,
      images:      [IMG.proj3, IMG.gal6, IMG.gal2],
      space_type:  'hotel',
      description: 'Оформление 12 номеров бутик-отеля в центре Еревана. Панели Klips Blade и Deco Line M-50. Каждый номер — уникальное сочетание.',
    },
    {
      tenant_id: tid, slug: 'spalnya-minimalizm', sort_order: 3, active: true,
      title:       'Спальня в стиле минимализм',
      cover_url:   IMG.proj4,
      images:      [IMG.proj4, IMG.gal7, IMG.gal4],
      space_type:  'bedroom',
      description: 'Изголовье кровати с панелями Консул Б. Нейтральный цвет стен подчёркивает фактуру. Установка заняла 1 день.',
    },
  ]})
  console.log('  ✓ 4 projects')

  // ── 3. Gallery ──────────────────────────────────────────────────────────
  console.log('Creating gallery...')
  const galleryData = [
    { image_url: IMG.gal1, caption: 'Акцентная стена с 3D панелями Консул А',      space_type: 'living_room', tags: ['гостиная', 'акцент', 'консул'],   sort_order: 0 },
    { image_url: IMG.gal2, caption: 'Изголовье кровати — панели Консул Б',          space_type: 'bedroom',     tags: ['спальня', 'изголовье'],            sort_order: 1 },
    { image_url: IMG.gal3, caption: 'Открытая гостиная с панелями Drop',            space_type: 'living_room', tags: ['гостиная', 'drop', 'современный'], sort_order: 2 },
    { image_url: IMG.gal4, caption: 'Тёплый интерьер — Taza Gic',                  space_type: 'living_room', tags: ['тёплый', 'taza'],                  sort_order: 3 },
    { image_url: IMG.gal5, caption: 'Минималистичный холл — панели Aliq Atlantic',  space_type: 'office',      tags: ['офис', 'минимализм'],              sort_order: 4 },
    { image_url: IMG.gal6, caption: 'Тёмный дизайн — Klips Blade',                 space_type: 'hotel',       tags: ['отель', 'тёмный', 'klips'],        sort_order: 5 },
    { image_url: IMG.gal7, caption: 'Светлая спальня — D-03',                       space_type: 'bedroom',     tags: ['спальня', 'светлый', 'd03'],       sort_order: 6 },
    { image_url: IMG.gal8, caption: 'Переговорная — Asia C-03',                     space_type: 'office',      tags: ['офис', 'asia', 'акустика'],        sort_order: 7 },
  ]
  await prisma.galleryItem.createMany({
    data: galleryData.map(g => ({ ...g, tenant_id: tid, active: true })),
  })
  console.log('  ✓ 8 gallery items')

  // ── 4. Blog Posts ────────────────────────────────────────────────────────
  console.log('Creating blog posts...')
  const now = new Date()
  await prisma.blogPost.createMany({ data: [
    {
      tenant_id: tid, slug: 'kak-vybrat-3d-paneli', sort_order: 0,
      published: true, published_at: new Date(now.getTime() - 7 * 86400000),
      category: 'guide', cover_url: IMG.blog1,
      tags: ['советы', 'выбор', 'гостиная'],
      title:   { ru: 'Как выбрать 3D панели для гостиной',         en: 'How to Choose 3D Panels for Your Living Room',     am: 'Ինչպես ընտրել 3D պանելներ հյուրասենյակի համար' },
      excerpt: { ru: 'Разбираем ключевые параметры при выборе 3D панелей: размер, фактура, цветовая гамма и сочетание с мебелью.', en: 'We break down the key parameters when choosing 3D panels: size, texture, color palette and furniture pairing.', am: 'Մենք վերլուծում ենք 3D պանելների ընտրության հիմնական պարամետրերը։' },
      body:    { ru: '<p>Выбор 3D панелей — это баланс между эстетикой и практичностью. Начните с замера стены и определения акцентной зоны.</p><p>Для небольших комнат выбирайте мелкий рельеф (Консул А, Консул Б). Для просторных залов подойдут крупные формы — Drop, Klips Blade.</p><p>Цвет панелей всегда белый — это позволяет подкрашивать их под любой интерьер или оставить нейтральными.</p>', en: '<p>Choosing 3D panels is a balance between aesthetics and practicality. Start by measuring the wall and identifying the accent zone.</p><p>For smaller rooms, choose fine relief (Consul A, Consul B). For spacious halls, large forms are suitable — Drop, Klips Blade.</p>', am: '<p>3D պանելների ընտրությունը գեղագիտության և գործնականության հաշվեկշիռ է։</p>' },
    },
    {
      tenant_id: tid, slug: 'trendy-dizayna-2024', sort_order: 1,
      published: true, published_at: new Date(now.getTime() - 3 * 86400000),
      category: 'trends', cover_url: IMG.blog2,
      tags: ['тренды', '2024', 'интерьер'],
      title:   { ru: 'Тренды интерьерного дизайна 2024',  en: 'Interior Design Trends 2024',          am: '2024-ի ինտերիերի դիզայնի միտումները' },
      excerpt: { ru: 'Текстурные стены, органические формы и «тихая роскошь» — главные тренды этого сезона.', en: 'Textured walls, organic forms and "quiet luxury" are the key trends of this season.', am: 'Հյուսված պատեր, օրգանական ձևեր եւ «հանգիստ շքեղություն»' },
      body:    { ru: '<p>2024 год в дизайне интерьера — это год текстур. 3D панели входят в тренд «тихой роскоши», где акцент делается на материале и форме, а не на цвете.</p><p>Органические паттерны (Drop, Asia C-03) прекрасно сочетаются с деревом, льном и бетоном.</p>', en: '<p>2024 in interior design is the year of textures. 3D panels enter the "quiet luxury" trend where the focus is on material and form rather than color.</p>', am: '<p>2024 թվականը ինտերիերի դիզայնում հյուսվածքի տարի է։</p>' },
    },
    {
      tenant_id: tid, slug: 'ustanovka-3d-paneley', sort_order: 2,
      published: true, published_at: now,
      category: 'installation', cover_url: IMG.blog3,
      tags: ['монтаж', 'советы', 'DIY'],
      title:   { ru: 'Установка 3D панелей: советы мастера',  en: 'Installing 3D Panels: Expert Tips',      am: '3D պանելների տեղադրում. փորձագետի խորհուրդներ' },
      excerpt: { ru: 'Пошаговый гайд по подготовке стены, нанесению клея и финишной шпаклёвке швов.', en: 'Step-by-step guide on wall preparation, adhesive application and joint finishing.', am: 'Քայլ առ քայլ ուղեցույց պատի պատրաստման, սոսինձ կիրառման և հոդերի ձևավորման վերաբերյալ' },
      body:    { ru: '<p><strong>Шаг 1. Подготовка стены.</strong> Поверхность должна быть сухой, ровной (отклонение не более 3 мм/м), обезжиренной. Прогрунтуйте глубоко проникающим грунтом.</p><p><strong>Шаг 2. Клей.</strong> Используйте монтажный клей Ceresit CM17 или аналог. Наносите гребенчатым шпателем.</p><p><strong>Шаг 3. Укладка.</strong> Начинайте от центра стены. Стыки должны быть минимальными — 1–2 мм.</p><p><strong>Шаг 4. Финиш.</strong> Шпаклюйте швы гипсовой шпаклёвкой, грунтуйте и красьте в желаемый цвет.</p>', en: '<p><strong>Step 1. Wall Prep.</strong> Surface must be dry, level and degreased. Prime with deep-penetrating primer.</p><p><strong>Step 2. Adhesive.</strong> Use Ceresit CM17 or equivalent. Apply with notched trowel.</p><p><strong>Step 3. Layout.</strong> Start from the center of the wall. Joints should be minimal — 1–2 mm.</p><p><strong>Step 4. Finish.</strong> Fill joints with gypsum filler, prime and paint.</p>', am: '<p>Պատի տեղադրումը 4 հիմնական քայլ ունի.</p>' },
    },
  ]})
  console.log('  ✓ 3 blog posts')

  // ── 5. Designers ─────────────────────────────────────────────────────────
  console.log('Creating designers...')
  await prisma.designer.createMany({ data: [
    {
      tenant_id: tid, slug: 'lila-gasparyan', sort_order: 0, active: true,
      name: 'Лила Гаспарян', photo_url: IMG.person1,
      specialty: 'Residential Design',
      instagram: '@lila.interiors', website: null,
      portfolio: [IMG.proj1, IMG.gal1, IMG.gal4],
      bio: { ru: 'Дизайнер интерьеров с 8-летним опытом. Специализация — жилые пространства премиум-класса. Автор более 60 реализованных проектов в Армении и России.', en: 'Interior designer with 8 years of experience. Specializing in premium residential spaces. Author of 60+ completed projects in Armenia and Russia.', am: '8 տարվա փորձ ունեցող ինտերիերի դիզայներ։ Մասնագիտացած պրեմիում բնակելի տարածություններում։' },
    },
    {
      tenant_id: tid, slug: 'davit-mkrtchyan', sort_order: 1, active: true,
      name: 'Давит Мкртчян', photo_url: IMG.person2,
      specialty: 'Commercial & Office Design',
      instagram: '@davit.design', website: null,
      portfolio: [IMG.proj2, IMG.gal8, IMG.gal5],
      bio: { ru: 'Коммерческий дизайнер. Офисы, рестораны, отели. Работал с брендами в 5 странах. Победитель Armenian Interior Awards 2022.', en: 'Commercial designer. Offices, restaurants, hotels. Worked with brands in 5 countries. Winner of Armenian Interior Awards 2022.', am: 'Կոմերցիոն դիզայներ. Գրասենյակներ, ռեստորաններ, հյուրանոցներ։' },
    },
    {
      tenant_id: tid, slug: 'ani-karapetyan', sort_order: 2, active: true,
      name: 'Ани Карапетян', photo_url: IMG.person3,
      specialty: 'Minimalist & Japandi',
      instagram: '@ani.spaces', website: null,
      portfolio: [IMG.proj4, IMG.gal7, IMG.gal2],
      bio: { ru: 'Специализируется на минималистичных и japandi-интерьерах. Текстура стен — ключевой элемент её дизайна. Сотрудничает с Wallcraft с 2021 года.', en: 'Specializes in minimalist and japandi interiors. Wall texture is a key element of her design. Collaborating with Wallcraft since 2021.', am: 'Մինիմալիստ և japandi ոճի ինտերիերներ ստեղծելու մեջ մասնագիտացած։' },
    },
  ]})
  console.log('  ✓ 3 designers')

  // ── 6. Team Members ──────────────────────────────────────────────────────
  console.log('Creating team members...')
  await prisma.teamMember.createMany({ data: [
    {
      tenant_id: tid, sort_order: 0, active: true,
      name: 'Арман Арутюнян', photo_url: IMG.person4,
      role: { ru: 'Основатель и CEO',       en: 'Founder & CEO',            am: 'Հիմնադիր եւ գործադիր տնօրեն' },
      bio:  { ru: '12 лет в строительной отрасли. Основал Wallcraft в 2018 году с миссией сделать 3D-панели доступными для каждого армянского дома.', en: '12 years in the construction industry. Founded Wallcraft in 2018 with a mission to make 3D panels accessible to every Armenian home.', am: '12 տարի շինարարության ոլորտում։ Հիմնել է Wallcraft-ը 2018-ին։' },
    },
    {
      tenant_id: tid, sort_order: 1, active: true,
      name: 'Мариам Степанян', photo_url: IMG.person5,
      role: { ru: 'Главный дизайнер',       en: 'Lead Designer',            am: 'Գլխավոր դիզայներ' },
      bio:  { ru: 'Архитектор по образованию, дизайнер по призванию. Разрабатывает новые коллекции панелей и консультирует клиентов по подбору решений.', en: 'Architect by training, designer by calling. Develops new panel collections and advises clients on design solutions.', am: 'Ճարտարապետ կրթությամբ, դիզայներ կոչումով։' },
    },
    {
      tenant_id: tid, sort_order: 2, active: true,
      name: 'Нарек Аветисян', photo_url: IMG.person2,
      role: { ru: '3D-визуализация и монтаж', en: '3D Visualization & Installation', am: '3D վիզուալիզացիա եւ տեղադրում' },
      bio:  { ru: 'Отвечает за разработку 3D-визуализатора и координацию монтажных бригад. Сертифицированный специалист по работе с ГКЛ и декоративными панелями.', en: 'Responsible for 3D visualizer development and installation team coordination. Certified specialist in drywall and decorative panels.', am: '3D վիզուալայինացուցիչի մշակումն ու տեղադրման թիմի համակարգումը։' },
    },
  ]})
  console.log('  ✓ 3 team members')

  // ── 7. Dealers ───────────────────────────────────────────────────────────
  console.log('Creating dealers...')
  await prisma.dealer.createMany({ data: [
    {
      tenant_id: tid, sort_order: 0, active: true,
      name: 'Wallcraft — Центральный офис',
      country: 'Армения', region: 'Ереван', city: 'Ереван',
      address: 'ул. Абовяна 22, ТЦ «Россия», 3 этаж',
      phone: '+374 77 123456', email: 'info@wallcraft.am',
      website: null,
      map_url: 'https://maps.google.com/?q=Yerevan+Armenia',
      lat: 40.1872, lng: 44.5152,
    },
    {
      tenant_id: tid, sort_order: 1, active: true,
      name: 'Wallcraft Гюмри — партнёр',
      country: 'Армения', region: 'Ширак', city: 'Гюмри',
      address: 'ул. Вардананц 15',
      phone: '+374 93 456789', email: 'gyumri@wallcraft.am',
      website: null,
      map_url: 'https://maps.google.com/?q=Gyumri+Armenia',
      lat: 40.7942, lng: 43.8453,
    },
    {
      tenant_id: tid, sort_order: 2, active: true,
      name: 'Wallcraft — Ванадзор',
      country: 'Армения', region: 'Лори', city: 'Ванадзор',
      address: 'пр. Тиграна Меца 8',
      phone: '+374 94 567890', email: 'vanadzor@wallcraft.am',
      website: null,
      map_url: 'https://maps.google.com/?q=Vanadzor+Armenia',
      lat: 40.8128, lng: 44.4888,
    },
  ]})
  console.log('  ✓ 3 dealers')

  // ── 8. Partners ──────────────────────────────────────────────────────────
  console.log('Creating partners...')
  await prisma.partner.createMany({ data: [
    { tenant_id: tid, sort_order: 0, active: true, name: 'Plum Armenia',    logo_url: IMG.logo1, website: null },
    { tenant_id: tid, sort_order: 1, active: true, name: 'Bosch Armenia',   logo_url: IMG.logo2, website: null },
    { tenant_id: tid, sort_order: 2, active: true, name: 'Delta Group',     logo_url: IMG.logo3, website: null },
    { tenant_id: tid, sort_order: 3, active: true, name: 'ArchiStudio',     logo_url: IMG.logo4, website: null },
    { tenant_id: tid, sort_order: 4, active: true, name: 'HomeStyle AM',    logo_url: IMG.logo5, website: null },
  ]})
  console.log('  ✓ 5 partners')

  // ── 9. Page Content ──────────────────────────────────────────────────────
  console.log('Creating page content...')

  const pages: Array<{ page_key: string; content: Record<string, unknown> }> = [
    {
      page_key: 'home',
      content: {
        hero_badge:    { ru: 'Новинки 2024',      en: 'New 2024',          am: 'Նոր 2024' },
        cta_title:     { ru: 'Создайте свой интерьер в 3D', en: 'Design Your Interior in 3D', am: 'Ստեղծեք ձեր ինտերիերը 3D-ում' },
        cta_subtitle:  { ru: 'Выберите панели, расставьте акценты, увидьте результат до начала ремонта', en: 'Choose panels, place accents, see the result before renovation starts', am: 'Ընտրեք պանելներ, տեղադրեք ակցենտներ, տեսեք արդյունքը' },
        stats_projects:  '200+',
        stats_models:    '40+',
        stats_clients:   '500+',
        stats_years:     '6',
      },
    },
    {
      page_key: 'about',
      content: {
        story_title:   { ru: 'Наша история',    en: 'Our Story',          am: 'Մեր պատմությունը' },
        story_text:    { ru: 'Wallcraft основан в 2018 году в Ереване. Мы начинали как небольшая мастерская декоративных панелей, сегодня — это ведущий производитель и дистрибьютор 3D-панелей в Армении с собственным шоурумом и уникальным онлайн-визуализатором.', en: 'Wallcraft was founded in 2018 in Yerevan. We started as a small decorative panel workshop, today we are the leading manufacturer and distributor of 3D panels in Armenia with our own showroom and a unique online visualizer.', am: 'Wallcraft-ը հիմնադրվել է 2018 թվականին Երևանում։ Մենք սկսեցինք որպես փոքր դեկորատիվ պանելների արհեստանոց, այժմ՝ Հայաստանում 3D պանելների առաջատար արտադրող ու բաշխող։' },
        mission_title: { ru: 'Наша миссия',     en: 'Our Mission',        am: 'Մեր առաքելությունը' },
        mission_text:  { ru: 'Сделать 3D-дизайн доступным для каждого дома. Мы верим, что красивое пространство меняет качество жизни — поэтому разрабатываем доступные решения без потери качества.', en: 'Make 3D design accessible to every home. We believe that a beautiful space changes the quality of life — so we develop affordable solutions without compromising quality.', am: '3D դիզայնը մատչելի դարձնել յուրաքանչյուր տան համար։' },
        values: [
          { icon: '◆', title: { ru: 'Качество', en: 'Quality', am: 'Որակ' }, text: { ru: 'Только сертифицированные материалы', en: 'Only certified materials', am: 'Միայն հավաստագրված նյութեր' } },
          { icon: '◉', title: { ru: 'Инновации', en: 'Innovation', am: 'Նորամուծություն' }, text: { ru: 'Собственный 3D-визуализатор', en: 'Proprietary 3D visualizer', am: 'Սեփական 3D վիզուալայինացուցիչ' } },
          { icon: '◈', title: { ru: 'Сервис', en: 'Service', am: 'Սպասարկում' }, text: { ru: 'Монтаж и гарантия 2 года', en: 'Installation and 2-year warranty', am: 'Տեղադրում և 2 տարի երաշխիք' } },
        ],
      },
    },
    {
      page_key: 'contact',
      content: {
        address:       'ул. Абовяна 22, ТЦ «Россия», 3 этаж, Ереван',
        phone:         '+374 77 123456',
        email:         'info@wallcraft.am',
        whatsapp:      '+37477123456',
        work_hours:    { ru: 'Пн–Сб: 10:00–19:00', en: 'Mon–Sat: 10:00–19:00', am: 'Երկ–Շաբ: 10:00–19:00' },
        map_embed_url: 'https://maps.google.com/maps?q=Yerevan+Armenia&z=15&output=embed',
      },
    },
    {
      page_key: 'installation',
      content: {
        intro: { ru: 'Установка 3D панелей занимает от 1 дня. Наши мастера работают в Ереване и регионах. Гарантия на монтаж — 2 года.', en: 'Installation of 3D panels takes from 1 day. Our craftsmen work in Yerevan and regions. Installation warranty — 2 years.', am: '3D պանելների տեղադրումը տևում է 1 օրից ավելի։' },
        steps: [
          { num: '01', title: { ru: 'Замер и консультация', en: 'Measurement & Consultation', am: 'Չափագրում եւ խորհրդատվություն' }, text: { ru: 'Выезжаем на объект, замеряем стены, подбираем панели и рассчитываем количество.', en: 'We visit the site, measure walls, select panels and calculate quantities.', am: 'Այցելում ենք օbject, չափում ենք պատերը, ընտրում ենք պանելներ' } },
          { num: '02', title: { ru: 'Подготовка поверхности', en: 'Surface Preparation', am: 'Մակերեւույթի պատրաստում' }, text: { ru: 'Грунтовка, выравнивание (при необходимости), нанесение разметки.', en: 'Priming, leveling (if necessary), applying markup.', am: 'Գրունտավում, հարթեցում, նշագծում' } },
          { num: '03', title: { ru: 'Монтаж панелей', en: 'Panel Installation', am: 'Պանելների տեղադրում' }, text: { ru: 'Клеевой метод или на каркас. Панели укладываются от центра к краям.', en: 'Adhesive method or frame. Panels are laid from center to edges.', am: 'Կպչուն մեթոդ կամ շրջանակ' } },
          { num: '04', title: { ru: 'Финишная отделка', en: 'Finishing', am: 'Վերջնական հարդարում' }, text: { ru: 'Шпаклёвка швов, грунтовка, покраска в любой цвет по каталогу RAL.', en: 'Grouting joints, priming, painting in any RAL color.', am: 'Հոդերի պատում, գրունտ, ներկում' } },
        ],
      },
    },
    {
      page_key: 'partners',
      content: {
        title:    { ru: 'Наши партнёры',      en: 'Our Partners',         am: 'Մեր գործընկերները' },
        subtitle: { ru: 'Мы сотрудничаем с ведущими архитектурными бюро, застройщиками и дизайн-студиями Армении.', en: 'We work with leading architectural firms, developers and design studios in Armenia.', am: 'Աշխատում ենք Հայաստանի առաջատար ճարտարապետական ​​ընկերությունների հետ' },
        cta_title:    { ru: 'Станьте нашим партнёром', en: 'Become Our Partner', am: 'Դարձեք մեր գործընկերը' },
        cta_subtitle: { ru: 'Специальные условия для дилеров, архитекторов и строительных компаний.', en: 'Special terms for dealers, architects and construction companies.', am: 'Հատուկ պայմաններ դիլերների, ճարտարապետների համար' },
      },
    },
  ]

  for (const p of pages) {
    await prisma.pageContent.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { tenant_id: tid, page_key: p.page_key, content: p.content as any },
    })
  }
  console.log('  ✓ 5 page content entries')

  console.log('\n✅ Content seed complete!')
  console.log('  Hero slides: 3')
  console.log('  Projects:    4')
  console.log('  Gallery:     8')
  console.log('  Blog posts:  3')
  console.log('  Designers:   3')
  console.log('  Team:        3')
  console.log('  Dealers:     3')
  console.log('  Partners:    5')
  console.log('  Pages:       5')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
