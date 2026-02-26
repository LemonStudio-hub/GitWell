<template>
  <div class="repo-input">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>
    <div class="flex gap-3">
      <input
        v-model="internalValue"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        @keyup.enter="$emit('enter', internalValue)"
      />
      <button
        :disabled="disabled || !internalValue"
        class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        @click="$emit('submit', internalValue)"
      >
        {{ buttonText }}
      </button>
    </div>
    <p v-if="error" class="mt-2 text-sm text-danger-600">{{ error }}</p>
    <p v-if="hint" class="mt-2 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  buttonText?: string
  hint?: string
  error?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'https://github.com/owner/repo',
  buttonText: '分析',
  hint: '支持 GitHub 和 GitLab 仓库 URL',
  error: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': [value: string]
  'enter': [value: string]
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>