// ========================================
// TELEGRAM MINI APP
// ========================================

const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

tg.setBackgroundColor("#0B0D0F");
tg.setHeaderColor("#0B0D0F");

const displayExpression = document.querySelector(".expression");
const displayResult = document.querySelector(".result");
const buttons = document.querySelectorAll(".button");

let currentValue = "0";
let expression = "";

let justCalculated = false;
let lastExpression = "";


// ========================================
// ОТОБРАЖЕНИЕ
// ========================================

function updateDisplay() {
    displayResult.textContent = formatDisplayNumber(currentValue);
}


function formatDisplayNumber(value) {

    if (value === "Ошибка") {
        return value;
    }

    const stringValue = String(value);

    // Сохраняем запятую сразу после её ввода
    if (stringValue.endsWith(".")) {
        return formatDisplayNumber(stringValue.slice(0, -1)) + ",";
    }

    const number = Number(stringValue);

    if (!Number.isFinite(number)) {
        return "Ошибка";
    }

    return number.toLocaleString("ru-RU", {
        useGrouping: false,
        maximumFractionDigits: 10
    });
}


function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "Ошибка";
    }

    return parseFloat(number.toFixed(10)).toString();
}


// ========================================
// ОБНОВЛЕНИЕ ВЫРАЖЕНИЯ
// ========================================

function updateExpressionDisplay() {

    if (expression === "") {
        displayExpression.textContent = "0";
        return;
    }

    displayExpression.textContent =
        expression.replace(/\./g, ",");
}


// ========================================
// ВВОД ЦИФР
// ========================================

function inputNumber(number) {

    if (currentValue === "Ошибка") {
        clearCalculator();
    }

    // После результата начинаем новое выражение
    if (justCalculated) {

        currentValue = number;
        expression = number;

        justCalculated = false;

        updateDisplay();
        updateExpressionDisplay();

        return;
    }

    // Начало ввода числа
    if (currentValue === "0") {
        currentValue = number;

        // Если выражение ещё пустое
        if (expression === "") {
            expression = number;
        }

        // Если перед числом уже стоит оператор
        else {
            expression += number;
        }
    }

    else {
        currentValue += number;

        expression += number;
    }

    updateDisplay();
    updateExpressionDisplay();
}


// ========================================
// ЗАПЯТАЯ
// ========================================

function inputDecimal() {

    if (currentValue === "Ошибка") {
        clearCalculator();
    }

    if (justCalculated) {

        currentValue = "0.";
        expression = "0.";

        justCalculated = false;

        updateDisplay();
        updateExpressionDisplay();

        return;
    }

    // В текущем числе уже есть запятая
    if (currentValue.includes(".")) {
        return;
    }

    currentValue += ".";

    expression += ".";

    updateDisplay();
    updateExpressionDisplay();
}


// ========================================
// ОПЕРАТОР
// ========================================

function chooseOperator(selectedOperator) {

    if (currentValue === "Ошибка") {
        return;
    }

    // Если после результата нажали оператор —
    // продолжаем вычисление с полученным результатом.
    if (justCalculated) {

        expression = currentValue;
        justCalculated = false;
    }

    // Если оператор уже стоит последним —
    // просто заменяем его.
    if (
        /[+\−×÷]$/.test(expression)
    ) {

        expression =
            expression.slice(0, -1) +
            selectedOperator;
    }

    else {

        expression += ` ${selectedOperator} `;

    }

    currentValue = "0";

    updateExpressionDisplay();
    updateDisplay();
}


// ========================================
// ПРОЦЕНТ
// ========================================

function calculatePercent() {

    if (currentValue === "Ошибка") {
        return;
    }

    // Если процент уже добавлен,
    // второй раз его не добавляем.
    if (expression.endsWith("%")) {
        return;
    }

    // Только добавляем знак процента.
    // Никаких вычислений здесь нет.
    expression += " %";

    updateExpressionDisplay();
}



// ========================================
// ВЫЧИСЛЕНИЕ ВЫРАЖЕНИЯ
// ========================================

