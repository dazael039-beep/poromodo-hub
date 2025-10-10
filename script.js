document.addEventListener('DOMContentLoaded', () => {
const settingsManager = {
body: document.body,
themeToggle: document.getElementById('theme-toggle'),
animationToggle: document.getElementById('animation-toggle'),
notificationsToggle: document.getElementById('notifications-toggle'),
bgUpload: document.getElementById('bg-upload'),
settingsBtn: document.getElementById('settings-btn'),
aboutBtn: document.getElementById('about-btn'),
musicBtn: document.getElementById('music-btn'),
resetBgBtn: document.getElementById('reset-bg-btn'),
shareBtn: document.getElementById('share-btn'),
fullscreenBtn: document.getElementById('fullscreen-btn'),
aboutContainer: document.getElementById('about-panel-container'),
settingsContainers: document.querySelectorAll('.settings-container'),
musicContainer: document.getElementById('music-panel-container'),
toggleHistoryViewBtn: document.getElementById('toggle-history-view-btn'),
taskHistoryWrapper: document.getElementById('task-history-wrapper'),

init() {
    this.loadThemeColor();
    this.loadTheme();
    this.loadBackground();
    this.addEventListeners();
    this.addGlobalClickListener();
},
addEventListeners() {
    this.themeToggle.addEventListener('change', () => this.toggleTheme());
    this.animationToggle.addEventListener('change', () => animationManager.toggleAnimation());
    this.notificationsToggle.addEventListener('change', () => this.handleNotificationToggle());
    this.bgUpload.addEventListener('change', (e) => this.handleBackgroundUpload(e));
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    this.resetBgBtn.addEventListener('click', () => this.resetBackground());
    this.settingsBtn.addEventListener('click', () => this.toggleSettingsPanel());
    this.musicBtn.addEventListener('click', () => this.toggleMusicPanel());
    this.shareBtn.addEventListener('click', () => this.copyLink());
    this.aboutBtn.addEventListener('click', () => this.toggleAboutPanel());
    this.toggleHistoryViewBtn.addEventListener('click', () => this.toggleHistoryView());

    document.querySelectorAll('.color-option').forEach(button => {
        button.addEventListener('click', (e) => this.setThemeColor(e.currentTarget));
    });

    this.loadNotificationSetting();
},
handleNotificationToggle() {
    if (this.notificationsToggle.checked) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                this.notificationsToggle.checked = (permission === 'granted');
                localStorage.setItem('notificationsEnabled', this.notificationsToggle.checked);
            });
        }
    }
    localStorage.setItem('notificationsEnabled', this.notificationsToggle.checked);
},
loadNotificationSetting() {
    const enabled = localStorage.getItem('notificationsEnabled') === 'true';
    this.notificationsToggle.checked = enabled && Notification.permission === 'granted';
},
setThemeColor(selectedButton) {
    const color = selectedButton.dataset.color;
        const hoverColor = this.adjustColor(color, -20);
            const bgColor = this.generateBackgroundColor(color);

            document.documentElement.style.setProperty('--primary-color', color);
            document.documentElement.style.setProperty('--primary-hover-color', hoverColor);
            document.documentElement.style.setProperty('--bg-color-light', bgColor);
            localStorage.setItem('themeColor', color);

            document.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
            selectedButton.classList.add('active');
        },
        generateBackgroundColor(hex) {
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);

            const newR = Math.round(r * 0.05 + 255 * 0.95);
            const newG = Math.round(g * 0.05 + 255 * 0.95);
            const newB = Math.round(b * 0.05 + 255 * 0.95);

            const toHex = (c) => ('00' + c.toString(16)).slice(-2);
            return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
        },
        loadThemeColor() {
            const savedColor = localStorage.getItem('themeColor') || '#c0b9dd';
            const buttonToActivate = document.querySelector(`.color-option[data-color="${savedColor}"]`);
            if (buttonToActivate) {
                this.setThemeColor(buttonToActivate);
            }
        },
        loadTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                if (savedTheme === 'dark') {
                    this.body.classList.add('dark-mode');
                    this.themeToggle.checked = true;
                }
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.body.classList.add('dark-mode');
                this.themeToggle.checked = true;
            }
        },
        loadBackground() {
            const savedBg = localStorage.getItem('background');
            if (savedBg) {
                this.body.style.backgroundImage = `url(${savedBg})`;
            }
        },
        toggleTheme() {
            this.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', this.body.classList.contains('dark-mode') ? 'dark' : 'light');
        },
        handleBackgroundUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                this.body.style.backgroundImage = `url(${imageUrl})`;
                localStorage.setItem('background', imageUrl);
            };
            reader.readAsDataURL(file);
        },
        resetBackground() {
            this.body.style.backgroundImage = '';
            localStorage.removeItem('background');
            this.bgUpload.value = '';
        },
        toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        },
        toggleSettingsPanel() {
            this.settingsContainers.forEach(container => {
                container.classList.toggle('show');
            });
            if (this.settingsContainers[0].classList.contains('show')) {
                this.musicContainer.classList.remove('show');
                this.aboutContainer.classList.remove('show');
            }
        },
        toggleMusicPanel() {
            this.musicContainer.classList.toggle('show');
            if (this.musicContainer.classList.contains('show')) {
                this.settingsContainers.forEach(container => container.classList.remove('show'));
                this.aboutContainer.classList.remove('show');
            }
        },
        toggleAboutPanel() {
            this.aboutContainer.classList.toggle('show');
            if (this.aboutContainer.classList.contains('show')) {
                this.settingsContainers.forEach(container => container.classList.remove('show'));
                this.musicContainer.classList.remove('show');
            }
        },
        toggleHistoryView() {
            const wrapper = this.taskHistoryWrapper;
            const icon = this.toggleHistoryViewBtn.querySelector('svg');
            wrapper.style.maxHeight = wrapper.style.maxHeight ? null : `${wrapper.scrollHeight}px`;
            icon.style.transform = wrapper.style.maxHeight ? 'rotate(180deg)' : 'rotate(0deg)';
        },
        copyLink() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('Link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy link.');
            });
        },
        adjustColor(hex, percent) {
            let r = parseInt(hex.substring(1, 3), 16);
            let g = parseInt(hex.substring(3, 5), 16);
            let b = parseInt(hex.substring(5, 7), 16);

            r = Math.max(0, Math.min(255, r + (r * percent / 100)));
            g = Math.max(0, Math.min(255, g + (g * percent / 100)));
            b = Math.max(0, Math.min(255, b + (b * percent / 100)));

            const toHex = (c) => ('00' + Math.round(c).toString(16)).slice(-2);

            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        },
        addGlobalClickListener() {
            document.addEventListener('click', (e) => {
                const isClickInsidePanel = e.target.closest('.settings-container, .music-container, .about-container');
                const isClickOnPopupButton = e.target.closest('.popup-btn');

                if (!isClickInsidePanel && !isClickOnPopupButton) {
                    this.settingsContainers.forEach(container => container.classList.remove('show'));
                    this.musicContainer.classList.remove('show');
                    this.aboutContainer.classList.remove('show');
                }
            });
        }
    };

