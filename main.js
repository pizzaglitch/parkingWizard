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
let ticketTimes = [];
let violationStartTime = 0;
let violationStartTimeNum = 0;
let violationEndTime = 0;
let violationEndTimeNum = 0;
let violationTimeIntervals = [];
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

  //Original attempt at url. Created by me, not taken by website's suggested JSON data (same for url in above function)
  const url = "https://data.cityofnewyork.us/resource/pvqr-7yc4.json?" + "street_code1=" + streetCode1 + "&street_code2=" + streetCode2 + "&street_code3=" + streetCode3 + violation;

  //This url takes the JSON export from the website and modifies the address with user input. 
  const url2 = "https://data.cityofnewyork.us/resource/pvqr-7yc4.json?$query=SELECT%0A%20%20%60summons_number%60%2C%0A%20%20%60plate_id%60%2C%0A%20%20%60registration_state%60%2C%0A%20%20%60plate_type%60%2C%0A%20%20%60issue_date%60%2C%0A%20%20%60violation_code%60%2C%0A%20%20%60vehicle_body_type%60%2C%0A%20%20%60vehicle_make%60%2C%0A%20%20%60issuing_agency%60%2C%0A%20%20%60street_code1%60%2C%0A%20%20%60street_code2%60%2C%0A%20%20%60street_code3%60%2C%0A%20%20%60vehicle_expiration_date%60%2C%0A%20%20%60violation_location%60%2C%0A%20%20%60violation_precinct%60%2C%0A%20%20%60issuer_precinct%60%2C%0A%20%20%60issuer_code%60%2C%0A%20%20%60issuer_command%60%2C%0A%20%20%60issuer_squad%60%2C%0A%20%20%60violation_time%60%2C%0A%20%20%60time_first_observed%60%2C%0A%20%20%60violation_county%60%2C%0A%20%20%60violation_in_front_of_or_opposite%60%2C%0A%20%20%60house_number%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60intersecting_street%60%2C%0A%20%20%60date_first_observed%60%2C%0A%20%20%60law_section%60%2C%0A%20%20%60sub_division%60%2C%0A%20%20%60violation_legal_code%60%2C%0A%20%20%60days_parking_in_effect%60%2C%0A%20%20%60from_hours_in_effect%60%2C%0A%20%20%60to_hours_in_effect%60%2C%0A%20%20%60vehicle_color%60%2C%0A%20%20%60unregistered_vehicle%60%2C%0A%20%20%60vehicle_year%60%2C%0A%20%20%60meter_number%60%2C%0A%20%20%60feet_from_curb%60%2C%0A%20%20%60violation_post_code%60%2C%0A%20%20%60violation_description%60%2C%0A%20%20%60no_standing_or_stopping_violation%60%2C%0A%20%20%60hydrant_violation%60%2C%0A%20%20%60double_parking_violation%60%0AWHERE%0A%20%20caseless_eq(%60violation_description%60%2C%20%22No%20parking%20street%20cleaning%22)%0A%20%20AND%20((%60street_code1%60%20IN%20(%22" + streetCode1 + "%22))%0A%20%20%20%20%20%20%20%20%20AND%20((%60street_code2%60%20IN%20(%22" + streetCode2 + "%22))%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20AND%20(%60street_code3%60%20IN%20(%22" + streetCode3 + "%22))))";
  
  //searches streetcode 1 & 2, violations for no parking ASP, no time restriction
  const url3 = "https://data.cityofnewyork.us/resource/pvqr-7yc4.json?$query=SELECT%0A%20%20%60summons_number%60%2C%0A%20%20%60plate_id%60%2C%0A%20%20%60registration_state%60%2C%0A%20%20%60plate_type%60%2C%0A%20%20%60issue_date%60%2C%0A%20%20%60violation_code%60%2C%0A%20%20%60vehicle_body_type%60%2C%0A%20%20%60vehicle_make%60%2C%0A%20%20%60issuing_agency%60%2C%0A%20%20%60street_code1%60%2C%0A%20%20%60street_code2%60%2C%0A%20%20%60street_code3%60%2C%0A%20%20%60vehicle_expiration_date%60%2C%0A%20%20%60violation_location%60%2C%0A%20%20%60violation_precinct%60%2C%0A%20%20%60issuer_precinct%60%2C%0A%20%20%60issuer_code%60%2C%0A%20%20%60issuer_command%60%2C%0A%20%20%60issuer_squad%60%2C%0A%20%20%60violation_time%60%2C%0A%20%20%60time_first_observed%60%2C%0A%20%20%60violation_county%60%2C%0A%20%20%60violation_in_front_of_or_opposite%60%2C%0A%20%20%60house_number%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60intersecting_street%60%2C%0A%20%20%60date_first_observed%60%2C%0A%20%20%60law_section%60%2C%0A%20%20%60sub_division%60%2C%0A%20%20%60violation_legal_code%60%2C%0A%20%20%60days_parking_in_effect%60%2C%0A%20%20%60from_hours_in_effect%60%2C%0A%20%20%60to_hours_in_effect%60%2C%0A%20%20%60vehicle_color%60%2C%0A%20%20%60unregistered_vehicle%60%2C%0A%20%20%60vehicle_year%60%2C%0A%20%20%60meter_number%60%2C%0A%20%20%60feet_from_curb%60%2C%0A%20%20%60violation_post_code%60%2C%0A%20%20%60violation_description%60%2C%0A%20%20%60no_standing_or_stopping_violation%60%2C%0A%20%20%60hydrant_violation%60%2C%0A%20%20%60double_parking_violation%60%0AWHERE%0A%20%20caseless_eq(%60violation_description%60%2C%20%22No%20parking%20street%20cleaning%22)%0A%20%20AND%20((%60street_code1%60%20IN%20(%22" + streetCode1 + "%22))%0A%20%20%20%20%20%20%20%20%20AND%20((%60street_code2%60%20IN%20(%22" + streetCode2 + "%22))%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20))";

  //searches streetcode 1 & 2, violations for no parking ASP for previous year
  //Need to get this working to get accurate time span results. Although current method seems to only go back ~2 years
  const url4 = "https://data.cityofnewyork.us/resource/pvqr-7yc4.json?$query=SELECT%0A%20%20%60summons_number%60%2C%0A%20%20%60plate_id%60%2C%0A%20%20%60registration_state%60%2C%0A%20%20%60plate_type%60%2C%0A%20%20%60issue_date%60%2C%0A%20%20%60violation_code%60%2C%0A%20%20%60vehicle_body_type%60%2C%0A%20%20%60vehicle_make%60%2C%0A%20%20%60issuing_agency%60%2C%0A%20%20%60street_code1%60%2C%0A%20%20%60street_code2%60%2C%0A%20%20%60street_code3%60%2C%0A%20%20%60vehicle_expiration_date%60%2C%0A%20%20%60violation_location%60%2C%0A%20%20%60violation_precinct%60%2C%0A%20%20%60issuer_precinct%60%2C%0A%20%20%60issuer_code%60%2C%0A%20%20%60issuer_command%60%2C%0A%20%20%60issuer_squad%60%2C%0A%20%20%60violation_time%60%2C%0A%20%20%60time_first_observed%60%2C%0A%20%20%60violation_county%60%2C%0A%20%20%60violation_in_front_of_or_opposite%60%2C%0A%20%20%60house_number%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60intersecting_street%60%2C%0A%20%20%60date_first_observed%60%2C%0A%20%20%60law_section%60%2C%0A%20%20%60sub_division%60%2C%0A%20%20%60violation_legal_code%60%2C%0A%20%20%60days_parking_in_effect%60%2C%0A%20%20%60from_hours_in_effect%60%2C%0A%20%20%60to_hours_in_effect%60%2C%0A%20%20%60vehicle_color%60%2C%0A%20%20%60unregistered_vehicle%60%2C%0A%20%20%60vehicle_year%60%2C%0A%20%20%60meter_number%60%2C%0A%20%20%60feet_from_curb%60%2C%0A%20%20%60violation_post_code%60%2C%0A%20%20%60violation_description%60%2C%0A%20%20%60no_standing_or_stopping_violation%60%2C%0A%20%20%60hydrant_violation%60%2C%0A%20%20%60double_parking_violation%60%0AWHERE%0A%20%20(%60street_code1%60%20%3D%20" + streetCode1 + ")%0A%20%20AND%20((%60street_code2%60%20%3D%20" + streetCode2 + ")%0A%20%20%20%20%20%20%20%20%20AND%20((%60issue_date%60%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20BETWEEN%20%22" + urlPrevYear + "T12%3A48%3A47%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20AND%20%22" + urlDate + "T12%3A48%3A47%22%20%3A%3A%20floating_timestamp)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20AND%20caseless_contains(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%60violation_description%60%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22No%20Parking%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)))%0AORDER%20BY%20%60house_number%60%20ASC%20NULL%20LAST"

  try {
    const response = await fetch(url3);
    
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
        violationStartTime = element.from_hours_in_effect;
        violationEndTime = element.to_hours_in_effect;
        violationStartTimeNum = Number(violationStartTime.slice(0,4));
        violationEndTimeNum = Number(violationEndTime.slice(0,4));
      } 
     
      if (currentDay == parkingDay) {
        ticketsOnSameDay[numTicketsOnSameDay] = element.violation_time;
        numTicketsOnSameDay += 1;
      }
      //Slices times for graph variables. Places in ticketTimes array [needs to be dumped at end]
      let tempTime = element.violation_time.slice(0,2) + ":" + element.violation_time.slice(2,4);

      //Sorts ticket times by days in object
      dailyTicketTimes[parkingDayOfWeek].push(tempTime);

      //Array of tickets for all days of week
      ticketTimes.push(tempTime);
      
      console.log("address: ", element.house_number, element.street_name, "Ticketed on:", parkingDayOfWeek, "between", element.from_hours_in_effect, element.to_hours_in_effect, "at", element.violation_time);
      totalTicketsInArea += 1;
    });    
    console.log("total ASP tickets for the year: ", totalTicketsInArea, " total tickets on " + currentDayofWeek + ": ", numTicketsOnSameDay);
    console.log(ticketTimes);
    console.log(dailyTicketTimes);

    generateChart();
  } catch (error) {
    console.error(error.message);
  }
}

