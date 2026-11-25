export const CAREER_PATHS = [
  {
    id: 'tech-zero-cost',
    domain: 'tech',
    keywords: [
      'tech', 'coding', 'programming', 'software', 'web', 'developer', 'zero paid', 'free',
      'कोडिंग', 'टेक', 'सॉफ्टवेयर', 'डेवलपर', 'बिना पैसे', 'मुफ्त',
      'டெக்', 'குறியீடு', 'மென்பொருள்', 'கட்டணம்', 'இலவசம்',
      'টেক', 'কোডিং', 'সফটওয়্যার', 'ডেভেলপার', 'পেইড', 'ফ্রি'
    ],
    starterQuestion: {
      en: 'How do I start in tech with zero paid courses?',
      hi: 'बिना किसी पेड कोर्स के टेक में शुरुआत कैसे करें?',
      ta: 'கட்டணப் படிப்புகள் இன்றி டெக் துறையில் எப்படி தொடங்குவது?',
      bn: 'কোনো পেইড কোর্স ছাড়া টেক সেক্টরে কীভাবে শুরু করব?'
    },
    title: {
      en: 'Entry-Level Web & Software Development (100% Free Path)',
      hi: 'एंट्री-लेवल वेब और सॉफ्टवेयर डेवलपमेंट (100% मुफ्त रास्ता)',
      ta: 'தொடக்க நிலை வெப் & மென்பொருள் மேம்பாடு (100% இலவச வழி)',
      bn: 'এন্ট্রি-লেভেল ওয়েব ও সফটওয়্যার ডেভেলপমেন্ট (১০০% ফ্রি পথ)'
    },
    overview: {
      en: 'You do not need expensive bootcamps or degrees to enter software development. Employers evaluate real working projects on GitHub, problem-solving fundamentals, and clean HTML/CSS/JavaScript skills—all learnable for free.',
      hi: 'सॉफ्टवेयर डेवलपमेंट में आने के लिए महंगे बूटकैंप जरूरी नहीं हैं। कंपनियां GitHub पर आपके असली प्रोजेक्ट, समस्या सुलझाने की क्षमता और HTML/CSS/JavaScript की समझ देखती हैं—जिन्हें आप 100% मुफ्त सीख सकते हैं।',
      ta: 'மென்பொருள் துறையில் சேர விலையுயர்ந்த பயிற்சி தேவையில்லை. GitHub-ல் உள்ள உங்கள் நேரடி திட்டங்கள், அடிப்படை HTML/CSS/JavaScript திறன்களே முக்கியம்—இவை அனைத்தையும் இலவசமாகக் கற்கலாம்.',
      bn: 'সফটওয়্যার ডেভেলপমেন্টে ঢোকার জন্য দামি বুটক্যাম্প দরকার নেই। নিয়োগদাতারা GitHub-এ আপনার আসল প্রজেক্ট, সমস্যা সমাধানের দক্ষতা এবং HTML/CSS/JavaScript-এর ভিত্তি দেখেন—যা সম্পূর্ণ বিনামূল্যে শেখা যায়।'
    },
    coreSkills: {
      en: [
        'Semantic HTML & Responsive CSS',
        'JavaScript Fundamentals & DOM Logic',
        'Git & GitHub Version Control',
        'Debugging & Reading Official Docs (MDN)',
        'Deploying Static Projects for Free'
      ],
      hi: [
        'सिमैंटिक HTML और मोबाइल-फ्रेंडली CSS',
        'JavaScript की बुनियाद और लॉजिक',
        'Git और GitHub का उपयोग',
        'MDN डॉक्स पढ़ना और बग ठीक करना',
        'मुफ्त में प्रोजेक्ट लाइव करना'
      ],
      ta: [
        'அடிப்படை HTML & மொபைல் CSS',
        'JavaScript அடிப்படை மற்றும் தர்க்கம்',
        'Git & GitHub பதிப்பு கட்டுப்பாடு',
        'MDN ஆவணங்களைப் படித்து பிழை திருத்துதல்',
        'இலவசமாகத் திட்டங்களை இணையத்தில் வெளியிடுதல்'
      ],
      bn: [
        'HTML ও মোবাইল-বান্ধব CSS',
        'JavaScript-এর মূল ভিত্তি ও লজিক',
        'Git এবং GitHub ব্যবহার',
        'অফিসিয়াল ডকস (MDN) পড়া ও ডিবাগিং',
        'বিনামূল্যে প্রজেক্ট হোস্ট করা'
      ]
    },
    steps: [
      {
        id: 'step-1',
        baseHours: 20,
        title: {
          en: 'Build core web pages with HTML & CSS',
          hi: 'HTML और CSS से बुनियादी वेब पेज बनाएं',
          ta: 'HTML & CSS மூலம் அடிப்படை வலைப்பக்கங்களை உருவாக்குங்கள்',
          bn: 'HTML ও CSS দিয়ে প্রাথমিক ওয়েবপেজ তৈরি করুন'
        },
        detail: {
          en: 'Complete Responsive Web Design basics on freeCodeCamp or MDN and build 2 clean mobile-friendly pages.',
          hi: 'freeCodeCamp या MDN से रिस्पॉन्सिव डिज़ाइन सीखें और 2 साफ-सुथरे वेब पेज बनाएं।',
          ta: 'freeCodeCamp அல்லது MDN மூலம் கற்று, 2 மொபைல்-நட்பு பக்கங்களை உருவாக்குங்கள்.',
          bn: 'freeCodeCamp বা MDN থেকে শিখে ২টি পরিচ্ছন্ন মোবাইল-বান্ধব পেজ তৈরি করুন।'
        }
      },
      {
        id: 'step-2',
        baseHours: 35,
        title: {
          en: 'Learn JavaScript & problem-solving daily',
          hi: 'रोज़ाना JavaScript और लॉजिक का अभ्यास करें',
          ta: 'தினமும் JavaScript மற்றும் சிக்கல் தீர்க்கும் பயிற்சி செய்யுங்கள்',
          bn: 'প্রতিদিন JavaScript ও লজিক অনুশীলন করুন'
        },
        detail: {
          en: 'Focus on arrays, objects, functions, fetch API, and building small utilities (calculator, quiz, tracker).',
          hi: 'एरे, ऑब्जेक्ट, फंक्शन, API कॉल समझें और छोटे टूल (कैलकुलेटर, ट्रैकर) बनाएं।',
          ta: 'Arrays, objects, functions கற்று சிறிய பயன்பாடுகளை (கால்குலேட்டர், பட்டியல்) உருவாக்குங்கள்.',
          bn: 'অ্যারে, অবজেক্ট, ফাংশন ও fetch API শিখে ছোট টুল (ক্যালকুলেটর, ট্র্যাকার) তৈরি করুন।'
        }
      },
      {
        id: 'step-3',
        baseHours: 15,
        title: {
          en: 'Set up Git, GitHub & free live hosting',
          hi: 'Git, GitHub और मुफ्त होस्टिंग सेटअप करें',
          ta: 'Git, GitHub மற்றும் இலவச ஹோஸ்டிங் அமைக்கவும்',
          bn: 'Git, GitHub ও ফ্রি হোস্টিং সেটআপ করুন'
        },
        detail: {
          en: 'Push every mini-project to GitHub with a clear README and publish live demos using GitHub Pages.',
          hi: 'हर प्रोजेक्ट को README के साथ GitHub पर डालें और GitHub Pages से मुफ्त लाइव करें।',
          ta: 'ஒவ்வொரு திட்டத்தையும் README உடன் GitHub-ல் சேமித்து GitHub Pages-ல் வெளியிடுங்கள்.',
          bn: 'প্রতিটি প্রজেক্ট README-সহ GitHub-এ আপলোড করে GitHub Pages-এ লাইভ করুন।'
        }
      },
      {
        id: 'step-4',
        baseHours: 40,
        title: {
          en: 'Build 2 real-world local problem projects',
          hi: 'असली समस्या हल करने वाले 2 प्रोजेक्ट बनाएं',
          ta: 'உண்மையான பிரச்சனையைத் தீர்க்கும் 2 திட்டங்களை உருவாக்குங்கள்',
          bn: 'বাস্তব সমস্যার সমাধান করে এমন ২টি প্রজেক্ট তৈরি করুন'
        },
        detail: {
          en: 'Solve a real problem around you (student expense tracker, local shop catalog, or exam timer) instead of copying tutorials.',
          hi: 'ट्यूटोरियल कॉपी करने के बजाय असली प्रोजेक्ट बनाएं (जैसे खर्च ट्रैकर, स्थानीय दुकान कैटलॉग)।',
          ta: 'டியூட்டோரியல் நகலெடுக்காமல் செலவுக் கணக்கு அல்லது உள்ளூர் கடை பட்டியல் போன்ற திட்டம் செய்யுங்கள்.',
          bn: 'টিউটোরিয়াল কপি না করে খরচের হিসাব বা স্থানীয় দোকানের ক্যাটালগের মতো আসল প্রজেক্ট তৈরি করুন।'
        }
      },
      {
        id: 'step-5',
        baseHours: 15,
        title: {
          en: 'Apply to internships & entry roles with proof of work',
          hi: 'लाइव प्रोजेक्ट लिंक के साथ इंटर्नशिप और नौकरी के लिए आवेदन करें',
          ta: 'நேரடி திட்ட இணைப்புகளுடன் பயிற்சி மற்றும் வேலைகளுக்கு விண்ணப்பிக்கவும்',
          bn: 'লাইভ প্রজেক্ট লিঙ্কসহ ইন্টার্নশিপ ও চাকরিতে আবেদন করুন'
        },
        detail: {
          en: 'Create a clean 1-page resume with live demo links and apply via NCS, LinkedIn, and local tech startups.',
          hi: 'लाइव डेमो लिंक के साथ 1-पेज रिज्यूमे बनाएं और NCS, LinkedIn व स्टार्टअप्स में आवेदन करें।',
          ta: 'நேரடி இணைப்புகளுடன் 1-பக்க சுயவிவரத்தை உருவாக்கி NCS மற்றும் ஸ்டார்ட்அப்களுக்கு விண்ணப்பிக்கவும்.',
          bn: 'লাইভ ডেমো লিঙ্কসহ ১-পাতার সিভি তৈরি করে NCS ও স্টার্টআপগুলোতে আবেদন করুন।'
        }
      }
    ],
    resourceIds: ['res-freecodecamp', 'res-mdn', 'res-odin', 'res-github-pages'],
    nextAction: {
      en: 'Open MDN Learn Web Development or freeCodeCamp right now and complete the first 20-minute HTML lesson—even from your phone browser.',
      hi: 'अभी MDN वेब डॉक्स या freeCodeCamp खोलें और पहला 20 मिनट का HTML पाठ पूरा करें—आप इसे अपने फोन ब्राउज़र पर भी कर सकते हैं।',
      ta: 'இப்போதே MDN அல்லது freeCodeCamp-ஐத் திறந்து முதல் 20 நிமிட HTML பாடத்தை உங்கள் போன் உலாவியிலேயே முடியுங்கள்.',
      bn: 'এখনই MDN বা freeCodeCamp খুলে প্রথম ২০ মিনিটের HTML পাঠটি শেষ করুন—এটি মোবাইল ব্রাউজারেও করা যায়।'
    }
  },
  {
    id: 'after-12-budget',
    domain: 'govt',
    keywords: [
      'class 12', '12th', 'after 12', 'budget', 'college', 'degree', 'scholarship', 'career path',
      '12वीं', 'कक्षा 12', 'कम बजट', 'छात्रवृत्ति', 'कॉलेज',
      '12-ஆம் வகுப்பு', 'பள்ளி', 'குறைந்த செலவு', 'உதவித்தொகை',
      'দ্বাদশ', 'ক্লাস ১২', 'কম বাজেট', 'বৃত্তি', 'কলেজ'
    ],
    starterQuestion: {
      en: 'Career paths after Class 12 on a tight budget',
      hi: 'कम बजट में 12वीं के बाद सही करियर विकल्प क्या हैं?',
      ta: 'குறைந்த செலவில் 12-ஆம் வகுப்பிற்குப் பிறகான சிறந்த தொழில் வழிகள்?',
      bn: 'কম বাজেটে দ্বাদশ শ্রেণির পর কী কী ক্যারিয়ারের সুযোগ আছে?'
    },
    title: {
      en: 'Post-Class 12 Smart Career & Scholarship Path (Low Cost)',
      hi: '12वीं के बाद कम खर्च में स्मार्ट करियर और छात्रवृत्ति योजना',
      ta: '12-ஆம் வகுப்பிற்குப் பின் குறைந்த செலவு தொழில் & கல்வி உதவித்தொகை வழி',
      bn: 'দ্বাদশ শ্রেণির পর কম খরচে স্মার্ট ক্যারিয়ার ও বৃত্তি পরিকল্পনা'
    },
    overview: {
      en: 'On a tight budget after Class 12, avoid expensive private coaching loans. Combine an affordable/open degree (govt college, IGNOU, or state university) + central/state scholarships (NSP) + one practical job-ready skill (IT, Data, Design, or Accounting).',
      hi: '12वीं के बाद महंगी कोचिंग के लिए कर्ज लेने से बचें। सरकारी/ओपन कॉलेज की सस्ती डिग्री (जैसे राज्य विश्वविद्यालय या IGNOU) + NSP छात्रवृत्ति + एक प्रैक्टिकल स्किल (IT, डेटा, डिज़ाइन या अकाउंटिंग) को जोड़ें।',
      ta: '12-ஆம் வகுப்பிற்குப் பின் அதிக கடன் வாங்கி தனியார் பயிற்சிக்குச் செல்ல வேண்டாம். அரசு/திறந்தநிலை கல்லூரிப் படிப்பு + NSP உதவித்தொகை + ஒரு நடைமுறைத் திறன் (IT, Data, Design) ஆகியவற்றை இணைத்துப் படியுங்கள்.',
      bn: 'দ্বাদশ শ্রেণির পর দামি কোচিংয়ের জন্য ঋণ নেবেন না। সাশ্রয়ী সরকারি/ওপেন ডিগ্রি (রাজ্য বিশ্ববিদ্যালয় বা IGNOU) + NSP বৃত্তি + একটি বাস্তব দক্ষতা (IT, ডেটা, ডিজাইন বা অ্যাকাউন্টিং) একসাথে নিন।'
    },
    coreSkills: {
      en: [
        'Digital Literacy & Spreadsheets / LibreOffice',
        'Scholarship & Affordable Degree Application Planning',
        'One Primary Marketable Skill (Web, Data, or Design)',
        'Workplace English & Clear Written Communication',
        'Time Splitting Between Degree & Skill Projects'
      ],
      hi: [
        'कंप्यूटर की बेसिक समझ और स्प्रेडशीट / LibreOffice',
        'छात्रवृत्ति (NSP) और सस्ते कॉलेज की सही योजना',
        'एक मुख्य रोजगार-योग्य कौशल (वेब, डेटा या डिज़ाइन)',
        'कार्यस्थल की अंग्रेजी और स्पष्ट संवाद',
        'डिग्री और स्किल प्रोजेक्ट के बीच समय प्रबंधन'
      ],
      ta: [
        'அடிப்படை கணினி & விரிதாள் (Spreadsheets) திறன்',
        'கல்வி உதவித்தொகை மற்றும் குறைந்த கட்டணப் படிப்பு திட்டமிடல்',
        'வேலைவாய்ப்பு தரும் ஒரு முதன்மைத் திறன் (Web, Data, Design)',
        'அலுவலக ஆங்கிலம் மற்றும் தெளிவான தொடர்பு',
        'கல்லூரிப் படிப்புக்கும் திறன் பயிற்சிக்கும் நேரம் பிரித்தல்'
      ],
      bn: [
        'মৌলিক কম্পিউটার ও স্প্রেডশিট / LibreOffice দক্ষতা',
        'বৃত্তি (NSP) ও সাশ্রয়ী ডিগ্রির সঠিক পরিকল্পনা',
        'একটি প্রধান চাকরিমুখী দক্ষতা (ওয়েব, ডেটা বা ডিজাইন)',
        'কর্মক্ষেত্রের ইংরেজি ও স্পষ্ট যোগাযোগ',
        'ডিগ্রি ও স্কিল প্রজেক্টের মধ্যে সময় বণ্টন'
      ]
    },
    steps: [
      {
        id: 'step-1',
        baseHours: 8,
        title: {
          en: 'Map affordable colleges & check NSP scholarships',
          hi: 'सस्ते सरकारी/ओपन कॉलेज और NSP छात्रवृत्ति जांचें',
          ta: 'குறைந்த கட்டணக் கல்லூரிகள் & NSP உதவித்தொகைகளைச் சரிபார்க்கவும்',
          bn: 'সাশ্রয়ী কলেজ ও NSP বৃত্তির যোগ্যতা যাচাই করুন'
        },
        detail: {
          en: 'List state govt colleges, community polytechnics, or IGNOU programs and bookmark NSP deadlines.',
          hi: 'सरकारी डिग्री कॉलेज, पॉलिटेक्निक या IGNOU विकल्प लिखें और NSP आवेदन तारीख सेव करें।',
          ta: 'அரசு கலை/அறிவியல் கல்லூரி, பாலிடெக்னிக் அல்லது IGNOU படிப்புகளையும் NSP தேதிகளையும் குறிக்கவும்.',
          bn: 'সরকারি কলেজ, পলিটেকনিক বা IGNOU কোর্সের তালিকা করুন এবং NSP আবেদনের তারিখ সেভ করুন।'
        }
      },
      {
        id: 'step-2',
        baseHours: 15,
        title: {
          en: 'Build strong digital & office fundamentals',
          hi: 'मजबूत डिजिटल और ऑफिस कंप्यूटर कौशल सीखें',
          ta: 'அடிப்படை டிஜிட்டல் மற்றும் அலுவலக கணினி திறனைப் பெறுங்கள்',
          bn: 'ডিজিটাল ও অফিস কম্পিউটারের শক্ত ভিত্তি তৈরি করুন'
        },
        detail: {
          en: 'Complete Spoken Tutorial (IIT Bombay) modules for LibreOffice Calc/Writer and basic internet productivity.',
          hi: 'Spoken Tutorial (IIT बॉम्बे) से LibreOffice Calc, Writer और डिजिटल कामकाज मुफ्त सीखें।',
          ta: 'Spoken Tutorial (IIT பாம்பே) மூலம் உங்கள் தாய்மொழியில் LibreOffice மற்றும் கணினி திறன் கற்கவும்.',
          bn: 'Spoken Tutorial (IIT বম্বে) থেকে বাংলায় LibreOffice Calc ও ডিজিটাল দক্ষতা শিখুন।'
        }
      },
      {
        id: 'step-3',
        baseHours: 35,
        title: {
          en: 'Pick one skill track alongside your degree',
          hi: 'अपनी डिग्री के साथ एक प्रैक्टिकल स्किल ट्रैक चुनें',
          ta: 'பட்டப்படிப்புடன் ஒரு நடைமுறைத் திறன் துறையைத் தேர்ந்தெடுக்கவும்',
          bn: 'ডিগ্রির পাশাপাশি একটি বাস্তব স্কিল ট্র্যাক বেছে নিন'
        },
        detail: {
          en: 'Choose Web Dev (freeCodeCamp), Data/SQL (Kaggle + SQLBolt), or UI Design (Penpot) and commit 1 hour daily.',
          hi: 'वेब (freeCodeCamp), डेटा/SQL (Kaggle) या डिज़ाइन (Penpot) में से कोई एक चुनकर रोज़ 1 घंटा दें।',
          ta: 'Web Dev, Data/SQL அல்லது UI Design ஆகியவற்றில் ஒன்றைத் தேர்ந்து தினமும் 1 மணி நேரம் ஒதுக்கவும்.',
          bn: 'ওয়েব ডেভ, ডেটা/SQL বা UI ডিজাইনের মধ্যে একটি বেছে নিয়ে প্রতিদিন ১ ঘণ্টা সময় দিন।'
        }
      },
      {
        id: 'step-4',
        baseHours: 20,
        title: {
          en: 'Complete an accredited SWAYAM / NPTEL course',
          hi: 'SWAYAM / NPTEL से एक सरकारी प्रमाणित कोर्स पूरा करें',
          ta: 'SWAYAM / NPTEL மூலம் ஒரு இலவசப் பாடத்தை முடிக்கவும்',
          bn: 'SWAYAM / NPTEL থেকে একটি বিনামূল্যের কোর্স সম্পন্ন করুন'
        },
        detail: {
          en: 'Learning is 100% free on SWAYAM; use transcripts to save data and earn credits/knowledge early.',
          hi: 'SWAYAM पर सीखना पूरी तरह मुफ्त है; कम डेटा के लिए ट्रांसक्रिप्ट PDF का उपयोग करें।',
          ta: 'SWAYAM-ல் கற்பது 100% இலவசம்; டேட்டாவைச் சேமிக்க PDF குறிப்புகளைப் பயன்படுத்தவும்.',
          bn: 'SWAYAM-এ শেখা ১০০% ফ্রি; ডেটা বাঁচাতে PDF ট্রান্সক্রিপ্ট ব্যবহার করুন।'
        }
      }
    ],
    resourceIds: ['res-nsp-india', 'res-ncs-india', 'res-swayam-nptel', 'res-spoken-tutorial'],
    nextAction: {
      en: 'Visit scholarships.gov.in (NSP) to note central/state schemes you qualify for, then pick 1 skill track in the Free Resources tab.',
      hi: 'अभी scholarships.gov.in (NSP) पर अपनी पात्रता वाली छात्रवृत्ति देखें और "मुफ्त संसाधन" टैब से 1 स्किल चुनें।',
      ta: 'scholarships.gov.in (NSP) தளத்தில் உங்களுக்கான உதவித்தொகைகளைப் பார்த்து, இலவச வளங்கள் பகுதியில் 1 திறனைத் தேர்ந்தெடுக்கவும்.',
      bn: 'এখনই scholarships.gov.in (NSP) দেখে আপনার যোগ্য বৃত্তিগুলো নোট করুন এবং ফ্রি রিসোর্স ট্যাব থেকে ১টি স্কিল বেছে নিন।'
    }
  },
  {
    id: 'free-portfolio',
    domain: 'tech',
    keywords: [
      'portfolio', 'projects', 'free tools', 'github', 'resume', 'showcase', 'phone',
      'पोर्टफोलियो', 'प्रोजेक्ट', 'मुफ्त टूल', 'रिज्यूमे',
      'போர்ட்ஃபோலியோ', 'திட்டம்', 'இலவச கருவி',
      'পোর্টফোলিও', 'প্রজেক্ট', 'ফ্রি টুল', 'সিভি'
    ],
    starterQuestion: {
      en: 'How to build a portfolio using only free tools?',
      hi: 'सिर्फ मुफ्त टूल्स से मजबूत पोर्टफোলियो कैसे बनाएं?',
      ta: 'இலவச கருவிகளை மட்டுமே கொண்டு போர்ட்ஃபோலியோ உருவாக்குவது எப்படி?',
      bn: 'শুধুমাত্র ফ্রি টুল ব্যবহার করে পোর্টফোলিও কীভাবে তৈরি করব?'
    },
    title: {
      en: 'Zero-Cost Portfolio Building Guide (Free Tools Only)',
      hi: 'बिना पैसे खर्च किए पोर्टफোলियो बनाने की गाइड',
      ta: 'பூஜ்ஜிய செலவில் போர்ட்ஃபோலியோ உருவாக்கும் வழிகாட்டி',
      bn: 'বিনা খরচে পোর্টফোলিও তৈরির সম্পূর্ণ গাইড'
    },
    overview: {
      en: 'A strong portfolio proves what you can build—not how much you paid for software or hosting. With GitHub Pages, freeCodeCamp/Kaggle, and Penpot, you can publish a fast, credible portfolio site and 3 case studies for ₹0.',
      hi: 'मजबूत पोर्टफোলियो यह दिखाता है कि आप क्या बना सकते हैं—यह नहीं कि आपने सॉफ्टवेयर पर कितना खर्च किया। GitHub Pages, Kaggle और Penpot से आप ₹0 में अपना पोर्टफোলियो और 3 प्रोजेक्ट लाइव कर सकते हैं।',
      ta: 'சிறந்த போர்ட்ஃபோலியோ உங்கள் திறமையைக் காட்டுகிறது—செலவை அல்ல. GitHub Pages, Kaggle மற்றும் Penpot மூலம் ₹0 செலவில் 3 திட்டங்களை வெளியிடலாம்.',
      bn: 'ভালো পোর্টফোলিও দেখায় আপনি কী বানাতে পারেন—সফটওয়্যারে কত খরচ করেছেন তা নয়। GitHub Pages, Kaggle এবং Penpot দিয়ে ₹0 খরচেই ৩টি প্রজেক্ট প্রকাশ করা যায়।'
    },
    coreSkills: {
      en: [
        'Writing Clear Problem-Solution Case Studies',
        'Clean Single-Page HTML/CSS Portfolio Layout',
        'GitHub Repository Hygiene & Screenshots',
        'Zero-Cost Static Hosting (GitHub Pages)',
        'Self-Testing on Mobile Screens'
      ],
      hi: [
        'समस्या और समाधान पर आधारित केस स्टडी लिखना',
        'साफ सिंगल-पेज पोर्टफোলियो लेआउट',
        'GitHub रिपॉजिटरी और README साफ रखना',
        'GitHub Pages पर मुफ्त लाइव होस्टिंग',
        'मोबाइल स्क्रीन पर खुद टेस्ट करना'
      ],
      ta: [
        'சிக்கல்-தீர்வு அடிப்படையில் விளக்கம் எழுதுதல்',
        'தெளிவான ஒற்றைப் பக்க போர்ட்ஃபோலியோ வடிவமைப்பு',
        'GitHub README மற்றும் திரைக்காட்சிகள் சேர்த்தல்',
        'GitHub Pages மூலம் இலவச ஹோஸ்டிங்',
        'மொபைல் திரையில் சரிபார்த்தல்'
      ],
      bn: [
        'সমস্যা ও সমাধানভিত্তিক কেস স্টাডি লেখা',
        'পরিচ্ছন্ন সিঙ্গেল-পেজ পোর্টফোলিও লেআউট',
        'GitHub রিপোজিটরি ও README সুন্দর রাখা',
        'GitHub Pages-এ ফ্রি হোস্টিং',
        'মোবাইল স্ক্রিনে নিজে পরীক্ষা করা'
      ]
    },
    steps: [
      {
        id: 'step-1',
        baseHours: 8,
        title: {
          en: 'Pick 3 focused projects (quality over quantity)',
          hi: 'सिर्फ 3 अच्छे प्रोजेक्ट चुनें (संख्या से ज्यादा गुणवत्ता)',
          ta: 'தரமான 3 திட்டங்களைத் தேர்ந்தெடுக்கவும்',
          bn: 'সংখ্যা নয়, মানে ভালো এমন ৩টি প্রজেক্ট বেছে নিন'
        },
        detail: {
          en: 'Choose 1 beginner utility, 1 data/problem-solving piece, and 1 practical local-use project.',
          hi: '1 छोटा यूटिलिटी टूल, 1 डेटा/लॉजिक प्रोजेक्ट और 1 स्थानीय जरूरत से जुड़ा प्रोजेक्ट चुनें।',
          ta: '1 அடிப்படைக் கருவி, 1 தரவு/தர்க்கத் திட்டம், 1 உள்ளூர் பயன்பாட்டுத் திட்டத்தைத் தேர்ந்தெடுக்கவும்.',
          bn: '১টি ছোট ইউটিলিটি, ১টি ডেটা/লজিক প্রজেক্ট এবং ১টি স্থানীয় সমস্যার সমাধান বেছে নিন।'
        }
      },
      {
        id: 'step-2',
        baseHours: 12,
        title: {
          en: 'Write a 4-line README for each project',
          hi: 'हर प्रोजेक्ट के लिए 4-लाइन का स्पष्ट README लिखें',
          ta: 'ஒவ்வொரு திட்டத்திற்கும் 4-வரி README எழுதுங்கள்',
          bn: 'প্রতিটি প্রজেক্টের জন্য ৪-লাইনের স্পষ্ট README লিখুন'
        },
        detail: {
          en: 'Explain: (1) Problem solved, (2) Free tools used, (3) How to use it, (4) What you learned.',
          hi: 'लिखें: (1) समस्या क्या थी, (2) कौन-से मुफ्त टूल इस्तेमाल किए, (3) कैसे चलाएं, (4) आपने क्या सीखा।',
          ta: '(1) தீர்த்த பிரச்சனை, (2) இலவச கருவிகள், (3) பயன்படுத்தும் முறை, (4) கற்ற பாடங்களை எழுதுங்கள்.',
          bn: 'লিখুন: (১) কী সমস্যা সমাধান হয়েছে, (২) কী ফ্রি টুল লেগেছে, (৩) ব্যবহারবিধি, (৪) কী শিখেছেন।'
        }
      },
      {
        id: 'step-3',
        baseHours: 10,
        title: {
          en: 'Create & publish a fast 1-page site on GitHub Pages',
          hi: 'GitHub Pages पर एक हल्का 1-पेज पोर्टफোলियो पब्लिश करें',
          ta: 'GitHub Pages-ல் வேகமான 1-பக்க தளத்தை வெளியிடுங்கள்',
          bn: 'GitHub Pages-এ দ্রুত লোড হওয়া ১-পাতার সাইট প্রকাশ করুন'
        },
        detail: {
          en: 'Use plain semantic HTML + clean CSS so recruiters on mobile networks open it in under 1 second.',
          hi: 'साधारण HTML और साफ CSS का इस्तेमाल करें ताकि रिक्रूटर के फोन पर भी पेज तुरंत खुले।',
          ta: 'சாதாரண HTML & CSS பயன்படுத்தி 1 வினாடியில் திறக்கும் வகையில் உருவாக்குங்கள்.',
          bn: 'সহজ HTML ও CSS ব্যবহার করুন যাতে রিক্রুটারের ফোনেও পেজটি ১ সেকেন্ডের কম সময়ে খোলে।'
        }
      }
    ],
    resourceIds: ['res-github-pages', 'res-mdn', 'res-penpot', 'res-freecodecamp'],
    nextAction: {
      en: 'Draft a 4-line problem/solution note for 1 project you want to showcase, and create a free GitHub account if you do not have one yet.',
      hi: 'अपने किसी 1 प्रोजेक्ट के लिए 4 लाइन का विवरण लिखें और यदि अभी तक नहीं है तो मुफ्त GitHub अकाउंट बनाएं।',
      ta: 'நீங்கள் காட்ட விரும்பும் 1 திட்டத்திற்கு 4-வரி விளக்கத்தை எழுதி, இலவச GitHub கணக்கைத் தொடங்குங்கள்.',
      bn: 'আপনার ১টি প্রজেক্টের জন্য ৪ লাইনের বিবরণ লিখুন এবং না থাকলে একটি ফ্রি GitHub অ্যাকাউন্ট খুলুন।'
    }
  },
  {
    id: 'data-analyst-free',
    domain: 'data',
    keywords: [
      'data', 'analyst', 'analytics', 'sql', 'excel', 'python', 'pandas', 'statistics', 'kaggle',
      'डेटा', 'एनालिस्ट', 'एक्सेल', 'पायथन',
      'தரவு', 'டேட்டா', 'பகுப்பாய்வு',
      'ডেটা', 'অ্যানালিস্ট', 'এক্সেল', 'পাইথন'
    ],
    starterQuestion: {
      en: 'How to become a Data Analyst using only free resources?',
      hi: 'सिर्फ मुफ्त संसाधनों से डेटा एनालिस्ट कैसे बनें?',
      ta: 'இலவச வளங்களைக் கொண்டு Data Analyst ஆவது எப்படி?',
      bn: 'শুধুমাত্র ফ্রি রিসোর্স দিয়ে কীভাবে ডেটা অ্যানালিস্ট হওয়া যায়?'
    },
    title: {
      en: 'Data Analyst Roadmap (Spreadsheets → SQL → Python)',
      hi: 'डेटा एनालिस्ट रोडमैप (स्प्रेडशीट → SQL → पायथन)',
      ta: 'Data Analyst வழிகாட்டி (விரிதாள் → SQL → Python)',
      bn: 'ডেটা অ্যানালিস্ট রোডম্যাপ (স্প্রেডশিট → SQL → পাইথন)'
    },
    overview: {
      en: 'Data analysis does not require expensive degrees or heavy hardware. Start with spreadsheets and basic statistics, master SQL in browser sandboxes, and practice Python/Pandas on free cloud notebooks like Kaggle.',
      hi: 'डेटा एनालिसिस के लिए महंगे लैपटॉप या डिग्री की जरूरत नहीं है। स्प्रेडशीट व सांख्यिकी से शुरू करें, ब्राउज़र में SQL सीखें और Kaggle के मुफ्त क्लाउड नोटबुक पर Python/Pandas का अभ्यास करें।',
      ta: 'Data Analyst ஆக விலையுயர்ந்த லேப்டாப் தேவையில்லை. விரிதாள் & புள்ளியியலில் தொடங்கி, உலாவியில் SQL கற்று, Kaggle இலவச கிளவுட்டில் Python பயிற்சி செய்யுங்கள்.',
      bn: 'ডেটা অ্যানালিস্ট হতে দামি ল্যাপটপ বা ডিগ্রির দরকার নেই। স্প্রেডশিট ও পরিসংখ্যান দিয়ে শুরু করে ব্রাউজারে SQL এবং Kaggle-এর ফ্রি ক্লাউড নোটবুকে Python অনুশীলন করুন।'
    },
    coreSkills: {
      en: [
        'Spreadsheets (Sorting, Pivot Tables, Formulas)',
        'SQL Queries (JOIN, GROUP BY, Aggregations)',
        'Basic Statistics & Data Cleaning',
        'Python & Pandas in Cloud Notebooks',
        'Clear Charting & Insight Summaries'
      ],
      hi: [
        'स्प्रेडशीट (फिल्टर, पिवट टेबल, फॉर्मूला)',
        'SQL क्वेरी (JOIN, GROUP BY, एग्रीगेशन)',
        'बुनियादी सांख्यिकी और डेटा सफाई',
        'क्लाउड नोटबुक में Python और Pandas',
        'सरल चार्ट और निष्कर्ष लिखना'
      ],
      ta: [
        'விரிதாள் (Pivot Tables, Formulas)',
        'SQL வினவல்கள் (JOIN, GROUP BY)',
        'அடிப்படை புள்ளியியல் & தரவு சுத்தம் செய்தல்',
        'கிளவுட் நோட்புக்கில் Python & Pandas',
        'தெளிவான விளக்கப்படம் மற்றும் முடிவுகள்'
      ],
      bn: [
        'স্প্রেডশিট (Pivot Table, ফর্মুলা)',
        'SQL কুয়েরি (JOIN, GROUP BY)',
        'মৌলিক পরিসংখ্যান ও ডেটা ক্লিনিং',
        'ক্লাউড নোটবুকে Python ও Pandas',
        'সহজ চার্ট ও ইনসাইট লেখা'
      ]
    },
    steps: [
      {
        id: 'step-1',
        baseHours: 15,
        title: {
          en: 'Master LibreOffice Calc / Google Sheets formulas',
          hi: 'LibreOffice Calc / Google Sheets फॉर्मूला सीखें',
          ta: 'LibreOffice Calc / Google Sheets சூத்திரங்களைக் கற்கவும்',
          bn: 'LibreOffice Calc / Google Sheets ফর্মুলা শিখুন'
        },
        detail: {
          en: 'Practice SUMIFS, VLOOKUP/XLOOKUP, and Pivot Tables on sample sales or school datasets.',
          hi: 'बिक्री या छात्र डेटा पर SUMIFS, VLOOKUP और पिवट टेबल का अभ्यास करें।',
          ta: 'விற்பனை அல்லது பள்ளி தரவுகளில் SUMIFS, VLOOKUP, Pivot Table பயிற்சி செய்யுங்கள்.',
          bn: 'স্যাম্পল ডেটায় SUMIFS, VLOOKUP ও Pivot Table অনুশীলন করুন।'
        }
      },
      {
        id: 'step-2',
        baseHours: 20,
        title: {
          en: 'Complete interactive SQL lessons on SQLBolt',
          hi: 'SQLBolt पर सभी इंटरैक्टिव SQL अभ्यास पूरे करें',
          ta: 'SQLBolt-ல் செயல்முறை SQL பாடங்களை முடியுங்கள்',
          bn: 'SQLBolt-এ ইন্টারঅ্যাক্টিভ SQL অনুশীলন শেষ করুন'
        },
        detail: {
          en: 'Learn SELECT, WHERE, JOINs, and GROUP BY directly in your browser using minimal data.',
          hi: 'कम डेटा में सीधे ब्राउज़र से SELECT, WHERE, JOIN और GROUP BY सीखें।',
          ta: 'குறைந்த டேட்டாவில் SELECT, WHERE, JOIN, GROUP BY கற்றுக்கொள்ளுங்கள்.',
          bn: 'খুব কম ডেটায় সরাসরি ব্রাউজার থেকে SELECT, WHERE, JOIN ও GROUP BY শিখুন।'
        }
      },
      {
        id: 'step-3',
        baseHours: 25,
        title: {
          en: 'Learn Statistics & Python/Pandas on Khan Academy + Kaggle',
          hi: 'Khan Academy से सांख्यिकी और Kaggle से Python/Pandas सीखें',
          ta: 'Khan Academy-ல் புள்ளியியல் மற்றும் Kaggle-ல் Python கற்கவும்',
          bn: 'Khan Academy-তে পরিসংখ্যান ও Kaggle-এ Python/Pandas শিখুন'
        },
        detail: {
          en: 'Understand mean/median/variance and complete Kaggle Python + Pandas micro-courses in the browser.',
          hi: 'औसत, मीडियन समझें और Kaggle के मुफ्त क्लाउड नोटबुक में Python व Pandas पूरा करें।',
          ta: 'சராசரி, இடைநிலை கற்று Kaggle-ன் இலவச Python & Pandas பாடங்களை முடியுங்கள்.',
          bn: 'গড়-মধ্যমা বুঝে Kaggle-এর ফ্রি Python ও Pandas কোর্স সম্পন্ন করুন।'
        }
      },
      {
        id: 'step-4',
        baseHours: 25,
        title: {
          en: 'Publish 2 public data analysis notebooks',
          hi: '2 सार्वजनिक डेटा विश्लेषण प्रोजेक्ट पब्लिश करें',
          ta: '2 பொது தரவு பகுப்பாய்வு திட்டங்களை வெளியிடுங்கள்',
          bn: '২টি পাবলিক ডেটা অ্যানালাইসিস নোটবুক প্রকাশ করুন'
        },
        detail: {
          en: 'Analyze an open Indian public dataset (crop prices, transit, education) and summarize 5 clear takeaways.',
          hi: 'किसी खुले भारतीय डेटासेट (कृषि, शिक्षा, परिवहन) का विश्लेषण कर 5 मुख्य निष्कर्ष लिखें।',
          ta: 'பொதுத் தரவுகளை (விவசாயம், கல்வி) ஆய்வு செய்து 5 முக்கிய முடிவுகளை எழுதுங்கள்.',
          bn: 'যেকোনো ওপেন ডেটাসেট (কৃষি, শিক্ষা, পরিবহন) বিশ্লেষণ করে ৫টি স্পষ্ট সিদ্ধান্ত লিখুন।'
        }
      }
    ],
    resourceIds: ['res-sqlbolt', 'res-kaggle-learn', 'res-khan-india', 'res-spoken-tutorial'],
    nextAction: {
      en: 'Open SQLBolt on your phone or computer and finish Lessons 1 to 3 (takes ~25 minutes, very low data).',
      hi: 'अभी SQLBolt खोलें और पाठ 1 से 3 पूरा करें (लगभग 25 मिनट, बेहद कम डेटा)।',
      ta: 'இப்போதே SQLBolt-ஐத் திறந்து பாடம் 1 முதல் 3 வரை முடியுங்கள் (~25 நிமிடங்கள், மிகக் குறைந்த டேட்டா).',
      bn: 'এখনই SQLBolt খুলে পাঠ ১ থেকে ৩ শেষ করুন (প্রায় ২৫ মিনিট, খুবই কম ডেটা)।'
    }
  },
  {
    id: 'ui-design-free',
    domain: 'design',
    keywords: [
      'design', 'ui', 'ux', 'graphic', 'figma', 'penpot', 'creative',
      'डिज़ाइन', 'यूआई', 'ग्राफिक',
      'வடிவமைப்பு', 'டிசைன்',
      'ডিজাইন', 'গ্রাফিক'
    ],
    starterQuestion: {
      en: 'How to learn UI/UX Design without paid software?',
      hi: 'बिना पेड सॉफ्टवेयर के UI/UX डिज़ाइन कैसे सीखें?',
      ta: 'கட்டண மென்பொருள் இன்றி UI/UX வடிவமைப்பு கற்பது எப்படி?',
      bn: 'পেইড সফটওয়্যার ছাড়াই কীভাবে UI/UX ডিজাইন শিখব?'
    },
    title: {
      en: 'UI/UX & Digital Product Design (Open-Source Path)',
      hi: 'UI/UX और डिजिटल प्रोडक्ट डिज़ाइन (100% मुफ्त और ओपन-सोर्स)',
      ta: 'UI/UX வடிவமைப்பு வழிகாட்டி (100% இலவச தளம்)',
      bn: 'UI/UX ও ডিজিটাল প্রোডাক্ট ডিজাইন (ওপেন-সোর্স পথ)'
    },
    overview: {
      en: 'Good design is about solving user friction, clear hierarchy, and accessibility—not expensive tools. Learn core UX laws and practice layout + prototyping using Penpot, a 100% free open-source tool.',
      hi: 'अच्छा डिज़ाइन महंगे सॉफ्टवेयर से नहीं, बल्कि उपयोगकर्ता की समस्या समझने, सही लेआउट और स्पष्ट पठनीयता से आता है। UX के नियम सीखें और 100% मुफ्त Penpot पर अभ्यास करें।',
      ta: 'சிறந்த வடிவமைப்பு பயனர் சிக்கல்களைத் தீர்ப்பதில்தான் உள்ளது. UX விதிகளைக் கற்று, 100% இலவச Penpot கருவியில் பயிற்சி செய்யுங்கள்.',
      bn: 'ভালো ডিজাইন মানে ব্যবহারকারীর সমস্যা সহজ করা—দামি সফটওয়্যার নয়। UX নীতি শিখুন এবং ১০০% ফ্রি ওপেন-সোর্স Penpot-এ অনুশীলন করুন।'
    },
    coreSkills: {
      en: [
        'Visual Hierarchy, Contrast & Typography',
        'Mobile-First Wireframing',
        'Usability Heuristics & Accessibility',
        'Prototyping in Open-Source Penpot',
        'Writing Concise Case Studies'
      ],
      hi: [
        'विजुअल पदानुक्रम, कंट्रास्ट और टाइपोग्राफी',
        'मोबाइल-फर्स्ट वायरफ्रेमिंग',
        'उपयोगिता और सुलभता (Accessibility)',
        'Penpot में प्रोटोटाइपिंग',
        'संक्षिप्त केस स्टडी लिखना'
      ],
      ta: [
        'எழுத்து அமைப்பு, வண்ண வேறுபாடு (Contrast)',
        'மொபைல்-முதல் வயர்ஃபிரேமிங்',
        'பயன்பாட்டு எளிமை மற்றும் அணுகல்தன்மை',
        'Penpot-ல் மாதிரி வடிவமைப்பு',
        'சுருக்கமான கேஸ் ஸ்டடி எழுதுதல்'
      ],
      bn: [
        'ভিজ্যুয়াল হায়ারার্কি, কনট্রাস্ট ও টাইপোগ্রাফি',
        'মোবাইল-ফার্স্ট ওয়্যারফ্রেমিং',
        'ব্যবহারযোগ্যতা ও অ্যাক্সেসিবিলিটি',
        'Penpot-এ প্রোটোটাইপিং',
        'সংক্ষিপ্ত কেস স্টাডি লেখা'
      ]
    },
    steps: [
      {
        id: 'step-1',
        baseHours: 10,
        title: {
          en: 'Study core UX principles & paper wireframing',
          hi: 'UX नियम सीखें और कागज पर वायरफ्रेम बनाएं',
          ta: 'UX விதிகளைப் படித்து காகிதத்தில் வரைபடம் வரையுங்கள்',
          bn: 'UX নীতি পড়ে কাগজে ওয়্যারফ্রেম আঁকুন'
        },
        detail: {
          en: 'Read Laws of UX and sketch 3 everyday Indian mobile screens (ticket booking, ration/utility app) on paper.',
          hi: 'Laws of UX पढ़ें और रोजमर्रा के 3 मोबाइल ऐप स्क्रीन (टिकट बुकिंग, बिल ऐप) कागज पर स्केच करें।',
          ta: 'Laws of UX படித்து, தினசரி பயன்படுத்தும் 3 செயலிகளின் திரைகளைக் காகிதத்தில் வரையுங்கள்.',
          bn: 'Laws of UX পড়ে দৈনন্দিন ৩টি মোবাইল অ্যাপের স্ক্রিন কাগজে স্কেচ করুন।'
        }
      },
      {
        id: 'step-2',
        baseHours: 20,
        title: {
          en: 'Build interactive screens in Penpot',
          hi: 'Penpot में इंटरैक्टिव स्क्रीन बनाएं',
          ta: 'Penpot-ல் செயல்முறை திரைகளை உருவாக்குங்கள்',
          bn: 'Penpot-এ ইন্টারঅ্যাক্টিভ স্ক্রিন তৈরি করুন'
        },
        detail: {
          en: 'Turn your paper sketches into clean reusable components and clickable flows in Penpot.',
          hi: 'अपने कागज के स्केच को Penpot में साफ कंपोनेंट और क्लिक करने योग्य फ्लो में बदलें।',
          ta: 'உங்கள் காகித வரைபடங்களை Penpot-ல் கிளிக் செய்யக்கூடிய வடிவமைப்பாக மாற்றுங்கள்.',
          bn: 'কাগজের স্কেচগুলোকে Penpot-এ পরিচ্ছন্ন কম্পোনেন্ট ও ক্লিকেবল ফ্লোতে রূপান্তর করুন।'
        }
      },
      {
        id: 'step-3',
        baseHours: 20,
        title: {
          en: 'Publish 2 redesign case studies',
          hi: '2 रीडिज़ाइन केस स्टडी पब्लिश करें',
          ta: '2 மறுவடிவமைப்பு கேஸ் ஸ்டடிகளை வெளியிடுங்கள்',
          bn: '২টি রিডিজাইন কেস স্টাডি প্রকাশ করুন'
        },
        detail: {
          en: 'Pick a confusing local form or website, fix contrast/tap-targets, and explain before vs. after clearly.',
          hi: 'किसी जटिल सरकारी या स्थानीय फॉर्म को सरल बनाएं और पहले बनाम बाद का फर्क समझाएं।',
          ta: 'சிக்கலான ஒரு படிவத்தை எளிதாக்கி, மாற்றத்திற்கு முன்/பின் காரணங்களை விளக்குங்கள்.',
          bn: 'কঠিন কোনো ফর্ম বা ওয়েবসাইট সহজ করে আগের ও পরের পার্থক্য স্পষ্টভাবে লিখুন।'
        }
      }
    ],
    resourceIds: ['res-penpot', 'res-laws-of-ux', 'res-mdn', 'res-github-pages'],
    nextAction: {
      en: 'Read 3 rules on lawsofux.com and sketch a cleaner login-free bus or train ticket screen on paper.',
      hi: 'lawsofux.com पर 3 नियम पढ़ें और कागज पर एक आसान बस या ट्रेन टिकट स्क्रीन स्केच करें।',
      ta: 'lawsofux.com-ல் 3 விதிகளைப் படித்து, எளிய பேருந்து/ரயில் டிக்கெட் திரையைக் காகிதத்தில் வரையுங்கள்.',
      bn: 'lawsofux.com-এ ৩টি নিয়ম পড়ুন এবং কাগজে একটি সহজ বাস বা ট্রেন টিকিট স্ক্রিন স্কেচ করুন।'
    }
  },
  {
    id: 'govt-exam-structured',
    domain: 'govt',
    keywords: [
      'govt', 'government', 'exam', 'upsc', 'ssc', 'banking', 'railway', 'competitive', 'coaching',
      'सरकारी', 'परीक्षा', 'यूपीएससी', 'एसएससी', 'बैंकिंग', 'रेलवे', 'कोचिंग',
      'அரசு', 'தேர்வு', 'போட்டித் தேர்வு', 'டிஎன்பிஎஸ்சி',
      'সরকারি', 'চাকরি', 'পরীক্ষা', 'বিসিএস', 'রেলওয়ে', 'এসএসসি'
    ],
    starterQuestion: {
      en: 'How to prepare for Govt exams without paid coaching?',
      hi: 'बिना पेड कोचिंग के सरकारी परीक्षा की तैयारी कैसे करें?',
      ta: 'கட்டணப் பயிற்சியின்றி அரசுத் தேர்வுகளுக்குத் தயாராவது எப்படி?',
      bn: 'পেইড কোচিং ছাড়া সরকারি পরীক্ষার প্রস্তুতি কীভাবে নেব?'
    },
    title: {
      en: 'Self-Study Govt & Competitive Exam Strategy (Zero Coaching)',
      hi: 'बिना कोचिंग सरकारी व प्रतियोगी परीक्षा रणनीति',
      ta: 'சுய-கற்றல் அரசு போட்டித் தேர்வு திட்டம்',
      bn: 'কোচিং ছাড়া সরকারি ও প্রতিযোগিতামূলক পরীক্ষার প্রস্তুতি'
    },
    overview: {
      en: 'Thousands of candidates clear SSC, Banking, Railway, State PSC, and UPSC through strict syllabus discipline, NCERT foundations, and Previous Year Question (PYQ) analysis—not ₹1 lakh coaching batches. Always pair preparation with a backup job skill.',
      hi: 'SSC, बैंकिंग, रेलवे, राज्य PSC और UPSC के लिए ₹1 लाख की कोचिंग से ज्यादा जरूरी है: सटीक सिलेबस, NCERT की बुनियाद और पिछले वर्षों के प्रश्न (PYQ)। साथ में एक बैकअप कौशल भी जरूर रखें।',
      ta: 'SSC, வங்கி, ரயில்வே மற்றும் அரசுத் தேர்வுகளில் வெற்றி பெற விலையுயர்ந்த பயிற்சி தேவையில்லை. பாடத்திட்டம், NCERT புத்தகங்கள் மற்றும் முந்தைய ஆண்டு வினாத்தாள்களே போதுமானது.',
      bn: 'SSC, ব্যাংকিং, রেলওয়ে ও রাজ্য PSC পরীক্ষার সাফল্যের মূল হলো সিলেবাস, NCERT বই ও বিগত বছরের প্রশ্ন (PYQ) বিশ্লেষণ—দামি কোচিং নয়। পাশাপাশি একটি ব্যাকআপ দক্ষতা রাখা বুদ্ধিমানের।'
    },
    coreSkills: {
      en: [
        'Syllabus Breakdown & Weightage Mapping',
        'NCERT Conceptual Base (Class 6–12)',
        'Quantitative Speed & Reasoning Practice',
        'Previous Year Question (PYQ) Error Log',
        'Parallel Backup Employable Skill'
      ],
      hi: [
        'सिलेबस और अंकों के भार को समझना',
        'NCERT (कक्षा 6–12) से मजबूत नींव',
        'गणित और रीजनिंग की नियमित गति',
        'पिछले वर्षों के प्रश्न (PYQ) और गलती नोटबुक',
        'साथ में एक बैकअप नौकरी कौशल'
      ],
      ta: [
        'பாடத்திட்டம் மற்றும் மதிப்பெண் பகிர்வு புரிதல்',
        'NCERT (வகுப்பு 6–12) அடிப்படைக் கல்வி',
        'கணிதம் மற்றும் காரணவியல் வேகப் பயிற்சி',
        'முந்தைய வினாத்தாள் பிழைப் பதிவேடு',
        'மாற்று வேலைவாய்ப்புத் திறன்'
      ],
      bn: [
        'সিলেবাস ও নম্বর বণ্টন বিশ্লেষণ',
        'NCERT (ষষ্ঠ–দ্বাদশ) থেকে শক্তিশালী ভিত্তি',
        'অঙ্ক ও রিজনিংয়ের নিয়মিত গতি অনুশীলন',
        'বিগত বছরের প্রশ্ন ও ভুল সংশোধন খাতা',
        'সমান্তরালে একটি ব্যাকআপ চাকরির দক্ষতা'
      ]
    },
    steps: [
      {
        id: 'step-1',
        baseHours: 8,
        title: {
          en: 'Download official syllabus & last 5 years of PYQs',
          hi: 'आधिकारिक सिलेबस और पिछले 5 साल के PYQ डाउनलोड करें',
          ta: 'அதிகாரப்பூர்வ பாடத்திட்டம் & கடந்த 5 ஆண்டு வினாத்தாள்களைப் பெறுங்கள்',
          bn: 'অফিসিয়াল সিলেবাস ও বিগত ৫ বছরের প্রশ্নপত্র সংগ্রহ করুন'
        },
        detail: {
          en: 'Never buy random guidebooks first; identify exact high-weightage topics from real past papers.',
          hi: 'अतिरिक्त किताबें खरीदने से पहले असली पुराने प्रश्नपत्रों से मुख्य विषय पहचानें।',
          ta: 'கண்ட புத்தகங்களை வாங்காமல், பழைய வினாத்தாள்களிலிருந்து முக்கிய தலைப்புகளைப் பட்டியலிடுங்கள்.',
          bn: 'গাদা গাদা বই না কিনে বিগত প্রশ্নপত্র দেখে বেশি নম্বর আসা অধ্যায়গুলো চিহ্নিত করুন।'
        }
      },
      {
        id: 'step-2',
        baseHours: 35,
        title: {
          en: 'Complete free NCERT & Khan Academy basics',
          hi: 'मुफ्त NCERT और Khan Academy से मूल विषय पक्के करें',
          ta: 'இலவச NCERT & Khan Academy மூலம் அடிப்படைகளை வலுப்படுத்துங்கள்',
          bn: 'ফ্রি NCERT ও Khan Academy দিয়ে মূল ভিত্তি পাকা করুন'
        },
        detail: {
          en: 'Read official NCERT PDFs (100% free) and drill basic arithmetic/percentage speed without paid test series.',
          hi: 'आधिकारिक मुफ्त NCERT PDF पढ़ें और प्रतिशत, अनुपात व सामान्य अध्ययन मजबूत करें।',
          ta: 'இலவச NCERT PDF படித்து, அடிப்படை கணித வேகத்தை மேம்படுத்துங்கள்.',
          bn: 'অফিসিয়াল ফ্রি NCERT PDF পড়ুন এবং শতাংশ, অনুপাত ও সাধারণ জ্ঞানের ভিত্তি গড়ুন।'
        }
      },
      {
        id: 'step-3',
        baseHours: 25,
        title: {
          en: 'Timed PYQ practice + error notebook',
          hi: 'टाइमर के साथ PYQ हल करें और गलती कॉपी बनाएं',
          ta: 'நேரக் கட்டுப்பாட்டுடன் PYQ பயிற்சி & பிழைக் குறிப்பேடு',
          bn: 'সময় ধরে PYQ অনুশীলন ও ভুলের খাতা তৈরি'
        },
        detail: {
          en: 'Solve one past paper weekly with a phone timer and review every wrong answer before starting new chapters.',
          hi: 'हर हफ्ते फोन टाइमर लगाकर एक पुराना पेपर हल करें और हर गलती को दोबारा सुधारें।',
          ta: 'வாரந்தோறும் ஒரு பழைய வினாத்தாளை நேரத்துடன் எழுதி, தவறுகளைத் திருத்துங்கள்.',
          bn: 'প্রতি সপ্তাহে ফোনে টাইমার দিয়ে একটি পুরনো প্রশ্নপত্র সমাধান করে প্রতিটি ভুল সংশোধন করুন।'
        }
      },
      {
        id: 'step-4',
        baseHours: 15,
        title: {
          en: 'Keep 20% time for a backup job skill',
          hi: 'अपने 20% समय में एक बैकअप कौशल सीखें',
          ta: 'உங்கள் 20% நேரத்தை மாற்றுத் திறனுக்கு ஒதுக்குங்கள்',
          bn: 'মোট সময়ের ২০% একটি ব্যাকআপ স্কিলে রাখুন'
        },
        detail: {
          en: 'Learn Spreadsheets, SQL, or Office tools via Spoken Tutorial so you stay financially independent during exam cycles.',
          hi: 'Spoken Tutorial से स्प्रेडशीट/ऑफिस या SQL सीखें ताकि परीक्षा चक्र के दौरान भी रोजगार के विकल्प खुले रहें।',
          ta: 'தேர்வு காலத்திலும் வருமான வாய்ப்பு இருக்க Spreadsheets அல்லது Office திறன்களைக் கற்றுக்கொள்ளுங்கள்.',
          bn: 'পরীক্ষার পাশাপাশি আর্থিক নিরাপত্তার জন্য Spoken Tutorial থেকে স্প্রেডশিট বা SQL শিখে রাখুন।'
        }
      }
    ],
    resourceIds: ['res-ncert-diksha', 'res-khan-india', 'res-ncs-india', 'res-spoken-tutorial'],
    nextAction: {
      en: 'Download 1 NCERT textbook PDF from ncert.nic.in for your target exam and write down your 3 weakest topics today.',
      hi: 'ncert.nic.in से अपनी परीक्षा के लिए 1 मुफ्त NCERT PDF डाउनलोड करें और अपने 3 कमजोर विषय लिखें।',
      ta: 'ncert.nic.in தளத்திலிருந்து 1 இலவச NCERT புத்தகத்தைப் பதிவிறக்கி, உங்கள் 3 பலவீனமான தலைப்புகளைக் குறிக்கவும்.',
      bn: 'আজই ncert.nic.in থেকে ১টি ফ্রি NCERT বই ডাউনলোড করে আপনার ৩টি দুর্বল অধ্যায় লিখে রাখুন।'
    }
  },
  {
    id: 'communication-career',
    domain: 'communication',
    keywords: [
      'english', 'communication', 'soft skills', 'interview', 'resume', 'spoken', 'confidence',
      'अंग्रेजी', 'इंटरव्यू', 'संवाद', 'सॉफ्ट स्किल्स', 'आत्मविश्वास',
      'ஆங்கிலம்', 'நேர்காணல்', 'தொடர்பு',
      'ইংরেজি', 'ইন্টারভিউ', 'যোগাযোগ', 'সফট স্কিল'
    ],
    starterQuestion: {
      en: 'How to improve English & interview skills for free?',
      hi: 'मुफ्त में अंग्रेजी और इंटरव्यू की तैयारी कैसे सुधारें?',
      ta: 'இலவசமாக ஆங்கிலம் மற்றும் நேர்காணல் திறனை வளர்ப்பது எப்படி?',
      bn: 'বিনামূল্যে ইংরেজি ও ইন্টারভিউয়ের দক্ষতা কীভাবে বাড়াব?'
    },
    title: {
      en: 'Workplace English, Communication & Interview Readiness',
      hi: 'कार्यस्थल अंग्रेजी, संवाद और इंटरव्यू तैयारी',
      ta: 'பணித்திறன் ஆங்கிலம் மற்றும் நேர்காணல் தயார்நிலை',
      bn: 'কর্মক্ষেত্রের ইংরেজি, যোগাযোগ ও ইন্টারভিউ প্রস্তুতি'
    },
    overview: {
      en: 'Clear communication beats fancy vocabulary. Employers look for structured answers, active listening, polite emails, and confidence explaining your work—all trainable in 20 minutes a day using low-data text scripts and self-recording.',
      hi: 'मुश्किल अंग्रेजी शब्दों से ज्यादा जरूरी है अपनी बात साफ और आत्मविश्वास से कहना। रोज़ 20 मिनट कम-डेटा टेक्स्ट अभ्यास और खुद की आवाज़ सुनकर आप ईमेल व इंटरव्यू में बेहतर बन सकते हैं।',
      ta: 'கடினமான ஆங்கில வார்த்தைகளை விட, உங்கள் கருத்தைத் தெளிவாகவும் நம்பிக்கையுடனும் சொல்வதே முக்கியம். தினமும் 20 நிமிடப் பயிற்சியில் இதை வளர்க்கலாம்.',
      bn: 'কঠিন ইংরেজি শব্দের চেয়ে নিজের কথা স্পষ্ট ও আত্মবিশ্বাসের সাথে বলা বেশি জরুরি। দিনে ২০ মিনিট কম-ডেটার টেক্সট অনুশীলন ও নিজের কথা রেকর্ড করে শুনেই উন্নতি করা সম্ভব।'
    },
    coreSkills: {
      en: [
        '2-Minute Clear Self-Introduction',
        'STAR Method for Project & Problem Stories',
        'Polite Professional Emails & Messages',
        'Everyday Workplace Vocabulary',
        'Self-Correction Without Fear'
      ],
      hi: [
        '2 मिनट का स्पष्ट परिचय (Self-Introduction)',
        'STAR तरीके से अपने काम का उदाहरण देना',
        'प्रोफेशनल ईमेल और संदेश लिखना',
        'दैनिक कार्यस्थल शब्दावली',
        'बिना झिझक बोलने का अभ्यास'
      ],
      ta: [
        '2 நிமிட தெளிவான சுய-அறிமுகம்',
        'STAR முறையில் திட்ட அனுபவத்தை விளக்குதல்',
        'மரியாதையான தொழில்முறை மின்னஞ்சல் எழுதுதல்',
        'அன்றாட அலுவலக ஆங்கிலச் சொற்கள்',
        'தயக்கமின்றிப் பேசும் பயிற்சி'
      ],
      bn: [
        '২ মিনিটের স্পষ্ট আত্মপরিচয়',
        'STAR পদ্ধতিতে প্রজেক্ট বা কাজের গল্প বলা',
        'ভদ্র ও পেশাদার ইমেইল লেখা',
        'দৈনন্দিন কর্মক্ষেত্রের শব্দভাণ্ডার',
        'জড়তা ছাড়া বলার অনুশীলন'
      ]
    },
    steps: [
      {
        id: 'step-1',
        baseHours: 10,
        title: {
          en: 'Practice 15 min/day reading + voice recording on phone',
          hi: 'रोज़ 15 मिनट पढ़कर फोन में अपनी आवाज़ रिकॉर्ड करें',
          ta: 'தினமும் 15 நிமிடம் வாசித்து போனில் குரல் பதிவு செய்யுங்கள்',
          bn: 'প্রতিদিন ১৫ মিনিট পড়ে ফোনে নিজের কণ্ঠ রেকর্ড করুন'
        },
        detail: {
          en: 'Read short BBC Learning English articles aloud, record on your phone voice app, and notice clarity.',
          hi: 'BBC लर्निंग इंग्लिश के छोटे लेख ज़ोर से पढ़ें और फोन रिकॉर्डर में सुनकर सुधार करें।',
          ta: 'BBC Learning English கட்டுரைகளைச் சத்தமாகப் படித்து, உங்கள் குரலைக் கேட்டுத் திருத்துங்கள்.',
          bn: 'BBC Learning English-এর ছোট লেখা জোরে পড়ে ফোনে রেকর্ড করে শুনে ভুল শুধরে নিন।'
        }
      },
      {
        id: 'step-2',
        baseHours: 12,
        title: {
          en: 'Write 5 STAR stories & a crisp 1-page resume',
          hi: '5 STAR कहानियां और एक साफ 1-पेज रिज्यूमे लिखें',
          ta: '5 STAR கதைகள் மற்றும் 1-பக்க சுயவிவரத்தை எழுதுங்கள்',
          bn: '৫টি STAR গল্প ও ১-পাতার পরিচ্ছন্ন সিভি লিখুন'
        },
        detail: {
          en: 'Document 5 real tasks (Situation, Task, Action, Result) from school, volunteering, or self-projects.',
          hi: 'स्कूल, घर या अपने प्रोजेक्ट के 5 काम (स्थिति, कार्य, कदम, परिणाम) सरल वाक्यों में लिखें।',
          ta: 'பள்ளி அல்லது சுய-திட்டங்களில் செய்த 5 பணிகளை எளிய ஆங்கிலத்தில் எழுதுங்கள்.',
          bn: 'স্কুল বা নিজের প্রজেক্টের ৫টি কাজের অভিজ্ঞতা সহজ ইংরেজিতে লিখুন।'
        }
      },
      {
        id: 'step-3',
        baseHours: 12,
        title: {
          en: 'Run 3 mock interviews with a friend or mirror',
          hi: 'किसी दोस्त या शीशे के सामने 3 मॉक इंटरव्यू करें',
          ta: 'நண்பருடன் அல்லது கண்ணாடி முன் 3 மாதிரி நேர்காணல் செய்யுங்கள்',
          bn: 'বন্ধু বা আয়নার সামনে ৩টি মক ইন্টারভিউ অনুশীলন করুন'
        },
        detail: {
          en: 'Practice top 5 questions: Tell me about yourself, your favorite project, a bug/challenge you fixed, and why this role.',
          hi: 'मुख्य 5 सवालों का अभ्यास करें: अपना परिचय, पसंदीदा प्रोजेक्ट, आई हुई चुनौती और इस भूमिका में रुचि।',
          ta: 'உங்கள் அறிமுகம், பிடித்த திட்டம், தீர்த்த சவால் ஆகிய 5 கேள்விகளுக்குப் பயிற்சி செய்யுங்கள்.',
          bn: 'মূল ৫টি প্রশ্ন অনুশীলন করুন: নিজের পরিচয়, প্রিয় প্রজেক্ট, সমাধান করা চ্যালেঞ্জ ও এই কাজের কারণ।'
        }
      }
    ],
    resourceIds: ['res-bbc-english', 'res-spoken-tutorial', 'res-ncs-india'],
    nextAction: {
      en: 'Write a 5-sentence "Tell me about yourself" script right now and record yourself saying it clearly twice on your phone.',
      hi: 'अभी 5 वाक्यों में "Tell me about yourself" लिखें और फोन पर दो बार बोलकर रिकॉर्ड करें।',
      ta: 'இப்போதே 5 வரிகளில் "Tell me about yourself" எழுதி, போனில் இரண்டு முறை பேசிப் பதிவு செய்யுங்கள்.',
      bn: 'এখনই ৫ লাইনে "Tell me about yourself" লিখে ফোনে দুবার বলে রেকর্ড করুন।'
    }
  }
];
