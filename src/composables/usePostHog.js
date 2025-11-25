import posthog from 'posthog-js'

export function usePostHog() {
  posthog.init('phc_b02huA7yzGA3wFoqI4bzgyKfJTAwq4jfps3l581RDfq', {
    api_host: 'https://eu.i.posthog.com',
    defaults: '2025-05-24',
    person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
  })

  return { posthog }
}