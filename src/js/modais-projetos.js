/**
 * modais-projetos.js
 * Sistema de gerenciamento de modais de projetos
 * Responsável por carregar dados de JSON, gerar modais e exibi-los
 */

class ModaisGerenciador {
    constructor() {
        this.projetosData = null;
        this.modaisContainer = null;
        this.modalAtivo = null;
        this.eventosInicializados = false;
        this.projetosCarregados = false;
        this.tentativasDeCarregamento = 0;
        this.maxTentativas = 5;
    }

    /**
     * Inicializa o gerenciador de modais
     */
    inicializar() {
        console.log('ModaisGerenciador: Inicializando');
        
        // Verificar se o container de modais existe
        this.modaisContainer = document.getElementById('modais-container');
        if (!this.modaisContainer) {
            console.log('ModaisGerenciador: Container de modais não encontrado, criando novo');
            this.modaisContainer = document.createElement('div');
            this.modaisContainer.id = 'modais-container';
            document.body.appendChild(this.modaisContainer);
        }
        
        // Carregar dados de projetos
        if (!this.projetosCarregados) {
            this.carregarDadosProjetos();
        }
    }

    /**
     * Carrega os dados dos projetos do arquivo JSON
     */
    async carregarDadosProjetos() {
        if (this.projetosCarregados || this.tentativasDeCarregamento >= this.maxTentativas) return;
        
        this.tentativasDeCarregamento++;
        console.log(`ModaisGerenciador: Tentativa ${this.tentativasDeCarregamento} de carregar dados de projetos`);
        
        try {
            // Array de caminhos possíveis para tentar (para diferentes contextos de execução)
            const caminhosPossiveis = [
                '../data/projetos.json',
                './data/projetos.json',
                '/data/projetos.json',
                'data/projetos.json',
                '../../data/projetos.json',
                location.origin + '/data/projetos.json'
            ];
            
            let dadosCarregados = false;
            
            // Tentar cada caminho possível
            for (const caminho of caminhosPossiveis) {
                try {
                    console.log(`ModaisGerenciador: Tentando carregar de ${caminho}`);
                    const response = await fetch(caminho);
                    
                    if (response.ok) {
                        this.projetosData = await response.json();
                        console.log(`ModaisGerenciador: Dados carregados com sucesso de ${caminho}`);
                        
                        // Ordenar projetos por data (mais recentes primeiro)
                        this.ordenarProjetosPorData();
                        
                        // Gerar modais para todos os projetos
                        this.gerarModaisProjetos();
                        
                        // Inicializar eventos de interação
                        this.inicializarEventos();
                        
                        // Marcar como carregado
                        this.projetosCarregados = true;
                        dadosCarregados = true;
                        
                        // Disparar evento para notificar que os dados foram carregados
                        const evento = new CustomEvent('projetosDadosCarregados', {
                            detail: { projetosData: this.projetosData }
                        });
                        document.dispatchEvent(evento);
                        
                        break;
                    }
                } catch (erro) {
                    console.log(`ModaisGerenciador: Erro ao tentar carregar de ${caminho}:`, erro);
                }
            }
            
            // Se não conseguiu carregar de nenhum caminho e ainda tem tentativas
            if (!dadosCarregados && this.tentativasDeCarregamento < this.maxTentativas) {
                console.log(`ModaisGerenciador: Tentaremos novamente em 1 segundo`);
                // Tentar novamente após um segundo
                setTimeout(() => this.carregarDadosProjetos(), 1000);
            } 
            // Se esgotou as tentativas, usar dados de exemplo
            else if (!dadosCarregados) {
                console.warn('ModaisGerenciador: Não foi possível carregar os dados JSON, usando dados de exemplo');
                this.usarDadosExemplo();
            }
            
        } catch (erro) {
            console.error('ModaisGerenciador: Erro ao carregar dados de projetos:', erro);
            
            // Se ainda tiver tentativas disponíveis, tentar novamente
            if (this.tentativasDeCarregamento < this.maxTentativas) {
                console.log(`ModaisGerenciador: Tentaremos novamente em 1 segundo`);
                setTimeout(() => this.carregarDadosProjetos(), 1000);
            } else {
                console.warn('ModaisGerenciador: Número máximo de tentativas atingido, usando dados de exemplo');
                this.usarDadosExemplo();
            }
        }
    }

