/* =====================================================================
   VamoAli · protótipo — segue o fluxograma
   Início → Sobre sua viagem → Roteiro → Detalhes → Minhas viagens → Visão geral
   Dados de exemplo (fictícios) para demonstração.
   ===================================================================== */
(() => {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad2 = n => String(n).padStart(2, '0');
  const brl = n => 'R$ ' + Number(n).toLocaleString('pt-BR');
  const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
  const ico = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const MES = ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'];

  const parse = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const dm = d => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
  const dmy = iso => { const d = parse(iso); return `${dm(d)}/${d.getFullYear()}`; };
  const addDias = (iso, i) => { const d = parse(iso); d.setDate(d.getDate() + i); return d; };
  const nDias = (a, b) => Math.max(1, Math.round((parse(b) - parse(a)) / 86400000));
  const duracao = t => t.duracao || nDias(t.inicio, t.fim);
  function periodo(a, b) {
    const A = parse(a), B = parse(b);
    if (A.getFullYear() === B.getFullYear()) {
      if (A.getMonth() === B.getMonth()) return `${pad2(A.getDate())} - ${pad2(B.getDate())} de ${MES[B.getMonth()]} de ${B.getFullYear()}`;
      return `${pad2(A.getDate())} de ${MES[A.getMonth()]} - ${pad2(B.getDate())} de ${MES[B.getMonth()]} de ${B.getFullYear()}`;
    }
    return `${pad2(A.getDate())} de ${MES[A.getMonth()]} de ${A.getFullYear()} - ${pad2(B.getDate())} de ${MES[B.getMonth()]} de ${B.getFullYear()}`;
  }

  /* ---------- Dados ---------- */
  const DESTINOS = [
    { id: 'foz', nome: 'Foz do Iguaçu', uf: 'PR', img: 'img/dest-foz.jpg', capa: 'img/capa-foz.jpg', low: true, temp: 27, alias: ['cataratas', 'iguacu'], dest: ['Cataratas do Iguaçu', 'Marco das Três Fronteiras', 'Parque das Aves'] },
    { id: 'sp', nome: 'São Paulo', uf: 'SP', img: 'img/dest-sp.jpg', low: true, temp: 22, alias: ['sampa', 'paulista', 'sao paulo'], dest: ['Avenida Paulista', 'Parque Ibirapuera', 'Mercado Municipal'] },
    { id: 'salvador', nome: 'Salvador', uf: 'BA', img: 'img/dest-salvador.jpg', low: true, temp: 29, alias: ['bahia', 'pelourinho'], dest: ['Pelourinho', 'Farol da Barra', 'Elevador Lacerda'] },
    { id: 'rio', nome: 'Rio de Janeiro', uf: 'RJ', img: 'img/dest-rio.jpg', capa: 'img/capa-rio.jpg', hero: 'img/hero-rio.jpg', temp: 24, alias: ['rio', 'cristo redentor', 'copacabana', 'pao de acucar'] },
    { id: 'floripa', nome: 'Florianópolis', uf: 'SC', img: 'img/d-floripa.svg', temp: 25, alias: ['floripa', 'ilha da magia'], dest: ['Praia Mole', 'Lagoa da Conceição', 'Campeche'] },
    { id: 'gramado', nome: 'Gramado', uf: 'RS', img: 'img/d-gramado.svg', temp: 16, alias: ['serra gaucha'], dest: ['Rua Coberta', 'Lago Negro', 'Mini Mundo'] },
    { id: 'noronha', nome: 'Fernando de Noronha', uf: 'PE', img: 'img/d-noronha.svg', temp: 28, alias: ['noronha'], dest: ['Baía do Sancho', 'Praia do Leão', 'Morro do Pico'] },
    { id: 'bonito', nome: 'Bonito', uf: 'MS', img: 'img/d-bonito.svg', temp: 26, alias: ['gruta do lago azul'], dest: ['Gruta do Lago Azul', 'Rio Sucuri', 'Buraco das Araras'] },
    { id: 'lencois', nome: 'Lençóis Maranhenses', uf: 'MA', img: 'img/d-lencois.svg', temp: 30, alias: ['lencois', 'maranhao', 'barreirinhas'], dest: ['Lagoa Azul', 'Lagoa Bonita', 'Barreirinhas'] },
  ];
  const destino = id => DESTINOS.find(d => d.id === id);

  const ESTILOS = { praia: 'Praia', cultura: 'Cultura', gastronomia: 'Gastronomia', natureza: 'Natureza', noturno: 'Noturno', outro: 'Outro' };

  const LUGARES = {
    hotel: {
      nome: 'Hotel Copacabana Palace', ativ: 'Check-in no hotel', icon: 'bed', thumb: 'img/t-hotel.jpg', nota: '4,8', aval: '9.812', tag: 'R$ 1.200/noite',
      sobre: 'Hotel histórico à beira-mar, com piscina, spa e vista para a orla de Copacabana. Uma opção clássica para quem quer conforto e localização no coração do Rio.',
      horario: 'Recepção 24 horas · check-in a partir das 14h', endereco: 'Av. Atlântica, 1702 - Copacabana, Rio de Janeiro - RJ',
      valor: 'Diárias a partir de R$ 1.200', dica: 'Reserve com antecedência na alta temporada.', fotos: ['img/t-hotel.jpg'],
    },
    oriente: {
      nome: 'Restaurante Oriente', ativ: 'Almoço', icon: 'utensils', thumb: 'img/t-almoco.jpg', nota: '4,5', aval: '2.304', tag: 'R$ 90/pessoa',
      sobre: 'Restaurante de ambiente aconchegante, com pratos variados e boa carta de bebidas. Ótimo para uma pausa no meio do passeio.',
      horario: 'Todos os dias, das 11h30 às 23h', endereco: 'Av. Atlântica, Copacabana - Rio de Janeiro - RJ',
      valor: 'Média de R$ 90 por pessoa', dica: 'Chegue antes das 12h30 para evitar fila.', fotos: ['img/t-almoco.jpg'],
    },
    copacabana: {
      nome: 'Praia de Copacabana', ativ: 'Praia', icon: 'umbrella', thumb: 'img/t-praia.jpg', hero: 'img/hero-copa.jpg', nota: '4,7', aval: '12.435', tag: 'Gratuito',
      sobre: 'Copacabana é uma das praias mais emblemáticas do Brasil! Tornou-se famosa e hoje é um dos maiores pontos de interesse no Rio de Janeiro. Suas águas esverdeadas e geladas são um refúgio diante do calor que faz na cidade no verão.',
      horario: '24 horas', endereco: 'Av. Atlântica, Copacabana - Rio de Janeiro, RJ',
      valor: 'Gratuito', dica: 'Prefira o início da manhã ou o fim da tarde para fugir do sol forte.', fotos: ['img/hero-copa.jpg', 'img/hl-copacabana.jpg', 'img/t-praia.jpg'],
    },
    arpoador: {
      nome: 'Mirante do Arpoador', ativ: 'Pôr do sol', icon: 'camera', thumb: 'img/t-porsol.jpg', nota: '4,9', aval: '8.120', tag: 'Gratuito',
      sobre: 'Um dos pores do sol mais famosos da cidade. A pedra do Arpoador reúne moradores e turistas para aplaudir o fim do dia.',
      horario: 'Aberto 24 horas', endereco: 'Av. Francisco Bhering - Arpoador, Rio de Janeiro - RJ',
      valor: 'Gratuito', dica: 'Chegue 1 hora antes do pôr do sol para garantir um bom lugar.', fotos: ['img/t-porsol.jpg'],
    },
    marius: {
      nome: 'Restaurante Marius', ativ: 'Jantar', icon: 'utensils', thumb: 'img/t-jantar.jpg', nota: '4,6', aval: '5.718', tag: 'R$ 180/pessoa',
      sobre: 'Casa tradicional, conhecida pelo rodízio e pelo atendimento caprichado. Boa pedida para encerrar o dia com um jantar especial.',
      horario: 'Todos os dias, das 12h à 0h', endereco: 'Av. Atlântica - Leme, Rio de Janeiro - RJ',
      valor: 'Média de R$ 180 por pessoa', dica: 'Faça reserva para jantar nos fins de semana.', fotos: ['img/t-jantar.jpg'],
    },
    cristo: {
      nome: 'Cristo Redentor', ativ: 'Passeio', icon: 'camera', thumb: 'img/hl-cristo.jpg', hero: 'img/hl-cristo.jpg', nota: '4,8', aval: '36.540', tag: 'R$ 98',
      sobre: 'Uma das Sete Maravilhas do Mundo Moderno, no alto do Corcovado. A vista para a Baía de Guanabara e para o Pão de Açúcar é de tirar o fôlego.',
      horario: 'Todos os dias, das 8h às 19h', endereco: 'Parque Nacional da Tijuca - Alto da Boa Vista, Rio de Janeiro - RJ',
      valor: 'Ingressos a partir de R$ 98', dica: 'Vá cedo e escolha um dia de céu limpo.', fotos: ['img/hl-cristo.jpg', 'img/hero-rio.jpg'],
    },
    pao: {
      nome: 'Pão de Açúcar', ativ: 'Passeio', icon: 'camera', thumb: 'img/hl-pao.jpg', hero: 'img/hl-pao.jpg', nota: '4,8', aval: '28.903', tag: 'R$ 160',
      sobre: 'Cartão-postal do Rio, com passeio de bondinho em dois trechos até o topo do morro. A vista da cidade ao entardecer é inesquecível.',
      horario: 'Todos os dias, das 8h às 21h', endereco: 'Av. Pasteur, 520 - Urca, Rio de Janeiro - RJ',
      valor: 'Ingressos a partir de R$ 160', dica: 'Suba perto do fim da tarde para ver o dia virar noite.', fotos: ['img/hl-pao.jpg', 'img/hero-rio.jpg'],
    },
  };
  const AVALIACOES = [
    { n: 'Mariana S.', nota: 5, t: 'Lugar incrível, vale muito a visita. Chegue cedo para aproveitar com calma.' },
    { n: 'Rafael C.', nota: 5, t: 'Experiência ótima do início ao fim. Recomendo para quem viaja em casal ou com amigos.' },
    { n: 'Juliana M.', nota: 4, t: 'Muito bonito, mas costuma ficar cheio nos fins de semana.' },
  ];
  const DESTAQUES_RIO = [
    { nome: 'Copacabana', img: 'img/hl-copacabana.jpg', lugar: 'copacabana' },
    { nome: 'Pão de Açúcar', img: 'img/hl-pao.jpg', lugar: 'pao' },
    { nome: 'Cristo Redentor', img: 'img/hl-cristo.jpg', lugar: 'cristo' },
  ];
  const GASTOS = [
    ['Hospedagem', '#4a7ff7', 1200], ['Alimentação', '#b58cf5', 700], ['Transporte', '#ffde59', 400],
    ['Passeios', '#ef737c', 700], ['Reserva', '#f3b86b', 500],
  ];

  /* ---------- Estado ---------- */
  let uid = 0;
  const item = (hora, lugar, titulo) => ({ id: 'i' + (++uid), hora, lugar, titulo: titulo || LUGARES[lugar].ativ });
  const diasVazios = n => Array.from({ length: Math.min(n, 30) }, () => []);
  const dia1Padrao = () => [item('09:00', 'hotel'), item('11:00', 'oriente'), item('14:00', 'copacabana'), item('17:00', 'arpoador'), item('20:00', 'marius')];
  function novoPlano(d) {
    const n = nDias(d.inicio, d.fim);
    const dias = diasVazios(n);
    if (d.destino === 'rio') dias[0] = dia1Padrao();   // atividades de exemplo só existem para o Rio
    return { id: 't' + Date.now(), destinoId: d.destino, inicio: d.inicio, fim: d.fim, pessoas: d.pessoas, orcamento: d.orcamento, estilos: [...d.estilos], status: 'rascunho', progresso: d.destino === 'rio' ? 40 : 10, salvo: false, origem: 'draft', dias };
  }
  function seedRio() {
    const dias = diasVazios(5);
    dias[0] = dia1Padrao();
    dias[1] = [item('08:30', 'cristo'), item('13:00', 'oriente'), item('16:00', 'pao'), item('20:00', 'marius')];
    dias[2] = [item('10:00', 'copacabana'), item('17:30', 'arpoador')];
    dias[3] = [item('11:00', 'copacabana'), item('19:30', 'marius')];
    dias[4] = [item('08:00', 'hotel', 'Check-out do hotel')];
    return { id: 't-rio', destinoId: 'rio', inicio: '2026-10-10', fim: '2026-10-15', pessoas: 2, orcamento: 3500, estilos: ['praia'], status: 'pronto', progresso: 100, salvo: true, origem: 'saved', dias };
  }
  const novoRascunho = id => ({ destino: id, inicio: '2026-10-10', fim: '2026-10-15', orcamento: 3500, pessoas: 2, estilos: ['praia'] });

  const state = {
    draft: null,          // dados do formulário (Tela 2)
    plan: null,           // viagem aberta/planejada (Telas 3, 4 e 6)
    trips: [
      seedRio(),
      { id: 't-foz', destinoId: 'foz', inicio: '2027-01-05', fim: '2027-01-15', duracao: 6, pessoas: 3, orcamento: 6000, estilos: ['natureza'], status: 'rascunho', progresso: 25, salvo: false, origem: 'saved', dias: diasVazios(6) },
    ],
    tab: 'andamento',     // aba da Tela 5
    day: 0,               // dia aberto na Tela 3
    lugar: 'copacabana',  // lugar aberto na Tela 4
        dtab: 'sobre',        // aba da Tela 4
    fav: {},
    profile: {            // dados da aba Perfil (Tela 7)
      nome: 'Ana Beatriz Rocha',
      bio: 'Apaixonada por novas culturas ✈️',
      email: 'ana.rocha@email.com',
      telefone: '(11) 98888-4433',
      cidade: 'São Paulo, SP',
      idioma: 'pt-BR',
      moeda: 'BRL',
      notifCount: 3,
    },
  };

  /* ---------- Toast ---------- */
  const toastEl = $('#toast'); let toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2300);
  }
  const semMapa = () => toast('O mapa não faz parte desta demonstração.');

  /* ---------- Bottom sheet ---------- */
  const layer = $('#layer'), sheetEl = $('.sheet', layer), sBody = $('#sheet-body'), sFoot = $('#sheet-foot'), sTitle = $('#sheet-title');
  let lastFocus = null, closeT;
  function openSheet({ title, body, foot = '', ready }) {
    clearTimeout(closeT);
    lastFocus = document.activeElement;
    sTitle.textContent = title; sBody.innerHTML = body; sFoot.innerHTML = foot; sFoot.hidden = !foot;
    layer.hidden = false; void layer.offsetWidth; layer.classList.add('is-open');
    sBody.scrollTop = 0;
    if (ready) ready();
    sheetEl.focus({ preventScroll: true });
  }
  function closeSheet() {
    if (layer.hidden) return;
    layer.classList.remove('is-open');
    closeT = setTimeout(() => { layer.hidden = true; sBody.innerHTML = ''; sFoot.innerHTML = ''; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  layer.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  /* ---------- Roteador (telas) ---------- */
  const app = $('#app');
  const screens = $$('.screen');
  const ids = screens.map(s => s.id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = null, busy = false;
  const stack = [];

  const enter = { 'tela-2': renderForm, 'tela-3': renderRoteiro, 'tela-4': renderDetalhe, 'tela-5': renderTrips, 'tela-6': renderOverview, 'tela-7': renderPerfil };

  function show(id, { dir = 1, instant = false } = {}) {
    const next = $('#' + id);
    if (!next || next === current) return;
    if (busy && !instant) return;
    const prev = current;
    if (enter[id]) enter[id]();
    current = next;
    next.classList.add('is-active');
    next.scrollTop = 0;
    app.dataset.status = next.dataset.status || 'dark';
    setNav();
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    if (!prev) return;
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    if (instant || reduce) { prev.classList.remove('is-leaving'); return; }
    busy = true;
    const opt = { duration: 340, easing: 'cubic-bezier(.22,.8,.26,1)', fill: 'both' };
    next.animate([{ transform: `translateX(${dir * 100}%)` }, { transform: 'translateX(0)' }], opt);
    const out = prev.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${dir * -22}%)`, opacity: .6 }], opt);
    const done = () => {
      if (!busy) return;
      prev.classList.remove('is-leaving');
      screens.forEach(s => s.getAnimations().forEach(a => a.cancel()));
      busy = false;
    };
    out.onfinish = done; setTimeout(done, 520);
  }
  const go = id => { if (current) stack.push(current.id); show(id, { dir: 1 }); };
  const back = () => show(stack.pop() || 'tela-1', { dir: -1 });
  function topNav(id) {
    stack.length = 0;
    if (current && id === current.id) { if (enter[id]) enter[id](); setNav(); return; }
    show(id, { dir: ids.indexOf(id) >= ids.indexOf(current.id) ? 1 : -1 });
  }

  /* Barra inferior */
  const NAVICON = { inicio: 'home', roteiros: 'map', salvos: 'heart', perfil: 'user' };
  function setNav() {
    let key = current.dataset.nav;
    if (current.id === 'tela-5' && state.tab === 'salvas') key = 'salvos';
    $$('.nav__i').forEach(b => {
      const on = b.dataset.nav === key;
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      $('use', b).setAttribute('href', `#i-${NAVICON[b.dataset.nav]}${on ? '-fill' : ''}`);
    });
  }
    $('#nav').addEventListener('click', e => {
    const b = e.target.closest('.nav__i'); if (!b) return;
    const k = b.dataset.nav;
    if (k === 'inicio') topNav('tela-1');
    else if (k === 'roteiros') { state.tab = 'andamento'; topNav('tela-5'); }
    else if (k === 'salvos') { state.tab = 'salvas'; topNav('tela-5'); }
    else if (k === 'perfil') topNav('tela-7');
  });
  document.addEventListener('click', e => { if (e.target.closest('[data-back]')) back(); });

  /* =====================================================================
     TELA 1 · INÍCIO — destinos em alta ou barra de pesquisa
     ===================================================================== */
  const q = $('#q'), qMsg = $('#q-msg'), suggest = $('#suggest');

  $('#destinos').innerHTML = DESTINOS.map(d =>
    `<button class="dest" data-id="${d.id}"><img src="${d.img}" alt="" width="100" height="160" loading="lazy"><span>${esc(d.nome)}</span></button>`).join('');
  $('#destinos').addEventListener('click', e => { const b = e.target.closest('.dest'); if (b) escolher(destino(b.dataset.id)); });

  function buscar(texto) {
    const n = norm(texto); if (!n) return [];
    const hit = d => [d.nome, d.uf, ...d.alias].some(t => norm(t).includes(n));
    return DESTINOS.filter(hit).sort((a, b) => (norm(a.nome).startsWith(n) ? 0 : 1) - (norm(b.nome).startsWith(n) ? 0 : 1));
  }
  function msgBusca(t) { qMsg.textContent = t; qMsg.hidden = !t; q.classList.toggle('is-error', !!t); }
  function limparBusca() { msgBusca(''); suggest.hidden = true; suggest.innerHTML = ''; }

  q.addEventListener('input', () => {
    const v = q.value.trim(); limparBusca();
    if (!v) return;
    const r = buscar(v);
    if (!r.length) { msgBusca('Destino não encontrado. Confira o nome ou escolha um dos destinos em alta.'); return; }
    suggest.innerHTML = r.slice(0, 4).map(d => `<li><button role="option" data-id="${d.id}">${ico('pin')}${esc(d.nome)}<small>${d.uf}</small></button></li>`).join('');
    suggest.hidden = false;
  });
  suggest.addEventListener('click', e => { const b = e.target.closest('button'); if (b) escolher(destino(b.dataset.id)); });
  function pesquisar() {
    const v = q.value.trim();
    if (!v) { msgBusca('Digite um destino para começar.'); q.focus(); return; }
    const r = buscar(v);
    if (!r.length) { msgBusca('Destino não encontrado. Confira o nome ou escolha um dos destinos em alta.'); return; }
    escolher(r[0]);
  }
  $('#btn-start').addEventListener('click', pesquisar);
  q.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); pesquisar(); } });

  function escolher(d) {
    state.draft = novoRascunho(d.id);
    q.value = ''; limparBusca(); closeSheet();
    go('tela-2');
  }
  $('#btn-all').addEventListener('click', () => openSheet({
    title: 'Destinos mais procurados',
    body: `<ul class="plist">${DESTINOS.map(d => `<li><button class="popt" data-id="${d.id}">${ico('pin')}<span>${esc(d.nome)}<small>${d.uf}</small></span>${ico('next', 'popt__ok')}</button></li>`).join('')}</ul>`,
    ready() { $$('.popt', sBody).forEach(b => { $('.popt__ok', b).style.opacity = .5; b.onclick = () => escolher(destino(b.dataset.id)); }); },
  }));

  /* Carrosséis: arrastar com o mouse (no celular o toque já rola) */
  function dragScroll(el) {
    let down = false, sx = 0, sl = 0, moved = false;
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; el.classList.add('is-drag'); }
      if (moved) el.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => el.classList.remove('is-drag'), 0); });
    el.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }
  $$('.carousel').forEach(dragScroll);

  /* =====================================================================
     TELA 2 · SOBRE SUA VIAGEM — informar dados, validar, confirmar
     ===================================================================== */
  const setVal = (id, txt) => { const el = $('#' + id); el.textContent = txt || 'Selecione'; el.classList.toggle('is-empty', !txt); };
  function renderForm() {
    if (!state.draft) state.draft = novoRascunho('rio');
    const d = state.draft;
    setVal('v-destino', d.destino && destino(d.destino).nome);
    setVal('v-quando', d.inicio && d.fim && `${dmy(d.inicio)} - ${dmy(d.fim)}`);
    setVal('v-orcamento', d.orcamento && `Até ${brl(d.orcamento)}`);
    setVal('v-pessoas', d.pessoas && plural(d.pessoas, 'pessoa', 'pessoas'));
    $$('.chip').forEach(c => c.setAttribute('aria-pressed', d.estilos.includes(c.dataset.estilo)));
  }
  function limparErros() {
    $$('.row.is-error').forEach(r => r.classList.remove('is-error'));
    $('#chips').classList.remove('is-error');
    $('#form-msg').hidden = true;
  }
  $('#chips').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    const k = c.dataset.estilo, a = state.draft.estilos;
    state.draft.estilos = a.includes(k) ? a.filter(x => x !== k) : [...a, k];
    limparErros(); renderForm();
  });
  $('.rows').addEventListener('click', e => { const r = e.target.closest('.row'); if (r) openCampo(r.dataset.field); });

  function openCampo(campo) {
    const d = state.draft;
    const aplicar = () => { limparErros(); renderForm(); closeSheet(); };
    if (campo === 'destino') {
      openSheet({
        title: 'Para onde?',
        body: `<ul class="plist">${DESTINOS.map(x => `<li><button class="popt${x.id === d.destino ? ' is-on' : ''}" data-id="${x.id}">${ico('pin')}<span>${esc(x.nome)}<small>${x.uf}</small></span>${ico('check', 'popt__ok')}</button></li>`).join('')}</ul>`,
        ready() { $$('.popt', sBody).forEach(b => b.onclick = () => { d.destino = b.dataset.id; aplicar(); }); },
      });
    } else if (campo === 'quando') {
      openSheet({
        title: 'Quando?',
        body: `<label class="flabel"><span>Ida</span><input type="date" id="f-ini" value="${d.inicio || ''}"></label>
               <label class="flabel"><span>Volta</span><input type="date" id="f-fim" value="${d.fim || ''}"></label>
               <p class="msg" id="f-err" hidden></p>`,
        foot: '<button class="btn" id="sheet-ok">Salvar datas</button>',
        ready() {
          const ini = $('#f-ini'), fim = $('#f-fim'), err = $('#f-err');
          ini.addEventListener('change', () => { if (ini.value) fim.min = ini.value; });
          $('#sheet-ok').onclick = () => {
            if (ini.value && fim.value && fim.value < ini.value) { err.textContent = 'A data de volta precisa ser depois da ida.'; err.hidden = false; return; }
            d.inicio = ini.value || null; d.fim = fim.value || null; aplicar();
          };
        },
      });
    } else if (campo === 'orcamento') {
      const PRE = [1500, 2500, 3500, 5000, 8000];
      openSheet({
        title: 'Orçamento?',
        body: `<p class="fl">Valores sugeridos</p>
               <div class="presets">${PRE.map(v => `<button class="dchip${v === d.orcamento ? ' is-on' : ''}" data-v="${v}">${brl(v)}</button>`).join('')}</div>
               <label class="flabel"><span>Ou digite o valor máximo (R$)</span><input type="number" id="f-orc" inputmode="numeric" min="0" step="100" value="${d.orcamento || ''}" placeholder="Ex.: 3500"></label>`,
        foot: '<button class="btn" id="sheet-ok">Salvar orçamento</button>',
        ready() {
          const inp = $('#f-orc');
          $$('.dchip', sBody).forEach(b => b.onclick = () => { inp.value = b.dataset.v; $$('.dchip', sBody).forEach(x => x.classList.toggle('is-on', x === b)); });
          inp.addEventListener('input', () => $$('.dchip', sBody).forEach(x => x.classList.toggle('is-on', x.dataset.v === inp.value)));
          $('#sheet-ok').onclick = () => { const v = Math.round(Number(inp.value)); d.orcamento = v > 0 ? v : null; aplicar(); };
        },
      });
    } else if (campo === 'pessoas') {
      let n = d.pessoas || 1;
      openSheet({
        title: 'Quantas pessoas?',
        body: `<div class="stepper"><button id="p-minus" aria-label="Menos uma pessoa"><svg><use href="#i-minus"/></svg></button><output id="p-n" aria-live="polite"></output><button id="p-plus" aria-label="Mais uma pessoa"><svg><use href="#i-plus"/></svg></button></div>`,
        foot: '<button class="btn" id="sheet-ok">Salvar</button>',
        ready() {
          const out = $('#p-n'), paint = () => { out.innerHTML = `<b>${n}</b>${n === 1 ? 'pessoa' : 'pessoas'}`; };
          paint();
          $('#p-minus').onclick = () => { n = Math.max(1, n - 1); paint(); };
          $('#p-plus').onclick = () => { n = Math.min(12, n + 1); paint(); };
          $('#sheet-ok').onclick = () => { d.pessoas = n; aplicar(); };
        },
      });
    }
  }

  /* Validação: "Informações preenchidas?" */
  function faltando(d) {
    const f = [];
    if (!d.destino) f.push('destino');
    if (!d.inicio || !d.fim) f.push('quando');
    if (!d.orcamento) f.push('orcamento');
    if (!d.pessoas) f.push('pessoas');
    if (!d.estilos.length) f.push('estilo');
    return f;
  }
  $('#btn-show').addEventListener('click', () => {
    const d = state.draft, f = faltando(d);
    limparErros();
    if (f.length) {
      const nomes = { destino: 'Para onde?', quando: 'Quando?', orcamento: 'Orçamento?', pessoas: 'Quantas pessoas?', estilo: 'Estilo da viagem' };
      f.forEach(k => { if (k === 'estilo') $('#chips').classList.add('is-error'); else $(`.row[data-field="${k}"]`).classList.add('is-error'); });
      const m = $('#form-msg');
      m.textContent = `Preencha para continuar: ${f.map(k => nomes[k]).join(', ')}.`; m.hidden = false;
      m.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    confirmarDados(d);
  });

  /* "Confirmar dados da viagem" */
  function confirmarDados(d) {
    const dest = destino(d.destino), n = nDias(d.inicio, d.fim);
    openSheet({
      title: 'Confirmar dados da viagem',
      body: `<dl class="sum">
        <div><dt>Destino</dt><dd>${esc(dest.nome)}</dd></div>
        <div><dt>Quando</dt><dd>${dmy(d.inicio)} a ${dmy(d.fim)}<br>(${plural(n, 'dia', 'dias')})</dd></div>
        <div><dt>Orçamento</dt><dd>Até ${brl(d.orcamento)}</dd></div>
        <div><dt>Pessoas</dt><dd>${plural(d.pessoas, 'pessoa', 'pessoas')}</dd></div>
        <div><dt>Estilo</dt><dd>${d.estilos.map(k => ESTILOS[k]).join(', ')}</dd></div></dl>`,
      foot: '<button class="btn" id="sheet-ok">Confirmar e ver roteiro</button><button class="btn btn--ghost" data-close>Editar dados</button>',
      ready() {
        $('#sheet-ok').onclick = () => {
          const p = state.plan;
          if (p && p.origem === 'draft' && p.destinoId === d.destino && p.inicio === d.inicio && p.fim === d.fim) {
            Object.assign(p, { pessoas: d.pessoas, orcamento: d.orcamento, estilos: [...d.estilos] });   // mantém as atividades já adicionadas
          } else { state.plan = novoPlano(d); state.day = 0; }
          closeSheet(); go('tela-3');
        };
      },
    });
  }

  /* =====================================================================
     TELA 3 · ROTEIRO — atividades por dia e horário, adicionar, salvar
     ===================================================================== */
  function renderRoteiro() {
    const p = state.plan; if (!p) return;
    if (state.day >= p.dias.length) state.day = 0;
    $('#days').innerHTML = p.dias.map((_, i) =>
      `<button class="day${i === state.day ? ' is-on' : ''}" role="tab" aria-selected="${i === state.day}" data-i="${i}"><b>Dia ${i + 1}</b><small>${dm(addDias(p.inicio, i))}</small></button>`).join('');
    renderTimeline();
  }
  function renderTimeline(novoId) {
    const p = state.plan;
    const itens = [...p.dias[state.day]].sort((a, b) => a.hora.localeCompare(b.hora));
    const tl = $('#timeline');
    if (!itens.length) {
      tl.innerHTML = `<li class="empty-day" style="display:block"><b>Nenhuma atividade neste dia</b>Toque em + para adicionar a primeira.</li>`;
      return;
    }
    tl.innerHTML = itens.map(it => {
      const l = LUGARES[it.lugar];
      return `<li${it.id === novoId ? ' class="is-new"' : ''}><time datetime="${it.hora}">${it.hora}</time>
        <button class="act" data-lugar="${it.lugar}">${ico(l.icon, 'act__ico')}<span class="act__txt"><b>${esc(it.titulo)}</b><small>${esc(l.nome)}</small></span><img src="${l.thumb}" alt="" width="54" height="54"></button></li>`;
    }).join('');
  }
  $('#days').addEventListener('click', e => {
    const b = e.target.closest('.day'); if (!b) return;
    state.day = Number(b.dataset.i);
    $$('.day').forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
    renderTimeline();
  });
  $('#timeline').addEventListener('click', e => {      // "Selecionar atividade ou local?" → Tela 4
    const a = e.target.closest('.act'); if (a) abrirLugar(a.dataset.lugar);
  });
  $('#btn-map-day').addEventListener('click', semMapa);

  /* "Adicionar atividade ao roteiro?" → escolher dia e horário */
  $('#btn-add').addEventListener('click', () => {
    const p = state.plan; let lugar = null, dia = state.day;
    openSheet({
      title: 'Adicionar atividade',
      body: `<p class="fl">Atividade</p>
        <ul class="plist" id="a-list">${Object.entries(LUGARES).map(([k, l]) =>
          `<li><button class="popt" data-k="${k}">${ico(l.icon)}<span>${esc(l.nome)}<small>${esc(l.ativ)}</small></span>${ico('check', 'popt__ok')}</button></li>`).join('')}</ul>
        <p class="fl">Dia</p>
        <div class="dchips" id="a-dias">${p.dias.map((_, i) => `<button class="dchip${i === dia ? ' is-on' : ''}" data-i="${i}">Dia ${i + 1}<small>${dm(addDias(p.inicio, i))}</small></button>`).join('')}</div>
        <p class="fl">Horário</p>
        <label class="flabel"><input type="time" id="a-hora" value="10:00" aria-label="Horário"></label>
        <p class="msg" id="a-err" hidden></p>`,
      foot: '<button class="btn" id="sheet-ok">Adicionar ao roteiro</button>',
      ready() {
        const err = $('#a-err');
        $$('#a-list .popt').forEach(b => b.onclick = () => {
          lugar = b.dataset.k; err.hidden = true;
          $$('#a-list .popt').forEach(x => x.classList.toggle('is-on', x === b));
        });
        $$('#a-dias .dchip').forEach(b => b.onclick = () => { dia = Number(b.dataset.i); $$('#a-dias .dchip').forEach(x => x.classList.toggle('is-on', x === b)); });
        $('#sheet-ok').onclick = () => {
          const hora = $('#a-hora').value;
          if (!lugar) { err.textContent = 'Escolha uma atividade.'; err.hidden = false; return; }
          if (!hora) { err.textContent = 'Informe o horário.'; err.hidden = false; return; }
          const it = item(hora, lugar);
          p.dias[dia].push(it); state.day = dia;
          closeSheet(); renderRoteiro(); renderTimeline(it.id);
          $$('.day')[dia]?.scrollIntoView({ inline: 'center', block: 'nearest' });
          toast(`Adicionado ao Dia ${dia + 1}, às ${hora}`);
        };
      },
    });
  });

  /* "Planejamento concluído?" → Salvar viagem */
  $('#btn-save').addEventListener('click', () => {
    const p = state.plan;
    Object.assign(p, { status: 'pronto', progresso: 100, salvo: true, origem: 'saved' });
    state.trips = state.trips.filter(t => t === p || t.destinoId !== p.destinoId);
    if (!state.trips.includes(p)) state.trips.unshift(p);
    state.tab = 'andamento';
    toast('Viagem salva!');
    stack.length = 0; stack.push('tela-1');
    show('tela-5', { dir: 1 });
  });

  /* =====================================================================
     TELA 4 · DETALHES DA ATIVIDADE — sobre, informações, avaliações, fotos
     ===================================================================== */
  function abrirLugar(k) { state.lugar = k; state.dtab = 'sobre'; go('tela-4'); }

  function renderDetalhe() {
    const l = LUGARES[state.lugar]; state.dtab = 'sobre';
    $('#d-title').textContent = l.nome;
    $('#d-nota').textContent = l.nota;
    $('#d-aval').textContent = `(${l.aval} avaliações)`;
    $('#d-tag').textContent = l.tag;
    const wrap = $('#d-hero'), img = $('#d-img'), th = $('#d-thumb');
    wrap.classList.toggle('is-thumb', !l.hero);
    img.src = l.hero || l.thumb; img.alt = l.hero ? l.nome : '';
    th.src = l.thumb; th.alt = l.nome;
    const f = !!state.fav[state.lugar], fav = $('#fav');
    fav.classList.toggle('is-on', f); fav.setAttribute('aria-pressed', f);
    $('use', fav).setAttribute('href', f ? '#i-heart-fill' : '#i-heart');
    $$('#d-tabs .tab').forEach(t => { const on = t.dataset.tab === 'sobre'; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
    renderPanel();
  }
  const estrelas = n => Array.from({ length: 5 }, (_, i) => `<svg style="opacity:${i < n ? 1 : .25}" aria-hidden="true"><use href="#i-star"/></svg>`).join('');
  function renderPanel() {
    const l = LUGARES[state.lugar], p = $('#d-panel');
    if (state.dtab === 'sobre') {
      p.innerHTML = `<p class="about">${esc(l.sobre)}</p>
        <div class="info"><span class="info__ico">${ico('clock')}</span><span><b>Horário de Funcionamento</b><small>${esc(l.horario)}</small></span></div>
        <div class="info"><span class="info__ico">${ico('pin', 'fill')}</span><span><b>Localização</b><small>${esc(l.endereco)}</small></span></div>`;
    } else if (state.dtab === 'info') {
      p.innerHTML = `<div class="facts">
        <div class="fact">${ico('clock')}<div><b>Horário</b><span>${esc(l.horario)}</span></div></div>
        <div class="fact">${ico('pin', 'fill')}<div><b>Endereço</b><span>${esc(l.endereco)}</span></div></div>
        <div class="fact">${ico('dollar', 'fill')}<div><b>Valores</b><span>${esc(l.valor)}</span></div></div>
        <div class="fact">${ico('info')}<div><b>Dica</b><span>${esc(l.dica)}</span></div></div></div>`;
    } else if (state.dtab === 'aval') {
      p.innerHTML = `<div class="score"><span class="score__n">${l.nota}</span><div><span class="score__s">${estrelas(5)}</span><small>${l.aval} avaliações</small></div></div>
        ${AVALIACOES.map(r => `<div class="rev"><div class="rev__h"><b>${r.n}</b><span>${estrelas(r.nota)}</span></div><p>${esc(r.t)}</p></div>`).join('')}`;
    } else {
      p.innerHTML = `<div class="photos">${l.fotos.map(f => `<img src="${f}" alt="Foto de ${esc(l.nome)}" loading="lazy">`).join('')}</div>`;
    }
  }
  $('#d-tabs').addEventListener('click', e => {
    const t = e.target.closest('.tab'); if (!t) return;
    state.dtab = t.dataset.tab;
    $$('#d-tabs .tab').forEach(x => { const on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
    renderPanel();
  });
  $('#fav').addEventListener('click', () => {
    const f = state.fav[state.lugar] = !state.fav[state.lugar], fav = $('#fav');
    fav.classList.toggle('is-on', f); fav.setAttribute('aria-pressed', f);
    $('use', fav).setAttribute('href', f ? '#i-heart-fill' : '#i-heart');
    toast(f ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  });
  $('#btn-d-map').addEventListener('click', semMapa);

  /* =====================================================================
     TELA 5 · MINHAS VIAGENS — abas Em andamento / Salvas
     ===================================================================== */
  function renderTrips() {
    $$('#seg .seg__b').forEach(b => { const on = b.dataset.tab === state.tab; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    const lista = state.trips.filter(t => state.tab === 'salvas' ? t.salvo : true);
    const box = $('#trips');
    if (!lista.length) {
      box.innerHTML = `<div class="empty"><b>Nada por aqui ainda</b>${state.tab === 'salvas' ? 'Salve uma viagem para vê-la nesta aba.' : 'Comece um novo plano pela tela inicial.'}</div>`;
      return;
    }
    box.innerHTML = lista.map(t => {
      const d = destino(t.destinoId);
      return `<article class="trip" tabindex="0" role="button" data-id="${t.id}" aria-label="Abrir viagem ${esc(d.nome)}">
        <img src="${d.capa || d.img}" alt="" width="318" height="92">
        ${state.tab === 'salvas' ? `<span class="trip__fav" aria-label="Salva">${ico('heart-fill')}</span>` : ''}
        <div class="trip__body">
          <h3>${esc(d.nome)}</h3>
          <p class="trip__date">${periodo(t.inicio, t.fim)}</p>
          <div class="trip__meta">
            <span>${ico('calendar')}${plural(duracao(t), 'dia', 'dias')}</span>
            <span>${ico('people')}${plural(t.pessoas, 'pessoa', 'pessoas')}</span>
            <span class="money">${ico('dollar')}${brl(t.orcamento)}</span>
          </div>
          <div class="bar-prog"><i style="width:${t.progresso}%"></i></div>
          <small class="trip__st">${t.status === 'pronto' ? 'Roteiro pronto' : 'Rascunho'}</small>
        </div></article>`;
    }).join('');
  }
  $('#seg').addEventListener('click', e => {           // "Selecionar uma aba"
    const b = e.target.closest('.seg__b'); if (!b) return;
    state.tab = b.dataset.tab; renderTrips(); setNav();
  });
  function abrirViagem(id) {                           // "Selecionar viagem? Sim" → Tela 6
    const t = state.trips.find(x => x.id === id); if (!t) return;
    state.plan = t; state.day = 0; go('tela-6');
  }
  $('#trips').addEventListener('click', e => { const a = e.target.closest('.trip'); if (a) abrirViagem(a.dataset.id); });
  $('#trips').addEventListener('keydown', e => {
    const a = e.target.closest('.trip');
    if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrirViagem(a.dataset.id); }
  });
  $('#btn-trips-map').addEventListener('click', semMapa);

  /* =====================================================================
     TELA 6 · VISÃO GERAL — foto, temperatura, duração, orçamento, gastos, destaques
     ===================================================================== */
  function renderOverview() {
    const p = state.plan; if (!p) return;
    const d = destino(p.destinoId), n = duracao(p);
    const img = $('#o-img'); img.src = d.hero || d.img; img.alt = d.nome; img.classList.toggle('is-low', !d.hero && !!d.low);
    $('#o-dest').textContent = d.nome;
    $('#o-temp').textContent = `${d.temp}°C`;
    $('#o-dias').textContent = plural(n, 'dia', 'dias');
    $('#o-pessoas').textContent = plural(p.pessoas, 'pessoa', 'pessoas');
    $('#o-orc').textContent = brl(p.orcamento);
    $('#o-total').textContent = brl(p.orcamento);

    // Estimativa de gastos: proporções do wireframe aplicadas ao orçamento
    const base = GASTOS.reduce((s, g) => s + g[2], 0);
    const vals = GASTOS.map(g => Math.round(p.orcamento * g[2] / base / 10) * 10);
    vals[vals.length - 1] = Math.max(0, p.orcamento - vals.slice(0, -1).reduce((a, b) => a + b, 0));
    let acc = 0;
    $('#o-donut').innerHTML = `<g transform="rotate(-90 60 60)" fill="none" stroke-width="20">${GASTOS.map((g, i) => {
      const pct = p.orcamento ? vals[i] / p.orcamento * 100 : 0, c = `<circle cx="60" cy="60" r="44" pathLength="100" stroke="${g[1]}" stroke-dasharray="${pct.toFixed(2)} ${(100 - pct).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}"/>`;
      acc += pct; return c;
    }).join('')}</g>`;
    $('#o-legend').innerHTML = GASTOS.map((g, i) => `<li><i style="background:${g[1]}"></i>${g[0]}<b>${brl(vals[i])}</b></li>`).join('');

    // Destaques
    const hl = $('#o-hl');
    if (d.id === 'rio') {
      hl.innerHTML = DESTAQUES_RIO.map(h => `<button class="hl" data-lugar="${h.lugar}"><span class="hl__img"><img src="${h.img}" alt="" width="118" height="156"></span><span>${h.nome}</span></button>`).join('');
    } else {
      hl.innerHTML = d.dest.map((nome, i) => `<div class="hl hl--v${i + 1}"><span class="hl__img"><img src="${d.img}" alt="" width="118" height="156"></span><span>${esc(nome)}</span></div>`).join('');
    }
    $$('#o-tabs .tab').forEach(t => { const on = t.dataset.act === 'resumo'; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
  }
  $('#o-hl').addEventListener('click', e => { const b = e.target.closest('button.hl'); if (b) abrirLugar(b.dataset.lugar); });
  $('#o-tabs').addEventListener('click', e => {
    const t = e.target.closest('.tab'); if (!t) return;
    const a = t.dataset.act;
    if (a === 'roteiro') { go('tela-3'); return; }
    if (a === 'mapa') { semMapa(); return; }
    $$('#o-tabs .tab').forEach(x => { const on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
    if (a === 'destaques') $('#o-hl-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
    else $('#tela-6').scrollTo({ top: 0, behavior: 'smooth' });
  });
  $$('.carousel').forEach(dragScroll);

    /* =====================================================================
     TELA 7 · PERFIL — dados da conta, viagens, favoritos, preferências
     ===================================================================== */
  const IDIOMAS = [['pt-BR', 'Português (Brasil)'], ['en-US', 'English'], ['es-ES', 'Español']];
  const MOEDAS = [['BRL', 'Real (R$)'], ['USD', 'Dólar (US$)'], ['EUR', 'Euro (€)']];

  const iniciais = nome => nome.trim().split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join('');

  function renderPerfil() {
    const p = state.profile;
    $('#p-avatar').textContent = iniciais(p.nome);
    $('#p-nome').textContent = p.nome;
    $('#p-bio').textContent = p.bio;
    const favCount = Object.values(state.fav).filter(Boolean).length;
    $('#p-viagens').textContent = state.trips.length;
    $('#p-destinos').textContent = new Set(state.trips.map(t => t.destinoId)).size;
    $('#p-favoritos').textContent = favCount;
    $('#p-badge-viagens').textContent = state.trips.length;
    $('#p-badge-favoritos').textContent = favCount;
    const nb = $('#p-badge-notif'); nb.textContent = p.notifCount; nb.hidden = !p.notifCount;
  }

  $('#p-edit-photo').addEventListener('click', () => toast('Escolha de foto não faz parte desta demonstração.'));
  $$('.prow[data-go-tab]').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.goTab; topNav('tela-5'); }));

  $('#p-dados').addEventListener('click', () => {
    const p = state.profile;
    openSheet({
      title: 'Meus dados',
      body: `<label class="flabel"><span>Nome</span><input id="f-nome" value="${esc(p.nome)}"></label>
        <label class="flabel"><span>E-mail</span><input id="f-email" type="email" value="${esc(p.email)}"></label>
        <label class="flabel"><span>Telefone</span><input id="f-tel" type="tel" value="${esc(p.telefone)}"></label>
        <label class="flabel"><span>Cidade</span><input id="f-cidade" value="${esc(p.cidade)}"></label>`,
      foot: '<button class="btn" id="sheet-ok">Salvar alterações</button>',
      ready() {
        $('#sheet-ok').onclick = () => {
          p.nome = $('#f-nome').value.trim() || p.nome;
          p.email = $('#f-email').value.trim();
          p.telefone = $('#f-tel').value.trim();
          p.cidade = $('#f-cidade').value.trim();
          renderPerfil(); closeSheet(); toast('Dados atualizados!');
        };
      },
    });
  });

  $('#p-notif').addEventListener('click', () => {
    openSheet({
      title: 'Notificações',
      body: `<ul class="plist">
        <li><button class="popt">${ico('map')}<span>Seu roteiro para o Rio de Janeiro está pronto!<small>há 2 dias</small></span></button></li>
        <li><button class="popt">${ico('dollar')}<span>Orçamento de Foz do Iguaçu foi atualizado<small>há 4 dias</small></span></button></li>
        <li><button class="popt">${ico('heart')}<span>Novo destaque salvo em Favoritos<small>há 1 semana</small></span></button></li>
      </ul>`,
    });
    state.profile.notifCount = 0; renderPerfil();
  });

  $('#p-prefs').addEventListener('click', () => {
    const p = state.profile;
    openSheet({
      title: 'Preferências',
      body: `<p class="fl">Idioma</p><div class="dchips" id="f-idioma">${IDIOMAS.map(([k, l]) => `<button class="dchip${k === p.idioma ? ' is-on' : ''}" data-k="${k}">${l}</button>`).join('')}</div>
        <p class="fl">Moeda</p><div class="dchips" id="f-moeda">${MOEDAS.map(([k, l]) => `<button class="dchip${k === p.moeda ? ' is-on' : ''}" data-k="${k}">${l}</button>`).join('')}</div>`,
      foot: '<button class="btn" id="sheet-ok">Salvar preferências</button>',
      ready() {
        $$('#f-idioma .dchip').forEach(b => b.onclick = () => { p.idioma = b.dataset.k; $$('#f-idioma .dchip').forEach(x => x.classList.toggle('is-on', x === b)); });
        $$('#f-moeda .dchip').forEach(b => b.onclick = () => { p.moeda = b.dataset.k; $$('#f-moeda .dchip').forEach(x => x.classList.toggle('is-on', x === b)); });
        $('#sheet-ok').onclick = () => { closeSheet(); toast('Preferências salvas!'); };
      },
    });
  });

  $('#p-help').addEventListener('click', () => {
    openSheet({
      title: 'Ajuda e suporte',
      body: `<div class="facts">
        <div class="fact">${ico('info')}<div><b>Central de ajuda</b><span>Tire dúvidas sobre roteiros, pagamentos e sua conta.</span></div></div>
        <div class="fact">${ico('pin', 'fill')}<div><b>Fale conosco</b><span>suporte@vamoali.com.br</span></div></div>
      </div>`,
      foot: '<button class="btn btn--ghost" data-close>Fechar</button>',
    });
  });

  $('#p-about').addEventListener('click', () => {
    openSheet({
      title: 'Sobre o VamoAli',
      body: `<div style="text-align:center;padding:4px 0 8px">
          <img src="img/logo.png" alt="VamoAli" style="width:160px;margin:0 auto 10px">
          <p style="color:#666;font-size:14px">Versão 1.0.0 (protótipo)</p>
        </div>
        <p class="about">O VamoAli ajuda você a planejar roteiros de viagem completos, do primeiro destino ao último passeio — de um jeito criativo e sem complicação.</p>`,
      foot: '<button class="btn btn--ghost" data-close>Fechar</button>',
    });
  });

  $('#p-logout').addEventListener('click', () => {
    openSheet({
      title: 'Sair da conta',
      body: '<p class="lead" style="margin-top:0">Tem certeza que deseja sair? Você precisará entrar novamente para ver suas viagens.</p>',
      foot: '<button class="btn" style="background:#c8372d" id="sheet-ok">Sair</button><button class="btn btn--ghost" data-close>Cancelar</button>',
      ready() {
        $('#sheet-ok').onclick = () => { closeSheet(); toast('Você saiu. (login não faz parte desta demonstração)'); topNav('tela-1'); };
      },
    });
  });

  /* =====================================================================
     Início: abre pela tela do endereço (#tela-N) para facilitar a gravação
     ===================================================================== */
  function prepararEstado(id) {
    if (id === 'tela-2' && !state.draft) state.draft = novoRascunho('rio');
    if (['tela-3', 'tela-4', 'tela-6'].includes(id)) { state.plan = state.trips[0]; state.day = 0; }
    if (id !== 'tela-1') stack.push('tela-1');
  }
  const start = ids.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'tela-1';
  prepararEstado(start);
  show(start, { instant: true });
  addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (ids.includes(id) && (!current || id !== current.id)) { prepararEstado(id); show(id, { instant: true }); }
  });
})();
