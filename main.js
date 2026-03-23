// ========= 1. STARTSEITE =========
if (document.body.classList.contains('intro-page')) {
    const characters = document.querySelectorAll('.character-card');
    const messageArea = document.getElementById('messageArea');
    const enterLink = document.getElementById('enterBtn');
    
    function showMessage(name, message) {
        messageArea.innerHTML = `<strong>${name}</strong><br><br>${message}`;
        messageArea.style.opacity = '0';
        setTimeout(() => { messageArea.style.opacity = '1'; }, 50);
    }
    
    characters.forEach(card => {
        card.addEventListener('click', () => {
            const nameElem = card.querySelector('.character-name');
            const name = nameElem ? nameElem.innerText : '';
            const hiddenMsg = card.querySelector('.hidden-message');
            if (hiddenMsg) {
                showMessage(name, hiddenMsg.innerText);
            }
            if (typeof canvasConfetti !== 'undefined') {
                canvasConfetti({ particleCount: 30, spread: 40, origin: { y: 0.7 }, colors: ['#c53030', '#e6b422'] });
            }
        });
    });
    
    if (enterLink) {
        enterLink.addEventListener('click', (e) => {
            if (typeof canvasConfetti !== 'undefined') {
                canvasConfetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            }
        });
    }
}

// ========= 2. HAUPTSEITE =========
else if (document.body.classList.contains('case-page')) {
    
    // ---------- DATUMSFUNKTIONEN ----------
    function isBirthdayToday() {
        const today = new Date();
        return today.getDate() === 9 && today.getMonth() === 8;
    }
    
    function isUnlockedForever() {
        const unlocked = localStorage.getItem('viviana_birthday_unlocked');
        if (unlocked === 'true') return true;
        if (isBirthdayToday()) {
            localStorage.setItem('viviana_birthday_unlocked', 'true');
            return true;
        }
        return false;
    }
    
    function getDaysUntilBirthday() {
        const today = new Date();
        let birthday = new Date(today.getFullYear(), 8, 9);
        if (birthday < today) birthday.setFullYear(today.getFullYear() + 1);
        const diff = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    }
    
    // ---------- MOMENTE ----------
    let moments = [];
    
    function loadMoments() {
        const saved = localStorage.getItem('viviana_momente');
        if (saved) {
            moments = JSON.parse(saved);
        } else {
            moments = [];
        }
        renderMoments();
    }
    
    function saveMoments() {
        localStorage.setItem('viviana_momente', JSON.stringify(moments));
    }
    
    function getCurrentTimestamp() {
        const now = new Date();
        return `${now.toLocaleDateString('de-DE')} um ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    function addMoment(type, title, description, imageData = null) {
        const newMoment = {
            id: Date.now(),
            type: type,
            title: title,
            description: description,
            imageData: imageData,
            timestamp: getCurrentTimestamp()
        };
        moments.unshift(newMoment);
        saveMoments();
        renderMoments();
    }
    
    function deleteMoment(id) {
        moments = moments.filter(m => m.id !== id);
        saveMoments();
        renderMoments();
    }
    
    function renderMoments() {
        const container = document.getElementById('momentsList');
        if (!container) return;
        
        if (moments.length === 0) {
            container.innerHTML = '<div class="empty-moments">✨ Noch keine Momente gespeichert. Füge deinen ersten hinzu! ✨</div>';
            return;
        }
        
        container.innerHTML = '';
        moments.forEach(moment => {
            let badgeClass = 'badge-criminal';
            let badgeText = '🔍 Criminal Minds';
            if (moment.type === 'greys') {
                badgeClass = 'badge-greys';
                badgeText = '🩺 Grey\'s Anatomy';
            } else if (moment.type === 'life') {
                badgeClass = 'badge-life';
                badgeText = '💫 Aus dem echten Leben';
            } else if (moment.type === 'both') {
                badgeClass = 'badge-both';
                badgeText = '🌟 Allgemein / Beides';
            }
            
            const momentDiv = document.createElement('div');
            momentDiv.className = 'moment-item';
            
            let imageHtml = '';
            if (moment.imageData) {
                imageHtml = `<img src="${moment.imageData}" class="moment-image" alt="Bild zum Moment">`;
            }
            
            momentDiv.innerHTML = `
                <span class="moment-series-badge ${badgeClass}">${badgeText}</span>
                <button class="delete-moment" data-id="${moment.id}">🗑️ Löschen</button>
                ${imageHtml}
                <div class="moment-title">${escapeHtml(moment.title)}</div>
                <div class="moment-description">${escapeHtml(moment.description)}</div>
                <div class="moment-timestamp">📅 ${moment.timestamp}</div>
            `;
            container.appendChild(momentDiv);
        });
        
        document.querySelectorAll('.delete-moment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                if (confirm('Möchtest du diesen Moment wirklich löschen?')) {
                    deleteMoment(id);
                    if (typeof canvasConfetti !== 'undefined') {
                        canvasConfetti({ particleCount: 30, spread: 30, colors: ['#c53030'] });
                    }
                }
            });
        });
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function setupImagePreview() {
        const imageInput = document.getElementById('momentImage');
        const previewDiv = document.getElementById('imagePreview');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        previewDiv.innerHTML = `<img src="${event.target.result}" class="preview-thumb" alt="Vorschau"><button class="remove-image" id="removeImageBtn">✖ Bild entfernen</button>`;
                        const removeBtn = document.getElementById('removeImageBtn');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', () => {
                                imageInput.value = '';
                                previewDiv.innerHTML = '';
                            });
                        }
                    };
                    reader.readAsDataURL(file);
                } else {
                    previewDiv.innerHTML = '<span class="error">Kein gültiges Bild</span>';
                }
            });
        }
    }
    
    function exportBackup() {
        const data = JSON.stringify(moments, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.download = `viviana_momente_backup_${timestamp}.json`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
        
        const statusDiv = document.getElementById('backupStatus');
        if (statusDiv) {
            statusDiv.innerHTML = '✅ Backup erfolgreich erstellt!';
            statusDiv.style.color = '#2c7a6e';
            setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
        }
    }
    
    function importBackup(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    moments = imported;
                    saveMoments();
                    renderMoments();
                    const statusDiv = document.getElementById('backupStatus');
                    if (statusDiv) {
                        statusDiv.innerHTML = '✅ Momente erfolgreich wiederhergestellt!';
                        statusDiv.style.color = '#2c7a6e';
                        setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
                    }
                    if (typeof canvasConfetti !== 'undefined') {
                        canvasConfetti({ particleCount: 80, spread: 60, colors: ['#e6b422', '#2c7a6e'] });
                    }
                } else {
                    throw new Error('Ungültiges Format');
                }
            } catch (e) {
                const statusDiv = document.getElementById('backupStatus');
                if (statusDiv) {
                    statusDiv.innerHTML = '❌ Fehler: Die Datei ist kein gültiges Backup.';
                    statusDiv.style.color = '#c53030';
                    setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
                }
            }
        };
        reader.readAsText(file);
    }
    
    function setupBackup() {
        const exportBtn = document.getElementById('exportBackupBtn');
        const importBtn = document.getElementById('importBackupBtn');
        const importFile = document.getElementById('importBackupFile');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', exportBackup);
        }
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                importFile.click();
            });
        }
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    importBackup(e.target.files[0]);
                    importFile.value = '';
                }
            });
        }
    }
    
    // ---------- BRIEFE ----------
    const letters = [
        { 
            year: 2025, 
            content: `Liebe Viviana,

zu deinem Geburtstag wünsche ich dir so vieles… aber am meisten wünsche ich dir, dass du immer weißt, wie besonders und toll du bist.

Du kombinierst die Klugheit von Spencer Reid, das Herz von Meredith Grey und die Magie von Belle und dazu noch deine eigene, einzigartige Art, die Menschen um dich herum strahlen zu lassen. Weil du selber so sehr strahlst, dass du es ganz einfach überträgst.

Zudem wünsche ich dir, dass du ALLES in deinem Leben erreichst, was du dir vornimmst. Denk nicht so viel über die anderen nach und kümmere dich auch mal um dich. Denn DU bist das wichtigste! Du bist eine Bereicherung für diese Welt und ich bin wirklich sehr froh darüber, dass ich dich kennenlernen durfte. Ich weiß zwar nicht genau, womit ich das verdient habe, weswegen ich noch dankbarer bin.

Das sage ich zwar immer und wahrscheinlich hast du es auch ziemlich satt, aber falls du was brauchst oder auch nicht brauchst. Ich bin da für dich.
Für dich alles!

Alles Liebe,
Marley`, 
            isFuture: false 
        },
        { 
            year: 2026, 
            content: "✨ Hier entsteht nächstes Jahr dein nächster Brief ✨ Ich werde ihn rechtzeitig füllen – versprochen!", 
            isFuture: true 
        },
        { 
            year: 2027, 
            content: "✨ Ein weiteres Jahr, ein weiterer Brief – ich freue mich darauf, ihn zu schreiben! ✨", 
            isFuture: true 
        }
    ];
    
    function renderLetters() {
        const container = document.getElementById('lettersList');
        if (!container) return;
        container.innerHTML = '';
        letters.forEach(letter => {
            const card = document.createElement('div');
            card.className = `letter-card ${letter.isFuture ? 'future-letter' : ''}`;
            card.innerHTML = `
                <div class="letter-date">📅 ${letter.year}</div>
                <div class="letter-content">${letter.content.replace(/\n/g, '<br>')}</div>
            `;
            container.appendChild(card);
        });
    }
    
    // ---------- QUIZ ----------
    const quizQuestions = [
        { question: "Wie heißt Dr. Spencer Reids Mutter?", options: ["Dr. Elizabeth Reid", "Diana Reid", "Dr. Margaret Reid", "Sarah Reid"], correct: 1, series: "CM" },
        { question: "Welcher Spitzname gibt Penelope Garcia Derek Morgan?", options: ["Sweet Cheeks", "Baby Boy", "Chocolate Thunder", "Hot Stuff"], correct: 2, series: "CM" },
        { question: "Welches Team leitet Aaron Hotchner?", options: ["SWAT", "BAU", "FUGITIVE", "CTU"], correct: 1, series: "CM" },
        { question: "Wie heißt die Schauspielerin von Penelope Garcia?", options: ["A.J. Cook", "Kirsten Vangsness", "Paget Brewster", "Shemar Moore"], correct: 1, series: "CM" },
        { question: "Welcher Charakter sagt 'Wheels up'?", options: ["Derek Morgan", "David Rossi", "Aaron Hotchner", "Emily Prentiss"], correct: 2, series: "CM" },
        { question: "Wie heißt Meredith Greys Mutter?", options: ["Dr. Addison Montgomery", "Dr. Ellis Grey", "Dr. Catherine Fox", "Dr. Susan Grey"], correct: 1, series: "GA" },
        { question: "Welcher Charakter sagt 'It's a beautiful day to save lives'?", options: ["Derek Shepherd", "Meredith Grey", "Miranda Bailey", "Richard Webber"], correct: 0, series: "GA" },
        { question: "Wie heißt das Krankenhaus in Grey's Anatomy?", options: ["Seattle Grace", "Grey Sloan Memorial", "Beide Namen", "Seattle Presbyterian"], correct: 2, series: "GA" },
        { question: "Welcher Song ist untrennbar mit Grey's Anatomy verbunden?", options: ["Chasing Cars", "How to Save a Life", "Beide", "Fix You"], correct: 2, series: "GA" },
        { question: "Wie heißt Derek Shepherds Spitzname?", options: ["McDreamy", "McSteamy", "McDreamy & McSteamy", "Dr. Dream"], correct: 0, series: "GA" },
        { question: "Welcher Charakter ist in beiden Serien ein FBI-Profilier?", options: ["Dr. Spencer Reid", "Derek Morgan", "Dr. Aaron Hotchner", "Keiner"], correct: 3, series: "Mix" },
        { question: "Wie viele Staffeln hat Criminal Minds?", options: ["10", "12", "15", "17"], correct: 2, series: "Mix" }
    ];
    
    let currentQuestion = 0;
    let score = 0;
    let quizAnswered = false;
    
    function loadQuizQuestion() {
        const q = quizQuestions[currentQuestion];
        const seriesBadge = q.series === 'CM' ? '🔍 Criminal Minds' : (q.series === 'GA' ? '🩺 Grey\'s Anatomy' : '🌟 Mix');
        const qElem = document.getElementById('quizQuestion');
        if (qElem) {
            qElem.innerHTML = `<p><strong>Frage ${currentQuestion + 1}/${quizQuestions.length}</strong> <span style="font-size:0.8rem; color:#b87c4f;">(${seriesBadge})</span><br>${q.question}</p>`;
        }
        
        const optionsDiv = document.getElementById('quizOptions');
        if (optionsDiv) {
            optionsDiv.innerHTML = '';
            q.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.innerText = opt;
                btn.addEventListener('click', () => handleQuizAnswer(btn, idx === q.correct));
                optionsDiv.appendChild(btn);
            });
        }
        
        const feedbackDiv = document.getElementById('quizFeedback');
        if (feedbackDiv) feedbackDiv.innerHTML = '';
        
        const nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn) nextBtn.style.display = 'none';
        
        quizAnswered = false;
    }
    
    function handleQuizAnswer(btn, isCorrect) {
        if (quizAnswered) return;
        quizAnswered = true;
        
        const feedbackDiv = document.getElementById('quizFeedback');
        if (isCorrect) {
            score++;
            if (feedbackDiv) feedbackDiv.innerHTML = '✅ Richtig! Gut gemacht!';
            btn.classList.add('correct');
        } else {
            const correctAnswer = quizQuestions[currentQuestion].options[quizQuestions[currentQuestion].correct];
            if (feedbackDiv) feedbackDiv.innerHTML = `❌ Leider falsch. Die richtige Antwort wäre: ${correctAnswer}`;
            btn.classList.add('wrong');
        }
        
        const allOptions = document.querySelectorAll('.quiz-option');
        allOptions.forEach(opt => opt.style.pointerEvents = 'none');
        
        const nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn) {
            nextBtn.style.display = 'block';
            if (currentQuestion + 1 === quizQuestions.length) {
                nextBtn.innerText = 'Ergebnis anzeigen';
            }
        }
    }
    
    function nextQuizQuestion() {
        if (currentQuestion + 1 < quizQuestions.length) {
            currentQuestion++;
            loadQuizQuestion();
        } else {
            showQuizResult();
        }
    }
    
    function showQuizResult() {
        const percentage = (score / quizQuestions.length) * 100;
        let message = '';
        let emoji = '';
        if (percentage === 100) {
            message = '🏆 Perfekt! Du bist ein echter Profiler & Chirurg! Du kennst beide Serien in- und auswendig!';
            emoji = '🏆🎉';
        } else if (percentage >= 80) {
            message = '🎉 Hervorragend! Du kennst dich richtig gut aus! Ein paar Folgen mehr und du bist Profi!';
            emoji = '🎉📺';
        } else if (percentage >= 60) {
            message = '👍 Gut gemacht! Noch ein bisschen Binge-Watching und du kennst alles!';
            emoji = '👍🍿';
        } else {
            message = '📺 Weiter so! Es gibt noch so viele tolle Folgen zu entdecken!';
            emoji = '📺💪';
        }
        
        const resultDiv = document.getElementById('quizResult');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <p>✨ Du hast <strong>${score}</strong> von <strong>${quizQuestions.length}</strong> Fragen richtig beantwortet ✨</p>
                <p>${emoji} ${message}</p>
            `;
            resultDiv.style.display = 'block';
        }
        
        const nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn) nextBtn.style.display = 'none';
        
        const optionsDiv = document.getElementById('quizOptions');
        if (optionsDiv) optionsDiv.innerHTML = '<p style="text-align:center;">✨ Quiz abgeschlossen! ✨</p>';
        
        if (typeof canvasConfetti !== 'undefined') {
            canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#e6b422', '#c53030', '#2c7a6e'] });
        }
    }
    
    // ---------- BLUR-EFFEKT ----------
    function updateBlurEffect() {
        const isUnlocked = isUnlockedForever();
        const profileContent = document.querySelector('#tab-profile .file-content');
        
        if (profileContent) {
            if (!isUnlocked) {
                profileContent.style.filter = 'blur(6px)';
                profileContent.style.transition = 'filter 0.5s ease';
                if (!document.getElementById('blurHint')) {
                    const hint = document.createElement('div');
                    hint.id = 'blurHint';
                    hint.className = 'blur-hint';
                    hint.innerHTML = '🔒 Diese Akte wird am <strong>9. September</strong> freigeschaltet 🔒';
                    profileContent.parentElement.insertBefore(hint, profileContent);
                }
            } else {
                profileContent.style.filter = 'blur(0px)';
                const hint = document.getElementById('blurHint');
                if (hint) hint.remove();
            }
        }
    }
    
    // ---------- SPERR-LOGIK ----------
    function updateLockedTabs() {
        const isUnlocked = isUnlockedForever();
        const lettersTab = document.getElementById('lettersTabBtn');
        const momentsTab = document.getElementById('momentsTabBtn');
        const quizTab = document.getElementById('quizTabBtn');
        
        if (lettersTab) lettersTab.innerHTML = isUnlocked ? '💌 Briefe & Erinnerungen' : '💌 Briefe & Erinnerungen 🔒';
        if (momentsTab) momentsTab.innerHTML = isUnlocked ? '📸 Momente' : '📸 Momente 🔒';
        if (quizTab) quizTab.innerHTML = isUnlocked ? '❓ Serien-Quiz' : '❓ Serien-Quiz 🔒';
        
        const lettersLocked = document.getElementById('lettersLocked');
        const lettersUnlocked = document.getElementById('lettersUnlocked');
        const momentsLocked = document.getElementById('momentsLocked');
        const momentsUnlocked = document.getElementById('momentsUnlocked');
        const quizLocked = document.getElementById('quizLocked');
        const quizUnlocked = document.getElementById('quizUnlocked');
        
        if (lettersLocked && lettersUnlocked) {
            if (isUnlocked) {
                lettersLocked.style.display = 'none';
                lettersUnlocked.style.display = 'block';
                renderLetters();
            } else {
                lettersLocked.style.display = 'block';
                lettersUnlocked.style.display = 'none';
            }
        }
        if (momentsLocked && momentsUnlocked) {
            if (isUnlocked) {
                momentsLocked.style.display = 'none';
                momentsUnlocked.style.display = 'block';
                loadMoments();
                setupImagePreview();
                setupBackup();
            } else {
                momentsLocked.style.display = 'block';
                momentsUnlocked.style.display = 'none';
            }
        }
        if (quizLocked && quizUnlocked) {
            if (isUnlocked) {
                quizLocked.style.display = 'none';
                quizUnlocked.style.display = 'block';
                currentQuestion = 0;
                score = 0;
                loadQuizQuestion();
            } else {
                quizLocked.style.display = 'block';
                quizUnlocked.style.display = 'none';
            }
        }
        
        updateBlurEffect();
    }
    
    // ---------- TAB-FUNKTION ----------
    function initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                const targetContent = document.getElementById(`tab-${tabId}`);
                
                if (tabId === 'letters' && !isUnlockedForever()) return;
                if (tabId === 'moments' && !isUnlockedForever()) return;
                if (tabId === 'quiz' && !isUnlockedForever()) return;
                
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                if (targetContent) targetContent.classList.add('active');
                
                if (tabId === 'profile') {
                    updateBlurEffect();
                }
            });
        });
    }
    
    // ---------- ROSE ----------
    const canvas = document.getElementById('roseCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        
        const TOTAL_PETALS = 10;
        let currentPetals = TOTAL_PETALS;
        let bloomingAnimation = null;
        
        function drawEnchantedRose(petalCount) {
            ctx.clearRect(0, 0, 200, 200);
            ctx.beginPath();
            ctx.moveTo(100, 140);
            ctx.lineTo(98, 175);
            ctx.lineTo(102, 175);
            ctx.fillStyle = '#3a6b2f';
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(100, 140);
            ctx.lineTo(90, 165);
            ctx.lineTo(98, 168);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(100, 140);
            ctx.lineTo(110, 165);
            ctx.lineTo(102, 168);
            ctx.fill();
            ctx.fillStyle = '#5a3a1a';
            ctx.beginPath();
            ctx.moveTo(96, 155);
            ctx.lineTo(92, 152);
            ctx.lineTo(94, 158);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(104, 157);
            ctx.lineTo(108, 154);
            ctx.lineTo(106, 160);
            ctx.fill();
            ctx.fillStyle = '#4c7a3a';
            ctx.beginPath();
            ctx.ellipse(85, 148, 12, 6, -0.3, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(115, 150, 12, 6, 0.3, 0, Math.PI*2);
            ctx.fill();
            
            const centerX = 100, centerY = 105;
            for (let i = 0; i < petalCount; i++) {
                const angle = (i / TOTAL_PETALS) * Math.PI * 2 - Math.PI/2;
                const x = centerX + Math.cos(angle) * 24;
                const y = centerY + Math.sin(angle) * 20;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI*2);
                ctx.fillStyle = `rgba(210, 65, 85, 0.85)`;
                ctx.fill();
                ctx.fillStyle = `rgba(180, 45, 65, 0.9)`;
                ctx.beginPath();
                ctx.ellipse(-2, -2, 6, 4, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
            }
            const innerCount = Math.min(5, petalCount);
            for (let i = 0; i < innerCount; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * 12;
                const y = centerY + Math.sin(angle) * 10 - 5;
                ctx.beginPath();
                ctx.ellipse(x, y, 10, 8, angle, 0, Math.PI*2);
                ctx.fillStyle = '#c73b4b';
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(centerX, centerY-2, 10, 0, Math.PI*2);
            ctx.fillStyle = '#e6b83e';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX, centerY-3, 6, 0, Math.PI*2);
            ctx.fillStyle = '#f5d742';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX, centerY-4, 3, 0, Math.PI*2);
            ctx.fillStyle = '#ffea80';
            ctx.fill();
            
            const fallen = TOTAL_PETALS - petalCount;
            if (fallen > 0) {
                for (let i = 0; i < fallen * 2; i++) {
                    ctx.beginPath();
                    ctx.ellipse(70 + Math.random() * 60, 150 + Math.random() * 40, 5, 3, Math.random() * Math.PI, 0, Math.PI*2);
                    ctx.fillStyle = `rgba(180, 55, 70, 0.5)`;
                    ctx.fill();
                }
            }
        }
        
        function startBloomingAnimation() {
            if (bloomingAnimation) clearInterval(bloomingAnimation);
            let step = 0;
            bloomingAnimation = setInterval(() => {
                if (step <= TOTAL_PETALS) {
                    drawEnchantedRose(step);
                    step++;
                } else {
                    clearInterval(bloomingAnimation);
                    bloomingAnimation = null;
                }
            }, 150);
        }
        
        function updateRoseAndCountdown() {
            const daysLeft = getDaysUntilBirthday();
            const countdownEl = document.getElementById('countdownDays');
            if (countdownEl) countdownEl.innerText = daysLeft;
            
            const isUnlocked = isUnlockedForever();
            
            if (!isUnlocked) {
                let petals = TOTAL_PETALS;
                if (daysLeft <= 30) {
                    petals = Math.max(2, Math.floor(TOTAL_PETALS * (1 - (30 - daysLeft) / 35)));
                } else if (daysLeft <= 100) {
                    petals = Math.max(4, Math.floor(TOTAL_PETALS * (1 - (daysLeft - 30) / 100)));
                } else {
                    petals = TOTAL_PETALS - 2;
                }
                currentPetals = petals;
                drawEnchantedRose(petals);
            } else {
                if (currentPetals !== TOTAL_PETALS && !bloomingAnimation) {
                    startBloomingAnimation();
                }
                currentPetals = TOTAL_PETALS;
            }
        }
        
        function showLockedMessage(element, msg) {
            const original = element.innerText;
            element.innerText = msg;
            setTimeout(() => { element.innerText = original; }, 1800);
        }
        
        const roseWrapper = document.getElementById('roseCanvasWrapper');
        const secretDiv = document.getElementById('secretMsg');
        const roseHint = document.getElementById('roseHint');
        const celebrateBtn = document.getElementById('celebrateBtn');
        const yearSpan = document.getElementById('currentYear');
        if (yearSpan) yearSpan.innerText = new Date().getFullYear();
        
        updateRoseAndCountdown();
        setInterval(updateRoseAndCountdown, 3600000);
        
        if (roseWrapper) {
            roseWrapper.addEventListener('click', () => {
                if (isUnlockedForever()) {
                    if (secretDiv) secretDiv.classList.add('show');
                    if (typeof canvasConfetti !== 'undefined') {
                        canvasConfetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#e6b422', '#c73b4b', '#d4af37'] });
                    }
                    if (roseHint) roseHint.innerHTML = '🌹✨ Die Verzauberung ist gebrochen! Die Rose erblüht für dich ✨🌹';
                    setTimeout(() => {
                        if (roseHint && roseHint.innerHTML !== '🌹 Berühre die verzauberte Rose 🌹')
                            roseHint.innerHTML = '🌹 Berühre die verzauberte Rose 🌹';
                    }, 2500);
                } else {
                    if (roseHint) showLockedMessage(roseHint, '🔒 Diese Akte ist noch versiegelt bis zum 9. September.');
                }
            });
        }
        
        // ---------- CHARAKTER-GRATULATION ----------
        const overlay = document.getElementById('charactersOverlay');
        const congratsGrid = document.getElementById('congratsGrid');
        const closeOverlayBtn = document.getElementById('closeOverlayBtn');
        const closeOverlayXBtn = document.getElementById('closeOverlayXBtn');
        
        const congratsData = [
            { name: 'Penelope Garcia', avatar: '🖥️💖', message: 'Happy Birthday, Baby Girl! Du bist das strahlende Herz unseres Teams!' },
            { name: 'Dr. Spencer Reid', avatar: '📚🧠', message: 'Alles Gute! Wusstest du, dass Menschen an ihrem Geburtstag 14% glücklicher sind?' },
            { name: 'Meredith Grey', avatar: '🩺✨', message: 'Du hast überlebt und bist stärker denn je. Feiere dich!' },
            { name: 'Cristina Yang', avatar: '🔪🧠', message: 'Mach was Großartiges. Heute bist du der Star!' },
            { name: 'Derek Shepherd', avatar: '🧠💙', message: 'Du bist der McDreamy dieses Tages!' },
            { name: 'Miranda Bailey', avatar: '👩‍⚕️⚡', message: 'Hör zu: Du wirst gefeiert. Punkt.' }
        ];
        
        function showCongratsOverlay() {
            if (!congratsGrid) return;
            congratsGrid.innerHTML = '';
            congratsData.forEach(char => {
                const card = document.createElement('div');
                card.className = 'congrats-card';
                card.innerHTML = `
                    <div class="congrats-avatar">${char.avatar}</div>
                    <div class="congrats-name">${char.name}</div>
                    <div class="congrats-message">${char.message}</div>
                `;
                congratsGrid.appendChild(card);
            });
            if (overlay) overlay.style.display = 'flex';
            if (typeof canvasConfetti !== 'undefined') {
                canvasConfetti({ particleCount: 300, spread: 120, origin: { y: 0.6 }, colors: ['#c53030', '#e6b422', '#2c7a6e', '#d4af37'] });
            }
        }
        
        function closeOverlay() {
            if (overlay) overlay.style.display = 'none';
        }
        
        if (closeOverlayBtn) {
            closeOverlayBtn.addEventListener('click', closeOverlay);
        }
        if (closeOverlayXBtn) {
            closeOverlayXBtn.addEventListener('click', closeOverlay);
        }
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeOverlay();
                }
            });
        }
        
        if (celebrateBtn) {
            celebrateBtn.addEventListener('click', () => {
                if (isUnlockedForever()) {
                    showCongratsOverlay();
                    if (secretDiv) secretDiv.classList.add('show');
                    celebrateBtn.innerText = '🎂 ALLES GUTE, VIVIII! 🎂';
                    setTimeout(() => {
                        celebrateBtn.innerText = '🔎 FALL SCHLIESSEN • OP ERFOLGREICH 🎉';
                    }, 3000);
                } else {
                    showLockedMessage(celebrateBtn, '🔒 Feier freigeschaltet am 9. September');
                }
            });
        }
        
        const isUnlocked = isUnlockedForever();
        if (!isUnlocked && secretDiv && !secretDiv.classList.contains('show')) {
            secretDiv.innerHTML = '🔒 <strong>FALL GESPERRT</strong> 🔒<br><br>Die Enthüllung wird am <strong>9. September</strong> freigeschaltet.<br>Kehre an deinem Geburtstag zurück! 🥀✨';
            secretDiv.style.opacity = '0.7';
        } else if (isUnlocked && secretDiv && secretDiv.innerHTML.includes('GESPERRT')) {
            secretDiv.innerHTML = '💛 „Das Märchen, das du suchst, bist du selbst. Special Agent Belle Viviana, du hast das Biest besiegt und den ganzen Grey Sloan OP-Saal zum Jubeln gebracht. Happy Birthday!“ 💛<br>🕵️‍♀️🌹🏥';
            secretDiv.style.opacity = '1';
        }
        
        window.addEventListener('focus', () => {
            updateRoseAndCountdown();
            updateLockedTabs();
        });
    }
    
    // ---------- INITIALISIERUNG ----------
    initTabs();
    updateLockedTabs();
    
    const saveMomentBtn = document.getElementById('saveMomentBtn');
    if (saveMomentBtn) {
        saveMomentBtn.addEventListener('click', () => {
            const type = document.getElementById('momentType').value;
            const title = document.getElementById('momentTitle').value.trim();
            const description = document.getElementById('momentDescription').value.trim();
            const imageInput = document.getElementById('momentImage');
            let imageData = null;
            
            if (!title || !description) {
                alert('Bitte gib einen Titel und eine Beschreibung ein!');
                return;
            }
            
            if (imageInput.files && imageInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imageData = event.target.result;
                    addMoment(type, title, description, imageData);
                    clearMomentForm();
                };
                reader.readAsDataURL(imageInput.files[0]);
            } else {
                addMoment(type, title, description, null);
                clearMomentForm();
            }
            
            if (typeof canvasConfetti !== 'undefined') {
                canvasConfetti({ particleCount: 50, spread: 40, colors: ['#e6b422', '#c53030'] });
            }
        });
    }
    
    function clearMomentForm() {
        document.getElementById('momentTitle').value = '';
        document.getElementById('momentDescription').value = '';
        document.getElementById('momentImage').value = '';
        document.getElementById('imagePreview').innerHTML = '';
    }
    
    // Quiz Next-Button Event
    const nextQuizBtn = document.getElementById('nextQuestionBtn');
    if (nextQuizBtn) {
        nextQuizBtn.addEventListener('click', nextQuizQuestion);
    }
}