let currentResignRuleSet = "new";
let currentRuleSet = "max";
let cycleTime = {years:9999,months:9999};
let hideResignButtons = true;
let isSimulationRunning = false;
const justicesArray = [];
const justicesRetiredArray = [];
let justiceCount=0;
let justiceSelectionCount = 0;
let nextJusticeNumber = 0;
let nextRetireDate = new Date();
let presidentAppointmentCount = 0;
let presidentCount=1;
let presidentMaxTermAppointments = 2;
let presidentMaxYearAppointments = 1;
let presidentMinimumExperience = 3;
let presidentRelectionOptionValue = 3;
let presidentYearAppointmentCount = 0;
let presidentYearsInOffice = 1;
let rulesDisplayToggle = false;
let shouldHide = true;
let simulationFunctionId = -1;
let simulationDate = new Date("01-20-2025");
let timerLength = 1000;
let targetTerm = 20;
/*document.querySelector("#download-file").addEventListener('click', async function() {
    try {
    let text_data = await downloadFile();
    document.querySelector("#preview-text").textContent = text_data;
    }
    catch(e) {
    alert(e.message);
    }
});*/

async function initFile() {
    try {
        let text_data = await downloadFile();
        //document.querySelector("#preview-text").textContent = text_data;
    }
    catch(e) {
    alert(e.message);
    }
}
async function downloadFile() {
    let response = await fetch("/sample.txt.html");
    
    if(response.status != 200) {
    throw new Error("Server Error");
    }
    
    // read response stream as text
    let text_data = await response.text();

    let tempArray = text_data.split("\n");
    for(i=0;i<tempArray.length;i++){
        let holdArray = tempArray[i].split(",");
        addJusticeArrayEntry(holdArray[0], new Date(holdArray[1]));
    }
    //document.querySelector("#stuff-area").textContent = "tempsize:" + tempArray.length + "justices size" + justicesArray.length;

    sortJusticesByTargetRetireDate();
    setJusticeCount();
    return text_data;
}

function addJusticeArrayEntry(justiceName, appointedDate, retireDate){
    let tempRetireDate = new Date(appointedDate.getTime());
    if((typeof retireDate)=="object"){
        tempRetireDate = retireDate;
    }
    else tempRetireDate.setUTCFullYear((tempRetireDate.getUTCFullYear())+targetTerm);
    justicesArray.push({name:justiceName, appointedDate:new Date(appointedDate), targetRetireDate:tempRetireDate});
}

function initFunction() {
    setJusticeCount();
    document.getElementById("simDate").valueAsDate = simulationDate;
    setNextRetireDate();
    formatCycleTime();
    setPresidentialYearsInOffice();
    setPresidentialAppointmentCount();
    initFile();
    displayRetiredJustices();
    displayCurrentPresident();
    document.getElementById('maxTermAppointments').value = presidentMaxTermAppointments;
    document.getElementById('maxYearAppointments').value = presidentMaxYearAppointments;
    document.getElementById('requiredExperience').value = presidentMinimumExperience;
}
function setPresidentialYearsInOffice(){
    document.getElementById("presidentYears").innerText = presidentYearsInOffice;
    if(presidentYearsInOffice>=presidentMinimumExperience){
        document.getElementById("presidentYears").classList.remove("buttonRed");
        document.getElementById("presidentYears").classList.add("buttonGreen");
    }
    else{
        document.getElementById("presidentYears").classList.add("buttonRed");
        document.getElementById("presidentYears").classList.remove("buttonGreen");
    }
}
function setPresidentialAppointmentCount(){
    document.getElementById("presidentAppointmentsYear").innerText = presidentYearAppointmentCount;
    if(presidentYearAppointmentCount<presidentMaxYearAppointments){
        document.getElementById("presidentAppointmentsYear").classList.remove("buttonRed");
        document.getElementById("presidentAppointmentsYear").classList.add("buttonGreen");
    }
    else{
        document.getElementById("presidentAppointmentsYear").classList.remove("buttonGreen");
        document.getElementById("presidentAppointmentsYear").classList.add("buttonRed");
 
    }
    document.getElementById("presidentAppointmentsTerm").innerText = presidentAppointmentCount;
    if(presidentAppointmentCount<presidentMaxTermAppointments){
        document.getElementById("presidentAppointmentsTerm").classList.remove("buttonRed");
        document.getElementById("presidentAppointmentsTerm").classList.add("buttonGreen");
    }
    else{
        document.getElementById("presidentAppointmentsTerm").classList.remove("buttonGreen");
        document.getElementById("presidentAppointmentsTerm").classList.add("buttonRed");
 
    }}

