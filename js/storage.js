const Storage = {
    saveCalculation: function() {
        const calculationData = this.getCalculationData();
        let history = JSON.parse(localStorage.getItem('sterilizationHistory') || '[]');
        history.unshift(calculationData);
        localStorage.setItem('sterilizationHistory', JSON.stringify(history));
        this.displayHistory();
        
        // Переключение на вкладку истории
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        
        document.querySelector('.tab[data-tab="history"]').classList.add('active');
        document.getElementById('history').classList.add('active');
        
        alert("Результаты сохранены!");
    },

    getCalculationData: function() {
        const productTypeNames = {
            juice: "Сок",
            nectar: "Нектар",
            fruitDrink: "Морс",
            milk: "Молоко",
            liquidDairyPorridge: "Жидкая молочная каша",
            liquidDairyFreePorridge: "Жидкая безмолочная каша"
        };
        
        const microorganismType = document.getElementById('microorganism').value;
        const microorganismName = microorganismType === 'custom' ? 
            "Пользовательский" : Calculations.microorganisms[microorganismType].name;
        
        return {
            timestamp: new Date().toLocaleString(),
            productType: productTypeNames[document.getElementById('productType').value],
            microorganism: microorganismName,
            pipeDiameter: document.getElementById('pipeDiameter').value,
            flowRate: document.getElementById('flowRate').value,
            exposureTime: document.getElementById('exposureTime').value,
            temperature: document.getElementById('temperature').value,
            initialLoad: document.getElementById('initialLoad').value,
            flowVelocity: document.getElementById('flowVelocity').textContent,
            sterilizerVolume: document.getElementById('sterilizerVolume').textContent,
            adjustedDValue: document.getElementById('adjustedDValue').textContent,
            lethality: document.getElementById('lethalityValue').textContent,
            logReduction: document.getElementById('logReduction').textContent,
            residualConcentration: document.getElementById('residualConcentration').textContent,
            efficiency: document.getElementById('sterilizationEfficiency').textContent
        };
    },

    displayHistory: function() {
        const history = JSON.parse(localStorage.getItem('sterilizationHistory') || '[]');
        const historyListElem = document.getElementById('historyList');
        historyListElem.innerHTML = '';
        
        if (history.length === 0) {
            historyListElem.innerHTML = '<p>История расчетов пуста</p>';
            return;
        }
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            historyItem.innerHTML = `
                <div class="history-header">
                    <span class="history-date">${item.timestamp}</span>
                    <span class="history-product">${item.productType}</span>
                </div>
                <div>Микроорганизм: ${item.microorganism}</div>
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
            `;
            
            historyListElem.appendChild(historyItem);
        });
    },

    clearHistory: function() {
        if (confirm("Вы уверены, что хотите очистить историю расчетов?")) {
            localStorage.removeItem('sterilizationHistory');
            this.displayHistory();
        }
    }
};