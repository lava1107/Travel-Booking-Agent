import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    navHome: 'Home',
    navPackages: 'Packages',
    navHotels: 'Hostels & Stays',
    navCompare: 'Compare',
    navPlanner: 'AI Trip Planner',
    navBookings: 'My Bookings',
    navPayments: 'Payments',
    navAdmin: 'Admin Console',
    navLogin: 'Sign In',
    navRegister: 'Register',
    navLogout: 'Sign Out',
    recentlyViewed: 'Recently Viewed',
    searchPlaceholder: 'Search destinations, packages, origins...',
    heroTitle: 'Tamil Nadu to the World',
    heroSubtitle: 'Explore 700+ verified holiday packages departing from Chennai, Coimbatore, Madurai & across Tamil Nadu with AI-powered itinerary intelligence.',
    searchBtn: 'Search Packages',
    aiSearchBtn: 'AI Semantic Search',
    bookNow: 'Book Now',
    viewDetails: 'View Itinerary',
    filterTitle: 'Filter & Refine',
    departure: 'Departure Origin',
    destination: 'Destination',
    category: 'Category',
    transport: 'Transport Mode',
    maxBudget: 'Max Budget',
    applyFilters: 'Apply Filters',
    resetFilters: 'Reset',
    popularDestinations: 'Trending Destinations',
    verifiedAgent: 'Verified Travel System',
    seatsLeft: 'seats available',
    perPerson: 'per traveler (GST included)',
    oauthGoogle: 'Continue with Google'
  },
  ta: {
    navHome: 'முகப்பு',
    navPackages: 'சுற்றுலா தொகுப்புகள்',
    navHotels: 'விடுதிகள் & தங்குமிடம்',
    navCompare: 'ஒப்பீடு',
    navPlanner: 'AI பயணத் திட்டமிடல்',
    navBookings: 'என் முன்பதிவுகள்',
    navPayments: 'கட்டணங்கள்',
    navAdmin: 'நிர்வாக அறை',
    navLogin: 'உள்நுழைக',
    navRegister: 'பதிவு செய்க',
    navLogout: 'வெளியேறு',
    recentlyViewed: 'சமீபத்தில் பார்த்தவை',
    searchPlaceholder: 'இடங்கள், சுற்றுலா தொகுப்புகளைத் தேடுங்கள்...',
    heroTitle: 'தமிழ்நாட்டிலிருந்து உலகிற்கு',
    heroSubtitle: 'சென்னை, கோவை, மதுரை உள்ளிட்ட நகரங்களிலிருந்து 700+ சரிபார்க்கப்பட்ட சுற்றுலா தொகுப்புகள். AI அடிப்படையிலான பயண மேலாண்மை.',
    searchBtn: 'சுற்றுலாக்களைத் தேடு',
    aiSearchBtn: 'AI புத்திசாலி தேடல்',
    bookNow: 'முன்பதிவு செய்',
    viewDetails: 'விவரங்களை காண்க',
    filterTitle: 'வடிகட்டல் & வரிசைப்படுத்தல்',
    departure: 'புறப்படும் ஊர்',
    destination: 'இலக்கு',
    category: 'வகை',
    transport: 'பயண வழி',
    maxBudget: 'அதிகபட்ச கட்டணம்',
    applyFilters: 'வடிகட்டு',
    resetFilters: 'மீட்டமைக்க',
    popularDestinations: 'பிரபல சுற்றுலா இடங்கள்',
    verifiedAgent: 'சரிபார்க்கப்பட்ட பயண முகவர்',
    seatsLeft: 'இருக்கைகள் உள்ளன',
    perPerson: 'ஒரு நபருக்கு (GST உட்பட)',
    oauthGoogle: 'Google மூலம் உள்நுழைக'
  },
  hi: {
    navHome: 'होम',
    navPackages: 'टूर पैकेज',
    navHotels: 'हॉस्टल और होटल',
    navCompare: 'तुलना करें',
    navPlanner: 'AI ट्रिप प्लानर',
    navBookings: 'मेरी बुकिंग',
    navPayments: 'भुगतान',
    navAdmin: 'व्यवस्थापक कंसोल',
    navLogin: 'साइन इन',
    navRegister: 'पंजीकरण करें',
    navLogout: 'लॉग आउट',
    recentlyViewed: 'हाल ही में देखे गए',
    searchPlaceholder: 'गंतव्य, टूर पैकेज खोजें...',
    heroTitle: 'तमिलनाडु से पूरे विश्व तक',
    heroSubtitle: 'चेन्नई, कोयम्बटूर, मदुरै से 700+ सत्यापित हॉलिडे पैकेज। AI संचालित यात्रा प्रबंधन प्रणाली।',
    searchBtn: 'पैकेज खोजें',
    aiSearchBtn: 'AI स्मार्ट सर्च',
    bookNow: 'अभी बुक करें',
    viewDetails: 'यात्रा कार्यक्रम देखें',
    filterTitle: 'फ़िल्टर और सॉर्ट',
    departure: 'प्रस्थान शहर',
    destination: 'गंतव्य स्थल',
    category: 'श्रेणी',
    transport: 'परिवहन माध्यम',
    maxBudget: 'अधिकतम बजट',
    applyFilters: 'फ़िल्टर लगाएं',
    resetFilters: 'रीसेट करें',
    popularDestinations: 'लोकप्रिय गंतव्य',
    verifiedAgent: 'सत्यापित ट्रैवल एजेंट',
    seatsLeft: 'सीटें शेष हैं',
    perPerson: 'प्रति व्यक्ति (GST सहित)',
    oauthGoogle: 'Google से जारी रखें'
  },
  es: {
    navHome: 'Inicio',
    navPackages: 'Paquetes',
    navHotels: 'Hostales y Hoteles',
    navCompare: 'Comparar',
    navPlanner: 'Planificador IA',
    navBookings: 'Mis Reservas',
    navPayments: 'Pagos',
    navAdmin: 'Panel de Admin',
    navLogin: 'Iniciar Sesión',
    navRegister: 'Registrarse',
    navLogout: 'Cerrar Sesión',
    recentlyViewed: 'Visto Recientemente',
    searchPlaceholder: 'Buscar destinos y paquetes...',
    heroTitle: 'De Tamil Nadu al Mundo',
    heroSubtitle: 'Descubre más de 700 paquetes turísticos verificados con asistencia y optimización impulsada por IA.',
    searchBtn: 'Buscar Paquetes',
    aiSearchBtn: 'Búsqueda Semántica IA',
    bookNow: 'Reservar Ahora',
    viewDetails: 'Ver Itinerario',
    filterTitle: 'Filtrar y Ordenar',
    departure: 'Origen de Salida',
    destination: 'Destino',
    category: 'Categoría',
    transport: 'Transporte',
    maxBudget: 'Presupuesto Máximo',
    applyFilters: 'Aplicar Filtros',
    resetFilters: 'Restablecer',
    popularDestinations: 'Destinos Populares',
    verifiedAgent: 'Agencia de Viajes Verificada',
    seatsLeft: 'asientos disponibles',
    perPerson: 'por persona (GST incluido)',
    oauthGoogle: 'Continuar con Google'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lyan_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lyan_lang', lang);
  }, [lang]);

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      t: (key) => TRANSLATIONS.en?.[key] || key
    };
  }
  return context;
}
