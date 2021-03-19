import React, { Component, useState } from "react";
import DatePicker from 'react-date-picker';
import './App.css';
import SelectSearch from 'react-select-search';

var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
class App extends Component{
  constructor() {
    super()
    this.state = {
      info: "none",
      num: 0
    }
    this.currency = "USD";  //the default currency is USD
    this.changeDate(new Date()); //the default date is today
  }
  changeDate = (newDate) => { //this method needs to convert the date the DatePicker object provided us into a usable 
    
    var splitDate = String(newDate).split(" ");
    console.log(splitDate);
    var month = "";
    if(splitDate[0] != undefined && splitDate[0] != "null"){ //the date can be null, don't convert it if it's null or undefined
      for(var i = 0; i < months.length; i++){
        if(splitDate[1].toLowerCase() === months[i]){
          month = i + 1; 
          if(i < 9){
            month = "0" + month;
          }
        }
      }
      var buildDate = splitDate[3] + "-" + month + "-" + splitDate[2];
      this.date = buildDate;
      this.results();
    }else{
      console.log("Date is null");
      this.date = null;
    }  
  }
  changeCurrency = (newCurrency) =>{
    this.currency = newCurrency
    this.results();
  }
  changeFromCountry = (newCountry) => {
    this.fromCountry = newCountry;
    this.results();
  }
  changeFromAirport = (newAirport) => {
    this.fromAirport = newAirport;
    this.results();
  }
  changeToCountry = (newCountry) => {
    this.toCountry = newCountry;
    this.results();
  }
  changeToAirport = (newAirport) => {
    this.toAirport = newAirport;
    this.results();
  }
  async results(){
    if(this.fromCountry != null && this.fromAirport != null && this.toCountry != null && this.toAirport != null && this.date != null){ //only run when all fields are filled out
      var info = await getInfo(this.currency, this.fromAirport, this.toAirport, this.date)  //async await the response from api
      this.fromAirport = null; //reset airports
      this.toAirport = null;
      this.currency  = "USD";
      console.log(info);
      this.setState({
        info: JSON.stringify(info), //force refresh of thi component by changing state
        num: this.state.num + 1 //force refresh of child component
      })
    }
  }
  render(){
    return(
      <div>
        <Header changeCurrency={this.changeCurrency}></Header>
        <div id="main">
        <div class="locationWrapper">
          <From title="From" country={this.fromCountry} airport={this.fromAirport} changeCountry={this.changeFromCountry} changeAirport={this.changeFromAirport}></From>
          <From title="To" country={this.toCountry} airport={this.toAirport} changeCountry={this.changeToCountry} changeAirport={this.changeToAirport}></From>
          <ChooseDate title="On" changeDate={this.changeDate}></ChooseDate>
          <FlightsList num={this.state.num} state={this.state.info}></FlightsList>
        </div>
      </div>
      </div>
    );
  }
}


class Header extends Component{
  constructor(props){
    super()
    this.state = {
      selectedOption: null,
    };
  }
  changeCurrency = newCurrency => {
    this.props.changeCurrency(newCurrency); //call the passed in function from the parent
  };
  render() {
    const { selectedOption } = this.state;

    return(
      <div id="header">
        <div class="title">Get There</div>
        <div id="prices">
          <SelectSearch
            value={selectedOption}
            options={[]}
            onChange={this.changeCurrency}
            getOptions={(query) => {
              return new Promise((resolve, reject) => {
                resolve(getCurrencies());
              });
            }}
            search

        />
        </div>
      </div>
    );
  }
}


