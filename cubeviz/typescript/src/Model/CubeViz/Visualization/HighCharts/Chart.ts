/**
 * 
 */
class CubeViz_Visualization_HighCharts_Chart 
{
	public chartConfig:any;

	/**
	* Initialize a chart instance.
	* @param chartConfig Related chart configuration
	* @param retrievedObservations Array of retrieved observations 
	* @param selectedComponentDimensions Array of dimension objects with
	*                                    selected component dimensions.
	* @param multipleDimensions Array of dimension objects where at least two
	*                           dimension elements were selected.
	* @param oneElementDimensions Array of dimension objects where only one
	*                             dimension element was selected.
	* @param selectedMeasureUri Uri of selected measure
	* @return void
	*/
	public init (chartConfig:any, retrievedObservations:any[], selectedComponentDimensions:any, multipleDimensions:any[],
		oneElementDimensions:any[], selectedMeasureUri:string, dimensaoPrincipal:string) : CubeViz_Visualization_HighCharts_Chart 
	{  
		var forXAxis = null, forSeries = [], observation = new DataCube_Observation (), self = this; 

		// save given chart config
		this.chartConfig = chartConfig;
        
		// Empty array's we want to fill later
		this.chartConfig.series = [];

		if(true === _.isUndefined(self.chartConfig.xAxis)){
			this.chartConfig.xAxis = {categories: []};
		} else {
			this.chartConfig.xAxis.categories = [];
		}
        
		// set empty chart title
		this.chartConfig.title.text = "";
        
		// x axis: set default, if unset
		if (true === _.isUndefined(this.chartConfig.xAxis)) {
			this.chartConfig.xAxis = { title: { text: "" } };
		}
        
		// y axis: set default, if unset
		if (true === _.isUndefined(this.chartConfig.yAxis)) {
			this.chartConfig.yAxis = { title: { text: "" } };
		}

		// assign selected dimensions to xAxis and series (yAxis)
		_.each(selectedComponentDimensions, function(selectedDimension){
            
			// ignore dimensions which have no elements
			if (0 == _.keys(selectedDimension.__cv_elements).length) {
				return;
			}

			if (selectedDimension.__cv_uri == dimensaoPrincipal){
				forXAxis = selectedDimension.__properties;
			} else{
				forSeries.push(selectedDimension.__properties);
			}
		});

		// If set, switch axes
		this.chartConfig._cubeVizVisz = this.chartConfig._cubeVizVisz || {};
        
		// initializing observation handling instance with given elements after init, sorting the x axis elements ascending
		observation.initialize ( retrievedObservations, selectedComponentDimensions, selectedMeasureUri );

		// Check if there are exactly one or two multiple dimensions
		// If both forXAxis and forSeries strings are not blank, than you have two multiple dimensions
		if (false === _.str.isBlank(forXAxis) && false === _.str.isBlank(forSeries)) {
			var xAxisElements:any = observation.getAxesElements(forXAxis);
                
			// put labels for properties to the axis
			_.each(xAxisElements, function(xAxisElement){
				self.chartConfig.xAxis.categories.push(xAxisElement.self.__cv_niceLabel);
			});

			// collect URI's of selected dimensions
			var selectedDimensionPropertyUris:string[] = [];
            
			_.each(selectedComponentDimensions, function(dimension){
				selectedDimensionPropertyUris.push(dimension["http://purl.org/linked-data/cube#dimension"]); 
			});

			// now we take care about the series
			var obj:any = {}, uriCombination:string = "", usedDimensionElementCombinations:any = {};
			var seriesElements:any = observation.getAxesElements(forSeries[0]);

			self.chartConfig.series = [];
			var mapIdData = {};
			_.each(seriesElements, function(seriesElement){
				var dimensionsSeries = [];
				for (var dimensaoIndex in selectedComponentDimensions){
					var dimensao = selectedComponentDimensions[dimensaoIndex];
					if (dimensao.__cv_uri != dimensaoPrincipal){
						dimensionsSeries.push(dimensao.__properties);
					}
				}

				for (var observationIndex in seriesElement.observations){
					var obs = seriesElement.observations[observationIndex];
					var idData = "";
					var dscData = "";
					for (var dimensionSerieIndex in dimensionsSeries){
						var dimensionSerie = dimensionsSeries[dimensionSerieIndex];
						idData = idData + obs[dimensionSerie];
						dscData = dscData + observation["_axes"][dimensionSerie][obs[dimensionSerie]].self.__cv_niceLabel + " - ";
					}
					dscData = dscData.substring(0, dscData.length-3);
					dscData = dscData;
					if (idData in mapIdData){
						mapIdData[idData].data.push(parseFloat(obs[selectedMeasureUri]));
					} else{
						var cor = CubeViz_Visualization_Controller.getColor(dscData);
						obj = { color: cor, data: [], name: dscData };
						obj.data.push(parseFloat(obs[selectedMeasureUri]));
						mapIdData[idData] = obj;
					}
				}	
			});
			for (var key in mapIdData){
				var idData = mapIdData[key];
				self.chartConfig.series.push (idData);
			}
		}   
		return this;
	}
    
