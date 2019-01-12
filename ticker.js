function Ticker() {
    this._i = 0;
}

Ticker.prototype = {
    tick: function() {
        console.log(this._i++)
    }
}


var ticker = new Ticker();
setInterval(ticker.tick, 1000);

//потому-что таким образом мы просто вызываем функцию, а не как метод объекта
//соответственно контекст при этом теряется
//можно исправить, например, сделав обертку, чтобы вызвать как метод объекта и получить нужный контекст

setInterval(function() {ticker.tick()}, 1000);

 //или с помощью bind, чтобы передать контекст
 setInterval(ticker.tick.bind(ticker), 1000);