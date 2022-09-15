import React, { Component } from 'react'
import Map from 'component/Map';

export default class Mapex extends Component {
    render() {
        return (
            <div style={{ margin: '100px', width:1000 }} >
				<Map
					google={this.props.google}
					center={{lat: 18.5204, lng: 73.8567}}
					height='350px'
					zoom={15}
					
				/>


				
			</div>
        )
    }
}
