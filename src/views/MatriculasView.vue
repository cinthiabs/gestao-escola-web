<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/api'
import Paginacao from '@/models/paginacao'

const matriculas = ref([])
const loading = ref(false)

// Paginação
const paginacao = ref(new Paginacao())

const form = ref({
  alunoId: '',
  turmaId: ''
})

const alerta = ref({
  mostrar: false,
  mensagem: '',
  tipo: 'success'
})

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

const limparFormulario = () => {
  form.value = {
    alunoId: '',
    turmaId: ''
  }
}

const carregarMatriculas = async () => {
  loading.value = true
  try {
    const response = await apiFetch(`/matriculas?NumeroPagina=${paginacao.value.paginaAtual}&TamanhoPagina=${paginacao.value.tamanhoPagina}`)
    if (response.status === 204) {
     
      matriculas.value = []
      paginacao.value.paginaAtual = 1
      paginacao.value.tamanhoPagina = 10
      paginacao.value.totalRegistros = 0
      paginacao.value.totalPaginas = 0

    } else if (response.ok) {
      const data = await response.json()
      
      matriculas.value = data.matriculas || []
      paginacao.value.paginaAtual = data.paginaAtual || 1
      paginacao.value.tamanhoPagina = data.tamanhoPagina || 10
      paginacao.value.totalRegistros = data.totalRegistro || 0
      paginacao.value.totalPaginas = data.totalPaginas || 0

    } else {
      mostrarAlerta('Erro ao carregar matrículas', 'error')
    }
  } catch (error) {
    mostrarAlerta('Erro ao carregar matrículas', 'error')
  } finally {
    loading.value = false
  }
}

const salvarMatricula = async () => {
  if (!form.value.alunoId || !form.value.turmaId) {
    mostrarAlerta('Aluno e Turma são obrigatórios', 'error')
    return
  }
  try {
    const response = await apiFetch('/matriculas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alunoId: Number(form.value.alunoId),
        turmaId: Number(form.value.turmaId)
      })
    })
    if (response.ok) {
      mostrarAlerta('Matrícula criada com sucesso!', 'success')
      limparFormulario()
      await carregarMatriculas()

    } else if (response.status === 400) {
     
      const errors = await response.json()
      if (Array.isArray(errors)) {
        const mensagem = errors.map(e => e.errorMessage).join('\n')
        mostrarAlerta(mensagem, 'error')
      } else {
        mostrarAlerta(errors.message || 'Erro ao salvar matrícula', 'error')
      }
    } else {
      const error = await response.json()
      mostrarAlerta(error.message || 'Erro ao salvar matrícula', 'error')
    }
  } catch (error) {
    mostrarAlerta('Erro ao salvar matrícula', 'error')
  }
}

const paginaAnterior = async () => {
  if (paginacao.value.paginaAtual > 1) {
    paginacao.value.paginaAtual--
    await carregarMatriculas()
  }
}

const proximaPagina = async () => {
  if (paginacao.value.paginaAtual < paginacao.value.totalPaginas) {
    paginacao.value.paginaAtual++
    await carregarMatriculas()
  }
}

onMounted(() => {
  carregarMatriculas()
})
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h2 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Gerenciamento de Matrículas
      </h2>
      <p class="text-gray-600 mt-2">Gerencie as matrículas dos alunos nas turmas</p>
    </div>

    <!-- Alert -->
    <div v-if="alerta.mostrar" 
         :class="`mb-6 p-4 rounded-xl shadow-lg ${
           alerta.tipo === 'success' 
             ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800' 
             : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800'
         }`">
      <div class="flex items-center">
        <span class="font-semibold">{{ alerta.mensagem }}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100">
      <div class="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
        <h3 class="text-xl font-semibold text-gray-800 flex items-center">
          <svg class="w-6 h-6 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Lista de Matrículas
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-indigo-100 to-purple-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">ID</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Aluno</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Turma</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Data Matrícula</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="4" class="px-6 py-8 text-center">
                <span class="text-gray-600">Carregando matrículas...</span>
              </td>
            </tr>
            <tr v-else-if="matriculas.length === 0">
              <td colspan="4" class="px-6 py-8 text-center">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                  <span class="text-gray-500">Nenhuma matrícula encontrada</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="matricula in matriculas" :key="matricula.id" class="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ matricula.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ matricula.aluno }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ matricula.turma }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ new Date(matricula.dataMatricula).toLocaleDateString('pt-BR') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Paginação -->
      <div v-if="paginacao.totalPaginas > 1" class="px-6 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-100">
        <div class="flex items-center justify-between">
          <div class="text-sm text-indigo-700 font-medium">
            Mostrando página {{ paginacao.paginaAtual }} de {{ paginacao.totalPaginas }} 
            <span class="text-gray-600">({{ paginacao.totalRegistros }} registros no total)</span>
          </div>
          <div class="flex space-x-3">
            <button
              @click="paginaAnterior"
              :disabled="paginacao.paginaAtual === 1"
              class="inline-flex items-center px-4 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Anterior
            </button>
            <button
              @click="proximaPagina"
              :disabled="paginacao.paginaAtual === paginacao.totalPaginas"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mt-8">
      <div class="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
        <h3 class="text-xl font-semibold text-gray-800 flex items-center">
          <svg class="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nova Matrícula
        </h3>
      </div>
      <form @submit.prevent="salvarMatricula" class="p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="alunoId" class="block text-sm font-semibold text-gray-700">ID do Aluno *</label>
            <input
              id="alunoId"
              v-model="form.alunoId"
              type="number"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="ID do aluno"
            />
          </div>
          <div class="space-y-2">
            <label for="turmaId" class="block text-sm font-semibold text-gray-700">ID da Turma *</label>
            <input
              id="turmaId"
              v-model="form.turmaId"
              type="number"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="ID da turma"
            />
          </div>
        </div>
        <div class="flex gap-4 pt-6">
          <button
            type="submit"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 