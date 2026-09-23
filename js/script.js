/* ==========================================================================
   PORTFÓLIO | ELOÁ GALDINO  -  script.js
   --------------------------------------------------------------------------
   Índice
   1. Configuração (você pode editar)
   2. Atalhos
   3. Tema claro e escuro
   4. Menu no celular
   5. Cabeçalho e link ativo do menu
   6. Foto (plano B se a imagem não carregar)
   7. Filtro de projetos
   8. Indicador de sprint
   9. Copiar e-mail
   10. Ano do rodapé
   11. Início
   ========================================================================== */
'use strict';


/* 1. CONFIGURAÇÃO ---------------------------------------------------------
   Datas das sprints do projeto atual (formato AAAA-MM-DD).
   Quando começar outro projeto, é só trocar as datas e os nomes aqui.
   O indicador da seção "Trajetória" se ajusta sozinho.                    */
const SPRINTS = [
  { nome: 'Sprint 1', inicio: '2026-09-07', fim: '2026-09-27' },
  { nome: 'Sprint 2', inicio: '2026-10-05', fim: '2026-10-25' },
  { nome: 'Sprint 3', inicio: '2026-11-02', fim: '2026-11-22' },
];


/* 2. ATALHOS ------------------------------------------------------------- */
const $ = (seletor, contexto = document) => contexto.querySelector(seletor);
const $$ = (seletor, contexto = document) => Array.from(contexto.querySelectorAll(seletor));


/* 3. TEMA CLARO E ESCURO --------------------------------------------------
   O tema escolhido fica salvo no navegador. Se a pessoa nunca escolheu,
   o site segue o tema do celular ou do computador.                        */
function iniciarTema() {
  const raiz = document.documentElement;
  const botao = $('#btn-tema');
  const metaCor = $('meta[name="theme-color"]');
  if (!botao) return;

  const aplicar = (tema) => {
    const escuro = tema === 'dark';
    raiz.setAttribute('data-theme', tema);
    botao.setAttribute('aria-label', escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
    if (metaCor) metaCor.setAttribute('content', escuro ? '#0A1030' : '#F6F7FC');
  };

  aplicar(raiz.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  botao.addEventListener('click', () => {
    const novo = raiz.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    aplicar(novo);
    try { localStorage.setItem('tema', novo); } catch (erro) { /* sem armazenamento: tudo bem */ }
  });

  const sistema = window.matchMedia('(prefers-color-scheme: dark)');
  if (sistema.addEventListener) {
    sistema.addEventListener('change', (evento) => {
      let salvo = null;
      try { salvo = localStorage.getItem('tema'); } catch (erro) { /* ignora */ }
      if (!salvo) aplicar(evento.matches ? 'dark' : 'light');
    });
  }
}


/* 4. MENU NO CELULAR ----------------------------------------------------- */
function iniciarMenu() {
  const cabecalho = $('.site-header');
  const botao = $('#btn-menu');
  const menu = $('#menu');
  if (!cabecalho || !botao || !menu) return;

  const definir = (aberto) => {
    cabecalho.classList.toggle('is-menu-open', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
  };
  const estaAberto = () => cabecalho.classList.contains('is-menu-open');

  botao.addEventListener('click', () => definir(!estaAberto()));
  $$('a', menu).forEach((link) => link.addEventListener('click', () => definir(false)));

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && estaAberto()) {
      definir(false);
      botao.focus();
    }
  });

  const telaGrande = window.matchMedia('(min-width: 900px)');
  if (telaGrande.addEventListener) {
    telaGrande.addEventListener('change', (evento) => { if (evento.matches) definir(false); });
  }
}


/* 5. CABEÇALHO E LINK ATIVO DO MENU ---------------------------------------
   Coloca uma linha embaixo do cabeçalho ao rolar a página e destaca no
   menu a seção que está na tela.                                          */
