// Arquivo: projetos.js
// Responsável por gerenciar a exibição dos projetos na página de projetos

class ProjetosGerenciador {
    constructor() {
        this.projetosContainer = null;
        this.loadingContainer = null;
        this.filtrosContainer = null;
        this.projetosData = null;
        this.filtroAtivo = 'todos';
        this.carregando = false;
        this.categorias = new Set(['todos']);
        this.filtrosInicializados = false;
        this.projetosRenderizados = false;
        this.ordenarPorData = true;
        this.animacoesAtivas = true; // Nova propriedade para controlar animações
    }

    // Inicializa o gerenciador de projetos
    inicializar() {
        // Captura os elementos DOM necessários
        this.projetosContainer = document.getElementById('projetos-container');
        this.loadingContainer = document.getElementById('loading-container');
        this.filtrosContainer = document.getElementById('filtros-container');
        
        if (!this.projetosContainer) {
            console.error("Projetos: Container de projetos não encontrado");
            return;
        }
        
        console.log("Projetos: Inicializando gerenciador de projetos");
        this.mostrarLoading(true);
        this.carregarProjetos();
    }

    // Carrega os dados dos projetos
    async carregarProjetos() {
        if (this.carregando) return;
        this.carregando = true;
        
        try {
            console.log("Projetos: Iniciando carregamento de dados");
            
            // VERIFICAÇÃO 1: Tentar usar dados do gerenciador de modais se disponíveis
            if (typeof modaisGerenciador !== 'undefined' && 
                modaisGerenciador.projetosData && 
                modaisGerenciador.projetosData.length > 0) {
                
                console.log('Projetos: Usando dados já carregados pelo gerenciador de modais');
                this.projetosData = modaisGerenciador.projetosData;
                await this.processarDados();
                this.mostrarLoading(false);
                this.carregando = false;
                return;
            }

            // VERIFICAÇÃO 2: Se o gerenciador de modais existe, tentar carregar ou esperar evento
            if (typeof modaisGerenciador !== 'undefined') {
                console.log("Projetos: Gerenciador de modais encontrado, aguardando carregamento");
                
                // Esperar pelo evento de dados carregados
                const esperarDados = new Promise((resolve) => {
                    document.addEventListener('projetosDadosCarregados', () => {
                        console.log('Projetos: Evento de dados carregados recebido');
                        if (modaisGerenciador.projetosData) {
                            this.projetosData = modaisGerenciador.projetosData;
                        }
                        resolve();
                    }, { once: true });
                });
                
                // Iniciar o carregamento no gerenciador de modais se possível
                if (typeof modaisGerenciador.inicializar === 'function') {
                    console.log('Projetos: Solicitando carregamento de dados ao gerenciador de modais');
                    modaisGerenciador.inicializar();
                }
                
                // Definir um timeout para não esperar indefinidamente
                const timeout = new Promise((resolve) => {
                    setTimeout(() => {
                        console.warn('Projetos: Timeout ao aguardar dados do gerenciador de modais');
                        resolve();
                    }, 5000);
                });
                
                // Esperar pelo primeiro que completar: dados carregados ou timeout
                await Promise.race([esperarDados, timeout]);
                
                // Se temos dados, processar e mostrar
                if (this.projetosData) {
                    console.log('Projetos: Dados obtidos do gerenciador de modais');
                    await this.processarDados();
                    this.mostrarLoading(false);
                    this.carregando = false;
                    return;
                }
                
                // Se chegamos aqui, o gerenciador de modais não forneceu dados no tempo esperado
                console.warn('Projetos: Gerenciador de modais não forneceu dados, tentando carregar diretamente');
            } else {
                console.warn('Projetos: Gerenciador de modais não encontrado');
            }
            
            // VERIFICAÇÃO 3: Carregar dados diretamente como último recurso
            console.log('Projetos: Tentando carregar dados diretamente');
            await this.carregarDadosDiretamente();
            await this.processarDados();
                
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            if (this.projetosContainer) {
                this.projetosContainer.innerHTML = `
                    <p class="error-message">
                        Erro ao carregar os projetos: ${error.message}
                        <button class="retry-button" onclick="projetosGerenciador.carregarProjetos()">
                            Tentar novamente
                        </button>
                    </p>
                `;
            }
        } finally {
            this.mostrarLoading(false);
            this.carregando = false;
        }
    }

