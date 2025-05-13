// Menu Mobile Toggle e Inicialização de Carrossel
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth Scrolling para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Fechar menu mobile caso esteja aberto
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });
    
    // Implementação do carrossel para serviços
    initCarousel('.services-carousel', '.service-card');
    
    // Verificar se modaisGerenciador está disponível
    if (typeof modaisGerenciador !== 'undefined') {
        // Esperar pelos dados de projetos carregados para carregar o carrossel de projetos dinamicamente
        document.addEventListener('projetosDadosCarregados', () => {
            console.log('main.js: Evento de dados carregados recebido, inicializando carrossel de projetos');
            loadProjectsCarousel();
        }, { once: true });
        
        // Iniciar o carregamento de dados
        setTimeout(() => {
            if (typeof modaisGerenciador.inicializar === 'function') {
                modaisGerenciador.inicializar();
            }
        }, 100);
    } else {
        // Fallback para inicialização estática se o gerenciador de modais não estiver disponível
        console.log('main.js: modaisGerenciador não encontrado, usando carrossel estático');
        initCarousel('.projects-carousel', '.project-card');
    }
    
    // Fazer links completos para os cards "ver mais"
    document.querySelectorAll('.service-card.see-more, .project-card.see-more').forEach(card => {
        const link = card.querySelector('.full-card-link');
        if (link) {
            card.addEventListener('click', () => {
                window.location.href = link.getAttribute('href');
            });
        }
    });
});

