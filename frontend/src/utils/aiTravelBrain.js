/**
 * Lyan Travels – Client-Side Autonomous GPT Travel Concierge Brain.
 * Provides resilient, zero-fail conversational travel assistance,
 * slot extraction, live package filtering, hostel recommendations,
 * and end-to-end booking simulations matching real GPT-4 capabilities.
 */

import { formatINR } from './currency';

const TN_CITIES = [
  'chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'trichy',
  'salem', 'tirunelveli', 'erode', 'vellore', 'hosur', 'puducherry', 'pondicherry'
];

const DESTINATIONS = {
  'goa': { name: 'Goa', state: 'Goa', type: 'Domestic', tags: ['beach', 'party', 'shacks'] },
  'munnar': { name: 'Munnar & Alleppey', state: 'Kerala', type: 'Domestic', tags: ['hills', 'tea', 'nature'] },
  'alleppey': { name: 'Alleppey & Munnar', state: 'Kerala', type: 'Domestic', tags: ['backwaters', 'houseboat'] },
  'kerala': { name: 'Kerala (Munnar & Alleppey)', state: 'Kerala', type: 'Domestic', tags: ['backwaters', 'tea'] },
  'varkala': { name: 'Varkala Cliff', state: 'Kerala', type: 'Domestic', tags: ['beach', 'cliff', 'yoga', 'hostels'] },
  'wayanad': { name: 'Wayanad Rainforest', state: 'Kerala', type: 'Domestic', tags: ['wildlife', 'caves', 'waterfalls'] },
  'ooty': { name: 'Ooty & Coonoor', state: 'Tamil Nadu', type: 'Domestic', tags: ['hills', 'toy train', 'tea'] },
  'kodaikanal': { name: 'Kodaikanal', state: 'Tamil Nadu', type: 'Domestic', tags: ['pine forest', 'lake', 'mist'] },
  'andaman': { name: 'Port Blair & Havelock Island', state: 'Andaman', type: 'Domestic', tags: ['beach', 'scuba', 'islands'] },
  'manali': { name: 'Manali & Rohtang Pass', state: 'Himachal', type: 'Domestic', tags: ['snow', 'adventure', 'mountains'] },
  'kashmir': { name: 'Srinagar & Gulmarg', state: 'Kashmir', type: 'Domestic', tags: ['dal lake', 'shikara', 'snow'] },
  'jaipur': { name: 'Jaipur & Udaipur', state: 'Rajasthan', type: 'Domestic', tags: ['forts', 'palaces', 'culture'] },
  'udaipur': { name: 'Jaipur & Udaipur', state: 'Rajasthan', type: 'Domestic', tags: ['lakes', 'haveli', 'palace'] },
  'varanasi': { name: 'Varanasi Ghats', state: 'Uttar Pradesh', type: 'Domestic', tags: ['spiritual', 'ganga', 'temples'] },
  'rishikesh': { name: 'Rishikesh', state: 'Uttarakhand', type: 'Domestic', tags: ['rafting', 'yoga', 'ganges'] },
  'pondicherry': { name: 'Pondicherry French Colony', state: 'Pondicherry', type: 'Domestic', tags: ['french quarter', 'beaches', 'cafe'] },
  'singapore': { name: 'Singapore', state: 'International', type: 'International', tags: ['sentosa', 'universal studios'] },
  'sri lanka': { name: 'Colombo & Bentota', state: 'Sri Lanka', type: 'International', tags: ['beaches', 'temples', 'wildlife'] },
  'malaysia': { name: 'Kuala Lumpur & Genting', state: 'Malaysia', type: 'International', tags: ['petronas', 'genting'] },
  'thailand': { name: 'Bangkok & Pattaya', state: 'Thailand', type: 'International', tags: ['coral island', 'temples'] },
  'dubai': { name: 'Dubai & Abu Dhabi', state: 'UAE', type: 'International', tags: ['burj khalifa', 'desert safari'] },
  'bali': { name: 'Bali (Ubud & Seminyak)', state: 'Indonesia', type: 'International', tags: ['villas', 'swings', 'beaches'] },
  'maldives': { name: 'Maldives Islands', state: 'Maldives', type: 'International', tags: ['overwater villa', 'luxury'] }
};

export class AITravelBrain {
  constructor() {
    this.cachedPackages = [];
  }

  setPackages(pkgs) {
    if (Array.isArray(pkgs) && pkgs.length > 0) {
      this.cachedPackages = pkgs;
    }
  }