function iniciarCabecalho() {
  const cabecalho = $('.site-header');
  if (!cabecalho) return;

  const atualizar = () => cabecalho.classList.toggle('is-scrolled', window.scrollY > 8);
  atualizar();
  window.addEventListener('scroll', atualizar, { passive: true });

  if (!('IntersectionObserver' in window)) return;

  const links = $$('.nav__link');
  const ids = ['inicio'].concat(links.map((link) => link.getAttribute('href').slice(1)));
  const secoes = ids.map((id) => document.getElementById(id)).filter(Boolean);

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      links.forEach((link) => {
        if (link.getAttribute('href') === '#' + entrada.target.id) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  secoes.forEach((secao) => observador.observe(secao));
}


/* 6. FOTO -----------------------------------------------------------------
   Se a imagem não carregar (sem internet, link quebrado), mostra as
   iniciais no lugar.                                                      */
function iniciarRetrato() {
  const caixa = $('#retrato');
  const imagem = caixa ? $('.portrait__img', caixa) : null;
  if (!imagem) return;

  const usarPlanoB = () => caixa.classList.add('is-fallback');
  imagem.addEventListener('error', usarPlanoB);
  if (imagem.complete && imagem.naturalWidth === 0) usarPlanoB();
}


/* 7. FILTRO DE PROJETOS ---------------------------------------------------
   Cada projeto tem data-categorias="equipe frontend python" no HTML.
   Os botões usam data-filtro com uma dessas palavras (ou "todos").        */
function iniciarFiltro() {
  const grade = $('#grade-projetos');
  const botoes = $$('.filter__btn');
  const status = $('#filtro-status');
  if (!grade || botoes.length === 0) return;

  const cartoes = $$('.card', grade);
  const categoriasDe = (cartao) => (cartao.dataset.categorias || '').split(/\s+/).filter(Boolean);
  const contar = (filtro) => (filtro === 'todos'
    ? cartoes.length
    : cartoes.filter((cartao) => categoriasDe(cartao).includes(filtro)).length);

  // Mostra a quantidade de projetos dentro de cada botão
  botoes.forEach((botao) => {
    const contador = $('.filter__count', botao);
    if (contador) contador.textContent = contar(botao.dataset.filtro);
  });
  grade.dataset.count = String(cartoes.length);

  botoes.forEach((botao) => {
    botao.addEventListener('click', () => {
      const filtro = botao.dataset.filtro;
      botoes.forEach((outro) => outro.setAttribute('aria-pressed', String(outro === botao)));

      let visiveis = 0;
      cartoes.forEach((cartao) => {
        const mostrar = filtro === 'todos' || categoriasDe(cartao).includes(filtro);
        cartao.hidden = !mostrar;
        cartao.classList.remove('is-entering');
        if (mostrar) {
          visiveis += 1;
          void cartao.offsetWidth; // reinicia a animação de entrada
          cartao.classList.add('is-entering');
        }
      });

      grade.classList.toggle('is-filtered', filtro !== 'todos');
      grade.dataset.count = String(visiveis);
      if (status) status.textContent = visiveis === 1 ? '1 projeto exibido.' : visiveis + ' projetos exibidos.';
    });
  });
}


/* 8. INDICADOR DE SPRINT --------------------------------------------------
   Lê a lista SPRINTS lá em cima, compara com a data de hoje e desenha as
   barras de progresso na seção "Trajetória".                              */
function iniciarSprints() {
  const caixa = $('#tracker');
  if (!caixa || !Array.isArray(SPRINTS) || SPRINTS.length === 0) return;

  const DIA = 24 * 60 * 60 * 1000;
  const paraData = (texto) => {
    const partes = texto.split('-').map(Number);
    return new Date(partes[0], partes[1] - 1, partes[2]);
  };
  const formatar = (data) => data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const sprints = SPRINTS.map((sprint) => {
    const inicio = paraData(sprint.inicio);
    const fim = paraData(sprint.fim);
    const total = Math.round((fim - inicio) / DIA) + 1;
    const dia = Math.round((hoje - inicio) / DIA) + 1;
    const estado = hoje > fim ? 'done' : (hoje >= inicio ? 'current' : 'todo');
    const progresso = estado === 'done' ? 1 : (estado === 'current' ? dia / total : 0);
    return { nome: sprint.nome, inicio, fim, total, dia, estado, progresso };
  });

  const atual = sprints.find((sprint) => sprint.estado === 'current');
  const proxima = sprints.find((sprint) => sprint.estado === 'todo');
  const anterior = sprints.slice().reverse().find((sprint) => sprint.estado === 'done');

  let texto;
  if (atual) {
    texto = atual.nome + ' em andamento: dia ' + atual.dia + ' de ' + atual.total + '.';
  } else if (proxima && anterior) {
    texto = anterior.nome + ' concluída. A ' + proxima.nome + ' começa em ' + formatar(proxima.inicio) + '.';
  } else if (proxima) {
    texto = 'A ' + proxima.nome + ' começa em ' + formatar(proxima.inicio) + '.';
  } else {
    texto = 'Todas as sprints foram concluídas.';
  }

  const barras = document.createElement('div');
  barras.className = 'tracker__bars';

  sprints.forEach((sprint) => {
    const segmento = document.createElement('div');
    segmento.className = 'tracker__seg' + (sprint.estado === 'current' ? ' is-current' : '');

    const barra = document.createElement('span');
    barra.className = 'tracker__bar';
    barra.style.setProperty('--p', Math.round(sprint.progresso * 100) + '%');

    const nome = document.createElement('span');
    nome.className = 'tracker__name';
    nome.textContent = sprint.nome;

    const datas = document.createElement('span');
    datas.className = 'tracker__dates';
    datas.textContent = formatar(sprint.inicio) + ' a ' + formatar(sprint.fim);
    nome.appendChild(datas);

    segmento.append(barra, nome);
    barras.appendChild(segmento);
  });

  const paragrafo = document.createElement('p');
  paragrafo.className = 'tracker__text';
  paragrafo.textContent = texto;

  caixa.replaceChildren(barras, paragrafo);
}


/* 9. COPIAR E-MAIL --------------------------------------------------------
   O e-mail é lido do próprio link (href="mailto:...") na seção Contato.   */
let temporizadorAviso;

function mostrarAviso(mensagem) {
  const aviso = $('#toast');
  if (!aviso) return;
  aviso.textContent = mensagem;
  aviso.classList.add('is-visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove('is-visible'), 2200);
}

function iniciarCopiarEmail() {
  const link = $('#link-email');
  const botao = $('#btn-copiar');
  if (!link || !botao) return;

  botao.addEventListener('click', async () => {
    const email = link.getAttribute('href').replace(/^mailto:/i, '');
    try {
      await navigator.clipboard.writeText(email);
      mostrarAviso('E-mail copiado');
    } catch (erro) {
      // Plano B para navegadores que bloqueiam a área de transferência
      const campo = document.createElement('textarea');
      campo.value = email;
      campo.setAttribute('readonly', '');
      campo.style.position = 'fixed';
      campo.style.opacity = '0';
      document.body.appendChild(campo);
      campo.select();
      let copiou = false;
      try { copiou = document.execCommand('copy'); } catch (erro2) { /* ignora */ }
      document.body.removeChild(campo);
      mostrarAviso(copiou ? 'E-mail copiado' : 'Não foi possível copiar. Copie o e-mail manualmente.');
    }
  });
}


/* 10. ANO DO RODAPÉ ------------------------------------------------------ */
function iniciarAno() {
  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();
}


/* 11. INÍCIO --------------------------------------------------------------
   Liga tudo quando a página abre.                                         */
iniciarTema();
iniciarMenu();
iniciarCabecalho();
iniciarRetrato();
iniciarFiltro();
iniciarSprints();
iniciarCopiarEmail();
iniciarAno();