const timerManager = {
    timerDisplay: document.getElementById('timer-display'),
    startBtn: document.getElementById('start-btn'),
    notificationSound: document.getElementById('notification-sound'),
    modeButtons: document.querySelectorAll('.mode-btn'),

    timer: null,
    defaultTime: 25 * 60,
    timeLeft: 25 * 60,
    currentMode: 'Pomodoro',
    isRunning: false,
    audioUnlocked: false,

       init() {
            this.updateDisplay();
            this.addEventListeners();
        },
        addEventListeners() {
            this.startBtn.addEventListener('click', () => this.toggleTimer());
            document.getElementById('reset-btn').addEventListener('click', () => this.reset());

            this.modeButtons.forEach(button => {
                button.addEventListener('click', (e) => this.switchMode(e.target));
            });
        },
        updateDisplay() {
            const minutes = Math.floor(this.timeLeft / 60)
                .toString()
                .padStart(2, '0');
            const seconds = (this.timeLeft % 60).toString().padStart(2, '0');
            this.timerDisplay.textContent = `${minutes}:${seconds}`;
            document.title = `${minutes}:${seconds} - Poromodo Hub`;
        },
        toggleTimer() {
            ambientSoundManager.unlockAudio();
            this.isRunning = !this.isRunning;
            if (this.isRunning) {
                this.startBtn.textContent = 'Pause';
                this.timer = setInterval(() => {
                    this.timeLeft--;
                    this.updateDisplay();
                    if (this.timeLeft <= 0) {
                        this.stop(true);
                    }
                }, 1000);
            } else {
                this.startBtn.textContent = 'Resume';
                clearInterval(this.timer);
            }
        },
        reset() {
            this.stop(false);
            this.timeLeft = this.defaultTime;
            this.updateDisplay();
        },
        stop(shouldNotify) {
            clearInterval(this.timer);
            this.isRunning = false;
            this.startBtn.textContent = 'Start';
            if (shouldNotify) {
                this.notificationSound.play();
                this.sendNotification();
                if (this.currentMode === 'Pomodoro') {
                    analyticsManager.incrementSession();
                }
                const message = this.currentMode === 'Pomodoro' ? "Time for a break!" : "Break's over! Time to focus.";
                const confirmMessage = `${message}\n\nWould you like to start the next timer?`;
                showConfirmationModal(confirmMessage, () => this.moveToNextMode());
            }
        },
        sendNotification() {
            const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
            if (notificationsEnabled && Notification.permission === 'granted') {
                const body = this.currentMode === 'Pomodoro' ? "Time for a break!" : "Time to focus!";
                new Notification("Time's Up!", {
                    body: body
                });
            }
        },
        switchMode(button) {
            this.modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            this.defaultTime = parseInt(button.dataset.time) * 60;
            this.currentMode = button.textContent;
            this.reset();
        },
        moveToNextMode() {
            const currentModeIndex = Array.from(this.modeButtons).findIndex(btn => btn.classList.contains('active'));
            let nextModeIndex;

            if (this.currentMode === 'Pomodoro') {
                // After Pomodoro, go to Short Break
                nextModeIndex = 1;
            } else {
                // After any break, go back to Pomodoro
                nextModeIndex = 0;
            }
            
            this.modeButtons[nextModeIndex].click();
        }
    };