class From extends Component{
  constructor(props){
    super();
    this.state = {
      country: props.country,
    }
    this.airport = props.airport;
  }
  updateCountry = country => {
    this.props.changeCountry(country);
    this.setState({
      country: country
    })
  };
  updateAirport = airport => {
    this.props.changeAirport(airport);
    this.airport = airport;
  };
  render() {
    var country = this.state.country;
    return(
      <div class="from">
        <p class="header">{this.props.title}</p>
          <SelectSearch
            value={country}
            options={[]}
            onChange={this.updateCountry}
            getOptions={(query) => {
              return new Promise((resolve, reject) => {
                resolve(getCountries());
              });
            }}
            placeholder="Select a Country"

          />
        <SelectSearch
          value={this.state.fromAirport}
          options={[]}
          onChange={this.updateAirport}
          getOptions={(query) => {
            return new Promise((resolve, reject) => {
              resolve(getAirports(this.state.country));
            });
          }}
          placeholder="Select an Airport"
        />
      </div>
    );
  }
}
function ChooseDate(props){
  const [value, onChange] = useState(new Date());
  props.changeDate(value);
  return (
    <div class="from">
        <p class="header">{props.title}</p>
        <DatePicker
        onChange={onChange}
        value={value}
      />
    </div>
  );
}
function FlightsList(props){
  console.log(props.state);
  if(props.state == "none"){ //if the fields aren't filled out, display to the user to fill out the fields 
    return (
      <div key={props.num}> 
        Please fill out the required fields.
      </div>
    )
  }
  var info = JSON.parse(props.state);
  console.log(info);
  if(info.Quotes == undefined || info.Quotes.length == 0){ // if there are no quotes, then display there are no flights
      return (
        <div key={props.num}>
          There were no flights found on the given day.
        </div>
      )
    }else{
      var flightsList = info.Quotes.map(function(quote){ //the api already returns the flights sorted cheapest to expensive, no need to do this seperatly
        var carrier;
        for(var i = 0; i < info.Carriers.length; i++){
          if(info.Carriers[i].CarrierId == JSON.stringify(quote.OutboundLeg.CarrierIds[0])){
            carrier = JSON.stringify(info.Carriers[i].Name);
          }
        }
        return (
        <div class="quote">
          <div class="number">
            {JSON.stringify(quote.QuoteId)}
          </div>
          <div class="price"> 
            Price: {(JSON.stringify(info.Currencies[0].Symbol)).split('"').join('')}{JSON.stringify(quote.MinPrice)}{(JSON.stringify(info.Currencies[0].DecimalSeparator)).split('"').join('')}00
          </div>
          <div class="carrier">
            Carrier: {carrier.split('"').join('')}
          </div>
        </div>
        );
        
      }) //the .split.join is used to remove the quotes that are in the response

    return  (
    <div class="flightswrapper" key={props.num}>
      <div class="flightsinfo">
        Found a total of {info.Quotes.length} flight(s)...
      </div> 
      { flightsList }
    </div>);
  }
}


function getCountries(){
  return new Promise((resolve, reject) => {
    fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/reference/v1.0/countries/en-US", {
      "headers": {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "be51b3ee29msh2de7863ad80bbd4p1db551jsn5644a02a9de1",
        "useQueryString": true
      },
      "method": "GET",
    })
    .then(function(response) {
      return response.json();
    }).then(function(data) {
      var map = data.Countries.map(({ Code, Name }) => ({ value: Name, name: Name }));
      var defaultCountry = "United States" //could change default country based on location IP is coming from
      map.sort((x,y)=>{ return x.value === defaultCountry ? -1 : y.value === defaultCountry ? 1 : 0; }); //move the default country to the front
      resolve(map);
    });
    });
}

function getAirports(country){
  return new Promise((resolve, reject) => {
    fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/US/USD/en-US/?query=" + country, {
      "headers": {
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
        "x-rapidapi-key": "be51b3ee29msh2de7863ad80bbd4p1db551jsn5644a02a9de1"
      },
      "method": "GET",
    })
    .then(function(response) {
      return response.json();
    }).then(function(data) {
      var map = data.Places.map(({ PlaceId, PlaceName }) => ({ value: PlaceId, name: PlaceName }));
      map.shift(); //for some reason every fetch to get airports returns the name of the country being searched at index 0, so remove that
      resolve(map);
    });
    });
}

function getCurrencies(){
  return new Promise((resolve, reject) => {
    fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/reference/v1.0/currencies", {
  "headers": {
    "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
    "x-rapidapi-key": "be51b3ee29msh2de7863ad80bbd4p1db551jsn5644a02a9de1"
  },
  "method": "GET",
})
.then(function(response) {
    return response.json();
  }).then(function(data) {
    var map = data.Currencies.map(({ Code, Symbol }) => ({ value: Code, name: Code }));
    var defaultCurrency = "USD" //could change default currency based on location IP is coming from
    map.sort((x,y)=>{ return x.value === defaultCurrency ? -1 : y.value === defaultCurrency ? 1 : 0; });

    resolve(map);
  });
  });
}

function getInfo(currency, fromAirport, toAirport, date){ //fetch information about the flights based on the currency/airports/date
  return new Promise((resolve, reject) => {
    fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsedates/v1.0/US/" + currency + "/en-US/" + fromAirport + "/" + toAirport + "/" + date, {
        "headers": {
          "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
          "x-rapidapi-key": "be51b3ee29msh2de7863ad80bbd4p1db551jsn5644a02a9de1",
          "useQueryString": true
        },
        "method": "GET",
      })
      .then(function(response) {
        return response.json();
      }).then(function(data) {
        resolve(data);
      });
  });
}

export default App;
