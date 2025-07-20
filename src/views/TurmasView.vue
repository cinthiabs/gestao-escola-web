<script setup>
import { ref, onMounted } from 'vue'
import Turma from '@/models/turma'
import Paginacao from '@/models/paginacao'
import { apiFetch } from '@/api'

const turmas = ref([])
const loading = ref(false)
const editando = ref(false)
const turmaEditando = ref(null)

// Paginação
const paginacao = ref(new Paginacao())

const filtroNome = ref('')

const form = ref({
  nome: '',
  descricao: ''
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
    nome: '',
    descricao: ''
  }
  editando.value = false
  turmaEditando.value = null
}

const carregarTurmas = async () => {
  loading.value = true
  try {
    const queryNome = filtroNome.value ? `&nome=${encodeURIComponent(filtroNome.value)}` : ''
    const response = await apiFetch(`/turmas?NumeroPagina=${paginacao.value.paginaAtual}&TamanhoPagina=${paginacao.value.tamanhoPagina}${queryNome}`)
    if (response.status === 204) {
      turmas.value = []
  
      paginacao.value.paginaAtual = 1
      paginacao.value.tamanhoPagina = 10
      paginacao.value.totalRegistros = 0
      paginacao.value.totalPaginas = 0

    } else if (response.ok) {
     
      const data = await response.json()
      turmas.value = (data.turmas || []).map(t => new Turma(t))
      paginacao.value.paginaAtual = data.paginaAtual || 1
      paginacao.value.tamanhoPagina = data.tamanhoPagina || 10
      paginacao.value.totalRegistros = data.totalRegistro || 0
      paginacao.value.totalPaginas = data.totalPaginas || 0
      
    } else {
      mostrarAlerta('Erro ao carregar turmas', 'error')
    }
  } catch (error) {
    mostrarAlerta('Erro ao carregar turmas', 'error')
  } finally {
    loading.value = false
  }
}

const salvarTurma = async () => {
  if (!form.value.nome.trim()) {
    mostrarAlerta('Nome é obrigatório', 'error')
    return
  }

  try {
    const url = '/turmas'
    const method = editando.value ? 'PUT' : 'POST'
    const body = {
      nome: form.value.nome,
      descricao: form.value.descricao
    }
    if (editando.value && turmaEditando.value && turmaEditando.value.id) {
      body.id = turmaEditando.value.id
    }
    const response = await apiFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (response.ok) {
      mostrarAlerta(
        editando.value ? 'Turma atualizada com sucesso!' : 'Turma criada com sucesso!',
        'success'
      )
      limparFormulario()
      await carregarTurmas()

    } else if (response.status === 400) {
      const errors = await response.json()
      if (Array.isArray(errors)) {
        const mensagem = errors.map(e => e.errorMessage).join('\n')
        mostrarAlerta(mensagem, 'error')
      } else {
        mostrarAlerta(errors.message || 'Erro ao salvar turma', 'error')
      }
    } else {
      const error = await response.json()
      mostrarAlerta(error.message || 'Erro ao salvar turma', 'error')
    }
  } catch (error) {
    mostrarAlerta('Erro ao salvar turma', 'error')
  }
}

const editarTurma = (turma) => {
  form.value = {
    nome: turma.nome,
    descricao: turma.descricao
  }
  editando.value = true
  turmaEditando.value = turma
}

const removerTurma = async (id) => {
  if (!confirm('Tem certeza que deseja remover esta turma?')) {
    return
  }
  try {
    const response = await apiFetch(`/turmas/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      mostrarAlerta('Turma removida com sucesso!', 'success')
      await carregarTurmas()
    } else {
      mostrarAlerta('Erro ao remover turma', 'error')
    }
  } catch (error) {
    mostrarAlerta('Erro ao remover turma', 'error')
  }
}

const cancelarEdicao = () => {
  limparFormulario()
}

const paginaAnterior = async () => {
  if (paginacao.value.paginaAtual > 1) {
    paginacao.value.paginaAtual--
    await carregarTurmas()
  }
}

const proximaPagina = async () => {
  if (paginacao.value.paginaAtual < paginacao.value.totalPaginas) {
    paginacao.value.paginaAtual++
    await carregarTurmas()
  }
}

onMounted(() => {
  carregarTurmas()
})
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h2 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Gerenciamento de Turmas
      </h2>
      <p class="text-gray-600 mt-2">Gerencie as turmas da instituição</p>
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
          Lista de Turmas
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-indigo-100 to-purple-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">ID</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Nome
                <input
                  v-model="filtroNome"
                  @keyup.enter="carregarTurmas"
                  type="text"
                  placeholder="Pesquisar..."
                  class="mt-3 px-2 py-1 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white text-xs w-44"
                />
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Descrição</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Qtd. Alunos</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-8 text-center">
                <span class="text-gray-600">Carregando turmas...</span>
              </td>
            </tr>
            <tr v-else-if="turmas.length === 0">
              <td colspan="5" class="px-6 py-8 text-center">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                  <span class="text-gray-500">Nenhuma turma encontrada</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="turma in turmas" :key="turma.id" class="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ turma.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ turma.nome }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ turma.descricao }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ turma.quantidadeAlunos }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  @click="editarTurma(turma)"
                  class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 mr-2"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Editar
                </button>
                <button 
                  @click="removerTurma(turma.id)"
                  class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Excluir
                </button>
              </td>
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
          {{ editando ? 'Editar Turma' : 'Nova Turma' }}
        </h3>
      </div>
      <form @submit.prevent="salvarTurma" class="p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="nome" class="block text-sm font-semibold text-gray-700">Nome *</label>
            <input
              id="nome"
              v-model="form.nome"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Nome da turma"
            />
          </div>
          <div class="space-y-2">
            <label for="descricao" class="block text-sm font-semibold text-gray-700">Descrição *</label>
            <input
              id="descricao"
              v-model="form.descricao"
              type="text"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Descrição da turma"
            />
          </div>
        </div>
        <div class="flex gap-4 pt-6">
          <button
            type="submit"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {{ editando ? 'Atualizar' : 'Salvar' }}
          </button>
          <button
            v-if="editando"
            type="button"
            @click="cancelarEdicao"
            class="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 