const analyticsManager = {
    todayEl: document.getElementById('today-sessions'),
    totalEl: document.getElementById('total-sessions'),
    resetBtn: document.getElementById('reset-stats-btn'),
    stats: { today: 0, total: 0, lastSessionDate: null },

        init() {
            this.loadStats();
            this.updateDisplay();
            this.resetBtn.addEventListener('click', () => this.resetStats());
        },
        loadStats() {
            const loadedStats = JSON.parse(localStorage.getItem('studyStats'));
            if (loadedStats) {
                this.stats = loadedStats;
            }
            const today = new Date().toDateString();
            if (this.stats.lastSessionDate !== today) {
                this.stats.today = 0;
            }
        },
        saveStats() {
            localStorage.setItem('studyStats', JSON.stringify(this.stats));
        },
        updateDisplay() {
            this.todayEl.textContent = this.stats.today;
            this.totalEl.textContent = this.stats.total;
        },
        incrementSession() {
            this.stats.today++;
            this.stats.total++;
            this.stats.lastSessionDate = new Date().toDateString();
            this.saveStats();
            this.updateDisplay();
        },
        resetStats() {
            const message = "Are you sure you want to reset all session analytics? This action cannot be undone.";
            showConfirmationModal(message, () => {
                this.stats = { today: 0, total: 0, lastSessionDate: null };
                this.saveStats();
                this.updateDisplay();
            });
        }
    };

