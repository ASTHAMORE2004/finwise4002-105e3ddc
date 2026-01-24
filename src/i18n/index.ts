import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        courses: 'Courses',
        ipo: 'IPO',
        startups: 'Startups',
        portfolio: 'Portfolio',
        calculator: 'Calculator',
        watchlist: 'Watchlist',
        analytics: 'Analytics',
        signIn: 'Sign In',
        signOut: 'Sign Out',
      },
      // Hero Section
      hero: {
        title: 'Your Gateway to Smart Investing',
        subtitle: 'Learn, invest, and grow your wealth with our comprehensive financial platform',
        getStarted: 'Get Started',
        exploreCourses: 'Explore Courses',
      },
      // Features
      features: {
        title: 'Everything You Need',
        ipoInvesting: 'IPO Investing',
        ipoDesc: 'Apply for upcoming IPOs directly through our platform',
        startupInvesting: 'Startup Investing',
        startupDesc: 'Invest in promising startups and be part of their journey',
        financialCourses: 'Financial Courses',
        coursesDesc: 'Learn from expert-curated courses on investing and finance',
        videoConsultation: 'Video Consultation',
        consultDesc: 'Connect with financial advisors through secure video calls',
      },
      // Common
      common: {
        applyNow: 'Apply Now',
        learnMore: 'Learn More',
        viewAll: 'View All',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        alreadyApplied: 'Already Applied',
        applicationSubmitted: 'Application Submitted',
      },
      // IPO
      ipo: {
        title: 'IPO Listings',
        subtitle: 'Discover and apply for upcoming Initial Public Offerings',
        priceBand: 'Price Band',
        lotSize: 'Lot Size',
        issueSize: 'Issue Size',
        sector: 'Sector',
        status: 'Status',
        open: 'Open',
        closed: 'Closed',
        upcoming: 'Upcoming',
        applyForIPO: 'Apply for IPO',
        applicationConfirmed: 'Your application has been confirmed',
      },
      // Video Call
      videoCall: {
        title: 'Video Consultations',
        subtitle: 'Connect with financial advisors through secure video calls',
        joinCall: 'Join a Call',
        createSession: 'Create New Session',
        startNow: 'Start Now',
        scheduleSession: 'Schedule Session',
        transcript: 'Transcript',
        startTranscription: 'Start Transcription',
        stopTranscription: 'Stop Transcription',
        noTranscript: 'No transcript yet. Start transcription to see live captions.',
      },
      // Footer
      footer: {
        tagline: 'Your trusted partner in financial growth',
        quickLinks: 'Quick Links',
        legal: 'Legal',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        contactUs: 'Contact Us',
        allRightsReserved: 'All rights reserved',
      },
    },
  },
  hi: {
    translation: {
      nav: {
        home: 'होम',
        courses: 'कोर्स',
        ipo: 'आईपीओ',
        startups: 'स्टार्टअप',
        portfolio: 'पोर्टफोलियो',
        calculator: 'कैलकुलेटर',
        watchlist: 'वॉचलिस्ट',
        analytics: 'एनालिटिक्स',
        signIn: 'साइन इन',
        signOut: 'साइन आउट',
      },
      hero: {
        title: 'स्मार्ट निवेश का आपका द्वार',
        subtitle: 'हमारे व्यापक वित्तीय प्लेटफॉर्म के साथ सीखें, निवेश करें और अपनी संपत्ति बढ़ाएं',
        getStarted: 'शुरू करें',
        exploreCourses: 'कोर्स देखें',
      },
      features: {
        title: 'आपको जो चाहिए वह सब',
        ipoInvesting: 'आईपीओ निवेश',
        ipoDesc: 'हमारे प्लेटफॉर्म के माध्यम से आगामी आईपीओ के लिए आवेदन करें',
        startupInvesting: 'स्टार्टअप निवेश',
        startupDesc: 'होनहार स्टार्टअप में निवेश करें और उनकी यात्रा का हिस्सा बनें',
        financialCourses: 'वित्तीय कोर्स',
        coursesDesc: 'निवेश और वित्त पर विशेषज्ञ-क्यूरेटेड कोर्स से सीखें',
        videoConsultation: 'वीडियो परामर्श',
        consultDesc: 'सुरक्षित वीडियो कॉल के माध्यम से वित्तीय सलाहकारों से जुड़ें',
      },
      common: {
        applyNow: 'अभी आवेदन करें',
        learnMore: 'और जानें',
        viewAll: 'सभी देखें',
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        success: 'सफल',
        cancel: 'रद्द करें',
        confirm: 'पुष्टि करें',
        save: 'सेव करें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        back: 'वापस',
        next: 'अगला',
        submit: 'जमा करें',
        alreadyApplied: 'पहले से आवेदन किया',
        applicationSubmitted: 'आवेदन जमा हो गया',
      },
      ipo: {
        title: 'आईपीओ सूची',
        subtitle: 'आगामी प्रारंभिक सार्वजनिक पेशकशों की खोज करें और आवेदन करें',
        priceBand: 'मूल्य बैंड',
        lotSize: 'लॉट साइज',
        issueSize: 'इश्यू साइज',
        sector: 'सेक्टर',
        status: 'स्थिति',
        open: 'खुला',
        closed: 'बंद',
        upcoming: 'आगामी',
        applyForIPO: 'आईपीओ के लिए आवेदन करें',
        applicationConfirmed: 'आपका आवेदन पुष्टि हो गया है',
      },
      videoCall: {
        title: 'वीडियो परामर्श',
        subtitle: 'सुरक्षित वीडियो कॉल के माध्यम से वित्तीय सलाहकारों से जुड़ें',
        joinCall: 'कॉल में शामिल हों',
        createSession: 'नया सत्र बनाएं',
        startNow: 'अभी शुरू करें',
        scheduleSession: 'सत्र शेड्यूल करें',
        transcript: 'ट्रांसक्रिप्ट',
        startTranscription: 'ट्रांसक्रिप्शन शुरू करें',
        stopTranscription: 'ट्रांसक्रिप्शन रोकें',
        noTranscript: 'अभी कोई ट्रांसक्रिप्ट नहीं। लाइव कैप्शन देखने के लिए ट्रांसक्रिप्शन शुरू करें।',
      },
      footer: {
        tagline: 'वित्तीय विकास में आपका विश्वसनीय साथी',
        quickLinks: 'त्वरित लिंक',
        legal: 'कानूनी',
        privacyPolicy: 'गोपनीयता नीति',
        termsOfService: 'सेवा की शर्तें',
        contactUs: 'संपर्क करें',
        allRightsReserved: 'सर्वाधिकार सुरक्षित',
      },
    },
  },
  es: {
    translation: {
      nav: {
        home: 'Inicio',
        courses: 'Cursos',
        ipo: 'OPI',
        startups: 'Startups',
        portfolio: 'Portafolio',
        calculator: 'Calculadora',
        watchlist: 'Lista de seguimiento',
        analytics: 'Analíticas',
        signIn: 'Iniciar sesión',
        signOut: 'Cerrar sesión',
      },
      hero: {
        title: 'Tu puerta a la inversión inteligente',
        subtitle: 'Aprende, invierte y haz crecer tu patrimonio con nuestra plataforma financiera integral',
        getStarted: 'Comenzar',
        exploreCourses: 'Explorar cursos',
      },
      common: {
        applyNow: 'Aplicar ahora',
        learnMore: 'Más información',
        viewAll: 'Ver todo',
        loading: 'Cargando...',
        alreadyApplied: 'Ya aplicado',
        applicationSubmitted: 'Solicitud enviada',
      },
    },
  },
  fr: {
    translation: {
      nav: {
        home: 'Accueil',
        courses: 'Cours',
        ipo: 'IPO',
        startups: 'Startups',
        portfolio: 'Portefeuille',
        signIn: 'Se connecter',
        signOut: 'Se déconnecter',
      },
      hero: {
        title: 'Votre porte vers l\'investissement intelligent',
        subtitle: 'Apprenez, investissez et faites fructifier votre patrimoine',
        getStarted: 'Commencer',
        exploreCourses: 'Explorer les cours',
      },
      common: {
        applyNow: 'Postuler maintenant',
        alreadyApplied: 'Déjà appliqué',
      },
    },
  },
  zh: {
    translation: {
      nav: {
        home: '首页',
        courses: '课程',
        ipo: 'IPO',
        startups: '创业公司',
        portfolio: '投资组合',
        signIn: '登录',
        signOut: '登出',
      },
      hero: {
        title: '您的智能投资门户',
        subtitle: '通过我们全面的金融平台学习、投资并增长您的财富',
        getStarted: '开始',
        exploreCourses: '探索课程',
      },
      common: {
        applyNow: '立即申请',
        alreadyApplied: '已申请',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Save language preference
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
