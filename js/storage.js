const Storage = {
    // Проверка доступности localStorage
    isStorageAvailable: function() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage не доступен:', e);
            return false;
        }
    },

    // Инициализация хранилища
    init: function() {
        console.log('Инициализация Storage');
        if (!this.isStorageAvailable()) {
            this.showStorageError();
            return false;
        }
        return true;
    },

    showStorageError: function() {
        const historyListElem = document.getElementById('historyList');
        if (historyListElem) {
            historyListElem.innerHTML = `
                <div class="warning-box">
                    <div class="warning-title">Внимание</div>
                    <p>Локальное хранилище недоступно. История расчетов не будет сохраняться.</p>
                    <p>Возможные причины: режим инкогнито, отключенный localStorage, ограничения браузера.</p>
                </div>
            `;
        }
    },

    saveCalculation: function() {
        console.log('Сохранение расчета');
        if (!this.init()) {
            alert('Локальное хранилище недоступно. Невозможно сохранить результаты.');
            return;
        }

        const calculationData = this.getCalculationData();
        if (!calculationData) {
            alert('Ошибка: не удалось получить данные для сохранения');
            return;
        }

        let history = JSON.parse(localStorage.getItem('sterilizationHistory') || '[]');
        
        // Добавляем ID и timestamp для лучшей идентификации
        calculationData.id = Date.now();
        calculationData.timestamp = new Date().toISOString();
        calculationData.displayDate = new Date().toLocaleString('ru-RU');
        
        history.unshift(calculationData);
        
        // Ограничиваем историю последними 50 записями
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        try {
            localStorage.setItem('sterilizationHistory', JSON.stringify(history));
            this.displayHistory();
            
            // Показываем уведомление об успешном сохранении
            this.showSaveNotification();
            
            // Переключение на вкладку истории
            this.switchToHistoryTab();
            
        } catch (e) {
            console.error('Ошибка при сохранении:', e);
            alert('Ошибка при сохранении результатов. Проверьте доступное место в хранилище.');
        }
    },

    showSaveNotification: function() {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 600;
        `;
        notification.textContent = 'Результаты успешно сохранены!';
        
        document.body.appendChild(notification);
        
        // Автоматически удаляем через 3 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    },

    switchToHistoryTab: function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        
        const historyTab = document.querySelector('.tab[data-tab="history"]');
        const historyContent = document.getElementById('history');
        
        if (historyTab && historyContent) {
            historyTab.classList.add('active');
            historyContent.classList.add('active');
        }
    },

    getCalculationData: function() {
        try {
            const productTypeNames = {
                juice: "Сок",
                nectar: "Нектар", 
                fruitDrink: "Морс",
                milk: "Молоко",
                liquidDairyPorridge: "Жидкая молочная каша",
                liquidDairyFreePorridge: "Жидкая безмолочная каша"
            };
            
            const microorganismType = document.getElementById('microorganism').value;
            let microorganismName = "Неизвестный";
            
            if (microorganismType === 'custom') {
                microorganismName = "Пользовательский";
            } else if (typeof Calculations !== 'undefined' && Calculations.microorganisms[microorganismType]) {
                microorganismName = Calculations.microorganisms[microorganismType].name;
            }
            
            // Получаем текущие значения из интерфейса
            const getElementValue = (id) => {
                const elem = document.getElementById(id);
                return elem ? elem.textContent || elem.value : '-';
            };
            
            return {
                productType: productTypeNames[document.getElementById('productType').value] || "Неизвестный продукт",
                microorganism: microorganismName,
                pipeDiameter: document.getElementById('pipeDiameter') ? document.getElementById('pipeDiameter').value : '-',
                flowRate: document.getElementById('flowRate') ? document.getElementById('flowRate').value : '-',
                exposureTime: document.getElementById('exposureTime') ? document.getElementById('exposureTime').value : '-',
                temperature: document.getElementById('temperature') ? document.getElementById('temperature').value : '-',
                initialLoad: document.getElementById('initialLoad') ? document.getElementById('initialLoad').value : '-',
                flowVelocity: getElementValue('flowVelocity'),
                sterilizerVolume: getElementValue('sterilizerVolume'),
                adjustedDValue: getElementValue('adjustedDValue'),
                lethality: getElementValue('lethalityValue'),
                logReduction: getElementValue('logReduction'),
                residualConcentration: getElementValue('residualConcentration'),
                efficiency: getElementValue('sterilizationEfficiency')
            };
        } catch (error) {
            console.error('Ошибка при получении данных расчета:', error);
            return null;
        }
    },

    displayHistory: function() {
        const historyListElem = document.getElementById('historyList');
        if (!historyListElem) {
            console.error('Элемент historyList не найден');
            return;
        }
        
        if (!this.init()) return;

        let history = [];
        try {
            const historyData = localStorage.getItem('sterilizationHistory');
            history = historyData ? JSON.parse(historyData) : [];
        } catch (e) {
            console.error('Ошибка при чтении истории:', e);
            this.showStorageError();
            return;
        }
        
        historyListElem.innerHTML = '';
        
        if (history.length === 0) {
            historyListElem.innerHTML = `
                <div class="info-box">
                    <p>История расчетов пуста</p>
                    <p>После выполнения расчетов нажмите "Сохранить результаты" чтобы добавить их в историю.</p>
                </div>
            `;
            return;
        }
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Используем displayDate если есть, иначе timestamp
            const displayDate = item.displayDate || 
                               (item.timestamp ? new Date(item.timestamp).toLocaleString('ru-RU') : 
                               (item.timestamp ? item.timestamp : 'Неизвестная дата'));
            
            historyItem.innerHTML = `
                <div class="history-header">
                    <span class="history-date">${displayDate}</span>
                    <span class="history-product">${item.productType}</span>
                </div>
                <div><strong>Микроорганизм:</strong> ${item.microorganism}</div>
                <div><strong>Диаметр трубы:</strong> ${item.pipeDiameter} мм</div>
                <div><strong>Начальная обсемененность:</strong> ${item.initialLoad} КОЕ/мл</div>
                <div class="history-results">
                    <div class="history-result-item">
                        <div class="history-result-label">Температура</div>
                        <div class="history-result-value">${item.temperature}°C</div>
                    </div>
                    <div class="history-result-item">
                        <div class="history-result-label">Время выдержки</div>
                        <div class="history-result-value">${item.exposureTime} сек</div>
                    </div>
                    <div class="history-result-item">
                        <div class="history-result-label">Летальность</div>
                        <div class="history-result-value">${item.lethality}</div>
                    </div>
                </div>
                <div class="history-results">
                    <div class="history-result-item">
                        <div class="history-result-label">Снижение</div>
                        <div class="history-result-value">${item.logReduction}</div>
                    </div>
                    <div class="history-result-item">
                        <div class="history-result-label">Остаток</div>
                        <div class="history-result-value">${item.residualConcentration}</div>
                    </div>
                    <div class="history-result-item">
                        <div class="history-result-label">Эффективность</div>
                        <div class="history-result-value">${item.efficiency}</div>
                    </div>
                </div>
            `;
            
            historyListElem.appendChild(historyItem);
        });
    },

    clearHistory: function() {
        if (!this.init()) {
            alert('Локальное хранилище недоступно.');
            return;
        }
        
        if (confirm("Вы уверены, что хотите очистить всю историю расчетов? Это действие нельзя отменить.")) {
            try {
                localStorage.removeItem('sterilizationHistory');
                this.displayHistory();
                
                // Показываем уведомление об очистке
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--warning-color);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    font-weight: 600;
                `;
                notification.textContent = 'История очищена!';
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 3000);
                
            } catch (e) {
                console.error('Ошибка при очистке истории:', e);
                alert('Ошибка при очистке истории.');
            }
        }
    },

    // Экспорт истории в файл
    exportHistory: function() {
        if (!this.init()) {
            alert('Локальное хранилище недоступно.');
            return;
        }
        
        try {
            const historyData = localStorage.getItem('sterilizationHistory');
            if (!historyData) {
                alert('История расчетов пуста.');
                return;
            }
            
            const history = JSON.parse(historyData);
            const dataStr = JSON.stringify(history, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sterilization-history-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
        } catch (e) {
            console.error('Ошибка при экспорте истории:', e);
            alert('Ошибка при экспорте истории.');
        }
    }
};
