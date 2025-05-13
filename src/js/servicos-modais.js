/**
 * servicos-modais-corrigido.js
 * Sistema aprimorado de modais para exibição de detalhes dos serviços oferecidos
 * Integrado com os sistemas existentes de modais de projetos
 * Completamente responsivo para todos os dispositivos
 */

class ServicosModaisGerenciador {
    constructor() {
        this.modaisContainer = null;
        this.servicosData = null;
        this.modalAtivo = null;
        this.eventosInicializados = false;
        this.ultimoFocoAnterior = null;
        this.suporteTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.cardsConfigurados = false;
        
        // Dados dos serviços - mantidos do original
        this.servicosData = [
            {
                id: "web-design",
                titulo: "Web Design",
                descricao: "Criação de layouts modernos, responsivos e otimizados para conversão.",
                descricaoCompleta: "Desenvolvimento de interfaces web modernas e funcionais, adaptadas para todos os dispositivos. Nosso processo de design é centrado no usuário, priorizando experiências intuitivas e agradáveis que incentivam a conversão e engajamento.",
                icone: "fas fa-palette",
                valorBase: "A partir de R$ 1.800,00",
                caracteristicas: [
                    "Layouts responsivos e modernos",
                    "Design centrado no usuário (UX/UI)",
                    "Otimizado para conversão",
                    "Compatível com todos os dispositivos",
                    "Adaptado para sua identidade visual"
                ],
                tempoEstimado: "2 a 4 semanas",
                inclui: [
                    "Pesquisa e análise de concorrentes",
                    "Wireframes e protótipos interativos",
                    "Design de até 5 páginas principais",
                    "2 rodadas de revisões",
                    "Arquivos fonte em formato editável"
                ]
            },
            {
                id: "desenvolvimento",
                titulo: "Desenvolvimento",
                descricao: "Implementação de sites e aplicações web com as melhores tecnologias do mercado.",
                descricaoCompleta: "Transformamos designs em código funcional utilizando as tecnologias mais modernas do mercado. Nosso desenvolvimento prioriza performance, segurança e boas práticas, garantindo sites rápidos e escaláveis.",
                icone: "fas fa-code",
                valorBase: "A partir de R$ 3.500,00",
                caracteristicas: [
                    "Código limpo e bem estruturado",
                    "Performance otimizada (Core Web Vitals)",
                    "Integração com sistemas existentes",
                    "Compatível com todos os navegadores",
                    "Implantação e configuração de hospedagem"
                ],
                tempoEstimado: "3 a 8 semanas",
                inclui: [
                    "Desenvolvimento front-end completo",
                    "Implementação responsiva",
                    "Otimização de imagens e assets",
                    "Testes em múltiplos dispositivos",
                    "Configuração de domínio e hospedagem"
                ]
            },
            {
                id: "seo-marketing",
                titulo: "SEO & Marketing",
                descricao: "Otimização para motores de busca e estratégias para aumentar sua presença online.",
                descricaoCompleta: "Aumente sua visibilidade online com estratégias de SEO e marketing digital. Trabalhamos para que seu site seja encontrado pelo público-alvo, utilizando técnicas comprovadas de otimização e análise de dados.",
                icone: "fas fa-chart-line",
                valorBase: "A partir de R$ 1.200,00/mês",
                caracteristicas: [
                    "Análise técnica completa do site",
                    "Otimização de palavras-chave",
                    "Criação de conteúdo estratégico",
                    "Link building e autoridade de domínio",
                    "Relatórios mensais de desempenho"
                ],
                tempoEstimado: "Contrato mínimo de 3 meses",
                inclui: [
                    "Auditoria SEO inicial",
                    "Otimização de meta tags e URLs",
                    "Configuração de Google Analytics e Search Console",
                    "Otimização de velocidade e Core Web Vitals",
                    "Monitoramento de rankings e tráfego"
                ]
            },
            {
                id: "ux-ui-design",
                titulo: "UX/UI Design",
                descricao: "Criação de interfaces intuitivas e experiências de usuário que convertem visitantes em clientes.",
                descricaoCompleta: "Desenvolvemos interfaces que não apenas são bonitas, mas também funcionais e intuitivas. Nosso foco está em criar experiências que facilitam a jornada do usuário e aumentam as taxas de conversão através de design estratégico.",
                icone: "fas fa-bezier-curve",
                valorBase: "A partir de R$ 2.500,00",
                caracteristicas: [
                    "Pesquisa de usuários e personas",
                    "Mapeamento de jornada do cliente",
                    "Arquitetura de informação",
                    "Prototipagem interativa",
                    "Testes de usabilidade"
                ],
                tempoEstimado: "3 a 5 semanas",
                inclui: [
                    "Workshop de definição de objetivos",
                    "Mapas de fluxo de usuário",
                    "Wireframes de baixa e alta fidelidade",
                    "Protótipos interativos em Figma",
                    "Documentação de design system"
                ]
            },
            {
                id: "manutencao-web",
                titulo: "Manutenção Web",
                descricao: "Serviços contínuos para manter seu site seguro, atualizado e funcionando perfeitamente.",
                descricaoCompleta: "Mantemos seu site funcionando perfeitamente com nossos serviços de manutenção contínua. Garantimos atualizações de segurança, backups regulares, monitoramento de performance e suporte técnico para resolver problemas rapidamente.",
                icone: "fas fa-tools",
                valorBase: "A partir de R$ 800,00/mês",
                caracteristicas: [
                    "Atualizações de segurança",
                    "Backups regulares",
                    "Monitoramento de uptime",
                    "Suporte técnico",
                    "Pequenas modificações e ajustes"
                ],
                tempoEstimado: "Contrato mensal ou anual",
                inclui: [
                    "Backups semanais",
                    "Atualizações de CMS e plugins",
                    "Monitoramento 24/7",
                    "Até 5 horas mensais de ajustes",
                    "Relatórios mensais de performance"
                ]
            }
        ];
    }

