<script setup>
import { ref, onMounted } from 'vue'
import Aluno from '@/models/aluno'
import Paginacao from '@/models/paginacao'
import { apiFetch } from '@/api'

const alunos = ref([])
const loading = ref(false)
const editando = ref(false)
const alunoEditando = ref(null)

// Paginação
const paginacao = ref(new Paginacao())

const filtroNome = ref('')

const form = ref({
  nome: '',
  dataNascimento: '',
  cpf: '',
  email: '',
  senha: ''
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
    dataNascimento: '',
    cpf: '',
    email: '',
    senha: ''
  }
  editando.value = false
  alunoEditando.value = null
}

const carregarAlunos = async () => {
  loading.value = true
  try {
    const queryNome = filtroNome.value ? `&nome=${encodeURIComponent(filtroNome.value)}` : ''
    const response = await apiFetch(`/alunos?NumeroPagina=${paginacao.value.paginaAtual}&TamanhoPagina=${paginacao.value.tamanhoPagina}${queryNome}`)
    if (response.status === 204) {
      alunos.value = []
      paginacao.value.paginaAtual = 1
      paginacao.value.tamanhoPagina = 10
      paginacao.value.totalRegistros = 0
      paginacao.value.totalPaginas = 0

    } else if (response.ok) {
      const data = await response.json()

      alunos.value = (data.alunos || []).map(a => new Aluno(a))
      paginacao.value.paginaAtual = data.paginaAtual || 1
      paginacao.value.tamanhoPagina = data.tamanhoPagina || 10
      paginacao.value.totalRegistros = data.totalRegistro || 0
      paginacao.value.totalPaginas = data.totalPaginas || 0

    } else {
      mostrarAlerta('Erro ao carregar alunos', 'error')
    }
  } catch (error) {
    mostrarAlerta('Erro ao carregar alunos', 'error')
  } finally {
    loading.value = false
  }
}

const salvarAluno = async () => {
  if (!form.value.nome.trim()) {
    mostrarAlerta('Nome é obrigatório', 'error')
    return
  }

  try {
    const url = '/alunos'
    const method = editando.value ? 'PUT' : 'POST'

    const body = {
      nome: form.value.nome,
      dataNascimento: form.value.dataNascimento,
      cpf: form.value.cpf,
      email: form.value.email,
      senha: form.value.senha
    }
    if (editando.value && alunoEditando.value && alunoEditando.value.id) {
      body.id = alunoEditando.value.id
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
        editando.value ? 'Aluno atualizado com sucesso!' : 'Aluno criado com sucesso!',
        'success'
      )
      limparFormulario()
      await carregarAlunos()
    } else if (response.status === 400) {
      
      const errors = await response.json()
      if (Array.isArray(errors)) {
        const mensagem = errors.map(e => e.errorMessage).join('\n')
        mostrarAlerta(mensagem, 'error')
      } else {
        mostrarAlerta(errors.message || 'Erro ao salvar aluno', 'error')
      }
    } else {
      const error = await response.json()
      mostrarAlerta(error.message || 'Erro ao salvar aluno', 'error')
    }
  } catch (error) {
    mostrarAlerta('Erro ao salvar aluno', 'error')
  }
}

const editarAluno = (aluno) => {
  form.value = {
    nome: aluno.nome,
    dataNascimento: aluno.dataNascimento ? aluno.dataNascimento.split('T')[0] : '',
    cpf: aluno.cpf,
    email: aluno.email,
    senha: ''
  }
  editando.value = true
  alunoEditando.value = aluno
}