    /**
     * Ordena os projetos por data de criação (mais recentes primeiro)
     */
    ordenarProjetosPorData() {
        if (!this.projetosData || !Array.isArray(this.projetosData)) return;
        
        console.log('ModaisGerenciador: Ordenando projetos por data');
        
        // Log das datas antes da ordenação para diagnóstico
        this.projetosData.forEach(projeto => {
            console.log(`Projeto antes da ordenação: ${projeto.titulo}, Data: ${projeto.dataCriacao || 'Sem data'}`);
        });
        
        this.projetosData.sort((a, b) => {
            // Verificar se as datas existem e são válidas
            const dataA = a.dataCriacao ? new Date(a.dataCriacao) : null;
            const dataB = b.dataCriacao ? new Date(b.dataCriacao) : null;
            
            // Se ambas as datas são válidas, comparar normalmente
            if (dataA && dataB && !isNaN(dataA) && !isNaN(dataB)) {
                return dataB - dataA; // Ordem decrescente (mais recente primeiro)
            }
            
            // Se apenas uma data é válida
            if (dataA && !isNaN(dataA)) return -1; // A tem data, vai primeiro
            if (dataB && !isNaN(dataB)) return 1;  // B tem data, vai primeiro
            
            // Se nenhuma data é válida, manter ordem original
            return 0;
        });
        
        // Log das datas após a ordenação para confirmar
        console.log('ModaisGerenciador: Resultado da ordenação:');
        this.projetosData.forEach((projeto, index) => {
            console.log(`${index + 1}. ${projeto.titulo} - Data: ${projeto.dataCriacao || 'Sem data'}`);
        });
    }

    /**
     * Usa dados de exemplo quando não for possível carregar o JSON
     */
    usarDadosExemplo() {
        console.log('ModaisGerenciador: Usando dados de exemplo');
        
        this.projetosData = [
            {
                id: "exemplo-1",
                titulo: "Projeto Exemplo 1",
                categoria: "web",
                descricao: "Projeto de exemplo para demonstração",
                imagem: "../assets/img/projetos/alma-da-mata/thumb1.png",
                destaque: true,
                dataCriacao: "2025-05-01T14:30:00",
                detalhes: {
                    imagemPrincipal: "../assets/img/projetos/alma-da-mata/thumb1.png",
                    imagens: [
                        "../assets/img/projetos/alma-da-mata/thumb2.png",
                        "../assets/img/projetos/alma-da-mata/thumb3.png"
                    ],
                    descricao: "Descrição completa do projeto de exemplo para demonstração do sistema de modais.",
                    tecnologias: ["HTML", "CSS", "JavaScript"],
                    desafios: "Desafios enfrentados no projeto exemplo.",
                    resultados: [
                        { numero: "100%", descricao: "Satisfação do cliente" },
                        { numero: "+50%", descricao: "Aumento em conversão" }
                    ],
                    urlDemo: "https://exemplo.com",
                    urlRepositorio: "https://github.com/exemplo"
                }
            },
            {
                id: "exemplo-2",
                titulo: "Projeto Exemplo 2",
                categoria: "app",
                descricao: "Segundo projeto de exemplo para demonstração",
                imagem: "../assets/img/projetos/nutri/nutri-thumb1.png",
                destaque: true,
                dataCriacao: "2025-04-15T10:00:00",
                detalhes: {
                    imagemPrincipal: "../assets/img/projetos/nutri/nutri-thumb1.png",
                    imagens: [
                        "../assets/img/projetos/nutri/nutri-thumb2.png",
                        "../assets/img/projetos/nutri/nutri-thumb3.png"
                    ],
                    descricao: "Descrição completa do segundo projeto de exemplo.",
                    tecnologias: ["React", "Node.js", "MongoDB"],
                    desafios: "Desafios enfrentados no segundo projeto exemplo.",
                    resultados: [
                        { numero: "95%", descricao: "Satisfação do cliente" },
                        { numero: "+30%", descricao: "Aumento em conversão" }
                    ],
                    urlDemo: "https://exemplo2.com",
                    urlRepositorio: "https://github.com/exemplo2"
                }
            }
        ];
        
        // Gerar modais para os projetos de exemplo
        this.gerarModaisProjetos();
        
        // Inicializar eventos
        this.inicializarEventos();
        
        // Marcar como carregado
        this.projetosCarregados = true;
        
        // Disparar evento para notificar que os dados foram carregados
        const evento = new CustomEvent('projetosDadosCarregados', {
            detail: { projetosData: this.projetosData }
        });
        document.dispatchEvent(evento);
    }

