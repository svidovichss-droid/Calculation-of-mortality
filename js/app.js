// Основной файл приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем приложение');
    // Инициализация приложения
    App.init();
});

const App = {
    init: function() {
        console.log('Инициализация App');
        this.bindEvents();
        // Инициализируем хранилище и показываем историю
        if (typeof Storage !== 'undefined' && Storage.init()) {
            Storage.displayHistory();
        }
    },
    
    bindEvents: function() {
        console.log('Привязка событий в App');
        
        // Переключение вкладок
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                console.log('Клик по вкладке:', e.target.getAttribute('data-tab'));
                const tabId = e.target.getAttribute('data-tab');
                
                // Снимаем активный класс со всех вкладок
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                
                // Добавляем активный класс текущей вкладке
                e.target.classList.add('active');
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
                
                if (tabId === 'history') {
                    Storage.displayHistory();
                }
            });
        });

        // Показать/скрыть поля для пользовательского микроорганизма
        const microorganismSelect = document.getElementById('microorganism');
        if (microorganismSelect) {
            microorganismSelect.addEventListener('change', function() {
                console.log('Изменен микроорганизм:', this.value);
                const customMicroorganism = document.getElementById('customMicroorganism');
                if (customMicroorganism) {
                    customMicroorganism.style.display = 
                        this.value === 'custom' ? 'block' : 'none';
                }
            });
        }

        // Расчет летальности
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Нажата кнопка расчета');
                if (typeof Calculations !== 'undefined') {
                    Calculations.performCalculation();
                } else {
                    console.error('Calculations не определен');
                }
            });
        }

        // Сохранение результатов
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Нажата кнопка сохранения');
                if (typeof Storage !== 'undefined') {
                    Storage.saveCalculation();
                } else {
                    console.error('Storage не определен');
                }
            });
        }

        // Очистка истории
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Нажата кнопка очистки истории');
                if (typeof Storage !== 'undefined') {
                    Storage.clearHistory();
                } else {
                    console.error('Storage не определен');
                alert('Модуль хранилища не загружен');
                }
            });
        }

        // Экспорт истории
        const exportHistoryBtn = document.getElementById('exportHistoryBtn');
        if (exportHistoryBtn) {
            exportHistoryBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Нажата кнопка экспорта истории');
                if (typeof Storage !== 'undefined') {
                    Storage.exportHistory();
                } else {
                    console.error('Storage не определен');
                alert('Модуль хранилища не загружен');
                }
            });
        }

        console.log('Все события привязаны');
    }
};
