//Using browserify to bundle and allows soda to happen
const Chart = require('chart.js/auto');
const soda = require('soda-js');

const consumer = new soda.Consumer('data.cityofnewyork.us');
const formElement = document.getElementById('form');
const mapElement = document.getElementById('map');
const violation = "&violation_description=No Parking Street Cleaning"
let streetCode1 = '';
let streetCode2 = '';
let streetCode3 = '';

const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const currentDate = new Date();
const currentDay = currentDate.getDay();
const currentDayofWeek = daysOfTheWeek[currentDay];

let totalTicketsInArea = 0;
let numTicketsOnSameDay = 0;
let ticketsOnSameDay = [];

//Graph variables
let ticketTimes = []
let violationStartTime = 0;
let violationStartTimeNum = 0;
let violationEndTime = 0;
let violationEndTimeNum = 0;

dailyTicketTimes = {
  'Sunday': [],
  'Monday': [],
  'Tuesday': [],
  'Wednesday': [],
  'Thursday': [],
  'Friday': [],
  'Saturday': [],
};


formElement.addEventListener('submit', event => {
    event.preventDefault();
    const houseNumber = document.getElementById('houseNumber').value;
    const street = document.getElementById('street').value.toUpperCase();
    getStreetCodes(houseNumber, street);
    resetMenu();
});

//Grabs street code for address inputted
async function getStreetCodes(houseNumber, street) {
  const url = "https://data.cityofnewyork.us/resource/pvqr-7yc4.json?" + "house_number=" + houseNumber + "&street_name=" + street;

  
  //This url takes the JSON export from the website and modifies the address with user input. 
  const url2 = "https://data.cityofnewyork.us/resource/pvqr-7yc4.json?$query=SELECT%0A%20%20%60summons_number%60%2C%0A%20%20%60plate_id%60%2C%0A%20%20%60registration_state%60%2C%0A%20%20%60plate_type%60%2C%0A%20%20%60issue_date%60%2C%0A%20%20%60violation_code%60%2C%0A%20%20%60vehicle_body_type%60%2C%0A%20%20%60vehicle_make%60%2C%0A%20%20%60issuing_agency%60%2C%0A%20%20%60street_code1%60%2C%0A%20%20%60street_code2%60%2C%0A%20%20%60street_code3%60%2C%0A%20%20%60vehicle_expiration_date%60%2C%0A%20%20%60violation_location%60%2C%0A%20%20%60violation_precinct%60%2C%0A%20%20%60issuer_precinct%60%2C%0A%20%20%60issuer_code%60%2C%0A%20%20%60issuer_command%60%2C%0A%20%20%60issuer_squad%60%2C%0A%20%20%60violation_time%60%2C%0A%20%20%60time_first_observed%60%2C%0A%20%20%60violation_county%60%2C%0A%20%20%60violation_in_front_of_or_opposite%60%2C%0A%20%20%60house_number%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60intersecting_street%60%2C%0A%20%20%60date_first_observed%60%2C%0A%20%20%60law_section%60%2C%0A%20%20%60sub_division%60%2C%0A%20%20%60violation_legal_code%60%2C%0A%20%20%60days_parking_in_effect%60%2C%0A%20%20%60from_hours_in_effect%60%2C%0A%20%20%60to_hours_in_effect%60%2C%0A%20%20%60vehicle_color%60%2C%0A%20%20%60unregistered_vehicle%60%2C%0A%20%20%60vehicle_year%60%2C%0A%20%20%60meter_number%60%2C%0A%20%20%60feet_from_curb%60%2C%0A%20%20%60violation_post_code%60%2C%0A%20%20%60violation_description%60%2C%0A%20%20%60no_standing_or_stopping_violation%60%2C%0A%20%20%60hydrant_violation%60%2C%0A%20%20%60double_parking_violation%60%0ASEARCH%20%22" + houseNumber +  "%20" + street + "%22";
  try {
    const response = await fetch(url2);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const streetCodeLookup = await response.json();
    streetCode1 = streetCodeLookup[0].street_code1;
    streetCode2 = streetCodeLookup[0].street_code2;
    streetCode3 = streetCodeLookup[0].street_code3;
  } catch (error) {
    console.error(error.message);
  }
  getData(streetCode1, streetCode2, streetCode3);
}