// Função para carregar e ordenar os projetos do carrossel dinamicamente
function loadProjectsCarousel() {
    const projectsCarousel = document.querySelector('.projects-carousel .carousel-inner');
    
    if (!projectsCarousel) {
        console.log('main.js: Container do carrossel de projetos não encontrado');
        return;
    }
    
    // Verificar se os dados estão disponíveis
    if (!modaisGerenciador.projetosData || !Array.isArray(modaisGerenciador.projetosData)) {
        console.log('main.js: Dados de projetos não disponíveis');
        // Inicializar o carrossel com os dados estáticos existentes
        initCarousel('.projects-carousel', '.project-card');
        return;
    }
    
    // Limitar a quantidade de projetos a exibir no carrossel
    const maxProjetos = 6;
    
    // Copiar os dados para não modificar o original
    const projetos = [...modaisGerenciador.projetosData];
    
    // Logar o estado inicial dos projetos para diagnóstico
    console.log('main.js: Projetos antes da ordenação:');
    projetos.forEach(projeto => {
        console.log(`${projeto.titulo} - Data: ${projeto.dataCriacao || 'Sem data'}`);
    });
    
    // Ordenar projetos por data (mais recentes primeiro)
    projetos.sort((a, b) => {
        const dataA = a.dataCriacao ? new Date(a.dataCriacao) : null;
        const dataB = b.dataCriacao ? new Date(b.dataCriacao) : null;
        
        if (dataA && dataB && !isNaN(dataA) && !isNaN(dataB)) {
            return dataB - dataA;
        }
        if (dataA && !isNaN(dataA)) return -1;
        if (dataB && !isNaN(dataB)) return 1;
        return 0;
    });
    
    // Logar o resultado da ordenação
    console.log('main.js: Projetos após ordenação:');
    projetos.forEach((projeto, index) => {
        console.log(`${index + 1}. ${projeto.titulo} - Data: ${projeto.dataCriacao || 'Sem data'}`);
    });
    
    // Filtrar apenas projetos destacados
    const projetosDestaque = projetos.filter(projeto => projeto.destaque === true);
    
    // Limitar à quantidade máxima
    const projetosExibir = projetosDestaque.slice(0, maxProjetos);
    
    console.log(`main.js: Exibindo ${projetosExibir.length} projetos mais recentes`);
    
    // Limpar o conteúdo atual do carrossel
    projectsCarousel.innerHTML = '';
    
    // Adicionar projetos ao carrossel
    projetosExibir.forEach(projeto => {
        // Formatação da data para exibição
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
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${projeto.imagem}" alt="${projeto.titulo}">
                <div class="project-overlay">
                    <button class="view-project-btn" onclick="modaisGerenciador.abrirModal('${projeto.id}')">Ver Projeto</button>
                </div>
            </div>
            <div class="project-info">
                <h3>${projeto.titulo}</h3>
                <p>${projeto.descricao}</p>
                ${dataFormatada ? `<span class="project-date">Publicado em: ${dataFormatada}</span>` : ''}
            </div>
        `;
        
        projectsCarousel.appendChild(projectCard);
    });
    
    // Inicializar o carrossel com os novos dados
    initCarousel('.projects-carousel', '.project-card');
    
    console.log('main.js: Carrossel de projetos inicializado com dados ordenados');
}

// Função para inicializar os carrosséis
function initCarousel(carouselSelector, slideSelector) {
    const carousel = document.querySelector(carouselSelector);
    if (!carousel) return;
    
    const slidesContainer = carousel.querySelector('.carousel-inner');
    const slides = carousel.querySelectorAll(slideSelector);
    const totalSlides = slides.length;
    if (totalSlides <= 1) return;
    
    // Determinar quantos slides mostrar por vez com base no tamanho da tela
    function getSlidesPerView() {
        if (window.innerWidth >= 992) {
            return 3; // Desktop: 3 cards
        } else if (window.innerWidth >= 768) {
            return 2; // Tablet: 2 cards
        } else {
            return 1; // Mobile: 1 card
        }
    }
    
    let slidesPerView = getSlidesPerView();
    let currentIndex = 0;
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    
    // Número total de "páginas" do carrossel
    function getTotalPages() {
        return Math.max(1, Math.ceil(totalSlides / slidesPerView));
    }
    
    // Criar indicadores (dots)
    function createDots() {
        if (!dotsContainer) return;
        
        // Limpar dots existentes
        dotsContainer.innerHTML = '';
        
        // Criar novo conjunto de dots baseado no número de páginas
        const totalPages = getTotalPages();
        
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('span');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
    }
    
    createDots();
    
    // Configurar botões de navegação
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });
    }
    
// Função para atualizar o carrossel
function updateCarousel() {
    // Recalcular slidesPerView em caso de redimensionamento
    slidesPerView = getSlidesPerView();
    
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 20; // O gap definido no CSS
    
    // Calcular o deslocamento baseado no índice atual e slidesPerView
    const totalPages = getTotalPages();
    const maxOffset = (totalSlides - slidesPerView) * (slideWidth + gap);
    
    // Converter índice de página para posição de slide
    const slideIndex = currentIndex * slidesPerView;
    let offset = -Math.min(slideIndex * (slideWidth + gap), maxOffset);
    
    // Aplicar a transformação
    slidesContainer.style.transform = `translateX(${offset}px)`;
    
    // Atualizar dots
    if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Ativar/desativar botões dependendo da posição
    if (prevBtn) {
        prevBtn.classList.toggle('disabled', currentIndex === 0);
    }
    
    if (nextBtn) {
        nextBtn.classList.toggle('disabled', currentIndex >= getTotalPages() - 1);
    }
}
    
// Navegar para um slide específico
function goToSlide(index) {
    const maxIndex = getTotalPages() - 1;
    
    if (index < 0) {
        currentIndex = 0;
    } else if (index > maxIndex) {
        currentIndex = maxIndex;
    } else {
        currentIndex = index;
    }
    
    updateCarousel();
}
    
    // Configurar autoplay (opcional)
    let autoplayInterval;
    
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % getTotalPages();
            goToSlide(nextIndex);
        }, 5000); // Muda de slide a cada 5 segundos
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    // Iniciar autoplay
    startAutoplay();
    
    // Pausar autoplay ao passar o mouse sobre o carrossel
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    
    // Swipe para dispositivos móveis (implementação simples)
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            goToSlide(currentIndex + 1); // Swipe para esquerda - próximo slide
        } else if (touchEndX > touchStartX + swipeThreshold) {
            goToSlide(currentIndex - 1); // Swipe para direita - slide anterior
        }
    }
    
    // Inicialização
    updateCarousel();
    
    // Ajustar carrossel ao redimensionar a janela
    window.addEventListener('resize', () => {
        const oldSlidesPerView = slidesPerView;
        slidesPerView = getSlidesPerView();
        
        // Se o número de slides por visualização mudou, recriar os dots
        if (oldSlidesPerView !== slidesPerView) {
            createDots();
            // Ajustar o índice atual para evitar posições inválidas
            currentIndex = Math.min(currentIndex, getTotalPages() - 1);
        }
        
        updateCarousel();
    });
}

