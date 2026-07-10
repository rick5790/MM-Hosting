(function () {
  const storageKey = 'makkie-language';
  const body = document.body;
  const page = body.dataset.page || 'collection';
  const navMenuButton = document.getElementById('navMenuButton');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const langToggle = document.getElementById('langToggle');
  const pageEye = document.getElementById('pageEye');
  const pageTitle = document.getElementById('pageTitle');
  const pageSub = document.getElementById('pageSub');
  const pageActions = document.getElementById('pageActions');
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const iconLink = document.querySelector('link[rel="icon"]');
  const heroLinks = document.querySelector('.hero-links');
  const mobileDrawerLinks = document.querySelector('.mobile-drawer-links');
  const footerMenu = document.getElementById('footerMenuLinks');
  const footerContact = document.getElementById('footerContactLinks');
  const footerMenuTitle = document.getElementById('footerMenuTitle');
  const footerContactTitle = document.getElementById('footerContactTitle');
  const footerTag = document.getElementById('footerTag');
  const footerCredit = document.getElementById('footerCredit');
  const footerLocation = document.getElementById('footerLocation');
  const footerCopyText = document.getElementById('footerCopy');
  const mobileDrawerFoot = document.getElementById('mobileDrawerFoot');
  const footerContactSection = footerContact ? footerContact.closest('div') : null;

  let drawerCloseTimer = null;

  const pageLinks = [
    { key: 'home', url: 'index.html', zh: '主页', en: 'Home' },
    { key: 'collection', url: 'collection.html', zh: 'Makkie 图鉴', en: 'Collection' },
    { key: 'layers', url: 'layers.html', zh: '层层夹心', en: 'Layers' },
    { key: 'instagram', url: 'instagram.html', zh: '甜品动态', en: 'Recent Post' },
    { key: 'contact', url: 'contact.html', zh: '联系我们', en: 'Contact' }
  ];

  const footerMenuLinks = [
    { url: 'index.html' },
    { url: 'collection.html' },
    { url: 'layers.html' },
    { url: 'instagram.html' },
    { url: 'shop.html' }
  ];

  const pageCopy = {
    collection: {
      seo: {
        zh: {
          title: 'Makkie Mua 图鉴 | 甜品图鉴',
          description: '浏览 Makkie Mua 的甜品图鉴，查看近期巴斯克、Makkie 胖曲奇、戚风夹心、米布丁与创意甜品。'
        },
        en: {
          title: 'Makkie Mua Collection | Dessert Collection',
          description: 'Browse the Makkie Mua dessert collection, including recent Basque cheesecakes, Makkie cookies, chiffon layers, rice puddings, and creative desserts.'
        }
      },
      eye: { zh: 'Makkie Collection', en: 'Makkie Collection' },
      title: { zh: '甜品图鉴', en: 'Dessert Collection' },
      sub: { zh: '', en: '' },
      actions: []
    },
    layers: {
      seo: {
        zh: {
          title: 'Makkie Mua 图鉴 | 探索夹心',
          description: '探索 Makkie Mua 各类甜品的层次、夹心与口感设计，看看每一类甜品里面都藏了什么。'
        },
        en: {
          title: 'Makkie Mua Layers | Explore the Layers',
          description: 'Explore the layers, fillings, and textures behind each Makkie Mua dessert category.'
        }
      },
      eye: { zh: '看看里面有什么', en: 'See What Is Inside' },
      title: { zh: '探索层层夹心', en: 'Explore the Layers' },
      sub: { zh: '', en: '' },
      actions: []
    },
    instagram: {
      seo: {
        zh: {
          title: 'Makkie Mua 甜品动态 | 最近更新',
          description: '查看 Makkie Mua 最近公开发布的内容与最新甜品动态。'
        },
        en: {
          title: 'Makkie Mua Recent Post | Latest Updates',
          description: 'See the latest public social posts and featured dessert updates from Makkie Mua.'
        }
      },
      eye: { zh: '看看最近我们有什么动态', en: 'See What Is New Lately' },
      title: { zh: '甜品动态', en: 'Recent Post' },
      sub: { zh: '', en: '' },
      actions: []
    },
    shop: {
      seo: {
        zh: {
          title: 'Makkie Mua 预定 | 本周菜单',
          description: '查看 Makkie Mua 本周菜单、预定状态与取货信息。'
        },
        en: {
          title: 'Makkie Mua Preorder | Weekly Menu',
          description: 'View this week’s menu, preorder status, and pickup details for Makkie Mua.'
        }
      },
      eye: { zh: '预定', en: 'Preorder' },
      title: { zh: '本周预定', en: 'This Week’s Preorder' },
      sub: {
        zh: '',
        en: ''
      },
      actions: []
    },
    contact: {
      seo: {
        zh: {
          title: 'Makkie Mua 联系方式 | 联系我们',
          description: '查看 Makkie Mua 的联系方式、二维码与常用联系入口。'
        },
        en: {
          title: 'Makkie Mua Contact | Get in Touch',
          description: 'Find Makkie Mua contact details, QR codes, and message channels in one place.'
        }
      },
      eye: { zh: '联系我们', en: 'Contact' },
      title: { zh: '联系 Makkie Mua', en: 'Contact Makkie Mua' },
      sub: { zh: '', en: '' },
      actions: []
    },
    intro: {
      seo: {
        zh: {
          title: 'Makkie 的故事 | 关于 Makkie',
          description: '认识 Makkie Mua 的品牌故事，了解这个从旧金山开始的创意甜点品牌，如何把记忆、温度与灵感放进每一层口感里。'
        },
        en: {
          title: 'About Makkie | Our Story',
          description: 'Meet the story behind Makkie Mua, a creative dessert brand founded in San Francisco and shaped by memory, warmth, and playful imagination.'
        }
      },
      eye: { zh: '关于 Makkie', en: 'About Makkie' },
      title: { zh: 'Makkie 的故事', en: 'Our Story' },
      sub: { zh: '', en: '' },
      actions: []
    }
  };

  const footerCopy = {
    zh: {
      title1: '网站',
      title2: '关于 Makkie',
      menu: ['主页', 'Makkie 图鉴', '探索夹心', '甜品动态', '马上预定'],
      contacts: [
        { label: '联系我们', href: 'contact.html' },
        { label: 'Makkie 的故事', href: 'intro.html' },
        { label: '隐私政策', href: 'privacy.html' },
        { label: '电商条款与条件', href: 'terms.html' }
      ],
      tagline: 'Butter off with Makkie',
      credit: 'Makkie 艺术设计 by @littlejulia_art',
      location: 'Los Angeles & Orange County',
      copy: '© 2026 Makkie Mua. All Rights Reserved.',
      book: '马上预定',
      profile: '我的',
      toggleAria: '切换到 English',
      mobileLang: '语言'
    },
    en: {
      title1: 'Shop',
      title2: 'About Makkie',
      menu: ['Home', 'Collection', 'Layers', 'Recent Post', 'Order Now'],
      contacts: [
        { label: 'Contact', href: 'contact.html' },
        { label: 'Makkie Story', href: 'intro.html' },
        { label: 'Privacy Policy', href: 'privacy.html' },
        { label: 'Terms & Conditions', href: 'terms.html' }
      ],
      tagline: 'Butter off with Makkie',
      credit: 'Makkie art direction by @littlejulia_art',
      location: 'Los Angeles & Orange County',
      copy: '© 2026 Makkie Mua. All Rights Reserved.',
      book: 'Order Now',
      profile: 'Profile',
      toggleAria: 'Switch to 中文',
      mobileLang: 'Language'
    }
  };

  const collectionImageVersion = '20260619';
  const collectionImageBase = 'https://api.makkiemua.com/uploads/collection';
  // 硬编码兜底；图鉴页加载后会用后台 /api/collection 覆盖，实现与后台同步。
  let collectionGroups = [
    {
      id: 'menu-basque',
      title: { zh: '巴斯克蛋糕', en: 'Basque Cheesecake' },
      subtitle: { zh: '焦香绵密，一口就上头', en: 'Burnt edge, creamy center, instant obsession' },
      items: [
        ['伯爵茶桂花冻巴斯克', 'Earl Grey Osmanthus Jelly Basque', 'collection-02.jpg'],
        ['斑斓芭乐巴斯克', 'Pandan Guava Basque', 'collection-12.jpg'],
        ['桂花芋泥巴斯克', 'Osmanthus Taro Basque', 'collection-16.jpg'],
        ['法葱巴斯克', 'Scallion Basque', 'collection-17.jpg'],
        ['泰式咸法酪巴斯克', 'Thai Savory Fromage Basque', 'collection-18.jpg'],
        ['海盐榴莲流心巴斯克', 'Sea Salt Durian Lava Basque', 'collection-19.jpg'],
        ['黑松露流心巴斯克', 'Black Truffle Lava Basque', 'collection-36.jpg'],
        ['绢豆腐慕斯巴斯克', 'Silken Tofu Mousse Basque', 'collection-27.jpg'],
        ['酒酿姜撞奶巴斯克', 'Fermented Rice Ginger Milk Basque', 'collection-31.jpg']
      ]
    },
    {
      id: 'menu-cookie',
      title: { zh: 'Makkie 胖曲奇', en: 'Makkie Cookies' },
      subtitle: { zh: '酥香松软，咬开就有惊喜', en: 'Buttery, soft, and full of surprises' },
      items: [
        ['咸奶茶炒米胖曲奇', 'Salted Milk Tea Toasted Rice Makkie', 'collection-04.jpg'],
        ['朗姆酒提子胖曲奇', 'Rum Raisin Makkie', 'collection-13.jpg'],
        ['玄米茶蜜瓜胖曲奇', 'Genmaicha Melon Makkie', 'collection-22.jpg'],
        ['芋泥椰椰胖曲奇', 'Taro Coconut Makkie', 'collection-28.jpg'],
        ['迪拜巧克力胖曲奇', 'Dubai Chocolate Makkie', 'collection-29.jpg'],
        ['金沙双黄胖曲奇', 'Salted Egg Yolk Makkie', 'collection-32.jpg'],
        ['黄油柿饼胖曲奇', 'Butter Dried Persimmon Makkie', 'collection-34.jpg']
      ]
    },
    {
      id: 'menu-chiffon',
      title: { zh: '戚风夹心', en: 'Chiffon Sandwich' },
      subtitle: { zh: '云朵一样软，奶香慢慢化开', en: 'Cloud-soft cake with slow-melting cream' },
      items: [
        ['伯爵红茶草莓布丁戚风三明治', 'Earl Grey Strawberry Pudding Chiffon Sandwich', 'collection-01.jpg'],
        ['稻香米麻薯四重奏戚风三明治', 'Rice Aroma Mochi Quartet Chiffon Sandwich', 'collection-08.jpg'],
        ['斑斓芒果糯米戚风三明治', 'Pandan Mango Sticky Rice Chiffon Sandwich', 'collection-11.jpg'],
        ['杨枝甘露奶皮子戚风三明治', 'Mango Pomelo Milk Skin Chiffon Sandwich', 'collection-14.jpg'],
        ['焙茶流心柿子', 'Hojicha Lava Persimmon', 'collection-20.jpg'],
        ['玄米茶茉莉玫珀蜜瓜戚风三明治', 'Genmaicha Jasmine Melon Chiffon Sandwich', 'collection-21.jpg'],
        ['紫苏白桃芭乐戚风三明治', 'Shiso White Peach Guava Chiffon Sandwich', 'collection-26.jpg'],
        ['黑芝麻豆乳戚风三明治', 'Black Sesame Soy Milk Chiffon Sandwich', 'collection-35.jpg']
      ]
    },
    {
      id: 'menu-pudding',
      title: { zh: '米布丁', en: 'Rice Pudding' },
      subtitle: { zh: '滑滑软软，适合慢慢吃', en: 'Silky, chilled, and easy to love' },
      items: [
        ['大红袍奶冻无花果米布丁', 'Da Hong Pao Panna Cotta Fig Rice Pudding', 'collection-05.jpg'],
        ['巧克力香蕉米布丁', 'Chocolate Banana Rice Pudding', 'collection-06.jpg'],
        ['玫瑰奶冻清酒草莓米布丁', 'Rose Panna Cotta Sake Strawberry Rice Pudding', 'collection-23.jpg'],
        ['香芋葡萄奶皮子米布丁', 'Taro Grape Milk Skin Rice Pudding', 'collection-33.jpg']
      ]
    },
    {
      id: 'menu-milk-cake',
      title: { zh: '布丁奶糕', en: 'Pudding Milk Cake' },
      subtitle: { zh: '布丁和奶糕叠在一起，软糯又轻盈', en: 'Pudding and milk cake layered into a soft, airy bite' },
      items: [
        ['桂花柿子酒酿布丁奶糕', 'Osmanthus Persimmon Fermented Rice Milk Cake', 'collection-15.jpg'],
        ['甜玉米爆米花布丁奶糕', 'Sweet Corn Popcorn Pudding Milk Cake', 'collection-25.jpg']
      ]
    },
    {
      id: 'menu-tart',
      title: { zh: '酥皮与挞挞', en: 'Pastry & Tart' },
      subtitle: { zh: '酥香层次里，带一点糯一点轻盈', en: 'Flaky layers with a gentle chew and light finish' },
      items: [
        ['伯爵茶米麻薯挞挞', 'Earl Grey Rice Mochi Tart', 'collection-03.jpg'],
        ['抹茶米麻薯挞挞', 'Matcha Rice Mochi Tart', 'collection-09.jpg'],
        ['开心莓满拿破仑酥', 'Pistachio Berry Napoleon', 'collection-07.jpg'],
        ['玫瑰荔枝拿破仑酥', 'Rose Lychee Napoleon', 'collection-24.jpg']
      ]
    },
    {
      id: 'menu-creative',
      title: { zh: '创意甜品', en: 'Creative Desserts' },
      subtitle: { zh: '脑洞甜品，第一口就记住', en: 'Memorable ideas from the very first bite' },
      items: [
        ['迪拜糯曲奇', 'Dubai Mochi Cookie', 'collection-30.jpg']
      ]
    }
  ].map((group) => ({
    ...group,
    items: group.items.map(([zh, en, fileName]) => ({
      title: { zh, en },
      image: `${collectionImageBase}/${fileName}?v=${collectionImageVersion}`
    }))
  }));

  const instagramPosts = [
    {
      href: 'https://www.instagram.com/p/DalwPhMj4os/',
      image: 'assets/images/social/instagram-latest-20260709.jpg',
      date: '2026.07.09',
      title: { zh: '抹茶双重麻薯', en: 'Duo Mochi Matcha' }
    },
    {
      href: 'https://www.instagram.com/p/DadiTX8DyJr/',
      image: 'assets/images/social/instagram-latest-20260707.jpg',
      date: '2026.07.07',
      title: { zh: '接骨木花奇异果糯糯拿破仑酥', en: 'Elderflower Kiwi Mochi Mille-Feuille' }
    },
    {
      href: 'https://www.instagram.com/p/DZ29qH1D6yj/',
      image: 'assets/images/social/instagram-latest-20260621.jpg',
      date: '2026.06.21',
      title: { zh: '黑松露流心巴斯克', en: 'Black Truffle Lava Basque' }
    },
    {
      href: 'https://www.instagram.com/p/DZGBNk7D6LV/',
      image: 'assets/images/social/instagram-latest-20260602.jpg',
      date: '2026.06.02',
      title: { zh: '杀糕局', en: 'LA Cake-Off' }
    }
  ];

  const layerCards = [
    {
      no: 'No.01',
      zh: { title: 'Makkie 胖曲奇', sub: '招牌 stuffed cookie', foot: '外层松软酥香，里面是更轻一点的奶香和惊喜夹心。' },
      en: { title: 'Makkie Stuffed Cookie', sub: 'Signature stuffed cookie', foot: 'A soft buttery shell with a lighter creamy center and surprise filling.' },
      tags: {
        zh: ['双层饼壳', '轻奶油夹心', '招牌品牌款'],
        en: ['Double shell', 'Light cream center', 'Signature house style']
      }
    },
    {
      no: 'No.02',
      zh: { title: '戚风夹心', sub: '轻盈奶油夹心蛋糕', foot: '更像云朵一样的蛋糕体，中间是水果、布丁或奶皮子这些柔软层次。' },
      en: { title: 'Chiffon Sandwich', sub: 'Airy cream-filled cake', foot: 'Cloud-soft cake built around fruit, pudding, or milk-skin style fillings.' },
      tags: {
        zh: ['戚风蛋糕层', '水果或布丁夹心', '轻奶油收口'],
        en: ['Chiffon layers', 'Fruit or pudding core', 'Light cream finish']
      }
    },
    {
      no: 'No.03',
      zh: { title: '巴斯克蛋糕', sub: '焦香软心芝士蛋糕', foot: '顶部焦香，内里更绵密；很多味道会再叠一层流心、冻层或东方风味。' },
      en: { title: 'Basque Cheesecake', sub: 'Burnt-top soft-centered cheesecake', foot: 'Burnt top, creamy center, often layered with jelly, lava, or other extra flavor accents.' },
      tags: {
        zh: ['焦顶', '绵密中心', '常带二次层次'],
        en: ['Burnt top', 'Creamy center', 'Often layered again']
      }
    },
    {
      no: 'No.04',
      zh: { title: '米布丁', sub: '冷藏系柔软甜品', foot: '米粒、奶冻和水果会一起出现，口感更安静、细腻，也更适合夏天。' },
      en: { title: 'Rice Pudding', sub: 'Chilled soft dessert', foot: 'Rice pearls, panna cotta, and fruit combine into a calm, delicate chilled dessert.' },
      tags: {
        zh: ['冷藏口感', '米粒层次', '水果搭配'],
        en: ['Chilled texture', 'Rice pearls', 'Fruit pairing']
      }
    },
    {
      no: 'No.05',
      zh: { title: '酥皮与挞挞', sub: '偏酥、偏轻、带一点糯', foot: '会在酥脆和软糯之间找平衡，让入口不是只有酥，而是更有节奏。' },
      en: { title: 'Pastry & Tart', sub: 'Flaky, light, with a little chew', foot: 'Designed to balance crisp pastry with softer, chewier inner textures.' },
      tags: {
        zh: ['酥皮层', '轻盈奶香', '糯感补位'],
        en: ['Flaky pastry', 'Light dairy notes', 'Chewy contrast']
      }
    },
    {
      no: 'No.06',
      zh: { title: '创意甜品', sub: '第一口就能记住的味道', foot: '更自由的脑洞组合，会把熟悉食材重新拼成新的结构和记忆点。' },
      en: { title: 'Creative Desserts', sub: 'Memorable from the first bite', foot: 'Freer combinations that rebuild familiar ingredients into unexpected new structures.' },
      tags: {
        zh: ['脑洞组合', '熟悉食材再设计', '记忆点强'],
        en: ['Unexpected combos', 'Reworked familiar ingredients', 'High memorability']
      }
    }
  ];

  const layerShowcaseCards = [
    {
      no: 'No.01',
      zh: { title: 'Makkie 胖曲奇', sub: '招牌胖曲奇', footHtml: '招牌饼干夹心 · 轻奶油<br>简洁层次造型' },
      en: { title: 'MakkieMua Stuffed Cookie', sub: 'Signature stuffed cookie', footHtml: 'Signature cookie sandwich · light cream<br>Clean lines · layered bite' },
      tags: {
        zh: ['双层饼干', '轻奶油夹心', '招牌品牌款'],
        en: ['Double cookie layers', 'Light cream filling', 'Signature house style']
      }
    },
    {
      no: 'No.02',
      zh: { title: '戚风三明治', sub: '轻盈夹心蛋糕', footHtml: '戚风蛋糕 · 新鲜水果<br>轻盈奶油 · 手工现切' },
      en: { title: 'Chiffon Sandwich', sub: 'Airy cream-filled cake', footHtml: 'Chiffon cake · fresh fruit<br>Light cream · hand-finished' },
      tags: {
        zh: ['戚风蛋糕层', '鲜水果 · 轻奶油', '戚风底层'],
        en: ['Chiffon cake top', 'Fresh fruit · light cream', 'Chiffon cake base']
      }
    },
    {
      no: 'No.03',
      zh: { title: '巴斯克芝士蛋糕', sub: '焦香软心芝士蛋糕', footHtml: '重芝士 · 烤焦顶 · 软心<br>干花点缀 · 高品质动物奶油' },
      en: { title: 'Basque Cheesecake', sub: 'Burnt-top soft-centered cheesecake', footHtml: 'Rich cheesecake · burnt top · molten center<br>Dried florals · premium dairy cream' },
      tags: {
        zh: ['炭烤焦顶', '浓郁芝士体'],
        en: ['Burnt top', 'Dense cheesecake center']
      }
    },
    {
      no: 'No.04',
      zh: { title: '米布丁', sub: '', footHtml: '牛奶<br>奶油 · 米粒布丁' },
      en: { title: 'Rice Pudding', sub: '', footHtml: 'Milk<br>Cream · rice pudding pearls' },
      tags: {
        zh: ['新鲜水果', '大米米布丁·慕斯'],
        en: ['Fresh fruit', 'Rice pudding · mousse']
      }
    },
    {
      no: 'No.05',
      zh: { title: '酥皮挞挞', sub: '酥香挞类', footHtml: '千层酥饼 · 厚奶油<br>糖霜 · 入口即化' },
      en: { title: 'Tart', sub: 'Flaky cream tart', footHtml: 'Puff pastry shell · thick cream<br>Royal icing · melts on the tongue' },
      tags: {
        zh: ['麻薯 · 风味奶油', '蛋挞芯', '酥皮底饼'],
        en: ['Mochi · flavored cream', 'Egg tart center', 'Pastry base']
      }
    },
    {
      no: 'No.06',
      zh: { title: '迪拜糯曲奇', sub: '迪拜风味糯曲奇', footHtml: '糯糯外壳 · 碎丝内核<br>开心果酱 · 迪拜风味' },
      en: { title: 'Dubai Kunafa Cookie', sub: 'Dubai-inspired mochi cookie', footHtml: 'Chewy shell · shredded filling<br>Pistachio spread · Dubai-inspired flavor' },
      tags: {
        zh: ['棉花糖球体', '卡达伊夫碎丝', '软软外壳'],
        en: ['Cottony shell', 'Kunafa filling', 'Soft outer layer']
      }
    }
  ];

  const layerSceneTemplates = [
    {
      sceneStyle: 'width:220px;height:200px;',
      stackStyle: 'width:220px;height:200px;',
      parts: `
        <div class="layers-showcase-part" style="width:154px;height:58px;top:8px;transform:translateX(-50%) translateZ(5px);"><svg viewBox="0 0 154 58" fill="none" style="width:100%;height:100%;filter:drop-shadow(0 4px 12px rgba(80,50,20,.16))"><path d="M18 28 Q18 10 36 10 L118 10 Q136 10 136 28 L136 58 L18 58 Z" fill="#DDB777"/><path d="M18 28 Q18 10 36 10 L118 10 Q136 10 136 28" stroke="#BF9150" stroke-width="1.2" fill="none" opacity=".45"/><circle cx="40" cy="23" r="1.6" fill="#B7894D"/><circle cx="62" cy="19" r="1.6" fill="#B7894D"/><circle cx="78" cy="24" r="1.6" fill="#B7894D"/><circle cx="99" cy="20" r="1.6" fill="#B7894D"/><circle cx="114" cy="26" r="1.6" fill="#B7894D"/></svg></div>
        <div class="layers-showcase-part" style="width:154px;height:52px;top:50px;transform:translateX(-50%) translateZ(3px);"><svg viewBox="0 0 154 52" fill="none" style="width:100%;height:100%;"><path d="M18 22 C26 10 34 8 42 20 C50 8 58 8 66 20 C74 8 82 8 90 20 C98 8 106 8 114 20 C122 8 130 8 136 18" stroke="#F8EEE2" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M20 30 C28 18 36 16 44 28 C52 16 60 16 68 28 C76 16 84 16 92 28 C100 16 108 16 116 28 C124 16 132 18 136 24" stroke="#FFF7EF" stroke-width="10" stroke-linecap="round" fill="none" opacity=".9"/></svg></div>
        <div class="layers-showcase-part" style="width:154px;height:64px;top:86px;transform:translateX(-50%) translateZ(0px);"><svg viewBox="0 0 154 64" fill="none" style="width:100%;height:100%;filter:drop-shadow(0 7px 18px rgba(80,40,10,.18))"><path d="M18 0 Q18 18 36 18 L118 18 Q136 18 136 0 L136 50 Q136 62 124 62 L30 62 Q18 62 18 50 Z" fill="#CFA661"/><path d="M18 0 Q18 18 36 18 L118 18 Q136 18 136 0" stroke="#B78743" stroke-width="1.2" fill="none" opacity=".4"/><circle cx="46" cy="33" r="1.6" fill="#B28244"/><circle cx="72" cy="28" r="1.6" fill="#B28244"/><circle cx="95" cy="36" r="1.6" fill="#B28244"/><circle cx="112" cy="30" r="1.6" fill="#B28244"/></svg></div>
      `,
      tags: ['top:18px;left:calc(50% + 108px);', 'top:58px;left:calc(50% + 108px);', 'top:102px;left:calc(50% + 108px);']
    },
    {
      sceneStyle: 'width:220px;height:200px;',
      stackStyle: 'width:220px;height:200px;',
      parts: `
        <div class="layers-showcase-part" style="width:200px;height:56px;top:10px;transform:translateX(-50%) translateZ(4px);"><svg viewBox="0 0 200 56" fill="none" style="width:100%;height:100%;filter:drop-shadow(0 3px 10px rgba(100,60,10,.2))"><path d="M8 28 Q8 8 28 8 L172 8 Q192 8 192 28 L192 56 L8 56 Z" fill="#D4B07A"/><path d="M8 28 Q8 8 28 8 L172 8 Q192 8 192 28" stroke="#B89050" stroke-width="1.2" fill="none" opacity=".4"/><line x1="30" y1="20" x2="55" y2="20" stroke="#C4A060" stroke-width=".7" opacity=".4"/><line x1="70" y1="16" x2="110" y2="16" stroke="#C4A060" stroke-width=".7" opacity=".4"/><line x1="130" y1="18" x2="160" y2="18" stroke="#C4A060" stroke-width=".7" opacity=".4"/><rect x="8" y="46" width="184" height="10" rx="0" fill="#E8C880" opacity=".35"/></svg></div>
        <div class="layers-showcase-part" style="width:200px;height:36px;top:55px;transform:translateX(-50%) translateZ(3px);"><svg viewBox="0 0 200 36" fill="none" style="width:100%;height:100%;"><clipPath id="cf1"><rect x="8" y="0" width="184" height="36"/></clipPath><g clip-path="url(#cf1)"><rect x="8" y="14" width="184" height="22" fill="#F5EDD8"/><ellipse cx="40" cy="16" rx="14" ry="10" fill="#F0A030"/><ellipse cx="40" cy="16" rx="10" ry="7" fill="#F8B840"/><ellipse cx="68" cy="12" rx="12" ry="9" fill="#E89020"/><ellipse cx="68" cy="12" rx="8" ry="6" fill="#F8B840"/><ellipse cx="96" cy="16" rx="15" ry="10" fill="#F0A030"/><ellipse cx="96" cy="16" rx="10" ry="7" fill="#FFCA50"/><ellipse cx="124" cy="11" rx="13" ry="9" fill="#E89020"/><ellipse cx="124" cy="11" rx="9" ry="6" fill="#F8B840"/><ellipse cx="152" cy="15" rx="14" ry="10" fill="#F0A030"/><ellipse cx="152" cy="15" rx="9" ry="7" fill="#FFCA50"/><ellipse cx="178" cy="13" rx="10" ry="8" fill="#E89020"/></g></svg></div>
        <div class="layers-showcase-part" style="width:200px;height:48px;top:86px;transform:translateX(-50%) translateZ(0px);"><svg viewBox="0 0 200 48" fill="none" style="width:100%;height:100%;filter:drop-shadow(0 5px 14px rgba(80,40,10,.18))"><rect x="8" y="0" width="184" height="48" rx="4" fill="#C8A060"/><rect x="8" y="0" width="184" height="8" rx="2" fill="#E8C070" opacity=".4"/><rect x="8" y="0" width="184" height="48" rx="4" fill="none" stroke="#A87840" stroke-width="1.2"/></svg></div>
      `,
      tags: ['top:10px;left:calc(50% + 108px);', 'top:58px;left:calc(50% + 108px);', 'top:92px;left:calc(50% + 108px);']
    },
    {
      sceneStyle: 'width:220px;height:200px;',
      stackStyle: 'width:220px;height:200px;',
      parts: `
        <div class="layers-showcase-part" style="width:180px;height:36px;top:10px;transform:translateX(-50%) translateZ(4px);"><svg viewBox="0 0 180 36" fill="none" style="width:100%;height:100%;filter:drop-shadow(0 2px 8px rgba(60,30,10,.25))"><path d="M4 28 Q10 8 30 12 Q50 4 70 10 Q90 2 110 8 Q130 4 150 10 Q168 6 176 20 L176 36 L4 36 Z" fill="#5A3010"/><path d="M4 28 Q10 8 30 12 Q50 4 70 10 Q90 2 110 8 Q130 4 150 10 Q168 6 176 20" stroke="#7A4818" stroke-width=".8" fill="none" opacity=".5"/><ellipse cx="90" cy="18" rx="40" ry="6" fill="#3A1C08" opacity=".5"/><ellipse cx="50" cy="14" rx="18" ry="4" fill="#8A5828" opacity=".3"/><ellipse cx="140" cy="16" rx="16" ry="4" fill="#8A5828" opacity=".3"/></svg></div>
        <div class="layers-showcase-part" style="width:180px;height:80px;top:36px;transform:translateX(-50%) translateZ(2px);"><svg viewBox="0 0 180 80" fill="none" style="width:100%;height:100%;"><rect x="4" y="0" width="172" height="80" fill="#EDD8A8"/><rect x="4" y="0" width="172" height="30" fill="#F0DFB0" opacity=".7"/><circle cx="30" cy="20" r="3" fill="#D4BC88" opacity=".5"/><circle cx="60" cy="35" r="2.5" fill="#D4BC88" opacity=".5"/><circle cx="95" cy="18" r="3.5" fill="#D4BC88" opacity=".4"/><circle cx="125" cy="28" r="2.5" fill="#D4BC88" opacity=".5"/><circle cx="150" cy="15" r="3" fill="#D4BC88" opacity=".4"/><circle cx="45" cy="52" r="2" fill="#D4BC88" opacity=".4"/><circle cx="110" cy="55" r="2.5" fill="#D4BC88" opacity=".4"/><rect x="4" y="0" width="172" height="80" fill="none" stroke="#C4A860" stroke-width="1"/></svg></div>
        <div class="layers-showcase-part" style="width:180px;height:20px;top:112px;transform:translateX(-50%) translateZ(0);"><svg viewBox="0 0 180 20" fill="none" style="width:100%;height:100%;filter:drop-shadow(0 6px 16px rgba(80,40,10,.2))"><rect x="4" y="0" width="172" height="20" rx="2" fill="#8A5828"/><rect x="4" y="0" width="172" height="20" rx="2" fill="none" stroke="#6A3A18" stroke-width="1"/></svg></div>
        <div class="layers-showcase-part" style="width:60px;height:14px;top:18px;left:calc(50% - 18px);transform:translateX(-50%) translateZ(6px);"><svg viewBox="0 0 60 14" fill="none" style="width:100%;height:100%;"><ellipse cx="10" cy="7" rx="5" ry="3" fill="#8B6EA0" opacity=".7" transform="rotate(-20 10 7)"/><ellipse cx="22" cy="5" rx="5" ry="3" fill="#9B7EB0" opacity=".7" transform="rotate(10 22 5)"/><ellipse cx="34" cy="7" rx="5" ry="3" fill="#7B5E90" opacity=".7" transform="rotate(-10 34 7)"/><ellipse cx="46" cy="5" rx="5" ry="3" fill="#8B6EA0" opacity=".6" transform="rotate(20 46 5)"/></svg></div>
      `,
      tags: ['top:8px;left:calc(50% + 98px);', 'top:60px;left:calc(50% + 98px);', 'top:112px;left:calc(50% + 98px);']
    },
    {
      sceneStyle: 'width:220px;height:200px;',
      stackStyle: 'width:220px;height:200px;',
      parts: `
        <div class="layers-showcase-part" style="width:160px;height:70px;top:4px;transform:translateX(-50%) translateZ(6px);"><svg viewBox="0 0 160 70" fill="none" style="width:100%;height:100%;filter:drop-shadow(0 3px 10px rgba(100,60,20,.15))"><ellipse cx="80" cy="50" rx="70" ry="24" fill="#F5EEE2"/><ellipse cx="80" cy="44" rx="58" ry="22" fill="#FAF5EC"/><ellipse cx="80" cy="36" rx="46" ry="20" fill="#F5EEE2"/><ellipse cx="80" cy="26" rx="34" ry="16" fill="#FAF5EC"/><ellipse cx="80" cy="18" rx="22" ry="12" fill="#FFF9F2"/><ellipse cx="80" cy="10" rx="13" ry="9" fill="#fff"/><path d="M52 34 Q62 28 72 34" stroke="#E8DCC8" stroke-width="1" fill="none" opacity=".6"/><path d="M90 28 Q100 22 110 28" stroke="#E8DCC8" stroke-width="1" fill="none" opacity=".6"/></svg></div>
        <div class="layers-showcase-part" style="width:160px;height:100px;top:56px;transform:translateX(-50%) translateZ(2px);"><svg viewBox="0 0 160 100" fill="none" style="width:100%;height:100%;"><path d="M16 0 L144 0 L136 100 L24 100 Z" fill="#F0D8D8"/><path d="M20 20 L140 20 L133 100 L27 100 Z" fill="#E8C0C0"/><path d="M20 20 L140 20 L133 100 L27 100 Z" fill="none" stroke="#D4A0A0" stroke-width=".8"/><circle cx="50" cy="45" r="2.5" fill="#D8AAAA" opacity=".6"/><circle cx="70" cy="60" r="2" fill="#D8AAAA" opacity=".6"/><circle cx="90" cy="40" r="2.5" fill="#D8AAAA" opacity=".6"/><circle cx="110" cy="58" r="2" fill="#D8AAAA" opacity=".6"/><circle cx="60" cy="75" r="2" fill="#D8AAAA" opacity=".5"/><circle cx="100" cy="78" r="2.5" fill="#D8AAAA" opacity=".5"/><path d="M16 0 L144 0 L144 12 L16 12 Z" fill="#E8C8C8"/><path d="M16 0 L144 0 L136 100 L24 100 Z" fill="none" stroke="#C8A0A0" stroke-width="1.2"/></svg></div>
        <div class="layers-showcase-part" style="width:44px;height:44px;top:22px;left:calc(50% + 30px);transform:translateX(-50%) translateZ(8px);"><svg viewBox="0 0 44 44" fill="none" style="width:100%;height:100%;"><path d="M22 40 Q8 28 8 18 Q8 8 22 8 Q36 8 36 18 Q36 28 22 40Z" fill="#E03848"/><path d="M22 40 Q8 28 8 18 Q8 8 22 8 Q36 8 36 18 Q36 28 22 40Z" fill="none" stroke="#C02838" stroke-width="1"/><circle cx="16" cy="20" r="1.5" fill="#F05868" opacity=".7"/><circle cx="24" cy="25" r="1.5" fill="#F05868" opacity=".7"/><circle cx="20" cy="16" r="1" fill="#F05868" opacity=".6"/><path d="M18 8 Q22 2 26 8" stroke="#50A040" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg></div>
      `,
      tags: ['top:6px;left:calc(50% + 88px);', 'top:90px;left:calc(50% + 88px);']
    },
    {
      sceneStyle: 'width:220px;height:200px;',
      stackStyle: 'width:220px;height:200px;',
      parts: `
        <div class="layers-showcase-part" style="width:190px;height:60px;top:8px;transform:translateX(-50%) translateZ(5px);"><svg viewBox="0 0 190 60" fill="none" style="width:100%;height:100%;filter:drop-shadow(0 3px 10px rgba(100,60,10,.2))"><path d="M18 30 Q14 22 20 16 Q26 10 34 14 Q40 6 50 10 Q58 4 68 10 Q76 4 88 8 Q96 4 108 8 Q116 4 126 10 Q134 4 144 10 Q152 4 160 10 Q168 6 174 16 Q180 22 176 30 L176 60 L18 60 Z" fill="#D4AA72"/><path d="M18 30 Q14 22 20 16 Q26 10 34 14 Q40 6 50 10 Q58 4 68 10 Q76 4 88 8 Q96 4 108 8 Q116 4 126 10 Q134 4 144 10 Q152 4 160 10 Q168 6 174 16 Q180 22 176 30" stroke="#B89050" stroke-width="1" fill="none" opacity=".4"/><circle cx="60" cy="38" r="2.5" fill="#C4904A" opacity=".4"/><circle cx="95" cy="32" r="2" fill="#C4904A" opacity=".4"/><circle cx="130" cy="38" r="2.5" fill="#C4904A" opacity=".4"/><path d="M20 16 Q95 2 176 16" stroke="#EED090" stroke-width="2.5" fill="none" opacity=".3"/></svg></div>
        <div class="layers-showcase-part" style="width:190px;height:40px;top:60px;transform:translateX(-50%) translateZ(3px);"><svg viewBox="0 0 190 40" fill="none" style="width:100%;height:100%;"><rect x="14" y="0" width="162" height="40" fill="#F5EDD8"/><ellipse cx="50" cy="10" rx="16" ry="10" fill="#FAF0E0"/><ellipse cx="80" cy="8" rx="18" ry="11" fill="#FFF8EC"/><ellipse cx="110" cy="10" rx="17" ry="10" fill="#FAF0E0"/><ellipse cx="140" cy="8" rx="16" ry="11" fill="#FFF8EC"/></svg></div>
        <div class="layers-showcase-part" style="width:190px;height:50px;top:94px;transform:translateX(-50%) translateZ(0px);"><svg viewBox="0 0 190 50" fill="none" style="width:100%;height:100%;filter:drop-shadow(0 6px 18px rgba(80,40,10,.2))"><path d="M18 0 L176 0 L176 34 Q170 46 160 42 Q152 48 144 42 Q136 48 126 42 Q118 48 108 42 Q98 48 88 42 Q80 48 68 42 Q60 48 50 42 Q40 48 30 42 Q22 46 18 34 Z" fill="#C49858"/><path d="M18 0 L176 0 L176 34 Q170 46 160 42 Q152 48 144 42 Q136 48 126 42 Q118 48 108 42 Q98 48 88 42 Q80 48 68 42 Q60 48 50 42 Q40 48 30 42 Q22 46 18 34 Z" fill="none" stroke="#A07838" stroke-width="1.2"/><path d="M18 0 L176 0 L176 10 L18 10 Z" fill="#DDB870" opacity=".3"/></svg></div>
        <div class="layers-showcase-part" style="width:190px;height:10px;top:4px;transform:translateX(-50%) translateZ(7px);"><svg viewBox="0 0 190 10" fill="none" style="width:100%;height:100%;"><ellipse cx="45" cy="5" rx="8" ry="3" fill="#C47030" opacity=".4"/><ellipse cx="95" cy="4" rx="10" ry="3" fill="#C47030" opacity=".35"/><ellipse cx="145" cy="5" rx="8" ry="3" fill="#C47030" opacity=".4"/></svg></div>
      `,
      tags: ['top:8px;left:calc(50% + 103px);', 'top:65px;left:calc(50% + 103px);', 'top:100px;left:calc(50% + 103px);']
    },
    {
      sceneStyle: 'width:220px;height:200px;',
      stackStyle: 'width:220px;height:200px;',
      parts: `
        <div class="layers-showcase-part" style="width:150px;height:150px;top:10px;transform:translateX(-50%) translateZ(5px);"><svg viewBox="0 0 150 150" fill="none" style="width:100%;height:100%;filter:drop-shadow(0 4px 14px rgba(40,20,10,.3))"><circle cx="75" cy="75" r="68" fill="#3A1C08"/><circle cx="75" cy="75" r="68" fill="none" stroke="#2A1004" stroke-width="1"/><ellipse cx="55" cy="45" rx="20" ry="14" fill="#5A3018" opacity=".5"/><circle cx="40" cy="60" r="3" fill="#2A1004" opacity=".4"/><circle cx="100" cy="50" r="4" fill="#2A1004" opacity=".35"/><circle cx="60" cy="100" r="3" fill="#2A1004" opacity=".4"/><circle cx="110" cy="90" r="3.5" fill="#2A1004" opacity=".35"/><circle cx="75" cy="75" r="3" fill="#2A1004" opacity=".3"/><path d="M20 110 Q75 125 130 110" stroke="#E8DCC8" stroke-width="2" fill="none" opacity=".5"/></svg></div>
        <div class="layers-showcase-part" style="width:100px;height:50px;top:118px;transform:translateX(-50%) translateZ(2px);"><svg viewBox="0 0 100 50" fill="none" style="width:100%;height:100%;"><path d="M10 0 L90 0 L82 50 L18 50 Z" fill="#F0EAD8"/><path d="M10 0 L90 0 L82 50 L18 50 Z" fill="none" stroke="#D8CCAA" stroke-width="1"/><line x1="30" y1="0" x2="26" y2="50" stroke="#D8CCAA" stroke-width=".6" opacity=".5"/><line x1="50" y1="0" x2="50" y2="50" stroke="#D8CCAA" stroke-width=".6" opacity=".5"/><line x1="70" y1="0" x2="74" y2="50" stroke="#D8CCAA" stroke-width=".6" opacity=".5"/></svg></div>
        <div class="layers-showcase-part" style="width:60px;height:20px;top:30px;left:calc(50% + 10px);transform:translateX(-50%) translateZ(8px);"><svg viewBox="0 0 60 20" fill="none" style="width:100%;height:100%;"><ellipse cx="15" cy="10" rx="8" ry="5" fill="#5A8A3A" opacity=".85"/><ellipse cx="30" cy="8" rx="9" ry="5" fill="#4A7A2A" opacity=".85"/><ellipse cx="46" cy="11" rx="8" ry="5" fill="#5A8A3A" opacity=".8"/></svg></div>
        <div class="layers-showcase-part" style="width:150px;height:30px;top:56px;transform:translateX(-50%) translateZ(7px);"><svg viewBox="0 0 150 30" fill="none" style="width:100%;height:100%;"><path d="M10 15 Q30 5 50 15 Q70 25 90 15 Q110 5 130 15 Q140 20 145 15" stroke="#C49040" stroke-width="1.2" fill="none" opacity=".5"/><path d="M15 20 Q35 10 55 20 Q75 28 95 18 Q115 8 135 18" stroke="#D4A848" stroke-width="1" fill="none" opacity=".4"/><path d="M5 10 Q25 2 45 12 Q65 22 85 12 Q105 2 125 12 Q138 18 148 12" stroke="#C49040" stroke-width=".8" fill="none" opacity=".35"/></svg></div>
      `,
      tags: ['top:12px;left:calc(50% + 83px);', 'top:55px;left:calc(50% + 83px);', 'top:118px;left:calc(50% + 83px);']
    }
  ];

  const contactContent = {
    qrCards: [
      {
        key: 'wechat',
        label: { zh: '微信', en: 'WeChat' },
        value: 'Makkiemua',
        action: { zh: '扫码添加', en: 'Scan to Add' },
        qrImage: 'assets/images/qr/Makkie Wechat QR Code Clean.jpg'
      },
      {
        key: 'email',
        label: { zh: '邮箱', en: 'Email' },
        value: 'MakkieMua@gmail.com',
        action: { zh: '发送邮件', en: 'Send Email' },
        href: 'mailto:MakkieMua@gmail.com'
      },
      {
        key: 'phone',
        label: { zh: '电话', en: 'Phone' },
        value: '408-646-8740',
        action: { zh: '电话 / 短信', en: 'Call / Text' },
        href: 'tel:4086468740'
      }
    ]
  };
  const introContent = {
    kicker: { zh: 'Butter off with Makkie', en: 'Butter off with Makkie' },
    title: { zh: '你好, 这里是 Makkie', en: 'Hello, this is Makkie.' },
    lead: {
      zh: 'Makkie Mua 于 2024 年在美国旧金山创立，是一个全新的甜点品牌。',
      en: 'Founded in San Francisco in 2024, Makkie Mua is a new dessert brand built around handmade care and imaginative flavor.'
    },
    paragraphs: {
      zh: [
        '我们不仅致力于制作出美味的甜点，也希望把记忆里的香气、手作的温度，以及天马行空的创意，轻轻融入每一层口感之中。',
        '从 Makkie 胖曲奇、咸风三明治，到更具中式灵感的融合甜点，我们不断尝试，让熟悉的味道变得更加柔软、细腻，成为一份值得铭记的心意。'
      ],
      en: [
        'We care deeply about making desserts that taste beautiful, but also about carrying the scent of memory, the warmth of handmade work, and a sense of playful creativity into every layer.',
        'From Makkie stuffed cookies and savory chiffon sandwiches to fusion desserts inspired by Chinese flavors, we keep experimenting so familiar tastes can feel softer, finer, and more worth remembering.'
      ]
    },
    signature: {
      zh: ' - Makkie Mua',
      en: ' - Makkie Mua'
    }
  };

  let currentLang = 'zh';
  const gooeyParticleCount = 5;
  const gooeyAnimationVariance = 500;
  const gooeyRadiusFactor = 200;
  const gooeyBurstDuration = 1500;
  const navBurstNavigateDelay = 180;
  try {
    currentLang = localStorage.getItem(storageKey) === 'en' ? 'en' : 'zh';
  } catch (error) {
    currentLang = 'zh';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function t(value) {
    if (!value || typeof value !== 'object') return value || '';
    return currentLang === 'en' ? value.en : value.zh;
  }

  function renderActions() {
    if (!pageActions) return;
    const actions = (pageCopy[page] && pageCopy[page].actions) || [];
    pageActions.hidden = actions.length === 0;
    pageActions.innerHTML = actions.map((action) => `
      <a class="page-button ${action.style === 'dark' ? 'is-dark' : ''}" href="${escapeHtml(action.href)}" ${action.external ? 'target="_blank" rel="noreferrer"' : ''}>${escapeHtml(t(action))}</a>
    `).join('');
  }

  function renderNavAndFooter() {
    const copy = footerCopy[currentLang];
    const langSwitchMarkup = `
      <span class="lang-switch-track"><span class="lang-switch-thumb"></span></span>
      <span class="lang-switch-text"><span class="lang-switch-zh">中</span><span class="lang-switch-en">EN</span></span>
    `;

    if (iconLink) iconLink.setAttribute('href', 'assets/images/brand/Makkie_Original_Logo.png');
    document.querySelectorAll('.mobile-drawer-close, .menu-overlay-close').forEach((button) => {
      button.textContent = '×';
    });

    if (heroLinks) {
      heroLinks.innerHTML = pageLinks.map((link) => `
        <a href="${escapeHtml(link.url)}" class="btn-chip ${link.key === page ? 'is-active' : ''}" data-nav-link="${escapeHtml(link.key)}">
          ${escapeHtml(currentLang === 'en' ? link.en : link.zh)}
        </a>
      `).join('');
    }

    if (mobileDrawerLinks) {
      mobileDrawerLinks.innerHTML = `
        ${pageLinks.map((link) => `
          <a href="${escapeHtml(link.url)}" class="mobile-drawer-link" data-mobile-link="${escapeHtml(link.key)}">
            ${escapeHtml(currentLang === 'en' ? link.en : link.zh)}
          </a>
        `).join('')}
        <div class="mobile-drawer-switch-row">
          <span class="mobile-drawer-switch-label" id="mobileLangLabel">${escapeHtml(copy.mobileLang)}</span>
          <button class="mobile-drawer-lang ${currentLang === 'en' ? 'is-en' : ''}" type="button" data-mobile-lang aria-label="${escapeHtml(copy.toggleAria)}">
            ${langSwitchMarkup}
          </button>
        </div>
      `;
    }

    enhanceNavBurstTargets();

    if (langToggle) {
      langToggle.innerHTML = langSwitchMarkup;
      langToggle.classList.toggle('is-en', currentLang === 'en');
      langToggle.setAttribute('aria-label', copy.toggleAria);
    }

    const mobileLangControl = document.querySelector('[data-mobile-lang]');
    if (mobileLangControl) {
      mobileLangControl.classList.toggle('is-en', currentLang === 'en');
      mobileLangControl.setAttribute('aria-label', copy.toggleAria);
    }

    document.querySelectorAll('.nav-book').forEach((button) => {
      const label = button.querySelector('.nav-book-label');
      if (label) {
        label.textContent = copy.book;
      } else {
        button.textContent = copy.book;
      }
      button.setAttribute('aria-label', copy.book);
    });
    document.querySelectorAll('[data-profile-entry]').forEach((button) => {
      button.setAttribute('aria-label', copy.profile);
      button.setAttribute('title', copy.profile);
    });

    if (footerMenuTitle) footerMenuTitle.textContent = copy.title1;
    if (footerContactTitle) footerContactTitle.textContent = copy.title2;
    if (footerTag) footerTag.innerHTML = copy.tagline;
    if (footerCredit) footerCredit.textContent = copy.credit;
    if (footerLocation) footerLocation.textContent = copy.location;
    if (footerCopyText) footerCopyText.textContent = copy.copy;
    document.querySelectorAll('.ft-social-link[href="https://xhslink.com/m/2ohrymfwufZ"]').forEach((link) => {
      link.setAttribute('aria-label', currentLang === 'en' ? 'Rednote' : '小红书');
    });
    if (mobileDrawerFoot) mobileDrawerFoot.remove();
    if (footerContactSection) footerContactSection.hidden = false;

    if (footerMenu) {
      footerMenu.innerHTML = footerMenuLinks.map((link, index) => `
        <a href="${escapeHtml(link.url)}">${escapeHtml(copy.menu[index])}</a>
      `).join('');
    }

    if (footerContact) {
      footerContact.innerHTML = copy.contacts.map((entry) => `
        <a href="${escapeHtml(entry.href)}" ${entry.external ? 'target="_blank" rel="noreferrer"' : ''}>${escapeHtml(entry.label)}</a>
      `).join('');
    }
  }

  function renderCollectionPage() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    const openHint = currentLang === 'en' ? 'Open collection' : '点击展开';
    menuGrid.innerHTML = collectionGroups.map((group) => `
      <button class="menu-card" type="button" data-menu-target="${group.id}">
        <div class="menu-card-heading">
          <div class="menu-card-title">${escapeHtml(t(group.title))}</div>
          <div class="menu-card-sub">${escapeHtml(t(group.subtitle))}</div>
          <div class="menu-card-hint">${escapeHtml(openHint)}</div>
        </div>
      </button>
    `).join('');
  }

  function renderCollectionOverlay(targetId) {
    const overlay = document.getElementById('menuOverlay');
    const bodyEl = document.getElementById('menuOverlayBody');
    const group = collectionGroups.find((entry) => entry.id === targetId);
    if (!overlay || !bodyEl || !group) return;
    bodyEl.innerHTML = `
      <div class="menu-overlay-header">
        <div class="menu-card-title">${escapeHtml(t(group.title))}</div>
        <div class="menu-card-sub">${escapeHtml(t(group.subtitle))}</div>
      </div>
      <div class="menu-gallery">
        ${group.items.map((item) => `
          <article class="menu-dessert-card">
            <div class="menu-dessert-media">
              <img class="menu-dessert-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(t(item.title))}" loading="lazy">
            </div>
            <div class="menu-dessert-name">${escapeHtml(t(item.title))}</div>
          </article>
        `).join('')}
      </div>
    `;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeCollectionOverlay() {
    const overlay = document.getElementById('menuOverlay');
    const bodyEl = document.getElementById('menuOverlayBody');
    if (!overlay) return;
    overlay.hidden = true;
    if (bodyEl) bodyEl.innerHTML = '';
    document.body.style.overflow = '';
  }

  function renderLayersPage() {
    const grid = document.getElementById('layersGrid');
    if (!grid) return;
    grid.innerHTML = layerShowcaseCards.map((card, index) => {
      const scene = layerSceneTemplates[index];
      const tags = currentLang === 'en' ? card.tags.en : card.tags.zh;
      const copy = currentLang === 'en' ? card.en : card.zh;
      return `
        <article class="layers-showcase-card" data-layer-card tabindex="0">
          <div class="layers-showcase-eye">${escapeHtml(card.no)}</div>
          <div class="layers-showcase-name">${escapeHtml(copy.title)}</div>
          <div class="layers-showcase-sub">${escapeHtml(copy.sub)}</div>
          <div class="layers-showcase-scene">
            <div class="layers-showcase-stack-shell">
              <div class="layers-showcase-stack">
              ${scene.parts}
              ${tags.map((tag, tagIndex) => `<div class="layers-showcase-tag" style="${scene.tags[tagIndex] || ''}">${escapeHtml(tag)}</div>`).join('')}
              </div>
            </div>
          </div>
          <div class="layers-showcase-foot">${copy.footHtml}</div>
        </article>
      `;
    }).join('');
  }

  function activateLayerCard(card) {
    if (!card) return;
    document.querySelectorAll('[data-layer-card].is-active').forEach((activeCard) => {
      if (activeCard !== card) activeCard.classList.remove('is-active');
    });
    card.classList.toggle('is-active');
  }

  function renderInstagramPage() {
    const grid = document.getElementById('instagramGrid');
    const profileTag = document.getElementById('instagramProfileTag');
    const profileButton = document.getElementById('instagramProfileButton');
    if (profileTag) {
      profileTag.textContent = currentLang === 'en' ? 'Highlights from the public profile' : '公开主页作品精选';
    }
    if (profileButton) {
      profileButton.textContent = currentLang === 'en' ? 'View Profile' : '查看主页';
    }
    if (!grid) return;
    grid.innerHTML = instagramPosts.map((post) => `
      <a class="ig-card" href="${escapeHtml(post.href)}" target="_blank" rel="noreferrer">
        <img src="${escapeHtml(post.image)}" alt="${escapeHtml(t(post.title))}" loading="lazy">
        <div class="ig-card-body">
          <div class="ig-card-date">${escapeHtml(post.date)}</div>
          <div class="ig-card-title">${escapeHtml(t(post.title))}</div>
          <div class="ig-card-link">${escapeHtml(currentLang === 'en' ? 'Open full post' : '点开看完整帖子')}</div>
        </div>
      </a>
    `).join('');
  }

  function getContactIcon(key) {
    if (key === 'calendar') {
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 3v4"></path>
          <path d="M17 3v4"></path>
          <path d="M4 9h16"></path>
          <rect x="4" y="5" width="16" height="15" rx="3"></rect>
        </svg>
      `;
    }
    if (key === 'wechat') {
      return `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path fill="currentColor" d="M9.55 5.1c-3.92 0-7.05 2.67-7.05 6.03 0 1.82.94 3.46 2.53 4.56L4.4 19.4l3.42-1.74c.57.11 1.15.17 1.73.17 3.92 0 7.05-2.67 7.05-6.03 0-3.36-3.13-6.7-7.05-6.7Z"></path>
          <path fill="currentColor" d="M15.12 9.2c-3.27 0-5.88 2.16-5.88 4.92 0 2.75 2.61 4.85 5.88 4.85.46 0 .92-.04 1.37-.13l2.86 1.45-.42-2.82c1.37-.82 2.27-2.15 2.27-3.74 0-2.77-2.61-4.53-5.88-4.53Z" opacity=".92"></path>
          <circle cx="7.52" cy="11.08" r="1" fill="#FFF8F0"></circle>
          <circle cx="11.04" cy="11.08" r="1" fill="#FFF8F0"></circle>
          <circle cx="13.9" cy="13.88" r=".92" fill="#FFF8F0"></circle>
          <circle cx="17.02" cy="13.88" r=".92" fill="#FFF8F0"></circle>
        </svg>
      `;
    }
    if (key === 'email') {
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="3"></rect>
          <path d="M5 8l7 5 7-5"></path>
        </svg>
      `;
    }
    if (key === 'phone') {
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 3.18 2 2 0 0 1 4.11 1h2a2 2 0 0 1 2 1.72c.12.9.35 1.79.68 2.64a2 2 0 0 1-.45 2.11L7.1 8.91a16 16 0 0 0 8 8l1.44-1.24a2 2 0 0 1 2.11-.45c.85.33 1.74.56 2.64.68A2 2 0 0 1 22 16.92z"></path>
        </svg>
      `;
    }
    if (key === 'rednote') {
      return `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4.8" fill="#bc8450"></rect>
          <rect x="3.35" y="3.35" width="17.3" height="17.3" rx="4.45" stroke="#8e6136" stroke-width=".7"></rect>
          <text x="12" y="13.15" text-anchor="middle" fill="#fff8ee" font-size="4.25" font-family="'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif" font-weight="700">小红书</text>
        </svg>
      `;
    }
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5"></rect>
        <circle cx="12" cy="12" r="4.25"></circle>
        <circle cx="17.5" cy="6.5" r="1"></circle>
      </svg>
    `;
  }

  function renderContactPage() {
    const qrGrid = document.getElementById('contactQrGrid');

    if (qrGrid) {
      qrGrid.innerHTML = contactContent.qrCards.map((card) => `
        <article class="contact-qr-card ${card.image ? 'has-qr' : 'is-detail-card'}">
          <div class="contact-qr-card-side">
            <div class="contact-qr-icon">${getContactIcon(card.key)}</div>
            ${card.image ? `<div class="contact-qr-box">
              <img src="${escapeHtml(card.image)}" alt="${escapeHtml(t(card.label))} QR">
            </div>` : ''}
          </div>
          <div class="contact-qr-copy">
            <div class="contact-qr-copy-main">
              <div class="contact-qr-label">${escapeHtml(t(card.label))}</div>
              <div class="contact-qr-handle">${escapeHtml(card.value)}</div>
              ${card.note ? `<div class="contact-qr-note">${escapeHtml(t(card.note))}</div>` : ''}
            </div>
            ${card.qrImage
              ? `<button class="contact-qr-link" type="button" data-qr-open="${escapeHtml(card.qrImage)}" data-qr-label="${escapeHtml(t(card.label))}">${escapeHtml(t(card.action))}</button>`
              : card.href
                ? `<a class="contact-qr-link" href="${escapeHtml(card.href)}" ${card.external ? 'target="_blank" rel="noreferrer"' : ''}>${escapeHtml(t(card.action))}</a>`
                : `<span class="contact-qr-link is-static">${escapeHtml(t(card.action))}</span>`}
          </div>
        </article>
      `).join('');
    }
  }

  function renderIntroPage() {
    const kicker = document.getElementById('introKicker');
    const title = document.getElementById('introStoryTitle');
    const lead = document.getElementById('introLead');
    const bodyEl = document.getElementById('introBody');

    if (kicker) kicker.textContent = t(introContent.kicker);
    if (title) title.textContent = t(introContent.title);
    if (lead) lead.textContent = t(introContent.lead);
    if (bodyEl) {
      bodyEl.innerHTML = `
        ${introContent.paragraphs[currentLang].map((paragraph) => `
        <p>${escapeHtml(paragraph)}</p>
        `).join('')}
        <p class="story-signature"><em>${escapeHtml(t(introContent.signature))}</em></p>
      `;
    }
  }

  function applyLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'zh';
    body.dataset.lang = currentLang;
    document.documentElement.lang = currentLang;

    try {
      localStorage.setItem(storageKey, currentLang);
    } catch (error) {}

    const copy = pageCopy[page];
    if (copy) {
      document.title = copy.seo[currentLang].title;
      if (descriptionMeta) descriptionMeta.setAttribute('content', copy.seo[currentLang].description);
      if (pageEye) {
        const eyeText = t(copy.eye);
        pageEye.textContent = eyeText;
        pageEye.style.display = eyeText ? '' : 'none';
      }
      if (pageTitle) pageTitle.textContent = t(copy.title);
      if (pageSub) {
        const subText = t(copy.sub);
        pageSub.textContent = subText;
        pageSub.hidden = !subText;
      }
      renderActions();
    }

    renderNavAndFooter();
    renderCollectionPage();
    renderLayersPage();
    renderInstagramPage();
    renderContactPage();
    renderIntroPage();

    document.dispatchEvent(new CustomEvent('makkie:languagechange', {
      detail: { lang: currentLang }
    }));
  }

  function openDrawer() {
    if (!mobileDrawer) return;
    window.clearTimeout(drawerCloseTimer);
    mobileDrawer.hidden = false;
    requestAnimationFrame(() => {
      mobileDrawer.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    if (navMenuButton) {
      navMenuButton.classList.add('is-open');
      navMenuButton.setAttribute('aria-expanded', 'true');
    }
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    drawerCloseTimer = window.setTimeout(() => {
      mobileDrawer.hidden = true;
    }, 240);
    document.body.style.overflow = '';
    if (navMenuButton) {
      navMenuButton.classList.remove('is-open');
      navMenuButton.setAttribute('aria-expanded', 'false');
    }
  }

  function handleOrderEntry() {
    if (page === 'shop') {
      const anchor = document.getElementById('shopAnchor');
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.location.href = 'shop.html';
  }

  let qrPopOverlay = null;
  function openWeChatQr(src, label) {
    if (!src) return;
    if (!qrPopOverlay) {
      qrPopOverlay = document.createElement('div');
      qrPopOverlay.className = 'qr-pop-overlay';
      qrPopOverlay.innerHTML = `
        <div class="qr-pop-backdrop" data-qr-close></div>
        <div class="qr-pop-panel" role="dialog" aria-modal="true">
          <button class="qr-pop-close" type="button" data-qr-close aria-label="Close">&times;</button>
          <div class="qr-pop-label"></div>
          <div class="qr-pop-figure"><img class="qr-pop-img" alt=""></div>
          <div class="qr-pop-hint"></div>
        </div>`;
      document.body.appendChild(qrPopOverlay);
    }
    const img = qrPopOverlay.querySelector('.qr-pop-img');
    img.src = src;
    img.alt = (label || 'WeChat') + ' QR';
    qrPopOverlay.querySelector('.qr-pop-label').textContent = label || '';
    qrPopOverlay.querySelector('.qr-pop-hint').textContent = currentLang === 'en'
      ? 'Long-press the code to save it, or scan it in WeChat.'
      : '长按二维码保存，或用微信扫一扫添加。';
    qrPopOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeWeChatQr() {
    if (qrPopOverlay) qrPopOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function initEvents() {
    if (navMenuButton) {
      navMenuButton.addEventListener('click', () => {
        if (mobileDrawer && !mobileDrawer.hidden && mobileDrawer.classList.contains('is-open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    document.addEventListener('click', (event) => {
      const closeTrigger = event.target.closest('[data-mobile-drawer-close]');
      const mobileLink = event.target.closest('[data-mobile-link]');
      const mobileLang = event.target.closest('[data-mobile-lang]');
      const profileEntry = event.target.closest('[data-profile-entry]');
      const orderEntry = event.target.closest('[data-order-entry]');
      const menuTarget = event.target.closest('[data-menu-target]');
      const menuClose = event.target.closest('[data-menu-close]');
      const layerCard = event.target.closest('[data-layer-card]');
      const desktopLang = event.target.closest('#langToggle');
      const qrOpen = event.target.closest('[data-qr-open]');
      const qrClose = event.target.closest('[data-qr-close]');

      if (qrOpen) {
        openWeChatQr(qrOpen.dataset.qrOpen, qrOpen.dataset.qrLabel || '');
        return;
      }

      if (qrClose) {
        closeWeChatQr();
        return;
      }

      if (closeTrigger) {
        closeDrawer();
        return;
      }

      if (mobileLink) {
        closeDrawer();
        return;
      }

      if (desktopLang) {
        applyLanguage(currentLang === 'en' ? 'zh' : 'en');
        return;
      }

      if (mobileLang) {
        applyLanguage(currentLang === 'en' ? 'zh' : 'en');
        return;
      }

      if (profileEntry) {
        if (page === 'shop') {
          document.dispatchEvent(new CustomEvent('makkie:openprofile'));
        } else {
          window.location.href = 'shop.html';
        }
        return;
      }

      if (orderEntry) {
        handleOrderEntry();
        return;
      }

      if (layerCard) {
        activateLayerCard(layerCard);
        return;
      }

      if (menuTarget) {
        renderCollectionOverlay(menuTarget.dataset.menuTarget);
        return;
      }

      if (menuClose) {
        closeCollectionOverlay();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeDrawer();
        closeCollectionOverlay();
        closeWeChatQr();
        document.querySelectorAll('[data-layer-card].is-active').forEach((card) => card.classList.remove('is-active'));
      }
      if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('[data-layer-card]')) {
        event.preventDefault();
        activateLayerCard(event.target.closest('[data-layer-card]'));
      }
    });
  }

  function ensureGooeyFilter() {
    if (document.getElementById('makkie-gooey-filter')) return;
    const holder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    holder.setAttribute('aria-hidden', 'true');
    holder.setAttribute('width', '0');
    holder.setAttribute('height', '0');
    holder.style.position = 'absolute';
    holder.innerHTML = `
      <defs>
        <filter id="makkie-gooey-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"></feGaussianBlur>
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo"></feColorMatrix>
          <feBlend in="SourceGraphic" in2="goo"></feBlend>
        </filter>
      </defs>
    `;
    document.body.prepend(holder);
  }

  function enhanceNavBurstTargets() {
    const links = document.querySelectorAll('.hero-links .btn-chip, .mobile-drawer-link');
    if (!links.length) return;
    ensureGooeyFilter();

    links.forEach((link) => {
      if (!link.querySelector('.btn-chip-label')) {
        const label = document.createElement('span');
        label.className = 'btn-chip-label';
        label.textContent = link.textContent.trim();
        link.textContent = '';
        link.appendChild(label);
      }

      if (!link.querySelector('.btn-chip-goo')) {
        const goo = document.createElement('span');
        goo.className = 'btn-chip-goo';
        goo.setAttribute('aria-hidden', 'true');

        for (let index = 0; index < gooeyParticleCount; index += 1) {
          const particle = document.createElement('span');
          const angle = ((Math.PI * 2) / gooeyParticleCount) * index + (Math.PI / 7);
          const distance = (gooeyRadiusFactor / 10) + ((index % 2 === 0 ? 1 : -1) * 6) + (index * 3);
          const variance = Math.round((index / Math.max(gooeyParticleCount - 1, 1)) * gooeyAnimationVariance);
          const size = 10 + (index % 3) * 2;

          particle.className = 'btn-chip-particle';
          particle.style.setProperty('--particle-x', `${Math.cos(angle) * distance}px`);
          particle.style.setProperty('--particle-y', `${Math.sin(angle) * distance}px`);
          particle.style.setProperty('--particle-size', `${size}px`);
          particle.style.setProperty('--particle-variance', `${variance}ms`);
          goo.appendChild(particle);
        }

        link.appendChild(goo);
      }

      if (!link.dataset.gooeyBound) {
        const triggerBurst = () => {
          link.classList.remove('is-burst');
          void link.offsetWidth;
          link.classList.add('is-burst');
          window.clearTimeout(link.__gooeyBurstTimer);
          link.__gooeyBurstTimer = window.setTimeout(() => {
            link.classList.remove('is-burst');
          }, gooeyBurstDuration);
        };

        const navigateAfterBurst = () => {
          const href = link.getAttribute('href');
          if (!href || href === '#') return;
          window.setTimeout(() => {
            window.location.href = href;
          }, navBurstNavigateDelay);
        };

        link.addEventListener('click', (event) => {
          const href = link.getAttribute('href');
          const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
          const isExternalTarget = link.getAttribute('target') === '_blank';
          if (href && !isModified && !isExternalTarget) {
            event.preventDefault();
            triggerBurst();
            if (link.matches('.mobile-drawer-link')) closeDrawer();
            navigateAfterBurst();
            return;
          }
          triggerBurst();
        });

        link.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            triggerBurst();
            if (link.matches('.mobile-drawer-link')) closeDrawer();
            navigateAfterBurst();
          }
        });

        link.dataset.gooeyBound = 'true';
      }
    });
  }

  function initReveal() {
    const targets = Array.from(document.querySelectorAll('.reveal'));
    if (!targets.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    targets.forEach((item) => observer.observe(item));
  }

  window.MakkieSite = {
    applyLanguage,
    getLang: () => currentLang
  };

  initEvents();
  applyLanguage(currentLang);
  initReveal();

  // 与后台图鉴同步（仅图鉴页）：拉取 /api/collection，成功则覆盖硬编码并重渲染（失败保留兜底）。
  if (page === 'collection') {
    fetch('https://admin.makkiemua.com/api/collection', { credentials: 'omit' })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        const groups = payload && payload.data && Array.isArray(payload.data.groups) ? payload.data.groups : [];
        const mapped = groups.map((g, i) => ({
          id: 'cat-' + i,
          title: { zh: g.group || '', en: g.group || '' },
          subtitle: { zh: '', en: '' },
          items: (g.items || [])
            .map((it) => ({ title: { zh: it.name || '', en: it.name_en || it.name || '' }, image: it.image_url || '' }))
            .filter((it) => it.image)
        })).filter((g) => g.items.length);
        if (!mapped.length) return;
        collectionGroups = mapped;
        renderCollectionPage();
      })
      .catch(() => {});
  }
})();


