const Binance = require("binance-api-node").default;

const API_KEY = '';
const API_SECRET = '';

const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
});

const symbol = "BTCUSDT";
const interval = "5m";
const period = 14;
let lastPrice = 0;
let trend = "none";

const calculateRSI = (candlesticks, period) => {
    let gains = 0;
    let losses = 0;
    for (let i = 0; i < period; i++) {
			let change = candlesticks[i].close - candlesticks[i + 1].close;
			if (change > 0) {
				gains += change;
			} else {
				losses -= change;
			}
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    let rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

client.ws.candlesticks(symbol, interval, (candlesticks) => {
	const { close } = candlesticks;
	const rsi = calculateRSI(candlesticks, period);

	if (close > lastPrice && trend !== "buy" && rsi < 30) {
		trend = "buy";
		client.order({
			symbol: symbol,
			side: "BUY",
			type: "MARKET",
			quantity: "0.01",
		}).then(console.log("Bought BTC at ", close))
			.catch(console.error);
	} else if (close < lastPrice && trend !== "sell" && rsi > 70) {
			trend = "sell";
			client.order({
				symbol: symbol,
				side: "SELL",
				type: "MARKET",
				quantity: "0.01",
			}).then(console.log("Sold BTC at ", close))
			.catch(console.error);
		}
		lastPrice = close;
});