const removerAluno = async (id) => {
  if (!confirm('Tem certeza que deseja remover este aluno?')) {
    return
  }

  try {
    const response = await apiFetch(`/alunos/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      mostrarAlerta('Aluno removido com sucesso!', 'success')
      await carregarAlunos()
    } else {
      mostrarAlerta('Erro ao remover aluno', 'error')
    }
  } catch (error) {
    mostrarAlerta('Erro ao remover aluno', 'error')
  }
}

const cancelarEdicao = () => {
  limparFormulario()
}

const paginaAnterior = async () => {
  if (paginacao.value.paginaAtual > 1) {
    paginacao.value.paginaAtual--
    await carregarAlunos()
  }
}

const proximaPagina = async () => {
  if (paginacao.value.paginaAtual < paginacao.value.totalPaginas) {
    paginacao.value.paginaAtual++
    await carregarAlunos()
  }
}

onMounted(() => {
  carregarAlunos()
})
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h2 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Gerenciamento de Alunos
      </h2>
      <p class="text-gray-600 mt-2">Gerencie os dados dos alunos da instituição</p>
    </div>

    <!-- Alert -->
    <div v-if="alerta.mostrar" 
         :class="`mb-6 p-4 rounded-xl shadow-lg ${
           alerta.tipo === 'success' 
             ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800' 
             : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800'
         }`">
      <div class="flex items-center">
        <svg v-if="alerta.tipo === 'success'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {{ alerta.mensagem }}
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100">
      <div class="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
        <h3 class="text-xl font-semibold text-gray-800 flex items-center">
          <svg class="w-6 h-6 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Lista de Alunos
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
                  @keyup.enter="carregarAlunos"
                  type="text"
                  placeholder="Pesquisar..."
                  class="mt-3 px-2 py-1 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white text-xs w-44"
                />
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Nascimento</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">CPF</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-8 text-center">
                <div class="flex items-center justify-center">
                  <svg class="animate-spin h-6 w-6 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-gray-600">Carregando alunos...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="alunos.length === 0">
              <td colspan="6" class="px-6 py-8 text-center">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                  <span class="text-gray-500">Nenhum aluno encontrado</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="aluno in alunos" :key="aluno.id" class="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ aluno.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ aluno.nome }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ aluno.cpf }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ aluno.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  @click="editarAluno(aluno)"
                  class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 mr-2"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Editar
                </button>
                <button 
                  @click="removerAluno(aluno.id)"
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
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Anterior
            </button>
            <button
              @click="proximaPagina"
              :disabled="paginacao.paginaAtual === paginacao.totalPaginas"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Próximo
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div class="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
        <h3 class="text-xl font-semibold text-gray-800 flex items-center">
          <svg class="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          {{ editando ? 'Editar Aluno' : 'Novo Aluno' }}
        </h3>
      </div>
      
      <form @submit.prevent="salvarAluno" class="p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="nome" class="block text-sm font-semibold text-gray-700">Nome *</label>
            <input
              id="nome"
              v-model="form.nome"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Nome completo"
            />
          </div>
          
          <div class="space-y-2">
            <label for="dataNascimento" class="block text-sm font-semibold text-gray-700">Data de Nascimento *</label>
            <input
              id="dataNascimento"
              v-model="form.dataNascimento"
              type="date"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
          
          <div class="space-y-2">
            <label for="cpf" class="block text-sm font-semibold text-gray-700">CPF *</label>
            <input
              id="cpf"
              v-model="form.cpf"
              type="text"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="000.000.000-00"
            />
          </div>
          
          <div class="space-y-2">
            <label for="email" class="block text-sm font-semibold text-gray-700">Email *</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="email@exemplo.com"
            />
          </div>
          
          <div class="space-y-2">
            <label for="senha" class="block text-sm font-semibold text-gray-700">
              {{ editando ? 'Nova Senha (deixe em branco para manter)' : 'Senha *' }}
            </label>
            <input
              id="senha"
              v-model="form.senha"
              type="password"
              :required="!editando"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Senha"
            />
          </div>
        </div>
        
        <div class="flex gap-4 pt-6">
          <button
            type="submit"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {{ editando ? 'Atualizar' : 'Salvar' }}
          </button>
          
          <button
            v-if="editando"
            type="button"
            @click="cancelarEdicao"
            class="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 