export default class Paginacao {
  constructor({ paginaAtual = 1, tamanhoPagina = 10, totalRegistro = 0, totalPaginas = 0 } = {}) {
    this.paginaAtual = paginaAtual
    this.tamanhoPagina = tamanhoPagina
    this.totalRegistro = totalRegistro
    this.totalPaginas = totalPaginas
  }
} 