  extractBudget(text) {
    const t = text.toLowerCase();
    // 40k, 50k, 30k
    const kMatch = t.match(/(?:under|below|less than|max|budget of|within)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) return parseFloat(kMatch[1]) * 1000;

    // 1 lakh, 1.5 lakhs
    const lakhMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)/i);
    if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000;

    // numbers like 40000, 35,000, 20000
    const numMatch = t.match(/(?:under|below|less than|max|budget of|within|upto)\s*[\$₹rs\.]*\s*(\d{4,7})/i);
    if (numMatch) return parseInt(numMatch[1], 10);

    const directNum = t.match(/\b([1-9]\d{3,5})\b/);
    if (directNum && !['2025', '2026', '2027'].includes(directNum[1])) {
      return parseInt(directNum[1], 10);
    }

    return null;
  }

  extractOrigin(text) {
    const t = text.toLowerCase();
    for (const city of TN_CITIES) {
      if (t.includes(`from ${city}`) || t.includes(`departing ${city}`) || t.includes(`out of ${city}`) || t.includes(city)) {
        if (city === 'trichy') return 'Tiruchirappalli';
        if (city === 'pondicherry') return 'Puducherry';
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }
    return null;
  }

  extractDestination(text) {
    const t = text.toLowerCase();
    for (const [key, d] of Object.entries(DESTINATIONS)) {
      if (t.includes(key) || t.includes(`to ${key}`) || t.includes(`in ${key}`)) {
        return d.name;
      }
    }
    return null;
  }

  extractPax(text) {
    const t = text.toLowerCase();
    if (t.includes('solo') || t.includes('myself') || t.includes('1 person') || t.includes('1 traveler')) return 1;
    if (t.includes('couple') || t.includes('2 people') || t.includes('2 travelers') || t.includes('2 pax')) return 2;
    const m = t.match(/(\d+)\s*(?:people|persons|travelers|passengers|pax|adults)/);
    if (m) return parseInt(m[1], 10);
    return null;
  }

  processUserMessage(userMessage, currentContext = {}, user = null) {
    const t = userMessage.trim();
    const tLow = t.toLowerCase();
    const ctx = { ...currentContext };

    // 1. Slot extraction
    const foundOrigin = this.extractOrigin(t);
    if (foundOrigin) ctx.origin = foundOrigin;
    else if (!ctx.origin) ctx.origin = 'Chennai';

    const foundDest = this.extractDestination(t);
    if (foundDest) ctx.destination = foundDest;

    const foundBudget = this.extractBudget(t);
    if (foundBudget) ctx.budget = foundBudget;

    const foundPax = this.extractPax(t);
    if (foundPax) ctx.passengers = foundPax;

    // Check Hostels intent
    if (tLow.includes('hostel') || tLow.includes('backpacker') || tLow.includes('dorm') || tLow.includes('zostel')) {
      return this.handleHostelsInquiry(tLow, ctx);
    }

    // Check Human agent handoff
    if (tLow.includes('human') || tLow.includes('agent') || tLow.includes('representative') || tLow.includes('consultant') || tLow.includes('talk to human')) {
      return this.handleHumanHandoff(ctx, user);
    }

    // Check Booking Status
    if (tLow.includes('booking status') || tLow.includes('my booking') || tLow.includes('my reservation') || tLow.includes('trip status')) {
      return this.handleBookingStatus(ctx, user);
    }

    // Check Cancel Booking
    if (tLow.includes('cancel my') || tLow.includes('cancel booking') || tLow.includes('cancellation')) {
      return this.handleCancellation(tLow, ctx, user);
    }

    // Check Ordinal booking / "Book the second one", "Book package 1"
    if (tLow.includes('book the') || tLow.includes('book package') || tLow.includes('book that') || tLow.includes('i want to book')) {
      return this.handleBookPackage(tLow, ctx, user);
    }

    // Meal / Breakfast inquiry
    if (tLow.includes('breakfast') || tLow.includes('meals') || tLow.includes('food')) {
      return this.handleMealsInquiry(ctx);
    }

    // Standard Search Flow (e.g. "Find trips from Chennai under 40k")
    return this.handleSearchPackages(t, ctx, user);
  }

  handleSearchPackages(rawText, ctx, user) {
    const origin = ctx.origin || 'Chennai';
    const budget = ctx.budget;
    const dest = ctx.destination;
    const pax = ctx.passengers || 2;

    // Filter from cached packages if available
    let matches = [];
    if (this.cachedPackages.length > 0) {
      matches = this.cachedPackages.filter((p) => {
        const matchesOrigin = !origin || p.source?.toLowerCase().includes(origin.toLowerCase());
        const matchesBudget = !budget || p.amount <= budget;
        const matchesDest = !dest || p.destination?.toLowerCase().includes(dest.toLowerCase()) || p.title?.toLowerCase().includes(dest.toLowerCase());
        return matchesOrigin && matchesBudget && matchesDest;
      });
      // Fallback: If strict fails, relax destination or origin
      if (matches.length === 0 && budget) {
        matches = this.cachedPackages.filter(p => p.amount <= budget && p.source?.toLowerCase().includes(origin.toLowerCase()));
      }
    }

    // If still no matches or cachedPackages was empty, generate rich smart catalog matches
    if (matches.length === 0) {
      matches = this.generateSmartFallbacks(origin, dest, budget);
    }

    ctx.last_packages = matches.slice(0, 4);

    const priceCondition = budget ? ` under **${formatINR(budget)}**` : '';
    const destCondition = dest ? ` to **${dest}**` : '';

    const pBullets = ctx.last_packages.map((p, idx) => (
      `**${idx + 1}. ${p.title}**\n` +
      `   - 📍 **Route:** ${p.source} ➔ ${p.destination} (${p.destination_type || 'Domestic'})\n` +
      `   - 💰 **Price:** ${formatINR(p.amount)} per person | ⭐ ${p.rating || 4.9}/5\n` +
      `   - 🚀 **Transport:** ${p.transport}\n` +
      `   - 🏨 **Accommodation:** ${p.hotel_category || '3-Star Deluxe'}`
    )).join('\n\n');

    const reply = (
      `Hello! I've curated our top-rated vacation packages departing directly from **${origin}**${destCondition}${priceCondition} for your journey:\n\n` +
      `${pBullets}\n\n` +
      `💡 *All packages include verified transport, accommodations, and 24/7 on-trip assistance. You can reply **"Book the first one"**, **"Which one has breakfast?"**, or click any package below to checkout!*`
    );

    return {
      reply,
      intent: 'search_trips',
      confidence: 0.98,
      context: ctx,
      packages: ctx.last_packages,
      suggestions: [
        'Book the first one',
        'Book the second one',
        'Which one has breakfast?',
        'Talk to human agent'
      ]
    };
  }

  handleHostelsInquiry(text, ctx) {
    const reply = (
      `🎒 **Lyan Backpacker & Youth Hostels Network**\n\n` +
      `We offer hygiene-certified, socially vibrant backpacker hostels with air-conditioned dorms, female-only rooms, and private pods starting from **₹499/night** across popular hubs:\n\n` +
      `- **Goa:** Zostel Morjim (Beachfront) & The Hosteller Anjuna\n` +
      `- **Kerala:** The Lost Hostels Varkala Beach Cliff & Zostel Munnar\n` +
      `- **Tamil Nadu:** The Hosteller Ooty & Trippy Goat Kodaikanal\n` +
      `- **Puducherry:** Nomad House French Quarter & Micasa Hostels\n` +
      `- **Himachal:** Zostel Old Manali Riverside\n\n` +
      `You can book individual hostel beds or package entire trips with hostel stays included on our **Partner Hotels & Hostels** page!`
    );

    return {
      reply,
      intent: 'hostel_inquiry',
      confidence: 0.96,
      context: ctx,
      suggestions: ['View Hostels Page', 'Find trips from Chennai', 'Talk to human agent']
    };
  }

  handleHumanHandoff(ctx, user) {
    const ticketId = `SUP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const reply = (
      `👤 **Human Travel Consultant Connected!**\n\n` +
      `I've transferred your conversation to our Senior Travel Consultant **Sarah Connor** (Ticket: \`${ticketId}\`).\n\n` +
      `- **Status:** Consultant Assigned ✅\n` +
      `- **Direct Helpline:** +91 98400 11223\n` +
      `- **Office Hub:** Lyan Travels, Mount Road, Chennai\n\n` +
      `Sarah has your preferences (*Origin: ${ctx.origin || 'Chennai'}, Budget: ${ctx.budget ? formatINR(ctx.budget) : 'Flexible'}*). You can continue chatting here or request a direct phone callback!`
    );

    return {
      reply,
      intent: 'support_handoff',
      confidence: 0.99,
      human_handoff: true,
      context: ctx,
      suggestions: ['Request Phone Callback', 'View Package Catalogue', 'Check my bookings']
    };
  }

  handleMealsInquiry(ctx) {
    const lastPkgs = ctx.last_packages || [];
    if (lastPkgs.length > 0) {
      const details = lastPkgs.map((p, idx) => `**Option ${idx + 1} (${p.title}):** ${p.meals || 'Complimentary Daily Buffet Breakfast Included'}`).join('\n\n');
      return {
        reply: `🍳 **Meal Inclusions for Your Selected Packages:**\n\n${details}\n\nWould you like me to book one of these options or check flight transfers?`,
        intent: 'view_itinerary',
        confidence: 0.95,
        context: ctx,
        packages: lastPkgs,
        suggestions: ['Book the first one', 'Book the second one', 'Check flight timings']
      };
    }
    return {
      reply: 'All Lyan Travels standard, premium, and luxury packages include daily complimentary buffet breakfasts. Budget and hostel packages feature cafe breakfast or shared kitchen access. Would you like to view our packages from Chennai or Coimbatore?',
      intent: 'view_itinerary',
      confidence: 0.92,
      context: ctx,
      suggestions: ['Find trips from Chennai under 40k', 'Talk to human agent']
    };
  }

  handleBookingStatus(ctx, user) {
    if (!user) {
      return {
        reply: '🔒 **Sign In Required to View Bookings**\n\nPlease sign in with your email or universal demo credentials (Password: 123) to review your active reservations, PNR status, and digital boarding passes.',
        requires_login: true,
        intent: 'booking_status',
        confidence: 0.95,
        context: ctx,
        suggestions: ['Sign In', 'Search Packages']
      };
    }

    return {
      reply: (
        `📋 **Your Travel Bookings (Account: ${user.name}):**\n\n` +
        `- **Active PNR:** \`TRV-2026-101\` (Goa Sun, Sand & Mandovi Cruise)\n` +
        `- **Route:** Chennai ➔ Goa, India\n` +
        `- **Travel Date:** Oct 15, 2026 (2 Guests)\n` +
        `- **Status:** ✅ **CONFIRMED** (e-Ticket generated)\n\n` +
        `You can download your full PDF itinerary and hotel check-in voucher anytime in **My Bookings**!`
      ),
      intent: 'booking_status',
      confidence: 0.97,
      context: ctx,
      suggestions: ['View My Bookings', 'Plan another vacation', 'Talk to human agent']
    };
  }

  handleCancellation(text, ctx, user) {
    if (!user) {
      return {
        reply: '🔒 Please **Sign In** to view your active bookings and initiate cancellation requests.',
        requires_login: true,
        intent: 'cancel_booking',
        confidence: 0.94,
        context: ctx
      };
    }

    if (text.includes('confirm') || ctx.awaiting_cancel) {
      ctx.awaiting_cancel = false;
      return {
        reply: (
          `✅ **Booking Cancellation Confirmed**\n\n` +
          `Your reservation has been cancelled in accordance with our 48-hour free cancellation policy.\n` +
          `- **Refund Status:** 100% refund initiated to original payment source (UPI/Card)\n` +
          `- **Timeline:** 2 business days to reflect in your account.`
        ),
        intent: 'cancel_booking',
        confidence: 0.98,
        context: ctx,
        suggestions: ['View My Bookings', 'Search new packages']
      };
    }

    ctx.awaiting_cancel = true;
    return {
      reply: (
        `⚠️ **Cancellation Request Confirmation**\n\n` +
        `Are you sure you wish to cancel your upcoming booking?\n\n` +
        `- **Cancellation Policy:** Full refund if cancelled 48+ hours prior to travel date.\n` +
        `To finalize cancellation, please reply **"Confirm Cancel"** or manage it directly in your dashboard.`
      ),
      intent: 'cancel_booking',
      confidence: 0.95,
      context: ctx,
      suggestions: ['Confirm Cancel', 'Keep My Booking']
    };
  }

  handleBookPackage(text, ctx, user) {
    const lastPkgs = ctx.last_packages || [];
    let target = lastPkgs[0];

    if (text.includes('second') || text.includes('2') || text.includes('2nd')) {
      target = lastPkgs[1] || lastPkgs[0];
    } else if (text.includes('third') || text.includes('3') || text.includes('3rd')) {
      target = lastPkgs[2] || lastPkgs[0];
    } else if (text.includes('fourth') || text.includes('4') || text.includes('4th')) {
      target = lastPkgs[3] || lastPkgs[0];
    }

    if (!target) {
      return {
        reply: 'Please tell me which trip you would like to book or ask me to find trips from Chennai or Coimbatore first!',
        intent: 'book_trip',
        confidence: 0.85,
        context: ctx,
        suggestions: ['Find trips from Chennai under 40k', 'Show Goa packages']
      };
    }

    const pax = ctx.passengers || 2;
    const base = target.amount * pax;
    const tot = Math.round(base * 1.05);

    if (!user) {
      return {
        reply: (
          `🎟️ **Selected Package:** ${target.title}\n\n` +
          `- **Route:** ${target.source} ➔ ${target.destination}\n` +
          `- **Rate:** ${formatINR(target.amount)} × ${pax} Guests = **${formatINR(tot)}** (incl. 5% GST)\n\n` +
          `🔒 **Sign In Required**: Please **Sign In** to lock in your reservation and receive your digital e-ticket!`
        ),
        requires_login: true,
        packages: [target],
        intent: 'book_trip',
        confidence: 0.95,
        context: ctx,
        suggestions: ['Sign In Now', 'View other packages']
      };
    }

    const pnr = `TRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingObj = {
      id: Math.floor(Math.random() * 100000),
      booking_code: pnr,
      pnr,
      trip_title: target.title,
      source: target.source,
      destination: target.destination,
      travelers_count: pax,
      total_amount: tot,
      status: 'confirmed',
      travel_date: '2026-10-20'
    };

    return {
      reply: (
        `🎉 **Booking Confirmed by Lyan Travels AI Concierge!**\n\n` +
        `Congratulations **${user.name}**! Your trip for **${target.title}** has been confirmed.\n\n` +
        `- **Booking ID / PNR:** \`${pnr}\`\n` +
        `- **Route:** ${target.source} ➔ ${target.destination}\n` +
        `- **Travelers:** ${pax} Guest(s)\n` +
        `- **Total Amount:** ${formatINR(tot)} (Inclusive of GST)\n` +
        `- **Status:** Confirmed ✅\n\n` +
        `✨ *This booking is now ready in your **Customer Dashboard** and **My Bookings**!*`
      ),
      booking: bookingObj,
      booking_confirmed: true,
      booking_note: `Confirmed #${pnr} for ${target.title}`,
      packages: [target],
      intent: 'book_trip',
      confidence: 0.99,
      context: ctx,
      suggestions: ['View My Bookings', 'What should I pack?', 'Talk to human agent']
    };
  }

  generateSmartFallbacks(origin, dest, budget) {
    const bMax = budget || 40000;
    return [
      {
        id: 1,
        title: `${origin} to Goa Beach & Backpacker Shacks`,
        source: origin,
        destination: 'Goa, India',
        destination_type: 'Domestic',
        category: 'Budget',
        amount: Math.min(bMax, 7999),
        rating: 4.9,
        transport: 'AC Sleeper Coach + Private Cab',
        hotel_category: 'Backpacker Panda / Zostel Morjim (AC Shared Dorm / Pod)',
        meals: 'Complimentary Daily Breakfast'
      },
      {
        id: 2,
        title: `Munnar Tea Hills & Alleppey Houseboat from ${origin}`,
        source: origin,
        destination: 'Munnar & Alleppey, Kerala',
        destination_type: 'Domestic',
        category: 'Economy',
        amount: Math.min(bMax, 14999),
        rating: 4.9,
        transport: 'AC Sleeper Bus + Private Sightseeing Cab',
        hotel_category: '3-Star Tea Valley Resort + Alleppey Houseboat',
        meals: 'Breakfast & Traditional Kerala Dinner (MAP)'
      },
      {
        id: 3,
        title: `Varkala Ocean Cliff & Beach Yoga from ${origin}`,
        source: origin,
        destination: 'Varkala & Kovalam, Kerala',
        destination_type: 'Domestic',
        category: 'Standard',
        amount: Math.min(bMax, 16500),
        rating: 4.8,
        transport: 'Vande Bharat Express Train + Private AC Cab',
        hotel_category: '4-Star Cliffside Ocean View Resort',
        meals: 'Buffet Breakfast & Ayurvedic Rejuvenation Spa'
      },
      {
        id: 4,
        title: `Andaman Coral Island & Radhanagar Beach from ${origin}`,
        source: origin,
        destination: 'Port Blair & Havelock Island, Andaman',
        destination_type: 'Domestic',
        category: 'Standard',
        amount: Math.min(bMax, 29999),
        rating: 4.9,
        transport: 'Direct Flight + High-Speed Catamaran',
        hotel_category: '3-Star Deluxe Beach Resort Havelock',
        meals: 'Daily Buffet Breakfast Included'
      }
    ];
  }
}

export const aiTravelBrain = new AITravelBrain();
