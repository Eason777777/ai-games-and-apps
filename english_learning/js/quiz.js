// Quiz Practice Module
class QuizManager {
    constructor() {
        this.dataManager = null;
        this.quizWords = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
        this.isQuizActive = false;
        this.quizType = 'multiple-choice';
        this.unit = 'all';
        this.questionCount = 20;
        this.currentQuestion = null;

        this.init();
    }

    /**
     * 設置數據管理器
     */
    setDataManager(dataManager) {
        this.dataManager = dataManager;
        this.initialize();
    }

    init() {
        this.bindEvents();
    }

    initialize() {
        this.setupControls();
    }

    bindEvents() {
        // Control elements
        const unitSelector = document.getElementById('quizUnit');
        const typeSelector = document.getElementById('quizType');
        const countInput = document.getElementById('quizCount');
        const startBtn = document.getElementById('startQuiz');
        const submitBtn = document.getElementById('submitAnswer');
        const retakeBtn = document.getElementById('retakeQuiz');

        if (unitSelector) {
            unitSelector.addEventListener('change', (e) => {
                this.unit = e.target.value;
            });
        }

        if (typeSelector) {
            typeSelector.addEventListener('change', (e) => {
                this.quizType = e.target.value;
            });
        }

        if (countInput) {
            countInput.addEventListener('change', (e) => {
                this.questionCount = Math.max(5, Math.min(50, parseInt(e.target.value) || 20));
                e.target.value = this.questionCount;
            });
        }

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startQuiz();
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitAnswer();
            });
        }

        if (retakeBtn) {
            retakeBtn.addEventListener('click', () => {
                this.startQuiz();
                window.navigationManager.hideResult();
            });
        }        // Close result button event
        const closeResultBtn = document.getElementById('closeResult');
        if (closeResultBtn) {
            closeResultBtn.addEventListener('click', () => {
                window.navigationManager.hideResult();
                window.navigationManager.showPage('home');
            });
        }

        // View answers button event
        const viewAnswersBtn = document.getElementById('viewAnswers');
        if (viewAnswersBtn) {
            viewAnswersBtn.addEventListener('click', () => {
                this.viewAnswers();
            });
        }
    }

    setupControls() {
        // Load saved preferences
        const savedUnit = localStorage.getItem('quizUnit');
        const savedType = localStorage.getItem('quizType');
        const savedCount = localStorage.getItem('quizCount');

        if (savedUnit) {
            const unitSelector = document.getElementById('quizUnit');
            if (unitSelector) {
                unitSelector.value = savedUnit;
                this.unit = savedUnit;
            }
        }

        if (savedType) {
            const typeSelector = document.getElementById('quizType');
            if (typeSelector) {
                typeSelector.value = savedType;
                this.quizType = savedType;
            }
        }

        if (savedCount) {
            const countInput = document.getElementById('quizCount');
            if (countInput) {
                countInput.value = savedCount;
                this.questionCount = parseInt(savedCount);
            }
        }
    }

    startQuiz() {
        // Save preferences
        localStorage.setItem('quizUnit', this.unit);
        localStorage.setItem('quizType', this.quizType);
        localStorage.setItem('quizCount', this.questionCount.toString());

        // Get words for the quiz
        if (!this.dataManager) return;
        const availableWords = this.dataManager.getWordsByUnit(this.unit);
        if (availableWords.length === 0) {
            window.navigationManager.showNotification('沒有可用的單字', 'error');
            return;
        }

        // Select random words
        this.quizWords = this.dataManager.getRandomWords(this.questionCount, this.unit);

        if (this.quizWords.length < this.questionCount) {
            window.navigationManager.showNotification(
                `單字數量不足，只能創建 ${this.quizWords.length} 道題目`,
                'warning'
            );
            this.questionCount = this.quizWords.length;
        }

        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
        this.isQuizActive = true;
        this.quizStartTime = Date.now();

        // Show quiz container
        document.getElementById('quizContainer').classList.remove('hidden');

        // Generate all questions
        this.generateQuestions();

        // Show first question
        this.showCurrentQuestion();

        window.navigationManager.showNotification('測驗開始！', 'success', 2000);
    }

    generateQuestions() {
        this.questions = this.quizWords.map(word => {
            switch (this.quizType) {
                case 'multiple-choice':
                    return this.createMultipleChoiceQuestion(word);
                case 'fill-blank':
                    return this.createFillBlankQuestion(word);
                case 'true-false':
                    return this.createTrueFalseQuestion(word);
                default:
                    return this.createMultipleChoiceQuestion(word);
            }
        });
    }

    createMultipleChoiceQuestion(word) {
        // Randomly choose question type
        const questionTypes = [
            { type: 'word-to-chinese', question: word.english, correct: word.chinese },
            { type: 'chinese-to-word', question: word.chinese, correct: word.english },
            { type: 'definition-to-word', question: word.definition, correct: word.english }
        ];

        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        // Get wrong options
        const allWords = this.dataManager.words.filter(w => w.english !== word.english);
        const wrongOptions = this.getRandomOptions(allWords, questionType.type, 3);

        // Combine and shuffle options
        const options = [questionType.correct, ...wrongOptions].sort(() => Math.random() - 0.5);

        return {
            word: word,
            type: this.quizType,
            questionType: questionType.type,
            question: questionType.question,
            options: options,
            correct: questionType.correct,
            userAnswer: null
        };
    }

    createFillBlankQuestion(word) {
        const questionTypes = [
            {
                type: 'definition-fill',
                question: `"${word.definition}" 這個定義對應的英文單字是？`,
                placeholder: '請輸入英文單字',
                correct: word.english.toLowerCase()
            },
            {
                type: 'chinese-fill',
                question: `"${word.chinese}" 的英文是？`,
                placeholder: '請輸入英文單字',
                correct: word.english.toLowerCase()
            }
        ];

        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        return {
            word: word,
            type: this.quizType,
            questionType: questionType.type,
            question: questionType.question,
            placeholder: questionType.placeholder,
            correct: questionType.correct,
            userAnswer: null
        };
    }

    createTrueFalseQuestion(word) {
        const isTrue = Math.random() < 0.5;

        if (isTrue) {
            // Create a true statement
            const statements = [
                `"${word.english}" 的中文意思是 "${word.chinese}"`,
                `"${word.english}" 的定義是 "${word.definition}"`
            ];

            const statement = statements[Math.floor(Math.random() * statements.length)];

            return {
                word: word,
                type: this.quizType,
                question: statement,
                correct: true,
                userAnswer: null
            };
        } else {
            // Create a false statement
            const allWords = this.dataManager.words.filter(w => w.english !== word.english);
            const wrongWord = allWords[Math.floor(Math.random() * allWords.length)];

            const statements = [
                `"${word.english}" 的中文意思是 "${wrongWord.chinese}"`,
                `"${word.english}" 的定義是 "${wrongWord.definition}"`
            ];

            const statement = statements[Math.floor(Math.random() * statements.length)];

            return {
                word: word,
                type: this.quizType,
                question: statement,
                correct: false,
                userAnswer: null
            };
        }
    }

    getRandomOptions(words, questionType, count) {
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        const options = [];

        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            const word = shuffled[i];
            switch (questionType) {
                case 'word-to-chinese':
                    options.push(word.chinese);
                    break;
                case 'chinese-to-word':
                case 'definition-to-word':
                    options.push(word.english);
                    break;
            }
        }

        return options;
    } showCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endQuiz();
            return;
        }

        this.currentQuestion = this.questions[this.currentQuestionIndex];

        // Update progress
        this.updateProgress();

        // Update question display
        const questionElement = document.getElementById('questionText');
        const optionsElement = document.getElementById('optionsContainer');
        const submitBtn = document.getElementById('submitAnswer');

        if (questionElement) {
            questionElement.textContent = this.currentQuestion.question;
        }

        if (optionsElement && submitBtn) {
            optionsElement.innerHTML = ''; // Clear previous content including feedback
            submitBtn.disabled = true; switch (this.currentQuestion.type) {
                case 'multiple-choice':
                    optionsElement.className = 'quiz-options quiz-options-multiple-choice';
                    this.renderMultipleChoiceOptions(optionsElement, submitBtn);
                    break;
                case 'fill-blank':
                    optionsElement.className = 'quiz-options quiz-options-fill-blank';
                    this.renderFillBlankOptions(optionsElement, submitBtn);
                    break;
                case 'true-false':
                    optionsElement.className = 'quiz-options quiz-options-true-false';
                    this.renderTrueFalseOptions(optionsElement, submitBtn);
                    break;
            }
        }
    } renderMultipleChoiceOptions(container, submitBtn) {
        this.currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.setAttribute('data-option-number', index + 1);
            button.addEventListener('click', () => {
                // Remove previous selection
                container.querySelectorAll('.option-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });

                // Select current option
                button.classList.add('selected');
                this.currentQuestion.userAnswer = option;
                submitBtn.disabled = false;
            });

            container.appendChild(button);
        });
    }

    renderFillBlankOptions(container, submitBtn) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'fill-blank-input';
        input.placeholder = this.currentQuestion.placeholder;

        input.addEventListener('input', () => {
            this.currentQuestion.userAnswer = input.value.trim().toLowerCase();
            submitBtn.disabled = input.value.trim() === '';
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !submitBtn.disabled) {
                this.submitAnswer();
            }
        });

        container.appendChild(input);
        input.focus();
    }

    renderTrueFalseOptions(container, submitBtn) {
        ['對', '錯'].forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => {
                // Remove previous selection
                container.querySelectorAll('.option-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });

                // Select current option
                button.classList.add('selected');
                this.currentQuestion.userAnswer = index === 0; // 對 = true, 錯 = false
                submitBtn.disabled = false;
            });

            container.appendChild(button);
        });
    }

    submitAnswer() {
        if (!this.currentQuestion || this.currentQuestion.userAnswer === null) {
            return;
        }

        const isCorrect = this.checkAnswer();

        // Store answer
        this.answers.push({
            question: this.currentQuestion,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            this.score++;
        }

        // Show feedback
        this.showAnswerFeedback(isCorrect);

        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showCurrentQuestion();
        }, 2000);
    }

    checkAnswer() {
        const question = this.currentQuestion;

        switch (question.type) {
            case 'multiple-choice':
                return question.userAnswer === question.correct;
            case 'fill-blank':
                return question.userAnswer === question.correct;
            case 'true-false':
                return question.userAnswer === question.correct;
            default:
                return false;
        }
    } showAnswerFeedback(isCorrect) {
        const optionsContainer = document.getElementById('optionsContainer');
        const submitBtn = document.getElementById('submitAnswer');

        if (!optionsContainer || !submitBtn) return;

        submitBtn.disabled = true;

        // Create feedback container if it doesn't exist
        let feedbackContainer = optionsContainer.querySelector('.answer-feedback');
        if (!feedbackContainer) {
            feedbackContainer = document.createElement('div');
            feedbackContainer.className = 'answer-feedback';
            optionsContainer.appendChild(feedbackContainer);
        }

        if (this.currentQuestion.type === 'multiple-choice') {
            // Highlight correct and wrong answers
            const buttons = optionsContainer.querySelectorAll('.option-btn');
            buttons.forEach(btn => {
                if (btn.textContent === this.currentQuestion.correct) {
                    btn.classList.add('correct');
                } else if (btn.classList.contains('selected') && !isCorrect) {
                    btn.classList.add('wrong');
                }
                btn.disabled = true;
            });

            // Show feedback message
            if (isCorrect) {
                feedbackContainer.className = 'answer-feedback correct';
                feedbackContainer.innerHTML = `
                    <i class="fas fa-check-circle"></i> 正確！
                `;
            } else {
                feedbackContainer.className = 'answer-feedback wrong';
                feedbackContainer.innerHTML = `
                    <i class="fas fa-times-circle"></i> 錯誤！
                    <div class="correct-answer">正確答案是：<strong>${this.currentQuestion.correct}</strong></div>
                `;
            }

        } else if (this.currentQuestion.type === 'true-false') {
            const buttons = optionsContainer.querySelectorAll('.option-btn');
            buttons.forEach((btn, index) => {
                const isTrue = index === 0;
                if (isTrue === this.currentQuestion.correct) {
                    btn.classList.add('correct');
                } else if (btn.classList.contains('selected') && !isCorrect) {
                    btn.classList.add('wrong');
                }
                btn.disabled = true;
            });

            // Show feedback message
            if (isCorrect) {
                feedbackContainer.className = 'answer-feedback correct';
                feedbackContainer.innerHTML = `
                    <i class="fas fa-check-circle"></i> 正確！
                `;
            } else {
                const correctAnswer = this.currentQuestion.correct ? '對' : '錯';
                feedbackContainer.className = 'answer-feedback wrong';
                feedbackContainer.innerHTML = `
                    <i class="fas fa-times-circle"></i> 錯誤！
                    <div class="correct-answer">正確答案是：<strong>${correctAnswer}</strong></div>
                `;
            }

        } else if (this.currentQuestion.type === 'fill-blank') {
            const input = optionsContainer.querySelector('.fill-blank-input');
            if (input) {
                input.disabled = true;
                if (isCorrect) {
                    input.classList.add('correct');
                    feedbackContainer.className = 'answer-feedback correct';
                    feedbackContainer.innerHTML = `
                        <i class="fas fa-check-circle"></i> 正確！
                    `;
                } else {
                    input.classList.add('wrong');
                    feedbackContainer.className = 'answer-feedback wrong';
                    feedbackContainer.innerHTML = `
                        <i class="fas fa-times-circle"></i> 錯誤！
                        <div class="correct-answer">正確答案是：<strong>${this.currentQuestion.correct}</strong></div>
                    `;
                }
            }
        }

        // Show notification
        const message = isCorrect ? '正確！' : '錯誤！';
        const type = isCorrect ? 'success' : 'error';
        window.navigationManager.showNotification(message, type, 1500);
    }

    updateProgress() {
        const progressElement = document.getElementById('quizProgress');
        const progressFill = document.getElementById('progressFill');
        const scoreElement = document.getElementById('currentScore');

        if (progressElement) {
            progressElement.textContent = `${this.currentQuestionIndex + 1} / ${this.questions.length}`;
        }

        if (progressFill) {
            const percentage = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
            progressFill.style.width = `${percentage}%`;
        }

        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    endQuiz() {
        this.isQuizActive = false;

        // Hide quiz container
        document.getElementById('quizContainer').classList.add('hidden');

        // Calculate results
        const accuracy = Math.round((this.score / this.questions.length) * 100);
        const wrongAnswers = this.answers.filter(answer => !answer.isCorrect);

        // Update result display
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('totalQuestions').textContent = this.questions.length;
        document.getElementById('accuracy').textContent = accuracy;

        // Show summary of wrong answers (simplified without review functionality)
        this.displayWrongAnswersSummary(wrongAnswers);

        // Save quiz result
        this.saveQuizResult(accuracy);

        // Show result overlay        window.navigationManager.showResult('quizResult');
    } displayWrongAnswersSummary(wrongAnswers) {
        const summaryContainer = document.getElementById('wrongAnswersSummary');
        if (!summaryContainer) return;

        if (wrongAnswers.length === 0) {
            summaryContainer.innerHTML = `
                <div class="perfect-score">
                    <i class="fas fa-trophy"></i>
                    <p><strong>完美成績！</strong></p>
                    <p>所有題目都答對了！</p>
                </div>
            `;
            return;
        }

        summaryContainer.innerHTML = `
            <h4><i class="fas fa-exclamation-triangle"></i> 答錯的單字 (${wrongAnswers.length})</h4>
            <div class="summary-list">
                ${wrongAnswers.map(answer => {
            const word = answer.question.word;
            const userAnswer = answer.question.userAnswer;
            const correctAnswer = answer.question.correct;

            let errorDescription = '';
            let correctInfo = '';

            if (answer.question.type === 'multiple-choice') {
                switch (answer.question.questionType) {
                    case 'word-to-chinese':
                        errorDescription = `你選擇：${userAnswer}`;
                        correctInfo = `正確中文：${correctAnswer}`;
                        break;
                    case 'chinese-to-word':
                        errorDescription = `你選擇：${userAnswer}`;
                        correctInfo = `正確英文：${correctAnswer}`;
                        break;
                    case 'definition-to-word':
                        errorDescription = `你選擇：${userAnswer}`;
                        correctInfo = `正確英文：${correctAnswer}`;
                        break;
                }
            } else if (answer.question.type === 'fill-blank') {
                errorDescription = `你填入：${userAnswer}`;
                correctInfo = `正確答案：${correctAnswer}`;
            } else if (answer.question.type === 'true-false') {
                const userAnswerText = userAnswer ? '對' : '錯';
                const correctAnswerText = correctAnswer ? '對' : '錯';
                errorDescription = `你選擇：${userAnswerText}`;
                correctInfo = `正確答案：${correctAnswerText}`;
            }

            return `
                        <div class="wrong-answer-item">
                            <span class="word">${word.english}</span>
                            <div class="error">${errorDescription}</div>
                            <div class="correct-info">${correctInfo}</div>
                            <div class="correct-info">定義：${word.definition}</div>
                            <div class="correct-info">中文：${word.chinese}</div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    saveQuizResult(accuracy) {
        const quizData = {
            date: new Date().toISOString(),
            type: this.quizType,
            unit: this.unit,
            score: this.score,
            total: this.questions.length,
            accuracy: accuracy,
            duration: Date.now() - this.quizStartTime
        };

        const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        quizHistory.push(quizData);

        // Keep only last 100 quizzes
        if (quizHistory.length > 100) {
            quizHistory.splice(0, quizHistory.length - 100);
        }

        localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    }

    handleKeyboard(e) {
        if (window.navigationManager.currentPage !== 'quiz' || !this.isQuizActive) return;

        // Number keys for multiple choice (1-4)
        if (['1', '2', '3', '4'].includes(e.key) && this.currentQuestion?.type === 'multiple-choice') {
            e.preventDefault();
            const index = parseInt(e.key) - 1;
            const options = document.querySelectorAll('.option-btn');
            if (options[index]) {
                options[index].click();
            }
        }

        // Enter to submit
        if (e.key === 'Enter') {
            const submitBtn = document.getElementById('submitAnswer');
            if (submitBtn && !submitBtn.disabled) {
                e.preventDefault();
                this.submitAnswer();
            }
        }

        // T/F for true-false questions
        if (this.currentQuestion?.type === 'true-false') {
            if (e.key.toLowerCase() === 't') {
                e.preventDefault();
                document.querySelectorAll('.option-btn')[0]?.click();
            } else if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                document.querySelectorAll('.option-btn')[1]?.click();
            }
        }
    }

    /**
     * 用設定初始化測驗練習
     */
    initializeWithSettings(settings) {
        // 設定單元
        this.unit = settings.units.length > 0 ? settings.units.join(',') : 'all';

        // 設定測驗類型
        if (settings.type) {
            this.quizType = settings.type;
        }

        // 設定題目數量
        if (settings.questionCount) {
            this.questionCount = Math.max(5, Math.min(50, settings.questionCount));
        }

        // 更新UI
        this.updateUIFromSettings();

        // 自動開始測驗
        this.startQuiz();
    }

    /**
     * 根據設定更新UI
     */
    updateUIFromSettings() {
        // 更新單元選擇器
        const unitSelector = document.getElementById('quizUnit');
        if (unitSelector) {
            unitSelector.value = this.unit;
        }

        // 更新測驗類型
        const typeSelector = document.getElementById('quizType');
        if (typeSelector) {
            typeSelector.value = this.quizType;
        }

        // 更新題目數量
        const countInput = document.getElementById('quizCount');
        if (countInput) {
            countInput.value = this.questionCount;
        }
    }

    /**
     * 顯示所有測驗問題和答案
     */
    viewAnswers() {
        if (!this.questions || this.questions.length === 0) {
            window.navigationManager.showNotification('沒有可查看的答案', 'error');
            return;
        }

        // 創建答案查看模態框
        this.createAnswerModal();
    }

    /**
     * 創建並顯示答案查看模態框
     */
    createAnswerModal() {
        // 檢查是否已存在模態框
        let modal = document.getElementById('answerModal');
        if (modal) {
            modal.remove();
        }

        // 創建模態框
        modal = document.createElement('div');
        modal.id = 'answerModal';
        modal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content answer-modal-content';

        // 模態框標題
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h3><i class="fas fa-list-alt"></i> 測驗答案總覽</h3>
            <button class="close-modal" id="closeAnswerModal">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 模態框內容
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';

        // 創建答案列表
        const answersList = this.createAnswersList();
        modalBody.appendChild(answersList);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modal.appendChild(modalContent);

        // 添加到頁面
        document.body.appendChild(modal);

        // 綁定關閉事件
        this.bindModalEvents(modal);

        // 顯示模態框
        modal.classList.add('show');
    }

    /**
     * 創建答案列表
     */
    createAnswersList() {
        const container = document.createElement('div');
        container.className = 'answers-list';

        // 添加摘要信息
        const summary = document.createElement('div');
        summary.className = 'answers-summary';
        summary.innerHTML = `
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-label">總題數：</span>
                    <span class="stat-value">${this.questions.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">正確率：</span>
                    <span class="stat-value">${Math.round((this.score / this.questions.length) * 100)}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">得分：</span>
                    <span class="stat-value">${this.score}/${this.questions.length}</span>
                </div>
            </div>
        `;
        container.appendChild(summary);

        // 創建問題列表
        const questionsList = document.createElement('div');
        questionsList.className = 'questions-list';

        this.questions.forEach((question, index) => {
            const userAnswerInfo = this.answers.find(a => a.question === question);
            const isCorrect = userAnswerInfo ? userAnswerInfo.isCorrect : false;

            const questionItem = document.createElement('div');
            questionItem.className = `question-item ${isCorrect ? 'correct' : 'incorrect'}`;

            const questionContent = this.formatQuestionForReview(question, index + 1, userAnswerInfo);
            questionItem.innerHTML = questionContent;

            questionsList.appendChild(questionItem);
        });

        container.appendChild(questionsList);
        return container;
    }

    /**
     * 格式化問題供查看
     */
    formatQuestionForReview(question, questionNumber, userAnswerInfo) {
        const isCorrect = userAnswerInfo ? userAnswerInfo.isCorrect : false;
        const statusIcon = isCorrect ?
            '<i class="fas fa-check-circle correct-icon"></i>' :
            '<i class="fas fa-times-circle incorrect-icon"></i>';

        let questionDisplay = '';
        let correctAnswerDisplay = '';
        let userAnswerDisplay = '';

        // 根據題型格式化顯示
        switch (question.type) {
            case 'multiple-choice':
                questionDisplay = `<strong>Q${questionNumber}:</strong> ${question.question}`;
                correctAnswerDisplay = `<strong>正確答案：</strong>${question.correct}`;

                if (question.userAnswer) {
                    userAnswerDisplay = `<strong>你的答案：</strong>${question.userAnswer}`;
                }

                // 顯示所有選項
                const optionsDisplay = question.options.map(option => {
                    let optionClass = '';
                    if (option === question.correct) {
                        optionClass = 'correct-option';
                    } else if (option === question.userAnswer && !isCorrect) {
                        optionClass = 'wrong-option';
                    }
                    return `<span class="option ${optionClass}">${option}</span>`;
                }).join(' ');

                return `
                    <div class="question-header">
                        ${statusIcon}
                        <div class="question-info">
                            <div class="question-text">${questionDisplay}</div>
                            <div class="word-info">
                                <span class="word-detail"><strong>單字：</strong>${question.word.english}</span>
                                <span class="word-detail"><strong>中文：</strong>${question.word.chinese}</span>
                                <span class="word-detail"><strong>定義：</strong>${question.word.definition}</span>
                            </div>
                        </div>
                    </div>
                    <div class="answer-details">
                        <div class="options-container">${optionsDisplay}</div>
                        <div class="answer-info">
                            <div class="correct-answer">${correctAnswerDisplay}</div>
                            ${userAnswerDisplay ? `<div class="user-answer">${userAnswerDisplay}</div>` : ''}
                        </div>
                    </div>
                `;
                break;

            case 'fill-blank':
                questionDisplay = `<strong>Q${questionNumber}:</strong> ${question.question}`;
                correctAnswerDisplay = `<strong>正確答案：</strong>${question.correct}`;

                if (question.userAnswer) {
                    userAnswerDisplay = `<strong>你的答案：</strong>${question.userAnswer}`;
                }

                return `
                    <div class="question-header">
                        ${statusIcon}
                        <div class="question-info">
                            <div class="question-text">${questionDisplay}</div>
                            <div class="word-info">
                                <span class="word-detail"><strong>單字：</strong>${question.word.english}</span>
                                <span class="word-detail"><strong>中文：</strong>${question.word.chinese}</span>
                                <span class="word-detail"><strong>定義：</strong>${question.word.definition}</span>
                            </div>
                        </div>
                    </div>
                    <div class="answer-details">
                        <div class="answer-info">
                            <div class="correct-answer">${correctAnswerDisplay}</div>
                            ${userAnswerDisplay ? `<div class="user-answer">${userAnswerDisplay}</div>` : ''}
                        </div>
                    </div>
                `;
                break;

            case 'true-false':
                questionDisplay = `<strong>Q${questionNumber}:</strong> ${question.question}`;
                const correctAnswerText = question.correct ? '對' : '錯';
                correctAnswerDisplay = `<strong>正確答案：</strong>${correctAnswerText}`;

                if (question.userAnswer !== null) {
                    const userAnswerText = question.userAnswer ? '對' : '錯';
                    userAnswerDisplay = `<strong>你的答案：</strong>${userAnswerText}`;
                }

                return `
                    <div class="question-header">
                        ${statusIcon}
                        <div class="question-info">
                            <div class="question-text">${questionDisplay}</div>
                            <div class="word-info">
                                <span class="word-detail"><strong>單字：</strong>${question.word.english}</span>
                                <span class="word-detail"><strong>中文：</strong>${question.word.chinese}</span>
                                <span class="word-detail"><strong>定義：</strong>${question.word.definition}</span>
                            </div>
                        </div>
                    </div>
                    <div class="answer-details">
                        <div class="answer-info">
                            <div class="correct-answer">${correctAnswerDisplay}</div>
                            ${userAnswerDisplay ? `<div class="user-answer">${userAnswerDisplay}</div>` : ''}
                        </div>
                    </div>
                `;
                break;
        }

        return '';
    }

    /**
     * 綁定模態框事件
     */
    bindModalEvents(modal) {
        const closeBtn = modal.querySelector('#closeAnswerModal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeAnswerModal(modal);
            });
        }

        // 點擊模態框背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeAnswerModal(modal);
            }
        });

        // ESC 鍵關閉
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeAnswerModal(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * 關閉答案模態框
     */
    closeAnswerModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // Analytics and statistics
    getQuizStats() {
        const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');

        if (history.length === 0) {
            return null;
        }

        const totalQuizzes = history.length;
        const averageAccuracy = history.reduce((sum, quiz) => sum + quiz.accuracy, 0) / totalQuizzes;
        const bestAccuracy = Math.max(...history.map(quiz => quiz.accuracy));
        const recentTrend = this.calculateTrend(history.slice(-10));

        return {
            totalQuizzes,
            averageAccuracy: Math.round(averageAccuracy),
            bestAccuracy,
            recentTrend
        };
    }

    calculateTrend(recentQuizzes) {
        if (recentQuizzes.length < 2) return 'stable';

        const firstHalf = recentQuizzes.slice(0, Math.floor(recentQuizzes.length / 2));
        const secondHalf = recentQuizzes.slice(Math.floor(recentQuizzes.length / 2));

        const firstAvg = firstHalf.reduce((sum, quiz) => sum + quiz.accuracy, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, quiz) => sum + quiz.accuracy, 0) / secondHalf.length;

        const difference = secondAvg - firstAvg;

        if (difference > 5) return 'improving';
        if (difference < -5) return 'declining';
        return 'stable';
    }
}


