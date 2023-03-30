'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Diego Souza',
  movements: [
    { value: 200, time: '2019-11-18T21:31:17.178Z' },
    { value: 455.23, time: '2019-12-23T07:42:02.383Z' },
    { value: -306.5, time: '2020-01-28T09:15:04.904Z' },
    { value: 25000, time: '2020-04-01T10:17:24.185Z' },
    { value: -642.21, time: '2020-05-08T14:11:59.604Z' },
    { value: -133.9, time: '2020-05-27T17:01:17.194Z' },
    { value: 79.97, time: '2020-07-11T23:36:17.929Z' },
    { value: 1300, time: '2020-07-12T10:51:36.790Z' },
  ],
  interestRate: 1.2, // %
  pin: 1111,
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [
    { value: 5000, time: '2019-11-01T13:15:33.035Z' },
    { value: 3400, time: '2019-11-30T09:48:16.867Z' },
    { value: -150, time: '2019-12-25T06:04:23.907Z' },
    { value: -790, time: '2020-01-25T14:18:46.235Z' },
    { value: -3210, time: '2020-02-05T16:33:06.386Z' },
    { value: -1000, time: '2020-04-10T14:43:26.374Z' },
    { value: 8500, time: '2020-06-25T18:49:59.371Z' },
    { value: -30, time: '2020-07-26T12:01:20.894Z' },
  ],
  interestRate: 1.5,
  pin: 2222,
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.logout-timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Event handler
let currentAccount, timer;

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////// AUTO LOGIN FOR TESTS PURPOSE ////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
containerApp.style.opacity = 100;

function testLogin(account) {
  currentAccount = account;
  // Display UI and message
  labelWelcome.textContent = `Welcome back, ${
    currentAccount.owner.split(' ')[0]
  }`;
  containerApp.style.opacity = 100;

  updateUI();
}

testLogin(account1);

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

function currency(number) {
  const formatter = new Intl.NumberFormat(currentAccount.locale, {
    style: 'currency',
    currency: currentAccount.currency,
  });
  return formatter.format(number);
}

function displayMovements(movs, sort = false) {
  containerMovements.innerHTML = '';
  let movements = sort ? movs.slice().sort((a, b) => a.value - b.value) : movs;

  movements.forEach(function (mov, i) {
    const type = mov.value > 0 ? 'deposit' : 'withdrawal';

    const movDate = `${new Date(
      currentAccount.movements[i].time
    ).toLocaleDateString(currentAccount.locale)} ${new Date(
      currentAccount.movements[i].time
    ).toLocaleTimeString(currentAccount.locale, {
      hour: 'numeric',
      hour12: false,
      minute: 'numeric',
    })}`;

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}
      </div>
      <div class="movements__date">${movDate}</div>
      <div class="movements__value">${currency(mov.value)}</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

function calcDisplayBalance(account) {
  account.balance = account.movements.reduce((acc, cur) => acc + cur.value, 0);
  labelBalance.textContent = `${currency(account.balance)}`;
}

function calcDisplaySummary(account) {
  const incomes = account.movements
    .filter(mov => mov.value > 0)
    .reduce((acc, mov) => acc + mov.value, 0);
  labelSumIn.textContent = `${currency(incomes)}`;

  const outcomes = account.movements
    .filter(mov => mov.value < 0)
    .reduce((acc, mov) => acc + mov.value, 0);
  labelSumOut.textContent = `${currency(Math.abs(outcomes))}`;

  const interest = account.movements
    .filter(mov => mov.value > 0)
    .map(deposit => (deposit.value * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumInterest.textContent = `${currency(interest)}`;
}

function updateUI() {
  // Reset input fields
  inputLoginUsername.value = inputLoginPin.value = '';
  inputTransferAmount.value = inputTransferTo.value = '';
  inputLoanAmount.value = '';
  inputCloseUsername.value = inputClosePin.value = '';
  labelTimer.textContent = '';

  setLogoutTimer(300);
  calcDisplayBalance(currentAccount);
  displayMovements(currentAccount.movements);
  calcDisplaySummary(currentAccount);

  labelDate.textContent = `${new Date().toLocaleDateString(
    currentAccount.locale
  )} ${new Date().toLocaleTimeString(currentAccount.locale, {
    hour: 'numeric',
    minute: 'numeric',
  })}`;
  // Show user interface
  containerApp.style.opacity = 100;
}

function createUsernames(accounts) {
  accounts.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
}

createUsernames(accounts);

btnLogin.addEventListener('click', function (e) {
  // Prevent form from subimitting
  e.preventDefault();

  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );
  if (currentAccount.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    updateUI();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push({
      value: -amount,
      time: new Date().toISOString(),
    });
    receiverAcc.movements.push({
      value: amount,
      time: new Date().toISOString(),
    });
    updateUI();
    console.log('Transfer valid');
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some(mov => mov.value >= amount * 0.1)
  ) {
    inputLoanAmount.value = '';
    setTimeout(function () {
      currentAccount.movements.push({
        value: amount,
        time: new Date().toISOString(),
      });
      updateUI();
    }, 5000);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  // Check credentials
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    // Delete user from data
    accounts.splice(accounts.indexOf(currentAccount), 1);
    console.log(accounts);
    // Log user out (hide UI)
    containerApp.style.opacity = 0;
  }
});

function overallBalance(accounts) {
  return accounts
    .flatMap(account => account.movements)
    .reduce((acc, mov) => acc + mov, 0);
}

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
  setLogoutTimer(300);
});

function logoutTimer(time) {
  function ticker() {
    if (time >= 0) {
      const min = `${Math.floor(time / 60)}`.padStart(2, '0');
      const sec = `${time % 60}`.padStart(2, '0');
      const html = `You will be logged out in <span class="timer">${min}:${sec}</span>`;
      labelTimer.innerHTML = html;
      time--;
    } else {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      currentAccount = '';
      labelWelcome.textContent = 'Log in to get started';
    }
  }

  ticker();
  const timer = setInterval(ticker, 1000);
  return timer;
}

function setLogoutTimer(time) {
  if (timer) clearInterval(timer);
  timer = logoutTimer(time);
}
