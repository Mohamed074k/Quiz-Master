// By Mohamed Elsayed :[www.linkedin.com/in/mohamed-elsayed-2623602a1]
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const welcomeScreen = document.getElementById('welcomeScreen');
    const configScreen = document.getElementById('configScreen');
    const quizScreen = document.getElementById('quizScreen');
    const resultsScreen = document.getElementById('resultsScreen');
    
    const startBtn = document.getElementById('startBtn');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const retryBtn = document.getElementById('retryBtn');
    const newQuizBtn = document.getElementById('newQuizBtn');
    const shareBtn = document.getElementById('shareBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    const categorySelect = document.getElementById('category');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const questionCountBtns = document.querySelectorAll('.question-count-btn');
    
    const progressBar = document.getElementById('progressBar');
    const questionCountDisplay = document.getElementById('questionCountDisplay');
    const timerDisplay = document.getElementById('timer');
    const questionElement = document.getElementById('question');
    const optionsContainer = document.getElementById('options');
    const questionContainer = document.getElementById('questionContainer');
    
    const scorePercentage = document.getElementById('scorePercentage');
    const scoreText = document.getElementById('scoreText');
    const correctAnswers = document.getElementById('correctAnswers');
    const wrongAnswers = document.getElementById('wrongAnswers');
    const skippedAnswers = document.getElementById('skippedAnswers');
    document.getElementById('skipBtn').addEventListener('click', skipQuestion);

    const confettiCanvas = document.getElementById('confettiCanvas');
    
    // Quiz Variables
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let skipped = 0;
    let timeLeft = 15;
    let quizConfig = {
        category: '9',
        difficulty: 'easy',
        amount: 5
    };
    
    
    
    // Event Listeners
    startBtn.addEventListener('click', showConfigScreen);
    startQuizBtn.addEventListener('click', startQuiz);
    retryBtn.addEventListener('click', retryQuiz);
    newQuizBtn.addEventListener('click', showConfigScreen);
    shareBtn.addEventListener('click', shareResults);
    nextBtn.addEventListener('click', showNextQuestion);
    
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn));
    });
    
    questionCountBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.question-count-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            quizConfig.amount = parseInt(this.dataset.count);
        });
    });
    
    // Initialize
    setDifficulty(document.querySelector('.difficulty-btn.active'));
    
    // Functions
    function showConfigScreen() {
        welcomeScreen.classList.add('hidden');
        resultsScreen.classList.add('hidden');
        configScreen.classList.remove('hidden');
    }
    
    function setDifficulty(btn) {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        quizConfig.difficulty = btn.dataset.difficulty;
        
        // Remove the restriction for hard difficulty
        questionCountBtns.forEach(btn => btn.disabled = false);
    }
    
    async function startQuiz() {
        // Show loading state
        const spinner = startQuizBtn.querySelector('.spinner');
        const btnText = startQuizBtn.querySelector('.btn-text');
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        startQuizBtn.disabled = true;
        skipped = 0;
        score = 0;
        
        try {
            // Get selected category
            const selectedCategory = categorySelect.value;
            const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
            
            // Use local questions instead of API
            if (window.quizQuestions[selectedCategory] && window.quizQuestions[selectedCategory][quizConfig.difficulty]) {
                const categoryQuestions = window.quizQuestions[selectedCategory][quizConfig.difficulty];
                const shuffledQuestions = shuffleArray([...categoryQuestions]).slice(0, quizConfig.amount);
                
                questions = shuffledQuestions.map(question => {
                    const answers = [...question.incorrect_answers, question.correct_answer];
                    return {
                        ...question,
                        category: categoryName,
                        answers: shuffleArray(answers),
                        correct_answer: question.correct_answer
                    };
                });
                
                configScreen.classList.add('hidden');
                quizScreen.classList.remove('hidden');
                currentQuestionIndex = 0;
                showQuestion();
            } else {
                throw new Error('No questions available for this category and difficulty');
            }
        } catch (error) {
            console.error('Error starting quiz:', error);
            alert('Failed to start quiz. Please try again.');
        } finally {
            // Reset button state
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            startQuizBtn.disabled = false;
        }
    }
    
    function skipQuestion() {
        clearInterval(timer);
        skipped++;
        
        const buttons = optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(button => {
          button.disabled = true;
          
          // Mark correct answer
          const currentQuestion = questions[currentQuestionIndex];
          if (button.textContent === decodeHtmlEntities(currentQuestion.correct_answer)) {
            button.classList.add('correct');
            
            const icon = document.createElement('span');
            icon.classList.add('answer-icon');
            icon.innerHTML = '✓';
            button.appendChild(icon);
          }
        });
        
        // Show next button
        nextBtn.classList.remove('hidden');
        nextBtn.focus();
      }
      

    function showQuestion() {
        resetState();
        const currentQuestion = questions[currentQuestionIndex];
        const questionNumber = currentQuestionIndex + 1;
        
        // Update progress
        progressBar.style.width = `${(questionNumber / questions.length) * 100}%`;
        questionCountDisplay.textContent = `Question ${questionNumber}/${questions.length}`;
        
        // Set category and question text
        questionContainer.setAttribute('data-category', currentQuestion.category);
        questionElement.textContent = decodeHtmlEntities(currentQuestion.question);
        
        // Create answer buttons
        currentQuestion.answers.forEach(answer => {
            const button = document.createElement('button');
            button.classList.add('option-btn');
            button.textContent = decodeHtmlEntities(answer);
            button.addEventListener('click', () => selectAnswer(answer));
            optionsContainer.appendChild(button);
        });
        
        // Start timer
        startTimer();
    }
    
    function startTimer() {
        timeLeft = 15;
        updateTimerDisplay();
        timerDisplay.classList.remove('warning');
        
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 5) {
                timerDisplay.classList.add('warning');
                if (timeLeft <= 3) {
                    playSound('timer');
                }
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                handleTimeOut();
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        timerDisplay.textContent = `${timeLeft}s`;
        
        // Visual feedback for low time
        if (timeLeft <= 5) {
            timerDisplay.style.color = 'var(--timer-warning)';
        } else {
            timerDisplay.style.color = 'inherit';
        }
    }
    
    function resetState() {
        clearInterval(timer);
        nextBtn.classList.add('hidden');
        while (optionsContainer.firstChild) {
            optionsContainer.removeChild(optionsContainer.firstChild);
        }
    }
    
    function selectAnswer(selectedAnswer) {
        clearInterval(timer);
        clearInterval(timer);
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correct_answer;
        
        // Disable all buttons
        const buttons = optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(button => {
            button.disabled = true;
            
            // Mark correct answer in green
            if (button.textContent === decodeHtmlEntities(currentQuestion.correct_answer)) {
                button.classList.add('correct');
                
                // Add checkmark
                const icon = document.createElement('span');
                icon.classList.add('answer-icon');
                icon.innerHTML = '✓';
                button.appendChild(icon);
            }
            
            // Mark selected wrong answer in red
            if (button.textContent === decodeHtmlEntities(selectedAnswer) && !isCorrect) {
                button.classList.add('wrong');
                
                // Add cross
                const icon = document.createElement('span');
                icon.classList.add('answer-icon');
                icon.innerHTML = '✕';
                button.appendChild(icon);
            }
        });
        
        // Update score if correct
        if (isCorrect) {
            score++;
            playSound('correct');
        } else {
            playSound('wrong');
         }
        
        // Show next button with delay
        setTimeout(() => {
            nextBtn.classList.remove('hidden');
            nextBtn.focus();
        }, 1000);
    }
    
    // Sound effects
    function playSound(type) {
        if (typeof Audio === 'undefined') return;
        
        const sounds = {
            correct: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
            wrong: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
            timer: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'
        };
        
        const audio = new Audio(sounds[type]);
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
    
    function handleTimeOut() {
        skipped++; // Count timeouts as skipped questions
        const buttons = optionsContainer.querySelectorAll('.option-btn');
        const currentQuestion = questions[currentQuestionIndex];
        
        buttons.forEach(button => {
            button.disabled = true;
            
            // Mark correct answer
            if (button.textContent === decodeHtmlEntities(currentQuestion.correct_answer)) {
                button.classList.add('correct');
                
                const icon = document.createElement('span');
                icon.classList.add('answer-icon');
                icon.innerHTML = '✓';
                button.appendChild(icon);
            }
        });
        
        // Show next button
        setTimeout(() => {
            nextBtn.classList.remove('hidden');
            nextBtn.focus();
        }, 500);
    }

    function showNextQuestion() {
        // Add animation class for question transition
        questionContainer.classList.add('next-question');
        
        setTimeout(() => {
            currentQuestionIndex++;
            
            if (currentQuestionIndex < questions.length) {
                questionContainer.classList.remove('next-question');
                questionContainer.classList.add('new-question');
                showQuestion();
                
                // Remove new-question class after animation completes
                setTimeout(() => {
                    questionContainer.classList.remove('new-question');
                }, 500);
            } else {
                showResults();
            }
        }, 500);
    }
    
         function showResults() {
            quizScreen.classList.add('hidden');
            resultsScreen.classList.remove('hidden');
            
            const totalQuestions = questions.length;
            const percentage = Math.round((score / totalQuestions) * 100);
            const wrong = totalQuestions - score - skipped; // Calculate wrong answers
            
            // Update results
            scorePercentage.textContent = `${percentage}%`;
            correctAnswers.textContent = score;
            wrongAnswers.textContent = wrong;
            skippedAnswers.textContent = skipped; // This now shows actual skipped count
            
            // Set score circle animation
            const scoreCircle = document.querySelector('.score-circle');
            scoreCircle.style.setProperty('--percentage', `${percentage}%`);
            
        // Set score text based on performance
        if (percentage >= 80) {
            scoreText.textContent = 'Excellent! You really know your stuff!';
            triggerConfetti();
        } else if (percentage >= 60) {
            scoreText.textContent = 'Good job! Keep learning!';
        } else if (percentage >= 40) {
            scoreText.textContent = 'Not bad! Try again to improve!';
        } else {
            scoreText.textContent = 'Keep practicing! You can do better!';
        }
    }
    
    function retryQuiz() {
        resultsScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        currentQuestionIndex = 0;
        score = 0;
        skipped = 0;
        
        // Reset all counters
        correctAnswers.textContent = '0';
        wrongAnswers.textContent = '0';
        skippedAnswers.textContent = '0';
        
        // Reset the progress bar
        progressBar.style.width = '0%';
        
        // Immediately show the first question without animation
        questionContainer.classList.remove('next-question', 'new-question');
                showQuestion();
    }
    
    function shareResults() {
        const percentage = Math.round((score / questions.length) * 100);
        const shareText = `I scored ${percentage}% on QuizMaster! Can you beat my score?`;
        
        if (navigator.share) {
            navigator.share({
                title: 'QuizMaster Results',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
                fallbackShare(shareText);
            });
        } else {
            fallbackShare(shareText);
        }
    }
    
    function fallbackShare(shareText) {
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Results copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert('Share functionality not available. Your score: ' + shareText);
        });
    }
    
    function triggerConfetti() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        
        const confettiCtx = confettiCanvas.getContext('2d');
        const pieces = [];
        const colors = ['#7c4dff', '#ff6d00', '#4CAF50', '#f44336', '#2196F3'];
        
        // Create confetti pieces
        for (let i = 0; i < 150; i++) {
            pieces.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                r: Math.random() * 4 + 1,
                d: Math.random() * 15 + 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5
            });
        }
        
        const startTime = Date.now();
        
        function drawConfetti() {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            
            pieces.forEach(p => {
                confettiCtx.save();
                confettiCtx.translate(p.x, p.y);
                confettiCtx.rotate(p.rotation * Math.PI / 180);
                confettiCtx.fillStyle = p.color;
                confettiCtx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
                confettiCtx.restore();
                
                p.y += p.r / 2;
                p.rotation += p.rotationSpeed;
                
                if (p.y > confettiCanvas.height) {
                    p.y = -20;
                    p.x = Math.random() * confettiCanvas.width;
                }
            });
            
            if (Date.now() - startTime < 3000) {
                requestAnimationFrame(drawConfetti);
            } else {
                confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            }
        }
        
        drawConfetti();
    }
    
    // Helper Functions
    function decodeHtmlEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }
    
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
});