const taskManager = {
    taskInput: document.getElementById('task-input-field'),
    addTaskBtn: document.getElementById('add-task-btn'),
    taskList: document.getElementById('task-list'),
    historyList: document.getElementById('task-history-list'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    tasks: [],
    taskHistory: [],

        init() {
            this.loadTasks();
            this.loadHistory();
            this.addEventListeners();
        },
        addEventListeners() {
            this.addTaskBtn.addEventListener('click', () => this.handleAddTask());
            this.taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleAddTask();
            });
            this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        },
        loadTasks() {
            this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            this.tasks.forEach(task => this.createTaskElement(task));
        },
        loadHistory() {
            this.taskHistory = JSON.parse(localStorage.getItem('taskHistory')) || [];
            this.historyList.innerHTML = '';
            this.taskHistory.forEach(task => this.createHistoryElement(task));
        },
        saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        },
        createTaskElement(task) {
            const li = document.createElement('li');
            li.classList.toggle('completed', task.completed);
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span></span>
                <button class="delete-btn">×</button>
            `;
            li.querySelector('span').textContent = task.text;

            const span = li.querySelector('span');

            span.addEventListener('dblclick', () => {
                if (li.classList.contains('completed')) return;

                li.classList.add('editing');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = task.text;
                input.className = 'edit-task-input';

                span.style.display = 'none';
                li.insertBefore(input, span);
                input.focus();
                input.select();

                const exitEditMode = (save) => {
                    if (save) {
                        const newText = input.value.trim();
                        if (newText && newText !== task.text) {
                            task.text = newText;
                            span.textContent = newText;
                            this.saveTasks();
                        }
                    }
                    li.removeChild(input);
                    span.style.display = '';
                    li.classList.remove('editing');
                };

                input.addEventListener('blur', () => exitEditMode(true));
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') exitEditMode(true);
                    if (e.key === 'Escape') exitEditMode(false);
                });
            });

            li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
                task.completed = e.target.checked;
                li.classList.toggle('completed', task.completed);
                this.saveTasks();
            });

            li.querySelector('.delete-btn').addEventListener('click', () => {
                if (task.completed) {
                    this.archiveTask(task);
                    this.tasks = this.tasks.filter(t => t !== task);
                    this.saveTasks();
                    li.remove();
                } else {
                    // Permanently delete incomplete task
                    const message = `Are you sure you want to delete this incomplete task?\n\n"${task.text}"`;
                    showConfirmationModal(message, () => {
                        this.tasks = this.tasks.filter(t => t !== task);
                        this.saveTasks();
                        li.remove();
                    });
                }
            });

            this.taskList.appendChild(li);
        },
        archiveTask(task) {
            const completedTask = {
                text: task.text,
                completedAt: new Date().toISOString()
            };
            this.taskHistory.unshift(completedTask);
            this.saveHistory();
            this.createHistoryElement(completedTask, true);
            showToast('Task moved to history.');
        },
        saveHistory() {
            localStorage.setItem('taskHistory', JSON.stringify(this.taskHistory));
        },
        createHistoryElement(task, prepend = false) {
            const li = document.createElement('li');
            li.className = 'task-history-item';
            const completionDate = new Date(task.completedAt).toLocaleDateString();
            li.innerHTML = `<span>${task.text}</span> <span class="history-date">- ${completionDate}</span>`;
            if (prepend) {
                this.historyList.prepend(li);
            } else {
                this.historyList.appendChild(li);
            }
        },
        clearHistory() {
            const message = "Are you sure you want to clear the entire task history? This action cannot be undone.";
            showConfirmationModal(message, () => {
                this.taskHistory = [];
                this.saveHistory();
                this.historyList.innerHTML = '';
                showToast('Task history cleared.');
            });
        },
        handleAddTask() {
            const taskText = this.taskInput.value.trim();
            if (taskText === '') return;

            const newTask = { text: taskText, completed: false };
            this.tasks.push(newTask);
            this.createTaskElement(newTask);
            this.saveTasks();
            this.taskInput.value = '';
        }
    };

const confirmOverlay = document.getElementById('custom-confirm-overlay');
const confirmMsg = document.getElementById('custom-confirm-msg');
const confirmOkBtn = document.getElementById('custom-confirm-ok');
const confirmCancelBtn = document.getElementById('custom-confirm-cancel');

    let onConfirmCallback = null;

    const showConfirmationModal = (message, callback) => {
        confirmMsg.innerText = message.replace(/\n\n/g, '\n');
        onConfirmCallback = callback;
        confirmOverlay.classList.add('show');
    };

    const hideConfirmationModal = () => {
        confirmOverlay.classList.remove('show');
        onConfirmCallback = null;
    };

    confirmOkBtn.addEventListener('click', () => {
        if (typeof onConfirmCallback === 'function') {
            onConfirmCallback();
        }
        hideConfirmationModal();
    });

    confirmCancelBtn.addEventListener('click', () => {
        hideConfirmationModal();
    });

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 2500);
    }

    const handleWelcomeMessage = () => {
        const welcomeOverlay = document.getElementById('welcome-overlay');
        const container = document.querySelector('.container');

        container.classList.add('content-blur');

        setTimeout(() => {
            welcomeOverlay.classList.add('hidden');
            container.classList.remove('content-blur');
        }, 1500);
    };

    const focusManager = {
        titleElement: document.getElementById('main-focus-title'),

        init() {
            this.loadFocus();
            this.titleElement.addEventListener('click', () => {
                if (this.titleElement.classList.contains('typing')) return;
                this.enterEditMode();
            });
        },

        loadFocus() {
            const savedFocus = localStorage.getItem('mainFocus');
            const textToType = savedFocus || "Set Your Focus";
            this.typewriter(textToType);
        },

        typewriter(text) {
            let i = 0;
            this.titleElement.textContent = '';
            this.titleElement.classList.add('typing');
            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    this.titleElement.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typingInterval);
                    this.titleElement.classList.remove('typing');
                }
            }, 75);
        },

        enterEditMode() {
            const currentText = this.titleElement.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText === "Set Your Focus" ? "" : currentText;
            input.placeholder = "What is your main focus today?";
            input.className = 'focus-title-input';

            this.titleElement.replaceWith(input);
            input.focus();

            const saveAndExit = () => {
                const newText = input.value.trim();
                const textToSave = newText || "Set Your Focus";
                localStorage.setItem('mainFocus', textToSave);
                input.replaceWith(this.titleElement);
                this.typewriter(textToSave);
            };

            input.addEventListener('blur', saveAndExit);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            });
        }
    };

const ambientSoundManager = {
    soundButtons: document.querySelectorAll('.ambient-btn'),
    volumeSlider: document.getElementById('ambient-volume-slider'),
    soundUpload: document.getElementById('sound-upload'),
    customSoundsList: document.getElementById('custom-sounds-list'),
    currentSound: null,
    isAudioUnlocked: false,

        init() {
            this.loadState();
            this.soundButtons.forEach(btn => {
                btn.addEventListener('click', () => this.toggleSound(btn.dataset.sound));
            });
            this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
            this.soundUpload.addEventListener('change', (e) => this.handleSoundUpload(e));
            this.loadCustomSounds();
        },

        handleSoundUpload(event) {
            const file = event.target.files[0];
            if (!file || !file.type.startsWith('audio/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const soundDataUrl = e.target.result;
                const soundName = file.name.replace(/\.[^/.]+$/, "");
                const soundId = `ambient-custom-${Date.now()}`;

                const newSound = { id: soundId, name: soundName, data: soundDataUrl };
                this.addCustomSound(newSound);
                this.saveCustomSound(newSound);
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        },

        addCustomSound(sound) {
            const audioContainer = document.getElementById('ambient-audio-container');
            const audioElement = document.createElement('audio');
            audioElement.id = sound.id;
            audioElement.src = sound.data;
            audioElement.loop = true;
            audioContainer.appendChild(audioElement);

            const listItem = document.createElement('div');
            listItem.className = 'custom-sound-item';
            listItem.dataset.sound = sound.id;

            listItem.innerHTML = `
                <span class="custom-sound-name" title="${sound.name}">${sound.name}</span>
                <div class="custom-sound-controls">
                    <button class="icon-btn play-btn" title="Play/Pause" data-play-icon='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' data-pause-icon='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </button>
                    <button class="icon-btn delete-sound-btn" title="Delete Sound">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            this.customSoundsList.appendChild(listItem);

            listItem.querySelector('.play-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSound(sound.id);
            });

            listItem.querySelector('.delete-sound-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const message = `Are you sure you want to delete the sound "${sound.name}"?`;
                showConfirmationModal(message, () => {
                    this.deleteCustomSound(sound.id);
                });
            });

            this.setVolume(this.volumeSlider.value);
        },