    // Carrega os dados diretamente do JSON se o gerenciador de modais não estiver disponível
    async carregarDadosDiretamente() {
        try {
            let response = null;
            let dadosCarregados = false;
            
            // Tentativas de caminhos para o JSON em diferentes contextos
            const caminhosPossiveis = [
                '../data/projetos.json',
                './data/projetos.json',
                '/data/projetos.json',
                'data/projetos.json',
                '../../data/projetos.json',
                location.origin + '/data/projetos.json'
            ];
            
            // Tentar cada caminho possível sequencialmente
            for (const caminho of caminhosPossiveis) {
                try {
                    console.log(`Projetos: Tentando carregar JSON diretamente de: ${caminho}`);
                    response = await fetch(caminho);
                    
                    if (response.ok) {
                        console.log(`Projetos: JSON carregado com sucesso de: ${caminho}`);
                        this.projetosData = await response.json();
                        dadosCarregados = true;
                        break;
                    }
                } catch (err) {
                    console.log(`Projetos: Erro ao tentar caminho ${caminho}: ${err.message}`);
                }
            }
            
            if (!dadosCarregados) {
                // Se não conseguiu carregar de nenhum caminho, usar dados hardcoded para testes
                console.warn('Projetos: Não foi possível carregar JSON de nenhum caminho, usando dados de exemplo');
                this.projetosData = [
                    {
                        id: "projeto-exemplo-1",
                        titulo: "Projeto exemplo 1",
                        categoria: "web",
                        descricao: "Exemplo de projeto para teste",
                        imagem: "../assets/img/projetos/delivery/delivery-principal.png",
                        dataCriacao: "2025-05-10T14:30:00" // NOVA LINHA: Adicionada data
                    },
                    {
                        id: "projeto-exemplo-2",
                        titulo: "Projeto exemplo 2",
                        categoria: "app",
                        descricao: "Outro exemplo de projeto para teste",
                        imagem: "../assets/img/projetos/finance.png",
                        dataCriacao: "2025-05-01T10:15:00" // NOVA LINHA: Adicionada data
                    }
                ];
            }
            
            if (!this.projetosData || !Array.isArray(this.projetosData)) {
                throw new Error('Dados de projetos inválidos');
            }
            
            console.log(`Projetos: ${this.projetosData.length} projetos carregados diretamente`);
            
        } catch (error) {
            console.error('Erro ao carregar dados diretamente:', error);
            throw error;
        }
    }
    
