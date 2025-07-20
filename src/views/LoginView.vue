<script setup>
import { ref } from 'vue'
import Admin from '@/models/admin'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/api'

const router = useRouter()

const form = ref({
  email: '',
  senha: ''
})

const alerta = ref({
  mostrar: false,
  mensagem: '',
  tipo: 'success'
})

const token = ref('')
const showRegister = ref(false)
const registerForm = ref({ email: '', senha: '' })
const registerAlert = ref({ mostrar: false, mensagem: '', tipo: 'error' })

const mostrarAlerta = (mensagem, tipo = 'success') => {
  alerta.value = {
    mostrar: true,
    mensagem,
    tipo
  }
  setTimeout(() => {
    alerta.value.mostrar = false
  }, 5000)
}

const mostrarRegisterAlerta = (mensagem, tipo = 'error') => {
  registerAlert.value = {
    mostrar: true,
    mensagem,
    tipo
  }
  setTimeout(() => {
    registerAlert.value.mostrar = false
  }, 5000)
}

const limparFormulario = () => {
  form.value = { email: '', senha: '' }
}
const limparRegisterForm = () => {
  registerForm.value = { email: '', senha: '' }
}

const registrar = async () => {
  if (!registerForm.value.email || !registerForm.value.senha) {
    mostrarRegisterAlerta('Preencha email e senha', 'error')
    return
  }
  try {
    const admin = new Admin({
      email: registerForm.value.email,
      senha: registerForm.value.senha
    })
    
    const response = await apiFetch('/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin)
    })
    
    if (response.ok) {
      mostrarAlerta('Admin registrado com sucesso!', 'success')
      limparRegisterForm()
      showRegister.value = false
    } else if (response.status === 400) {
      
        const errors = await response.json()
      if (Array.isArray(errors)) {
        const mensagem = errors.map(e => e.errorMessage).join('\n')
        mostrarRegisterAlerta(mensagem, 'error')
      } else {
        mostrarRegisterAlerta(errors.message || 'Erro ao registrar', 'error')
      }
    } else {
      const error = await response.json()
      mostrarRegisterAlerta(error.message || 'Erro ao registrar', 'error')
    }
  } catch (error) {
    mostrarRegisterAlerta('Erro ao registrar', 'error')
  }
}

const logar = async () => {
  if (!form.value.email || !form.value.senha) {
    mostrarAlerta('Preencha email e senha', 'error')
    return
  }
  try {
    const admin = new Admin({
      email: form.value.email,
      senha: form.value.senha
    })
    
    const response = await apiFetch('/admins/autentica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin)
    })

    if (response.status === 204) {
      mostrarAlerta('Usuário não cadastrado', 'error')
    } 
    
    else if (response.ok) {
      const data = await response.json()
    
      token.value = data.token
      localStorage.setItem('jwt_token', data.token)

      mostrarAlerta('Login realizado com sucesso!', 'success')
     
      setTimeout(() => {
        router.push('/alunos')
      }, 500)

    } else if (response.status === 400) {
   
        const errors = await response.json()
      if (Array.isArray(errors)) {
        const mensagem = errors.map(e => e.errorMessage).join('\n')
        mostrarAlerta(mensagem, 'error')
      } else {
        mostrarAlerta(errors.message || 'Erro ao logar', 'error')
      }
    } else {
      const error = await response.json()
      mostrarAlerta(error.message || 'Erro ao logar', 'error')
    }
  } catch (error) {
    mostrarAlerta('Erro ao logar', 'error')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
    <div class="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md border border-gray-100 relative">
      <h2 class="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
        Login
      </h2>
      <p class="text-center text-gray-500 mb-8">Acesse sua conta de administrador</p>

      <div v-if="alerta.mostrar" :class="`mb-6 p-4 rounded-xl shadow-lg ${
        alerta.tipo === 'success' 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800' 
          : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800'}`">
        <div class="flex items-center">
          <span class="font-semibold">{{ alerta.mensagem }}</span>
        </div>
      </div>

      <form @submit.prevent class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-semibold text-gray-700">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            placeholder="Seu email"
          />
        </div>
        <div>
          <label for="senha" class="block text-sm font-semibold text-gray-700">Senha</label>
          <input
            id="senha"
            v-model="form.senha"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            placeholder="Sua senha"
          />
        </div>
        <div class="flex gap-4 pt-4">
          <button
            type="button"
            @click="logar"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl w-full justify-center"
          >
            Entrar
          </button>
        </div>
      </form>
      <div class="text-center mt-6">
        <span class="text-gray-600">Não tem uma conta?</span>
        <button @click="showRegister = true" class="ml-2 text-indigo-600 hover:underline font-semibold">Registre-se</button>
      </div>
   
      <!-- Modal de registro -->
      <div v-if="showRegister" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 relative">
          <button @click="showRegister = false" class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
          <h2 class="text-2xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Registrar
          </h2>
          <p class="text-center text-gray-500 mb-6">Crie sua conta de administrador</p>
          <div v-if="registerAlert.mostrar" :class="`mb-6 p-4 rounded-xl shadow-lg ${registerAlert.tipo === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800' : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800'}`">
            <div class="flex items-center">
              <span class="font-semibold">{{ registerAlert.mensagem }}</span>
            </div>
          </div>
          <form @submit.prevent class="space-y-6">
            <div>
              <label for="register-email" class="block text-sm font-semibold text-gray-700">Email</label>
              <input
                id="register-email"
                v-model="registerForm.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Seu email"
              />
            </div>
            <div>
              <label for="register-senha" class="block text-sm font-semibold text-gray-700">Senha</label>
              <input
                id="register-senha"
                v-model="registerForm.senha"
                type="password"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Sua senha"
              />
            </div>
            <div class="flex gap-4 pt-4">
              <button
                type="button"
                @click="registrar"
                class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl w-full justify-center"
              >
                Registrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