// Resets all data
function resetMenu() {
  totalTicketsInArea = 0;
  numTicketsOnSameDay = 0;
  ticketsOnSameDay = {};
  ticketTimes = [],
  streetCode1 = '';
  streetCode2 = '';
  streetCode3 = '';
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
      resetMenu();
  } catch (error) {
      console.error(error.message);
  }
}


// Need to populate chart accordingly
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
              label: 'Ticket Distribution',
              data: tickTest,
            }
          ]
        }
      }
    )
};



/************************************************************************************************************************************************/
/* Questions for prof baci (Bahtzee, like yahtzee)
I was able to locate all tickets in a given area. How should i store them? They're in one big json object. 

Next steps:
Refine search:
  - Organize results into a database. How?
  - Sort by day
  - (Eventually) grab today's date, find out what violation side occurs on that day of the week, use that day to sort through the results

Currently searching by street codes. To enhance:
  - Verify that the ticket locations are near each other. 

Do the math:
  - How many days of ticketing are there for that side of the year (in the last year? two years?)
  - What is my time range? 1yr? 2yr?
  - What are the odds I have a ticket, not only on that day, but for that specific time within the range
  - Grab all the ticket times for that side of the road, make a distribution, find the likelihood user has been ticketed given the exact time of their query

issuer_code: the code associated with the parking officer that wrote the ticket 
streetCodeLookup[0].issue_date.slice(0,10) gets exact date. replace index w/ 

I have the total number of tickets in that area and I have the total number of tickets on that day. 
How do I calculate the odds that I've received a ticket?
*/