    // Processa os dados dos projetos, extrai categorias e renderiza
    async processarDados() {
        if (!this.projetosData || !Array.isArray(this.projetosData)) {
            console.error('Projetos: Dados inválidos para processamento');
            return;
        }
        
        console.log(`Projetos: Processando ${this.projetosData.length} projetos`);
        
        // NOVA SEÇÃO: Ordenar projetos por data de criação se a flag estiver ativa
        if (this.ordenarPorData) {
            console.log("Projetos: Ordenando projetos por data de criação");
            
            // Verificar datas antes da ordenação
            this.projetosData.forEach(projeto => {
                console.log(`Projeto antes da ordenação: ${projeto.titulo}, Data: ${projeto.dataCriacao || 'Sem data'}`);
            });
            
            // Criar uma cópia do array antes de ordenar (para evitar modificar o original diretamente)
            const projetosOrdenados = [...this.projetosData].sort((a, b) => {
                // Verificar se as datas existem e são válidas
                const dataA = a.dataCriacao ? new Date(a.dataCriacao) : null;
                const dataB = b.dataCriacao ? new Date(b.dataCriacao) : null;
                
                // Se ambas as datas são válidas, comparar normalmente (do mais recente para o mais antigo)
                if (dataA && dataB && !isNaN(dataA) && !isNaN(dataB)) {
                    return dataB - dataA;
                }
                
                // Se apenas uma data é válida
                if (dataA && !isNaN(dataA)) return -1; // A tem data, vai primeiro
                if (dataB && !isNaN(dataB)) return 1;  // B tem data, vai primeiro
                
                // Se nenhuma data é válida, manter ordem original
                return 0;
            });
            
            this.projetosData = projetosOrdenados;
            
            // Verificar resultado da ordenação
            console.log("Projetos: Ordem após ordenação:");
            this.projetosData.forEach((projeto, index) => {
                console.log(`${index + 1}. ${projeto.titulo} - ${projeto.dataCriacao || 'Sem data'}`);
            });
        }
        
        // Extrair todas as categorias únicas para os filtros
        this.categorias = new Set(['todos']);
        this.projetosData.forEach(projeto => {
            if (projeto.categoria) {
                this.categorias.add(projeto.categoria);
            }
        });
        
        console.log(`Projetos: Categorias encontradas: ${Array.from(this.categorias).join(', ')}`);
        
        // Renderiza os projetos e inicializa os filtros
        await this.renderizarProjetos();
        await this.inicializarFiltros();
        
        // Marca como renderizado para evitar renderizações duplas
        this.projetosRenderizados = true;
    }