deleteCustomSound(soundId) {
        const listItem = this.customSoundsList.querySelector(`[data-sound="${soundId}"]`);
            if (listItem) listItem.remove();

            const audioElement = document.getElementById(soundId);
            if (audioElement) audioElement.remove();

            let customSounds = JSON.parse(localStorage.getItem('customSounds')) || [];
            customSounds = customSounds.filter(s => s.id !== soundId);
            localStorage.setItem('customSounds', JSON.stringify(customSounds));

            if (this.currentSound && this.currentSound.id === soundId) {
                this.currentSound = null;
                this.saveState();
            }
        },

        loadCustomSounds() {
            const customSounds = JSON.parse(localStorage.getItem('customSounds')) || [];
            customSounds.forEach(sound => this.addCustomSound(sound));
        },

        saveCustomSound(sound) {
            const customSounds = JSON.parse(localStorage.getItem('customSounds')) || [];
            customSounds.push(sound);
            localStorage.setItem('customSounds', JSON.stringify(customSounds));
        },

        toggleSound(soundId) {
            this.unlockAudio();
            const soundToPlay = document.getElementById(soundId);
            if (!soundToPlay) return;

            if (this.currentSound === soundToPlay && !this.currentSound.paused) {
                this.currentSound.pause();
                this.currentSound = null;
            } else {
                if (this.currentSound) this.currentSound.pause();
                this.currentSound = soundToPlay;
                this.currentSound.play();
            }

            this.updateActiveButtonStates();
            this.saveState();
        },

        stopAll() {
            if (this.currentSound) {
                this.currentSound.pause();
                this.currentSound = null;
            }
            this.updateActiveButtonStates();
        },

        setVolume(level) {
            document.querySelectorAll('audio[id^="ambient-"]').forEach(sound => sound.volume = level);
            this.saveState();
        },

        updateActiveButtonStates() {
            this.soundButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.custom-sound-item').forEach(item => {
                const playBtn = item.querySelector('.play-btn');
                item.classList.remove('playing');
                if (playBtn) {
                    playBtn.innerHTML = playBtn.dataset.playIcon;
                }
            });

            if (this.currentSound && !this.currentSound.paused) {
                const activeItem = this.customSoundsList.querySelector(`[data-sound="${this.currentSound.id}"]`);
                if (activeItem) {
                    const playBtn = activeItem.querySelector('.play-btn');
                    if (playBtn) {
                        activeItem.classList.add('playing');
                        playBtn.innerHTML = playBtn.dataset.pauseIcon;
                    }
                }
                const activeButton = document.querySelector(`.ambient-btn[data-sound="${this.currentSound.id}"]`);
                if (activeButton) {
                    activeButton.classList.add('active');
                }
            }
        },

        saveState() {
            const state = {
                activeSound: this.currentSound ? this.currentSound.id : null,
                volume: this.volumeSlider.value
            };
            localStorage.setItem('ambientState', JSON.stringify(state));
        },

        loadState() {
            const savedState = JSON.parse(localStorage.getItem('ambientState'));
            if (savedState) {
                this.volumeSlider.value = savedState.volume || 0.5;
                this.setVolume(this.volumeSlider.value);
                if (savedState.activeSound) {
                    this.toggleSound(savedState.activeSound, true);
                }
            }
        },

        unlockAudio() {
            if (this.isAudioUnlocked) return;
            const allSounds = document.querySelectorAll('audio');
            allSounds.forEach(sound => sound.muted = true);
            allSounds.forEach(sound => {
                sound.play().catch(e => {});
            });
            setTimeout(() => allSounds.forEach(sound => sound.pause()), 10);
            allSounds.forEach(sound => sound.muted = false);
            this.isAudioUnlocked = true;
            console.log("Audio context unlocked.");
        }
    };

