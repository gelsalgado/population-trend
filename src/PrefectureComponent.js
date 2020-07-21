import React, {Component} from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Label} from 'recharts';

export default class PrefectureComponent extends Component {

	constructor(props) {
		super(props);

		this.state = {
			prefectures: [],
			prefectureData: [],
			prefectureInfo: []
		}

		this.getPrefectureList = this.getPrefectureList.bind(this);
		this.getPopulationData = this.getPopulationData.bind(this);		
		this.toggleCheckbox = this.toggleCheckbox.bind(this);
		this.addToChartData = this.addToChartData.bind(this);
		this.removeFromChartData = this.removeFromChartData.bind(this);
		this.renderCheckBoxes = this.renderCheckBoxes.bind(this);
		this.renderLineChart = this.renderLineChart.bind(this);
		this.renderLines = this.renderLines.bind(this);
	}

	getPrefectureList() {
		var xmlHtppReq = new XMLHttpRequest();
		var ResasApiKey = "0wqYzctaLeFBow5kq5W5z0hTzoq6wLd9HT6gc7Lm";
		var ResasEndpoint = "https://opendata.resas-portal.go.jp";

		xmlHtppReq.open("GET", ResasEndpoint + "/api/v1/prefectures");
		xmlHtppReq.setRequestHeader("X-API-KEY", ResasApiKey);
		
		xmlHtppReq.onload = function(e) {
			if (xmlHtppReq.readyState === 4) {
			    if (xmlHtppReq.status === 200) {
			      var response = JSON.parse(xmlHtppReq.responseText);

			      // Add prefecture list
			      this.setState({
					prefectures: response.result
        		  });

			      // console.log(this.state);
			    } else {
			      console.error(xmlHtppReq.statusText);
			    }
			}
		}.bind(this)

		xmlHtppReq.send();
	}

	getPopulationData(prefecture) {
		var xmlHtppReq = new XMLHttpRequest();
		var ResasApiKey = "0wqYzctaLeFBow5kq5W5z0hTzoq6wLd9HT6gc7Lm";
		var ResasEndpoint = "https://opendata.resas-portal.go.jp";
		var PopDataURL = "/api/v1/population/composition/perYear?cityCode=-&prefCode=[PREF_CODE]";
		var modifiedURL = PopDataURL.replace("[PREF_CODE]", prefecture.prefCode);

		xmlHtppReq.open("GET", ResasEndpoint + modifiedURL);
		xmlHtppReq.setRequestHeader("X-API-KEY", ResasApiKey);
		
		xmlHtppReq.onload = function(e) {
			if (xmlHtppReq.readyState === 4) {
			    if (xmlHtppReq.status === 200) {
			      var response = JSON.parse(xmlHtppReq.responseText);

			      // Add data acquired into prefectureData and format it into rechart data format
			      this.addToChartData(prefecture.prefName, response.result.data[0].data);
			    } else {
			      console.error(xmlHtppReq.statusText);
			    }
			}
		}.bind(this)

		xmlHtppReq.send();
	}

	componentDidMount() {
		this.getPrefectureList();
	}

	toggleCheckbox(index) {
    	const {prefectures} = this.state;

    	prefectures[index].checked = !prefectures[index].checked;

    	if (prefectures[index].checked) {
    		// When a checkbox is ticked, get population data for that prefecture
    		this.getPopulationData(prefectures[index]);
    	}
    	else {
    		// When a checkbox is unticked, remove the prefecture data from list
    		this.removeFromChartData(prefectures[index].prefName);
    	}

    	this.setState({
        	prefectures
    	});
	}

	addToChartData(prefName, data) {
		var newFormattedData = [...this.state.prefectureData];
		var newPrefInfo = [...this.state.prefectureInfo];
		
		// Generate a random color
		var base = Math.round(0xffffff * Math.random()).toString(16);
		var padNeeded = (6-base.length);
		var padding = "000000";
		var pad = padding.substring(0,padNeeded);
		var randomColor = "#" + pad + base;
		// console.log("Random Color: " + randomColor);


		if (Object.keys(newFormattedData).length === 0) {
			// Initialize objects to be used
			newFormattedData = new Array();
			newPrefInfo = new Array();

			for(var idx = 0; idx < data.length; idx++) {
				newFormattedData.push({"year":data[idx].year, [prefName]:data[idx].value});
			}
		}
		else {
			// Add prefecture data by using prefecture name as the key and assign value
			for(var idx = 0; idx < data.length; idx++) {
				newFormattedData[idx][prefName] = data[idx].value;
			}
		}

		// Add prefecture name to the list and assign a color
		newPrefInfo.push({"name": prefName, "color": randomColor});

		this.setState({
			prefectureData: newFormattedData,
			prefectureInfo: newPrefInfo
		});

		// console.log("addToChartData");
		// console.log(this.state.prefectureData);
		// console.log(this.state.prefectureInfo);
	}

	removeFromChartData(prefName) {
		var oldPrefectureData = [...this.state.prefectureData];

		// Remove prefecture data for line chart
		var newPrefectureData = oldPrefectureData.map(function(year){
			delete year[prefName];
			return year;
		});
		// this.setState({prefectureData: newPrefectureData});

		// Remove prefecture name and color from the list
    	const newPrefectureInfo = this.state.prefectureInfo.slice(0).filter(data => data.name !== prefName);
    	
    	this.setState({
    		prefectureData: newPrefectureData, 
    		prefectureInfo: newPrefectureInfo 
    	});

		// console.log("removeFromChartData");
		// console.log(this.state.prefectureData);
		// console.log(this.state.prefectureInfo);
	}

	renderCheckBoxes() {
		const {prefectures} = this.state;

	    return prefectures
	        .map((checkbox, index) =>
	            <div key={checkbox.prefCode.toString()}>
	                <label>
	                    <input
	                        type="checkbox"
	                        checked={checkbox.checked}
	                        onChange={this.toggleCheckbox.bind(this, index)}
	                    />
	                    {checkbox.prefName}
	                </label>
	            </div>
	        );
	}

	renderLineChart() {
		const {prefectureData} = this.state;

		return (
		  <ResponsiveContainer width='100%' height={400}>
			  <LineChart data={prefectureData} width={600} height={400} margin={{top: 40, right: 30, left: 30, bottom: 5,}}>
			    {this.renderLines()}
			    <CartesianGrid stroke="#ccc" />
			    <XAxis 
			    	dataKey="year"
			    	ticks={[1970,1980,1990,2000,2010,2020,2030,2040]}>
			    	domain={[0,2040]}
			    	type="number"
			    	<Label value="年" position="right" offset={30} />
			    </XAxis>
			    <YAxis
			    	ticks={[5000000, 10000000, 15000000, 20000000]}
			    	domain={[0, 20000000]}
			    	type="number">
			    	 <Label value="人口数" position="insideTopLeft" offset={-30} />
			    </YAxis>
			    <Tooltip />
			    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{right: 0}} />
			  </LineChart>
		  </ ResponsiveContainer>
		);
	}

	renderLines() {
		const {prefectureInfo} = this.state;

	    return prefectureInfo
	        .map((prefecture, index) =>
	        	<Line key={"line" + index} type="monotone" dataKey={prefecture.name} stroke={prefecture.color} strokeWidth={2} />
	    );
	}

	render() {
	    return (
	    	<div>
	    		<div className="section_checkbox">
	    			{this.renderCheckBoxes()}
	    		</div>
	    		<div className="section_chart">
	    			{this.renderLineChart()}
	    		</div>
	    	</div>
    	);
	}
}