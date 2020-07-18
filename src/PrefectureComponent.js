import React, {Component} from 'react';

export default class PrefectureComponent extends Component {

	constructor(props) {
		super(props);

		this.state = {
			prefectures: [],
			filter: 'ÁLL'
		}

		this.getPrefectureList = this.getPrefectureList.bind(this);
	}

	getPrefectureList() {
		var xmlHtppReq = new XMLHttpRequest();
		var ResasApiKey = "0wqYzctaLeFBow5kq5W5z0hTzoq6wLd9HT6gc7Lm";
		var ResasEndpoint = "https://opendata.resas-portal.go.jp";

		xmlHtppReq.open("GET", ResasEndpoint + "/api/v1/prefectures");
		xmlHtppReq.setRequestHeader("X-API-KEY", ResasApiKey);
		
		xmlHtppReq.onload = function(e) {
			if (xmlHtppReq.readyState == 4) {
			    if (xmlHtppReq.status == 200) {
			      var response = JSON.parse(xmlHtppReq.responseText);

			      this.setState({
					prefectures: response.result
        		  });

			      console.log(this.state);
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

	render() {
	    return (
	    	<h1>Japan Prefectures</h1>
    	);
	}
}