//uses street code to find all tickets in that area that happened on the same day of the week
async function getData(streetCode1, streetCode2, streetCode3) {
  let urlDate = new Date();
  let urlPrevYear = urlDate.setFullYear(urlDate.getFullYear()-1);
  let sortedTimes = new Array(19).fill(null);
  let cumulativeTimes = new Array(19).fill(null);

  let violationTimeIntervals = [];

  violationStartTime = 0;
  violationEndTime = 0;
  //searches streetcode 1 & 2, violations for no parking ASP, no time restriction
  const url = "https://data.cityofnewyork.us/resource/pvqr-7yc4.json?$query=SELECT%0A%20%20%60summons_number%60%2C%0A%20%20%60plate_id%60%2C%0A%20%20%60registration_state%60%2C%0A%20%20%60plate_type%60%2C%0A%20%20%60issue_date%60%2C%0A%20%20%60violation_code%60%2C%0A%20%20%60vehicle_body_type%60%2C%0A%20%20%60vehicle_make%60%2C%0A%20%20%60issuing_agency%60%2C%0A%20%20%60street_code1%60%2C%0A%20%20%60street_code2%60%2C%0A%20%20%60street_code3%60%2C%0A%20%20%60vehicle_expiration_date%60%2C%0A%20%20%60violation_location%60%2C%0A%20%20%60violation_precinct%60%2C%0A%20%20%60issuer_precinct%60%2C%0A%20%20%60issuer_code%60%2C%0A%20%20%60issuer_command%60%2C%0A%20%20%60issuer_squad%60%2C%0A%20%20%60violation_time%60%2C%0A%20%20%60time_first_observed%60%2C%0A%20%20%60violation_county%60%2C%0A%20%20%60violation_in_front_of_or_opposite%60%2C%0A%20%20%60house_number%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60intersecting_street%60%2C%0A%20%20%60date_first_observed%60%2C%0A%20%20%60law_section%60%2C%0A%20%20%60sub_division%60%2C%0A%20%20%60violation_legal_code%60%2C%0A%20%20%60days_parking_in_effect%60%2C%0A%20%20%60from_hours_in_effect%60%2C%0A%20%20%60to_hours_in_effect%60%2C%0A%20%20%60vehicle_color%60%2C%0A%20%20%60unregistered_vehicle%60%2C%0A%20%20%60vehicle_year%60%2C%0A%20%20%60meter_number%60%2C%0A%20%20%60feet_from_curb%60%2C%0A%20%20%60violation_post_code%60%2C%0A%20%20%60violation_description%60%2C%0A%20%20%60no_standing_or_stopping_violation%60%2C%0A%20%20%60hydrant_violation%60%2C%0A%20%20%60double_parking_violation%60%0AWHERE%0A%20%20caseless_eq(%60violation_description%60%2C%20%22No%20parking%20street%20cleaning%22)%0A%20%20AND%20((%60street_code1%60%20IN%20(%22" + streetCode1 + "%22))%0A%20%20%20%20%20%20%20%20%20AND%20((%60street_code2%60%20IN%20(%22" + streetCode2 + "%22))%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20))";
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const nearbyTickets = await response.json();  
    console.log(nearbyTickets);
  
    //counts number of tickets in area on the same day, stores each ticket's violation time in ticketsOnSameDay object
    nearbyTickets.forEach(element => {
      let parkingDate = new Date(element.issue_date);
      let parkingDay = parkingDate.getDay();
      let parkingDayOfWeek = daysOfTheWeek[parkingDay];
      if (violationStartTime == 0 && violationEndTime == 0) {
        violationStartTime = element.from_hours_in_effect; //use parseTimeFunction here
        violationEndTime = element.to_hours_in_effect;
        violationStartTimeNum = Number(violationStartTime.slice(0,4)); 
        violationEndTimeNum = Number(violationEndTime.slice(0,4));
        console.log(violationStartTimeNum, violationEndTimeNum);
      } 
  
      if (currentDay == parkingDay) {
        ticketsOnSameDay[numTicketsOnSameDay] = element.violation_time;
        numTicketsOnSameDay += 1;
      }
      //Slices times for graph variables. Places in ticketTimes array [needs to be dumped at end]
      let tempTime = element.violation_time.slice(0,2) + ":" + element.violation_time.slice(2,4); //get rid of this and use new parseTime function

      //Sorts ticket times by days in object
      dailyTicketTimes[parkingDayOfWeek].push(tempTime);

      //Array of tickets for all days of week
      ticketTimes.push(element.violation_time);
      let startTime = parseTime(violationStartTime).getTime();
      violationTimeIntervals.push((parseTime(element.violation_time) - startTime) / 60000);

      console.log("address: ", element.house_number, element.street_name, "Ticketed on:", parkingDayOfWeek, "between", violationStartTimeNum, violationEndTimeNum, "at", element.violation_time);
      totalTicketsInArea += 1;
    });    
    console.log("total ASP tickets for the year: ", totalTicketsInArea, " total tickets on " + currentDayofWeek + ": ", numTicketsOnSameDay);
    console.log(ticketTimes);

    generateChart();
    sortTimes(violationTimeIntervals, sortedTimes, cumulativeTimes);
    console.log("cumulative times:", cumulativeTimes);
    console.log("sorted time: ", sortedTimes);

    generateTimeChart(sortedTimes);
    showChartToggle(sortedTimes, cumulativeTimes);
    resetMenu(sortedTimes);
  } catch (error) {
    console.error(error.message);
  }
}