    // Inicializa o gerenciador quando o DOM estiver pronto
    inicializar() {
        console.log('ServicosModais: Inicializando gerenciador de modais de serviços');
        
        // Verificar se já foi inicializado para evitar duplicações
        if (window.servicosModaisInicializado) {
            console.warn('ServicosModais: Sistema já inicializado anteriormente');
            return;
        }
        
        this.modaisContainer = document.getElementById('modais-container');
        if (!this.modaisContainer) {
            console.log('ServicosModais: Container de modais não encontrado, criando novo');
            this.modaisContainer = document.createElement('div');
            this.modaisContainer.id = 'modais-container';
            document.body.appendChild(this.modaisContainer);
        }
        
        // Renderizar modais apenas uma vez
        this.renderizarModais();
        
        // Inicializar eventos apenas uma vez
        if (!this.eventosInicializados) {
            this.inicializarEventos();
        }
        
        // Aplicar responsividade
        this.configurarResponsividade();
        
        // Tentar configurar botões
        this.configurarBotoesServicos();
        
        // Marcar como inicializado globalmente
        window.servicosModaisInicializado = true;
        
        console.log('ServicosModais: Inicialização completa');
    }

    // Renderiza as modais de serviços
    renderizarModais() {
        if (!this.servicosData || !this.modaisContainer) {
            console.warn('ServicosModais: Dados de serviços ou container não disponíveis');
            return;
        }

        // Verificar se os modais já foram renderizados
        const modaisExistentes = this.modaisContainer.querySelectorAll('[data-servico-id]');
        if (modaisExistentes.length > 0) {
            console.log('ServicosModais: Modais já foram renderizados anteriormente');
            return;
        }

        console.log(`ServicosModais: Renderizando ${this.servicosData.length} modais de serviços`);

        const fragmento = document.createDocumentFragment();

        this.servicosData.forEach(servico => {
            const modal = this.criarModalServico(servico);
            fragmento.appendChild(modal);
        });

        // Adicionar os modais ao container sem remover os existentes (projetos)
        this.modaisContainer.appendChild(fragmento);

        console.log('ServicosModais: Modais de serviços renderizados com sucesso');
    }