function setNextRetireDate(){
    nextRetireDate = new Date(simulationDate.getTime());
    nextRetireDate.setUTCFullYear(nextRetireDate.getUTCFullYear() + cycleTime.years);
    nextRetireDate.setUTCMonth(nextRetireDate.getUTCMonth() + cycleTime.months);    
    document.getElementById("retireDate").valueAsDate = nextRetireDate;
}

function sortJusticesByTargetRetireDate(){
    justicesArray.sort(function(a, b){return a.targetRetireDate - b.targetRetireDate});
}

function setJusticeCount() {
    let x = document.getElementById("justiceCount");
    justiceCount = x.value;
    displayCurrentJustices();
    setCycleTime();
}
function generateCheckBoxId(ii){
    return "check"+ii;
}
function displayCurrentJustices(){
    let text = "<table>";
    text += "<thead><th>Resign</th><th>Justice</th><th>Appointed</th><th>Retire Target</thead>"

    for (let ii = 0; ii < justicesArray.length; ii++) {
        text += '<tr>';
        let cJustice = justicesArray[ii];
        //let retireDate = new Date(cJustice.appointedDate.getTime());
        //retireDate.setUTCFullYear(retireDate.getUTCFullYear()+ targetTerm);
        //month = (cJustice.appointedDate.getMonth()+1);
        text += "<td><input type='checkbox' id='" + generateCheckBoxId(ii) +"' onchange=justiceSelected(this)></td>";
        text += "<td>" + cJustice.name + "</td>";
        text += '<td>' + formatYearMonth(cJustice.appointedDate) + "</td>";
        text += '<td>' + formatYearMonth(cJustice.targetRetireDate) + '</td>';
        text += '</tr>';
    }
    text += "</table>";
    document.getElementById("currentJustices").innerHTML = text;
}
function displayRetiredJustices(){
    let text = "<table>";
    text += "<thead>\
        <tr>\
            <th>Justice</th>\
            <th>Appointed</th>\
            <th>Retire Target</th>\
            <th>Retire Actual</th>\
            <th>Term Length</th>\
        <tr>\
    </thead>\
    <tbody>"

    for (let ii = 0; ii < justicesRetiredArray.length; ii++) {
        text += '<tr>';
        let cJustice = justicesRetiredArray[ii];
        text += "<td>" + cJustice.name + "</td>";
        text += '<td>' + formatYearMonth(cJustice.appointedDate) + "</td>";
        text += '<td>' + formatYearMonth(cJustice.targetRetireDate) + '</td>';
        text += '<td>' + formatYearMonth(cJustice.actualRetireDate) + '</td>';
        text += '<td>' + formatDateDifference(cJustice.appointedDate,cJustice.actualRetireDate) + '</td>';
        text += '</tr>';
    }
    text += "</tbody></table>";
    document.getElementById("retiredJustices").innerHTML = text;
}
function formatYearMonth(myDate){
    return myDate.getFullYear() + "-" + ('0' + (myDate.getMonth()+1)).slice(-2);
}
function speedChange(number){
    if(number.id == "simulation_slower") timerLength=timerLength*2;
    else if(number.id == "simulation_faster") timerLength = timerLength/2;
    else timerLength = number.value;
    document.getElementById("simulation_speed").value = timerLength;
    if (isSimulationRunning){
        simulationStop();
        simulationStart();
    }
}
function advanceDate(){
    simulationDate.setUTCMonth(simulationDate.getUTCMonth()+1);
    document.getElementById("simDate").valueAsDate = simulationDate;
    if(simulationDate.getUTCMonth()==0){
        presidentYearsInOffice++;
        presidentYearAppointmentCount = 0;
        setPresidentialAppointmentCount();
        setPresidentialYearsInOffice();
        if(simulationDate.getUTCFullYear()%4 == 1){
            handleEndOfTerm();
        }
    }
    //document.getElementById("stuff-area").textContent = tempText + " month:" + holdMonth + " orig:" + simDate + " new:" + simulationDate;
    checkRetirement();
}
function handleEndOfTerm(){
    presidentAppointmentCount = 0;
    presidentYearAppointmentCount = 0;
    setPresidentialAppointmentCount();
    if(presidentYearsInOffice>8) newPresident();
    else if(presidentYearsInOffice < 6){
        if(presidentRelectionOptionValue == 3){
            if(!confirm("End of presidential term. Reelect?\nOK for yes, Cancel for no")){
                newPresident();
            }
        } else if(presidentRelectionOptionValue == 2) newPresident();
    }
}
function newPresident(){
    presidentYearsInOffice = 1;
    presidentCount++;
    setPresidentialYearsInOffice();
    presidentYearAppointmentCount = 0;
    presidentAppointmentCount = 0;
    setPresidentialAppointmentCount();
    displayCurrentPresident();
}
function displayCurrentPresident(){
    document.getElementById("presidentName").innerText = "Potus" + ("000"+presidentCount).slice(-3);
}
function generateJusticeName(base){
    return base+('000' + (++nextJusticeNumber)).slice(-4);
}
function checkRetirement(){
    if(currentRuleSet == "regular"){
        if(someoneCanRetire()){
            if(simulationDate >= nextRetireDate){
                retireOldestJustice();
            }
        }
    }
    else{
//assumption is that array is sorted
        while(someoneCanRetire() 
        && justicesArray[0].targetRetireDate<simulationDate){
            retireOldestJustice();
        }
    }
}
function someoneCanRetire(){
    if(presidentYearsInOffice>=presidentMinimumExperience
    && presidentAppointmentCount<presidentMaxTermAppointments
    && presidentYearAppointmentCount<presidentMaxYearAppointments)
        return true;
    else return false;
}
function retireOldestJustice(){
    setNextRetireDate();
    removeJusticeArrayEntry(0);
    addJusticeArrayEntry(generateJusticeName("auto"), simulationDate);
    displayCurrentJustices();
    presidentAppointmentCount++;
    presidentYearAppointmentCount++;
    setPresidentialAppointmentCount();
}
function updateSimulationDate(){
    simulationDate = document.getElementById("simDate").valueAsDate;    
}
function updateRetirementDate(){
    nextRetireDate = document.getElementById("retireDate").valueAsDate;    
}
function manageSimulation(){
    if (isSimulationRunning) {
        simulationStop();
    }
    else {
        simulationStart();
    }
    isSimulationRunning = !isSimulationRunning;
}

