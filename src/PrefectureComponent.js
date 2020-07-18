import React, {Component} from 'react';

export default class PrefectureComponent extends Component {

	constructor(props) {
		super(props);

		this.state = {
			prefectures: [],
			filter: 'ALL'
		}

		this.getPrefectureList = this.getPrefectureList.bind(this);
		this.renderCheckBoxes = this.renderCheckBoxes.bind(this);
		this.toggleCheckbox = this.toggleCheckbox.bind(this);
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

	renderCheckBoxes() {
		const {prefectures, filter} = this.state;

	    return prefectures
	        .filter(checkbox =>
	            filter === 'ALL' ||
	            filter === 'CHECKED' && checkbox.checked ||
	            filter === 'UNCHECKED' && !checkbox.checked
	        )
	        .map((checkbox, index) =>
	            <div>
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

    	this.setState({
        	prefectures
    	});
	}

	render() {
	    return (
	    	<div>
	    		<h1>Japan Prefectures</h1>
	    		<div class="section_checkbox">
	    			{this.renderCheckBoxes()}
	    		</div>
	    	</div>
    	);
	}
}