    // Cria o HTML para um modal de serviço
    criarModalServico(servico) {
        const modal = document.createElement('div');
        modal.id = `modal-servico-${servico.id}`;
        modal.className = 'service-modal';
        modal.setAttribute('data-servico-id', servico.id);
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', `modal-titulo-${servico.id}`);
        modal.setAttribute('aria-hidden', 'true');

        // Lista de características
        let caracteristicasHTML = '';
        servico.caracteristicas.forEach(item => {
            caracteristicasHTML += `<li><i class="fas fa-check" aria-hidden="true"></i> ${item}</li>`;
        });

        // Lista de itens inclusos
        let incluiHTML = '';
        servico.inclui.forEach(item => {
            incluiHTML += `<li><i class="fas fa-check-circle" aria-hidden="true"></i> ${item}</li>`;
        });

        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2 id="modal-titulo-${servico.id}"><i class="${servico.icone}" aria-hidden="true"></i> ${servico.titulo}</h2>
                    <button class="close-modal" aria-label="Fechar modal">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="service-overview">
                        <div class="service-description">
                            <h3>Visão Geral</h3>
                            <p>${servico.descricaoCompleta}</p>
                        </div>
                        <div class="service-pricing">
                            <div class="pricing-box">
                                <h4>Investimento</h4>
                                <p class="price">${servico.valorBase}</p>
                                <p class="time-estimate"><i class="far fa-clock" aria-hidden="true"></i> ${servico.tempoEstimado}</p>
                                <a href="#contact" class="cta-button service-cta">
                                    Solicitar Orçamento <i class="fas fa-arrow-right" aria-hidden="true"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="service-details">
                        <div class="features-section">
                            <h3>Características</h3>
                            <ul class="features-list">
                                ${caracteristicasHTML}
                            </ul>
                        </div>
                        <div class="includes-section">
                            <h3>O que está incluso</h3>
                            <ul class="includes-list">
                                ${incluiHTML}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar handlers de evento diretamente aos elementos
        const btnFechar = modal.querySelector('.close-modal');
        if (btnFechar) {
            btnFechar.addEventListener('click', () => {
                this.fecharModal(servico.id);
            });
        }
        
        const btnCta = modal.querySelector('.service-cta');
        if (btnCta) {
            btnCta.addEventListener('click', () => {
                this.fecharModal(servico.id);
            });
        }

        return modal;
    }