    // Renderiza os projetos na página com animação progressiva
    async renderizarProjetos() {
        if (!this.projetosData || !this.projetosContainer) return;
        
        console.log(`Projetos: Renderizando ${this.projetosData.length} projetos`);
        
        if (this.projetosData.length === 0) {
            this.projetosContainer.innerHTML = '<p class="no-projects">Nenhum projeto disponível para exibição.</p>';
            return;
        }
        
        // Limpar container primeiro
        this.projetosContainer.innerHTML = '';
        
        // Usar fragmento para melhor performance
        const fragmento = document.createDocumentFragment();
        
        // Criar elementos de projeto com dados
        this.projetosData.forEach((projeto, index) => {
            const projetoItem = document.createElement('div');
            projetoItem.className = 'project-item reveal-up';
            
            // Adicionar delay crescente para animação mais suave
            if (this.animacoesAtivas) {
                projetoItem.style.animationDelay = `${index * 100}ms`;
            }
            
            projetoItem.setAttribute('data-categoria', projeto.categoria || '');
            projetoItem.setAttribute('data-index', index);
            
            // Formatação opcional da data para exibição
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
                    dataFormatada = '';
                }
            }
            
            projetoItem.innerHTML = `
                <div class="project-card">
                    <div class="project-image">
                        <img src="${projeto.imagem}" alt="${projeto.titulo}" loading="lazy">
                        <div class="project-overlay">
                            <button class="view-project-btn" onclick="modaisGerenciador.abrirModal('${projeto.id}')" 
                                    aria-label="Ver detalhes do projeto ${projeto.titulo}">
                                Ver Projeto
                            </button>
                        </div>
                    </div>
                    <div class="project-info">
                        <span class="project-category">${projeto.categoria || 'Sem categoria'}</span>
                        <h3>${projeto.titulo}</h3>
                        <p>${projeto.descricao}</p>
                        ${dataFormatada ? `<span class="project-date">Publicado em: ${dataFormatada}</span>` : ''}
                    </div>
                </div>
            `;
            
            fragmento.appendChild(projetoItem);
        });
        
        // Adicionar todos os projetos ao DOM
        this.projetosContainer.appendChild(fragmento);
        
        // Verificar se elementos de animação precisam ser ativados manualmente
        // (para o caso de elementos que estão já inicialmente na viewport)
        setTimeout(() => {
            const projetoItems = this.projetosContainer.querySelectorAll('.project-item');
            projetoItems.forEach(item => {
                if (!item.classList.contains('active')) {
                    item.classList.add('active');
                }
            });
        }, 100);
        
        // Aplicar animação progressiva aos itens
        const items = this.projetosContainer.querySelectorAll('.project-item');
        const delay = 100; // Milissegundos entre cada animação
        
        // Usando setTimeout para criar uma animação sequencial
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * delay);
        });
        
        console.log('Projetos: Renderização concluída');
        
        return new Promise(resolve => {
            // Resolver a promessa quando todas as animações terminarem
            setTimeout(() => resolve(), items.length * delay + 500);
        });
    }
    
    // Inicializa os filtros baseados nas categorias dos projetos
    async inicializarFiltros() {
        if (!this.filtrosContainer) {
            console.warn('Projetos: Container de filtros não encontrado');
            return;
        }
        
        if (this.filtrosInicializados) {
            console.log('Projetos: Filtros já inicializados');
            return;
        }
        
        console.log('Projetos: Inicializando filtros');
        
        // Converter o Set de categorias para um array e ordenar
        const categorias = Array.from(this.categorias).sort((a, b) => {
            // Garantir que 'todos' venha sempre primeiro
            if (a === 'todos') return -1;
            if (b === 'todos') return 1;
            return a.localeCompare(b);
        });
        
        // Limpar container e criar fragmento
        this.filtrosContainer.innerHTML = '';
        const fragmento = document.createDocumentFragment();
        
        // Criar botões de filtro para cada categoria
        categorias.forEach((categoria, index) => {
            const botao = document.createElement('button');
            botao.className = `filter-btn ${categoria === 'todos' ? 'active' : ''} animate-fade-in`;
            
            // Adicionar delay crescente para animação mais suave
            if (this.animacoesAtivas) {
                botao.style.animationDelay = `${index * 100}ms`;
            }
            
            botao.setAttribute('data-filtro', categoria);
            botao.setAttribute('type', 'button');
            botao.setAttribute('aria-pressed', categoria === 'todos' ? 'true' : 'false');
            botao.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
            
            // Adicionar evento de clique
            botao.addEventListener('click', () => {
                this.filtrarProjetos(categoria);
                
                // Adicionar uma pequena animação ao clicar
                botao.classList.add('animate-pulse');
                setTimeout(() => {
                    botao.classList.remove('animate-pulse');
                }, 500);
                
                // Atualizar estado dos botões
                this.filtrosContainer.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                
                botao.classList.add('active');
                botao.setAttribute('aria-pressed', 'true');
            });
            
            fragmento.appendChild(botao);
        });
        
        // Adicionar todos os botões ao DOM
        this.filtrosContainer.appendChild(fragmento);
        
        // Filtrar inicialmente por 'todos'
        this.filtrarProjetos('todos');
        
        this.filtrosInicializados = true;
        console.log('Projetos: Filtros inicializados');
        
        return Promise.resolve();
    }
    
    // Filtra os projetos por categoria com animação
    filtrarProjetos(categoria) {
        this.filtroAtivo = categoria;
        console.log(`Filtrando projetos por categoria: ${categoria}`);
        
        if (!this.projetosContainer) return;
        
        const items = this.projetosContainer.querySelectorAll('.project-item');
        if (!items.length) return;
        
        // Usar animações CSS para transição suave
        items.forEach(item => {
            const itemCategoria = item.getAttribute('data-categoria');
            const match = categoria === 'todos' || itemCategoria === categoria;
            
            // Guarda o estado atual do item
            const isVisible = !item.classList.contains('hidden');
            
            // Se o estado vai mudar, aplicar animação
            if (match && !isVisible) {
                // Vai mostrar: preparar para fade in
                item.classList.remove('hidden');
                item.classList.add('visible');
                
                // Usar requestAnimationFrame para garantir que a transição ocorra após a mudança de classe
                requestAnimationFrame(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                });
                
                // Adicionar uma animação de entrada
                if (this.animacoesAtivas) {
                    item.classList.add('animate-fade-in');
                    setTimeout(() => {
                        item.classList.remove('animate-fade-in');
                    }, 1000);
                }
            } 
            else if (!match && isVisible) {
                // Vai esconder: aplicar fade out
                item.classList.remove('visible');
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                
                // Adicionar classe 'hidden' após a animação completar
                setTimeout(() => {
                    if (this.filtroAtivo !== categoria) return; // Se o filtro mudou, interromper
                    item.classList.add('hidden');
                }, 300); // Corresponde à duração da transição CSS
            }
        });
        
        // Anunciar para leitores de tela
        const total = Array.from(items).filter(item => 
            categoria === 'todos' || 
            item.getAttribute('data-categoria') === categoria
        ).length;
        
        const anuncio = document.createElement('div');
        anuncio.setAttribute('aria-live', 'polite');
        anuncio.className = 'sr-only';
        anuncio.textContent = `Mostrando ${total} projetos da categoria ${categoria}`;
        this.projetosContainer.appendChild(anuncio);
        
        // Remover o anúncio após a leitura
        setTimeout(() => {
            if (anuncio.parentNode) anuncio.parentNode.removeChild(anuncio);
        }, 1000);
    }
    
    // Mostra ou esconde o indicador de carregamento
    mostrarLoading(mostrar) {
        if (!this.loadingContainer) return;
        this.loadingContainer.style.display = mostrar ? 'flex' : 'none';
        
        // Adicionar animações ao loading para melhorar a experiência
        if (mostrar && this.animacoesAtivas) {
            this.loadingContainer.classList.add('animate-pulse');
        } else {
            this.loadingContainer.classList.remove('animate-pulse');
        }
    }
}

