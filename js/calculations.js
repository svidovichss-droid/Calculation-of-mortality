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
        const params = Calculations.getInputParameters();
        const results = Calculations.calculateSterilization(params);
        Calculations.displayResults(results, params);
    },

    getInputParameters: function() {
        const pipeDiameter = parseFloat(document.getElementById('pipeDiameter').value) / 1000; // в метры
        const flowRate = parseFloat(document.getElementById('flowRate').value); // л/ч
        const exposureTime = parseFloat(document.getElementById('exposureTime').value); // сек
        const temperature = parseFloat(document.getElementById('temperature').value); // °C
        const initialLoad = parseFloat(document.getElementById('initialLoad').value); // КОЕ/мл
        const productType = document.getElementById('productType').value;
        const microorganismType = document.getElementById('microorganism').value;
        
        let dValue, zValue;
        
        if (microorganismType === 'custom') {
            dValue = parseFloat(document.getElementById('dValue').value);
            zValue = parseFloat(document.getElementById('zValue').value);
        } else {
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
    },

    calculateSterilization: function(params) {
        // Расчет скорости потока (м/с)
        const crossSectionArea = Math.PI * Math.pow(params.pipeDiameter / 2, 2); // м²
        const flowRateM3PerSec = params.flowRate / 3600 / 1000; // м³/с
        const flowVelocity = flowRateM3PerSec / crossSectionArea; // м/с
        
        // Расчет рабочего объема стерилизатора (л)
        const sterilizerVolume = flowRateM3PerSec * params.exposureTime * 1000; // л
        
        // Расчет скорректированного D-значения для текущей температуры
        // Формула: D_T = D_121 * 10^((121 - T)/z)
        const adjustedDValue = params.dValue * Math.pow(10, (121 - params.temperature) / params.zValue);
        
        // Расчет летальности (F-значение)
        // Формула: F = t * 10^((T - 121)/z)
        const lethality = params.exposureTime * Math.pow(10, (params.temperature - 121) / params.zValue);
        
        // Расчет логарифмического снижения
        // ИСПРАВЛЕННАЯ ФОРМУЛА: logReduction = F / D_121
        const logReduction = lethality / params.dValue;
        
        // Расчет остаточной концентрации
        // Формула: N = N0 * 10^(-logReduction)
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
        // Обновление интерфейса с результатами
        document.getElementById('flowVelocity').textContent = results.flowVelocity.toFixed(3) + " м/с";
        document.getElementById('sterilizerVolume').textContent = results.sterilizerVolume.toFixed(2) + " л";
        document.getElementById('adjustedDValue').textContent = results.adjustedDValue.toFixed(4) + " сек";
        document.getElementById('lethalityValue').textContent = results.lethality.toFixed(2);
        document.getElementById('logReduction').textContent = results.logReduction.toFixed(2) + " log";
        document.getElementById('residualConcentration').textContent = results.residualConcentration.toFixed(6) + " КОЕ/мл";
        
        // Оценка эффективности
        Calculations.displayEfficiency(results.logReduction, params.productType);
        
        // Детали расчета
        Calculations.displayCalculationDetails(results, params);
    },

    displayEfficiency: function(logReduction, productType) {
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
        document.getElementById('sterilizationEfficiency').textContent = efficiency;
        
        // Отображение сообщения об эффективности
        document.getElementById('efficiencyMessage').innerHTML = `
            <div class="${efficiencyClass}">
                <div class="${efficiencyClass.includes('success') ? 'success-title' : efficiencyClass.includes('warning') ? 'warning-title' : 'recommendation-title'}">${efficiency}</div>
                <p>${efficiencyMessage}</p>
                <p>Требуемое снижение для ${this.getProductTypeName(productType)}: ${requiredReduction} log</p>
            </div>
        `;
    },

    displayCalculationDetails: function(results, params) {
        // Отображение деталей расчета
        document.getElementById('calculationSteps').innerHTML = `
            <div class="calculation-step"><strong>1. Расчет скорости потока:</strong> (${params.flowRate} л/ч) / 3600 / 1000 / (π × (${params.pipeDiameter*1000} мм / 2000)²) = ${results.flowVelocity.toFixed(3)} м/с</div>
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