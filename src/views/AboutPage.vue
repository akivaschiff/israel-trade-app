<template>
  <div class="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 via-white to-blue-50 relative overflow-hidden" dir="rtl">
    <!-- Floating Background Elements -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Logo floating elements -->
      <div ref="logo1" class="absolute opacity-10" style="top: 5%; left: 10%;">
        <img src="/icon.png" alt="" class="w-64 h-64" />
      </div>
      <div ref="logo2" class="absolute opacity-10" style="top: 15%; right: 15%;">
        <img src="/icon3.png" alt="" class="w-72 h-72" />
      </div>
      <div ref="logo3" class="absolute opacity-10" style="top: 35%; left: 50%;">
        <img src="/icon4.png" alt="" class="w-68 h-68" />
      </div>
      <div ref="logo4" class="absolute opacity-10" style="top: 55%; right: 20%;">
        <img src="/icon.png" alt="" class="w-64 h-64" />
      </div>
      <div ref="logo5" class="absolute opacity-10" style="top: 75%; left: 15%;">
        <img src="/icon3.png" alt="" class="w-72 h-72" />
      </div>
      <div ref="logo6" class="absolute opacity-10" style="top: 90%; right: 45%;">
        <img src="/icon4.png" alt="" class="w-68 h-68" />
      </div>
    </div>

    <!-- Content Area -->
    <div class="max-w-3xl mx-auto px-6 py-12 relative z-10">
      <div class="text-right">
        <!-- Opening -->
        <p class="text-xl leading-relaxed text-gray-800 mb-8 font-serif">
          לפני כמה חודשים נתקלתי במאגר נתונים שפתח לי עיניים - הלמ״ס מפרסם כל חודש את כל הייבוא והייצוא של ישראל 📊. ביליוני דולרים של סחורות שעוברות דרך הנמלים והגבולות שלנו, מתועדים באקסל עם קודים מסתוריים בני שש ספרות.
        </p>

        <p class="text-xl leading-relaxed text-gray-800 mb-8 font-serif">
          ואז התחילו השאלות: מאיפה באמת מגיעים האננסים שלנו 🍍? איך המלחמה השפיעה על שרשרת האספקה? למה פתאום יש כל כך הרבה עגבניות מטורקיה ואחר כך בכלל אין 🍅? מי קונה מאיתנו? ומה בכלל אנחנו מוכרים?
        </p>

        <p class="text-xl leading-relaxed text-gray-800 mb-16 font-serif">
          הבעיה היא שהתשובות קבורות מתחת לשכבות של קודי HS, מדינות מקוצרות לשתי אותיות, ומיליון וחצי שורות של מידע גולמי 😅. אז החלטתי לעשות את מה שאני יודע - לבנות משהו שהופך את זה לנגיש.
        </p>

        <!-- Divider -->
        <div class="w-16 h-1 bg-gray-300 mx-auto my-16"></div>

        <!-- What is this -->
        <h2 class="text-3xl font-bold text-gray-900 mb-8 mt-16">מה זה האתר הזה</h2>

        <p class="text-xl leading-relaxed text-gray-800 mb-8 font-serif">
          האתר הזה לוקח את כל נתוני המכס של ישראל משלוש השנים האחרונות ומאפשר לחקור אותם בשפה טבעית - בעברית ובאנגלית. במקום לחפש קודים לא מוכרים של "080430" אפשר פשוט לשאול "מאיפה מגיעים האננסים" 🔍. יש כאן צ׳אט מבוסס AI שעונה על שאלות 🤖, מפות אינטראקטיביות 🗺️, ויזואליזציות שמראות סיפור של הסחר שלנו.
        </p>

        <p class="text-xl leading-relaxed text-gray-800 mb-16 font-serif">
          התהליך הזה גם לימד אותי כמה מרתק עולם הסחר הבינלאומי ⛴️. כל מוצר שאנחנו קונים מגיע דרך שרשרת אספקה מורכבת, דרך נמלים, מכסים, קודים, וחוקים בינלאומיים. יש כאן המון טכנולוגיה שעדיין לא פותחה, המון תהליכים שאפשר לייעל, והמון מידע שאפשר להפוך לתובנות 💡.
        </p>

        <!-- Divider -->
        <div class="w-16 h-1 bg-gray-300 mx-auto my-16"></div>

        <!-- Where I want to go -->
        <h2 class="text-3xl font-bold text-gray-900 mb-8 mt-16">לאן אני רוצה מזה ללכת</h2>

        <p class="text-2xl leading-relaxed text-gray-900 mb-8 font-serif font-semibold">
          אני מחפש את הפרק הבא שלי בטכנולוגיית סחר.
        </p>

        <p class="text-xl leading-relaxed text-gray-800 mb-8 font-serif">
          האתר הזה הוא הפרויקט האישי שלי, אבל מה שממש מעניין אותי זה לעבוד עם אנשים שבונים טכנולוגיה בתחום הזה - לוגיסטיקה, ניתוח שרשרות אספקה, פינטק של סחר בינלאומי, מכס דיגיטלי, או כל דבר אחר שקשור לתחום.
        </p>

        <p class="text-xl leading-relaxed text-gray-800 mb-8 font-serif">
          אם אתם עובדים על משהו בתחום, אם יש לכם בעיות שטכנולוגיה יכולה לפתור, או שפשוט רוצים לדבר על איך הופכים מיליוני שורות של נתונים למשהו שימושי - <strong>אשמח מאוד לשמוע מכם</strong> ✉️.
        </p>

        <p class="text-xl leading-relaxed text-gray-800 mb-16 font-serif">
          תחום הסחר הוא בו זמנית קריטי למשק ויחסית לא מפותח מבחינה טכנולוגית. יש המון מקום לבנות דברים חכמים, שקופים, ויעילים יותר 🚀.
        </p>

        <!-- Contact CTA -->
        <div class="relative bg-white rounded-3xl p-12 mt-20 shadow-2xl border-2 border-blue-200 overflow-hidden">
          <!-- Decorative background -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60"></div>

          <!-- Content -->
          <div class="relative">
            <div class="text-center mb-8">
              <div class="inline-block mb-4">
                <span class="text-6xl">💬</span>
              </div>
              <h3 class="text-4xl font-bold text-gray-900 mb-4">בואו נדבר</h3>
              <p class="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
                מעוניינים לשתף פעולה? רוצים לדבר על הפרויקט או על הזדמנויות בטכנולוגיית סחר?
                אשמח לשמוע מכם!
              </p>
            </div>

            <div class="flex gap-5 justify-center flex-wrap mt-10">
              <a
                href="mailto:akiva.s.dev@gmail.com"
                class="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:shadow-2xl hover:scale-105 transform"
              >
                <span class="text-2xl">📧</span>
                <span>שלחו מייל</span>
              </a>
              <a
                href="https://www.linkedin.com/in/akiva-schiff-blass-6b5b39167"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold text-lg rounded-2xl hover:from-gray-900 hover:to-black transition-all duration-300 hover:shadow-2xl hover:scale-105 transform"
              >
                <span class="text-2xl">💼</span>
                <span>LinkedIn</span>
              </a>
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
/* Make links more visible */
a {
  color: #2563eb;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
