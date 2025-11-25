<template>
  <div class="about-page min-h-[calc(100vh-64px)] bg-slate-50 relative overflow-hidden" dir="rtl">
    <!-- Hero Header -->
    <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIHN0cm9rZT0iIzMzNDQ1NSIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-6 py-12" dir="ltr">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
          <span class="text-amber-400 text-sm font-medium tracking-widest uppercase">About This Project</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
          The Story Behind
        </h1>
        <p class="text-slate-400 mt-3 text-lg max-w-2xl">
          A personal exploration of Israel's international trade data.
        </p>
      </div>
    </div>

    <!-- Floating Background Elements -->
    <div class="absolute inset-0 pointer-events-none" style="top: 400px;">
      <!-- Logo floating elements -->
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
    <div class="max-w-3xl mx-auto px-6 py-12 relative z-10">
      <div class="text-right font-hebrew">
        <!-- Opening -->
        <p class="text-xl leading-relaxed text-slate-700 mb-8">
          לפני כמה חודשים נתקלתי במאגר נתונים מסקרן במיוחד - הלמ״ס מפרסם כל חודש את כל הייבוא והייצוא של ישראל. ביליוני דולרים של סחורות שעוברות דרך הנמלים והגבולות שלנו, מתועדים באקסל עם קודים בני שש ספרות שלא הכרתי.
        </p>

        <p class="text-xl leading-relaxed text-slate-700 mb-8">
          ואז התחילו השאלות: מאיפה באמת מגיעים האננסים שלנו? איך המלחמה השפיעה על שרשרת האספקה? למה פתאום יש כל כך הרבה עגבניות מטורקיה ואחר כך בכלל אין? מי קונה מאיתנו? ומה בכלל אנחנו מוכרים? ולמי?
        </p>

        <p class="text-xl leading-relaxed text-slate-700 mb-16">
          הבעיה היא שהתשובות קבורות מתחת לשכבות של קודי HS, מדינות מקוצרות לשתי אותיות, ומיליון וחצי שורות של מידע גולמי באקסלים שונים. אז החלטתי לעשות את מה שאני אוהב - לבנות משהו שהופך את זה לנגיש.
        </p>

        <!-- Divider -->
        <div class="w-16 h-1 bg-amber-400/60 mx-auto my-16 rounded-full"></div>

        <!-- What is this -->
        <h2 class="text-3xl font-bold text-slate-900 mb-8 mt-16">מה זה האתר הזה</h2>

        <p class="text-xl leading-relaxed text-slate-700 mb-8">
          האתר הזה לוקח את כל נתוני המכס של ישראל משלוש השנים האחרונות ומאפשר לחקור אותם בשפה טבעית - בעברית ובאנגלית. במקום לחפש קודים לא מוכרים של "080430" אפשר פשוט לשאול "מאיפה מגיעים האננסים". יש כאן צ׳אט מבוסס AI שעונה על שאלות, מפות אינטראקטיביות, וויזואליזציות שמראות את סיפור הסחר שלנו.
        </p>

        <p class="text-xl leading-relaxed text-slate-700 mb-16">
          התהליך הזה גם לימד אותי כמה מרתק עולם הסחר הבינלאומי. כל מוצר שאנחנו קונים מגיע דרך שרשרת אספקה מורכבת, דרך נמלים, מכסים, קודים, וחוקים בינלאומיים. יש כאן המון טכנולוגיה שעדיין לא פותחה, המון תהליכים שאפשר לייעל, והמון מידע שאפשר להפוך לתובנות.
        </p>

        <!-- Divider -->
        <div class="w-16 h-1 bg-amber-400/60 mx-auto my-16 rounded-full"></div>

        <!-- Where I want to go -->
        <h2 class="text-3xl font-bold text-slate-900 mb-8 mt-16">לאן אני רוצה מזה ללכת</h2>

        <p class="text-2xl leading-relaxed text-slate-900 mb-8 font-semibold">
          אני מחפש את הפרק הבא שלי בטכנולוגיית סחר.
        </p>

        <p class="text-xl leading-relaxed text-slate-700 mb-8">
          האתר הזה הוא הפרויקט האישי שלי, אבל מה שממש מעניין אותי זה לעבוד עם אנשים שבונים טכנולוגיה בתחום הזה - לוגיסטיקה, ניתוח שרשרות אספקה, פינטק של סחר בינלאומי, מכס דיגיטלי, או כל דבר אחר שקשור לתחום.
        </p>

        <p class="text-xl leading-relaxed text-slate-700 mb-8">
          תחום הסחר הוא מצד אחד קריטי למשק ומצד שני לא מפותח מבחינה טכנולוגית. יש המון מקום לבנות דברים חכמים, שקופים, ויעילים יותר.
        </p>

        <p class="text-xl leading-relaxed text-slate-700 mb-16">
          אם אתם עובדים על משהו בתחום, אם יש לכם בעיות שטכנולוגיה יכולה לפתור, או שפשוט רוצים לדבר על איך הופכים מיליוני שורות של נתונים למשהו שימושי - אשמח לדבר.
        </p>

        <!-- Contact Links with Ship Animation -->
        <div class="relative mt-24 pb-12 h-80">
          <!-- Animated Container -->
          <div ref="animatedContainer" class="absolute top-0 right-0">
            <div class="relative">
              <!-- Contact Card (base layer) -->
              <div class="bg-white rounded-3xl shadow-2xl shadow-slate-200/80 p-8 pb-24 border border-slate-100 relative z-10">
                <!-- Decorative corner -->
                <div class="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-50 to-transparent rounded-tl-3xl"></div>

                <div class="flex flex-col items-end gap-4 relative">
                  <div class="text-2xl font-semibold text-slate-900 mb-2">
                    Akiva Schiff-Blass
                  </div>
                  <a
                    href="mailto:akiva.s.dev@gmail.com"
                    class="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all duration-300"
                  >
                    <span class="text-slate-700 group-hover:text-blue-600 font-medium transition-colors">akiva.s.dev@gmail.com</span>
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/akiva-schiff-blass-6b5b39167"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all duration-300"
                  >
                    <span class="text-slate-700 group-hover:text-sky-600 font-medium transition-colors">LinkedIn Profile</span>
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-600 to-sky-700 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform duration-300">
                      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                  </a>
                </div>
              </div>

              <!-- Ship -->
              <div ref="shipElement" class="absolute z-40" style="bottom: -40px; right: -10px;">
                <img src="/icon-ship.png" alt="Ship" class="w-28 h-28" />
              </div>
            </div>
          </div>
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