// Cria uma instância global do gerenciador de projetos
const projetosGerenciador = new ProjetosGerenciador();

// Inicializa o carregamento de projetos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado - verificando página de projetos");
    
    // Verificar se estamos na página de projetos
    const estaNaPaginaProjetos = document.getElementById('projetos-container');
    
    if (estaNaPaginaProjetos) {
        console.log("Página de projetos detectada - inicializando gerenciador");
        setTimeout(() => {
            projetosGerenciador.inicializar();
        }, 200);
    }
});

// Garantir que os modais são configurados após os projetos serem carregados
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página de projetos
    if (document.getElementById('projetos-container')) {
        // Verificar se o modaisGerenciador está disponível
        if (typeof modaisGerenciador !== 'undefined') {
            console.log('Projetos: Inicializando integração com modais');
            
            // Inicializar o gerenciador de modais
            setTimeout(() => {
                modaisGerenciador.inicializar();
                
                // Adicionar evento para reconfigurar botões quando os projetos forem renderizados
                document.addEventListener('projetosFiltrados', () => {
                    console.log('Projetos: Evento projetosFiltrados detectado, reconfigurando botões');
                    setTimeout(() => {
                        modaisGerenciador.configurarBotoesVerProjeto();
                    }, 100);
                });
                
                // Adicionar evento para a renderização inicial de projetos
                document.addEventListener('projetosRenderizados', () => {
                    console.log('Projetos: Evento projetosRenderizados detectado, configurando botões');
                    setTimeout(() => {
                        modaisGerenciador.configurarBotoesVerProjeto();
                    }, 100);
                });
            }, 300);
        }
    }
});

// Modificar o método filtrarProjetos para disparar um evento quando os projetos são filtrados
// Adicione esta linha ao final do método filtrarProjetos em ProjetosGerenciador:
/*
// Disparar evento indicando que os projetos foram filtrados
const eventoFiltro = new CustomEvent('projetosFiltrados', {
    detail: { filtro: categoria }
});
document.dispatchEvent(eventoFiltro);
*/

// Modificar o método renderizarProjetos para disparar um evento quando os projetos são renderizados
// Adicione esta linha ao final do método renderizarProjetos em ProjetosGerenciador:
/*
// Disparar evento indicando que os projetos foram renderizados
const eventoRenderizacao = new CustomEvent('projetosRenderizados');
document.dispatchEvent(eventoRenderizacao);
*/