    /**
     * Gera os modais para todos os projetos
     */
    gerarModaisProjetos() {
        if (!this.projetosData || !this.modaisContainer) return;
        
        console.log(`ModaisGerenciador: Gerando modais para ${this.projetosData.length} projetos`);
        
        // Limpar modais existentes
        this.modaisContainer.innerHTML = '';
        
        // Criar fragmento para melhor performance
        const fragmento = document.createDocumentFragment();
        
        // Gerar um modal para cada projeto
        this.projetosData.forEach(projeto => {
            const modal = this.criarModalProjeto(projeto);
            fragmento.appendChild(modal);
        });
        
        // Adicionar todos os modais ao container
        this.modaisContainer.appendChild(fragmento);
        
        console.log('ModaisGerenciador: Modais gerados com sucesso');
    }

    /**
     * Cria um elemento HTML para o modal de um projeto
     * @param {Object} projeto - Dados do projeto
     * @returns {HTMLElement} Elemento do modal
     */
    criarModalProjeto(projeto) {
        // Criar container do modal
        const modal = document.createElement('div');
        modal.id = `projeto-modal-${projeto.id}`;
        modal.className = 'project-modal';
        modal.setAttribute('data-projeto-id', projeto.id);
        modal.setAttribute('aria-hidden', 'true');
        
        // Verificar se os detalhes do projeto existem
        if (!projeto.detalhes) {
            console.warn(`ModaisGerenciador: Projeto ${projeto.id} não possui detalhes completos`);
            projeto.detalhes = {
                imagemPrincipal: projeto.imagem,
                imagens: [],
                descricao: projeto.descricao,
                tecnologias: [],
                desafios: "Informações detalhadas não disponíveis.",
                resultados: []
            };
        }
        
        // Preparar a lista de tecnologias
        let tecnologiasHTML = '';
        if (projeto.detalhes.tecnologias && projeto.detalhes.tecnologias.length > 0) {
            projeto.detalhes.tecnologias.forEach(tech => {
                tecnologiasHTML += `<li>${tech}</li>`;
            });
        }
        
        // Preparar a galeria de miniaturas
        let thumbnailsHTML = '';
        if (projeto.detalhes.imagens && projeto.detalhes.imagens.length > 0) {
            projeto.detalhes.imagens.forEach((imagem, index) => {
                thumbnailsHTML += `
                    <img src="${imagem}" alt="${projeto.titulo} - Imagem ${index + 1}" 
                         onclick="modaisGerenciador.trocarImagemPrincipal('${projeto.id}', '${imagem}')"
                         class="thumbnail">
                `;
            });
        }
        
        // Preparar os resultados
        let resultadosHTML = '';
        if (projeto.detalhes.resultados && projeto.detalhes.resultados.length > 0) {
            projeto.detalhes.resultados.forEach(resultado => {
                resultadosHTML += `
                    <div class="result-item">
                        <span class="result-number">${resultado.numero}</span>
                        <span class="result-label">${resultado.descricao}</span>
                    </div>
                `;
            });
        } else {
            resultadosHTML = '<p>Resultados não disponíveis para este projeto.</p>';
        }
        
        // Estrutura HTML do modal
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>${projeto.titulo}</h2>
                    <button class="close-modal" onclick="modaisGerenciador.fecharModal('${projeto.id}')" aria-label="Fechar modal">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="project-gallery">
                        <div class="main-image" id="main-image-${projeto.id}">
                            <img src="${projeto.detalhes.imagemPrincipal || projeto.imagem}" alt="${projeto.titulo}" id="principal-img-${projeto.id}">
                        </div>
                        <div class="thumbnail-gallery">
                            <!-- Imagem principal como primeira miniatura -->
                            <img src="${projeto.detalhes.imagemPrincipal || projeto.imagem}" alt="${projeto.titulo} - Imagem Principal" 
                                 onclick="modaisGerenciador.trocarImagemPrincipal('${projeto.id}', '${projeto.detalhes.imagemPrincipal || projeto.imagem}')"
                                 class="thumbnail active">
                            ${thumbnailsHTML}
                        </div>
                    </div>
                    
                    <div class="project-details">
                        <div class="details-section">
                            <h3>Sobre o Projeto</h3>
                            <p>${projeto.detalhes.descricao || projeto.descricao}</p>
                            
                            <h3>Tecnologias Utilizadas</h3>
                            <ul class="tech-stack">
                                ${tecnologiasHTML || '<li>Informações não disponíveis</li>'}
                            </ul>
                        </div>
                        
                        <div class="details-section">
                            <h3>Desafios</h3>
                            <p>${projeto.detalhes.desafios || 'Informações sobre desafios não disponíveis.'}</p>
                            
                            <h3>Resultados</h3>
                            <div class="results-grid">
                                ${resultadosHTML}
                            </div>
                        </div>
                    </div>
                    
                    <div class="project-cta">
                        ${projeto.detalhes.urlDemo ? 
                            `<a href="${projeto.detalhes.urlDemo}" class="cta-button" target="_blank" rel="noopener">
                                Ver Demo <i class="fas fa-external-link-alt"></i>
                            </a>` : ''
                        }
                        
                        ${projeto.detalhes.urlRepositorio ? 
                            `<a href="${projeto.detalhes.urlRepositorio}" class="cta-button" target="_blank" rel="noopener">
                                Ver Código <i class="fab fa-github"></i>
                            </a>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    /**
     * Inicializa os eventos para interação com os modais
     */
    inicializarEventos() {
        if (this.eventosInicializados) {
            console.log('ModaisGerenciador: Eventos já inicializados');
            return;
        }
        
        console.log('ModaisGerenciador: Inicializando eventos de interação');
        
        // Fechar modal quando clicar fora do conteúdo
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('project-modal') && this.modalAtivo) {
                const projetoId = e.target.getAttribute('data-projeto-id');
                this.fecharModal(projetoId);
            }
        });
        
        // Fechar modal com tecla Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalAtivo) {
                const projetoId = this.modalAtivo.replace('projeto-modal-', '');
                this.fecharModal(projetoId);
            }
        });
        
        // Configurar botões "Ver Projeto" nos cards de projetos
        this.configurarBotoesVerProjeto();
        
        this.eventosInicializados = true;
        console.log('ModaisGerenciador: Eventos inicializados com sucesso');
        
        // Adicionar evento para reconfigurações quando o DOM mudar
        // Útil para quando novos cards de projeto são adicionados dinamicamente
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Verificar se algum dos nós adicionados contém botões "Ver Projeto"
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && (
                            node.classList.contains('project-card') || 
                            node.querySelector('.view-project-btn')
                        )) {
                            this.configurarBotoesVerProjeto();
                        }
                    });
                }
            });
        });
        
        // Observar o corpo do documento para alterações
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Configura os botões "Ver Projeto" nos cards
     */
    configurarBotoesVerProjeto() {
        console.log('ModaisGerenciador: Configurando botões Ver Projeto');
        
        // Selecionar todos os botões de visualização de projeto
        const botoesVerProjeto = document.querySelectorAll('.view-project-btn');
        
        botoesVerProjeto.forEach(botao => {
            // Verificar se o botão já tem o evento configurado
            if (botao.hasAttribute('data-evento-configurado')) {
                return;
            }
            
            // Extrair o ID do projeto do onclick existente (se houver)
            const onclickAttr = botao.getAttribute('onclick') || '';
            const match = onclickAttr.match(/abrirModal\(['"](.+?)['"]\)/);
            
            if (match && match[1]) {
                const projetoId = match[1];
                
                // Remover o atributo onclick existente
                botao.removeAttribute('onclick');
                
                // Adicionar evento de clique com o método mais seguro
                botao.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.abrirModal(projetoId);
                });
                
                // Marcar o botão como configurado
                botao.setAttribute('data-evento-configurado', 'true');
                botao.setAttribute('data-projeto-id', projetoId);
                
                console.log(`ModaisGerenciador: Botão configurado para projeto ID: ${projetoId}`);
            } else {
                console.warn('ModaisGerenciador: Botão sem ID de projeto identificável', botao);
            }
        });
    }

    /**
     * Abre o modal de um projeto
     * @param {string} projetoId - ID do projeto
     */
    abrirModal(projetoId) {
        console.log(`ModaisGerenciador: Tentando abrir modal do projeto ${projetoId}`);
        
        const modal = document.getElementById(`projeto-modal-${projetoId}`);
        
        if (!modal) {
            console.error(`ModaisGerenciador: Modal não encontrado para projeto ID: ${projetoId}`);
            return;
        }
        
        // Fechar modal anterior se estiver aberto
        if (this.modalAtivo) {
            const modalAnterior = document.getElementById(this.modalAtivo);
            if (modalAnterior) {
                modalAnterior.classList.remove('active');
                modalAnterior.setAttribute('aria-hidden', 'true');
            }
        }
        
        // Abrir novo modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        this.modalAtivo = `projeto-modal-${projetoId}`;
        
        // Impedir scroll na página
        document.body.style.overflow = 'hidden';
        
        // Focar no botão de fechar para melhor acessibilidade
        setTimeout(() => {
            const botaoFechar = modal.querySelector('.close-modal');
            if (botaoFechar) botaoFechar.focus();
        }, 100);
        
        console.log(`ModaisGerenciador: Modal aberto para projeto ID: ${projetoId}`);
    }

    /**
     * Fecha o modal de um projeto
     * @param {string} projetoId - ID do projeto
     */
    fecharModal(projetoId) {
        console.log(`ModaisGerenciador: Fechando modal do projeto ${projetoId}`);
        
        const modal = document.getElementById(`projeto-modal-${projetoId}`);
        
        if (!modal) {
            console.error(`ModaisGerenciador: Modal não encontrado para fechamento: ${projetoId}`);
            return;
        }
        
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        this.modalAtivo = null;
        
        // Restaurar scroll da página
        document.body.style.overflow = '';
        
        console.log(`ModaisGerenciador: Modal fechado para projeto ID: ${projetoId}`);
    }

    /**
     * Troca a imagem principal no modal de um projeto
     * @param {string} projetoId - ID do projeto
     * @param {string} imagemSrc - URL da nova imagem principal
     */
    trocarImagemPrincipal(projetoId, imagemSrc) {
        console.log(`ModaisGerenciador: Trocando imagem principal do projeto ${projetoId}`);
        
        const imagemPrincipal = document.getElementById(`principal-img-${projetoId}`);
        
        if (!imagemPrincipal) {
            console.error(`ModaisGerenciador: Imagem principal não encontrada para projeto ID: ${projetoId}`);
            return;
        }
        
        // Trocar a imagem principal
        imagemPrincipal.src = imagemSrc;
        
        // Atualizar estado ativo nas miniaturas
        const thumbnails = document.querySelectorAll(`#projeto-modal-${projetoId} .thumbnail`);
        thumbnails.forEach(thumb => {
            thumb.classList.toggle('active', thumb.src === imagemSrc);
        });
        
        console.log(`ModaisGerenciador: Imagem principal trocada para: ${imagemSrc}`);
    }

    /**
     * Obtém os projetos em destaque mais recentes
     * @param {number} quantidade - Quantidade de projetos a retornar
     * @returns {Array} Projetos em destaque
     */
    obterProjetosDestaque(quantidade = 6) {
        if (!this.projetosData) return [];
        
        // Filtrar apenas projetos marcados como destaque
        const projetosDestaque = this.projetosData.filter(projeto => projeto.destaque === true);
        
        // Limitar à quantidade especificada
        return projetosDestaque.slice(0, quantidade);
    }
}

// Criar instância global do gerenciador
const modaisGerenciador = new ModaisGerenciador();

// Inicializar o gerenciador quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado - inicializando gerenciador de modais');
    
    // Pequeno delay para garantir que outros scripts foram carregados
    setTimeout(() => {
        modaisGerenciador.inicializar();
    }, 100);
});