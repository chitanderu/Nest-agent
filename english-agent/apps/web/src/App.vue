<template>
  <RouterView />
  <Search />
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router'
import Search from '@/components/Search/index.vue'
</script>
