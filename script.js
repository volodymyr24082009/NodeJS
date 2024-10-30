document.addEventListener('DOMContentLoaded', () => {
    fetchLessons();
    setupEventListeners();
    setupContactForm();
    setupSmoothScrolling();
});

function setupEventListeners() {
    // Start Journey button
    document.getElementById('start-journey').addEventListener('click', () => {
        document.getElementById('lessons').scrollIntoView({ behavior: 'smooth' });
    });

    // Modal close button
    document.querySelector('.modal .close').addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('lesson-modal');
        if (e.target === modal) {
            closeModal();
        }
    });

    // Run code button
    document.getElementById('run-code').addEventListener('click', () => {
        const code = document.querySelector('#modal-code code').textContent;
        runCode(code);
    });
}

async function fetchLessons() {
    try {
        const response = await fetch('lessons.json');
        const lessons = await response.json();
        displayLessons(lessons);
    } catch (error) {
        showToast('Error loading lessons', 'error');
    }
}

function displayLessons(lessons) {
    const container = document.getElementById('lessons-container');
    container.innerHTML = lessons.map(lesson => `
        <div class="lesson-card">
            <h3>${lesson.title}</h3>
            <p>${lesson.description}</p>
            <button class="cta-button lesson-button" data-id="${lesson.id}">Вивчити</button>
        </div>
    `).join('');

    // Add click handlers for lesson buttons
    document.querySelectorAll('.lesson-button').forEach(button => {
        button.addEventListener('click', () => {
            const lessonId = parseInt(button.dataset.id);
            const lesson = lessons.find(l => l.id === lessonId);
            if (lesson) {
                showLesson(lesson);
            }
        });
    });
}

function showLesson(lesson) {
    const modal = document.getElementById('lesson-modal');
    document.getElementById('modal-title').textContent = lesson.title;
    document.getElementById('modal-content').textContent = lesson.content;
    
    const codeElement = document.querySelector('#modal-code code');
    if (lesson.example) {
        codeElement.textContent = lesson.example;
        document.getElementById('run-code').style.display = 'block';
        document.getElementById('modal-code').style.display = 'block';
    } else {
        document.getElementById('run-code').style.display = 'none';
        document.getElementById('modal-code').style.display = 'none';
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('lesson-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function runCode(code) {
    try {
        // Create a safe environment for code execution
        const safeEval = new Function('console', `
            const log = [];
            const console = {
                log: (...args) => log.push(args.join(' ')),
                error: (...args) => log.push('Error: ' + args.join(' ')),
                warn: (...args) => log.push('Warning: ' + args.join(' '))
            };
            try {
                ${code}
                return log.join('\\n');
            } catch (error) {
                return 'Error: ' + error.message;
            }
        `);
        
        const result = safeEval(console);
        showToast(result);
    } catch (error) {
        showToast(`Error executing code: ${error.message}`, 'error');
    }
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    message: formData.get('message'),
                    to: '24g_chvv@liceum.ztu.edu.ua'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                showToast('Повідомлення надіслано успішно!');
                form.reset();
            } else  {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            showToast('Помилка при відправці повідомлення', 'error');
        }
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.borderColor = type === 'success' ? 'var(--primary-color)' : 'red';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
// Update the showLesson function in your script.js
function showLesson(lesson) {
    const modal = document.getElementById('lesson-modal');
    document.getElementById('modal-title').textContent = lesson.title;
    document.getElementById('modal-content').textContent = lesson.content;
    
    const codeElement = document.querySelector('#modal-code code');
    const outputElement = document.getElementById('code-output');
    
    if (lesson.example) {
        codeElement.textContent = lesson.example;
        // Generate and display the expected output
        const output = generateExpectedOutput(lesson.id, lesson.example);
        outputElement.textContent = output;
        document.querySelector('.code-section').style.display = 'block';
    } else {
        document.querySelector('.code-section').style.display = 'none';
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Add this new function to generate expected outputs
function generateExpectedOutput(lessonId, code) {
    // Predefined outputs for each lesson
    const outputs = {
        1: `Результат вимірювання: 1
Квантовий біт успішно створено та виміряно`,
        
        2: `Нейромережевий мікросервіс запущено на порту 3000
Прогноз для вхідного значення 5: 0.8734
Модель успішно навчена`,
        
        3: `Збережено 4D-об'єкт: {
  x: 1,
  y: 2,
  z: 3,
  t: "2024-01-30T12:00:00Z",
  data: "Голографічні дані"
}
Знайдено 3 об'єкти у вказаному часовому діапазоні`,
        
        4: `Сервер телепатичної аутентифікації запущено
Користувача успішно аутентифіковано
ID сесії: TPA-2024-001`,
        
        5: `Додаток успішно розгорнуто в галактиці Андромеда
Статус розгортання: OK
Квантові канали синхронізовано
Латентність: 0.0001ms`,
        
        6: `Оптимізацію завершено
Прискорення: 1000x
Квантова ефективність: 99.99%
Час виконання: 0.001ms`,
        
        7: `Нейроморфний сервер активовано на порту 3000
Отримано нейронний імпульс: Hello, Neuro World
Статус обробки: processed
Синаптичні з'єднання: встановлено`,
        
        8: `Згенеровано квантову пару ключів
Повідомлення успішно зашифровано
Повідомлення успішно розшифровано
Безпека: максимальна`,
        
        9: `Біоквантовий процесор ініціалізовано
ДНК кодування виконано
Результат обчислень: успішно
Ефективність: 100%`,
        
        10: `Часовий контекст створено
Виконання в 2025 році: успішно
Виконання в 1999 році: успішно
Часова петля завершена`
    };

    // Return predefined output or generate a default one
    return outputs[lessonId] || 'Виконання коду успішне!\nРезультат: OK';
}

// Remove the runCode function since we're not using it anymore
// Remove the run-code button event listener from setupEventListeners()
function setupEventListeners() {
    // Start Journey button
    document.getElementById('start-journey').addEventListener('click', () => {
        document.getElementById('lessons').scrollIntoView({ behavior: 'smooth' });
    });

    // Modal close button
    document.querySelector('.modal .close').addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('lesson-modal');
        if (e.target === modal) {
            closeModal();
        }
    });
}