function calculate() {

    if (
        expression === "" ||
        expression === "Ошибка"
    ) {
        return;
    }

    try {

        let calculationExpression = expression;

        // ========================================
        // ОБРАБОТКА ПРОЦЕНТОВ
        // ========================================


        calculationExpression =
            calculationExpression.replace(
                /(\d+(?:\.\d+)?)\s*([+\−×÷])\s*(\d+(?:\.\d+)?)\s*%/g,
                (match, first, operator, percent) => {

                    const base = parseFloat(first);
                    const percentValue = parseFloat(percent);

                    const result =
                        base * percentValue / 100;

                    return `${base} ${operator} ${result}`;
                }
            );


        // ========================================
        // ПРОЦЕНТ БЕЗ ОПЕРАТОРА
        // ========================================


        calculationExpression =
            calculationExpression.replace(
                /(\d+(?:\.\d+)?)\s*%/g,
                (match, number) => {

                    return `(${parseFloat(number)} / 100)`;
                }
            );


        // ========================================
        // ЗАМЕНА ОПЕРАТОРОВ
        // ========================================

        calculationExpression =
            calculationExpression
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/−/g, "-");


        // ========================================
        // ВЫЧИСЛЕНИЕ
        // ========================================

        const result =
            Function(
                `"use strict"; return (${calculationExpression})`
            )();


        if (!Number.isFinite(result)) {
            throw new Error();
        }


        const formattedResult =
            formatNumber(result);


        // Показываем исходное выражение
        // до вычисления.
        displayExpression.textContent =
            expression.replace(/\./g, ",");


        currentValue = formattedResult;

        lastExpression = expression;

        expression = formattedResult;

        justCalculated = true;


        updateDisplay();

    }

    catch {

        currentValue = "Ошибка";

        displayExpression.textContent =
            "Некорректное выражение";

        expression = "";

        justCalculated = true;

        updateDisplay();
    }
}



// ========================================
// ОЧИСТКА
// ========================================

function clearCalculator() {

    currentValue = "0";
    expression = "";

    justCalculated = false;
    lastExpression = "";

    displayExpression.textContent = "0";

    updateDisplay();
}


// ========================================
// СМЕНА ЗНАКА
// ========================================

function toggleSign() {

    if (
        currentValue === "0" ||
        currentValue === "Ошибка"
    ) {
        return;
    }

    if (currentValue.startsWith("-")) {
        currentValue =
            currentValue.slice(1);
    }

    else {
        currentValue =
            "-" + currentValue;
    }

    // Заменяем последнее число
    // в выражении.
    expression =
        expression.replace(
            /(-?\d+(?:\.\d+)?)\s*$/,
            currentValue
        );

    updateDisplay();
    updateExpressionDisplay();
}


// ========================================
// УДАЛЕНИЕ СИМВОЛА
// ========================================

function backspace() {

    if (justCalculated) {
        clearCalculator();
        return;
    }

    if (
        expression === "" ||
        expression === "0"
    ) {
        return;
    }

    // Удаляем пробелы в конце
    expression = expression.replace(/\s+$/, "");

    // Если последний символ — оператор,
    // удаляем оператор и пробелы.
    if (/[+\−×÷]$/.test(expression)) {

        expression =
            expression.slice(0, -1)
                .replace(/\s+$/, "");

        currentValue = "0";

        updateDisplay();
        updateExpressionDisplay();

        return;
    }

    // Удаляем последний символ числа
    expression =
        expression.slice(0, -1);

    // Получаем последнее число
    const match =
        expression.match(
            /(-?\d*\.?\d+)$/
        );

    if (match) {
        currentValue = match[1];
    }

    else {
        currentValue = "0";
    }

    updateDisplay();
    updateExpressionDisplay();
}


// ========================================
// КНОПКИ
// ========================================

buttons.forEach((button) => {

    button.addEventListener("click", () => {

        const value =
            button.textContent.trim();


        if (/^\d$/.test(value)) {
            inputNumber(value);
            return;
        }


        if (value === ",") {
            inputDecimal();
            return;
        }


        if (value === "C") {
            clearCalculator();
            return;
        }


        if (value === "+/-") {
            toggleSign();
            return;
        }


        if (value === "%") {
            calculatePercent();
            return;
        }


        if (value === "=") {
            calculate();
            return;
        }


        if (
            ["+", "−", "×", "÷"].includes(value)
        ) {
            chooseOperator(value);
        }

    });

});


// ========================================
// КЛАВИАТУРА
// ========================================

document.addEventListener("keydown", (event) => {

    const key = event.key;


    if (/^\d$/.test(key)) {
        inputNumber(key);
        return;
    }


    if (
        key === "." ||
        key === ","
    ) {
        inputDecimal();
        return;
    }


    if (key === "+") {
        chooseOperator("+");
        return;
    }


    if (key === "-") {
        chooseOperator("−");
        return;
    }


    if (key === "*") {
        chooseOperator("×");
        return;
    }


    if (key === "/") {

        event.preventDefault();

        chooseOperator("÷");

        return;
    }


    if (key === "%") {
        calculatePercent();
        return;
    }


    if (
        key === "Enter" ||
        key === "="
    ) {
        calculate();
        return;
    }


    if (
        key === "Escape" ||
        key.toLowerCase() === "c"
    ) {
        clearCalculator();
        return;
    }


    if (key === "Backspace") {
        backspace();
    }

});




