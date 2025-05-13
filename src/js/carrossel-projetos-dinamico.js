/**
 * carrossel-projetos-dinamico.js
 * Sistema de carrossel responsivo para exibição de projetos em destaque da página inicial
 * Integrado com o sistema de modais de projetos
 */

class ProjetosCarrossel {
    constructor() {
        this.container = null;
        this.projetosDestaque = [];
        this.projetosContainer = null;
        this.dotsContainer = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.currentIndex = 0;
        this.slidesPerView = 3;
        this.autoplayInterval = null;
        this.carregando = true;
        this.maxProjetos = 6;
    }

    /**
     * Inicializa o carrossel
     */
    inicializar() {
        console.log('ProjetosCarrossel: Inicializando carrossel');
        
        // Buscar o container do carrossel
        this.container = document.querySelector('.projects-carousel');
        
        if (!this.container) {
            console.warn('ProjetosCarrossel: Container do carrossel não encontrado');
            return;
        }
        
        // Buscar elementos internos
        this.projetosContainer = this.container.querySelector('.carousel-inner');
        this.dotsContainer = this.container.querySelector('.carousel-dots');
        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        
        if (!this.projetosContainer) {
            console.warn('ProjetosCarrossel: Container de projetos não encontrado');
            return;
        }
        
        // Mostrar indicador de carregamento
        this.mostrarCarregando(true);
        
        // Verificar se o gerenciador de modais existe
        if (typeof modaisGerenciador !== 'undefined') {
            console.log('ProjetosCarrossel: Gerenciador de modais encontrado');
            
            // Se os dados já estiverem carregados
            if (modaisGerenciador.projetosData && modaisGerenciador.projetosData.length > 0) {
                console.log('ProjetosCarrossel: Dados já carregados no gerenciador de modais');
                this.carregarProjetoDestaque();
            } else {
                // Escutar pelo evento de dados carregados
                document.addEventListener('projetosDadosCarregados', () => {
                    console.log('ProjetosCarrossel: Evento de dados carregados recebido');
                    this.carregarProjetoDestaque();
                }, { once: true });
                
                // Iniciar carregamento
                if (typeof modaisGerenciador.inicializar === 'function') {
                    modaisGerenciador.inicializar();
                }
            }
        } else {
            console.warn('ProjetosCarrossel: Gerenciador de modais não encontrado, carregando dados localmente');
            this.carregarDadosLocalmente();
        }
    }

    /**
     * Carrega dados localmente quando o gerenciador de modais não está disponível
     */
    async carregarDadosLocalmente() {
        try {
            console.log('ProjetosCarrossel: Carregando dados localmente');
            
            // Caminhos possíveis para o arquivo JSON
            const caminhosPossiveis = [
                '../data/projetos.json',
                './data/projetos.json',
                '/data/projetos.json',
                'data/projetos.json'
            ];
            
            let dadosCarregados = false;
            
            // Tentar cada caminho
            for (const caminho of caminhosPossiveis) {
                try {
                    console.log(`ProjetosCarrossel: Tentando carregar de ${caminho}`);
                    const response = await fetch(caminho);
                    
                    if (response.ok) {
                        const dados = await response.json();
                        console.log(`ProjetosCarrossel: Dados carregados com sucesso de ${caminho}`);
                        
                        // Ordenar por data
                        const projetosOrdenados = this.ordenarPorData(dados);
                        
                        // Filtrar os projetos destaque
                        this.projetosDestaque = this.filtrarProjetosDestaque(projetosOrdenados);
                        
                        // Renderizar carrossel
                        this.renderizarCarrossel();
                        
                        dadosCarregados = true;
                        break;
                    }
                } catch (err) {
                    console.log(`ProjetosCarrossel: Erro ao tentar carregar de ${caminho}:`, err);
                }
            }
            
            // Se não conseguiu carregar dados, usar dados de exemplo
            if (!dadosCarregados) {
                console.warn('ProjetosCarrossel: Não foi possível carregar dados, usando exemplos');
                this.usarDadosExemplo();
            }
            
        } catch (erro) {
            console.error('ProjetosCarrossel: Erro ao carregar dados localmente:', erro);
            this.usarDadosExemplo();
        } finally {
            this.mostrarCarregando(false);
        }
    }

