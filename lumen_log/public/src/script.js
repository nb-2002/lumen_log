document.addEventListener('DOMContentLoaded', () => {

let app = firebase.app();
var refStat = app.database().ref('stat');
let newest;

const graphFun = (names, val, val0) => {
    let container = document.getElementById(names[0]);
    let dataset = new vis.DataSet();
    let groups = new vis.DataSet();
 
    const lightOffState = (now, until, val0) => {
        for (let i = now; i <= until; i+=5000) {
            let value = val0;
            dataset.add({ x: new Date(i), y: value, group: 1 });
        }
    }
    const addItem = (timestamp, value, g) => { 
        itm = { x: new Date(Number(timestamp)), y: Number(value), group: g }; 
        dataset.add(itm); 
    }
   groups.add({
        id: 0,
        content: names[1],
        className: 'style-0',
        options: {
            yAxisOrientation: 'left',
            interpolation: false,
            drawPoints: { size: 2 }
        }
    });
    groups.add({
        id: 1,
        content: names[2],
        className: 'style-1',
        options: {
            yAxisOrientation: 'left',
            interpolation: false,
            drawPoints: { size: 2 }
        }
    });
        
    let date = new Date();
    lightOffState(Date.now() - 5 * 60 * 1000, Date.now() + 10 * 60 * 1000, val0);
    let options = {
        dataAxis: { showMinorLabels: true, alignZeros: false },
        moveable: false,
        width: '100%',
        height: '550px',
        legend: { left: { position: "top-right" } },
        start: date.setMinutes(date.getMinutes() - 5),
        end: date.setMinutes(date.getMinutes() + 15)
    };
    var ref = app.database().ref(val);
    let graph2d = new vis.Graph2d(container, dataset, groups, options);
    ref.limitToLast(100).on('child_added', function(snapshot) { 
        var newData = {key:snapshot.key, val:snapshot.val()};
        if(val == 'lux' && newest != null){
            if(newest.val > 50 && newData.val < 50){ document.body.classList.toggle('dark-mode'); document.body.classList.toggle('light-mode');} 
            else if(newest.val < 50 && newData.val > 50) { document.body.classList.toggle('dark-mode'); document.body.classList.toggle('light-mode');}
        }
        newest = newData;
        addItem(newData.key, newData.val, 0); 
        lightOffState(Date.now() + 10 * 60 * 1000, Date.now() + 10 * 60 * 1000, val0); 
        // graph2d.setWindow(date.setMinutes(date.getMinutes() - 5), date.setMinutes(date.getMinutes() + 10), {animation: false}); 
    }); 
}

graphFun(['light_vis', 'lux', 'light_off'], 'lux', 50);

let toggleButton = document.getElementById('toggleButton');
toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode')
    document.body.classList.toggle('light-mode')
})
const visFun = (name) => {
    let cont = document.getElementById(name);
    if(cont.style.visibility == 'hidden'){
        cont.style.visibility = ''; 
    }
    else{
        cont.style.visibility = 'hidden';
    }
}
document.getElementById('toggleButtonLight').addEventListener('click', () => { visFun('light_vis') });
// document.getElementById('toggleButtonTemp').addEventListener('click', () => { visFun('temp_vis') });

const fun = (e) => {
    e.preventDefault();
    const input = document.getElementById('input');
    com(input.value);
    input.value = '';
}
document.getElementById("form").addEventListener("submit", fun);
const help = (container) => {
    const c = ["info:", "check:", "clear:", "commands:", "help:"];
    const m = ["display info", "check", "clears text field", "show commands", "show commands"];
    let re="";
    [0,1,2,3,4].forEach((v) => {re += '<div class="flex"><div style="flex-grow:1; flex-basis:0">' + c[v] + '</div><div style="flex-grow:2; flex-basis:0">' + m[v] + "</div></div>"});
    container.innerHTML = re + container.innerHTML;
}
const commands = (container) => {help(container);}
const clearField = (container) => { container.innerHTML = ""; }

const showHMS = (msg, time, container) => {
    let hour = Math.floor(time / 60 / 60 / 1000);
    let minute = Math.floor((time - hour * 60 * 60 * 1000) / 60 / 1000);
    let second = Math.floor((time - hour * 60 * 60 * 1000 - minute * 60 * 1000) / 1000);
    container.innerHTML = "<div>" + msg + (hour>0?(hour + "時"):"") + (minute>0?(minute+ "分"):"") + (second>0?(second + "秒"):"") + "</div>" + container.innerHTML;
}

const getInfo = (container) => {
    refStat.once("value", function(snapshot) {
        let data =  Object.entries(snapshot.val());
        data = data[data.length - 1];
        let [ltime, lflag] = data;
        let now = Date.now();
        if(newest.val < 50){
            container.innerHTML = "今は灯がついていない<br>" + container.innerHTML;
        }
        else {
            let time = now - ltime;
            showHMS("最後の灯がついてる時間: ", time, container);
        }
    });
}

const getTotal = (container) => {
    refStat.once("value").then((snapshot) => {
        let data = Object.entries(snapshot.val());
        let total = 0;
        for(let i = 0 ; i<data.length ; i++){
            if(i == 0 && data[i][1] == 'close'){
                continue;
            }
            total += (data[i][1] == 'open' ? -1 : 1) * Number(data[i][0]);
            if(i == data.length - 1 && data[i][1] == 'open'){
                total += Date.now();
            }
        }
        showHMS("今まで灯がついてる時間: ", total, container);
    });
}

const com = (input) => {
    const coms = {
        "info": getInfo,
        "total": getTotal,
        "clear": clearField,
        "commands": commands,
        "help": help
    }
    let container = document.getElementById('history');
    if(input[0] == '!'){
        input= input.split('!')[1];
        coms[input](container);
    }
}

let infoButton = document.getElementById('infoButton');
infoButton.addEventListener('click', () => { getInfo(document.getElementById('history')); });

});
