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
    
    // Local questions fallback
    const localQuestions = {
        "9": {
            "easy": [
                {
                    "question": "What is the capital of France?",
                    "correct_answer": "Paris",
                    "incorrect_answers": ["London", "Berlin", "Madrid"]
                },
                {
                    "question": "Which planet is closest to the Sun?",
                    "correct_answer": "Mercury",
                    "incorrect_answers": ["Venus", "Earth", "Mars"]
                }
            ],
            "medium": [
                {
                    "question": "In which year did World War II end?",
                    "correct_answer": "1945",
                    "incorrect_answers": ["1943", "1947", "1939"]
                }
            ],
            "hard": [
                {
                    "question": "Who painted the Mona Lisa?",
                    "correct_answer": "Leonardo da Vinci",
                    "incorrect_answers": ["Pablo Picasso", "Vincent van Gogh", "Michelangelo"]
                }
            ]
        },
        "18": {
            "easy": [
                {
                    "question": "What does CPU stand for?",
                    "correct_answer": "Central Processing Unit",
                    "incorrect_answers": ["Computer Processing Unit", "Central Processor Unit", "Computer Processor Unit"]
                }
            ],
            "medium": [
                {
                    "question": "Which programming language is known as the 'language of the web'?",
                    "correct_answer": "JavaScript",
                    "incorrect_answers": ["Python", "Java", "C++"]
                }
            ],
            "hard": [
                {
                    "question": "What does API stand for in programming?",
                    "correct_answer": "Application Programming Interface",
                    "incorrect_answers": ["Application Program Interface", "Automated Programming Interface", "Advanced Programming Interface"]
                }
            ]
        },
        "21": {
            "easy": [
                {
                    "question": "Which country won the 2018 FIFA World Cup?",
                    "correct_answer": "France",
                    "incorrect_answers": ["Croatia", "Belgium", "England"]
                }
            ],
            "medium": [
                {
                    "question": "In basketball, how many points is a free throw worth?",
                    "correct_answer": "1",
                    "incorrect_answers": ["2", "3", "4"]
                }
            ],
            "hard": [
                {
                    "question": "Which tennis player has won the most Grand Slam titles?",
                    "correct_answer": "Margaret Court",
                    "incorrect_answers": ["Serena Williams", "Steffi Graf", "Roger Federer"]
                }
            ]
        },
        "23": {
            "easy": [
                {
                    "question": "Who was the first president of the United States?",
                    "correct_answer": "George Washington",
                    "incorrect_answers": ["Thomas Jefferson", "Abraham Lincoln", "John Adams"]
                }
            ],
            "medium": [
                {
                    "question": "In which year did the Titanic sink?",
                    "correct_answer": "1912",
                    "incorrect_answers": ["1905", "1918", "1923"]
                }
            ],
            "hard": [
                {
                    "question": "Which ancient civilization built the Machu Picchu complex?",
                    "correct_answer": "Incas",
                    "incorrect_answers": ["Aztecs", "Mayans", "Egyptians"]
                }
            ]
        },
        "11": {
            "easy": [
                {
                    "question": "Who played Jack Dawson in Titanic?",
                    "correct_answer": "Leonardo DiCaprio",
                    "incorrect_answers": ["Brad Pitt", "Tom Cruise", "Johnny Depp"]
                }
            ],
            "medium": [
                {
                    "question": "Which movie won the first Academy Award for Best Picture?",
                    "correct_answer": "Wings",
                    "incorrect_answers": ["Sunrise", "The Jazz Singer", "Metropolis"]
                }
            ],
            "hard": [
                {
                    "question": "Who directed the movie 'Pulp Fiction'?",
                    "correct_answer": "Quentin Tarantino",
                    "incorrect_answers": ["Martin Scorsese", "Steven Spielberg", "Christopher Nolan"]
                }
            ]
        }
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
        
        // Adjust question count based on difficulty
        if (quizConfig.difficulty === 'hard') {
            questionCountBtns.forEach(btn => {
                if (parseInt(btn.dataset.count) > 10) btn.disabled = true;
            });
        } else {
            questionCountBtns.forEach(btn => btn.disabled = false);
        }
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
            
            // Fetch questions from API with the selected category
            const apiUrl = `https://opentdb.com/api.php?amount=${quizConfig.amount}&category=${selectedCategory}&difficulty=${quizConfig.difficulty}&type=multiple`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.response_code === 0) {
                questions = data.results.map(question => {
                    // Format and shuffle answers
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
                score = 0;
                showQuestion();
            } else {
                // Fallback to local questions if API fails
                await loadLocalQuestions(selectedCategory, categoryName);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            // Fallback to local questions
            const selectedCategory = categorySelect.value;
            const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
            await loadLocalQuestions(selectedCategory, categoryName);
        } finally {
            // Reset button state
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            startQuizBtn.disabled = false;
        }
    }
    
    // Local questions fallback
    async function loadLocalQuestions(categoryId, categoryName) {
        try {
            // Get questions for selected difficulty
            const categoryQuestions = localQuestions[categoryId] || localQuestions["9"];
            let difficultyQuestions = categoryQuestions[quizConfig.difficulty] || categoryQuestions.easy;
            
            // If not enough questions, use whatever we have
            if (difficultyQuestions.length < quizConfig.amount) {
                difficultyQuestions = difficultyQuestions.slice(0, quizConfig.amount);
            } else {
                // Shuffle and take the required amount
                difficultyQuestions = shuffleArray(difficultyQuestions).slice(0, quizConfig.amount);
            }
            
            questions = difficultyQuestions.map(question => {
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
            score = 0;
            showQuestion();
        } catch (error) {
            console.error('Error loading local questions:', error);
            alert('Failed to load questions. Please try again later.');
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