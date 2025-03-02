document.addEventListener("DOMContentLoaded", () => {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
      duration: 800,
      easing: "ease",
      once: false,
      mirror: false,
    })
  
    // Initialize Three.js for hero particles
    initParticles()
  
    // Setup custom cursor
    setupCustomCursor()
  
    // Setup navigation
    setupNavigation()
  
    // Setup scroll effects
    setupScrollEffects()
  
    // Fetch lessons
    fetchLessons()
  
    // Setup event listeners
    setupEventListeners()
  
    // Setup contact form
    setupContactForm()
  
    // Setup stats counter
    setupStatsCounter()
  
    // Setup lesson filter
    setupLessonFilter()
  
    // Setup test navigation
    setupTestNavigation()
  })
  
  let lessons = []
  let currentLesson = null
  let currentTest = null
  let currentQuestionIndex = 0
  let userAnswers = []
  
  // Custom Cursor
  function setupCustomCursor() {
    const cursorGlow = document.querySelector(".cursor-glow")
    const cursorDot = document.querySelector(".cursor-dot")
  
    document.addEventListener("mousemove", (e) => {
      cursorGlow.style.left = e.clientX + "px"
      cursorGlow.style.top = e.clientY + "px"
  
      cursorDot.style.left = e.clientX + "px"
      cursorDot.style.top = e.clientY + "px"
    })
  
    // Change cursor size on clickable elements
    const clickables = document.querySelectorAll("a, button, .lesson-card, .project-card, .close")
  
    clickables.forEach((element) => {
      element.addEventListener("mouseenter", () => {
        cursorGlow.style.width = "50px"
        cursorGlow.style.height = "50px"
        cursorGlow.style.background = "radial-gradient(circle, rgba(0, 255, 0, 0.8) 0%, rgba(0, 255, 0, 0) 70%)"
        cursorDot.style.backgroundColor = "var(--secondary-color)"
      })
  
      element.addEventListener("mouseleave", () => {
        cursorGlow.style.width = "30px"
        cursorGlow.style.height = "30px"
        cursorGlow.style.background = "radial-gradient(circle, rgba(0, 255, 0, 0.5) 0%, rgba(0, 255, 0, 0) 70%)"
        cursorDot.style.backgroundColor = "var(--primary-color)"
      })
    })
  }
  
  // Navigation
  function setupNavigation() {
    const menuToggle = document.querySelector(".menu-toggle")
    const navLinks = document.querySelector(".nav-links")
  
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active")
      navLinks.classList.toggle("active")
    })
  
    // Close menu when clicking on a link
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active")
        navLinks.classList.remove("active")
      })
    })
  }
  
  // Scroll Effects
  function setupScrollEffects() {
    const header = document.querySelector("header")
    const backToTop = document.querySelector(".back-to-top")
  
    window.addEventListener("scroll", () => {
      // Header effect
      if (window.scrollY > 100) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }
  
      // Back to top button
      if (window.scrollY > 500) {
        backToTop.classList.add("visible")
      } else {
        backToTop.classList.remove("visible")
      }
    })
  
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
  
        const targetId = this.getAttribute("href")
        if (targetId === "#") return
  
        const targetElement = document.querySelector(targetId)
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
          })
        }
      })
    })
  }
  
  // Three.js Particles
  function initParticles() {
    const particlesContainer = document.querySelector(".hero-particles")
    if (!particlesContainer) return
  
    // Import Three.js library
    const THREE = window.THREE
  
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    particlesContainer.appendChild(renderer.domElement)
  
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 2000
  
    const posArray = new Float32Array(particlesCount * 3)
    const colorsArray = new Float32Array(particlesCount * 3)
  
    for (let i = 0; i < particlesCount * 3; i++) {
      // Position
      posArray[i] = (Math.random() - 0.5) * 10
  
      // Colors (green to magenta gradient)
      if (i % 3 === 0) {
        // R
        colorsArray[i] = Math.random() * 0.5
      } else if (i % 3 === 1) {
        // G
        colorsArray[i] = Math.random() * 0.5 + 0.5
      } else {
        // B
        colorsArray[i] = Math.random() * 0.5
      }
    }
  
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colorsArray, 3))
  
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      transparent: true,
      sizeAttenuation: true,
    })
  
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)
  
    camera.position.z = 3
  
    // Animation
    function animate() {
      requestAnimationFrame(animate)
  
      particlesMesh.rotation.x += 0.0005
      particlesMesh.rotation.y += 0.0005
  
      renderer.render(scene, camera)
    }
  
    animate()
  
    // Resize handler
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })
  }
  
  // Fetch Lessons
  async function fetchLessons() {
    try {
      const response = await fetch("lessons.json")
      lessons = await response.json()
      displayLessons(lessons)
    } catch (error) {
      showToast("Помилка завантаження уроків", "error")
    }
  }
  
  function displayLessons(lessons) {
    const container = document.getElementById("lessons-container")
    container.innerHTML = lessons
      .map(
        (lesson) => `
          <div class="lesson-card" data-category="${getLessonCategory(lesson.title)}">
              <div class="lesson-icon">
                  <i class="${getLessonIcon(lesson.title)}"></i>
              </div>
              <h3>${lesson.title}</h3>
              <p>${lesson.description}</p>
              <button class="cta-button lesson-button" data-id="${lesson.id}">
                  <span class="cta-text">Вивчити</span>
                  <span class="cta-icon"><i class="fas fa-graduation-cap"></i></span>
              </button>
          </div>
      `,
      )
      .join("")
  
    document.querySelectorAll(".lesson-button").forEach((button) => {
      button.addEventListener("click", () => showLesson(button.dataset.id))
    })
  }
  
  function getLessonCategory(title) {
    if (title.includes("квант")) return "quantum"
    if (title.includes("нейро")) return "neural"
    if (title.includes("теорія")) return "theory"
    return "all"
  }
  
  function getLessonIcon(title) {
    if (title.includes("квант")) return "fas fa-atom"
    if (title.includes("нейро")) return "fas fa-brain"
    if (title.includes("теорія")) return "fas fa-database"
    return "fas fa-code"
  }
  
  function setupLessonFilter() {
    const filterButtons = document.querySelectorAll(".filter-button")
  
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter
  
        // Update active button
        filterButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")
  
        // Filter lessons
        const lessonCards = document.querySelectorAll(".lesson-card")
  
        lessonCards.forEach((card) => {
          if (filter === "all" || card.dataset.category === filter) {
            card.style.display = "block"
          } else {
            card.style.display = "none"
          }
        })
      })
    })
  }
  
  function showLesson(id) {
    currentLesson = lessons.find((l) => l.id === Number.parseInt(id))
    if (currentLesson) {
      const modal = document.getElementById("lesson-modal")
      document.getElementById("modal-title").textContent = currentLesson.title
      document.getElementById("modal-content").innerHTML = currentLesson.content
  
          document.getElementById('code-example').textContent = currentLesson.example;
          document.getElementById('code-output').textContent = '';
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden';
      }
  }
  
  function executeCode() {
      const code = document.getElementById('code-example').textContent;
      const outputElement = document.getElementById('code-output');
      
      try {
          // Створюємо безпечне середовище для виконання коду
          const safeRequire = (module) => {
              if (module === 'quantum-node') {
                  return {
                      createQubits: (n) => ({ 
                          applyHadamard: () => {}, 
                          entangle: () => {}, 
                          measure: () => 'Квантовий стан: |01>' 
                      }),
                  };
              }
              if (module === '@tensorflow/tfjs-node') {
                  return {
                      sequential: () => ({
                          add: () => {},
                          compile: () => {},
                          predict: () => ({ data: () => [0.7] }),
                      }),
                      layers: { dense: () => {}, dropout: () => {} },
                  };
              }
              if (module === 'express') {
                  return () => ({
                      post: (path, callback) => {},
                      listen: (port, callback) => { callback(); },
                  });
              }
              if (module === 'quantum-info') {
                  return {
                      createQubit: () => ({ applyHadamard: () => {}, measure: () => '|1>' }),
                      calculateEntropy: () => 0.6931,
                      teleport: (qubit) => qubit,
                  };
              }
              throw new Error(`Module ${module} is not supported in this environment.`);
          };
  
          const capturedOutput = [];
          const safeConsole = {
              log: (...args) => capturedOutput.push(args.join(' ')),
              error: (...args) => capturedOutput.push('Error: ' + args.join(' ')),
              warn: (...args) => capturedOutput.push('Warning: ' + args.join(' '))
          };
  
          // Створюємо функцію, яка виконає код з безпечними console та require
          const runUserCode = new Function('console', 'require', `
              ${code}
          `);
  
          // Виконуємо код з безпечними console та require
          runUserCode(safeConsole, safeRequire);
  
          // Відображаємо захоплений вивід
          outputElement.textContent = capturedOutput.join('\n');
          
          // Додаємо анімацію виконання
          outputElement.classList.add('fade-in');
          setTimeout(() => {
              outputElement.classList.remove('fade-in');
          }, 1000);
          
          showToast('Код успішно виконано!', 'success');
      } catch (error) {
          outputElement.textContent = `Error: ${error.message}`;
          showToast('Помилка виконання коду', 'error');
      }
  }
  
  function setupEventListeners() {
      const lessonModal = document.getElementById('lesson-modal');
      const testModal = document.getElementById('test-modal');
      const resultModal = document.getElementById('result-modal');
      const closeBtns = document.querySelectorAll('.close');
      const startTestBtn = document.getElementById('start-test');
      const submitTestBtn = document.getElementById('submit-test');
      const retryTestBtn = document.getElementById('retry-test');
      const runCodeBtn = document.getElementById('run-code');
      const copyCodeBtn = document.querySelector('.copy-code-btn');
      const continueBtn = document.getElementById('continue-learning');
      
      document.getElementById('start-journey').addEventListener('click', () => {
          document.getElementById('lessons').scrollIntoView({ behavior: 'smooth' });
      });
  
      closeBtns.forEach(btn => {
          btn.addEventListener('click', () => {
              lessonModal.style.display = 'none';
              testModal.style.display = 'none';
              resultModal.style.display = 'none';
              document.body.style.overflow = '';
          });
      });
  
      window.addEventListener('click', (e) => {
          if (e.target === lessonModal || e.target === testModal || e.target === resultModal) {
              lessonModal.style.display = 'none';
              testModal.style.display = 'none';
              resultModal.style.display = 'none';
              document.body.style.overflow = '';
          }
      });
  
      startTestBtn.addEventListener('click', startTest);
      submitTestBtn.addEventListener('click', submitTest);
      retryTestBtn.addEventListener('click', retryTest);
      runCodeBtn.addEventListener('click', executeCode);
      
      if (copyCodeBtn) {
          copyCodeBtn.addEventListener('click', () => {
              const codeText = document.getElementById('code-example').textContent;
              navigator.clipboard.writeText(codeText).then(() => {
                  showToast('Код скопійовано в буфер обміну!', 'success');
              });
          });
      }
      
      if (continueBtn) {
          continueBtn.addEventListener('click', () => {
              resultModal.style.display = 'none';
              document.body.style.overflow = '';
          });
      }
  }
  
  function setupTestNavigation() {
      const prevBtn = document.getElementById('prev-question');
      const nextBtn = document.getElementById('next-question');
      const submitBtn = document.getElementById('submit-test');
      
      if (!prevBtn || !nextBtn || !submitBtn) return;
      
      prevBtn.addEventListener('click', () => {
          if (currentQuestionIndex > 0) {
              saveCurrentAnswer();
              currentQuestionIndex--;
              showCurrentQuestion();
          }
      });
      
      nextBtn.addEventListener('click', () => {
          saveCurrentAnswer();
          currentQuestionIndex++;
          
          if (currentQuestionIndex >= currentTest.questions.length) {
              currentQuestionIndex = currentTest.questions.length - 1;
              nextBtn.style.display = 'none';
              submitBtn.style.display = 'inline-flex';
          } else {
              showCurrentQuestion();
          }
      });
  }
  
  function saveCurrentAnswer() {
      if (!currentTest) return;
      
      const selected = document.querySelector(`input[name="current-question"]:checked`);
      if (selected) {
          userAnswers[currentQuestionIndex] = parseInt(selected.value);
      } else {
          userAnswers[currentQuestionIndex] = -1;
      }
  }
  
  function startTest() {
      if (currentLesson && currentLesson.test) {
          currentTest = JSON.parse(JSON.stringify(currentLesson.test));
          shuffleArray(currentTest.questions);
          currentTest.questions.forEach(question => shuffleArray(question.options));
          
          // Reset test state
          currentQuestionIndex = 0;
          userAnswers = new Array(currentTest.questions.length).fill(-1);
          
          // Update total questions count
          document.getElementById('total-questions').textContent = currentTest.questions.length;
          
          showCurrentQuestion();
          document.getElementById('lesson-modal').style.display = 'none';
          document.getElementById('test-modal').style.display = 'block';
          
          // Reset navigation buttons
          document.getElementById('prev-question').disabled = true;
          document.getElementById('next-question').style.display = 'inline-flex';
          document.getElementById('submit-test').style.display = 'none';
      }
  }
  
  function showCurrentQuestion() {
      if (!currentTest) return;
      
      const testContent = document.getElementById('test-content');
      const currentQuestion = currentTest.questions[currentQuestionIndex];
      
      // Update progress
      document.getElementById('current-question').textContent = currentQuestionIndex + 1;
      document.querySelector('.progress-fill').style.width = `${((currentQuestionIndex + 1) / currentTest.questions.length) * 100}%`;
      
      // Update navigation buttons
      document.getElementById('prev-question').disabled = currentQuestionIndex === 0;
      
      if (currentQuestionIndex === currentTest.questions.length - 1) {
          document.getElementById('next-question').style.display = 'none';
          document.getElementById('submit-test').style.display = 'inline-flex';
      } else {
          document.getElementById('next-question').style.display = 'inline-flex';
          document.getElementById('submit-test').style.display = 'none';
      }
      
      // Show current question
      testContent.innerHTML = `
          <div class="test-question">
              <h3>${currentQuestionIndex + 1}. ${currentQuestion.question}</h3>
              <div class="test-options">
                  ${currentQuestion.options.map((option, optionIndex) => `
                      <div class="test-option">
                          <label>
                              <input type="radio" name="current-question" value="${optionIndex}" ${userAnswers[currentQuestionIndex] === optionIndex ? 'checked' : ''}>
                              ${option}
                          </label>
                      </div>
                  `).join('')}
              </div>
          </div>
      `;
      
      // Add animation
      testContent.classList.add('fade-in');
      setTimeout(() => {
          testContent.classList.remove('fade-in');
      }, 500);
  }
  
  function submitTest() {
      saveCurrentAnswer();
      
      const results = currentTest.questions.map((question, index) => ({
          question: question.question,
          userAnswer: userAnswers[index] !== -1 ? question.options[userAnswers[index]] : 'Не відповіли',
          correctAnswer: question.options[question.correctAnswer],
          isCorrect: userAnswers[index] === question.correctAnswer
      }));
  
      displayTestResults(results);
  }
  
  function displayTestResults(results) {
      const testResults = document.getElementById('test-results');
      const correctCount = results.filter(r => r.isCorrect).length;
      const totalQuestions = results.length;
      const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  
      // Update score circle
      document.querySelector('.score-number').textContent = `${scorePercentage}%`;
      
      // Add appropriate color based on score
      const scoreCircle = document.querySelector('.score-circle');
      if (scorePercentage >= 80) {
          scoreCircle.style.borderColor = 'var(--success-color)';
      } else if (scorePercentage >= 50) {
          scoreCircle.style.borderColor = 'var(--warning-color)';
      } else {
          scoreCircle.style.borderColor = 'var(--error-color)';
      }
  
      testResults.innerHTML = `
          <h3>Ви відповіли правильно на ${correctCount} з ${totalQuestions} питань.</h3>
          ${results.map((result, index) => `
              <p class="${result.isCorrect ? 'correct' : 'incorrect'}">
                  ${index + 1}. ${result.question}<br>
                  Ваша відповідь: ${result.userAnswer}<br>
                  ${!result.isCorrect ? `Правильна відповідь: ${result.correctAnswer}` : ''}
              </p>
          `).join('')}
      `;
  
      document.getElementById('test-modal').style.display = 'none';
      document.getElementById('result-modal').style.display = 'block';
  
      if (correctCount === totalQuestions) {
          showToast('Вітаємо! Ви успішно засвоїли тему!', 'success');
      } else if (scorePercentage >= 80) {
          showToast('Чудовий результат!', 'success');
      } else if (scorePercentage >= 50) {
          showToast('Непогано, але є над чим працювати!', 'warning');
      } else {
          showToast('Рекомендуємо повторити матеріал', 'error');
      }
  }
  
  function retryTest() {
      document.getElementById('result-modal').style.display = 'none';
      startTest();
  }
  
  function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
  }
  
  // Contact Form
  function setupContactForm() {
    const form = document.getElementById('contact-form');
      if (!form) return;
      
      form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          // Додаємо анімацію завантаження
          const submitBtn = form.querySelector('.submit-button');
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Надсилання...';
          submitBtn.disabled = true;
          
          try {
              // Імітація відправки форми
              await new Promise(resolve => setTimeout(resolve, 1500));
              showToast('Повідомлення надіслано успішно!', 'success');
              form.reset();
          } catch (error) {
              showToast('Помилка при відправці повідомлення', 'error');
          } finally {
              submitBtn.innerHTML = originalText;
              submitBtn.disabled = false;
          }
      });
  }
  
  // Stats Counter
  function setupStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
      
      if (stats.length === 0) return;
      
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  const target = entry.target;
                  const countTo = parseInt(target.getAttribute('data-count'));
                  
                  let count = 0;
                  const interval = setInterval(() => {
                      count += Math.ceil(countTo / 50);
                      if (count >= countTo) {
                          target.textContent = countTo;
                          clearInterval(interval);
                      } else {
                          target.textContent = count;
                      }
                  }, 30);
                  
                  observer.unobserve(target);
              }
          });
      }, { threshold: 0.5 });
      
      stats.forEach(stat => {
          observer.observe(stat);
      });
  }
  
  // Event Listeners
  
  // Toast function
  function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      
      // Set color based on type
      if (type === 'success') {
          toast.style.backgroundColor = 'var(--success-color)';
      } else if (type === 'error') {
          toast.style.backgroundColor = 'var(--error-color)';
      } else if (type === 'warning') {
          toast.style.backgroundColor = 'var(--warning-color)';
          toast.style.color = 'var(--background-color)';
      } else if (type === 'info') {
          toast.style.backgroundColor = 'var(--info-color)';
      }
      
      toast.style.display = 'block';
      
      // Add animation
      toast.classList.add('fade-in');
  
      setTimeout(() => {
          toast.style.display = 'none';
          toast.classList.remove('fade-in');
      }, 3000);
  }
  
  console.log('Script loaded successfully!');
  