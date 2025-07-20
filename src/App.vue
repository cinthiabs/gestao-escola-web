<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Sidebar -->
    <div v-if="route.path !== '/login'" class="w-72 bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-800 shadow-2xl">
      <div class="p-8">
        <div class="flex items-center space-x-3">
          <h1 class="text-2xl font-bold text-white">Gestão Escolar</h1>
          <div
            class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
              </path>
            </svg>
          </div>
        </div>
      </div>

      <nav class="mt-8 space-y-3">
        <RouterLink to="/alunos"
          class="flex items-center px-4 py-4 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 group w-full"
          active-class="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
          <div
            class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/20 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <span class="font-medium">Alunos</span>
        </RouterLink>

        <RouterLink to="/turmas"
          class="flex items-center px-4 py-4 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 group w-full"
          active-class="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
          <div
            class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/20 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
              </path>
            </svg>
          </div>
          <span class="font-medium">Turmas</span>
        </RouterLink>

        <RouterLink to="/matriculas"
          class="flex items-center px-4 py-4 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300 group w-full"
          active-class="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
          <div
            class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/20 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <span class="font-medium">Matrículas</span>
        </RouterLink>


      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
