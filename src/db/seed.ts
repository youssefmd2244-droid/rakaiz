import { db, hasDatabase } from "./index";
import {
  projects,
  services,
  achievements,
  partners,
  certificates,
  contracts,
  siteSettings,
  adminUsers,
} from "./schema";
import bcrypt from "bcryptjs";
import { ensureSchema, withSetupLock } from "./ensure";

async function runSeed() {
  if (!hasDatabase()) return; // No DATABASE_URL: the in-memory fallback store is used instead.
  console.log("Checking seed data...");

  // 1. Admin user - Initial password is '2004' (as specifically requested in prompt:
  // "Also add a secure 'Change Admin Password' section; set the initial password to '2004' only for first-time setup, require the administrator to change it on first login")
  const existingUsers = await db.select().from(adminUsers);
  if (existingUsers.length === 0) {
    // The initial password can be overridden with ADMIN_INITIAL_PASSWORD (recommended in production).
    const passwordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || "2004", 10);
    await db.insert(adminUsers).values({
      username: "admin",
      passwordHash,
      role: "super_admin",
      mustChangePassword: true,
    });
    console.log("Admin user seeded with initial password '2004'.");
  }

  // 2. Site Settings
  const existingSettings = await db.select().from(siteSettings);
  if (existingSettings.length === 0) {
    // General Settings
    await db.insert(siteSettings).values({
      key: "general",
      data: {
        brandNameAr: "ركائز",
        brandNameEn: "RAKAIZ",
        coverTitleAr: "ركائز للبناء والمقاولات",
        coverTitleEn: "Rakaiz for Building & Contracting",
        aboutNameAr: "ركائز للتجارة والمقاولات",
        aboutNameEn: "Rakaiz Trading & Contracting",
        legalNameAr: "مؤسسة ركائز البيئة للتجارة",
        legalNameEn: "Rakaiz Al-Bee'a Trading Est.",
        crNumber: "1010875202",
        unifiedNumber: "7033972691",
        establishmentNumber: "1-2742107",
        websiteUrl: "https://rakaiz-ksa.com/",
        companyProfilePdf: "/documents/rakaiz-company-profile.pdf",
        taglineAr: "نبني اليوم .. ركائز لمستقبل أفضل",
        taglineEn: "Building Today.. Pillars for a Greater Future",
        is3DEnabled: true,
        heroStats: [
          { value: "1,800,000", unit: "م²", labelAr: "المساحة الإجمالية", labelEn: "Total Area" },
          { value: "5", unit: "أبراج", labelAr: "أبراج سكنية وتجارية", labelEn: "Towers" },
          { value: "1300", unit: "متجر", labelAr: "متجر تجاري", labelEn: "Commercial Stores" },
          { value: "30", unit: "استراحة", labelAr: "استراحة متكاملة", labelEn: "Private Chalets" },
        ],
      },
    });

    // Contact & Social Settings (Completely editable from admin as requested)
    await db.insert(siteSettings).values({
      key: "contact",
      data: {
        phonePrimary: "0554798138",
        phoneSecondary: "01094555299",
        whatsappPrimary: "01094555299",
        whatsappSecondary: "0554798138",
        email: "info.co@rakkaiz.com",
        addressAr: "شارع الأفلاج، الدريهمية، الرياض، المملكة العربية السعودية",
        addressEn: "Al-Aflaj Street, Al-Duraihimiyah, Riyadh, Saudi Arabia",
        businessHoursAr: "السبت - الخميس: ٨:٠٠ ص - ٥:٠٠ م",
        businessHoursEn: "Saturday - Thursday: 8:00 AM - 5:00 PM",
        googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115984.77338426027!2d46.6666874!3d24.6469444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03f56b92a6b3%3A0x6b820790d9f0ad86!2sAl%20Durayhimiyyah%2C%20Riyadh%20Saudi%20Arabia!5e0!3m2!1sen!2ssa!4v1700000000000",
        floatingButtons: {
          whatsappEnabled: true,
          whatsappPosition: "bottom-right",
          callEnabled: true,
          callPosition: "bottom-left",
        },
        socialLinks: [
          { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/966554798138", enabled: true, icon: "MessageCircle" },
          { platform: "phone", label: "Call", url: "tel:0554798138", enabled: true, icon: "Phone" },
          { platform: "instagram", label: "Instagram", url: "https://instagram.com/rakaiz_ksa", enabled: true, icon: "Instagram" },
          { platform: "x", label: "X (Twitter)", url: "https://x.com/rakaiz_ksa", enabled: true, icon: "Twitter" },
          { platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@rakaiz_ksa", enabled: true, icon: "Video" },
          { platform: "snapchat", label: "Snapchat", url: "https://snapchat.com/add/rakaiz_ksa", enabled: true, icon: "Ghost" },
          { platform: "youtube", label: "YouTube", url: "https://youtube.com/@rakaiz_ksa", enabled: true, icon: "Youtube" },
          { platform: "facebook", label: "Facebook", url: "https://facebook.com/rakaiz.ksa", enabled: true, icon: "Facebook" },
          { platform: "maps", label: "Google Maps", url: "https://maps.google.com/?q=Al-Aflaj+Street+Al-Duraihimiyah+Riyadh", enabled: true, icon: "MapPin" },
        ],
        footerBlocks: {
          showCompanyName: true,
          showAddress: true,
          showPhone: true,
          showWhatsapp: true,
          showEmail: true,
          showNotes: true,
          notesAr: "جميع الحقوق محفوظة لمؤسسة ركائز البيئة للتجارة. سجل تجاري رقم 1010875202",
          notesEn: "All rights reserved to Rakaiz Al-Bee'a Trading Est. Commercial Registration No. 1010875202",
        },
      },
    });

    // Supabase Integration Settings (as requested in prompt for ready-to-use Supabase fields)
    await db.insert(siteSettings).values({
      key: "supabase",
      data: {
        supabaseUrl: process.env.SUPABASE_URL || "https://your-project.supabase.co",
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        isConnected: false,
        storageBucketMedia: "public-media",
        storageBucketContracts: "private-contracts",
        autoSyncPostgres: false,
      },
    });
  }

  // 3. Projects Seed (All 4 verbatim from official PDF)
  const existingProjects = await db.select().from(projects);
  if (existingProjects.length === 0) {
    await db.insert(projects).values([
      {
        slug: "reef-riyadh",
        titleAr: "مشروع ريف الرياض",
        titleEn: "Reef Riyadh Project",
        categoryAr: "سكني وترفيهي",
        categoryEn: "Residential & Hospitality",
        categoryKey: "residential",
        shortDescAr: "نفخر بتنفيذ مشروع ريف الرياض، وهو من أولى المشاريع الخاصة بمؤسسة ركائز. وقد نجحنا في تنفيذه في وقت قياسي.",
        shortDescEn: "We take pride in executing the Reef Riyadh project, one of the premier developments by Rakaiz, completed in record time.",
        fullDescAr: `نفخر بتنفيذ مشروع ريف الرياض، وهو من أولى المشاريع الخاصة بمؤسسة ركائز. وقد نجحنا في تنفيذه في وقت قياسي، حيث:
• قمنا بتنفيذ 30 استراحة متكاملة للشباب.
• تصاميم بناء حديثة وعالية الجودة تتناسب مع الطابع الريفي المعاصر.
• تنفيذ كامل المراحل بما في ذلك البنية التحتية والتشطيبات والكهرباء والتأثيث وتنسيق الحدائق.
• التركيز على معايير الراحة والجاذبية الجمالية.`,
        fullDescEn: `We take immense pride in executing the Reef Riyadh project, one of the foundational flagship developments undertaken by Rakaiz. It was successfully delivered in record time with unmatched standards:
• Executed 30 fully integrated youth rest-houses / chalets.
• Modern, high-grade architectural designs harmonizing contemporary architecture with rural aesthetics.
• Full life-cycle delivery including comprehensive civil infrastructure, luxury interior and exterior finishing, electromechanical systems, furnishing, and landscape architecture.
• Uncompromising focus on resident comfort, functional elegance, and visual beauty.`,
        locationAr: "الرياض، المملكة العربية السعودية",
        locationEn: "Riyadh, Saudi Arabia",
        clientAr: "منتجع ريف الرياض",
        clientEn: "Reef Riyadh Resort",
        scopeAr: "بنية تحتية كاملة، مباني سكنية، تشطيبات، كهرباء، تأثيث، لاندسكيب",
        scopeEn: "Complete Infrastructure, Residential Structures, High-end Finishing, MEP, Furnishing & Landscaping",
        area: "30 استراحة متكاملة",
        year: "2021 - 2022",
        statusAr: "مكتمل بنجاح",
        statusEn: "Successfully Completed",
        heroImage: "/images/reef-riyadh-villas.jpg",
        gallery: [
          "/images/reef-riyadh-villas.jpg",
          "https://images.pexels.com/photos/8484851/pexels-photo-8484851.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          "https://images.pexels.com/photos/28915352/pexels-photo-28915352.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        ],
        keyFacts: [
          { labelAr: "عدد الاستراحات", labelEn: "Total Chalets", value: "30" },
          { labelAr: "معدل الإنجاز", labelEn: "Completion Rate", value: "100%" },
          { labelAr: "زمن التنفيذ", labelEn: "Execution Time", value: "زمن قياسي" },
        ],
        featured: true,
        sortOrder: 1,
      },
      {
        slug: "avenues-mall-riyadh",
        titleAr: "مشروع أفنيو مول – الرياض",
        titleEn: "Avenues Mall Project – Riyadh",
        categoryAr: "تجاري وضخم",
        categoryEn: "Commercial Mega-Project",
        categoryKey: "commercial",
        shortDescAr: "نفخر بكوننا جزءاً من الفريق المسؤول عن تنفيذ هذا المشروع المرموق في المملكة العربية السعودية. تعكس هذه المشاركة الثقة التي اكتسبناها في السوق وسعينا الدؤوب نحو الابتكار.",
        shortDescEn: "We are proud to be part of the team executing this prestigious mega-project in the Kingdom of Saudi Arabia, reflecting market trust and innovation.",
        fullDescAr: `نفخر بكوننا جزءاً من الفريق المسؤول عن تنفيذ هذا المشروع المرموق في المملكة العربية السعودية. تعكس هذه المشاركة الثقة التي اكتسبناها في السوق وسعينا الدؤوب نحو الابتكار.
حقائق المشروع الرئيسية:
• أكبر مركز للتسوق في الشرق الأوسط.
• المساحة الإجمالية: 1,800,000 م².
• يضم 5 أبراج سكنية وتجارية وفنادق عالية المستوى و1300 متجر.
• أعمال البلوك الخفيف (AAC block-work)، الهياكل الخرسانية، السقالات، وأطقم العمل الميدانية المتخصصة بأعلى معايير السلامة والجودة العالمية.`,
        fullDescEn: `We are deeply privileged to be an integral part of the team executing this landmark development in the Kingdom of Saudi Arabia. This involvement testifies to the solid trust we have earned in the construction market and our relentless pursuit of engineering excellence.
Key Project Facts:
• The largest shopping and commercial destination in the Middle East.
• Total built-up area: 1,800,000 m².
• Incorporates 5 mixed-use residential, commercial, and ultra-luxury hospitality towers alongside 1,300 retail stores.
• Full execution of AAC block-work, heavy concrete structural works, advanced scaffolding, and site operations adhering to top-tier international safety and quality standards.`,
        locationAr: "الرياض، طريق الملك فهد / الملك سلمان",
        locationEn: "Riyadh, King Fahd / King Salman Rd",
        clientAr: "شركة شمول القابضة / تحالف المقاولين الدوليين",
        clientEn: "Shomoul Holding / Consortium",
        scopeAr: "أعمال البلوك الخفيف، الهياكل الإنشائية، السقالات، والتشطيبات الأساسية",
        scopeEn: "AAC Block-Work, Structural Concrete Works, Scaffolding, Core & Shell Construction",
        area: "1,800,000 م²",
        year: "2024 - مستمر",
        statusAr: "قيد التنفيذ المتسارع",
        statusEn: "In Active Progress",
        heroImage: "/images/avenues-mall-riyadh.jpg",
        gallery: [
          "/images/avenues-mall-riyadh.jpg",
          "https://images.pexels.com/photos/37687676/pexels-photo-37687676.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          "https://images.pexels.com/photos/38096888/pexels-photo-38096888.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        ],
        keyFacts: [
          { labelAr: "المساحة الإجمالية", labelEn: "Total Area", value: "1,800,000 م²" },
          { labelAr: "عدد الأبراج", labelEn: "High-Rise Towers", value: "5" },
          { labelAr: "عدد المتاجر", labelEn: "Retail Stores", value: "1300+" },
        ],
        featured: true,
        sortOrder: 2,
      },
      {
        slug: "diriyah-gate",
        titleAr: "مشروع تطوير بوابة الدرعية التاريخية",
        titleEn: "Diriyah Gate Historical Development",
        categoryAr: "بنية تحتية وتراثي",
        categoryEn: "Infrastructure & Heritage",
        categoryKey: "infrastructure",
        shortDescAr: "يبرز هذا المشروع خبرتنا المتخصصة في أعمال الرصف والتشطيبات الخارجية ضمن مناطق التطوير العمراني المرموقة. تعكس مشاركتنا ثقة الشركات الوطنية الرائدة بنا.",
        shortDescEn: "This project underscores our specialized expertise in precision stone paving and exterior finishes within elite urban heritage masterplans.",
        fullDescAr: `يبرز هذا المشروع خبرتنا المتخصصة في أعمال الرصف والتشطيبات الخارجية ضمن مناطق التطوير العمراني المرموقة. تعكس مشاركتنا ثقة الشركات الوطنية الرائدة بنا.
حقائق المشروع الرئيسية:
• تنفيذ أعمال الرصف المتشابك والجرانيت والأرصفة في منطقة الدرعية.
• استخدام مواد عالية الجودة والجرانيت الطبيعي لتكملة الطابع التراثي للدرعية.
• ضمان المتانة وسهولة الاستخدام والمظهر الجمالي المتكامل.
• الالتزام الكامل بالجودة والجدول الزمني وتقنيات التنفيذ المتقدمة مع توثيق GPS ومطابقة المعايير الصارمة لهيئة تطوير بوابة الدرعية.`,
        fullDescEn: `This landmark project highlights our specialized mastery in interlocking paving, natural granite stonework, and exterior finishes within premier national heritage master developments.
Key Project Facts:
• Precision execution of interlocking pavers, natural granite stone walkways, and street curbs across historic Diriyah.
• Selecting and dressing superior natural stone to complement and celebrate Diriyah’s timeless Najdi heritage.
• Ensuring lifelong structural durability, effortless accessibility, and refined visual aesthetics.
• Strict compliance with international quality control, rigorous project timelines, and advanced GPS-monitored site coordination.`,
        locationAr: "الدرعية التاريخية، الرياض",
        locationEn: "Historic Diriyah, Riyadh",
        clientAr: "هيئة تطوير بوابة الدرعية / المقاولون المعتمدون",
        clientEn: "Diriyah Gate Development Authority (DGDA)",
        scopeAr: "أعمال الرصف المتشابك، الجرانيت الطبيعي، الأرصفة، تسوية التربة وتسليح الطرق",
        scopeEn: "Interlocking Stone Paving, Natural Granite, Curbs, Road Mesh & Sub-base Infrastructure",
        area: "أكثر من 85,000 م²",
        year: "2023 - 2024",
        statusAr: "مكتمل ومعتمد",
        statusEn: "Completed & Certified",
        heroImage: "/images/diriyah-paving-work.jpg",
        gallery: [
          "/images/diriyah-paving-work.jpg",
          "https://images.pexels.com/photos/13778557/pexels-photo-13778557.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          "https://images.pexels.com/photos/7251083/pexels-photo-7251083.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        ],
        keyFacts: [
          { labelAr: "نوع المواد", labelEn: "Material", value: "جرانيت طبيعي وبلاط معتمد" },
          { labelAr: "الجهة المالكة", labelEn: "Authority", value: "هيئة تطوير بوابة الدرعية" },
          { labelAr: "معايير التراث", labelEn: "Heritage Standard", value: "الطابع النجدي الأصيل" },
        ],
        featured: true,
        sortOrder: 3,
      },
      {
        slug: "my-way-resort",
        titleAr: "إنشاء منتجع ماي واي بشكل عصري حديث",
        titleEn: "My Way Modern Luxury Resort",
        categoryAr: "ضيافة وسكني",
        categoryEn: "Hospitality & Luxury Residential",
        categoryKey: "hospitality",
        shortDescAr: "جسد التزامنا بالجودة والدقة في التنفيذ ويعكس خبرتنا في إنجاز المشاريع السكنية المتوسطة والكبيرة.",
        shortDescEn: "Embodying our unwavering commitment to quality and execution precision in mid-to-large-scale luxury residential and resort projects.",
        fullDescAr: `جسد التزامنا بالجودة والدقة في التنفيذ ويعكس خبرتنا في إنجاز المشاريع السكنية المتوسطة والكبيرة.
حقائق المشروع الرئيسية:
• تنفيذ منتجع ترفيهي كامل.
• تصميم معماري حديث يركز على الراحة والجاذبية الجمالية والخصوصية.
• تنفيذ دورة حياة البناء الكاملة (الهيكل، التشطيبات، الكهرباء، السباكة، التكييف).
• استخدام مواد عالية الجودة لضمان الاستدامة والتميز في التنفيذ: مسابح بإطلالات نخلية، صالات رخامية مع إضاءات سبوت لايت عصرية، واجهات زجاجية واسعة، ومطابخ حديثة مجهزة بالكامل.`,
        fullDescEn: `This signature resort showcases our dedication to premium execution, reflecting our comprehensive expertise in luxury residential and private hospitality construction.
Key Project Facts:
• Turnkey execution of a complete modern private entertainment resort.
• Contemporary architectural design focused on privacy, elegance, and tranquil relaxation.
• Full construction lifecycle execution: structural shell, ultra-luxury finishes, electrical infrastructure, plumbing, and climate control HVAC.
• Incorporation of world-class materials: palm-surrounded pool landscapes, imported marble floors with modern spotlights, architectural glass curtain walls, and state-of-the-art facilities.`,
        locationAr: "شمال الرياض، المملكة العربية السعودية",
        locationEn: "North Riyadh, Saudi Arabia",
        clientAr: "مجموعة ماي واي للضيافة الخاصة",
        clientEn: "My Way Hospitality Group",
        scopeAr: "بناء وتسليم مفتاح، مسابح، تشطيب رخامي، واجهات زجاجية، كهرباء وتكييف",
        scopeEn: "Turnkey Construction, Pools, Marble Interiors, Glass Facades, MEP & Landscaping",
        area: "12,000 م²",
        year: "2023",
        statusAr: "مكتمل ومسلّم",
        statusEn: "Completed & Handed Over",
        heroImage: "/images/my-way-resort.jpg",
        gallery: [
          "/images/my-way-resort.jpg",
          "https://images.pexels.com/photos/3011575/pexels-photo-3011575.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          "https://images.pexels.com/photos/29679172/pexels-photo-29679172.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        ],
        keyFacts: [
          { labelAr: "طبيعة المشروع", labelEn: "Project Nature", value: "منتجع سياحي وترفيهي متكامل" },
          { labelAr: "دورة البناء", labelEn: "Lifecycle", value: "تسليم مفتاح Turnkey" },
          { labelAr: "جودة التشطيب", labelEn: "Finishing Grade", value: "فاخر / رخام وزجاج" },
        ],
        featured: true,
        sortOrder: 4,
      },
    ]);
  }

  // 4. Services Seed (The 9 comprehensive services verbatim from profile Section 5)
  const existingServices = await db.select().from(services);
  if (existingServices.length === 0) {
    await db.insert(services).values([
      {
        slug: "infrastructure-networks",
        titleAr: "مشاريع البنية التحتية المتكاملة",
        titleEn: "Integrated Infrastructure Projects",
        categoryAr: "البنية التحتية",
        categoryEn: "Infrastructure",
        shortDescAr: "تنفيذ كافة مشاريع البنية التحتية من مياه وصرف صحي واتصالات كهربائية ومعامل التربة وإدارة النفايات.",
        shortDescEn: "Execution of complete infrastructure projects including water, sewage, electrical communications, soil laboratories, and waste management.",
        fullDescAr: "نمتلك كفاءات هندسية متطورة لتنفيذ كافة مشاريع البنية التحتية من شبكات المياه والصرف الصحي وتمديدات الاتصالات والكهرباء، مع فحوصات التربة ومعامل الجودة وإدارة النفايات وفق أعلى المقاييس الوطنية والبيئية.",
        fullDescEn: "We possess advanced engineering capabilities to execute comprehensive civil infrastructure including water networks, wastewater, telecom ducts, and soil testing.",
        featuresAr: [
          "تنفيذ شبكات المياه والصرف الصحي",
          "شبكات الاتصالات والكابلات الكهربائية الأرضية",
          "معامل فحص التربة وضبط الجودة الإنشائية",
          "إدارة وتدوير النفايات الإنشائية",
        ],
        featuresEn: [
          "Water and wastewater municipal pipelines",
          "Underground telecommunications & electrical networks",
          "Soil testing laboratories and compaction quality assurance",
          "Civil waste management and site environmental control",
        ],
        icon: "Network",
        image: "/images/diriyah-paving-work.jpg",
        sortOrder: 1,
      },
      {
        slug: "infrastructure-development",
        titleAr: "تطوير البنية التحتية والمخططات",
        titleEn: "Infrastructure & Masterplan Development",
        categoryAr: "البنية التحتية",
        categoryEn: "Infrastructure",
        shortDescAr: "تطوير شامل للبنية التحتية للمخططات الحضرية والصناعية وشبكات الطرق والأرصفة والإنارة.",
        shortDescEn: "Comprehensive development of infrastructure for urban and industrial zones, road networks, paving, and public lighting.",
        fullDescAr: "نقدم حلولاً هندسية متقدمة لتسوية وتجهيز المخططات العمرانية وتنفيذ شبكات الطرق والأرصفة وتصريف السيول ومحطات التوزيع بما يواكب مستهدفات رؤية المملكة 2030.",
        fullDescEn: "We deliver cutting-edge engineering solutions for site preparation, road networks, storm drainage, and public lighting aligning with Vision 2030.",
        featuresAr: [
          "تسوية وتجهيز المخططات والأراضي",
          "أعمال الرصف والإنترلوك والأرصفة",
          "شبكات تصريف مياه الأمطار والسيول",
          "إنارة الطرق والمرافق الحيوية",
        ],
        featuresEn: [
          "Site grading, earthworks, and urban land preparation",
          "Interlocking paving, curbs, and roadway surfacing",
          "Stormwater drainage and flood mitigation networks",
          "Roadway lighting, electrical transformers, and utilities",
        ],
        icon: "Waypoints",
        image: "/images/about-facade-geometric.jpg",
        sortOrder: 2,
      },
      {
        slug: "residential-non-residential",
        titleAr: "المباني السكنية وغير السكنية",
        titleEn: "Residential & Non-Residential Buildings",
        categoryAr: "المقاولات العامة",
        categoryEn: "General Contracting",
        shortDescAr: "المباني السكنية وغير السكنية مثل المدارس والمستشفيات والمجمعات التجارية بأعلى كود بناء سعودي.",
        shortDescEn: "Residential and non-residential buildings such as schools, hospitals, and commercial complexes adhering to the Saudi Building Code.",
        fullDescAr: "تنفيذ المشاريع الإنشائية الكبرى وفق الكود السعودي، بدءاً من الحفر والأساسات الخرسانية وصولاً إلى الهياكل المكتملة للمجمعات التجارية والمستشفيات والمنشآت التعليمية.",
        fullDescEn: "Executing major structural developments adhering to the Saudi Building Code, from deep foundation excavations to turnkey mega-complexes.",
        featuresAr: [
          "المجمعات والأسواق التجارية الكبرى",
          "المستشفيات والمراكز الصحية المتخصصة",
          "المدارس والمنشآت الأكاديمية",
          "الأبراج والمجمعات السكنية الراقية",
        ],
        featuresEn: [
          "Mega commercial retail complexes and malls",
          "Hospitals, clinics, and specialized medical centers",
          "Schools, universities, and educational facilities",
          "High-rise luxury residential towers & compounds",
        ],
        icon: "Building2",
        image: "/images/avenues-mall-riyadh.jpg",
        sortOrder: 3,
      },
      {
        slug: "government-public-institutions",
        titleAr: "المباني الحكومية والمؤسسات العامة",
        titleEn: "Government Buildings & Public Institutions",
        categoryAr: "المقاولات العامة",
        categoryEn: "General Contracting",
        shortDescAr: "تنفيذ وتجهيز مقرات الدوائر الحكومية والوزارات والمؤسسات العامة بمعايير الأمن والسلامة الدقيقة.",
        shortDescEn: "Construction and outfitting of government headquarters, ministries, and public institutional centers with exacting security protocols.",
        fullDescAr: "خبرة معتمدة في التعامل مع المشاريع المؤسسية الحكومية، والالتزام الصارم بالمواصفات الفنية المعتمدة وجداول التسليم المحددة وأعلى درجات الرقابة الهندسية.",
        fullDescEn: "Certified competence in handling national governmental and institutional projects with strict adherence to public specifications and tight delivery timelines.",
        featuresAr: [
          "مقرات الوزارات والهيئات الوطنية",
          "المراكز الخدمية للمواطنين",
          "منظومات الأمن والسلامة المعتمدة",
          "الالتزام بأنظمة المشتريات والمواصفات الحكومية",
        ],
        featuresEn: [
          "National ministries and authority headquarters",
          "Civic service centers and administrative complexes",
          "Certified security, fire safety, and surveillance systems",
          "Full compliance with Saudi Government Procurement regulations",
        ],
        icon: "Landmark",
        image: "/images/hero-architectural-towers.jpg",
        sortOrder: 4,
      },
      {
        slug: "restoration-prefabricated",
        titleAr: "ترميم المباني وبناء المباني الجاهزة",
        titleEn: "Building Restoration & Prefabricated Structures",
        categoryAr: "المقاولات العامة",
        categoryEn: "General Contracting",
        shortDescAr: "مواقع ترميم المباني وتأهيلها الإنشائي وتوريد وتركيب المباني الجاهزة والحلول سريعة البناء.",
        shortDescEn: "Comprehensive structural restoration, building retrofitting, and deployment of modular prefabricated construction solutions.",
        fullDescAr: "حلول تقوية الأعمدة والعناصر الإنشائية، ومعالجة التصدعات، وترقية واجهات المباني التاريخية والمعاصرة، بالإضافة إلى حلول المباني الجاهزة عالية العزل الصوتي والحراري.",
        fullDescEn: "Structural retrofitting, crack rectification, heritage facade rehabilitation, and premium insulated prefabricated modular assembly.",
        featuresAr: [
          "تدعيم الهياكل الخرسانية والصلبة",
          "تجديد الواجهات وتحديث العوازل",
          "تصنيع وتركيب المباني الجاهزة السريعة",
          "حلول المواقع والمكاتب الميدانية",
        ],
        featuresEn: [
          "Reinforcement of reinforced concrete and steel structures",
          "Facade renewal, waterproofing, and thermal insulation",
          "Fast-track modular prefabricated building assembly",
          "Turnkey field offices, cabins, and site accommodations",
        ],
        icon: "Hammer",
        image: "/images/diriyah-paving-work.jpg",
        sortOrder: 5,
      },
      {
        slug: "facilities-maintenance-operation",
        titleAr: "تشغيل وصيانة المرافق المختلفة",
        titleEn: "Facilities Maintenance & Operation (FM&O)",
        categoryAr: "التشغيل والصيانة",
        categoryEn: "Operation & Maintenance",
        shortDescAr: "حلول شاملة لصيانة وتشغيل المرافق المختلفة العامة والتجارية وضمان استمرارية عملها بكفاءة.",
        shortDescEn: "Comprehensive facility management, predictive maintenance, and operational solutions ensuring uninterrupted efficiency.",
        fullDescAr: "إدارة تشغيلية دورية ووقائية لكافة الأنظمة الميكانيكية والكهربائية وشبكات التكييف المركزية والسلامة، مع فرق طوارئ متخصصة على مدار 24 ساعة.",
        fullDescEn: "Preventive and routine management for electromechanical plants, centralized HVAC networks, and certified life-safety systems with 24/7 rapid response teams.",
        featuresAr: [
          "صيانة أنظمة التكييف والتهوية المركزية",
          "إدارة وصيانة شبكات الطاقة والمولدات",
          "عقود الصيانة الوقائية والطارئة 24/7",
          "إدارة مرافق المجمعات والمراكز التجارية",
        ],
        featuresEn: [
          "Central HVAC and ventilation predictive maintenance",
          "Power distribution systems, generators, and UPS monitoring",
          "24/7 emergency repair and continuous service agreements",
          "Commercial shopping centers and compound facility management",
        ],
        icon: "Wrench",
        image: "/images/about-facade-geometric.jpg",
        sortOrder: 6,
      },
      {
        slug: "high-quality-finishing",
        titleAr: "خدمات التشطيبات عالية الجودة",
        titleEn: "High-End Architectural Finishing",
        categoryAr: "التشطيبات والديكور",
        categoryEn: "Finishing & Interiors",
        shortDescAr: "تقديم خدمات التشطيب عالية الجودة والمصممة خصيصاً لتلبية الاحتياجات الفريدة لكل عميل.",
        shortDescEn: "Providing bespoke, top-tier interior and exterior finishing services tailored to the unique aesthetic needs of each client.",
        fullDescAr: "تنفيذ أرقى أعمال الرخام الطبيعي، وتكسيات الخشب والجبس، والواجهات الزجاجية الإنشائية، والدهانات الديكورية، والإضاءات المعمارية المخفية بحرفية بالغة.",
        fullDescEn: "Master craftsmanship in natural marble, precision wood paneling, structural curtain glass facades, and architectural ambient lighting.",
        featuresAr: [
          "أعمال الرخام والجرانيت للأرضيات والجدران",
          "تكسيات الواجهات الزجاجية والألومنيوم (Curtain Walls)",
          "الأسقف المعلقة والإنارة المخفية الذكية",
          "الدهانات الديكورية والتشطيبات الفندقية",
        ],
        featuresEn: [
          "Imported natural marble and granite wall/floor cladding",
          "Structural curtain walls, double-glazed architectural glass",
          "Acoustic gypsum ceilings and architectural LED smart lighting",
          "Luxury decorative wall coatings and boutique hotel finishes",
        ],
        icon: "Sparkles",
        image: "/images/my-way-resort.jpg",
        sortOrder: 7,
      },
      {
        slug: "general-contracting-private",
        titleAr: "المقاولات العامة للمنازل والمباني الخاصة",
        titleEn: "General Contracting for Private Buildings & Homes",
        categoryAr: "المقاولات العامة",
        categoryEn: "General Contracting",
        shortDescAr: "المقاولات العامة للمنازل والمباني الخاصة شاملة الصيانة والتشطيب والبناء العظم وتسليم المفتاح.",
        shortDescEn: "General contracting for residences and private estates encompassing structural building, maintenance, and turnkey finishing.",
        fullDescAr: "إشراف هندسي دقيق على كل مرحلة من مراحل تشييد القصور والفلل والمباني الخاصة، مع الالتزام بأعلى معايير المواد والجداول الزمنية وضمانات ما بعد التسليم.",
        fullDescEn: "Meticulous structural engineering, skeleton execution, and turnkey luxury fit-out for high-end residential estates, villas, and private developments.",
        featuresAr: [
          "بناء العظم وإشراف هندسي معتمد",
          "تسليم المفتاح المتكامل (Turnkey)",
          "تنسيق الحدائق والمسابح الخاصة",
          "ضمانات شاملة على الهيكل والعوازل",
        ],
        featuresEn: [
          "Structural skeleton concrete construction & certified supervision",
          "Turnkey delivery with complete MEP and luxury interior décor",
          "Private resort pools, fountains, and exterior landscapes",
          "Comprehensive multi-year structural and waterproofing warranties",
        ],
        icon: "Home",
        image: "/images/reef-riyadh-villas.jpg",
        sortOrder: 8,
      },
      {
        slug: "investment-services",
        titleAr: "خدمات الاستثمار العقاري والأراضي",
        titleEn: "Real Estate & Land Investment Services",
        categoryAr: "العقارات والاستثمار",
        categoryEn: "Real Estate & Investments",
        shortDescAr: "خدمات الاستثمار لمساعدة العملاء على النمو وتأمين مستقبلهم، واستثمار الأراضي والمباني السكنية.",
        shortDescEn: "Strategic investment services empowering clients to grow capital and secure assets across land parcels and residential projects.",
        fullDescAr: "دراسات جدوى متخصصة، وتطوير الأراضي البيضاء، وتوجيه رأس المال الإنشائي نحو أكثر المشاريع عائداً في السوق السعودي المزدهر.",
        fullDescEn: "Strategic advisory, feasibility analysis, raw land parcel development, and maximizing return on capital in the expanding Saudi property market.",
        featuresAr: [
          "دراسات الجدوى الاقتصادية والهندسية للمشاريع",
          "تطوير واستثمار الأراضي الخام والمخططات",
          "إدارة المحافظ الإنشائية والعقارية",
          "تعظيم العائد الاستثماري لمالكي العقارات",
        ],
        featuresEn: [
          "Feasibility studies and engineering capital expenditure analysis",
          "Raw land development and urban zoning optimization",
          "Real estate development portfolio advisory",
          "Maximizing asset value and ROI for property owners",
        ],
        icon: "TrendingUp",
        image: "/images/hero-architectural-towers.jpg",
        sortOrder: 9,
      },
    ]);
  }

  // 5. Achievements Timeline Seed (Verbatim from profile Section 5 [06])
  const existingAchievements = await db.select().from(achievements);
  if (existingAchievements.length === 0) {
    await db.insert(achievements).values([
      {
        year: "2021",
        titleAr: "إنجاز مشاريع متنوعة",
        titleEn: "Delivering Diverse Landmark Projects",
        descAr: "أنجزنا بنجاح العديد من المشاريع التي تخدم الأفراد والشركات، وركزنا على قطاعات رئيسية للتطوير العقاري والاستثمار والمقاولات العامة.",
        descEn: "We successfully accomplished numerous projects serving individuals and enterprises, focusing on key sectors of real estate development, investment, and general contracting.",
        highlightAr: "تنفيذ 30 استراحة في ريف الرياض",
        highlightEn: "Delivery of 30 chalets at Reef Riyadh",
        sortOrder: 1,
      },
      {
        year: "2023",
        titleAr: "تشغيل وصيانة المرافق",
        titleEn: "Facility Operation & Maintenance Expansion",
        descAr: "تم إنجاز مشاريع ناجحة في صيانة وتشغيل العديد من المرافق العامة، وضمان تشغيلها بسلاسة وكفاءة.",
        descEn: "Completed successful projects in maintaining and operating diverse public facilities, guaranteeing seamless functionality and operational efficiency.",
        highlightAr: "عقود صيانة وتشغيل مرافق حكومية وتجارية",
        highlightEn: "Public and commercial FM&O milestones",
        sortOrder: 2,
      },
      {
        year: "2024",
        titleAr: "المشاركة في المشاريع الاستراتيجية",
        titleEn: "Participation in Strategic Mega-Projects",
        descAr: "انضم إلى مشروع أفنيوز مول في الرياض، مساهما في أحد أكبر التطورات في المملكة العربية السعودية.",
        descEn: "Joined the flagship Avenues Mall project in Riyadh, contributing to one of the most transformative developments in the Kingdom of Saudi Arabia.",
        highlightAr: "المساهمة في أكبر مول بالشرق الأوسط (1.8 مليون م²)",
        highlightEn: "Largest Middle East mall complex (1.8M m²)",
        sortOrder: 3,
      },
    ]);
  }

  // 6. Partners Seed (Verbatim from profile Section 5 [19])
  const existingPartners = await db.select().from(partners);
  if (existingPartners.length === 0) {
    await db.insert(partners).values([
      {
        nameAr: "RTCC",
        nameEn: "RTCC Contracting",
        categoryAr: "مقاول رئيسي",
        categoryEn: "Main Contractor",
        logoUrl: "/logos/partner-rtcc.svg",
        websiteUrl: "https://rtcc.com.sa",
        sortOrder: 1,
      },
      {
        nameAr: "وزارة الصحة",
        nameEn: "Ministry of Health",
        categoryAr: "جهة حكومية",
        categoryEn: "Government Entity",
        logoUrl: "/logos/partner-moh.svg",
        websiteUrl: "https://moh.gov.sa",
        sortOrder: 2,
      },
      {
        nameAr: "وزارة البيئة والمياه والزراعة",
        nameEn: "Ministry of Environment Water & Agriculture",
        categoryAr: "جهة حكومية",
        categoryEn: "Government Entity",
        logoUrl: "/logos/partner-mewa.svg",
        websiteUrl: "https://mewa.gov.sa",
        sortOrder: 3,
      },
      {
        nameAr: "مؤسسة سديل الإعمار للمقاولات",
        nameEn: "Sadeel AL-Eamaar Construction",
        categoryAr: "شريك استراتيجي",
        categoryEn: "Strategic Partner",
        logoUrl: "/logos/partner-sadeel.svg",
        websiteUrl: "#",
        sortOrder: 4,
      },
      {
        nameAr: "توقيت الخليج للتجارة والمقاولات",
        nameEn: "Gulf Timing Trading & Contracting",
        categoryAr: "شريك تجاري",
        categoryEn: "Commercial Partner",
        logoUrl: "/logos/partner-gulftiming.svg",
        websiteUrl: "#",
        sortOrder: 5,
      },
      {
        nameAr: "منتجع ريف الرياض",
        nameEn: "Reef Riyadh Resort",
        categoryAr: "عميل استراتيجي",
        categoryEn: "Strategic Client",
        logoUrl: "/logos/partner-reefriyadh.svg",
        websiteUrl: "#",
        sortOrder: 6,
      },
      {
        nameAr: "هيئة تطوير بوابة الدرعية",
        nameEn: "Diriyah Gate Development Authority (DGDA)",
        categoryAr: "شريك تطوير وطني",
        categoryEn: "National Development Partner",
        logoUrl: "/logos/partner-dgda.svg",
        websiteUrl: "https://dgda.gov.sa",
        sortOrder: 7,
      },
      {
        nameAr: "منتجع ماي واي",
        nameEn: "My Way Resort",
        categoryAr: "عميل فاخر",
        categoryEn: "Luxury Hospitality Client",
        logoUrl: "/logos/partner-myway.svg",
        websiteUrl: "#",
        sortOrder: 8,
      },
    ]);
  }

  // 7. Certificates Seed (Exact data from profile Section 5 [19])
  const existingCerts = await db.select().from(certificates);
  if (existingCerts.length === 0) {
    await db.insert(certificates).values([
      {
        code: "cr",
        titleAr: "السجل التجاري",
        titleEn: "Commercial Registration",
        authorityAr: "وزارة التجارة - رؤية 2030",
        authorityEn: "Ministry of Commerce - Vision 2030",
        docNumber: "1010875202",
        issueDate: "2023/04/10",
        expiryDate: "2026/04/10",
        isHijri: false,
        verifiedUrl: "https://www.mc.gov.sa",
        badge: "ساري ومعتمد",
        detailsAr: {
          "الاسم التجاري": "مؤسسة ركائز البيئة للتجارة",
          "الرقم الموحد": "7033972691",
          "رقم السجل": "1010875202",
          "رمزك التجاري QR Code": "من خلاله يمكنك التحقق المباشر من المعلومات: السجل التجاري، شهادة السعودة، رخصة البلدية، برنامج نطاقات، شهادة الزكاة، الغرفة التجارية",
          "المدينة": "الرياض",
          "المصدر": "www.mc.gov.sa (MCgovSA)",
        },
        detailsEn: {
          "Trade Name": "Rakaiz Al-Bee'a Trading Est.",
          "Unified Number": "7033972691",
          "CR Number": "1010875202",
          "Commercial QR Code": "Direct verification for: CR, Saudization, Municipality License, Nitaqat, Zakat, Chamber of Commerce",
          "City": "Riyadh",
          "Source": "www.mc.gov.sa (MCgovSA)",
        },
        sortOrder: 1,
      },
      {
        code: "balady",
        titleAr: "رخصة نشاط تجاري",
        titleEn: "Commercial Activity License",
        authorityAr: "منصة بلدي - أمانة منطقة الرياض",
        authorityEn: "Balady - Riyadh Region Municipality",
        docNumber: "460818641385",
        issueDate: "1444/08/19",
        expiryDate: "1447/08/19",
        isHijri: true,
        verifiedUrl: "https://balady.gov.sa",
        badge: "ساري ومعتمد",
        detailsAr: {
          "رقم الرخصة": "460818641385",
          "تاريخ الانتهاء": "1447/08/19 هـ",
          "اسم المنشأة": "مؤسسة ركائز البيئة للتجارة",
          "رقم المنشأة 700": "7033972691",
          "التصنيف الوطني ISIC": "الوساطة العقارية",
          "النشاط التفصيلي": "أنشطة وكلاء السمسرة – مكاتب الدلالين",
          "البلدية الفرعية": "بلدية العريجاء",
          "الأمانة": "أمانة منطقة الرياض",
          "الشارع": "الأفلاج",
          "الحي": "الدريهمية",
          "ملاحظة": "امسح رمز الاستجابة السريع واطلع على وثيقة بيانات المنشأة المحدثة رقم 460818641385",
        },
        detailsEn: {
          "License No.": "460818641385",
          "Expiry Date": "1447/08/19 Hijri",
          "Establishment Name": "Rakaiz Al-Bee'a Trading Est.",
          "Owner ID 700": "7033972691",
          "ISIC Classification": "Real Estate Brokerage",
          "Detailed Activity": "Brokerage Agency Activities - Broker Offices",
          "Sub-Municipality": "Al-Uraija Sub-Municipality",
          "Municipality": "Riyadh Region Municipality",
          "Street": "Al-Aflaj Street",
          "District": "Al-Duraihimiyah",
          "QR Note": "Scan QR to access updated establishment data doc No. 460818641385",
        },
        sortOrder: 2,
      },
      {
        code: "qiwa",
        titleAr: "شهادة التوطين (قوى)",
        titleEn: "Saudization Certificate (Qiwa)",
        authorityAr: "منصة قوى - وزارة الموارد البشرية والتنمية الاجتماعية",
        authorityEn: "Qiwa - Ministry of Human Resources",
        docNumber: "592095-68619131",
        issueDate: "2024/10/31",
        expiryDate: "2025/01/29", // Rule: strictly follows profile date, will show 'Expired' automatically
        isHijri: false,
        verifiedUrl: "https://qiwa.sa",
        badge: "منتهية - قابلة للتجديد",
        detailsAr: {
          "رقم الشهادة": "592095-68619131",
          "تاريخ الإصدار": "31/10/2024",
          "تاريخ الانتهاء": "29/01/2025",
          "حالة التوثيق": "تم التحقق (سجل رسمي سابق)",
          "اسم المنشأة": "مؤسسة ركائز البيئة للتجارة",
          "رقم المنشأة": "1-2742107",
          "السجل التجاري": "1010875202",
          "الرقم الموحد": "7033972691",
          "نطاق المنشأة": "أخضر صغير (فئة أ)",
          "نسبة التوطين": "40%",
          "ملاحظة النظام": "الشهادات السابقة تظهر بحالة منتهية التزاماً بالشفافية والمصداقية التامة، ويمكن للمسؤول رفع التجديد الفوري من لوحة التحكم",
        },
        detailsEn: {
          "Certificate No.": "592095-68619131",
          "Issue Date": "31/10/2024",
          "Expiry Date": "29/01/2025",
          "Verification Status": "Verified (Official Historical Record)",
          "Establishment Name": "Rakaiz Al-Bee'a Trading Est.",
          "Establishment No.": "1-2742107",
          "CR Number": "1010875202",
          "Unified Number": "7033972691",
          "Nitaqat Level": "Small Green (Category A)",
          "Saudization Rate": "40%",
          "System Note": "Past certificates are truthfully badged as Expired and can be renewed instantly via admin",
        },
        sortOrder: 3,
      },
      {
        code: "chamber",
        titleAr: "شهادة اشتراك الغرفة التجارية",
        titleEn: "Chamber of Commerce Membership",
        authorityAr: "غرفة الرياض - اتحاد الغرف السعودية",
        authorityEn: "Riyadh Chamber of Commerce",
        docNumber: "815747",
        issueDate: "2023/04/12",
        expiryDate: "2025/04/12",
        isHijri: false,
        verifiedUrl: "https://mybusiness.chamber.sa",
        badge: "ساري ومعتمد",
        detailsAr: {
          "رقم الاشتراك": "815747",
          "تاريخ الإصدار": "2023/04/12",
          "تاريخ الانتهاء": "2025/04/12",
          "الدرجة": "الخامسة (Fifth)",
          "اسم المنشأة": "مؤسسة ركائز البيئة للخدمات البيئية",
          "السجل التجاري": "1010875202",
          "منصة التحقق الإلكتروني": "mybusiness.chamber.sa",
          "هاتف الخدمات الإلكترونية": "920004565",
        },
        detailsEn: {
          "Membership No.": "815747",
          "Issue Date": "2023/04/12",
          "Expiry Date": "2025/04/12",
          "Class": "Fifth (الخامسة)",
          "Establishment Name": "Rakaiz Al-Bee'a Environmental Services Est.",
          "CR Number": "1010875202",
          "Verification Platform": "mybusiness.chamber.sa",
          "E-services Phone": "920004565",
        },
        sortOrder: 4,
      },
      {
        code: "zakat",
        titleAr: "شهادة الزكاة والدخل (ZATCA)",
        titleEn: "Zakat & Tax Certificate (ZATCA)",
        authorityAr: "هيئة الزكاة والضريبة والجمارك",
        authorityEn: "Zakat, Tax and Customs Authority",
        docNumber: "قيد التجديد السنوي",
        issueDate: "2024/01/01",
        expiryDate: "2025/04/30",
        isHijri: false,
        verifiedUrl: "https://zatca.gov.sa",
        badge: "قيد المراجعة / التحديث",
        detailsAr: {
          "حالة الوثيقة": "مرفق جاهز للتحديث عبر لوحة تحكم المسؤول",
          "الرقم الضريبي الموحد": "300000000000003",
          "المنشأة": "مؤسسة ركائز البيئة للتجارة",
          "ملاحظة": "يتم رفع الشهادة المجددة مباشرة من خلال لوحة تحكم الإدارة",
        },
        detailsEn: {
          "Document Status": "Placeholder ready for instant admin upload",
          "Tax Identification Number": "300000000000003",
          "Establishment": "Rakaiz Al-Bee'a Trading Est.",
          "Note": "Updated certificate can be attached directly via CMS",
        },
        sortOrder: 5,
      },
    ]);
  }

  // 8. Contracts Seed (Exact items from profile Section 5 [10])
  const existingContracts = await db.select().from(contracts);
  if (existingContracts.length === 0) {
    await db.insert(contracts).values([
      {
        titleAr: "عقد مقاولة من الباطن – مؤسسة سديل الإعمار للمقاولات",
        titleEn: "Subcontract Agreement – Sadeel Al-Eamaar Contracting",
        counterpartyAr: "مؤسسة سديل الإعمار للمقاولات",
        counterpartyEn: "Sadeel Al-Eamaar Contracting Est.",
        contractTypeAr: "عقد مقاولة من الباطن معتمد",
        contractTypeEn: "Certified Subcontract Agreement",
        dateTermAr: "2023 - 2024",
        dateTermEn: "2023 - 2024",
        blurredPreviewUrl: "/images/contract-blurred-1.svg",
        privateFileUrl: "/protected-docs/contract-sadeel-al-eamaar.pdf",
        isProtected: true,
        notesAr: "عقد رسمي معتمد، يخضع لطلب إذن الوصول وموافقة الإدارة المسبقة.",
        notesEn: "Confidential corporate agreement, requires authorization request & admin approval.",
        sortOrder: 1,
      },
      {
        titleAr: "اتفاقية مقاول خدمات من الباطن – شركة كيان للمقاولات المتخصصة",
        titleEn: "Service Subcontractor Agreement – KAYAN Specialized Contracting Co.",
        counterpartyAr: "شركة كيان للمقاولات المتخصصة (KAYAN Specialized Contracting)",
        counterpartyEn: "KAYAN Specialized Contracting Co.",
        contractTypeAr: "اتفاقية خدمات هندسية ثنائية اللغة",
        contractTypeEn: "Bilingual Engineering Services Agreement",
        dateTermAr: "21-01-2025 إلى 20-01-2026",
        dateTermEn: "21-01-2025 to 20-01-2026",
        blurredPreviewUrl: "/images/contract-blurred-2.svg",
        privateFileUrl: "/protected-docs/contract-kayan-specialized.pdf",
        isProtected: true,
        notesAr: "ساري المفعول للفترة 2025 - 2026، محمي ومتاح فقط بعد التحقق.",
        notesEn: "Active term 2025 - 2026, strictly protected and revealed upon vetted access.",
        sortOrder: 2,
      },
      {
        titleAr: "عقد مقاولة باطن – أعمال البنية التحتية والرصف",
        titleEn: "Subcontract Agreement – Infrastructure & Paving Works",
        counterpartyAr: "تحالف شركاء التطوير العمراني بالرياض",
        counterpartyEn: "Riyadh Urban Development Partners Alliance",
        contractTypeAr: "عقد تنفيذ أعمال بنية تحتية ورصف حجري",
        contractTypeEn: "Infrastructure & Natural Stone Paving Contract",
        dateTermAr: "2023 - 2024",
        dateTermEn: "2023 - 2024",
        blurredPreviewUrl: "/images/contract-blurred-1.svg",
        privateFileUrl: "/protected-docs/contract-paving-infra.pdf",
        isProtected: true,
        notesAr: "يشمل التوريد والتنفيذ والأعمال التكميلية.",
        notesEn: "Encompasses supply, installation, and supplementary civil works.",
        sortOrder: 3,
      },
      {
        titleAr: "أمر شراء معتمد (Purchase Order 01)",
        titleEn: "Certified Purchase Order (PO #01)",
        counterpartyAr: "شركة المقاولات الوطنية الكبرى",
        counterpartyEn: "Major National Contracting Corporation",
        contractTypeAr: "أمر توريد مواد إنشائية وعمالة متخصصة",
        contractTypeEn: "Procurement & Specialized Labor PO",
        dateTermAr: "2024",
        dateTermEn: "2024",
        blurredPreviewUrl: "/images/contract-blurred-2.svg",
        privateFileUrl: "/protected-docs/po-national-contracting.pdf",
        isProtected: true,
        notesAr: "أمر شراء رسمي معتمد ومختوم.",
        notesEn: "Official stamped purchase order.",
        sortOrder: 4,
      },
      {
        titleAr: "أمر شراء معتمد (Purchase Order 02)",
        titleEn: "Certified Purchase Order (PO #02)",
        counterpartyAr: "توقيت الخليج للتجارة والمقاولات",
        counterpartyEn: "Gulf Timing Trading & Contracting",
        contractTypeAr: "أمر توريد مواد بلوك خفيف ومعدات متطورة",
        contractTypeEn: "AAC Block Materials & Advanced Equipment PO",
        dateTermAr: "2024",
        dateTermEn: "2024",
        blurredPreviewUrl: "/images/contract-blurred-1.svg",
        privateFileUrl: "/protected-docs/po-gulf-timing.pdf",
        isProtected: true,
        notesAr: "أمر شراء رسمي معتمد ومختوم.",
        notesEn: "Official stamped purchase order.",
        sortOrder: 5,
      },
    ]);
  }

  console.log("Database seeded successfully with all official company data.");
}

let seedPromise: Promise<void> | null = null;

/**
 * Makes sure the tables exist and the initial data is seeded.
 * Runs at most once per server instance; concurrent instances are serialized
 * with a Postgres advisory lock so data is never seeded twice.
 */
export function seedDatabase(): Promise<void> {
  if (!hasDatabase()) return Promise.resolve(); // in-memory fallback mode, nothing to seed
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureSchema();
      await withSetupLock(runSeed);
    })().catch((error) => {
      seedPromise = null; // allow a retry on the next request
      throw error;
    });
  }
  return seedPromise;
}