    /**
     * Usa dados de exemplo quando não for possível carregar o JSON
     */
    usarDadosExemplo() {
        console.log('ProjetosCarrossel: Usando dados de exemplo');
        
        this.projetosDestaque = [
            {
                id: "exemplo-1",
                titulo: "Projeto Exemplo 1",
                categoria: "web",
                descricao: "Projeto de exemplo para demonstração",
                imagem: "../assets/img/projetos/alma-da-mata/thumb1.png",
                destaque: true,
                dataCriacao: "2025-05-01T14:30:00"
            },
            {
                id: "exemplo-2",
                titulo: "Projeto Exemplo 2",
                categoria: "app",
                descricao: "Segundo projeto de exemplo para demonstração",
                imagem: "../assets/img/projetos/nutri/nutri-thumb1.png",
                destaque: true,
                dataCriacao: "2025-04-15T10:00:00"
            }
        ];
        
        this.renderizarCarrossel();
    }

    /**
     * Carrega os projetos em destaque do gerenciador de modais
     */
    carregarProjetoDestaque() {
        if (!modaisGerenciador || !modaisGerenciador.projetosData) {
            console.warn('ProjetosCarrossel: Dados do gerenciador de modais não disponíveis');
            this.usarDadosExemplo();
            return;
        }
        
        console.log('ProjetosCarrossel: Carregando projetos em destaque do gerenciador de modais');
        
        // Obter projetos destaque
        if (typeof modaisGerenciador.obterProjetosDestaque === 'function') {
            this.projetosDestaque = modaisGerenciador.obterProjetosDestaque(this.maxProjetos);
        } else {
            // Filtrar manualmente se o método não estiver disponível
            const projetosOrdenados = this.ordenarPorData(modaisGerenciador.projetosData);
            this.projetosDestaque = this.filtrarProjetosDestaque(projetosOrdenados);
        }
        
        console.log(`ProjetosCarrossel: ${this.projetosDestaque.length} projetos em destaque carregados`);
        
        // Renderizar carrossel
        this.renderizarCarrossel();
    }

    /**
     * Ordena projetos por data de criação (mais recentes primeiro)
     * @param {Array} projetos - Lista de projetos para ordenar
     * @returns {Array} Projetos ordenados
     */
    ordenarPorData(projetos) {
        if (!projetos || !Array.isArray(projetos)) return [];
        
        console.log('ProjetosCarrossel: Ordenando projetos por data');
        
        return [...projetos].sort((a, b) => {
            // Verificar se as datas existem e são válidas
            const dataA = a.dataCriacao ? new Date(a.dataCriacao) : null;
            const dataB = b.dataCriacao ? new Date(b.dataCriacao) : null;
            
            // Se ambas as datas são válidas, comparar normalmente
            if (dataA && dataB && !isNaN(dataA) && !isNaN(dataB)) {
                return dataB - dataA; // Mais recentes primeiro
            }
            
            // Se apenas uma data é válida
            if (dataA && !isNaN(dataA)) return -1; // A tem data, vai primeiro
            if (dataB && !isNaN(dataB)) return 1;  // B tem data, vai primeiro
            
            // Se nenhuma data é válida, manter ordem original
            return 0;
        });
    }

    /**
     * Filtra projetos em destaque e limita à quantidade máxima
     * @param {Array} projetos - Lista de projetos para filtrar
     * @returns {Array} Projetos em destaque
     */
    filtrarProjetosDestaque(projetos) {
        if (!projetos || !Array.isArray(projetos)) return [];
        
        console.log('ProjetosCarrossel: Filtrando projetos em destaque');
        
        // Filtrar apenas os marcados como destaque
        const destaques = projetos.filter(projeto => projeto.destaque === true);
        
        // Limitar à quantidade máxima
        return destaques.slice(0, this.maxProjetos);
    }

