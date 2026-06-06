'use strict';

const state = {
  current: '0',
  previous: null,
  operator: null,
  waitingForOperand: false,
  expression: '',
};

const resultEl = document.getElementById('result');
const expressionEl = document.getElementById('expression');

function updateDisplay() {
  resultEl.textContent = state.current;
  expressionEl.textContent = state.expression;

  const len = state.current.length;
  resultEl.classList.toggle('small', len > 10);
  resultEl.classList.toggle('xsmall', len > 14);
}

function setActiveOperator(op) {
  document.querySelectorAll('.btn-operator').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === op);
  });
}

function inputDigit(digit) {
  if (state.waitingForOperand) {
    state.current = digit;
    state.waitingForOperand = false;
  } else {
    state.current = state.current === '0' ? digit : state.current + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (state.waitingForOperand) {
    state.current = '0.';
    state.waitingForOperand = false;
    updateDisplay();
    return;
  }
  if (!state.current.includes('.')) {
    state.current += '.';
    updateDisplay();
  }
}

function calculate(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (op === '+') return x + y;
  if (op === '−') return x - y;
  if (op === '×') return x * y;
  if (op === '÷') return y !== 0 ? x / y : 'Error';
  return b;
}

function formatResult(val) {
  if (val === 'Error') return 'Error';
  const n = parseFloat(val.toPrecision(12));
  return String(n);
}

function handleOperator(op) {
  if (state.operator && !state.waitingForOperand) {
    const result = calculate(state.previous, state.current, state.operator);
    state.current = formatResult(result);
    state.previous = state.current;
    state.expression = `${state.previous} ${op}`;
  } else {
    state.previous = state.current;
    state.expression = `${state.current} ${op}`;
  }
  state.operator = op;
  state.waitingForOperand = true;
  setActiveOperator(op);
  updateDisplay();
}

function handleEquals() {
  if (!state.operator || state.waitingForOperand) return;

  const result = calculate(state.previous, state.current, state.operator);
  state.expression = `${state.previous} ${state.operator} ${state.current} =`;
  state.current = formatResult(result);
  state.previous = null;
  state.operator = null;
  state.waitingForOperand = true;
  setActiveOperator(null);
  updateDisplay();
}

function handleClear() {
  state.current = '0';
  state.previous = null;
  state.operator = null;
  state.waitingForOperand = false;
  state.expression = '';
  setActiveOperator(null);
  updateDisplay();
}

function handleToggleSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  updateDisplay();
}

function handlePercent() {
  const val = parseFloat(state.current);
  if (isNaN(val)) return;
  state.current = String(val / 100);
  updateDisplay();
}

document.querySelector('.buttons').addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const { action, value } = btn.dataset;

  if (action === 'digit') inputDigit(value);
  else if (action === 'decimal') inputDecimal();
  else if (action === 'operator') handleOperator(value);
  else if (action === 'equals') handleEquals();
  else if (action === 'clear') handleClear();
  else if (action === 'toggle-sign') handleToggleSign();
  else if (action === 'percent') handlePercent();
});

document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
  else if (e.key === '.') inputDecimal();
  else if (e.key === '+') handleOperator('+');
  else if (e.key === '-') handleOperator('−');
  else if (e.key === '*') handleOperator('×');
  else if (e.key === '/') { e.preventDefault(); handleOperator('÷'); }
  else if (e.key === 'Enter' || e.key === '=') handleEquals();
  else if (e.key === 'Escape') handleClear();
  else if (e.key === '%') handlePercent();
  else if (e.key === 'Backspace') {
    if (!state.waitingForOperand && state.current.length > 1) {
      state.current = state.current.slice(0, -1);
    } else {
      state.current = '0';
    }
    updateDisplay();
  }
});

updateDisplay();