//Map generation
const map = L.map('map').setView([40.694857277000914, -73.94557962772903], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
map.on('click', grabMapAddress)

//Grab map address on click
async function grabMapAddress(e) {
  let latlng = e.latlng;
  let grabbedAddressURL = "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + latlng.lat + "&lon=" + latlng.lng;
  try {
      const grabbedResponse = await fetch(grabbedAddressURL);
      if (!grabbedResponse.ok) {
        throw new Error(`Response status: ${grabbedResponse.status}`);
      }
      const grabbedAddressJSON = await grabbedResponse.json();
      console.log(grabbedAddressJSON);
      let grabbedHouseNumber = grabbedAddressJSON.address.house_number;
      let grabbedStreetName = grabbedAddressJSON.address.road;
      getStreetCodes(grabbedHouseNumber, grabbedStreetName);
      displayAddress(grabbedHouseNumber, grabbedStreetName)
  } catch (error) {
      console.error(error.message);
  }
}

// This chart displays the distribution of tickets based on weekdays
function generateChart() {
  const days = Object.keys(dailyTicketTimes).map(x => x);
  const tickTest = Object.values(dailyTicketTimes).map(x => x.length);
  let chartStatus = Chart.getChart("myChart");
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }
  new Chart(
      document.getElementById('myChart'),
      {
        type: 'bar',
        data: {
          labels: days,
          datasets: [
            {
              label: 'Ticket Distribution by Day',
              data: tickTest,
            }
          ]
        }
      }
    )
};

//Hourly Chart, top prio
function generateTimeChart(sortedTimes) {
  let timeChart = Chart.getChart('timeChart');
  const ticketsByInterval = Object.values(sortedTimes).map(x => x.length);
  if (timeChart != undefined) {
    timeChart.destroy();
  }
  new Chart(
    document.getElementById('timeChart'),
    {
      type: 'line',
      data: {
        labels: fillTimeAxis(),
        datasets: [{
            label: 'Ticket Distribution within ASP Time Window (Interval)',
            data: ticketsByInterval,
          }]
      }
    }
  )
};