    /**
     * Initialize a chart instance.
     * @param chartConfig Related chart configuration
     * @param retrievedObservations Array of retrieved observations 
     * @param selectedComponentDimensions Array of dimension objects with
     *                                    selected component dimensions.
     * @param multipleDimensions Array of dimension objects where at least two
     *                           dimension elements were selected.
     * @param oneElementDimensions Array of dimension objects where only one
     *                             dimension element was selected.
     * @param selectedMeasureUri Uri of selected measure
     * @return void
     */
/*    public init_antigo (chartConfig:any, retrievedObservations:any[], 
        selectedComponentDimensions:any, multipleDimensions:any[],
        oneElementDimensions:any[], selectedMeasureUri:string) 
        : CubeViz_Visualization_HighCharts_Chart 
    {  
        var forXAxis = null,
            forSeries = null,
            observation = new DataCube_Observation (),
            self = this; 

        // save given chart config
        this.chartConfig = chartConfig;
        
        /**
         * Empty array's we want to fill later
         */
/*        this.chartConfig.series = [];

        if(true === _.isUndefined(self.chartConfig.xAxis)){
            this.chartConfig.xAxis = {categories: []};
        } else {
            this.chartConfig.xAxis.categories = [];
        }
        
        // set empty chart title
        this.chartConfig.title.text = "";
        
        // x axis: set default, if unset
        if (true === _.isUndefined(this.chartConfig.xAxis)) {
            this.chartConfig.xAxis = {
                title: {
                    text: ""
                }
            };
        }
        
        // y axis: set default, if unset
        if (true === _.isUndefined(this.chartConfig.yAxis)) {
            this.chartConfig.yAxis = {
                title: {
                    text: ""
                }
            };
        }

        // assign selected dimensions to xAxis and series (yAxis)
        _.each(selectedComponentDimensions, function(selectedDimension){
            
            // ignore dimensions which have no elements
            if (0 == _.keys(selectedDimension.__cv_elements).length) {
                return;
            }

            if ( null == forXAxis ) {
                forXAxis = selectedDimension["http://purl.org/linked-data/cube#dimension"];
            } else {
                forSeries = selectedDimension["http://purl.org/linked-data/cube#dimension"];
            }
        });
        
        // If set, switch axes
        this.chartConfig._cubeVizVisz = this.chartConfig._cubeVizVisz || {};
        if ( "true" == this.chartConfig._cubeVizVisz.doSwitchingAxes) {
            var tmp = forXAxis;
            forXAxis = forSeries;
            forSeries = tmp;
        }
        
        // initializing observation handling instance with given elements
        // after init, sorting the x axis elements ascending
        observation.initialize ( retrievedObservations, selectedComponentDimensions, selectedMeasureUri );
        /**
         * Check if there are exactly one or two multiple dimensions
         * If both forXAxis and forSeries strings are not blank, than you have 
         * two multiple dimensions
         */
/*        if (false === _.str.isBlank(forXAxis) && false === _.str.isBlank(forSeries)) {
            var xAxisElements:any = observation
                .getAxesElements(forXAxis);
                
            // put labels for properties to the axis
            _.each(xAxisElements, function(xAxisElement){
                self.chartConfig.xAxis.categories.push(xAxisElement.self.__cv_niceLabel);
            });
            
            /**
             * collect URI's of selected dimensions
             */
/*            var selectedDimensionPropertyUris:string[] = [];
            
            _.each(selectedComponentDimensions, function(dimension){
                selectedDimensionPropertyUris.push(dimension["http://purl.org/linked-data/cube#dimension"]); 
            });
            
            /**
             * now we take care about the series
             */
/*            var obj:any = {},
                seriesElements:any = observation.getAxesElements(forSeries),
                uriCombination:string = "",
                usedDimensionElementCombinations:any = {};
                
            self.chartConfig.series = [];

            _.each(seriesElements, function(seriesElement){
                
                // this represents one item of the series array (of highcharts)
                obj = { 
                    color: CubeViz_Visualization_Controller.getColor(
                        seriesElement.self.__cv_uri
                    ),
                    data: [],
                    name: seriesElement.self.__cv_niceLabel
                };
                
                // go through all observations associated with this seriesElement
                // and add their values (measure) if set
                _.each(seriesElement.observations, function(seriesObservation){
                    
                    /**
                     * check if the combination of dimension elements in this series 
                     * element was already used.
                     */
/*                    uriCombination = "";
                    
                    _.each(selectedDimensionPropertyUris, function(dimensionUri){
                        uriCombination += seriesObservation[dimensionUri];
                    });
                    
                    if (true === _.isUndefined(usedDimensionElementCombinations[uriCombination])) {
                        usedDimensionElementCombinations[uriCombination] = true;
                    } else {
                        // if this combination is already in use, stop execution immediatly
                        return;
                    }                
                
                    if(false === _.isUndefined(seriesObservation[selectedMeasureUri])) {
                        obj.data.push (parseFloat(
                            seriesObservation[selectedMeasureUri]
                        ));
                    } else {
                        obj.data.push (null);
                    }
                });
                
                self.chartConfig.series.push (obj);
            });
        
        // You have one or zero multiple dimensions
        } else if (false === _.str.isBlank(forXAxis) || false === _.str.isBlank(forSeries)) {
            /**
             * Something like the following example will be generated:
             * 
             *  xAxis: {
             *      categories: ["foo", "bar"]
             *  }
             * 
             *  series: [{
             *      name: ".",
             *      data: [10, 20]
             *  }]
             */
/*            if (false === _.str.isBlank(forXAxis)) {
               
                var firstObservation:Object = null,
                    seriesDataList:number[] = [],
                    xAxisElements:any = observation.getAxesElements(forXAxis),
                    value:number = 0;
                    
                _.each(xAxisElements, function(xAxisElement){
                    
                    firstObservation = xAxisElement.observations[_.keys(xAxisElement.observations)[0]];
                    
                    // add entry on the y axis
                    self.chartConfig.xAxis.categories.push(
                        xAxisElement.self.__cv_niceLabel
                    );
                    
                    // save related value
                    seriesDataList.push(
                        firstObservation [selectedMeasureUri]
                    );
                });
                
                // set series element
                this.chartConfig.series = [{
                    name: ".",
                    data: seriesDataList
                }];
               
            /**
             * Something like the following example will be generated:
             * 
             *  xAxis: {
             *      categories: ["."]
             *  }
             * 
             *  series: [{
             *      name: "foo",
             *      data: [10]
             *  },{
             *      name: "bar",
             *      data: [20]
             *  }]
             */
/*            } else {
                var firstObservation:Object = null,
                    seriesDataList:number[] = [],
                    seriesElements:any = observation.getAxesElements(forSeries),
                    value:number = 0;
                    
                // set xAxis categories
                this.chartConfig.xAxis.categories = ["."];
                    
                // set series elements
                _.each(seriesElements, function(seriesElement){

                    firstObservation = seriesElement.observations[_.keys(seriesElement.observations)[0]];
                    
                    // add entry on the y axis
                    self.chartConfig.series.push({
                        name: seriesElement.self.__cv_niceLabel,
                        data: [firstObservation[selectedMeasureUri]]
                    });
                });
            }
        }
        
        return this;
    }*/


    
    /**
     * 
     */
    public getRenderResult () : any 
    {       
        return this.chartConfig;
    }
}
