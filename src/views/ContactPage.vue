<template>
  <div class="min-h-[calc(100vh-64px)] py-16 px-4 bg-gray-50">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">
        {{ locale === 'he' ? 'צור קשר' : 'Contact Us' }}
      </h1>

      <div class="card p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ locale === 'he' ? 'שם' : 'Name' }}
            </label>
            <input
              type="text"
              v-model="form.name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#053778] focus:border-transparent"
              :placeholder="locale === 'he' ? 'הכנס את שמך' : 'Enter your name'"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ locale === 'he' ? 'אימייל' : 'Email' }}
            </label>
            <input
              type="email"
              v-model="form.email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#053778] focus:border-transparent"
              :placeholder="locale === 'he' ? 'your@email.com' : 'your@email.com'"
            />
          </div>

          <!-- Subject -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ locale === 'he' ? 'נושא' : 'Subject' }}
            </label>
            <input
              type="text"
              v-model="form.subject"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#053778] focus:border-transparent"
              :placeholder="locale === 'he' ? 'נושא ההודעה' : 'Message subject'"
            />
          </div>

          <!-- Message -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ locale === 'he' ? 'הודעה' : 'Message' }}
            </label>
            <textarea
              v-model="form.message"
              rows="5"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#053778] focus:border-transparent resize-none"
              :placeholder="locale === 'he' ? 'כתוב את הודעתך כאן...' : 'Write your message here...'"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-primary w-full">
            {{ locale === 'he' ? 'שלח הודעה' : 'Send Message' }}
          </button>
        </form>
      </div>

      <!-- Contact Info -->
      <div class="mt-12 text-center">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          {{ locale === 'he' ? 'דרכים נוספות ליצירת קשר' : 'Other Ways to Reach Us' }}
        </h2>
        <div class="flex justify-center gap-8 text-gray-600">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-[#053778]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>info@israeltrade.com</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const locale = inject('locale', 'en')

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

function handleSubmit() {
  // TODO: Implement form submission
  console.log('Form submitted:', form.value)
  alert(locale.value === 'he' ? 'תודה על פנייתך!' : 'Thank you for your message!')
}
</script>
