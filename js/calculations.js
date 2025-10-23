const Calculations = {
    microorganisms: {
        clostridiumBotulinum: { name: "Clostridium botulinum", dValue: 0.2, zValue: 10 },
        bacillusSubtilis: { name: "Bacillus subtilis", dValue: 0.5, zValue: 9 },
        bacillusLicheniformis: { name: "Bacillus licheniformis", dValue: 0.8, zValue: 12 },
        bacillusCereus: { name: "Bacillus cereus", dValue: 0.7, zValue: 10 },
        geobacillusStearothermophilus: { name: "Geobacillus stearothermophilus", dValue: 4.0, zValue: 9 },
        escherichiaColi: { name: "Escherichia coli", dValue: 0.05, zValue: 5 },
        lactobacillus: { name: "Lactobacillus", dValue: 0.1, zValue: 7 },
        saccharomycesCerevisiae: { name: "Saccharomyces cerevisiae", dValue: 0.03, zValue: 4 },
        aspergillus: { name: "Aspergillus", dValue: 0.02, zValue: 4 }
    },

    performCalculation: function() {
        console.log('Выполнение расчета');
        try {
            const params = this.getInputParameters();
            if (!params) {
                alert('Ошибка: не удалось получить параметры расчета');
                return;
            }
            const results = this.calculateSterilization(params);
            this.displayResults(results, params);
        } catch (error) {
            console.error('Ошибка при расчете:', error);
            alert('Произошла ошибка при расчете. Проверьте введенные данные.');
        }
    },

    getInputParameters: function() {
        try {
            const pipeDiameterElem = document.getElementById('pipeDiameter');
            const flowRateElem = document.getElementById('flowRate');
            const exposureTimeElem = document.getElementById('exposureTime');
            const temperatureElem = document.getElementById('temperature');
            const initialLoadElem = document.getElementById('initialLoad');
            const productTypeElem = document.getElementById('productType');
            const microorganismElem = document.getElementById('microorganism');

            if (!pipeDiameterElem || !flowRateElem || !exposureTimeElem || !temperatureElem || 
                !initialLoadElem || !productTypeElem || !microorganismElem) {
                throw new Error('Не все необходимые элементы найдены');
            }

            const pipeDiameter = parseFloat(pipeDiameterElem.value) / 1000; // в метры
            const flowRate = parseFloat(flowRateElem.value); // л/ч
            const exposureTime = parseFloat(exposureTimeElem.value); // сек
            const temperature = parseFloat(temperatureElem.value); // °C
            const initialLoad = parseFloat(initialLoadElem.value); // КОЕ/мл
            const productType = productTypeElem.value;
            const microorganismType = microorganismElem.value;
            
            // Проверка на валидность числовых значений
            if (isNaN(pipeDiameter) || isNaN(flowRate) || isNaN(exposureTime) || 
                isNaN(temperature) || isNaN(initialLoad)) {
                throw new Error('Не все числовые значения введены корректно');
            }
            
            let dValue, zValue;
            
            if (microorganismType === 'custom') {
                const dValueElem = document.getElementById('dValue');
                const zValueElem = document.getElementById('zValue');
                if (!dValueElem || !zValueElem) {
                    throw new Error('Не найдены поля для пользовательского микроорганизма');
                }
                dValue = parseFloat(dValueElem.value);
                zValue = parseFloat(zValueElem.value);
                
                if (isNaN(dValue) || isNaN(zValue)) {
                    throw new Error('D-значение или Z-значение введены некорректно');
                }
            } else {
                if (!this.microorganisms[microorganismType]) {
                    throw new Error('Выбранный микроорганизм не найден в базе данных');
                }
                dValue = this.microorganisms[microorganismType].dValue;
                zValue = this.microorganisms[microorganismType].zValue;
            }
            
            return {
                pipeDiameter,
                flowRate,
                exposureTime,
                temperature,
                initialLoad,
                productType,
                microorganismType,
                dValue,
                zValue
            };
        } catch (error) {
            console.error('Ошибка при получении параметров:', error);
            alert('Ошибка: ' + error.message);
            return null;
        }
    },

    calculateSterilization: function(params) {
        console.log('Расчет стерилизации с параметрами:', params);
        
        // Расчет скорости потока (м/с)
        const crossSectionArea = Math.PI * Math.pow(params.pipeDiameter / 2, 2); // м²
        const flowRateM3PerSec = params.flowRate / 3600 / 1000; // м³/с
        const flowVelocity = flowRateM3PerSec / crossSectionArea; // м/с
        
        // Расчет рабочего объема стерилизатора (л)
        const sterilizerVolume = flowRateM3PerSec * params.exposureTime * 1000; // л
        
        // Расчет скорректированного D-значения для текущей температуры
        const adjustedDValue = params.dValue * Math.pow(10, (121 - params.temperature) / params.zValue);
        
        // Расчет летальности (F-значение)
        const lethality = params.exposureTime * Math.pow(10, (params.temperature - 121) / params.zValue);
        
        // Расчет логарифмического снижения
        const logReduction = lethality / params.dValue;
        
        // Расчет остаточной концентрации
        const residualConcentration = params.initialLoad * Math.pow(10, -logReduction);
        
        return {
            flowVelocity,
            sterilizerVolume,
            adjustedDValue,
            lethality,
            logReduction,
            residualConcentration
        };
    },

    displayResults: function(results, params) {
        console.log('Отображение результатов:', results);
        
        // Функция для безопасного обновления элемента
        const updateElement = (id, value) => {
            const elem = document.getElementById(id);
            if (elem) {
                elem.textContent = value;
            }
        };

        // Обновление интерфейса с результатами
        updateElement('flowVelocity', results.flowVelocity.toFixed(3) + " м/с");
        updateElement('sterilizerVolume', results.sterilizerVolume.toFixed(2) + " л");
        updateElement('adjustedDValue', results.adjustedDValue.toFixed(4) + " сек");
        updateElement('lethalityValue', results.lethality.toFixed(2));
        updateElement('logReduction', results.logReduction.toFixed(2) + " log");
        updateElement('residualConcentration', results.residualConcentration.toFixed(6) + " КОЕ/мл");
        
        // Оценка эффективности
        this.displayEfficiency(results.logReduction, params.productType);
        
        // Детали расчета
        this.displayCalculationDetails(results, params);
    },

    displayEfficiency: function(logReduction, productType) {
        console.log('Оценка эффективности:', logReduction, productType);
        
        // Оценка эффективности стерилизации
        let requiredReduction;
        if (productType === 'milk' || productType === 'liquidDairyPorridge' || productType === 'liquidDairyFreePorridge') {
            requiredReduction = 12; // Для молока и каш требуется 12 log снижения
        } else {
            requiredReduction = 6; // Для кислых продуктов достаточно 6 log
        }
        
        let efficiency, efficiencyClass, efficiencyMessage;
        
        if (logReduction >= requiredReduction) {
            efficiency = "Отличная";
            efficiencyClass = "success-box";
            efficiencyMessage = "Процесс стерилизации соответствует требованиям коммерческой стерильности.";
        } else if (logReduction >= (requiredReduction * 0.8)) {
            efficiency = "Хорошая";
            efficiencyClass = "success-box";
            efficiencyMessage = "Процесс стерилизации близок к требованиям коммерческой стерильности.";
        } else if (logReduction >= (requiredReduction * 0.6)) {
            efficiency = "Удовлетворительная";
            efficiencyClass = "recommendation-box";
            efficiencyMessage = "Рекомендуется увеличить время выдержки или температуру для достижения коммерческой стерильности.";
        } else {
            efficiency = "Недостаточная";
            efficiencyClass = "warning-box";
            efficiencyMessage = "Процесс стерилизации не обеспечивает коммерческую стерильность. Увеличьте время выдержки или температуру.";
        }
        
        // Обновление интерфейса
        const efficiencyElem = document.getElementById('sterilizationEfficiency');
        if (efficiencyElem) {
            efficiencyElem.textContent = efficiency;
        }
        
        // Отображение сообщения об эффективности
        const efficiencyMessageElem = document.getElementById('efficiencyMessage');
        if (efficiencyMessageElem) {
            efficiencyMessageElem.innerHTML = `
                <div class="${efficiencyClass}">
                    <div class="${efficiencyClass.includes('success') ? 'success-title' : efficiencyClass.includes('warning') ? 'warning-title' : 'recommendation-title'}">${efficiency}</div>
                    <p>${efficiencyMessage}</p>
                    <p>Требуемое снижение для ${this.getProductTypeName(productType)}: ${requiredReduction} log</p>
                </div>
            `;
        }
    },

    displayCalculationDetails: function(results, params) {
        const calculationStepsElem = document.getElementById('calculationSteps');
        if (!calculationStepsElem) return;
        
        calculationStepsElem.innerHTML = `
            <div class="calculation-step"><strong>1. Расчет скорости потока:</strong> (${params.flowRate} л/ч) / 3600 / 1000 / (π × (${(params.pipeDiameter*1000).toFixed(1)} мм / 2000)²) = ${results.flowVelocity.toFixed(3)} м/с</div>
            <div class="calculation-step"><strong>2. Расчет рабочего объема стерилизатора:</strong> (${params.flowRate} л/ч / 3600) × ${params.exposureTime} с × 1000 = ${results.sterilizerVolume.toFixed(2)} л</div>
            <div class="calculation-step"><strong>3. Расчет скорректированного D-значения:</strong> ${params.dValue} × 10^((121 - ${params.temperature})/${params.zValue}) = ${results.adjustedDValue.toFixed(4)} сек</div>
            <div class="calculation-step"><strong>4. Расчет летальности (F-значение):</strong> ${params.exposureTime} × 10^((${params.temperature} - 121)/${params.zValue}) = ${results.lethality.toFixed(2)}</div>
            <div class="calculation-step"><strong>5. Расчет логарифмического снижения:</strong> ${results.lethality.toFixed(2)} / ${params.dValue} = ${results.logReduction.toFixed(2)} log</div>
            <div class="calculation-step"><strong>6. Расчет остаточной концентрации:</strong> ${params.initialLoad} × 10^(-${results.logReduction.toFixed(2)}) = ${results.residualConcentration.toFixed(6)} КОЕ/мл</div>
        `;
    },

    getProductTypeName: function(productType) {
        const productTypeNames = {
            juice: "соков",
            nectar: "нектаров",
            fruitDrink: "морсов",
            milk: "молока",
            liquidDairyPorridge: "жидких молочных каш",
            liquidDairyFreePorridge: "жидких безмолочных каш"
        };
        return productTypeNames[productType] || "продукта";
    }
};
