// Основной файл приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация приложения
    App.init();
});

const App = {
    init: function() {
        this.bindEvents();
        Storage.displayHistory();
    },
    
    bindEvents: function() {
        // Переключение вкладок
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                if (tabId === 'history') {
                    Storage.displayHistory();
                }
            });
        });

        // Показать/скрыть поля для пользовательского микроорганизма
        document.getElementById('microorganism').addEventListener('change', function() {
            document.getElementById('customMicroorganism').style.display = 
                this.value === 'custom' ? 'block' : 'none';
        });

        // Расчет летальности
        document.getElementById('calculateBtn').addEventListener('click', Calculations.performCalculation);

        // Сохранение результатов
        document.getElementById('saveBtn').addEventListener('click', Storage.saveCalculation);

        // Очистка истории
        document.getElementById('clearHistoryBtn').addEventListener('click', Storage.clearHistory);
    }
};