//Parsetime function. Changes violationTime and violationStartTime to Date objects so that I can find the time difference between the two
function parseTime(t) {
  let hour = Number(t.slice(0,2));
  let min = Number(t.slice(2,4));
  let ampm = t.slice(t.length-1);
  if (ampm == 'P' && hour != 12) {
    hour = hour + 12; 
  }
  return new Date(`2000-01-01 ${hour}:${min}`);
}

function sortTimes(violationTimeIntervals, sortedTimes, cumulativeTimes) {   
  //Interval Times
    for (let i = 0; i < violationTimeIntervals.length; i++) {
      let tempTime = violationTimeIntervals[i];
      let tempIndexFloor = Math.floor(tempTime / 5);
      let tempIndexReg = tempTime / 5;
      
      if (tempTime % 5 == 0 && sortedTimes[tempIndexReg] == null) {
        sortedTimes[tempIndexReg] = [tempTime];
      }

      if (sortedTimes[tempIndexFloor] == null) {
        sortedTimes[tempIndexFloor] = [tempTime];
      }
    
      else if (tempTime % 5 == 0) {
        sortedTimes[tempIndexReg].splice(0, 0, tempTime);
      }
      else {
        sortedTimes[tempIndexFloor].splice(0, 0, tempTime);
      }
    }
    // Convert null indices to empty arrays, fill in cumulative array 
    let cumulativeCounter = 0;
    for (let i = 0; i < sortedTimes.length; i++) {
      if (sortedTimes[i] == null) {
        sortedTimes[i] = [];
        cumulativeTimes[i] += 0;
      }
      if (sortedTimes[i].length == 0) {
        cumulativeTimes[i] = cumulativeCounter;
      }
      else {
        cumulativeCounter += sortedTimes[i].length
        cumulativeTimes[i] += cumulativeCounter;
      }
    }
}

//Fill time array for x axis of generateTimeChart
function fillTimeAxis(){
  let hour = violationStartTime.slice(0,2);
  let min = violationStartTime.slice(2,4);
  let options = { timeStyle: 'short', hour12: true};
  let date = new Date(2000, 1, 1, hour, min);
  let interval = 5;
  let testTimes = [];

  for(let i=0;i<19;i++){
    let date2 = date.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
    testTimes.push(date2);
    date.setMinutes(date.getMinutes() + interval);
  }
  return testTimes;
}

// Resets all data
function resetMenu(sortedTimes) {
  totalTicketsInArea = 0;
  numTicketsOnSameDay = 0;
  violationStartTime = 0;
  violationEndTime = 0;
  ticketsOnSameDay = {};
  ticketTimes = [];
  violationTimeIntervals = [];
  streetCode1 = '';
  streetCode2 = '';
  streetCode3 = '';
}

//Display clicked address 
function displayAddress(grabbedHouseNumber, grabbedStreetName) {
  const addressDiv = document.getElementById('address');
  addressDiv.innerHTML = grabbedHouseNumber + ' ' + grabbedStreetName;
}


//Display tabs for hourly chart and update the chart onclick
function showChartToggle(sortedTimes, cumulativeTimes) {
  let chart = Chart.getChart('timeChart');
  document.getElementById('chartToggle').style.display = "flex";
  document.getElementById('cumulative').onclick = function() {
    chart.data.datasets[0].data = cumulativeTimes
    chart.data.datasets[0].label = 'Ticket Distribution within ASP Time Window (Cumulative)';
    chart.update();  
  };
  document.getElementById('interval').onclick = function() {
    const ticketsByInterval = Object.values(sortedTimes).map(x => x.length);
    chart.data.datasets[0].data = ticketsByInterval;
    chart.data.datasets[0].label = 'Ticket Distribution within ASP Time Window (Interval)';

    chart.update();
  }; 
}




/*
Add tooltip to leaflet
Display Total tickets
Tickets by sets of days
*/
