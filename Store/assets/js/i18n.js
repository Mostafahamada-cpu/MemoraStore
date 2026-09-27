/* ================================================================
   MEMORA — Lightweight i18n (English / Arabic + RTL)
   Usage:
     <span data-i18n="nav.wedding"></span>
     <input data-i18n-placeholder="form.namePlaceholder">
     MemoraI18n.t('common.orderNow')      -> string
     MemoraI18n.pick({ en: 'x', ar: 'y' }) -> localized value
     MemoraI18n.money(500)                 -> "EGP 500" / "500 ج.م"
   Include this file in <head> so the direction is set before paint.
   ================================================================ */
(function () {
  const STORAGE_KEY = 'memora-lang';
  const SUPPORTED = ['en', 'ar'];

  const dict = {
    en: {
      common: {
        egp: 'EGP',
        from: 'Starting from',
        fromShort: 'from',
        free: 'FREE',
        included: 'Included',
        orderNow: 'Order Now',
        viewDetails: 'View Details',
        viewInvitation: 'View Invitation',
        viewBundle: 'View Bundle',
        liveDemo: 'Live Demo',
        askWhatsApp: 'Ask on WhatsApp',
        requestQuote: 'Create Your Custom Invitation',
        oneTime: 'one-time',
        save: 'Save',
        youSave: 'You save',
        individually: 'Individually',
        bundlePrice: 'Bundle price',
        includes: 'Includes',
        bundleExclusive: 'Bundle exclusive',
        nfcIncluded: 'Love NFC Card included',
        designs: 'designs',
        chooseDesign: 'Choose your design',
        back: 'Back',
        continue: 'Continue',
        loading: 'Loading…',
        noProducts: 'No products available right now.',
        loadError: 'We could not load the catalog. Please refresh the page.',
        optional: '(optional)',
        badge: { premium: 'Premium', standard: 'Standard', bestseller: 'Bestseller', new: 'New', bestValue: 'Best Value', custom: 'Custom', bundle: 'Bundle', from: 'From' },
        langName: 'عربي',
        designsAvailable: 'Available designs',
        mostPremium: 'Most premium',
        includedIn: 'What you get',
        viewDemo: 'View Demo',
        viewDemos: 'View Demos',
        choose: 'Choose',
        order: 'Order',
        orderBundle: 'Order Bundle',
        details: 'Details',
        liveBadge: 'Live demo',
        opensNewTab: '(opens in a new tab)',
        designCount: '{n} designs',
        designCountOne: '1 design',
        previous: 'Previous',
        next: 'Next',
        all: 'All',
        alwaysIncluded: 'Always included',
        skip: 'Skip to content',
      },
      brand: { slogan: 'Where Your Story, Forever Remembered' },
      occasions: { wedding: 'Wedding', engagement: 'Engagement', henna: 'Henna', birthday: 'Birthday', 'gender-reveal': 'Gender Reveal', bachelorette: 'Bachelorette', date: 'Date', custom: 'Custom', bundle: 'Bundle' },
      nav: { home: 'Home', wedding: 'Wedding', moments: 'Other Occasions', occasions: 'Occasions', categories: 'Browse by occasion', bundles: 'Bundles', pricing: 'Pricing', addons: 'Add-ons', faq: 'FAQ', startOrder: 'Start Order', backToStore: 'Back to Store', menu: 'Menu', main: 'Main' },
      hero: {
        badge: 'Premium Digital Invitations',
        title1: 'Your Love Story,',
        title2: 'Beautifully Digital',
        description: 'Premium invitation websites for weddings, engagements, henna nights and every moment in between. Handcrafted designs, instant delivery, lifetime access.',
        explore: 'Explore Designs',
        start: 'Start Your Order',
        titleA: 'Digital invitations',
        titleB: 'for every moment you celebrate',
        lead: 'Personalised invitation websites your guests open on any phone — with your names, date, venue and a live countdown. Add music, photos or RSVP whenever you like.',
        ctaExplore: 'Explore Invitations',
        ctaDemos: 'View Live Demos',
        occasionsLabel: 'Invitations for',
        proof1: 'English & Arabic',
        proof2: 'Designed for phones',
        proof3: 'One link to share',
        from: 'Invitations from',
        tagCountdown: 'Live countdown',
        tagLocation: 'Venue & map',
        tagRsvp: 'RSVP replies',
        visualLabel: 'Examples of Memora invitations on a phone',
      },
      demos: {
        eyebrow: 'See them live',
        title: 'Live Invitation Demos',
        sub: 'Open any invitation exactly as your guests will see it — then choose your favourite.',
        flow1: 'See the invitation',
        flow2: 'Choose the design',
        flow3: 'Customize',
        flow4: 'Order',
        flowLabel: 'How ordering works',
        filterLabel: 'Filter demos by occasion',
        empty: 'No live demos available right now.',
      },
      pricing: {
        eyebrow: 'Transparent pricing',
        title: 'Simple Pricing, No Surprises',
        sub: 'Your final price is the base invitation plus only the add-ons you choose.',
        eqBase: 'Base invitation',
        eqAddons: 'Optional add-ons',
        eqTotal: 'Your final price',
        step1Title: 'Choose your base invitation',
        step1Sub: 'Location and a live countdown are always included.',
        step2Title: 'Add only what you love',
        step2Sub: 'Tick any add-on to see your total update.',
        totalLabel: 'Estimated total',
        startThis: 'Start this order',
        exactNote: 'You’ll see the exact total again before checkout.',
        customRow: 'Want something completely different?',
        customLink: 'Request a custom quote',
        addonsLabel: 'Add-ons',
      },
      how: {
        eyebrow: 'How it works',
        title: 'Your Invitation in Three Simple Steps',
        sub: 'No apps and no design skills needed — we take care of the details.',
        s1Title: 'Choose',
        s1Text: 'Browse the live demos and pick your invitation or bundle.',
        s2Title: 'Customize',
        s2Text: 'Pick your colours and add-ons, then send us your details, photos and preferences.',
        s3Title: 'Receive & Share',
        s3Text: 'We prepare your invitation and send you a preview. Once you approve it, share one link with all your guests.',
        note: 'Pay with InstaPay · Confirm your order on WhatsApp',
      },
      why: {
        eyebrow: 'Why Memora',
        title: 'Made to Be Remembered',
        sub: 'Everything you need for an invitation your guests will love.',
        w1Title: 'Fully Personalised', w1Text: 'Your names, details and colours — plus your photos, music and story with add-ons.',
        w2Title: 'Mobile & Desktop', w2Text: 'Designed mobile-first to look beautiful on phones, tablets and desktops.',
        w3Title: 'Effortless Setup', w3Text: 'No complicated setup — send your details and we build and publish it for you.',
        w4Title: 'Lifetime Access', w4Text: 'Your invitation stays online after the event, as a keepsake of your day.',
        w5Title: 'Easy Sharing', w5Text: 'One link to share on WhatsApp, Instagram or anywhere — guests open it instantly.',
        w6Title: 'Real Support', w6Text: 'Talk to a real person on WhatsApp, before and after delivery.',
      },
      home: {
        weddingSub: 'Choose Standard or Premium, then pick the design you love. Every design has a live demo.',
        weddingNote: 'Every wedding invitation includes your event details, venue location and a live countdown.',
        weddingNoteLink: 'See optional add-ons',
        momentsEyebrow: 'Every celebration',
        momentsTitle: 'Invitations for Every Occasion',
        momentsSub: 'Elegant invitations for every celebration along the way — preview them live, then make them yours.',
        bundlesEyebrow: 'Bundles',
        bundlesTitle: 'Planning More Than One Moment?',
        bundlesSub: 'Build your celebration bundle — combine invitations in one order and see exactly what’s included.',
        customNote: 'The final price depends on the sections, animations and complexity you request.',
        faqEyebrow: 'Good to know',
        ctaTitle: 'Your Story Deserves More Than a Message.',
        ctaSub: 'Create your invitation and make every detail part of the memory.',
        footerExplore: 'Explore',
      },
      sections: {
        weddingEyebrow: 'Our signature collection',
        customEyebrow: 'Bespoke service',
        weddingTitle: 'Wedding Invitations',
        weddingSub: 'Our flagship invitation websites. Choose Standard or Premium, then the design you love.',
        momentsTitle: 'Other Occasions',
        momentsSub: 'Elegant digital invitations for engagements, henna nights, birthdays and more.',
        bundlesTitle: 'Bundles',
        bundlesSub: 'Combine invitations and get a better price on the total.',
        pricingTitle: 'Price List',
        pricingSub: 'Simple, transparent pricing. Pick a base invitation, then add only the extras you want.',
        baseTitle: 'Base Invitations',
        baseSub: 'The price of the invitation itself. Location and countdown are always included.',
        addonsTitle: 'Optional Add-ons',
        addonsSub: 'Add any of these to any invitation. Free items are included at no cost.',
        customTitle: 'Custom Invitation',
        customSub: 'Tell us what you imagine. We’ll build it around your story.',
        customNote: '800 EGP is the starting price. The final price depends on the sections, animations and complexity you request.',
        faqTitle: 'Frequently Asked Questions',
        faqSub: 'Find answers to common questions about our invitations and services',
        ctaTitle: 'Ready to Create Your Invitation?',
        ctaSub: 'Choose an invitation, customise it with add-ons, and we will bring it to life.',
        ctaExplore: 'Explore More',
        relatedTitle: 'You Might Also Like',
      },
      faq: {
        groupInvitation: 'The invitation',
        groupAddons: 'Add-ons',
        groupOrdering: 'Ordering & delivery',
        q1: 'How do I customise my invitation?',
        a1: 'After you order, we personalise names, dates, colours, location and any add-ons you selected. You review it before it goes live — no coding needed.',
        q2: 'What is included with the invitation?',
        a2: 'Every invitation includes your chosen design, your event details, the venue location with a map link and a live countdown — personalised for you and ready for every phone. Music, gallery, our story, RSVP and animations are optional add-ons with clear prices.',
        q3: 'Do I keep access after the event?',
        a3: 'Yes. You get lifetime access — your invitation stays online after the event as a keepsake of your day. Updates and fixes are included at no extra cost.',
        q4: 'What payment methods do you accept?',
        a4: 'We currently accept InstaPay. After payment, send your payment screenshot via WhatsApp and our team will activate your order.',
        qPhotos: 'Can I use my own photos?',
        aPhotos: 'Yes. After you order, send us your photos on WhatsApp. To show them in a dedicated photo gallery section, add the Gallery add-on<span data-addon-price="gallery"></span>.',
        qColours: 'Can I change the colours?',
        aColours: 'Yes. Choose a colour palette in the order form, or pick “Custom / Not sure” and tell us the colours you have in mind.',
        qChanges: 'Can I request changes?',
        aChanges: 'Yes. You review a preview before your invitation goes live and can ask us to adjust your details. Updates and fixes are included at no extra cost.',
        qSpeed: 'How fast will I receive my invitation?',
        aSpeed: 'We start as soon as your order is confirmed on WhatsApp and agree the delivery time with you there — it depends on the design and add-ons you choose. You always see a preview before it goes live.',
        qPhones: 'Does it work on phones?',
        aPhones: 'Yes. Every invitation is designed mobile-first and works on phones, tablets and desktops. Guests just tap the link — there’s no app to download.',
        qLanguage: 'Can my invitation be in Arabic?',
        aLanguage: 'Yes. Choose English, Arabic or both in the order form.',
        qMusic: 'Can I add music?',
        aMusic: 'Yes. Add Music<span data-addon-price="music"></span> and share the link to your song in the order form — it plays on your invitation.',
        qRsvp: 'Can I add RSVP?',
        aRsvp: 'Yes. With the RSVP add-on<span data-addon-price="rsvp"></span>, guests confirm their attendance online and you can track the replies.',
        qGallery: 'Can I add a gallery?',
        aGallery: 'Yes. The Gallery add-on<span data-addon-price="gallery"></span> adds a photo gallery section for your favourite moments.',
        qStory: 'Can I add our own story?',
        aStory: 'Yes. The Our Story add-on<span data-addon-price="our-story"></span> adds a dedicated section that tells your story.',
        qShare: 'Can I share it on WhatsApp?',
        aShare: 'Of course. Your invitation is a website link — share it on WhatsApp, Instagram, by text message or anywhere else, and guests open it instantly.',
      },
      footer: {
        tagline: 'Premium digital invitations for weddings and every moment worth celebrating.',
        products: 'Products',
        support: 'Support',
        connect: 'Connect',
        contact: 'Contact Us',
        whatsapp: 'WhatsApp',
        rights: '© 2026 Memora. All rights reserved. Made with 💍 for love.',
      },
      product: {
        notFound: 'Product not found',
        backHome: 'Back to Store',
        oneTimePurchase: 'one-time purchase',
        perks: '✓ Lifetime access • ✓ Future updates • ✓ WhatsApp support',
        includedTitle: "What's Included",
        includedProducts: 'Included in this bundle',
        bundleOnlyNote: 'The Love NFC Card is not sold on its own. It is included exclusively in the Engagement and Wedding bundles below.',
        availableIn: 'Available in these bundles',
        viewBundles: 'View Bundles',
        availableAddons: 'Optional add-ons for this invitation',
        addonsNote: 'Add-ons are selected in the order form. Prices are added to the base price.',
        designsTitle: 'Available designs',
        customPricingNote: 'Final price is quoted after we review your request.',
        readyTitle: 'Ready to Order?',
        readySub: 'Complete a short order form and we will take it from there.',
        browseMore: 'Browse More',
        perk1Title: 'Professional Design', perk1Text: 'Carefully crafted by our design team with modern aesthetics',
        perk2Title: 'Fully Responsive', perk2Text: 'Works perfectly on all devices: desktop, tablet, and mobile',
        perk3Title: 'Smooth Animations', perk3Text: 'Beautiful transitions and interactive elements',
        perk4Title: 'Personalised for You', perk4Text: 'Names, dates, colours and content set up by our team',
        perk5Title: 'WhatsApp Support', perk5Text: 'Fast support from a real person, before and after delivery',
        perk6Title: 'Lifetime Access', perk6Text: 'Your invitation stays online, with free updates',
      },
      order: {
        title: 'Create Your Order',
        subtitle: 'Build your invitation in a few thoughtful steps.',
        step1: 'Invitation', step2: 'Customize', step3: 'Your details', step4: 'Event details', step5: 'Review',
        chooseInvitation: 'Choose your invitation',
        chooseInvitationIntro: 'Select the invitation you want, or open its live demo before choosing.',
        chooseDesignIntro: 'This invitation comes in more than one design. Pick your favourite.',
        continueShopping: 'Continue shopping',
        customizeTitle: 'Customize your invitation',
        customizeIntro: 'Choose a colour palette and any add-ons you would like.',
        paletteTitle: 'Colour palette',
        addonsTitle: 'Add-ons',
        addonsIntro: 'Location and countdown are always included. Add extras below.',
        fromNote: 'Starting price — final price confirmed on WhatsApp.',
        selectedPalette: 'Selected colour palette',
        choosePalette: 'Choose a palette',
        yourInfo: 'Your information',
        yourInfoIntro: 'We’ll use these details to keep you updated.',
        fullName: 'Full name', email: 'Email', phone: 'WhatsApp number', language: 'Invitation language',
        langEnglish: 'English', langArabic: 'Arabic', langBoth: 'Arabic & English', langOther: 'Other',
        eventTitle: 'Event details',
        eventIntro: 'A few details will help make the invitation yours.',
        eventDate: 'Event date', venue: 'Venue', venuePlaceholder: 'Location or venue name',
        musicLink: 'Music link', musicPlaceholder: 'Spotify, YouTube, etc.',
        specialRequests: 'Special requests', specialPlaceholder: 'Tell us any special requests or preferences...',
        reviewTitle: 'Review your order',
        reviewIntro: 'Everything looks good? Agree to the terms and continue to checkout.',
        clientInfo: 'Client information', invitationColors: 'Invitation & colours', eventInfo: 'Event', priceBreakdown: 'Price breakdown',
        invitation: 'Invitation', design: 'Design', colors: 'Colours', addons: 'Add-ons', none: 'None', total: 'Total',
        agree: 'I agree to the Terms of Service and Privacy Policy.',
        proceed: 'Proceed to checkout',
        edit: 'Edit',
        errSelect: 'Please select an invitation.',
        errDesign: 'Please choose a design.',
        errPalette: 'Please choose a colour palette.',
        errRequired: 'Please complete the required fields.',
        errInvalid: 'Please check the highlighted field.',
        draftSaved: 'Draft saved',
        draftRestored: 'Your saved draft has been restored.',
        customHint: 'Looking for something fully custom?',
        customLink: 'Request a custom invitation',
        venueTbc: 'Venue to be confirmed',
        names: {
          wedding: ['Bride name', 'Groom name'],
          engagement: ['Bride name', 'Groom name'],
          henna: ['Bride name', 'Groom name'],
          bachelorette: ['Bride name', 'Organiser name'],
          'gender-reveal': ['Parents’ names', 'Baby nickname (optional)'],
          birthday: ['Celebrant name', 'Age or occasion (optional)'],
          date: ['Your name', 'Partner’s name'],
          default: ['Name', 'Second name (optional)'],
        },
        palettes: { gold: 'Gold & Ivory', rose: 'Rose & Blush', emerald: 'Emerald & Gold', navy: 'Navy & Gold', custom: 'Custom / Not sure' },
      },
      checkout: {
        title: 'Checkout',
        subtitle: 'Review your order and complete payment via InstaPay',
        customerInfo: 'Customer Information', eventDetails: 'Event Details', yourOrder: 'Your Order',
        product: 'Product:', category: 'Category:', design: 'Design:', addons: 'Add-ons:',
        colorPreference: 'Colour Preference', eventNames: 'Names',
        terms: 'I agree to the Terms of Service, Privacy Policy, and Refund Policy',
        summary: 'Order Summary', subtotal: 'Subtotal:', addonsTotal: 'Add-ons:', total: 'Total:',
        instapayTitle: 'Payment via InstaPay', amountRequired: 'Amount Required:', payInstapay: 'Pay with InstaPay',
        confirmWhatsApp: 'Confirm via WhatsApp', backToForm: 'Back to Form',
        processing: 'Processing your order...', processingSub: 'Please wait, we’re saving your details',
        loadingOrder: 'Loading order...', qty: 'Qty: 1',
        errTerms: 'Please agree to the terms and conditions',
        errNoOrder: '⚠️ No order data found. Please fill out the order form first.',
        errProduct: '⚠️ Product not found. Please go back and select a product.',
        unknownProduct: 'Unknown product', goBack: 'Please go back and select a product',
        notConfigured: '⚠️ Payment system not configured. Opening WhatsApp anyway.',
        savedLocal: '✅ Order saved locally. Opening WhatsApp...',
        saved: '✅ Order saved successfully! Opening WhatsApp...',
        savedButFailed: '⚠️ Saved locally, but the server failed: {error}',
        fromNote: 'Includes a starting price for custom animation — final amount confirmed on WhatsApp.',
      },
      custom: {
        title: 'Request a Custom Invitation',
        subtitle: 'Tell us about your event and the experience you imagine. Starting from 800 EGP — we quote the final price after reviewing your request.',
        eventSection: 'Your event',
        eventType: 'Event type', eventTypePlaceholder: 'Wedding, engagement, birthday, corporate…',
        eventDate: 'Event date', eventNames: 'Names on the invitation', eventNamesPlaceholder: 'e.g. Sara & Omar',
        styleSection: 'Style & design',
        style: 'Preferred style / design', stylePlaceholder: 'Minimal, luxury, floral, modern, vintage… links to inspiration are welcome',
        colors: 'Colours', colorsPlaceholder: 'e.g. ivory & gold, dusty rose, navy',
        language: 'Invitation language',
        featuresSection: 'Sections & features',
        featuresIntro: 'Tick everything you want included. Add-on prices are listed for reference — the final quote covers everything.',
        specialSections: 'Any special sections?', specialPlaceholder: 'Timeline, dress code, gift registry, guest book, quiz…',
        customAnimation: 'Custom animation ideas', customAnimationPlaceholder: 'Describe the animation you imagine (e.g. petals falling, envelope opening)',
        requirements: 'Additional requirements', requirementsPlaceholder: 'Anything else we should know',
        contactSection: 'Contact details',
        name: 'Your name', whatsapp: 'WhatsApp number', email: 'Email',
        agree: 'I understand that 800 EGP is the starting price and the final price depends on the requested complexity.',
        submit: 'Send Request via WhatsApp',
        sending: 'Sending your request…',
        errRequired: 'Please fill in the required fields.',
        errAgree: 'Please confirm you understand the starting price.',
        saved: '✅ Request saved! Opening WhatsApp...',
        savedLocal: '✅ Request ready. Opening WhatsApp...',
        startingPrice: 'Starting from',
        whatsappIntro: 'Hello Memora Team 👋\nI would like to request a custom invitation.',
      },
      thanks: {
        title: 'Thank You!',
        customText: 'Your custom invitation request has been received. We will review it and reply on WhatsApp with a quote.',
        orderText: 'Your order has been received. We will confirm your payment on WhatsApp and start working on your invitation.',
        nextTitle: "What's Next?",
        next1: 'We review your request and reply on WhatsApp',
        next2: 'You confirm the details and the final price',
        next3: 'We design your invitation and share a preview',
        next4: 'You approve it and share it with your guests',
        help: 'Need help? Message us on WhatsApp anytime.',
        home: 'Back to Home',
        whatsapp: 'Open WhatsApp',
      },
    },
    ar: {
      common: {
        egp: 'ج.م',
        from: 'يبدأ من',
        fromShort: 'من',
        free: 'مجاناً',
        included: 'مشمول',
        orderNow: 'اطلب الآن',
        viewDetails: 'عرض التفاصيل',
        viewInvitation: 'عرض الدعوة',
        viewBundle: 'عرض الباقة',
        liveDemo: 'معاينة مباشرة',
        askWhatsApp: 'اسألنا على واتساب',
        requestQuote: 'أنشئ دعوتك المخصصة',
        oneTime: 'دفعة واحدة',
        save: 'وفّر',
        youSave: 'توفّر',
        individually: 'بشكل منفصل',
        bundlePrice: 'سعر الباقة',
        includes: 'تشمل',
        bundleExclusive: 'حصرياً ضمن الباقات',
        nfcIncluded: 'بطاقة Love NFC مشمولة',
        designs: 'تصاميم',
        chooseDesign: 'اختر تصميمك',
        back: 'رجوع',
        continue: 'متابعة',
        loading: 'جارٍ التحميل…',
        noProducts: 'لا توجد منتجات متاحة حالياً.',
        loadError: 'تعذّر تحميل الكتالوج. يرجى تحديث الصفحة.',
        optional: '(اختياري)',
        badge: { premium: 'بريميوم', standard: 'ستاندرد', bestseller: 'الأكثر مبيعاً', new: 'جديد', bestValue: 'أفضل قيمة', custom: 'مخصص', bundle: 'باقة', from: 'يبدأ من' },
        langName: 'English',
        designsAvailable: 'التصاميم المتاحة',
        mostPremium: 'الأكثر فخامة',
        includedIn: 'ما ستحصل عليه',
        viewDemo: 'شاهد المعاينة',
        viewDemos: 'شاهد المعاينات',
        choose: 'اختر',
        order: 'اطلب',
        orderBundle: 'اطلب الباقة',
        details: 'التفاصيل',
        liveBadge: 'معاينة مباشرة',
        opensNewTab: '(تفتح في نافذة جديدة)',
        designCount: '{n} تصاميم',
        designCountOne: 'تصميم واحد',
        previous: 'السابق',
        next: 'التالي',
        all: 'الكل',
        alwaysIncluded: 'مشمول دائماً',
        skip: 'تخطَّ إلى المحتوى',
      },
      brand: { slogan: 'حيث تبقى قصتكم في الذاكرة إلى الأبد' },
      occasions: { wedding: 'زفاف', engagement: 'خطوبة', henna: 'حنة', birthday: 'عيد ميلاد', 'gender-reveal': 'كشف نوع المولود', bachelorette: 'سهرة العروسة', date: 'موعد رومانسي', custom: 'تصميم خاص', bundle: 'باقة' },
      nav: { home: 'الرئيسية', wedding: 'الزفاف', moments: 'مناسبات أخرى', occasions: 'المناسبات', categories: 'تصفح حسب المناسبة', bundles: 'الباقات', pricing: 'الأسعار', addons: 'الإضافات', faq: 'الأسئلة الشائعة', startOrder: 'ابدأ طلبك', backToStore: 'العودة للمتجر', menu: 'القائمة', main: 'الرئيسية' },
      hero: {
        badge: 'دعوات رقمية فاخرة',
        title1: 'قصة حبكم،',
        title2: 'بشكل رقمي أنيق',
        description: 'مواقع دعوات فاخرة لحفلات الزفاف والخطوبة والحنة وكل مناسبة بينها. تصاميم مصنوعة بعناية، تسليم فوري، ووصول مدى الحياة.',
        explore: 'استكشف التصاميم',
        start: 'ابدأ طلبك',
        titleA: 'دعوات رقمية فاخرة',
        titleB: 'لكل لحظة تحتفلون بها',
        lead: 'مواقع دعوات مخصصة لكم يفتحها ضيوفكم من أي هاتف — بأسمائكم وموعدكم ومكان الحفل وعدٍّ تنازلي مباشر. وأضيفوا الموسيقى والصور وتأكيد الحضور متى شئتم.',
        ctaExplore: 'استكشف الدعوات',
        ctaDemos: 'شاهد المعاينات المباشرة',
        occasionsLabel: 'دعوات لـ',
        proof1: 'بالعربية والإنجليزية',
        proof2: 'مصممة للهواتف',
        proof3: 'رابط واحد للمشاركة',
        from: 'دعوات تبدأ من',
        tagCountdown: 'عد تنازلي مباشر',
        tagLocation: 'المكان والخريطة',
        tagRsvp: 'ردود تأكيد الحضور',
        visualLabel: 'أمثلة على دعوات ميمورا على الهاتف',
      },
      demos: {
        eyebrow: 'شاهدوها مباشرة',
        title: 'معاينات مباشرة للدعوات',
        sub: 'افتحوا أي دعوة تماماً كما سيراها ضيوفكم — ثم اختاروا المفضلة لديكم.',
        flow1: 'شاهد الدعوة',
        flow2: 'اختر التصميم',
        flow3: 'خصّصها',
        flow4: 'اطلبها',
        flowLabel: 'خطوات الطلب',
        filterLabel: 'تصفية المعاينات حسب المناسبة',
        empty: 'لا توجد معاينات متاحة حالياً.',
      },
      pricing: {
        eyebrow: 'أسعار واضحة',
        title: 'أسعار بسيطة بلا مفاجآت',
        sub: 'السعر النهائي هو سعر الدعوة الأساسية مضافاً إليه فقط الإضافات التي تختارونها.',
        eqBase: 'الدعوة الأساسية',
        eqAddons: 'إضافات اختيارية',
        eqTotal: 'سعركم النهائي',
        step1Title: 'اختاروا الدعوة الأساسية',
        step1Sub: 'الموقع والعد التنازلي المباشر مشمولان دائماً.',
        step2Title: 'أضيفوا ما تحبونه فقط',
        step2Sub: 'حددوا أي إضافة لتروا الإجمالي يتحدث مباشرة.',
        totalLabel: 'الإجمالي التقديري',
        startThis: 'ابدأ هذا الطلب',
        exactNote: 'سترون الإجمالي الدقيق مرة أخرى قبل الدفع.',
        customRow: 'تريدون شيئاً مختلفاً تماماً؟',
        customLink: 'اطلبوا عرض سعر لتصميم خاص',
        addonsLabel: 'الإضافات',
      },
      how: {
        eyebrow: 'كيف تعمل',
        title: 'دعوتكم في ثلاث خطوات بسيطة',
        sub: 'بدون تطبيقات أو خبرة في التصميم — نحن نهتم بكل التفاصيل.',
        s1Title: 'اختاروا',
        s1Text: 'تصفحوا المعاينات المباشرة واختاروا دعوتكم أو باقتكم.',
        s2Title: 'خصّصوا',
        s2Text: 'اختاروا الألوان والإضافات، ثم أرسلوا لنا بياناتكم وصوركم وتفضيلاتكم.',
        s3Title: 'استلموا وشاركوا',
        s3Text: 'نجهز دعوتكم ونرسل لكم معاينة، وبعد موافقتكم شاركوا رابطاً واحداً مع كل ضيوفكم.',
        note: 'ادفعوا عبر إنستاباي · وأكدوا طلبكم عبر واتساب',
      },
      why: {
        eyebrow: 'لماذا ميمورا',
        title: 'صُممت لتبقى في الذاكرة',
        sub: 'كل ما تحتاجونه لدعوة يحبها ضيوفكم.',
        w1Title: 'مخصصة بالكامل', w1Text: 'أسماؤكم وتفاصيلكم وألوانكم — مع صوركم وموسيقاكم وقصتكم عبر الإضافات.',
        w2Title: 'للهاتف والكمبيوتر', w2Text: 'مصممة للهاتف أولاً لتبدو رائعة على الهواتف والتابلت والكمبيوتر.',
        w3Title: 'بدون أي تعقيد', w3Text: 'بدون إعدادات معقدة — أرسلوا بياناتكم ونحن نصممها وننشرها لكم.',
        w4Title: 'وصول مدى الحياة', w4Text: 'تبقى دعوتكم متاحة بعد المناسبة كذكرى جميلة ليومكم.',
        w5Title: 'مشاركة سهلة', w5Text: 'رابط واحد للمشاركة على واتساب وإنستجرام وأي مكان — يفتحه الضيوف فوراً.',
        w6Title: 'دعم حقيقي', w6Text: 'تحدثوا مع شخص حقيقي عبر واتساب قبل التسليم وبعده.',
      },
      home: {
        weddingSub: 'اختاروا ستاندرد أو بريميوم، ثم التصميم الذي تحبونه. لكل تصميم معاينة مباشرة.',
        weddingNote: 'كل دعوة زفاف تشمل تفاصيل المناسبة وموقع الحفل وعداً تنازلياً مباشراً.',
        weddingNoteLink: 'شاهد الإضافات الاختيارية',
        momentsEyebrow: 'لكل احتفال',
        momentsTitle: 'دعوات لكل مناسبة',
        momentsSub: 'دعوات أنيقة لكل احتفال في رحلتكم — شاهدوها مباشرة ثم اجعلوها خاصة بكم.',
        bundlesEyebrow: 'الباقات',
        bundlesTitle: 'تخططون لأكثر من مناسبة؟',
        bundlesSub: 'اصنعوا باقة احتفالكم — اجمعوا الدعوات في طلب واحد واعرفوا بالضبط ما تشمله.',
        customNote: 'السعر النهائي يعتمد على الأقسام والأنيميشن ومستوى التعقيد المطلوب.',
        faqEyebrow: 'معلومات تهمكم',
        ctaTitle: 'قصتكم تستحق أكثر من مجرد رسالة.',
        ctaSub: 'أنشئوا دعوتكم واجعلوا كل تفصيلة جزءاً من الذكرى.',
        footerExplore: 'استكشف',
      },
      sections: {
        weddingEyebrow: 'مجموعتنا المميزة',
        customEyebrow: 'خدمة حسب الطلب',
        weddingTitle: 'دعوات الزفاف',
        weddingSub: 'مواقع الدعوة الأساسية لدينا. اختر ستاندرد أو بريميوم، ثم التصميم الذي تحبه.',
        momentsTitle: 'مناسبات أخرى',
        momentsSub: 'دعوات رقمية أنيقة للخطوبة وليلة الحنة وأعياد الميلاد والمزيد.',
        bundlesTitle: 'الباقات',
        bundlesSub: 'اجمع بين الدعوات واحصل على سعر أفضل للإجمالي.',
        pricingTitle: 'قائمة الأسعار',
        pricingSub: 'أسعار بسيطة وواضحة. اختر الدعوة الأساسية ثم أضف فقط الإضافات التي تريدها.',
        baseTitle: 'الدعوات الأساسية',
        baseSub: 'سعر الدعوة نفسها. الموقع والعد التنازلي مشمولان دائماً.',
        addonsTitle: 'إضافات اختيارية',
        addonsSub: 'أضف أياً منها إلى أي دعوة. العناصر المجانية مشمولة بدون تكلفة.',
        customTitle: 'دعوة مخصصة',
        customSub: 'أخبرنا بما تتخيله، ونحن نبنيه حول قصتك.',
        customNote: '800 ج.م هو السعر المبدئي. السعر النهائي يعتمد على الأقسام والأنيميشن ومستوى التعقيد المطلوب.',
        faqTitle: 'الأسئلة الشائعة',
        faqSub: 'إجابات عن الأسئلة الشائعة حول دعواتنا وخدماتنا',
        ctaTitle: 'جاهزون لإنشاء دعوتكم؟',
        ctaSub: 'اختاروا الدعوة، خصصوها بالإضافات، ونحن نحوّلها إلى واقع.',
        ctaExplore: 'استكشف المزيد',
        relatedTitle: 'قد يعجبك أيضاً',
      },
      faq: {
        groupInvitation: 'الدعوة',
        groupAddons: 'الإضافات',
        groupOrdering: 'الطلب والتسليم',
        q1: 'كيف أخصص دعوتي؟',
        a1: 'بعد الطلب نقوم بتخصيص الأسماء والتواريخ والألوان والموقع وأي إضافات اخترتها. تراجعها قبل نشرها — بدون أي برمجة.',
        q2: 'ماذا تشمل الدعوة؟',
        a2: 'كل دعوة تشمل التصميم الذي تختارونه، وتفاصيل مناسبتكم، وموقع الحفل مع رابط الخريطة، وعداً تنازلياً مباشراً — مخصصة لكم وجاهزة لكل الهواتف. الموسيقى ومعرض الصور وقصتنا وتأكيد الحضور والأنيميشن إضافات اختيارية بأسعار واضحة.',
        q3: 'هل تبقى الدعوة متاحة بعد المناسبة؟',
        a3: 'نعم. تحصلون على وصول مدى الحياة — تبقى دعوتكم متاحة بعد المناسبة كذكرى ليومكم. التحديثات والإصلاحات مشمولة بدون تكلفة إضافية.',
        q4: 'ما طرق الدفع المتاحة؟',
        a4: 'نقبل حالياً الدفع عبر إنستاباي. بعد الدفع أرسل صورة الإيصال عبر واتساب وسيقوم فريقنا بتفعيل طلبك.',
        qPhotos: 'هل يمكنني استخدام صوري الخاصة؟',
        aPhotos: 'نعم. بعد الطلب أرسلوا لنا صوركم عبر واتساب. ولعرضها في قسم خاص لمعرض الصور أضيفوا إضافة معرض الصور<span data-addon-price="gallery"></span>.',
        qColours: 'هل يمكنني تغيير الألوان؟',
        aColours: 'نعم. اختاروا لوحة الألوان في نموذج الطلب، أو اختاروا "مخصص / غير متأكد" وأخبرونا بالألوان التي تفضلونها.',
        qChanges: 'هل يمكنني طلب تعديلات؟',
        aChanges: 'نعم. تراجعون معاينة قبل نشر الدعوة ويمكنكم طلب تعديل بياناتكم. التحديثات والإصلاحات مشمولة بدون تكلفة إضافية.',
        qSpeed: 'متى أستلم دعوتي؟',
        aSpeed: 'نبدأ فور تأكيد طلبكم عبر واتساب ونتفق معكم هناك على موعد التسليم — ويعتمد ذلك على التصميم والإضافات التي تختارونها. وتشاهدون دائماً معاينة قبل النشر.',
        qPhones: 'هل تعمل الدعوة على الهواتف؟',
        aPhones: 'نعم. كل دعوة مصممة للهاتف أولاً وتعمل على الهواتف والتابلت والكمبيوتر. يكفي أن يضغط الضيوف على الرابط — بدون تحميل أي تطبيق.',
        qLanguage: 'هل يمكن أن تكون دعوتي بالعربية؟',
        aLanguage: 'نعم. اختاروا العربية أو الإنجليزية أو الاثنتين معاً في نموذج الطلب.',
        qMusic: 'هل يمكنني إضافة موسيقى؟',
        aMusic: 'نعم. أضيفوا الموسيقى<span data-addon-price="music"></span> وشاركوا رابط الأغنية في نموذج الطلب — وستعمل داخل دعوتكم.',
        qRsvp: 'هل يمكنني إضافة تأكيد الحضور؟',
        aRsvp: 'نعم. مع إضافة تأكيد الحضور<span data-addon-price="rsvp"></span> يؤكد الضيوف حضورهم أونلاين وتتابعون الردود.',
        qGallery: 'هل يمكنني إضافة معرض صور؟',
        aGallery: 'نعم. إضافة معرض الصور<span data-addon-price="gallery"></span> تضيف قسماً لأجمل لحظاتكم.',
        qStory: 'هل يمكنني إضافة قصتنا؟',
        aStory: 'نعم. إضافة "قصتنا"<span data-addon-price="our-story"></span> تضيف قسماً خاصاً يروي قصتكم.',
        qShare: 'هل يمكنني مشاركتها عبر واتساب؟',
        aShare: 'بالتأكيد. دعوتكم عبارة عن رابط موقع — شاركوه عبر واتساب أو إنستجرام أو رسالة نصية أو أي مكان آخر، ويفتحه الضيوف فوراً.',
      },
      footer: {
        tagline: 'دعوات رقمية فاخرة لحفلات الزفاف ولكل لحظة تستحق الاحتفال.',
        products: 'المنتجات',
        support: 'الدعم',
        connect: 'تواصل معنا',
        contact: 'اتصل بنا',
        whatsapp: 'واتساب',
        rights: '© 2026 ميمورا. جميع الحقوق محفوظة. صُنع بحب 💍',
      },
      product: {
        notFound: 'المنتج غير موجود',
        backHome: 'العودة للمتجر',
        oneTimePurchase: 'دفعة واحدة',
        perks: '✓ وصول مدى الحياة • ✓ تحديثات مستقبلية • ✓ دعم عبر واتساب',
        includedTitle: 'ما الذي ستحصل عليه',
        includedProducts: 'ما تشمله هذه الباقة',
        bundleOnlyNote: 'بطاقة Love NFC لا تُباع بشكل منفصل، وهي متاحة حصرياً ضمن باقات الخطوبة والزفاف أدناه.',
        availableIn: 'متاحة ضمن هذه الباقات',
        viewBundles: 'عرض الباقات',
        availableAddons: 'إضافات اختيارية لهذه الدعوة',
        addonsNote: 'يتم اختيار الإضافات في نموذج الطلب، وتُضاف أسعارها إلى السعر الأساسي.',
        designsTitle: 'التصاميم المتاحة',
        customPricingNote: 'يُحدد السعر النهائي بعد مراجعة طلبك.',
        readyTitle: 'جاهز للطلب؟',
        readySub: 'أكمل نموذج طلب قصير ونحن نتولى الباقي.',
        browseMore: 'تصفح المزيد',
        perk1Title: 'تصميم احترافي', perk1Text: 'مصمم بعناية من فريقنا بلمسة عصرية',
        perk2Title: 'متجاوب بالكامل', perk2Text: 'يعمل بشكل مثالي على الكمبيوتر والتابلت والموبايل',
        perk3Title: 'أنيميشن سلس', perk3Text: 'انتقالات جميلة وعناصر تفاعلية',
        perk4Title: 'مخصص لكم', perk4Text: 'الأسماء والتواريخ والألوان والمحتوى يجهزها فريقنا',
        perk5Title: 'دعم عبر واتساب', perk5Text: 'دعم سريع من شخص حقيقي قبل التسليم وبعده',
        perk6Title: 'وصول مدى الحياة', perk6Text: 'تبقى دعوتك متاحة أونلاين مع تحديثات مجانية',
      },
      order: {
        title: 'أنشئ طلبك',
        subtitle: 'جهّز دعوتك في خطوات بسيطة.',
        step1: 'الدعوة', step2: 'التخصيص', step3: 'بياناتك', step4: 'تفاصيل المناسبة', step5: 'المراجعة',
        chooseInvitation: 'اختر دعوتك',
        chooseInvitationIntro: 'اختر الدعوة التي تريدها، أو افتح المعاينة المباشرة قبل الاختيار.',
        chooseDesignIntro: 'هذه الدعوة متاحة بأكثر من تصميم. اختر المفضل لديك.',
        continueShopping: 'متابعة التسوق',
        customizeTitle: 'خصص دعوتك',
        customizeIntro: 'اختر لوحة الألوان وأي إضافات تريدها.',
        paletteTitle: 'لوحة الألوان',
        addonsTitle: 'الإضافات',
        addonsIntro: 'الموقع والعد التنازلي مشمولان دائماً. أضف المزيد أدناه.',
        fromNote: 'سعر مبدئي — يُؤكد السعر النهائي على واتساب.',
        selectedPalette: 'لوحة الألوان المختارة',
        choosePalette: 'اختر لوحة ألوان',
        yourInfo: 'بياناتك',
        yourInfoIntro: 'سنستخدم هذه البيانات لإبقائك على اطلاع.',
        fullName: 'الاسم الكامل', email: 'البريد الإلكتروني', phone: 'رقم الواتساب', language: 'لغة الدعوة',
        langEnglish: 'الإنجليزية', langArabic: 'العربية', langBoth: 'العربية والإنجليزية', langOther: 'أخرى',
        eventTitle: 'تفاصيل المناسبة',
        eventIntro: 'بعض التفاصيل تساعدنا في جعل الدعوة خاصة بك.',
        eventDate: 'تاريخ المناسبة', venue: 'المكان', venuePlaceholder: 'اسم المكان أو الموقع',
        musicLink: 'رابط الموسيقى', musicPlaceholder: 'سبوتيفاي، يوتيوب، إلخ',
        specialRequests: 'طلبات خاصة', specialPlaceholder: 'أخبرنا بأي طلبات أو تفضيلات خاصة...',
        reviewTitle: 'راجع طلبك',
        reviewIntro: 'كل شيء جيد؟ وافق على الشروط وتابع إلى الدفع.',
        clientInfo: 'بيانات العميل', invitationColors: 'الدعوة والألوان', eventInfo: 'المناسبة', priceBreakdown: 'تفاصيل السعر',
        invitation: 'الدعوة', design: 'التصميم', colors: 'الألوان', addons: 'الإضافات', none: 'لا يوجد', total: 'الإجمالي',
        agree: 'أوافق على شروط الخدمة وسياسة الخصوصية.',
        proceed: 'المتابعة إلى الدفع',
        edit: 'تعديل',
        errSelect: 'يرجى اختيار دعوة.',
        errDesign: 'يرجى اختيار تصميم.',
        errPalette: 'يرجى اختيار لوحة ألوان.',
        errRequired: 'يرجى إكمال الحقول المطلوبة.',
        errInvalid: 'يرجى التحقق من الحقل المحدد.',
        draftSaved: 'تم حفظ المسودة',
        draftRestored: 'تمت استعادة مسودتك المحفوظة.',
        customHint: 'تبحث عن شيء مخصص بالكامل؟',
        customLink: 'اطلب دعوة مخصصة',
        venueTbc: 'المكان سيتم تأكيده',
        names: {
          wedding: ['اسم العروس', 'اسم العريس'],
          engagement: ['اسم العروس', 'اسم العريس'],
          henna: ['اسم العروس', 'اسم العريس'],
          bachelorette: ['اسم العروس', 'اسم المنظِّمة'],
          'gender-reveal': ['أسماء الوالدين', 'اسم الدلع للمولود (اختياري)'],
          birthday: ['اسم صاحب/ة العيد', 'العمر أو المناسبة (اختياري)'],
          date: ['اسمك', 'اسم شريكك'],
          default: ['الاسم', 'اسم ثانٍ (اختياري)'],
        },
        palettes: { gold: 'ذهبي وعاجي', rose: 'وردي وبلاش', emerald: 'زمردي وذهبي', navy: 'كحلي وذهبي', custom: 'مخصص / غير متأكد' },
      },
      checkout: {
        title: 'إتمام الطلب',
        subtitle: 'راجع طلبك وأكمل الدفع عبر إنستاباي',
        customerInfo: 'بيانات العميل', eventDetails: 'تفاصيل المناسبة', yourOrder: 'طلبك',
        product: 'المنتج:', category: 'الفئة:', design: 'التصميم:', addons: 'الإضافات:',
        colorPreference: 'تفضيل الألوان', eventNames: 'الأسماء',
        terms: 'أوافق على شروط الخدمة وسياسة الخصوصية وسياسة الاسترجاع',
        summary: 'ملخص الطلب', subtotal: 'المجموع الفرعي:', addonsTotal: 'الإضافات:', total: 'الإجمالي:',
        instapayTitle: 'الدفع عبر إنستاباي', amountRequired: 'المبلغ المطلوب:', payInstapay: 'ادفع عبر إنستاباي',
        confirmWhatsApp: 'تأكيد عبر واتساب', backToForm: 'العودة للنموذج',
        processing: 'جارٍ معالجة طلبك...', processingSub: 'يرجى الانتظار، نقوم بحفظ بياناتك',
        loadingOrder: 'جارٍ تحميل الطلب...', qty: 'الكمية: 1',
        errTerms: 'يرجى الموافقة على الشروط والأحكام',
        errNoOrder: '⚠️ لا توجد بيانات طلب. يرجى تعبئة نموذج الطلب أولاً.',
        errProduct: '⚠️ المنتج غير موجود. يرجى الرجوع واختيار منتج.',
        unknownProduct: 'منتج غير معروف', goBack: 'يرجى الرجوع واختيار منتج',
        notConfigured: '⚠️ نظام الدفع غير مهيأ. سيتم فتح واتساب على أي حال.',
        savedLocal: '✅ تم حفظ الطلب محلياً. جارٍ فتح واتساب...',
        saved: '✅ تم حفظ الطلب بنجاح! جارٍ فتح واتساب...',
        savedButFailed: '⚠️ تم الحفظ محلياً، لكن الخادم فشل: {error}',
        fromNote: 'يشمل سعراً مبدئياً للأنيميشن المخصص — يُؤكد المبلغ النهائي على واتساب.',
      },
      custom: {
        title: 'اطلب دعوة مخصصة',
        subtitle: 'أخبرنا عن مناسبتك والتجربة التي تتخيلها. يبدأ السعر من 800 ج.م — ونحدد السعر النهائي بعد مراجعة طلبك.',
        eventSection: 'مناسبتك',
        eventType: 'نوع المناسبة', eventTypePlaceholder: 'زفاف، خطوبة، عيد ميلاد، فعالية شركة…',
        eventDate: 'تاريخ المناسبة', eventNames: 'الأسماء على الدعوة', eventNamesPlaceholder: 'مثال: سارة وعمر',
        styleSection: 'الأسلوب والتصميم',
        style: 'الأسلوب / التصميم المفضل', stylePlaceholder: 'بسيط، فاخر، زهور، عصري، كلاسيكي… يمكنك إضافة روابط للإلهام',
        colors: 'الألوان', colorsPlaceholder: 'مثال: عاجي وذهبي، وردي، كحلي',
        language: 'لغة الدعوة',
        featuresSection: 'الأقسام والمميزات',
        featuresIntro: 'حدد كل ما تريد تضمينه. أسعار الإضافات للمرجع فقط — عرض السعر النهائي يشمل كل شيء.',
        specialSections: 'أقسام خاصة؟', specialPlaceholder: 'جدول زمني، دريس كود، قائمة هدايا، دفتر الضيوف، اختبار…',
        customAnimation: 'أفكار الأنيميشن المخصص', customAnimationPlaceholder: 'صف الأنيميشن الذي تتخيله (مثال: تساقط بتلات، فتح ظرف)',
        requirements: 'متطلبات إضافية', requirementsPlaceholder: 'أي شيء آخر يجب أن نعرفه',
        contactSection: 'بيانات التواصل',
        name: 'اسمك', whatsapp: 'رقم الواتساب', email: 'البريد الإلكتروني',
        agree: 'أفهم أن 800 ج.م هو السعر المبدئي وأن السعر النهائي يعتمد على مستوى التعقيد المطلوب.',
        submit: 'أرسل الطلب عبر واتساب',
        sending: 'جارٍ إرسال طلبك…',
        errRequired: 'يرجى تعبئة الحقول المطلوبة.',
        errAgree: 'يرجى تأكيد فهمك للسعر المبدئي.',
        saved: '✅ تم حفظ الطلب! جارٍ فتح واتساب...',
        savedLocal: '✅ الطلب جاهز. جارٍ فتح واتساب...',
        startingPrice: 'يبدأ من',
        whatsappIntro: 'مرحباً فريق ميمورا 👋\nأرغب في طلب دعوة مخصصة.',
      },
      thanks: {
        title: 'شكراً لك!',
        customText: 'تم استلام طلب الدعوة المخصصة. سنراجعه ونرد عليك على واتساب بعرض السعر.',
        orderText: 'تم استلام طلبك. سنؤكد الدفع على واتساب ونبدأ العمل على دعوتك.',
        nextTitle: 'ما الخطوة التالية؟',
        next1: 'نراجع طلبك ونرد عليك على واتساب',
        next2: 'تؤكد التفاصيل والسعر النهائي',
        next3: 'نصمم دعوتك ونشاركك معاينة',
        next4: 'توافق عليها وتشاركها مع ضيوفك',
        help: 'تحتاج مساعدة؟ راسلنا على واتساب في أي وقت.',
        home: 'العودة للرئيسية',
        whatsapp: 'افتح واتساب',
      },
    },
  };

  function readLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(stored)) return stored;
    } catch (e) { /* storage may be unavailable */ }
    const param = new URLSearchParams(location.search).get('lang');
    return SUPPORTED.includes(param) ? param : 'en';
  }

  let lang = readLang();

  function lookup(key, language) {
    return key.split('.').reduce((node, part) => (node && node[part] !== undefined ? node[part] : undefined), dict[language]);
  }

  function t(key, vars) {
    let value = lookup(key, lang);
    if (value === undefined) value = lookup(key, 'en');
    if (value === undefined) return key;
    if (typeof value === 'string' && vars) {
      Object.entries(vars).forEach(([k, v]) => { value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), v); });
    }
    return value;
  }

  function pick(value) {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'object' || Array.isArray(value)) return value;
    const localized = value[lang];
    if (localized !== undefined && localized !== null && localized !== '' && !(Array.isArray(localized) && localized.length === 0)) return localized;
    return value.en !== undefined ? value.en : '';
  }

  function formatNumber(n) {
    return Number(n || 0).toLocaleString('en-US');
  }

  function money(amount, opts = {}) {
    const n = formatNumber(amount);
    const sign = opts.plus ? '+' : '';
    return lang === 'ar' ? `${sign}${n} ${t('common.egp')}` : `${t('common.egp')} ${sign}${n}`;
  }

  function applyDocument() {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    root.classList.toggle('lang-ar', lang === 'ar');
  }

  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const value = t(el.getAttribute('data-i18n'));
      if (typeof value === 'string') el.textContent = value;
    });
    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const value = t(el.getAttribute('data-i18n-html'));
      if (typeof value === 'string') el.innerHTML = value;
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    root.querySelectorAll('[data-lang-toggle]').forEach((el) => {
      el.textContent = t('common.langName');
      el.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    });
    // Segmented switcher: EN | العربية (active language highlighted)
    root.querySelectorAll('[data-lang-switch]').forEach((el) => {
      if (!el.querySelector('[data-lang]')) {
        el.innerHTML = '<button type="button" data-lang="en" lang="en">EN</button><span class="lang-sep" aria-hidden="true">|</span><button type="button" data-lang="ar" lang="ar">العربية</button>';
        el.setAttribute('role', 'group');
        el.setAttribute('aria-label', 'Language');
      }
      el.querySelectorAll('[data-lang]').forEach((btn) => {
        const active = btn.getAttribute('data-lang') === lang;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    });
    const titleKey = document.body && document.body.getAttribute('data-i18n-doc-title');
    if (titleKey) document.title = `${t(titleKey)} - Memora`;
  }

  function setLang(next) {
    if (!SUPPORTED.includes(next) || next === lang) return;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    applyDocument();
    apply();
    document.dispatchEvent(new CustomEvent('memora:langchange', { detail: { lang } }));
  }

  function toggle() {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }

  applyDocument();

  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-lang-toggle]');
      if (button) {
        event.preventDefault();
        toggle();
        return;
      }
      const pick = event.target.closest('[data-lang-switch] [data-lang]');
      if (pick) {
        event.preventDefault();
        setLang(pick.getAttribute('data-lang'));
      }
    });
  });

  window.MemoraI18n = {
    get lang() { return lang; },
    isRTL: () => lang === 'ar',
    t,
    pick,
    money,
    formatNumber,
    apply,
    setLang,
    toggle,
    onChange: (fn) => document.addEventListener('memora:langchange', (e) => fn(e.detail.lang)),
  };
})();