/*
How many ASP days per year for each day of the week:
Total: 208

Monday: 52 - 11 (no asp) = 41
Tuesday: 52 - 8 (no asp) = 44
Thursday: 52 - 5 (no asp) = 47
Friday: 52 - 5 (no asp) = 47


[Mon+Thurs] = 104
[Tues+Fri] = 104

Issues: 
  Not including snow days 
  Sometimes the vilation description differs from No Parking Street Cleaning
    - Possible fix: search for any term that includes Clean / Cleaning ?

*/

/* Modify getStreetCodes function
If there are no results at a specific address, 
start looping through furthest digit to check nearby addresses. Does not need to include a violation because I'm just grabbing the street codes

*/

/*
Try to replace the address in the link below with the user's input and see if it works. 

Generic search [to get house codes]: 
https://data.cityofnewyork.us/resource/pvqr-7yc4.json?$query=SELECT%0A%20%20%60summons_number%60%2C%0A%20%20%60plate_id%60%2C%0A%20%20%60registration_state%60%2C%0A%20%20%60plate_type%60%2C%0A%20%20%60issue_date%60%2C%0A%20%20%60violation_code%60%2C%0A%20%20%60vehicle_body_type%60%2C%0A%20%20%60vehicle_make%60%2C%0A%20%20%60issuing_agency%60%2C%0A%20%20%60street_code1%60%2C%0A%20%20%60street_code2%60%2C%0A%20%20%60street_code3%60%2C%0A%20%20%60vehicle_expiration_date%60%2C%0A%20%20%60violation_location%60%2C%0A%20%20%60violation_precinct%60%2C%0A%20%20%60issuer_precinct%60%2C%0A%20%20%60issuer_code%60%2C%0A%20%20%60issuer_command%60%2C%0A%20%20%60issuer_squad%60%2C%0A%20%20%60violation_time%60%2C%0A%20%20%60time_first_observed%60%2C%0A%20%20%60violation_county%60%2C%0A%20%20%60violation_in_front_of_or_opposite%60%2C%0A%20%20%60house_number%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60intersecting_street%60%2C%0A%20%20%60date_first_observed%60%2C%0A%20%20%60law_section%60%2C%0A%20%20%60sub_division%60%2C%0A%20%20%60violation_legal_code%60%2C%0A%20%20%60days_parking_in_effect%60%2C%0A%20%20%60from_hours_in_effect%60%2C%0A%20%20%60to_hours_in_effect%60%2C%0A%20%20%60vehicle_color%60%2C%0A%20%20%60unregistered_vehicle%60%2C%0A%20%20%60vehicle_year%60%2C%0A%20%20%60meter_number%60%2C%0A%20%20%60feet_from_curb%60%2C%0A%20%20%60violation_post_code%60%2C%0A%20%20%60violation_description%60%2C%0A%20%20%60no_standing_or_stopping_violation%60%2C%0A%20%20%60hydrant_violation%60%2C%0A%20%20%60double_parking_violation%60%0ASEARCH%20%221159%20bedford%20ave%22
Specific search [only showing ASP parking violations]:
https://data.cityofnewyork.us/resource/pvqr-7yc4.json?$query=SELECT%0A%20%20%60summons_number%60%2C%0A%20%20%60plate_id%60%2C%0A%20%20%60registration_state%60%2C%0A%20%20%60plate_type%60%2C%0A%20%20%60issue_date%60%2C%0A%20%20%60violation_code%60%2C%0A%20%20%60vehicle_body_type%60%2C%0A%20%20%60vehicle_make%60%2C%0A%20%20%60issuing_agency%60%2C%0A%20%20%60street_code1%60%2C%0A%20%20%60street_code2%60%2C%0A%20%20%60street_code3%60%2C%0A%20%20%60vehicle_expiration_date%60%2C%0A%20%20%60violation_location%60%2C%0A%20%20%60violation_precinct%60%2C%0A%20%20%60issuer_precinct%60%2C%0A%20%20%60issuer_code%60%2C%0A%20%20%60issuer_command%60%2C%0A%20%20%60issuer_squad%60%2C%0A%20%20%60violation_time%60%2C%0A%20%20%60time_first_observed%60%2C%0A%20%20%60violation_county%60%2C%0A%20%20%60violation_in_front_of_or_opposite%60%2C%0A%20%20%60house_number%60%2C%0A%20%20%60street_name%60%2C%0A%20%20%60intersecting_street%60%2C%0A%20%20%60date_first_observed%60%2C%0A%20%20%60law_section%60%2C%0A%20%20%60sub_division%60%2C%0A%20%20%60violation_legal_code%60%2C%0A%20%20%60days_parking_in_effect%60%2C%0A%20%20%60from_hours_in_effect%60%2C%0A%20%20%60to_hours_in_effect%60%2C%0A%20%20%60vehicle_color%60%2C%0A%20%20%60unregistered_vehicle%60%2C%0A%20%20%60vehicle_year%60%2C%0A%20%20%60meter_number%60%2C%0A%20%20%60feet_from_curb%60%2C%0A%20%20%60violation_post_code%60%2C%0A%20%20%60violation_description%60%2C%0A%20%20%60no_standing_or_stopping_violation%60%2C%0A%20%20%60hydrant_violation%60%2C%0A%20%20%60double_parking_violation%60%0AWHERE%0A%20%20caseless_one_of(%60violation_description%60%2C%20%22No%20Parking%20Street%20Cleaning%22)%0ASEARCH%20%22bedford%20ave%22

*/

