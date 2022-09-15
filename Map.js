import React, { Component,useContext } from 'react';
import { withGoogleMap, GoogleMap, withScriptjs, InfoWindow, Marker } from "react-google-maps";
import Autocomplete from 'react-google-autocomplete';
import Geocode from 'react-geocode';
import { GoogleMapsAPI } from 'resource/GoogleMapsAPI';
import { MapContext } from 'Context/Mcontext';
Geocode.setApiKey(GoogleMapsAPI);
Geocode.enableDebug();




class Map extends Component {
    constructor( props ){
		super( props );
		this.state = {
			address: '',
			city: '',
			area: '',
			state: '',
			mapPosition: {
				lat: this.props.center.lat,
				lng: this.props.center.lng
			},
			markerPosition: {
				lat: this.props.center.lat,
				lng: this.props.center.lng
			}
		};
	

	}


	

	//get current location
	position = async () => {
		await navigator.geolocation.getCurrentPosition(
			
			position => this.setState({
				mapPosition: {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				},
				markerPosition: {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				}


			})
		)
	}

	

	
    

    ///get the address from the dmap position and set those valu in the state

    componentDidMount() {
		Geocode.fromLatLng( this.state.mapPosition.lat , this.state.mapPosition.lng ).then(
			response => {
				const address = response.results[0].formatted_address,
				      addressArray =  response.results[0].address_components,
				      city = this.getCity( addressArray ),
				      area = this.getArea( addressArray ),
				      state = this.getState( addressArray );

				console.log( 'city', city, area, state );

				this.setState( {
					address: ( address ) ? address : '',
					area: ( area ) ? area : '',
					city: ( city ) ? city : '',
					state: ( state ) ? state : '',
				} )
			},
			error => {
				console.error( error );
			}
		);
	};

   

 ///update when drag the pin
 shouldComponentUpdate( nextProps, nextState ){
    if (
        this.state.markerPosition.lat !== this.props.center.lat ||
        this.state.address !== nextState.address ||
        this.state.city !== nextState.city ||
        this.state.area !== nextState.area ||
        this.state.state !== nextState.state
    ) {
        return true
    } else if ( this.props.center.lat === nextProps.center.lat ){
        return false
    }
}

    ///get the city and input the value-city
    getCity = ( addressArray ) => {
		let city = '';
		for( let i = 0; i < addressArray.length; i++ ) {
			if ( addressArray[ i ].types[0] && 'administrative_area_level_2' === addressArray[ i ].types[0] ) {
				city = addressArray[ i ].long_name;
				return city;
			}
		}
	};

    ///get the area and input the value-area
    getArea = ( addressArray ) => {
		let area = '';
		for( let i = 0; i < addressArray.length; i++ ) {
			if ( addressArray[ i ].types[0]  ) {
				for ( let j = 0; j < addressArray[ i ].types.length; j++ ) {
					if ( 'sublocality_level_1' === addressArray[ i ].types[j] || 'locality' === addressArray[ i ].types[j] ) {
						area = addressArray[ i ].long_name;
						return area;
					}
				}
			}
		}
	};

    ///get the state and input the value
    getState = ( addressArray ) => {
		let state = '';
		for( let i = 0; i < addressArray.length; i++ ) {
			for( let i = 0; i < addressArray.length; i++ ) {
				if ( addressArray[ i ].types[0] && 'administrative_area_level_1' === addressArray[ i ].types[0] ) {
					state = addressArray[ i ].long_name;
					return state;
				}
			}
		}
	};

    ///function for autocomplete input
    onChange = ( event ) => {
		this.setState({ [event.target.name]: event.target.value });
	};

	onChangeCity = ( event ) => {
		const {updateCity} = useContext(MapContext);
		this.setState({ [event.target.name]: event.target.value });
		updateCity({ [event.target.name]: event.target.value })
		
		
	};

    ///when marker window closed
    onInfoWindowClose = (e) =>{

    };

    /*
	 * When the marker is dragged you get the lat and long using the functions available from event object.
	 * Use geocode to get the address, city, area and state from the lat and lng positions.
	 * And then set those values in the state.
	 */

