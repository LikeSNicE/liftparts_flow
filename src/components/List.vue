<script setup lang="ts">

interface ListProps {
  data?: any[];
}

const { data } = defineProps<ListProps>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="item in data"
      :key="item.id"
      class="bg-(--bg) rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors"
    >
      <div class="flex items-сenter justify-between gap-4">
        <div class="flex-auto">
          <slot name="list-content" :item="item" />
        </div>
        <div class="flex gap-2 items-center">
          <slot name="list-actions" :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>