// Refs for ship animation
const animatedContainer = ref(null)
const shipElement = ref(null)

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

  // Ship pulling card animation
  if (animatedContainer.value && shipElement.value) {
    // Detect if mobile (screen width < 768px)
    const isMobile = window.innerWidth < 768

    const shipTimeline = gsap.timeline({
      repeat: -1
    })

    if (isMobile) {
      // MOBILE: Simple animation - ship moves back and forth only, card stays still
      const shipTravelDistance = 240

      // Phase 1: Ship flips to face right
      shipTimeline.to(shipElement.value, {
        scaleX: -1,
        duration: 0.5,
        ease: 'power2.inOut'
      })

      // Phase 2: Ship moves left
      shipTimeline.to(shipElement.value, {
        x: -shipTravelDistance,
        duration: 3,
        ease: 'power1.inOut'
      })

      // Phase 3: Pause at left
      shipTimeline.to({}, { duration: 0.5 })

      // Phase 4: Ship flips to face left
      shipTimeline.to(shipElement.value, {
        scaleX: 1,
        duration: 0.5,
        ease: 'power2.inOut'
      })

      // Phase 5: Ship moves right back to start
      shipTimeline.to(shipElement.value, {
        x: 0,
        duration: 3,
        ease: 'power1.inOut'
      })

      // Phase 6: Pause at right
      shipTimeline.to({}, { duration: 0.5 })
    } else {
      // DESKTOP: Complex animation - ship pulls the card
      const containerWidth = animatedContainer.value.parentElement?.offsetWidth || 1000
      const travelDistance = -containerWidth * 0.5
      const shipIndependentTravel = 240

      // FLIP: Ship turns around to face right (ready to pull left)
      shipTimeline.to(shipElement.value, {
        scaleX: -1,
        duration: 0.5,
        ease: 'power2.inOut'
      })

      // Phase 1: Ship moves left independently (relative to container)
      shipTimeline.to(shipElement.value, {
        x: -shipIndependentTravel,
        duration: 3,
        ease: 'power1.inOut'
      })

      // Phase 2: Ship and container move left together (ship pulling)
      shipTimeline.to(animatedContainer.value, {
        x: travelDistance,
        duration: 5,
        ease: 'power1.inOut'
      })

      // Phase 3: Pause at left

      // FLIP: Ship turns around to face left
      shipTimeline.to(shipElement.value, {
        scaleX: 1,
        duration: 0.5,
        ease: 'power2.inOut'
      })

      shipTimeline.to({}, { duration: 0.5 })

      // Phase 4: Ship moves right independently (back to starting position)
      shipTimeline.to(shipElement.value, {
        x: 0,
        duration: 3,
        ease: 'power1.inOut'
      })

      // FLIP: Ship turns around to face left (ready to pull right)
      shipTimeline.to(shipElement.value, {
        scaleX: 1,
        duration: 0.5,
        ease: 'power2.inOut'
      })

      // Phase 5: Ship and container move right together (ship pulling)
      shipTimeline.to(animatedContainer.value, {
        x: 0,
        duration: 5,
        ease: 'power1.inOut'
      })

      // FLIP: Ship turns to face left (ready for next cycle)
      shipTimeline.to(shipElement.value, {
        scaleX: 1,
        duration: 0.5,
        ease: 'power2.inOut'
      })

      // Phase 6: Pause at right
      shipTimeline.to({}, { duration: 0.5 })
    }
  }
})
</script>

<style scoped>
.about-page {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
}
</style>