    // Configura os botões "Saiba mais" nos cards de serviços
    configurarBotoesServicos() {
        // Evitar configurar múltiplas vezes
        if (this.cardsConfigurados) {
            console.log('ServicosModais: Cards já configurados anteriormente');
            return;
        }
        
        console.log('ServicosModais: Configurando botões de serviços');
        
        // Selecionar todos os cards de serviço
        const cardsServicos = document.querySelectorAll('.service-card');
        
        if (cardsServicos.length === 0) {
            console.warn('ServicosModais: Nenhum card de serviço encontrado no DOM');
            // Tentar novamente após um delay maior se os cards ainda não foram renderizados
            setTimeout(() => {
                if (!this.cardsConfigurados) {
                    this.configurarBotoesServicos();
                }
            }, 1000);
            return;
        }
        
        const self = this; // Salvar referência para uso dentro dos callbacks
        
        cardsServicos.forEach(card => {
            // Verificar se o card já foi configurado
            if (card.hasAttribute('data-configurado')) {
                return;
            }
            
            const titulo = card.querySelector('h3')?.textContent.trim();
            if (!titulo) return;
            
            // Encontrar o serviço correspondente
            const servico = this.servicosData.find(s => s.titulo === titulo);
            if (!servico) {
                console.warn(`ServicosModais: Serviço não encontrado para o título: ${titulo}`);
                return;
            }
            
            // Configurar o card como clicável de forma segura sem substituí-lo
            card.style.cursor = 'pointer';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Ver detalhes de ${servico.titulo}`);
            card.setAttribute('data-servico-id', servico.id);
            card.setAttribute('data-configurado', 'true');
            
            // Adicionar handler de clique diretamente ao card, usando once: false para garantir
            card.addEventListener('click', function(e) {
                // Não disparar se o clique foi no link (que já tem seu próprio handler)
                if (e.target.tagName !== 'A' && !e.target.closest('a')) {
                    const servicoId = this.getAttribute('data-servico-id');
                    if (servicoId) {
                        self.abrirModal(servicoId);
                    }
                }
            });
            
            // Suporte a navegação por teclado
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const servicoId = this.getAttribute('data-servico-id');
                    if (servicoId) {
                        self.abrirModal(servicoId);
                    }
                }
            });
            
            // Encontrar e configurar o link "Saiba mais" dentro do card
            const links = card.querySelectorAll('a');
            links.forEach(link => {
                // Verificar se o link já foi configurado
                if (link.hasAttribute('data-configurado')) {
                    return;
                }
                
                // Configurar o link de forma segura sem substituí-lo
                link.setAttribute('href', 'javascript:void(0)');
                link.setAttribute('data-servico-id', servico.id);
                link.setAttribute('aria-label', `Saiba mais sobre ${servico.titulo}`);
                link.setAttribute('data-configurado', 'true');
                
                // Adicionar event listener diretamente
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const servicoId = this.getAttribute('data-servico-id');
                    if (servicoId) {
                        self.abrirModal(servicoId);
                    }
                });
            });
        });
        
        this.cardsConfigurados = true;
        console.log('ServicosModais: Botões de serviços configurados com sucesso');
    }

    // Abre um modal de serviço
    abrirModal(servicoId) {
        console.log(`ServicosModais: Tentando abrir o modal para o serviço ${servicoId}`);
        const modal = document.getElementById(`modal-servico-${servicoId}`);
        
        if (!modal) {
            console.error(`Modal não encontrado para o serviço ID: ${servicoId}`);
            return;
        }
        
        // Guardar referência ao elemento que estava em foco antes de abrir o modal
        this.ultimoFocoAnterior = document.activeElement;
        
        // Fechar modal anterior se estiver aberto
        if (this.modalAtivo) {
            const modalAnterior = document.getElementById(this.modalAtivo);
            if (modalAnterior) {
                modalAnterior.classList.remove('active');
                modalAnterior.setAttribute('aria-hidden', 'true');
            }
        }
        
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        this.modalAtivo = `modal-servico-${servicoId}`;

        // Impedir scroll na página
        document.body.style.overflow = 'hidden';
        
        // Adicionar classe específica para dispositivos móveis
        if (window.innerWidth <= 576) {
            modal.classList.add('mobile-view');
        }

        // Focar no botão de fechar para melhor acessibilidade
        setTimeout(() => {
            const botaoFechar = modal.querySelector('.close-modal');
            if (botaoFechar) botaoFechar.focus();
        }, 100);

        // Gerenciar foco para acessibilidade (armadilha de foco)
        this.configurarArmadilhaFoco(modal);

        console.log(`ServicosModais: Modal aberto para serviço ID: ${servicoId}`);
    }

    // Configura armadilha de foco para acessibilidade
    configurarArmadilhaFoco(modal) {
        // Remover handlers anteriores para evitar duplicação
        modal.removeEventListener('keydown', this._focusTrapHandler);
        
        const elementosFocaveis = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (elementosFocaveis.length === 0) return;
        
        const primeiroElemento = elementosFocaveis[0];
        const ultimoElemento = elementosFocaveis[elementosFocaveis.length - 1];
        
        // Criar um handler que podemos remover depois
        this._focusTrapHandler = function(e) {
            if (e.key === 'Tab') {
                // Se pressionar Shift+Tab no primeiro elemento, ir para o último
                if (e.shiftKey && document.activeElement === primeiroElemento) {
                    e.preventDefault();
                    ultimoElemento.focus();
                }
                // Se pressionar Tab no último elemento, ir para o primeiro
                else if (!e.shiftKey && document.activeElement === ultimoElemento) {
                    e.preventDefault();
                    primeiroElemento.focus();
                }
            }
        };
        
        modal.addEventListener('keydown', this._focusTrapHandler);
    }

    // Fecha um modal de serviço
    fecharModal(servicoId) {
        console.log(`ServicosModais: Fechando modal para serviço ID: ${servicoId}`);
        
        const modal = document.getElementById(`modal-servico-${servicoId}`);
        if (!modal) {
            console.error(`ServicosModais: Modal não encontrado para fechamento: ${servicoId}`);
            return;
        }
        
        modal.classList.remove('active', 'mobile-view', 'fullscreen');
        modal.setAttribute('aria-hidden', 'true');
        this.modalAtivo = null;

        // Restaurar scroll da página
        document.body.style.overflow = '';
        
        // Devolver foco ao elemento que estava ativo antes de abrir o modal
        if (this.ultimoFocoAnterior && typeof this.ultimoFocoAnterior.focus === 'function') {
            setTimeout(() => {
                this.ultimoFocoAnterior.focus();
            }, 100);
        }
        
        console.log(`ServicosModais: Modal fechado para serviço ID: ${servicoId}`);
    }

    // Inicializa eventos globais para os modais
    inicializarEventos() {
        if (this.eventosInicializados) {
            console.log('ServicosModais: Eventos já inicializados');
            return;
        }

        console.log('ServicosModais: Inicializando eventos');
        
        // Salvar referência para uso dentro dos callbacks
        const self = this;

        // Fechar modal quando clicar fora do conteúdo
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('service-modal') && self.modalAtivo) {
                console.log('ServicosModais: Clique detectado fora do conteúdo modal');
                const servicoId = e.target.getAttribute('data-servico-id');
                if (servicoId) {
                    self.fecharModal(servicoId);
                }
            }
        });

        // Variáveis para eventos de toque
        let touchStartY = 0;
        
        // Eventos de toque para dispositivos móveis
        if (this.suporteTouch) {
            document.addEventListener('touchstart', function(e) {
                touchStartY = e.changedTouches[0].screenY;
            }, {passive: true});
            
            document.addEventListener('touchend', function(e) {
                if (!self.modalAtivo) return;
                
                const touchEndY = e.changedTouches[0].screenY;
                const diff = touchEndY - touchStartY;
                
                // Se arrastar para cima em modal mobile, expandir para tela cheia
                if (diff < -50) {
                    const modal = document.getElementById(self.modalAtivo);
                    if (modal) modal.classList.add('fullscreen');
                }
                
                // Se arrastar para baixo e estiver na parte superior, fechar
                if (diff > 100) {
                    const modal = document.getElementById(self.modalAtivo);
                    if (modal) {
                        const container = modal.querySelector('.modal-container');
                        if (container && container.scrollTop < 10) {
                            const servicoId = modal.getAttribute('data-servico-id');
                            if (servicoId) {
                                self.fecharModal(servicoId);
                            }
                        }
                    }
                }
            }, {passive: true});
        }

        // Fechar modal com tecla Esc
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && self.modalAtivo) {
                console.log('ServicosModais: Tecla Escape pressionada');
                const servicoId = self.modalAtivo.replace('modal-servico-', '');
                self.fecharModal(servicoId);
            }
        });

        // Atualizar a visualização dos modais quando a orientação do dispositivo mudar
        window.addEventListener('orientationchange', function() {
            self.ajustarModalAtivo();
        });

        // Atualizar a visualização dos modais quando o tamanho da tela mudar
        const resizeHandler = this.debounce(function() {
            self.ajustarModalAtivo();
        }, 250);
        
        window.addEventListener('resize', resizeHandler);

        this.eventosInicializados = true;
        console.log('ServicosModais: Eventos inicializados com sucesso');
    }
    
    // Configura comportamentos específicos para responsividade
    configurarResponsividade() {
        // Adicionar classe ao body para identificar suporte a touch
        if (this.suporteTouch) {
            document.body.classList.add('touch-device');
        }
        
        // Verificar se precisa aplicar layout mobile aos modais
        this.aplicarLayoutResponsivo();
        
        console.log('ServicosModais: Configurações de responsividade aplicadas');
    }
    
    // Aplica layout responsivo baseado no tamanho da tela
    aplicarLayoutResponsivo() {
        const modais = document.querySelectorAll('.service-modal');
        const isMobile = window.innerWidth <= 576;
        
        modais.forEach(modal => {
            if (isMobile) {
                modal.classList.add('mobile-layout');
            } else {
                modal.classList.remove('mobile-layout', 'fullscreen');
            }
        });
    }
    
    // Ajusta o modal ativo quando necessário (por exemplo, após mudança de orientação)
    ajustarModalAtivo() {
        if (!this.modalAtivo) return;
        
        const modal = document.getElementById(this.modalAtivo);
        if (!modal) return;
        
        const isMobile = window.innerWidth <= 576;
        
        if (isMobile) {
            modal.classList.add('mobile-view');
        } else {
            modal.classList.remove('mobile-view', 'fullscreen');
        }
        
        this.aplicarLayoutResponsivo();
    }
    
    // Utilitário: Função debounce para evitar múltiplas chamadas
    debounce(func, delay) {
        let timeoutId;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }
}

// Criar instância global
window.servicosModaisGerenciador = new ServicosModaisGerenciador();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('ServicosModais: Evento DOMContentLoaded detectado');
    
    // Verificar se outro script já está inicializando ou demorou para carregar
    let tentativas = 0;
    const maxTentativas = 5;
    
    const verificarDependencias = () => {
        // Verificar se os elementos necessários estão disponíveis
        const containerExiste = document.getElementById('modais-container');
        
        // Inicializar mesmo que os cards não existam ainda
        console.log(`ServicosModais: Inicializando após ${tentativas} tentativas`);
        window.servicosModaisGerenciador.inicializar();
        
        // Tentar configurar os cards novamente mais tarde, caso não estejam disponíveis
        if (!window.servicosModaisGerenciador.cardsConfigurados && tentativas < maxTentativas) {
            tentativas++;
            console.log(`ServicosModais: Agendando nova verificação de cards... Tentativa ${tentativas}`);
            setTimeout(verificarDependencias, 800);
        }
    };
    
    // Primeira verificação com delay para garantir que outros scripts foram carregados
    setTimeout(verificarDependencias, 300);
});