    onMarkerDragEnd = ( event ) => {
		let newLat = event.latLng.lat(),
		    newLng = event.latLng.lng();
			

		Geocode.fromLatLng( newLat , newLng ).then(
			response => {
				const address = response.results[0].formatted_address,
				      addressArray =  response.results[0].address_components,
				      city = this.getCity( addressArray ),
				      area = this.getArea( addressArray ),
				      state = this.getState( addressArray );
				this.setState( {
					address: ( address ) ? address : '',
					area: ( area ) ? area : '',
					city: ( city ) ? city : '',
					state: ( state ) ? state : '',
					markerPosition: {
						lat: newLat,
						lng: newLng
					},
					mapPosition: {
						lat: newLat,
						lng: newLng
					},
					
				} )

				
			},
			error => {
				console.error(error);
			}
		);
	};

    ///location search

    onPlaceSelected = ( place ) => {
		console.log( 'plc', place );
		const address = place.formatted_address,
		      addressArray =  place.address_components,
		      city = this.getCity( addressArray ),
		      area = this.getArea( addressArray ),
		      state = this.getState( addressArray ),
		      latValue = place.geometry.location.lat(),
		      lngValue = place.geometry.location.lng();

    ///set these value in state
    this.setState({
        address: ( address ) ? address : '',
        area: ( area ) ? area : '',
        city: ( city ) ? city : '',
        state: ( state ) ? state : '',
        markerPosition: {
            lat: latValue,
            lng: lngValue
        },
        mapPosition: {
            lat: latValue,
            lng: lngValue
        },
    })
};




    

    render() {
        const AsyncMap = withScriptjs(
			withGoogleMap(
				props => (
					<GoogleMap google={ this.props.google }
					           defaultZoom={ this.props.zoom }
					           defaultCenter={{ lat: this.state.mapPosition.lat, lng: this.state.mapPosition.lng }}
					>
						{/* InfoWindow on top of marker */}
						<InfoWindow
							onClose={this.onInfoWindowClose}
							position={{ lat: ( this.state.markerPosition.lat + 0.0018 ), lng: this.state.markerPosition.lng }}
						>
							<div>
								<span style={{ padding: 0, margin: 0 }}>{ this.state.address }</span>
							</div>
						</InfoWindow>
						{/*Marker*/}
						<Marker google={this.props.google}
						        name={'Dolores park'}
						        draggable={true}
						        onDragEnd={ this.onMarkerDragEnd }
						        position={{ lat: this.state.markerPosition.lat, lng: this.state.markerPosition.lng }}
						/>
						
						
						{/* For Auto complete Search Box */}
						<Autocomplete
							style={{
								width: '100%',
								height: '40px',
								paddingLeft: '16px',
								marginTop: '2px',
								marginBottom: '50px'
							}}
							onPlaceSelected={ this.onPlaceSelected }
							types={['(regions)']}
						/>
					</GoogleMap>
				)
			)
		);

        let map;
		if( this.props.center.lat !== undefined ) {
			map = <div>
				<div>
				<button onClick={this.position}>Current Location</button>
					<div className="form-group">
						<label htmlFor="">City</label>
						<input type="text" name="city" className="form-control" onChange={ this.onChangeCity } readOnly="readOnly" value={ this.state.city } style={{width:'350px'}}  />
					</div>
					<div className="form-group">
						<label htmlFor="">Area</label>
						<input type="text" name="area" className="form-control" onChange={ this.onChange } readOnly="readOnly" value={ this.state.area } style={{width:'100%'}}/>
					</div>
					<div className="form-group">
						<label htmlFor="">State</label>
						<input type="text" name="state" className="form-control" onChange={ this.onChange } readOnly="readOnly" value={ this.state.state } style={{width:'100%'}}/>
					</div>
					<div className="form-group">
						<label htmlFor="">Address</label>
						<input type="text" name="address" className="form-control" onChange={ this.onChange } readOnly="readOnly" value={ this.state.address } style={{width:'100%'}}/>
					</div>
				</div>

				<AsyncMap
					googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${GoogleMapsAPI}&libraries=places`}
					loadingElement={
						<div style={{ height: `50%`}} />
					}
					containerElement={
						<div style={{ height: this.props.height }} />
					}
					mapElement={
						<div style={{ height: `50%` }} />
					}
				/>
			</div>
		} else {
			map = <div style={{height: this.props.height}} />
		}
		return( 
			map
			
			)
	}
}



export default Map;
