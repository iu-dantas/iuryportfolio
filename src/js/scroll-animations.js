/**
 * scroll-animations.js
 * Sistema de animações baseadas em scroll e interações
 * Otimizado para performance, acessibilidade e compatibilidade
 * @version 2.0.0
 */

(function() {
    /**
     * Configurações globais de animação
     */
    const config = {
      // Threshold para detectar elementos na viewport (0.75 = 75% do elemento visível)
      threshold: 0.15,
      
      // Intervalo para throttle de eventos de scroll em ms
      scrollThrottle: 100,
      
      // Tempo de debounce para eventos de redimensionamento em ms
      resizeDebounce: 150,
      
      // Se deve preferir Intersection Observer ao invés de eventos de scroll
      useIntersectionObserver: true,
      
      // Desabilitar animações conforme preferências do usuário
      respectReducedMotion: true,
      
      // Atraso base (em ms) para animações sequenciais
      baseDelay: 100,
      
      // Duração dos contadores numéricos em ms
      counterDuration: 2000,
      
      // Configurações de efeito de digitação
      typing: {
        initialDelay: 500,
        speed: 50,
        cursorFadeDelay: 3000
      }
    };
  
    /**
     * Estado global
     */
    let state = {
      animationsEnabled: true,
      elementsToAnimate: [],
      observer: null,
      supportsIntersectionObserver: 'IntersectionObserver' in window,
      scrollListener: null,
      resizeListener: null,
      animationsInitialized: false
    };
  
    /**
     * Inicialização principal
     */
    function init() {
      // Verificar preferências de movimento reduzido
      checkReducedMotionPreference();
      
      // Se as animações estiverem desativadas, adicionar classe ao body
      if (!state.animationsEnabled) {
        document.body.classList.add('reduced-motion');
        console.log('Animações: Movimento reduzido detectado, desativando animações');
      }
      
      // Coletar os elementos para animar
      collectAnimatableElements();
      
      // Inicializar animações baseadas em scroll
      initScrollAnimations();
      
      // Inicializar contadores
      initializeCounters();
      
      // Inicializar efeito de digitação
      initTypingEffect();
      
      // Inicializar animação de skill icons
      animateSkillIcons();
      
      // Melhorar feedback tátil em dispositivos touchscreen
      enhanceTouchFeedback();
      
      // Marcar como inicializado
      state.animationsInitialized = true;
      
      console.log('Animações: Inicialização completa');
    }
  
    /**
     * Verifica preferências de movimento reduzido do usuário
     */
    function checkReducedMotionPreference() {
      // Verificar preferência do sistema
      if (config.respectReducedMotion && 
          window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        state.animationsEnabled = false;
      }
      
      // Verificar parâmetros da URL (para testes)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('animations') === 'false' || urlParams.get('reduced-motion') === 'true') {
        state.animationsEnabled = false;
      }
      
      // Adicionar listener para mudanças na preferência
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        state.animationsEnabled = !e.matches;
        
        // Atualizar UI
        if (e.matches) {
          document.body.classList.add('reduced-motion');
        } else {
          document.body.classList.remove('reduced-motion');
        }
      });
    }
  
    /**
     * Coleta todos os elementos animáveis
     */
    function collectAnimatableElements() {
      state.elementsToAnimate = [
        ...document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up')
      ];
      
      console.log(`Animações: ${state.elementsToAnimate.length} elementos para animar encontrados`);
    }
  
    /**
     * Inicializa animações baseadas em scroll
     */
    function initScrollAnimations() {
      // Para browsers modernos, usar Intersection Observer API
      if (config.useIntersectionObserver && state.supportsIntersectionObserver) {
        initWithIntersectionObserver();
      } else {
        // Fallback para eventos de scroll
        initWithScrollEvents();
      }
    }
  
    /**
     * Inicializa animações usando Intersection Observer
     */
    function initWithIntersectionObserver() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: config.threshold
      };
      
      // Criar observer
      state.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // Se o elemento estiver na viewport
          if (entry.isIntersecting) {
            // Adicionar classe active para animar
            entry.target.classList.add('active');
            
            // Anunciar para leitores de tela (apenas para elementos importantes)
            if (entry.target.hasAttribute('data-announce')) {
              announceElement(entry.target);
            }
            
            // Parar de observar elemento
            state.observer.unobserve(entry.target);
          }
        });
      }, options);
      
      // Observar todos os elementos animáveis
      state.elementsToAnimate.forEach(element => {
        state.observer.observe(element);
      });
      
      console.log('Animações: Usando Intersection Observer para animações de scroll');
    }
  
    /**
     * Inicializa animações usando eventos de scroll (fallback)
     */
    function initWithScrollEvents() {
      // Função para verificar se um elemento está visível na viewport
      function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
          rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 - config.threshold) &&
          rect.bottom >= 0
        );
      }
      
      // Função para verificar elementos visíveis
      function checkForVisibleElements() {
        state.elementsToAnimate.forEach(element => {
          if (isElementInViewport(element) && !element.classList.contains('active')) {
            element.classList.add('active');
            
            // Anunciar para leitores de tela (apenas para elementos importantes)
            if (element.hasAttribute('data-announce')) {
              announceElement(element);
            }
            
            // Remover elemento da lista para melhorar performance
            state.elementsToAnimate = state.elementsToAnimate.filter(el => el !== element);
          }
        });
      }
      
      // Aplicar throttle aos eventos de scroll para melhorar performance
      state.scrollListener = throttle(checkForVisibleElements, config.scrollThrottle);
      
      // Aplicar debounce aos eventos de redimensionamento
      state.resizeListener = debounce(() => {
        // Recoletar elementos que ainda não foram animados
        collectAnimatableElements();
        checkForVisibleElements();
      }, config.resizeDebounce);
      
      // Verificar elementos inicialmente visíveis
      checkForVisibleElements();
      
      // Adicionar listeners
      window.addEventListener('scroll', state.scrollListener);
      window.addEventListener('resize', state.resizeListener);
      
      console.log('Animações: Usando eventos de scroll para animações (fallback)');
    }
  
    /**
     * Anuncia um elemento para leitores de tela
     * @param {HTMLElement} element - Elemento a ser anunciado
     */
    function announceElement(element) {
      const announceText = element.getAttribute('data-announce') || 
                          element.getAttribute('aria-label') || 
                          element.textContent.substring(0, 50);
      
      // Criar região live temporária
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.className = 'sr-only';
      liveRegion.textContent = announceText;
      
      document.body.appendChild(liveRegion);
      
      // Remover após 3 segundos
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 3000);
    }
  
    /**
     * Inicializa contadores numéricos
     */
    function initializeCounters() {
      const counterElements = document.querySelectorAll('.counter-value');
      
      if (counterElements.length === 0) return;
      
      console.log(`Animações: Inicializando ${counterElements.length} contadores`);
      
      counterElements.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'), 10);
        if (isNaN(target)) return;
        
        // Função para animar o contador
        function animateCounter(element, targetValue) {
          const duration = config.counterDuration;
          const startTime = performance.now();
          let startValue = 0;
          
          function updateCounter(currentTime) {
            // Calcular progresso (0 a 1)
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Usar easing para movimento mais natural
            const easedProgress = easeOutQuad(progress);
            
            // Calcular valor atual
            const currentValue = Math.round(startValue + easedProgress * (targetValue - startValue));
            
            // Atualizar elemento
            element.textContent = formatNumber(currentValue);
            
            // Continuar animação se não estiver completa
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          }
          
          // Iniciar animação
          requestAnimationFrame(updateCounter);
        }
        
        // Iniciar animação apenas quando o elemento estiver visível
        if (state.supportsIntersectionObserver) {
          const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                animateCounter(counter, target);
                counterObserver.unobserve(entry.target);
              }
            });
          }, { threshold: 0.5 });
          
          counterObserver.observe(counter);
        } else {
          // Fallback para navegadores sem suporte a IntersectionObserver
          // Animação começa imediatamente (não ideal)
          animateCounter(counter, target);
        }
      });
    }
  
    /**
     * Inicializa efeito de digitação para o título da hero
     */
    function initTypingEffect() {
      const element = document.querySelector('.hero-typing-text');
      if (!element || !state.animationsEnabled) return;
      
      // Armazenar o texto original
      const originalText = element.textContent.trim();
      element.textContent = '';
      
      // Criar cursor
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      element.appendChild(cursor);
      
      let i = 0;
      const speed = config.typing.speed;
      
      // Função para digitar caractere por caractere
      function type() {
        if (i < originalText.length) {
          // Inserir o texto antes do cursor
          element.insertBefore(document.createTextNode(originalText.charAt(i)), cursor);
          i++;
          setTimeout(type, speed);
        } else {
          // Animação completa, fazer o cursor piscar por alguns segundos e então remover
          setTimeout(() => {
            cursor.style.animation = 'none';
            cursor.style.opacity = '0';
            
            // Remover o cursor após fade out
            setTimeout(() => {
              if (cursor.parentNode) {
                cursor.parentNode.removeChild(cursor);
              }
            }, 500);
          }, config.typing.cursorFadeDelay);
        }
      }
      
      // Pequeno atraso antes de iniciar a digitação
      setTimeout(type, config.typing.initialDelay);
    }
  
    /**
     * Anima os ícones de habilidades com delays sequenciais
     */
    function animateSkillIcons() {
      if (!state.animationsEnabled) return;
      
      const skillIcons = document.querySelectorAll('.skill-icon');
      if (skillIcons.length === 0) return;
      
      skillIcons.forEach((icon, index) => {
        // Adicionar delay crescente para cada ícone
        icon.style.animationDelay = `${index * config.baseDelay}ms`;
        icon.classList.add('animate-scale-in');
        
        // Adicionar efeito hover personalizado
        icon.addEventListener('mouseenter', () => {
          if (state.animationsEnabled) {
            icon.classList.add('animate-pulse');
          }
        });
        
        icon.addEventListener('mouseleave', () => {
          icon.classList.remove('animate-pulse');
        });
        
        // Adicionar anunciação para acessibilidade
        icon.addEventListener('focus', () => {
          const skillName = icon.getAttribute('title') || icon.querySelector('.sr-only')?.textContent;
          if (skillName) {
            announceElement(icon);
          }
        });
      });
    }
  
    /**
     * Melhora feedback tátil em dispositivos touchscreen
     */
    function enhanceTouchFeedback() {
      if (!state.animationsEnabled) return;
      
      const touchableElements = document.querySelectorAll('button, .cta-button, .view-project-btn, .project-card');
      
      touchableElements.forEach(element => {
        // Touch start - escalar
        element.addEventListener('touchstart', () => {
          element.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        // Touch end - restaurar
        element.addEventListener('touchend', () => {
          element.style.transform = 'scale(1)';
          setTimeout(() => {
            element.style.transform = '';
          }, 300);
        }, { passive: true });
      });
    }
  
    /**
     * Utility: Função de throttle para limitar a frequência de execução
     * @param {Function} func - Função a ser limitada
     * @param {number} limit - Limite de tempo em ms
     * @returns {Function} Função com throttle aplicado
     */
    function throttle(func, limit) {
      let inThrottle;
      
      return function() {
        const args = arguments;
        const context = this;
        
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  
    /**
     * Utility: Função de debounce para atrasar execução
     * @param {Function} func - Função a ser atrasada
     * @param {number} wait - Tempo de espera em ms
     * @returns {Function} Função com debounce aplicado
     */
    function debounce(func, wait) {
      let timeout;
      
      return function() {
        const context = this;
        const args = arguments;
        
        clearTimeout(timeout);
        
        timeout = setTimeout(() => {
          func.apply(context, args);
        }, wait);
      };
    }
  
    /**
     * Utility: Função de easing para animações mais suaves
     * @param {number} t - Progresso (0 a 1)
     * @returns {number} Valor com easing aplicado
     */
    function easeOutQuad(t) {
      return t * (2 - t);
    }
  
    /**
     * Utility: Formata número com separadores
     * @param {number} num - Número a ser formatado
     * @returns {string} Número formatado
     */
    function formatNumber(num) {
      return new Intl.NumberFormat().format(num);
    }
  
    /**
     * Inicializa tudo quando o DOM estiver pronto
     */
    document.addEventListener('DOMContentLoaded', init);
  })();