    /**
     * Renderiza o carrossel com os projetos em destaque
     */
    renderizarCarrossel() {
        if (!this.projetosContainer) return;
        
        console.log('ProjetosCarrossel: Renderizando carrossel');
        
        // Ocultar indicador de carregamento
        this.mostrarCarregando(false);
        
        // Se não houver projetos para exibir
        if (!this.projetosDestaque || this.projetosDestaque.length === 0) {
            this.projetosContainer.innerHTML = `
                <div class="no-projects-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Nenhum projeto em destaque disponível.</p>
                </div>
            `;
            return;
        }
        
        // Limpar o container
        this.projetosContainer.innerHTML = '';
        
        // Criar e adicionar cards de projeto
        this.projetosDestaque.forEach(projeto => {
            const card = this.criarCardProjeto(projeto);
            this.projetosContainer.appendChild(card);
        });
        
        // Adicionar botão "Ver mais" se necessário
        if (this.projetosDestaque.length > 0) {
            const verMaisCard = this.criarCardVerMais();
            this.projetosContainer.appendChild(verMaisCard);
        }
        
        // Inicializar comportamento do carrossel
        this.inicializarCarrossel();
        
        console.log('ProjetosCarrossel: Carrossel renderizado com sucesso');
    }

    /**
     * Cria um elemento de card para um projeto
     * @param {Object} projeto - Dados do projeto
     * @returns {HTMLElement} Elemento do card
     */
    criarCardProjeto(projeto) {
        // Criar elemento do card
        const card = document.createElement('div');
        card.className = 'project-card';
        
        // Formatação da data (se disponível)
        let dataFormatada = '';
        if (projeto.dataCriacao) {
            try {
                const data = new Date(projeto.dataCriacao);
                dataFormatada = data.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } catch (e) {
                console.error('Erro ao formatar data:', e);
            }
        }
        
        // Estrutura HTML do card
        card.innerHTML = `
            <div class="project-image">
                <img src="${projeto.imagem}" alt="${projeto.titulo}" loading="lazy">
                <div class="project-overlay">
                    <button class="view-project-btn" 
                            onclick="modaisGerenciador.abrirModal('${projeto.id}')" 
                            aria-label="Ver detalhes do projeto ${projeto.titulo}">
                        Ver Projeto
                    </button>
                </div>
            </div>
            <div class="project-info">
                <span class="project-category">${projeto.categoria || 'Projeto'}</span>
                <h3>${projeto.titulo}</h3>
                <p>${projeto.descricao}</p>
                ${dataFormatada ? `<span class="project-date">Publicado em: ${dataFormatada}</span>` : ''}
            </div>
        `;
        
        // Adicionar evento de clique no card inteiro
        card.addEventListener('click', (e) => {
            // Não disparar se o clique foi no botão (que já tem seu próprio handler)
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                if (typeof modaisGerenciador !== 'undefined') {
                    modaisGerenciador.abrirModal(projeto.id);
                }
            }
        });
        
