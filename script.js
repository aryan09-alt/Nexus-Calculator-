const result = document.getElementById("result");
const history = document.getElementById("history");
const historyList = document.getElementById("historyList");

let expression = "";
let justCalculated = false;

let calculations = [];

function updateDisplay() {
    result.value = expression || "0";
}

function calculate() {

    if (!expression) return;

    try {

        let exp = expression.replace(
            /(\d+\.?\d*)%/g,
            "($1/100)"
        );

        if (!/^[0-9+\-*/().\s]+$/.test(exp)) {
            throw new Error("Invalid");
        }

        const answer = Function(
            '"use strict"; return (' + exp + ')'
        )();

        if (!Number.isFinite(answer)) {
            throw new Error("Invalid");
        }

        const oldExpression = expression;

        const formatted = String(
            Number(answer.toPrecision(12))
        );

        history.textContent = oldExpression + " =";

        calculations.unshift({
            expression: oldExpression,
            answer: formatted
        });

        calculations = calculations.slice(0, 10);

        renderHistory();

        expression = formatted;
        justCalculated = true;

        updateDisplay();

    } catch {

        result.value = "Error";
        expression = "";
        justCalculated = false;

    }
}

function renderHistory() {

    historyList.innerHTML = "";

    if (!calculations.length) {

        historyList.innerHTML =
            "<p>No calculations yet.</p>";

        return;
    }

    calculations.forEach(item => {

        const div = document.createElement("div");

        div.className = "history-item";

        const left = document.createElement("span");
        const right = document.createElement("strong");

        left.textContent = item.expression;
        right.textContent = item.answer;

        div.append(left, right);

        div.addEventListener("click", () => {

            expression = item.answer;

            justCalculated = true;

            updateDisplay();

        });

        historyList.appendChild(div);

    });
}


document.querySelectorAll("[data-value]").forEach(button => {

    button.addEventListener("click", () => {

        const value = button.dataset.value;

        if (justCalculated) {

            if (/[0-9.]/.test(value)) {
                expression = "";
            }

            justCalculated = false;

        }

        if (value === ".") {

            const current = expression.split(/[+\-*/]/).pop();

            if (current.includes(".")) return;

        }

        expression += value;

        updateDisplay();

    });

});


document.querySelectorAll("[data-action]").forEach(button => {

    button.addEventListener("click", () => {

        const action = button.dataset.action;

        if (action === "clear") {

            expression = "";
            history.textContent = "";
            justCalculated = false;

            updateDisplay();

        }

        if (action === "delete") {

            expression = expression.slice(0,-1);

            updateDisplay();

        }

        if (action === "calculate") {

            calculate();

        }

        if (action === "sign") {

            if (!expression) return;

            expression = "-(" + expression + ")";

            justCalculated = false;

            updateDisplay();

        }

    });

});


document.getElementById("clearHistory").addEventListener("click", () => {

    calculations = [];

    renderHistory();

});


document.getElementById("themeToggle").addEventListener("click", () => {

    document.body.classList.toggle("light");

    const light = document.body.classList.contains("light");

    document.getElementById("themeToggle").textContent =
        light ? "🌙" : "☀️";

});


document.addEventListener("keydown", event => {

    if (/^[0-9.+\-*/()%]$/.test(event.key)) {

        if (justCalculated && /[0-9.]/.test(event.key)) {
            expression = "";
        }

        justCalculated = false;

        expression += event.key;

        updateDisplay();

    }

    else if (event.key === "Enter") {

        event.preventDefault();

        calculate();

    }

    else if (event.key === "Backspace") {

        expression = expression.slice(0,-1);

        updateDisplay();

    }

    else if (event.key === "Escape") {

        expression = "";

        history.textContent = "";

        updateDisplay();

    }

});

renderHistory();