const spotifyManager = {
        linkInput: document.getElementById('spotify-link-input'),
        embedContainer: document.getElementById('spotify-embed-container'),

        init() {
            this.linkInput.addEventListener('paste', (e) => this.handlePaste(e));
            this.linkInput.addEventListener('change', (e) => this.handleInputChange(e));
            this.loadPlayer();
        },
        handlePaste(event) {
            const pastedUrl = (event.clipboardData || window.clipboardData).getData('text');
            this.createPlayer(pastedUrl);
        },

        handleInputChange(event) {
            this.createPlayer(event.target.value);
        },
        createPlayer(url) {
            if (!url || !url.includes('open.spotify.com')) {
                return;
            }
            try {
                const urlObject = new URL(url);
                const path = urlObject.pathname;
                const embedUrl = `https://open.spotify.com/embed${path}`;

                this.embedContainer.innerHTML = `
                    <iframe style="border-radius:12px" 
                        src="${embedUrl}" 
                        width="100%" 
                        height="152" 
                        frameBorder="0" 
                        allowfullscreen="" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"></iframe>
                `;
                localStorage.setItem('spotifyEmbedUrl', embedUrl);
            } catch (error) {
                console.error("Invalid Spotify URL:", error);
                this.embedContainer.innerHTML = '';
            }
        },

        loadPlayer() {
            const savedUrl = localStorage.getItem('spotifyEmbedUrl');
            if (savedUrl) {
                const originalUrl = savedUrl.replace('/embed', '');
                this.createPlayer(originalUrl);
                this.linkInput.value = originalUrl;
            }
        }
    };

