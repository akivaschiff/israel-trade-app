<template>
  <div class="about-page min-h-[calc(100vh-64px)] relative overflow-hidden" dir="rtl">
    <!-- Hero Header -->
    <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <!-- Subtle grid pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 50px 50px;"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-6 py-16" dir="ltr">
        <div class="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
          <div class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
          <span class="text-amber-400 text-xs font-semibold tracking-wider uppercase">About This Project</span>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold text-white tracking-tight mb-3" style="font-family: 'Georgia', serif; letter-spacing: -0.02em;">
          The Story Behind
        </h1>
        <p class="text-slate-400 text-lg max-w-2xl leading-relaxed">
          A personal exploration of Israel's international trade data
        </p>
      </div>
    </div>

    <!-- Floating Background Elements -->
    <div class="absolute inset-0 pointer-events-none" style="top: 400px;">
      <div ref="logo1" class="absolute opacity-5" style="top: 5%; left: 10%;">
        <img src="/icon.png" alt="" class="w-64 h-64" />
      </div>
      <div ref="logo2" class="absolute opacity-5" style="top: 15%; right: 15%;">
        <img src="/icon3.png" alt="" class="w-72 h-72" />
      </div>
      <div ref="logo3" class="absolute opacity-5" style="top: 35%; left: 50%;">
        <img src="/icon4.png" alt="" class="w-68 h-68" />
      </div>
      <div ref="logo4" class="absolute opacity-5" style="top: 55%; right: 20%;">
        <img src="/icon.png" alt="" class="w-64 h-64" />
      </div>
      <div ref="logo5" class="absolute opacity-5" style="top: 75%; left: 15%;">
        <img src="/icon3.png" alt="" class="w-72 h-72" />
      </div>
      <div ref="logo6" class="absolute opacity-5" style="top: 90%; right: 45%;">
        <img src="/icon4.png" alt="" class="w-68 h-68" />
      </div>
    </div>

    <!-- Content Area -->
    <div class="max-w-7xl mx-auto px-6 -mt-8 relative z-10 pb-20 space-y-6">

      <!-- Card 01: How it started -->
      <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/60 overflow-hidden group hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500">
        <!-- Edge-to-edge header -->
        <div class="bg-gradient-to-br from-slate-50 to-slate-100/50 border-b border-slate-200/60">
          <div class="px-6 md:px-10 py-4 flex items-center gap-4">
            <!-- Chapter number -->
            <div class="flex items-center gap-3 flex-shrink-0">
              <div class="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <!-- Title -->
            <h2 class="flex-1 text-right text-xl font-bold text-slate-800" dir="rtl" style="font-family: 'Assistant', 'Heebo', sans-serif;">
              איך זה התחיל
            </h2>
          </div>
        </div>

        <!-- Card body with padding -->
        <div class="px-6 md:px-10 py-8 text-right font-hebrew" dir="rtl">
          <p class="text-lg leading-relaxed text-slate-700 mb-5" style="font-family: 'Assistant', 'Heebo', sans-serif;">
            לפני כמה חודשים נתקלתי במאגר נתונים מסקרן במיוחד - הלמ״ס מפרסם כל חודש את כל הייבוא והייצוא של ישראל. ביליוני דולרים של סחורות שעוברות דרך הנמלים והגבולות שלנו, מתועדים באקסל עם קודים בני שש ספרות שלא הכרתי.
          </p>
          <p class="text-lg leading-relaxed text-slate-700 mb-5" style="font-family: 'Assistant', 'Heebo', sans-serif;">
            ואז התחילו השאלות: מאיפה באמת מגיעים האננסים שלנו? איך המלחמה השפיעה על שרשרת האספקה? למה פתאום יש כל כך הרבה עגבניות מטורקיה ואחר כך בכלל אין? מי קונה מאיתנו? ומה בכלל אנחנו מוכרים? ולמי?
          </p>
          <p class="text-lg leading-relaxed text-slate-700" style="font-family: 'Assistant', 'Heebo', sans-serif;">
            הבעיה היא שהתשובות קבורות מתחת לשכבות של קודי HS, מדינות מקוצרות לשתי אותיות, ומיליון וחצי שורות של מידע גולמי באקסלים שונים. אז החלטתי לעשות את מה שאני אוהב - לבנות משהו שהופך את זה לנגיש.
          </p>
        </div>
      </div>

      <!-- Card 02: What is this -->
      <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/60 overflow-hidden group hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500">
        <!-- Edge-to-edge header -->
        <div class="bg-gradient-to-br from-blue-50/50 to-sky-50/30 border-b border-blue-200/40">
          <div class="px-6 md:px-10 py-4 flex items-center gap-4">
            <!-- Chapter number -->
            <div class="flex items-center gap-3 flex-shrink-0">
              <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <!-- Title -->
            <h2 class="flex-1 text-right text-xl font-bold text-slate-800" dir="rtl" style="font-family: 'Assistant', 'Heebo', sans-serif;">
              מה זה האתר הזה
            </h2>
          </div>
        </div>

        <!-- Card body with padding -->
        <div class="px-6 md:px-10 py-8 text-right font-hebrew" dir="rtl">
          <p class="text-lg leading-relaxed text-slate-700 mb-5" style="font-family: 'Assistant', 'Heebo', sans-serif;">
            האתר הזה לוקח את כל נתוני המכס של ישראל משלוש השנים האחרונות ומאפשר לחקור אותם בשפה טבעית - בעברית ובאנגלית. במקום לחפש קודים לא מוכרים של "080430" אפשר פשוט לשאול "מאיפה מגיעים האננסים". יש כאן צ׳אט מבוסס AI שעונה על שאלות, מפות אינטראקטיביות, וויזואליזציות שמראות את סיפור הסחר שלנו.
          </p>
          <p class="text-lg leading-relaxed text-slate-700" style="font-family: 'Assistant', 'Heebo', sans-serif;">
