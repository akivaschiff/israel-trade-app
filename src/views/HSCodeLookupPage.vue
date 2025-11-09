<template>
  <div class="flex-1 flex flex-col bg-white overflow-hidden min-h-[calc(100vh-64px)]">
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto">

        <!-- Page Header -->
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">HS Code Lookup</h1>
          <p class="text-gray-600">Translate product descriptions into Harmonized System (HS) codes</p>
        </div>

        <!-- HS Code Lookup Widget -->
        <div class="bg-white rounded-lg shadow-lg p-8 mb-6">
          <HSCodeLookupWidget
            :auto-focus="true"
            @select="handleCodeSelect"
          />
        </div>

        <!-- Info section -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="font-semibold text-blue-800 mb-3">How it works</h3>
          <ol class="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>Enter a product name or description (e.g., "coffee", "smartphones", "fresh tomatoes")</li>
            <li>The AI will search the database and may ask clarifying questions</li>
            <li>Answer any questions to narrow down the results</li>
            <li>You'll receive a list of matching HS codes with descriptions</li>
            <li>Click "New Search" to start over</li>
          </ol>
        </div>

        <!-- Tips section -->
        <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 class="font-semibold text-yellow-800 mb-2">💡 Tips</h3>
          <ul class="text-sm text-yellow-700 space-y-1">
            <li>• Be as specific as possible (e.g., "fresh tomatoes" vs just "tomatoes")</li>
            <li>• Answer clarifying questions with numbers (1, 2, 3) or descriptions</li>
            <li>• You can ask for "all types" to see all related HS codes</li>
            <li>• HS codes are hierarchical: 2 digits (chapter) → 4 digits (heading) → 6+ digits (subheading)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HSCodeLookupWidget from '@/components/HSCodeLookupWidget.vue'

function handleCodeSelect(hsCode) {
  console.log('Selected HS Code:', hsCode)
  // You can emit this to parent or handle it here
  // For example, could navigate to product details page
}
</script>
