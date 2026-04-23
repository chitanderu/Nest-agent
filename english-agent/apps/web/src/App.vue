<template>
  <RouterView />
  <Header />
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './layout/Header/index.vue'
</script>