        return card;
    }

    /**
     * Cria um card "Ver mais" para o final do carrossel
     * @returns {HTMLElement} Elemento do card
     */
    criarCardVerMais() {
        const card = document.createElement('div');
        card.className = 'project-card see-more';
        
        card.innerHTML = `
            <i class="fas fa-plus-circle see-more-icon"></i>
            <h3 class="see-more-text">Ver Mais Projetos</h3>
            <a href="./projetos.html" class="full-card-link" aria-hidden="true" tabindex="-1"></a>
        `;
        
        // Adicionar evento de clique no card
        card.addEventListener('click', () => {
            window.location.href = './projetos.html';
        });
        
        return card;
    }

    /**
     * Inicializa o comportamento do carrossel (navegação, autoplay, etc)
     */
    inicializarCarrossel() {
        if (!this.container) return;
        
        console.log('ProjetosCarrossel: Inicializando comportamento do carrossel');
        
        // Determinar quantos slides mostrar por vez com base no tamanho da tela
        this.calcularSlidesPerView();
        
        // Configurar dots de navegação
        this.configurarDots();
        
        // Configurar botões de navegação
        this.configurarBotoes();
        
        // Configurar autoplay
        this.iniciarAutoplay();
        
        // Configurar eventos para touchscreen
        this.configurarTouch();
        
        // Adicionar listener para redimensionamento da janela
        window.addEventListener('resize', () => {
            const slidesPorViewAntigo = this.slidesPerView;
            this.calcularSlidesPerView();
            
            // Se o número de slides por view mudou, reconfigurar
            if (slidesPorViewAntigo !== this.slidesPerView) {
                this.configurarDots();
                this.atualizarCarrossel();
            }
        });
        
        // Configurar escuta de teclas
        this.container.setAttribute('tabindex', '0');
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.slidePrevio();
            } else if (e.key === 'ArrowRight') {
                this.proximoSlide();
            }
        });
        
        // Inicializar o estado do carrossel
        this.atualizarCarrossel();
    }

    /**
     * Calcula quantos slides devem ser mostrados por vez
     */
    calcularSlidesPerView() {
        if (window.innerWidth >= 992) {
            this.slidesPerView = 3; // Desktop
        } else if (window.innerWidth >= 768) {
            this.slidesPerView = 2; // Tablet
        } else {
            this.slidesPerView = 1; // Mobile
        }
    }

    /**
     * Configura os dots de navegação
     */
    configurarDots() {
        if (!this.dotsContainer) return;
        
        // Limpar dots existentes
        this.dotsContainer.innerHTML = '';
        
        // Número total de "páginas" do carrossel
        const totalPaginas = Math.max(1, Math.ceil((this.projetosDestaque.length + 1) / this.slidesPerView));
        
        // Criar dots para cada página
        for (let i = 0; i < totalPaginas; i++) {
            const dot = document.createElement('span');
            dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('data-index', i);
            dot.setAttribute('role', 'button');
            dot.setAttribute('tabindex', '0');
            dot.setAttribute('aria-label', `Página ${i + 1} de ${totalPaginas}`);
            
            // Adicionar evento de clique
            dot.addEventListener('click', () => {
                this.irParaPagina(i);
            });
            
            // Adicionar suporte a teclado
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.irParaPagina(i);
                }
            });
            
            this.dotsContainer.appendChild(dot);
        }
    }

    /**
     * Configura os botões de navegação
     */
    configurarBotoes() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.slidePrevio();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.proximoSlide();
            });
        }
    }

    /**
     * Inicia o autoplay do carrossel
     */
    iniciarAutoplay() {
        // Parar autoplay existente
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
        
        // Iniciar novo autoplay
        this.autoplayInterval = setInterval(() => {
            this.proximoSlide();
        }, 5000); // Muda a cada 5 segundos
        
        // Pausar ao passar o mouse
        this.container.addEventListener('mouseenter', () => {
            clearInterval(this.autoplayInterval);
        });
        
        // Retomar ao remover o mouse
        this.container.addEventListener('mouseleave', () => {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = setInterval(() => {
                this.proximoSlide();
            }, 5000);
        });
    }

    /**
     * Configura eventos para dispositivos touchscreen
     */
    configurarTouch() {
        if (!this.container) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        // Capturar posição inicial do toque
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        // Capturar posição final do toque
        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.processarGestoSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }

    /**
     * Processa o gesto de swipe
     * @param {number} startX - Posição X inicial
     * @param {number} endX - Posição X final
     */
    processarGestoSwipe(startX, endX) {
        const threshold = 50; // Limiar para considerar um swipe
        
        if (endX < startX - threshold) {
            // Swipe para a esquerda - próximo slide
            this.proximoSlide();
        } else if (endX > startX + threshold) {
            // Swipe para a direita - slide anterior
            this.slidePrevio();
        }
    }

    /**
     * Navega para o próximo slide
     */
    proximoSlide() {
        const totalPaginas = Math.max(1, Math.ceil((this.projetosDestaque.length + 1) / this.slidesPerView));
        const proximoIndex = (this.currentIndex + 1) % totalPaginas;
        this.irParaPagina(proximoIndex);
    }

    /**
     * Navega para o slide anterior
     */
    slidePrevio() {
        const totalPaginas = Math.max(1, Math.ceil((this.projetosDestaque.length + 1) / this.slidesPerView));
        const previoIndex = (this.currentIndex - 1 + totalPaginas) % totalPaginas;
        this.irParaPagina(previoIndex);
    }

    /**
     * Navega para uma página específica do carrossel
     * @param {number} index - Índice da página
     */
    irParaPagina(index) {
        const totalPaginas = Math.max(1, Math.ceil((this.projetosDestaque.length + 1) / this.slidesPerView));
        
        // Garantir que o índice está dentro dos limites
        if (index < 0) {
            index = 0;
        } else if (index >= totalPaginas) {
            index = totalPaginas - 1;
        }
        
        // Atualizar índice atual
        this.currentIndex = index;
        
        // Atualizar o carrossel
        this.atualizarCarrossel();
        
        // Anunciar para leitores de tela
        this.anunciarMudancaSlide();
    }

    /**
     * Atualiza a exibição do carrossel
     */
    atualizarCarrossel() {
        if (!this.projetosContainer || !this.container) return;
        
        // Obter todos os cards do carrossel
        const cards = this.projetosContainer.querySelectorAll('.project-card');
        if (!cards.length) return;
        
        // Calcular o deslocamento baseado no índice atual
        const cardWidth = cards[0].offsetWidth;
        const gap = 20; // Espaço entre cards (deve corresponder ao gap no CSS)
        const offset = -this.currentIndex * (this.slidesPerView * (cardWidth + gap));
        
        // Aplicar transformação
        this.projetosContainer.style.transform = `translateX(${offset}px)`;
        
        // Atualizar estado dos dots
        this.atualizarDots();
        
        // Atualizar estado dos botões
        this.atualizarBotoes();
    }

    /**
     * Atualiza o estado dos dots de navegação
     */
    atualizarDots() {
        if (!this.dotsContainer) return;
        
        // Atualizar classes nos dots
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            const isActive = index === this.currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    }

    /**
     * Atualiza o estado dos botões de navegação
     */
    atualizarBotoes() {
        const totalPaginas = Math.max(1, Math.ceil((this.projetosDestaque.length + 1) / this.slidesPerView));
        
        // Atualizar estado do botão anterior
        if (this.prevBtn) {
            const desativado = this.currentIndex === 0;
            this.prevBtn.classList.toggle('disabled', desativado);
            this.prevBtn.setAttribute('aria-disabled', desativado ? 'true' : 'false');
        }
        
        // Atualizar estado do botão próximo
        if (this.nextBtn) {
            const desativado = this.currentIndex >= totalPaginas - 1;
            this.nextBtn.classList.toggle('disabled', desativado);
            this.nextBtn.setAttribute('aria-disabled', desativado ? 'true' : 'false');
        }
    }

    /**
     * Anuncia a mudança de slide para leitores de tela
     */
    anunciarMudancaSlide() {
        const totalPaginas = Math.max(1, Math.ceil((this.projetosDestaque.length + 1) / this.slidesPerView));
        
        // Criar região live temporária
        const anuncio = document.createElement('div');
        anuncio.setAttribute('aria-live', 'polite');
        anuncio.className = 'sr-only'; // Visível apenas para leitores de tela
        anuncio.textContent = `Página ${this.currentIndex + 1} de ${totalPaginas}`;
        
        // Adicionar ao DOM
        document.body.appendChild(anuncio);
        
        // Remover após a leitura
        setTimeout(() => {
            if (anuncio.parentNode) {
                anuncio.parentNode.removeChild(anuncio);
            }
        }, 1000);
    }

    /**
     * Mostra ou oculta o indicador de carregamento
     * @param {boolean} mostrar - Se deve mostrar o indicador
     */
    mostrarCarregando(mostrar) {
        this.carregando = mostrar;
        
        if (!this.projetosContainer) return;
        
        // Se deve mostrar o carregamento
        if (mostrar) {
            this.projetosContainer.innerHTML = `
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Carregando projetos...</p>
                </div>
            `;
        }
    }
}

// Criar instância global do carrossel
const projetosCarrossel = new ProjetosCarrossel();

// Inicializar o carrossel quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado - inicializando carrossel de projetos');
    
    // Verificar se estamos na página inicial
    const paginaInicial = document.querySelector('.projects-carousel');
    
    if (paginaInicial) {
        // Pequeno delay para garantir que outros scripts foram carregados
        setTimeout(() => {
            projetosCarrossel.inicializar();
        }, 300);
    }
});