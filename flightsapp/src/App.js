import React, { Component, useState } from "react";
import DatePicker from 'react-date-picker';

import './App.css';
import Dropdown from 'react-dropdown';
import SelectSearch from 'react-select-search';
import { resolve } from "path";
var unirest = require("unirest");
const fs = require('fs');


var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
class App extends Component{
  constructor() {
    super()
    this.state = {
      info: "none"
    }
    this.currency = "USD"  //the default currency is USD
    this.changeDate(new Date()); //the default date is today
  }
  changeDate = (newDate) => { //this method needs to convert the date the DatePicker object provided us into a usable 
    var splitDate = String(newDate).split(" ");
    var month = "";

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
    if(this.fromCountry != null && this.fromAirport != null && this.toCountry != null && this.toAirport != null){
      var info = await getInfo(this.currency, this.fromAirport, this.toAirport, this.date)
      this.fromAirport = null;
      this.toAirport = null;
      this.fromCountry = null;
      this.toCountry = null;
      console.log(info);
      this.setState({
        info: JSON.stringify(info)
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
          <FlightsList state={this.state.info}></FlightsList>
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
    this.props.changeCurrency(newCurrency);
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
  if(props.state == "none"){
    return (
      <div>
        Please fill out the required fields.
      </div>
    )
  }
  var info = JSON.parse(props.state);
  console.log(info);
  if(info.Quotes.length == 0){
      return (
        <div>
          There were no flights found.
        </div>
      )
    }else{
      var quotes = (<div></div>);
      for(var i = 0; i < info.Quotes.length; i++){
        quotes += (
          <div>
            {JSON.stringify(info.Quotes[i].minPrice)}
          </div>
        )
      }
      console.log(quotes);
      return quotes;
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
      map.sort((x,y)=>{ return x.value === defaultCountry ? -1 : y.value === defaultCountry ? 1 : 0; });
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

function getInfo(currency, fromAirport, toAirport, date){
  return new Promise((resolve, reject) => {
    fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/" + currency + "/en-US/" + fromAirport + "/" + toAirport + "/" + date, {
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
