<template>
  <div class="contact-page min-h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
    <!-- Hero Header -->
    <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIHN0cm9rZT0iIzMzNDQ1NSIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
          <span class="text-amber-400 text-sm font-medium tracking-widest uppercase">Get in Touch</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
          Let's Connect
        </h1>
        <p class="text-slate-400 mt-3 text-lg max-w-2xl">
          Get in touch about trade technology and data visualization.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 -mt-8 relative z-10 pb-16">
      <!-- Contact Card with Ship Animation -->
      <div class="relative">
        <!-- The animated ship container -->
        <div class="relative h-[400px] flex items-center justify-center">
          <!-- Contact Card -->
          <div
            ref="contactCard"
            class="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-100 p-10 md:p-14 max-w-md w-full"
          >
            <!-- Decorative corner -->
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-50 to-transparent rounded-tr-3xl"></div>

            <!-- Name -->
            <div class="relative">
              <h2 class="text-3xl font-serif font-bold text-slate-900 mb-2">
                Akiva Schiff-Blass
              </h2>
              <p class="text-slate-500 mb-8">Builder of data experiences</p>

              <!-- Contact Links -->
              <div class="space-y-5">
                <!-- Email -->
                <a
                  href="mailto:akiva.s.dev@gmail.com"
                  class="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all duration-300"
                >
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Email</div>
                    <div class="text-slate-900 font-medium group-hover:text-blue-600 transition-colors">akiva.s.dev@gmail.com</div>
                  </div>
                  <svg class="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                <!-- LinkedIn -->
                <a
                  href="https://www.linkedin.com/in/akiva-schiff-blass-6b5b39167"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all duration-300"
                >
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform duration-300">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">LinkedIn</div>
                    <div class="text-slate-900 font-medium group-hover:text-sky-600 transition-colors">Connect with me</div>
                  </div>
                  <svg class="w-5 h-5 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            <!-- Ship attached to card -->
            <div
              ref="shipElement"
              class="absolute -bottom-8 -right-4 z-20 transition-transform opacity-70"
            >
              <img src="/icon-ship.png" alt="" class="w-24 h-24 drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      <!-- Tagline -->
      <div class="text-center mt-8">
        <p class="text-slate-400 text-sm">
          Currently exploring opportunities in trade technology
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const contactCard = ref(null)
const shipElement = ref(null)

let floatAnimation = null
let shipBob = null

onMounted(() => {
  // Gentle floating animation for the card
  if (contactCard.value) {
    floatAnimation = gsap.to(contactCard.value, {
      y: -8,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }

  // Ship bobbing animation (slightly different timing for natural feel)
  if (shipElement.value) {
    shipBob = gsap.to(shipElement.value, {
      y: -4,
      rotation: 3,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }
})

onUnmounted(() => {
  if (floatAnimation) floatAnimation.kill()
  if (shipBob) shipBob.kill()
})
</script>

<style scoped>
.contact-page {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
}
</style>