אני מקוה שהאתר הזה יעזור לאחרים גם כן להיחשף ולהיפתח לעולמות הסחר שבעצם מהוות את ״מאחורי הקלעים״ של הרבה מהכלכלה והחיים שלנו.
          </p>
        </div>
      </div>

      <!-- Card 03: Where I want to go -->
      <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/60 overflow-hidden group hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500">
        <!-- Edge-to-edge header -->
        <div class="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-b border-emerald-200/40">
          <div class="px-6 md:px-10 py-4 flex items-center gap-4">
            <!-- Chapter number -->
            <div class="flex items-center gap-3 flex-shrink-0">
              <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <!-- Title -->
            <h2 class="flex-1 text-right text-xl font-bold text-slate-800" dir="rtl" style="font-family: 'Assistant', 'Heebo', sans-serif;">
              לאן אני רוצה ללכת מכאן
            </h2>
          </div>
        </div>

        <!-- Card body with padding -->
        <div class="px-6 md:px-10 py-8 text-right font-hebrew" dir="rtl">
          <p class="text-lg leading-relaxed text-slate-700 mb-5" style="font-family: 'Assistant', 'Heebo', sans-serif;">
            האתר הזה הוא הפרויקט האישי שלי, אבל מה שממש מעניין אותי זה לעבוד עם אנשים שבונים טכנולוגיה בתחום הזה - לוגיסטיקה, ניתוח שרשרות אספקה, פינטק של סחר בינלאומי, מכס דיגיטלי, או כל דבר אחר שקשור לתחום.
          </p>
          <p class="text-lg leading-relaxed text-slate-700" style="font-family: 'Assistant', 'Heebo', sans-serif;">
            אם אתם עובדים על משהו בתחום, אם יש לכם בעיות שטכנולוגיה יכולה לפתור, או שפשוט רוצים לדבר על איך הופכים מיליוני שורות של נתונים למשהו שימושי - אשמח לדבר.
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Refs for animated elements
const logo1 = ref(null)
const logo2 = ref(null)
const logo3 = ref(null)
const logo4 = ref(null)
const logo5 = ref(null)
const logo6 = ref(null)

onMounted(() => {
  const logos = [
    { ref: logo1, x: -400, scrub: 1.5 },
    { ref: logo2, x: 450, scrub: 2 },
    { ref: logo3, x: -500, scrub: 1.8 },
    { ref: logo4, x: 420, scrub: 2.2 },
    { ref: logo5, x: -480, scrub: 1.6 },
    { ref: logo6, x: 460, scrub: 2.1 },
  ]

  // Horizontal parallax effect for all logos
  logos.forEach(({ ref: logoRef, x, scrub }) => {
    gsap.to(logoRef.value, {
      x,
      ease: 'none',
      scrollTrigger: {
        trigger: logoRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub,
      }
    })
  })

  // Add gentle floating animation (vertical only, subtle)
  const floatingElements = [logo1, logo2, logo3, logo4, logo5, logo6]

  floatingElements.forEach((el, index) => {
    gsap.to(el.value, {
      y: '+=20',
      duration: 3 + (index * 0.4),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  })
})
</script>

<style scoped>
/* Import Hebrew fonts */
@import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Heebo:wght@400;500;600;700;800&display=swap');

.about-page {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
}
</style>