const animationManager = {
    isAnimationActive: false,
    gifUrlContainer: document.getElementById('gif-url-container'),
    gifOptionsContainer: document.getElementById('gif-options-container'),
    gifOptionBtns: document.querySelectorAll('.gif-option-btn'),
    gifUploadInput: document.getElementById('gif-upload'),
    resetGifBtn: document.getElementById('reset-gif-btn'),
    defaultGifUrl: "url('https://i.imgur.com/sT8s32L.gif')",

    init() {
        this.loadState();
        this.gifOptionBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handlePresetGifSelect(btn));
        });
        this.gifUploadInput.addEventListener('change', (e) => this.handleGifUpload(e));
        this.resetGifBtn.addEventListener('click', () => this.resetGif());
    },

    toggleAnimation() {
        this.isAnimationActive = !this.isAnimationActive;
        if (this.isAnimationActive) {
            this.play();
        } else {
            this.pause();
        }
        this.saveState();
    },

    play() {
        const localGifData = localStorage.getItem('localGifData');
        const remoteGifUrl = localStorage.getItem('gifUrl');

        let gifUrl = this.defaultGifUrl;
        if (localGifData) {
            gifUrl = `url(${localGifData})`;
        } else if (remoteGifUrl) {
            gifUrl = remoteGifUrl;
        }
        document.documentElement.style.setProperty('--gif-url', gifUrl);
        document.body.classList.add('gif-background-active');
        settingsManager.animationToggle.checked = true;
        this.isAnimationActive = true;
        this.gifUrlContainer.style.display = 'flex';
        this.gifOptionsContainer.style.display = 'grid';
    },

    pause() {
        document.body.classList.remove('gif-background-active');
        settingsManager.animationToggle.checked = false;
        this.isAnimationActive = false;
        this.gifOptionsContainer.style.display = 'none';
        this.gifUrlContainer.style.display = 'none';
    },

    handleGifUpload(event) {
        const file = event.target.files[0];
        if (!file || file.type !== 'image/gif') {
            showToast('Please select a valid GIF file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            localStorage.setItem('localGifData', e.target.result);
            localStorage.removeItem('gifUrl');
            this.updateActiveButtonStates();
            if (this.isAnimationActive) this.play();
            showToast('GIF background updated!');
        };
        reader.readAsDataURL(file);
    },

    resetGif() {
        localStorage.removeItem('localGifData');
        const defaultUrl = `url('${this.gifOptionBtns[0].dataset.gifUrl}')`;
        localStorage.setItem('gifUrl', defaultUrl);
        this.gifUploadInput.value = ''; // Clear file input
        this.updateActiveButtonStates();
        this.loadState(); // Reload state to ensure consistency
        if (this.isAnimationActive) this.play();
        showToast('GIF background has been reset.');
    },

    handlePresetGifSelect(selectedBtn) {
        const newUrl = selectedBtn.dataset.gifUrl;
        
        localStorage.removeItem('localGifData');
        localStorage.setItem('gifUrl', `url('${newUrl}')`); 
        this.gifUploadInput.value = ''; // Clear file input

        this.updateActiveButtonStates();
        if (this.isAnimationActive) this.play();
    },

    updateActiveButtonStates() {
        this.gifOptionBtns.forEach(btn => btn.classList.remove('active'));

        const remoteGifUrl = localStorage.getItem('gifUrl');
        const localGifData = localStorage.getItem('localGifData');

        if (localGifData) {
            return;
        }

        if (remoteGifUrl) {
            const activeBtn = document.querySelector(`.gif-option-btn[data-gif-url="${remoteGifUrl.replace(/url\(['"]?|['"]?\)/g, '')}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }
    },

    saveState() {
        localStorage.setItem('animationActive', this.isAnimationActive);
    },

    loadState() {
        const localGifData = localStorage.getItem('localGifData');

        if (localStorage.getItem('animationActive') === 'true') {
            this.play();
        } else {
            this.pause();
        }
        this.updateActiveButtonStates();
    }
};

settingsManager.init();
timerManager.init();
taskManager.init();
analyticsManager.init();
handleWelcomeMessage();
focusManager.init();
ambientSoundManager.init();
animationManager.init();
spotifyManager.init();
});