const WebSocket = require ('ws');
const url = require('url');
const wss = new WebSocket.Server({port: 8080});

clients = {};
dataToSort = [];
numElements = 0;
sortedData = [];
var t0, t1;

wss.on('connection', (ws, req) => {

    console.log("Connection Made");
    ws.isAlive = true;
    console.log("Currently ", wss.clients.size, " clients connected");
    if (wss.clients.size == 1){
        ws.id = "controller";
    }
    else if (wss.clients.size == 2){
        ws.id = "processor1";
    }
    else if (wss.clients.size == 3){
        ws.id = "processor2";
    }
    else if (wss.clients.size == 4){
        ws.id = "processor3";
    }

    clients[ws.id] = ws;
    ws.send(JSON.stringify({type:'msg', id:ws.id, data: String("Connected to WS Server")}));
    // console.log(clients);

    ws.on('close', function close(){
        wss.clients.forEach(function each(client){
            if (client != ws && client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify({type:'msg', data: "A client disconnected"}));
            }
        })
        delete clients[ws.id];
        console.log("\nA client disconnected");
        console.log("Currently ", wss.clients.size, " clients connected");
    })
    ws.on('message', message => {
        message = message.toString().replace(/\n/g, ' ');
        console.log("Message received: " + message);

        var msg = JSON.parse(message);

        if(msg.type == 'register'){
            // console.log("\nData from controller: " + String(msg.data));
            dataToSort = msg.data.split(" ");
            numElements = dataToSort[0];
            dataToSort.shift();
        }
        else if (msg.type == 'go'){
            if (wss.clients.size != 4){
                console.log("Not enough clients connected to do work");
            }

            else{
                console.log("Enough clients connected! Let's get to work");
                t0 = performance.now();
                clients["processor1"].send(JSON.stringify({type:'process', id:"processor1", data: dataToSort.slice(0, 350)}));
                clients["processor2"].send(JSON.stringify({type:'process', id:"processor2", data: dataToSort.slice(350, 700)}));
                clients["processor3"].send(JSON.stringify({type:'process', id:"processor3", data: dataToSort.slice(700)}));
            }
        }
        else if(msg.type == 'result'){
            // console.log("\nData from " + msg.id + ": " + msg.data + "\n\n");
            sortedData.push(...String(msg.data).split(','));
        }

        if(sortedData.length == numElements && sortedData.length != 0){
            t1 = performance.now();
            console.log("\n\n Merged Data\n", sortedData.join(" "));
            sortedData.sort(function(a, b) {
                return a.length - b.length || 
                       a.localeCompare(b);    
            });
            console.log("\n\n Fixed Data\n", sortedData.join(" "));
            console.log("\n\nTook WebSocket server and clients: " + (t1-t0).toFixed(2) + " ms.");
            clients["controller"].send(JSON.stringify({type:'result', id:"controller", data: sortedData.join(" ")}));
        }
    })
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});

console.log("The WebSocket server is running on port 8080");
