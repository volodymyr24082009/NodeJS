document.addEventListener('DOMContentLoaded', () => {
    fetchLessons();
    setupEventListeners();
    setupContactForm();
});

let lessons = [];
let currentLesson = null;
let currentTest = null;

async function fetchLessons() {
    try {
        const response = await fetch('lessons.json');
        lessons = await response.json();
        displayLessons(lessons);
    } catch (error) {
        showToast('Помилка завантаження уроків', 'error');
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

    document.querySelectorAll('.lesson-button').forEach(button => {
        button.addEventListener('click', () => showLesson(button.dataset.id));
    });
}

function showLesson(id) {
    currentLesson = lessons.find(l => l.id === parseInt(id));
    if (currentLesson) {
        const modal = document.getElementById('lesson-modal');
        document.getElementById('modal-title').textContent = currentLesson.title;
        document.getElementById('modal-content').innerHTML = currentLesson.content;
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
                    createQubits: (n) => ({ applyHadamard: () => {}, entangle: () => {}, measure: () => 'Квантовий стан: |01>' }),
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
    } catch (error) {
        outputElement.textContent = `Error: ${error.message}`;
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
}

function startTest() {
    if (currentLesson && currentLesson.test) {
        currentTest = JSON.parse(JSON.stringify(currentLesson.test));
        shuffleArray(currentTest.questions);
        currentTest.questions.forEach(question => shuffleArray(question.options));
        displayTest();
        document.getElementById('lesson-modal').style.display = 'none';
        document.getElementById('test-modal').style.display = 'block';
    }
}

function displayTest() {
    const testContent = document.getElementById('test-content');
    testContent.innerHTML = currentTest.questions.map((question, index) => `
        <div class="test-question">
            <h3>${index + 1}. ${question.question}</h3>
            <div class="test-options">
                ${question.options.map((option, optionIndex) => `
                    <div class="test-option">
                        <label>
                            <input type="radio" name="q${index}" value="${optionIndex}">
                            ${option}
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function submitTest() {
    const answers = [];
    currentTest.questions.forEach((_, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        answers.push(selected ? parseInt(selected.value) : -1);
    });

    const results = currentTest.questions.map((question, index) => ({
        question: question.question,
        userAnswer: question.options[answers[index]],
        correctAnswer: question.options[question.correctAnswer],
        isCorrect: answers[index] === question.correctAnswer
    }));

    displayTestResults(results);
}

function displayTestResults(results) {
    const testResults = document.getElementById('test-results');
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalQuestions = results.length;

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

function setupContactForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        try {
            // Імітація відправки форми
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast('Повідомлення надіслано успішно!');
            form.reset();
        } catch (error) {
            showToast('Помилка при відправці повідомлення', 'error');
        }
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? 'var(--primary-color)' : 'red';
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

console.log('Script loaded successfully!');