function main(){
    var output = function(input){
        document.body.innerHTML += input + "<br/>";
    }
    
    var filename = "test.in";

    var t0 = performance.now();

    var sc = new Module.SortingCompetition();
    sc.setFileName(filename);
    
    if (sc.readData())
        output("File " + filename + " read successfully.");
    else{
        output("Could not read file " + filename);
        return;
    }
    
    if (sc.prepareData())
        output("Data prepared successfully.");
    else{
        output("Could not prepare data.");
        return;
    }
    
    sc.sortData()
    var retVector = sc.outputData("test.out");

    var t1 = performance.now();

    output("Data sorted successfully.");
    asmTime = t1 - t0;
    output("Took WASM: " + asmTime.toFixed(3) + " ms.");
    
    var size = sc.getSize();
    output("Word count: " + size + "<br/>");

    output("Sorted Data:")
    
    for (var i = 0; i < retVector.size(); i++) {
        // console.log("Vector Value: ", retVector.get(i));
        output(retVector.get(i));
    }

}

main();