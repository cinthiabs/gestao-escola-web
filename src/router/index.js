import { createRouter, createWebHistory } from 'vue-router'
import AlunosView from '../views/AlunosView.vue'
import MatriculasView from '../views/MatriculasView.vue'
import TurmasView from '../views/TurmasView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/alunos',
      name: 'alunos',
      component: AlunosView,
    },
    {
      path: '/turmas',
      name: 'turmas',
      component: TurmasView,
    },
    {
      path: '/matriculas',
      name: 'matriculas',
      component: MatriculasView,
    }
  ],
})

export default router