/*
Color code the leaflet street based on % chance of ticket


Leaflet tooltip that provides statistics for the area when you hover over it


Make distance radius 3 blocks
  Try larger street code, see if that street code radius aligns with the ~3-block leaflet radius
  Filter for appropriate side parking times (days), make sure to only look for the times that the user wants
    Times must match where pin is dropped 

Assume that user wants to park right now, and the current time is within the ticket window, so use the current JS Date / time for the window
*/

/*
change "Welcome" on wordpress to NY / LA, if google want to grab it anyway, it can, it'll just grab that info instead of the incorrect Welcome info.
*/

/* Gmaps, dont wanna use, not free
async function grabMapAddress(e) {
  let latlng = e.latlng;
  console.log(latlng.lat);
  let grabbedAddressURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latlng.lat + "," + latlng.lng + "&key=AIzaSyBLCYynDF1cJ4lShsYX9nGmQVPap-8Bqp0";
  try {
      const grabbedResponse = await fetch(grabbedAddressURL);
      if (!grabbedResponse.ok) {
      throw new Error(`Response status: ${grabbedResponse.status}`);
      }
      const grabbedAddressJSON = await grabbedResponse.json();
      console.log(grabbedAddressJSON);

  } catch (error) {
      console.error(error.message);
  }
}
*/