function simulationStop(){
    let myBtn = document.getElementById("runSimulation");
    myBtn.textContent = "Run Simulation"
    myBtn.classList.remove("buttonRed");
    myBtn.classList.add("buttonGreen");
    if (simulationFunctionId != -1){
        clearInterval(simulationFunctionId);
        simulationFunctionId = -1;
    }
}
function simulationStart(){    
    let myBtn = document.getElementById("runSimulation");
    myBtn.textContent = "Stop Simulation"
    myBtn.classList.remove("buttonGreen");
    myBtn.classList.add("buttonRed");
    simulationFunctionId = setInterval(advanceDate, timerLength );
}
function justiceSelected(inputBox){
    simulationStop();
    let myIndex = inputBox.id.slice(-1);
    justiceSelectionCount += (inputBox.checked?1:-1);
    document.getElementById("reassignAllJustices").innerText = "Replace " + justiceSelectionCount + " selections";
    document.getElementById("hideResignButtons").hidden = justiceSelectionCount?false:true;
}
function clearAllJustices(){
    for(ii=0;ii<justiceCount;ii++){
        inputBox = document.getElementById(generateCheckBoxId(ii));
        if(inputBox.checked){
            justiceSelectionCount--
            inputBox.checked = false;
        }
    }
    document.getElementById("hideResignButtons").hidden = true;
}
function removeJusticeArrayEntry(position){
    let tempArray = justicesArray.splice(position,1);
    justicesRetiredArray.splice(0,0,{name:tempArray[0].name, 
                                appointedDate:tempArray[0].appointedDate,
                                targetRetireDate:tempArray[0].targetRetireDate,
                                actualRetireDate:new Date(simulationDate.getTime()),
                                });
    displayRetiredJustices();
}
function replaceSelectedJustices(){
    for(ii=justiceCount-1;ii>=0;ii--){
        inputBox = document.getElementById(generateCheckBoxId(ii));
        if(inputBox.checked){
            let tempRetireDate = currentResignRuleSet=="new"?"notAnObject":justicesArray[ii].targetRetireDate;
            //if(currentResignRuleSet=="new") tempRetireDate = "notAnObject";
            removeJusticeArrayEntry(ii);
            inputBox.checked = false;
            addJusticeArrayEntry(generateJusticeName("manual"), simulationDate, tempRetireDate);
            presidentAppointmentCount++;
            presidentYearAppointmentCount++;
            setPresidentialAppointmentCount();
        }
    }
    sortJusticesByTargetRetireDate();
    document.getElementById("hideResignButtons").hidden = true;
    justiceSelectionCount = 0;
    displayCurrentJustices();
}
function setTargetTermLength(inputBox){
    targetTerm = +(inputBox.value);
    setCycleTime();
    resetTargetRetirementDates();
    displayCurrentJustices();
}
function resetTargetRetirementDates(){
    for(ii=0;ii<justicesArray.length;ii++){
        let tempRetireDate = new Date(justicesArray[ii].appointedDate.getTime());
        //alert("init:"+tempRetireDate);
        tempRetireDate.setUTCFullYear((tempRetireDate.getUTCFullYear())+targetTerm);  
        //alert("after add:"+targetTerm+" "+tempRetireDate);
        justicesArray[ii].targetRetireDate = tempRetireDate;  
    }
}
function setCycleTime(){
    if(justiceCount && targetTerm){
        tempCycleTime = targetTerm/justiceCount;
        cycleTime.years = Math.trunc(tempCycleTime);
        cycleTime.months = Math.round((tempCycleTime-cycleTime.years)*12);
    }
    else {
        cycleTime.years = 9999;
        cycleTime.months = 9999;
    }
    formatCycleTime();
}
function formatCycleTime(){
    myElement = document.getElementById("cycleTimeDisplay");
    if(cycleTime.years<100){
        //myElement.innerText = Math.trunc(cycleTime) + " years, " + Math.round((cycleTime-Math.trunc(cycleTime))*12) + " months";
        myElement.innerText = "Retire justice every " + cycleTime.years + " years, " + cycleTime.months + " months";
    }
    else{
        myElement.innerText = "undefined";
    }
}
function presidentRelectionOption(button){
    switch(button.id){
        case "presAlways":
            presidentRelectionOptionValue=1;
            break;
        case "presNever":
            presidentRelectionOptionValue=2;
            break;
        case "presAsk":
            presidentRelectionOptionValue=3;
            break;
    }
}
function setRequiredExperience(number){
    presidentMinimumExperience = number.value;
    setPresidentialYearsInOffice();
}
function setMaxTermAppointments(number){
    presidentMaxTermAppointments = number.value;
    setPresidentialAppointmentCount();
}
function setMaxYearAppointments(number){
    presidentMaxYearAppointments = number.value;
    setPresidentialAppointmentCount();
}
function selectRuleSet(selection){
    if(selection.id == "ruleSetRegular"){
        currentRuleSet = "regular";
        document.getElementById("cycleValuesDisplay").hidden = false;
    }
    else{
        currentRuleSet = "max";
        document.getElementById("cycleValuesDisplay").hidden = true;
    }
}
function selectResignRuleSet(selection){
    if(selection.id == "resignRuleNew"){
        currentResignRuleSet = "new";
    }
    else{
        currentResignRuleSet = "inherit";
    }
}
function toggleRuleDisplay(){
    rulesDisplayToggle = !rulesDisplayToggle;
    if(rulesDisplayToggle){
        document.getElementById("rules-display").hidden = false;
        document.getElementById("showRulesButton").innerText = "Hide Rules";
    }
    else{
        document.getElementById("rules-display").hidden = true;
        document.getElementById("showRulesButton").innerText = "Show Rules";
    }
}
function formatDateDifference(d1, d2){
    let months;
    let earlyDate = (d1.getTime()>d2.getTime())?d2:d1;
    let lateDate = (d1.getTime()<d2.getTime())?d2:d1;
    months = (+lateDate.getUTCFullYear() - +earlyDate.getUTCFullYear()) * 12;
    months -= earlyDate.getMonth();
    months += lateDate.getMonth();
    return ("00"+Math.trunc(months/12)).slice(-2)+"Y"+("00"+months%12).slice(-2)+"M";
}