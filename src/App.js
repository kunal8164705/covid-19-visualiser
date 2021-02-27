import React, { useEffect, useState} from 'react';
import './App.css';
import{
  MenuItem,
  FormControl,
  Select,
  CardContent,
  Card,
} from "@material-ui/core";

import InfoBox from "./InfoBox";

import Map from "./Map";

import Table from "./Table";

import {sortData,prettyPrintStat}  from "./util";
import LineGraph from './LineGraph';

import "leaflet/dist/leaflet.css";

import numeral from 'numeral';



function App() {
 const [countries,setCountries]=useState([]);
 const [country,setCountry]=useState('worldwide');
 const [countryInfo,setCountryInfo]=useState({});
 const [tableData,setTableData]=useState([]);
 const [casesType, setCasesType] = useState("cases");
 const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries,setMapCountries]=useState([]);

useEffect(()=>{
  fetch("https://disease.sh/v3/covid-19/all")
  .then(response=>response.json())
  .then(data=>{
    setCountryInfo(data);
  })
},[]);




//USEEFFECT=runs a code based on given condition 
 useEffect(()=>{
  //  the code inside useeffect run only once when the Component
  //  and not again
    //async-> send a request ,wait for it and do something with info

    const getCountriesData=async()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=>response.json())
      .then((data)=>{
        const countries=data.map((country)=>(
          {
            name:country.country,  //country name like United States
            value:country.countryInfo.iso2 //US
            
          }
        ));
          const sortedData=sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      }); 
    };
      getCountriesData();
 },[]);


 const onCountryChange=async(event)=>{
   const countryCode=event.target.value;
   
  //  setCountry(countryCode);

  const url=countryCode==="worldwide"
  ?"https://disease.sh/v3/covid-19/all"
  :`https://disease.sh/v3/covid-19/countries/${countryCode}`;

  
  
  await fetch(url).then((response)=>response.json())
  .then((data)=>{
      setCountry(countryCode);
      setCountryInfo(data);
      countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
  });


 };

console.log('country info',countryInfo);
console.log('map center',mapCenter);



  return (
    <div className="app">

      <div className="app__left">

      
      <div className="app__header">
      <h1>COVID-19 VISUALISER </h1>

<FormControl className="app__dropdown">
  <Select variant="outlined" onChange={onCountryChange} value={country}>
   {/* Loop through all the countries and show a dropdown list of 
   all the options */}
      <MenuItem value="worldwide">Worldwide</MenuItem>
      
      {
        countries.map((country)=>(
          <MenuItem value={country.value}>{country.name}</MenuItem>
        )
        )
      }
   
    {/* <MenuItem value="worldwide">Worldwide</MenuItem>
    <MenuItem value="worldwide">pot2</MenuItem>
    <MenuItem value="worldwide">Worl</MenuItem> */}

  </Select>
</FormControl>
      </div>

     



      
        <div className="app__stats">

          <InfoBox title="Coronavirus cases" 
           onClick={(e) => setCasesType("cases")}
           title="Coronavirus Cases"
           isRed
           active={casesType === "cases"}
          cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")} />

          <InfoBox title="Recovered"  
          onClick={(e) => setCasesType("recovered")}
          title="Recovered"
          isgreen
          active={casesType === "recovered"}

          cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}  />

          <InfoBox title="Deaths"   
           onClick={(e) => setCasesType("deaths")}
           title="Deaths"
          //  isRed
          isgrey
           active={casesType === "deaths"}
          cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")} />

          
        </div>
        

       
        {/* Map */}
        <Map  countries={mapCountries} casesType={casesType} center={mapCenter} zoom={mapZoom}/>

        

    </div>

      <Card className="app__right">

        <CardContent>
        <div className="app__information">
          <h3>Live cases by country</h3>
          
          <Table countries={tableData}/>
        

        
        <h3>Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType} />
        </div>
        </CardContent>
           
      </Card>

    </div>
  );
}

export default App;
