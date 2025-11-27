<template>
  <div class="min-h-[calc(100vh-64px)] bg-[#faf9f7]">
    <!-- Header Section - Matching site design -->
    <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden" dir="ltr">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIHN0cm9rZT0iIzMzNDQ1NSIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
          <span class="text-amber-400 text-sm font-medium tracking-widest uppercase">
            {{ locale === 'he' ? 'תובנות' : 'Insights' }}
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
          {{ locale === 'he' ? 'תובנות' : 'Insights' }}
        </h1>
        <p class="text-slate-400 mt-3 text-lg max-w-2xl" :dir="locale === 'he' ? 'rtl' : 'ltr'">
          {{ locale === 'he'
            ? 'סיפורים קצרים ותובנות מנתוני הסחר של ישראל'
            : 'Data stories and analysis from Israel\'s international trade'
          }}
        </p>
      </div>
    </div>

    <!-- Insights Grid - Magazine Layout -->
    <section class="py-16 sm:py-24 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <!-- Grid with editorial spacing -->
        <div class="grid md:grid-cols-2 gap-10 lg:gap-12">
          <InsightCard
            v-for="insight in insights"
            :key="insight.id"
            :insight="insight"
            @click="openModal(insight)"
          />
        </div>

        <!-- Empty state -->
        <div v-if="insights.length === 0" class="text-center py-24">
          <p class="text-slate-500 text-lg font-serif italic">
            {{ locale === 'he' ? 'אין תובנות זמינות כרגע' : 'No insights available yet' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Modal -->
    <InsightModal
      v-if="selectedInsight"
      :insight="selectedInsight"
      :is-open="isModalOpen"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import InsightCard from '@/components/InsightCard.vue'
import InsightModal from '@/components/InsightModal.vue'

const locale = inject('locale', 'en')

// Insights data
const insights = ref([
  {
    id: 'passover-beef',
    title: 'The Passover Effect: How Jewish Holidays Shape Israel\'s Beef Imports',
    titleHe: 'אפקט הפסח: איך החגים היהודיים מעצבים את יבוא הבשר לישראל',
    date: '2025-01-20',
    thumbnailImage: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800',
    chartImage: null,
    shortDescription: 'Israeli beef imports spike predictably before Passover and the High Holidays. Argentina supplies 42% of the $2.6B market — all certified kosher by Israeli rabbis.',
    shortDescriptionHe: 'יבוא הבשר לישראל זינק באופן צפוי לפני פסח וחגי תשרי. ארגנטינה מספקת 42% מהשוק בשווי 2.6 מיליארד דולר — הכל בהכשר של רבנים ישראליים.',
    description: 'Look at those peaks: April 2023, September 2023, May 2024, October 2024, March 2025, September 2025. They\'re not random — they\'re the Jewish calendar translated into shipping containers.\n\nThe spring peaks align with Passover preparations, when families gather for seders and festive meals. The autumn peaks hit before the High Holidays cluster — Rosh Hashanah, Sukkot, and the weeks of family gatherings in between. Importers know this. They stock up 4-6 weeks ahead, and the data shows it.\n\nBut there\'s a second story here. Those peaks aren\'t just cycling — they\'re climbing. The 2023 peaks hovered around $77-87M per month. By late 2025, they\'re hitting $130-136M. That\'s a 65% increase in peak demand in just two years.\n\nArgentina dominates at $1.1 billion (42% of total), followed by Brazil, Paraguay, Uruguay, and Poland. The South American dominance isn\'t about price — it\'s about kosher certification. Under Israeli law (Chok HaBasar), all imported meat must be certified by the Chief Rabbinate. Twice a year, nearly 100 Israeli rabbis fly to Argentina to supervise slaughter at certified facilities.\n\nNotice how June consistently crashes. No major holidays. The import pipeline takes a breath.',
    descriptionHe: 'תסתכלו על השיאים: אפריל 2023, ספטמבר 2023, מאי 2024, אוקטובר 2024, מרץ 2025, ספטמבר 2025. הם לא אקראיים — הם הלוח היהודי מתורגם למכולות משלוח.\n\nשיאי האביב מתואמים עם הכנות לפסח, כשמשפחות מתכנסות לסדרים ולארוחות חגיגיות. שיאי הסתיו פוגעים לפני אשכול חגי תשרי — ראש השנה, סוכות, והשבועות של מפגשים משפחתיים ביניהם. היבואנים יודעים את זה. הם מתאגרים 4-6 שבועות מראש, והנתונים מראים את זה.\n\nאבל יש כאן סיפור שני. השיאים האלה לא רק מחזוריים — הם מטפסים. שיאי 2023 היו סביב 77-87 מיליון דולר לחודש. עד סוף 2025, הם מגיעים ל-130-136 מיליון דולר. זו עלייה של 65% בביקוש השיא בשנתיים בלבד.\n\nארגנטינה שולטת עם 1.1 מיליארד דולר (42% מהסך), ואחריה ברזיל, פרגוואי, אורוגוואי ופולין. הדומיננטיות הדרום אמריקאית היא לא עניין של מחיר — היא עניין של הכשר. לפי החוק הישראלי (חוק הבשר), כל הבשר המיובא חייב להיות מוכשר על ידי הרבנות הראשית. פעמיים בשנה, כמעט 100 רבנים ישראלים טסים לארגנטינה לפקח על השחיטה במתקנים המוכשרים.\n\nשימו לב איך יוני תמיד צונח. אין חגים גדולים. צינור היבוא לוקח נשימה.',
    readMoreUrl: 'https://www.jta.org/2020/06/03/global/98-israeli-rabbis-fly-to-argentina-to-certify-thousands-of-tons-of-kosher-meat-and-save-a-growing-market',
    chartData: {
      monthly: [
        { month: 'Jan 23', value: 42.75, peak: false },
        { month: 'Feb 23', value: 54.35, peak: false },
        { month: 'Mar 23', value: 84.82, peak: false },
        { month: 'Apr 23', value: 82.36, peak: true },
        { month: 'May 23', value: 87.68, peak: false },
        { month: 'Jun 23', value: 36.79, peak: false },
        { month: 'Jul 23', value: 56.64, peak: false },
        { month: 'Aug 23', value: 86.72, peak: false },
        { month: 'Sep 23', value: 76.78, peak: true },
        { month: 'Oct 23', value: 84.37, peak: false },
        { month: 'Nov 23', value: 55.27, peak: false },
        { month: 'Dec 23', value: 33.91, peak: false },
        { month: 'Jan 24', value: 39.31, peak: false },
        { month: 'Feb 24', value: 55.81, peak: false },
        { month: 'Mar 24', value: 74.49, peak: false },
        { month: 'Apr 24', value: 91.97, peak: false },
        { month: 'May 24', value: 100.22, peak: true },
        { month: 'Jun 24', value: 66.97, peak: false },
        { month: 'Jul 24', value: 61.37, peak: false },
        { month: 'Aug 24', value: 68.80, peak: false },
        { month: 'Sep 24', value: 114.28, peak: false },
        { month: 'Oct 24', value: 126.86, peak: true },
        { month: 'Nov 24', value: 95.18, peak: false },
        { month: 'Dec 24', value: 75.38, peak: false },
        { month: 'Jan 25', value: 56.60, peak: false },
        { month: 'Feb 25', value: 80.80, peak: false },
        { month: 'Mar 25', value: 130.04, peak: true },
        { month: 'Apr 25', value: 96.82, peak: false },
        { month: 'May 25', value: 112.50, peak: false },
        { month: 'Jun 25', value: 65.17, peak: false },
        { month: 'Jul 25', value: 90.43, peak: false },
        { month: 'Aug 25', value: 122.97, peak: false },
        { month: 'Sep 25', value: 135.64, peak: true }
      ],
      byCountry: [
        { country: 'Argentina', value: 1111.06, color: '#ef4444', percent: 42.3 },
        { country: 'Brazil', value: 536.39, color: '#22c55e', percent: 20.4 },
        { country: 'Paraguay', value: 373.66, color: '#eab308', percent: 14.2 },
        { country: 'Uruguay', value: 270.51, color: '#06b6d4', percent: 10.3 },
        { country: 'Poland', value: 265.39, color: '#a855f7', percent: 10.1 }
      ],
      hsCode: '0201, 0202',
      product: 'Fresh & Frozen Beef'
    }
  },
  {
    id: 'italian-apples',
    title: 'Why Do Israeli Apples Come From the Alps?',
    titleHe: 'למה התפוחים בישראל מגיעים מהאלפים?',
    date: '2025-01-15',
    thumbnailImage: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=800&q=80',
    chartImage: null,
    shortDescription: 'Italy dominates Israel\'s fresh apple imports at $116M — more than double the US. The secret lies in South Tyrol\'s mountain orchards.',
    shortDescriptionHe: 'איטליה שולטת ביבוא התפוחים הטריים לישראל עם 116 מיליון דולר — יותר מכפול מארה״ב. הסוד טמון במטעי ההרים של דרום טירול.',
    description: 'Israel imports over $220 million worth of fresh apples annually, and Italy supplies more than half of it. But why Italy?\n\nThe answer is South Tyrol — a small Alpine region in northern Italy that produces 10% of all EU apples. The mountain terrain creates ideal conditions: cool nights, warm days, and 300 days of sunshine produce apples with intense color and exceptional crispness.\n\nThe data reveals a clear seasonal pattern: Italian apple imports peak in winter and early spring (January-March) when Israeli orchards are dormant. US apples fill the gap in summer months. Argentina appears briefly in the southern hemisphere\'s harvest season (June-August).\n\nThe seasonal dips in late summer (August-September) reflect the annual transition between harvest seasons. By 2025, import volumes hit record highs, with June reaching over $10M — suggesting growing Israeli demand for premium European fruit.',
    descriptionHe: 'ישראל מייבאת מעל 220 מיליון דולר של תפוחים טריים בשנה, ואיטליה מספקת יותר ממחצית. אבל למה דווקא איטליה?\n\nהתשובה היא דרום טירול — אזור אלפיני קטן בצפון איטליה שמייצר 10% מכלל התפוחים באיחוד האירופי. השטח ההררי יוצר תנאים אידיאליים: לילות קרירים, ימים חמים ו-300 ימי שמש בשנה מייצרים תפוחים עם צבע עז ופריכות יוצאת דופן.\n\nהנתונים חושפים דפוס עונתי ברור: יבוא התפוחים מאיטליה מגיע לשיא בחורף ובתחילת האביב (ינואר-מרץ) כשהמטעים הישראליים רדומים. תפוחים אמריקאים ממלאים את הפער בחודשי הקיץ. ארגנטינה מופיעה לזמן קצר בעונת הקטיף של חצי הכדור הדרומי (יוני-אוגוסט).\n\nהירידות העונתיות בסוף הקיץ (אוגוסט-ספטמבר) משקפות את המעבר השנתי בין עונות הקטיף. עד 2025, היבוא הגיע לשיאים חדשים, עם יוני שהגיע למעל 10 מיליון דולר — מה שמעיד על ביקוש ישראלי גובר לפירות אירופאיים איכוטיים.',
    readMoreUrl: 'https://www.producereport.com/article/south-tyrol-reveals-secrets-its-high-quality-apples',
    chartData: {
      monthly: [
        { month: 'Jan 23', value: 6.14 },
        { month: 'Feb 23', value: 7.09 },
        { month: 'Mar 23', value: 6.76 },
        { month: 'Apr 23', value: 5.87 },
        { month: 'May 23', value: 6.27 },
        { month: 'Jun 23', value: 4.82 },
        { month: 'Jul 23', value: 3.26 },
        { month: 'Aug 23', value: 2.48 },
        { month: 'Sep 23', value: 2.88 },
        { month: 'Oct 23', value: 4.05 },
        { month: 'Nov 23', value: 5.06 },
        { month: 'Dec 23', value: 5.61 },
        { month: 'Jan 24', value: 7.38 },
        { month: 'Feb 24', value: 9.27 },
        { month: 'Mar 24', value: 9.95 },
        { month: 'Apr 24', value: 8.48 },
        { month: 'May 24', value: 6.41 },
        { month: 'Jun 24', value: 7.24 },
        { month: 'Jul 24', value: 7.88 },
        { month: 'Aug 24', value: 4.88 },
        { month: 'Sep 24', value: 5.60 },
        { month: 'Oct 24', value: 5.32 },
        { month: 'Nov 24', value: 6.34 },
        { month: 'Dec 24', value: 7.41 },
        { month: 'Jan 25', value: 7.10 },
        { month: 'Feb 25', value: 8.26 },
        { month: 'Mar 25', value: 9.65 },
        { month: 'Apr 25', value: 8.24 },
        { month: 'May 25', value: 6.58 },
        { month: 'Jun 25', value: 10.39 },
        { month: 'Jul 25', value: 7.20 },
        { month: 'Aug 25', value: 5.34 },
        { month: 'Sep 25', value: 5.20 },
        { month: 'Oct 25', value: 6.83 }
      ],
      byCountry: {
        Italy: 115.59,
        'United States': 57.48,
        France: 19.04,
        Greece: 10.05,
        Argentina: 6.83
      },
      hsCode: '080810',
      product: 'Fresh Apples'
    }
  }
])

const selectedInsight = ref(null)
const isModalOpen = ref(false)

function openModal(insight) {
  selectedInsight.value = insight
  isModalOpen.value = true
  // Update URL with insight ID
  window.history.pushState({}, '', `#${insight.id}`)
}

function closeModal() {
  isModalOpen.value = false
  // Remove hash from URL
  window.history.pushState({}, '', window.location.pathname)
  setTimeout(() => {
    selectedInsight.value = null
  }, 300)
}

// Check URL hash on mount to open specific insight
onMounted(() => {
  const hash = window.location.hash.slice(1) // Remove the # symbol
  if (hash) {
    const insight = insights.value.find(i => i.id === hash)
    if (insight) {
      openModal(insight)
    }
  }
})
</script>
