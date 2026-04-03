/**
 * TEMPORARY: One-shot seed endpoint. Remove after seeding prod.
 * POST /internal/seed-content?key=wc_seed_2024
 */
import { Router } from 'express'
import { prisma } from '../utils/prisma'

const router = Router()
const SEED_KEY = 'wc_seed_2024'

const U = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`

const IMG = {
  hero1: U('1616486338812-3dadae4b4ace', 1600, 900),
  hero2: U('1618221195710-dd6b41faaea6', 1600, 900),
  hero3: U('1600210492486-724fe5c67fb0', 1600, 900),
  proj1: U('1583847268964-b28dc8f51f92'),
  proj2: U('1497366216548-37526070297c'),
  proj3: U('1566195992011-5f6b21e539aa'),
  proj4: U('1560448204-e02f11c3d0e2'),
  gal1:  U('1631679706909-1844bbd07221', 900, 700),
  gal2:  U('1567016432779-094069958ea5', 900, 700),
  gal3:  U('1556905055-8f358a7a47b2', 900, 700),
  gal4:  U('1493809842364-78817add7ffb', 900, 700),
  gal5:  U('1618220179428-22790b461013', 900, 700),
  gal6:  U('1615873968403-89583b7cb40b', 900, 700),
  gal7:  U('1600607687939-ce8a6c25118c', 900, 700),
  gal8:  U('1507089947368-19c1da9775ae', 900, 700),
  blog1: U('1616486338812-3dadae4b4ace', 800, 500),
  blog2: U('1618221195710-dd6b41faaea6', 800, 500),
  blog3: U('1600210492486-724fe5c67fb0', 800, 500),
  p1: U('1544005313-94ddf0286df2', 400, 400),
  p2: U('1507003211169-0a1dd7228f2d', 400, 400),
  p3: U('1494790108377-be9c29b29330', 400, 400),
  p4: U('1500648767791-00dcc994a43e', 400, 400),
  p5: U('1438761681033-6461ffad8d80', 400, 400),
  logo1: 'https://placehold.co/240x80/f5f0eb/8b7355?text=Plum+Armenia&font=raleway',
  logo2: 'https://placehold.co/240x80/f5f0eb/8b7355?text=Bosch+AM&font=raleway',
  logo3: 'https://placehold.co/240x80/f5f0eb/8b7355?text=Delta+Group&font=raleway',
  logo4: 'https://placehold.co/240x80/f5f0eb/8b7355?text=ArchiStudio&font=raleway',
  logo5: 'https://placehold.co/240x80/f5f0eb/8b7355?text=HomeStyle&font=raleway',
}

router.post('/internal/seed-content', async (req, res) => {
  if (req.query.key !== SEED_KEY) return res.status(403).json({ error: 'forbidden' })
  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'wallcraft' } })
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' })
    const tid = tenant.id

    await prisma.heroSlide.deleteMany({ where: { tenant_id: tid } })
    await prisma.galleryItem.deleteMany({ where: { tenant_id: tid } })
    await prisma.project.deleteMany({ where: { tenant_id: tid } })
    await prisma.blogPost.deleteMany({ where: { tenant_id: tid } })
    await prisma.designer.deleteMany({ where: { tenant_id: tid } })
    await prisma.teamMember.deleteMany({ where: { tenant_id: tid } })
    await prisma.dealer.deleteMany({ where: { tenant_id: tid } })
    await prisma.partner.deleteMany({ where: { tenant_id: tid } })
    await prisma.pageContent.deleteMany({ where: { tenant_id: tid } })

    await prisma.heroSlide.createMany({ data: [
      { tenant_id: tid, image_url: IMG.hero1, sort_order: 0, active: true,
        headline:    { ru: 'Создайте интерьер своей мечты', en: 'Design Your Dream Interior', am: 'Ստեղծեք Ձեր երազած ինտeriera' },
        subheadline: { ru: '3D панели для жилых и коммерческих пространств', en: 'Premium 3D wall panels for any space', am: '3D պanelner' },
        cta_label:   { ru: 'Смотреть коллекцию', en: 'View Collection', am: 'Դиtел havakaduն' },
        cta_url: '/products' },
      { tenant_id: tid, image_url: IMG.hero2, sort_order: 1, active: true,
        headline:    { ru: 'Попробуйте в 3D прямо сейчас', en: 'Try It in 3D Right Now', am: '3D-ում փordzetz henz hima' },
        subheadline: { ru: 'Уникальный визуализатор поможет подобрать панели', en: 'Our unique visualizer helps you pick panels', am: 'Mer ezaniki vizualayinacucich' },
        cta_label:   { ru: 'Открыть визуализатор', en: 'Open Visualizer', am: 'Bacel vizualayinacucich' },
        cta_url: '/visualizer' },
      { tenant_id: tid, image_url: IMG.hero3, sort_order: 2, active: true,
        headline:    { ru: 'Коллекция 2024', en: 'Collection 2024', am: '2024 Havakaду' },
        subheadline: { ru: '40+ моделей, подбор и установка под ключ', en: '40+ models, selection and turnkey installation', am: '40+ model' },
        cta_label:   { ru: 'Узнать подробнее', en: 'Learn More', am: 'Imanal avelin' },
        cta_url: '/about' },
    ]})

    await prisma.project.createMany({ data: [
      { tenant_id: tid, slug: 'gostinaya-yerevan-2024', sort_order: 0, active: true,
        title: 'Гостиная в Ереване', cover_url: IMG.proj1,
        images: [IMG.proj1, IMG.gal1, IMG.gal3], space_type: 'living_room',
        description: 'Современная гостиная с панелями Консул А и Drop. Площадь стены 12 м².' },
      { tenant_id: tid, slug: 'ofis-it-kompanii', sort_order: 1, active: true,
        title: 'Офис IT-компании', cover_url: IMG.proj2,
        images: [IMG.proj2, IMG.gal8], space_type: 'office',
        description: 'Переговорная с акустическими 3D панелями Asia C-03.' },
      { tenant_id: tid, slug: 'butik-otel-cascade', sort_order: 2, active: true,
        title: 'Бутик-отель Cascade', cover_url: IMG.proj3,
        images: [IMG.proj3, IMG.gal6], space_type: 'hotel',
        description: '12 номеров с панелями Klips Blade и Deco Line M-50.' },
      { tenant_id: tid, slug: 'spalnya-minimalizm', sort_order: 3, active: true,
        title: 'Спальня минимализм', cover_url: IMG.proj4,
        images: [IMG.proj4, IMG.gal7], space_type: 'bedroom',
        description: 'Изголовье с панелями Консул Б.' },
    ]})

    await prisma.galleryItem.createMany({ data: [
      { tenant_id: tid, active: true, sort_order: 0, image_url: IMG.gal1, caption: 'Акцентная стена Консул А',    space_type: 'living_room', tags: ['гостиная','акцент'] },
      { tenant_id: tid, active: true, sort_order: 1, image_url: IMG.gal2, caption: 'Изголовье кровати Консул Б',  space_type: 'bedroom',     tags: ['спальня'] },
      { tenant_id: tid, active: true, sort_order: 2, image_url: IMG.gal3, caption: 'Гостиная Drop',               space_type: 'living_room', tags: ['гостиная','drop'] },
      { tenant_id: tid, active: true, sort_order: 3, image_url: IMG.gal4, caption: 'Тёплый интерьер Taza Gic',    space_type: 'living_room', tags: ['тёплый'] },
      { tenant_id: tid, active: true, sort_order: 4, image_url: IMG.gal5, caption: 'Холл Aliq Atlantic',           space_type: 'office',      tags: ['офис'] },
      { tenant_id: tid, active: true, sort_order: 5, image_url: IMG.gal6, caption: 'Тёмный Klips Blade',           space_type: 'hotel',       tags: ['отель'] },
      { tenant_id: tid, active: true, sort_order: 6, image_url: IMG.gal7, caption: 'Светлая спальня D-03',         space_type: 'bedroom',     tags: ['спальня','светлый'] },
      { tenant_id: tid, active: true, sort_order: 7, image_url: IMG.gal8, caption: 'Переговорная Asia C-03',       space_type: 'office',      tags: ['офис','asia'] },
    ]})

    const now = new Date()
    await prisma.blogPost.createMany({ data: [
      { tenant_id: tid, slug: 'kak-vybrat-3d-paneli', sort_order: 0, published: true,
        published_at: new Date(now.getTime() - 7 * 86400000), category: 'guide', cover_url: IMG.blog1, tags: ['советы','выбор'],
        title:   { ru: 'Как выбрать 3D панели для гостиной', en: 'How to Choose 3D Panels', am: 'Inchpes yntrel 3D panelner' },
        excerpt: { ru: 'Ключевые параметры при выборе панелей.', en: 'Key parameters for choosing panels.', am: 'Himnakan parametrner' },
        body:    { ru: '<p>Начните с замера стены и выбора акцентной зоны.</p>', en: '<p>Start by measuring the wall and picking the accent zone.</p>', am: '<p>Sksek chapagrkutyamb.</p>' } },
      { tenant_id: tid, slug: 'trendy-dizayna-2024', sort_order: 1, published: true,
        published_at: new Date(now.getTime() - 3 * 86400000), category: 'trends', cover_url: IMG.blog2, tags: ['тренды','2024'],
        title:   { ru: 'Тренды интерьерного дизайна 2024', en: 'Interior Design Trends 2024', am: '2024 dizayny mitnumner' },
        excerpt: { ru: 'Текстурные стены — главный тренд.', en: 'Textured walls are the main trend.', am: 'Hyusvac pater' },
        body:    { ru: '<p>2024 — год текстур и «тихой роскоши».</p>', en: '<p>2024 is the year of textures and quiet luxury.</p>', am: '<p>2024 t. hyusvackutyun.</p>' } },
      { tenant_id: tid, slug: 'ustanovka-3d-paneley', sort_order: 2, published: true,
        published_at: now, category: 'installation', cover_url: IMG.blog3, tags: ['монтаж'],
        title:   { ru: 'Установка 3D панелей: советы мастера', en: 'Installing 3D Panels: Expert Tips', am: 'Teladrum mardik' },
        excerpt: { ru: 'Пошаговый гайд по установке.', en: 'Step-by-step installation guide.', am: 'Qayl ar qayl' },
        body:    { ru: '<p>Шаг 1: Подготовьте стену. Шаг 2: Нанесите клей. Шаг 3: Установите панели.</p>', en: '<p>Step 1: Prep wall. Step 2: Apply adhesive. Step 3: Install.</p>', am: '<p>Qayl 1: Patrastel pate.</p>' } },
    ]})

    await prisma.designer.createMany({ data: [
      { tenant_id: tid, slug: 'lila-gasparyan', sort_order: 0, active: true, name: 'Лила Гаспарян', photo_url: IMG.p1,
        specialty: 'Residential Design', instagram: '@lila.interiors', portfolio: [IMG.proj1, IMG.gal1],
        bio: { ru: 'Дизайнер с 8-летним опытом. 60+ проектов.', en: '8 years experience. 60+ projects.', am: '8 tari porvadzutyun' } },
      { tenant_id: tid, slug: 'davit-mkrtchyan', sort_order: 1, active: true, name: 'Давит Мкртчян', photo_url: IMG.p2,
        specialty: 'Commercial Design', instagram: '@davit.design', portfolio: [IMG.proj2, IMG.gal8],
        bio: { ru: 'Победитель Armenian Interior Awards 2022.', en: 'Armenian Interior Awards 2022 winner.', am: 'Marzelaber 2022' } },
      { tenant_id: tid, slug: 'ani-karapetyan', sort_order: 2, active: true, name: 'Ани Карапетян', photo_url: IMG.p3,
        specialty: 'Minimalist & Japandi', instagram: '@ani.spaces', portfolio: [IMG.proj4, IMG.gal7],
        bio: { ru: 'Минималистичные интерьеры.', en: 'Minimalist interiors.', am: 'Minimalist interierneR' } },
    ]})

    await prisma.teamMember.createMany({ data: [
      { tenant_id: tid, sort_order: 0, active: true, name: 'Арман Арутюнян', photo_url: IMG.p4,
        role: { ru: 'Основатель и CEO', en: 'Founder & CEO', am: 'Himnadир' },
        bio:  { ru: 'Основал Wallcraft в 2018.', en: 'Founded Wallcraft in 2018.', am: 'Himnadrel Wallcraft-e 2018-in' } },
      { tenant_id: tid, sort_order: 1, active: true, name: 'Мариам Степанян', photo_url: IMG.p5,
        role: { ru: 'Главный дизайнер', en: 'Lead Designer', am: 'Gлавnый дizayner' },
        bio:  { ru: 'Разрабатывает новые коллекции.', en: 'Develops new collections.', am: 'Maшakum e nоr havakaduner' } },
      { tenant_id: tid, sort_order: 2, active: true, name: 'Нарек Аветисян', photo_url: IMG.p2,
        role: { ru: '3D-визуализация', en: '3D Visualization', am: '3D vizualizacia' },
        bio:  { ru: 'Разработка 3D-визуализатора.', en: '3D visualizer development.', am: '3D vizualizer' } },
    ]})

    await prisma.dealer.createMany({ data: [
      { tenant_id: tid, sort_order: 0, active: true, name: 'Wallcraft — Ереван',
        country: 'Армения', region: 'Ереван', city: 'Ереван',
        address: 'ул. Абовяна 22, ТЦ «Россия», 3 этаж',
        phone: '+374 77 123456', email: 'info@wallcraft.am',
        map_url: 'https://maps.google.com/?q=Yerevan+Armenia', lat: 40.1872, lng: 44.5152 },
      { tenant_id: tid, sort_order: 1, active: true, name: 'Wallcraft — Гюмри',
        country: 'Армения', region: 'Ширак', city: 'Гюмри',
        address: 'ул. Вардананц 15', phone: '+374 93 456789', email: 'gyumri@wallcraft.am',
        map_url: 'https://maps.google.com/?q=Gyumri+Armenia', lat: 40.7942, lng: 43.8453 },
      { tenant_id: tid, sort_order: 2, active: true, name: 'Wallcraft — Ванадзор',
        country: 'Армения', region: 'Лори', city: 'Ванадзор',
        address: 'пр. Тиграна Меца 8', phone: '+374 94 567890', email: 'vanadzor@wallcraft.am',
        map_url: 'https://maps.google.com/?q=Vanadzor+Armenia', lat: 40.8128, lng: 44.4888 },
    ]})

    await prisma.partner.createMany({ data: [
      { tenant_id: tid, sort_order: 0, active: true, name: 'Plum Armenia',  logo_url: IMG.logo1 },
      { tenant_id: tid, sort_order: 1, active: true, name: 'Bosch Armenia', logo_url: IMG.logo2 },
      { tenant_id: tid, sort_order: 2, active: true, name: 'Delta Group',   logo_url: IMG.logo3 },
      { tenant_id: tid, sort_order: 3, active: true, name: 'ArchiStudio',   logo_url: IMG.logo4 },
      { tenant_id: tid, sort_order: 4, active: true, name: 'HomeStyle AM',  logo_url: IMG.logo5 },
    ]})

    const pages = [
      { page_key: 'home',         content: { hero_badge: { ru: 'Новинки 2024', en: 'New 2024', am: 'Nor 2024' }, stats_projects: '200+', stats_models: '40+', stats_clients: '500+', stats_years: '6' } },
      { page_key: 'about',        content: { story_title: { ru: 'Наша история', en: 'Our Story', am: 'Mer patmutyune' }, story_text: { ru: 'Wallcraft основан в 2018 году в Ереване.', en: 'Wallcraft was founded in 2018 in Yerevan.', am: 'Wallcraft himnadrel e 2018-in Yerevanum' }, mission_title: { ru: 'Наша миссия', en: 'Our Mission', am: 'Mer aqelutyune' }, mission_text: { ru: 'Сделать 3D дизайн доступным для каждого.', en: 'Make 3D design accessible to everyone.', am: '3D dizayn bolor@ hamara' } } },
      { page_key: 'contact',      content: { address: 'ул. Абовяна 22, Ереван', phone: '+374 77 123456', email: 'info@wallcraft.am', whatsapp: '+37477123456', work_hours: { ru: 'Пн–Сб: 10:00–19:00', en: 'Mon–Sat: 10:00–19:00', am: 'Erkushabt-Shabt: 10-19' } } },
      { page_key: 'installation', content: { intro: { ru: 'Установка 3D панелей от 1 дня. Гарантия 2 года.', en: 'Installation from 1 day. 2-year warranty.', am: 'Teladrum 1 or. Erakutyun 2 tarek' } } },
      { page_key: 'partners',     content: { title: { ru: 'Наши партнёры', en: 'Our Partners', am: 'Mer gortsunerR' }, subtitle: { ru: 'Ведущие студии Армении.', en: 'Leading studios in Armenia.', am: 'Haravacharner Hayastanum' } } },
    ]
    for (const p of pages) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.pageContent.create({ data: { tenant_id: tid, page_key: p.page_key, content: p.content as any } })
    }

    return res.json({ ok: true, seeded: { slides: 3, projects: 4, gallery: 8, blog: 3, designers: 3, team: 3, dealers: 3, partners: 5, pages: 5 } })
  } catch (e) {
    console.error('Seed error:', e)
    return res.status(500).json({ error: String(e) })
  }
})

export default router
