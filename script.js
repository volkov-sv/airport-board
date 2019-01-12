const getTimePeriod = () => {
    let localTime = new Date();

    let now = new Date();
    let y = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let now2 = new Date();
    let j = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate());

    for(i = 0; i < 12; i++) {
        
        b = new Date(j.getTime());
        b.setHours(b.getHours() + i*2);
       
        c = new Date(y.getTime());
        c.setHours(c.getHours() + i*2 +2);
      
        if (b <= localTime && localTime <= c) {
            selectNum = document.getElementById('select-hours').options[i+1].setAttribute("selected", "true");
        }
    }
};

getTimePeriod();

let state = document.querySelector('input[name="options"]:checked').dataset.type;

const getFlightInfo = (flightList) => {
    let flight_new = [];
    const { items } = flightList;
    for (let i = 0; i < flightList.items.length; i++) {
        let obj = {
        "number": items[i].co.code + items[i].flt,
        "type": state,
        "time": items[i].t_st.slice(11,16),
        "city": items[i].mar1.city_eng,
        "terminal": items[i].term,
        "airline": items[i].co.name,
        "status": items[i].vip_status_eng,
        "realTime": items[i].t_st
        };
        
        if(obj.type == "arrival") {
            let t_at = new Date(items[i].t_at);

            let t_et = new Date(items[i].t_et);

            let t_st = new Date(items[i].t_st);
            t_st.setMinutes(t_st.getMinutes() + 15);
            
            obj.isDelay = t_at > t_st || t_et > t_st
        } else {
            let t_et = new Date(items[i].t_et);

            let t_otpr = new Date(items[i].t_otpr);

            let t_st = new Date(items[i].t_st);
            t_st.setMinutes(t_st.getMinutes() + 15);

            obj.isDelay = (t_et) > t_st || (t_otpr) > t_st
        }
        flight_new.push(obj);

        if (obj.type == "departure") {
            obj.city = flightList.items[i].mar2.city_eng
        }
    }
    return flight_new;
}

const flightTable = document.getElementById('table');

const filter = (val,flight) => flight.filter(i => i.number.toLowerCase().includes(val.toLowerCase()));

const typeFlight = (type, flight) => flight.filter(i => i.type === type);

const isDelay = (flightList) => flightList.filter(i => i.isDelay === true);

const makeFlight = (arr, flightTable) => {
    flightTable.innerHTML='';

    const makeElement = (str) => {
        let element = document.createElement('td');
          element.textContent = str;
        return element;
      };

    for (let i = 0; i < arr.length; i++) {
        let obj = arr[i];
        let elementRow = document.createElement('tr');
        flightTable.appendChild(elementRow);

        let number = makeElement(obj.number);
        elementRow.appendChild(number);
        if (obj.isDelay == true) {
            let spanDelay = document.createElement('span');
            spanDelay.textContent = 'Delay';
            spanDelay.classList.add('badge', 'badge-danger');
            number.appendChild(spanDelay);
        }
        [ 
            'type',
            'time',
            'city',
            'terminal',
            'airline',
            'status' 
        ].forEach(key => {
            elementRow.appendChild(makeElement(obj[key]));
        })
    };
};

document.getElementById('search').addEventListener('input', e => {
    makeFlight(filter(e.target.value, getFlightInfo(flightList)), flightTable)
});

document.getElementById('typeFlight').addEventListener('click', e => {
    state = e.target.dataset.type;
    render();
});

document.querySelector('.btn-delay').addEventListener('click', e => {
    if (e.target.classList.contains('active')) {
      makeFlight(isDelay(getFlightInfo (flightList)), flightTable);
    } else {
      makeFlight(getFlightInfo (flightList), flightTable);
    }
});

let flightList;

const render = () => {
    let hoursValue = document.querySelector('.select-hours').value;
    let periodInHours = 2;
    if (document.querySelector('.select-hours').value == -1) {
        periodInHours = 24;
        hoursValue = 0;
    }

    let dayValue = document.querySelector('.select-date').value;

    let x = new Date();
    let currentTimeZoneOffsetInHours = x.getTimezoneOffset() / 60;

    let y = new Date();
    y.setDate(y.getDate() + (+dayValue));

    let now = new Date(y.getTime());
    let beginDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    beginDay.setHours(beginDay.getHours() + hoursValue - currentTimeZoneOffsetInHours);

    let endDay = new Date(beginDay.getTime());
    endDay.setHours(endDay.getHours() + periodInHours);

    flightTable.innerHTML='';
    document.querySelector('.spinner-border').classList.remove('spinner-hide');

    fetch(`https://cors.io/?https://www.svo.aero/bitrix/timetable/?direction=${state}&dateStart=${beginDay.toISOString().replace('.000Z', '%2B03:00')}&dateEnd=${endDay.toISOString().replace('.000Z', '%2B03:00')}&perPage=99999&page=0&locale=ru`)
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        document.querySelector('.spinner-border').classList.add('spinner-hide');
        flightList = json;
        makeFlight(getFlightInfo (flightList), flightTable);
    })
    .catch(function(err) {
        console.log('Fetch problem: ' + err.message);
    });
}

render ();

document.querySelector('.select-date').addEventListener('change', e => {
    dayValue = e.currentTarget.value;
    render();
});

document.querySelector('.select-hours').addEventListener('change', e => {
    hoursValue = e.currentTarget.value;
    render();
})
