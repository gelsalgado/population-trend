import React, {Component} from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Label} from 'recharts';

export default class PrefectureComponent extends Component {

	constructor(props) {
		super(props);

		this.state = {
			prefectures: [],
			prefectureData: [],
			formattedData: [],
			yearMap: [],
			filter: 'ALL'
		}

		this.getPrefectureList = this.getPrefectureList.bind(this);
		this.getPopulationData = this.getPopulationData.bind(this);
		this.renderCheckBoxes = this.renderCheckBoxes.bind(this);
		this.toggleCheckbox = this.toggleCheckbox.bind(this);
		this.renderLineChart = this.renderLineChart.bind(this);
		this.removePrefectureData = this.removePrefectureData.bind(this);
		this.addToChartData = this.addToChartData.bind(this);
		this.removeFromChartData = this.removeFromChartData.bind(this);
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
			      const prefData = {'prefName': prefecture.prefName, 'data': response.result.data[0].data}
			      //console.log(response.result.data[0].data);

			      this.addToChartData(prefecture.prefName, response.result.data[0].data);

			      this.setState({
					prefectureData: [...this.state.prefectureData, prefData]
        		  });

        		  // console.log(this.state.prefectureData);
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

	renderCheckBoxes() {
		const {prefectures, filter} = this.state;

	    return prefectures
	        .filter(checkbox =>
	            filter === 'ALL' ||
	            filter === 'CHECKED' && checkbox.checked ||
	            filter === 'UNCHECKED' && !checkbox.checked
	        )
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

	toggleCheckbox(index) {
    	const {prefectures} = this.state;

    	prefectures[index].checked = !prefectures[index].checked;

    	if (prefectures[index].checked) {
    		this.getPopulationData(prefectures[index]);
    	}
    	else {
    		this.removeFromChartData(prefectures[index].prefName);
    		this.removePrefectureData(prefectures[index].prefName);
    	}

    	this.setState({
        	prefectures
    	});
	}

	renderLineChart() {
		const {formattedData} = this.state;

		return (
		  <ResponsiveContainer width='50%' height={400}>
			  <LineChart data={formattedData} width={600} height={400} margin={{top: 40, right: 30, left: 30, bottom: 5,}}>
			    {this.renderLines()}
			    <CartesianGrid stroke="#ccc" />
			    <XAxis dataKey="year">
			    	<Label value="年" position="insideBottomRight" offset={0} />
			    </XAxis>
			    <YAxis>
			    	 <Label value="人口数" position="insideTopLeft" offset={-30} />
			    </YAxis>
			    <Tooltip />
			    <Legend layout="vetical" verticalAlign="middle" align="right" wrapperStyle={{right: -100}} />
			  </LineChart>
		  </ ResponsiveContainer>
		);
	}

	renderLines() {
		const {prefectureData} = this.state;

	    return prefectureData
	        .map((prefecture, index) =>
	        	<Line type="monotone" dataKey={prefecture.prefName} stroke="#8884d8" />
	    );
	}

	removePrefectureData(nameToDelete) {
		const newPrefectureData = this.state.prefectureData.filter(data => data.prefName !== nameToDelete);
    	this.setState({ prefectureData: newPrefectureData });
	}

	addToChartData(prefName, data) {
		var newFormattedData = [...this.state.formattedData];

		if (Object.keys(newFormattedData).length === 0) {
			newFormattedData = new Array();

			for(var idx = 0; idx < data.length; idx++) {
				newFormattedData.push({"year":data[idx].year, [prefName]:data[idx].value});
			}
		}
		else {
			for(var idx = 0; idx < data.length; idx++) {
				newFormattedData[idx][prefName] = data[idx].value;
			}
		}

		this.setState({formattedData: newFormattedData});

		// console.log("addToChartData");
		// console.log(this.state.formattedData);
	}

	removeFromChartData(prefName) {
		var oldPrefectureData = [...this.state.formattedData];
		var newPrefectureData = oldPrefectureData.map(function(year){
			delete year[prefName];
			return year;
		});

		this.setState({formattedData: newPrefectureData});

		// console.log("removeFromChartData");
		// console.log(this.state.formattedData);
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