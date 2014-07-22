var CubeViz_ConfigurationLink = (function () {
    function CubeViz_ConfigurationLink() { }
    CubeViz_ConfigurationLink.save = function save(url, content, type, callback) {
        var oldAjaxSetup = $.ajaxSetup();
        var oldSupportOrs = $.support.cors;

        $.ajaxSetup({
            async: true,
            cache: false,
            type: "POST"
        });
        $.support.cors = true;
        $.ajax({
            "url": url + "savecontenttofile/",
            "data": {
                type: type,
                stringifiedContent: JSON.stringify(content)
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            $.ajaxSetup(oldAjaxSetup);
            $.support.cors = oldSupportOrs;
            throw new Error("save error: " + xhr["responseText"]);
        }).done(function (generatedHash) {
            $.ajaxSetup(oldAjaxSetup);
            $.support.cors = oldSupportOrs;
            callback(generatedHash);
        });
    }
    return CubeViz_ConfigurationLink;
})();
var CubeViz_Collection = (function () {
    function CubeViz_Collection(idKey) {
        this.reset(idKey);
    }
    CubeViz_Collection.prototype.add = function (element, option) {
        if(true === _.isUndefined(element[this.idKey])) {
            throw new Error("Key " + this.idKey + " in element not set!");
            return this;
        }
        if(undefined === this.get(element[this.idKey])) {
            this._.push(element);
        } else {
            if((undefined !== option && undefined !== option["merge"] && option["merge"] == true)) {
                this.remove(element[this.idKey]);
                this._.push(element);
            }
        }
        return this;
    };
    CubeViz_Collection.prototype.addList = function (list) {
        var self = this;
        if(true == _.isArray(list)) {
            _.each(list, function (element) {
                self.add(element);
            });
        } else {
            if(true == _.isObject(list)) {
                this.addList(_.values(list));
            }
        }
        return self;
    };
    CubeViz_Collection.prototype.each = function (func) {
        _.each(this._, func);
        return this;
    };
    CubeViz_Collection.prototype.exists = function (id) {
        return false === _.isUndefined(this.get(id));
    };
    CubeViz_Collection.prototype.get = function (id) {
        var self = this;
        var t = _.filter(this._, function (element) {
            if(element[self.idKey] == id) {
                return true;
            } else {
                return false;
            }
        });
        return 1 == t.length ? t[0] : undefined;
    };
    CubeViz_Collection.prototype.remove = function (id) {
        var self = this;
        this._ = _.reject(this._, function (element) {
            return element[self.idKey] == id;
        });
        return this;
    };
    CubeViz_Collection.prototype.reset = function (idKey) {
        this.idKey = undefined === idKey ? (undefined === this.idKey ? "id" : this.idKey) : idKey;
        this._ = [];
        return this;
    };
    CubeViz_Collection.prototype.size = function () {
        return _.size(this._);
    };
    CubeViz_Collection.prototype.sortAscendingBy = function (key) {
        var a = "";
        var b = "";
        var c = "";
        var d = "";
        var useKey = false === _.isUndefined(key) ? key : this.idKey;

        this._.sort(function (a, b) {
            try  {
                try  {
                    c = parseFloat(a[useKey]);
                    d = parseFloat(b[useKey]);
                    if(true === _.isNaN(c) || true === _.isNaN(d)) {
                        throw new Error();
                    }
                } catch (ex) {
                    c = a[useKey].toUpperCase();
                    d = b[useKey].toUpperCase();
                }
                return (c < d) ? -1 : (c > d) ? 1 : 0;
            } catch (e) {
            }
        });
        return this;
    };
    CubeViz_Collection.prototype.toObject = function () {
        var i = 0;
        var obj = {
        };

        _.each(this._, function (entry) {
            obj[i++] = entry;
        });
        return obj;
    };
    return CubeViz_Collection;
})();
var CubeViz_Visualization = (function () {
    function CubeViz_Visualization() {
    }
    CubeViz_Visualization.prototype.getName = function () {
        return this.name;
    };
    CubeViz_Visualization.prototype.getSupportedClassNames = function () {
        return this.supportedClassNames;
    };
    CubeViz_Visualization.prototype.load = function (c) {
        if(true === this.isResponsibleFor(c)) {
            var chartInstance;
            eval("chartInstance = new " + c + "();");
            return chartInstance;
        }
        throw new Error("Invalid c (" + c + ") given!");
    };
    CubeViz_Visualization.prototype.isResponsibleFor = function (className) {
        return _.contains(this.getSupportedClassNames(), className);
    };
    return CubeViz_Visualization;
})();
var CubeViz_View_Abstract = (function () {
    function CubeViz_View_Abstract(id, attachedTo, app) {
        this.app = app;
        this.attachedTo = attachedTo;
        this.autostart = false;
        this.collection = new CubeViz_Collection();
        this.id = id || "view";
    }
    CubeViz_View_Abstract.prototype.bindGlobalEvents = function (events) {
        this.app.bindGlobalEvents(events, this);
        return this;
    };
    CubeViz_View_Abstract.prototype.bindUserInterfaceEvents = function (events) {
        if(true === _.isUndefined(events) || 0 == _.size(events)) {
            return;
        }
        var eventName = "";
        var selector = "";
        var self = this;

        _.each(events, function (method, key) {
            if(false === _.isFunction(method)) {
                method = self[method];
            }
            if(!method) {
                throw new Error("Method " + method + " does not exist");
            }
            eventName = key.substr(0, key.indexOf(" "));
            selector = key.substr(key.indexOf(" ") + 1);
            $(selector).on(eventName, $.proxy(method, self));
        });
    };
    CubeViz_View_Abstract.prototype.destroy = function () {
        var el = $(this.attachedTo);
        el.off();
        if(true === el.is("div")) {
            el.empty();
        } else {
            if(true === el.is("select")) {
                el.find("option").remove();
            }
        }
        this.collection.reset();
        return this;
    };
    CubeViz_View_Abstract.prototype.initialize = function () {
    };
    CubeViz_View_Abstract.prototype.triggerGlobalEvent = function (eventName, data) {
        this.app.triggerEvent(eventName, data);
        return this;
    };
    return CubeViz_View_Abstract;
})();
var CubeViz_View_Application = (function () {
    function CubeViz_View_Application() {
        this._viewInstances = new CubeViz_Collection();
        this._eventHandlers = new CubeViz_Collection();
        this._ = {
        };
    }
    CubeViz_View_Application.prototype.add = function (id, attachedTo, merge) {
        var options = true === merge ? {
            merge: true
        } : undefined;
        var viewObj = {
            alreadyRendered: false,
            attachedTo: attachedTo,
            id: id,
            instance: null
        };

        eval("viewObj.instance = new " + id + "(\"" + attachedTo + "\", this);");
        this._viewInstances.add(viewObj, options);
        return this;
    };
    CubeViz_View_Application.prototype.bindGlobalEvents = function (events, callee) {
        if(true === _.isUndefined(events) || 0 == _.size(events)) {
            return this;
        }
        var self = this;
        _.each(events, function (event) {
            $(self).on(event.name, $.proxy(event.handler, callee));
        });
        return this;
    };
    CubeViz_View_Application.prototype.destroyView = function (id) {
        this._viewInstances.get(id).instance.destroy();
        return this;
    };
    CubeViz_View_Application.prototype.get = function (id) {
        return this._viewInstances.get(id);
    };
    CubeViz_View_Application.prototype.getDataCopy = function () {
        var backup = [
            this._.generatedVisualization
        ];
        this._.generatedVisualization = undefined;
        var result = $.parseJSON(JSON.stringify(this._));
        this._.generatedVisualization = backup[1];
        return result;
    };
    CubeViz_View_Application.prototype.remove = function (id) {
        this._viewInstances.remove(id);
        return this;
    };
    CubeViz_View_Application.prototype.renderAll = function () {
        var self = this;
        _.each(this._viewInstances._, function (view) {
            self.renderView(view.id, view.attachedTo);
        });
        return this;
    };
    CubeViz_View_Application.prototype.renderView = function (id, attachedTo) {
        this.add(id, attachedTo).destroyView(id).get(id).instance.initialize();
        return this;
    };
    CubeViz_View_Application.prototype.reset = function () {
        $(this).off();
        var self = this;
        _.each(this._viewInstances._, function (view) {
            self.destroyView(view.id).add(view.id, view.attachedTo, true);
        });
        return this;
    };
    CubeViz_View_Application.prototype.restoreDataCopy = function (copy) {
        this._ = $.parseJSON(JSON.stringify(copy));
        return this;
    };
    CubeViz_View_Application.prototype.triggerEvent = function (eventName, data) {
        $(this).trigger(eventName, [
            data
        ]);
        return this;
    };
    CubeViz_View_Application.prototype.unbindEvent = function (eventName) {
        $(this).off(eventName);
        return this;
    };
    return CubeViz_View_Application;
})();
var CubeViz_View_Helper = (function () {
    function CubeViz_View_Helper() { }
    CubeViz_View_Helper.attachDialogTo = function attachDialogTo(domElement, options) {
        var defaultOptions = {
        };
        var options = options || {
        };

        defaultOptions.autoOpen = options.autoOpen || false;
        defaultOptions.closeOnEscape = options.closeOnEscape || false;
        defaultOptions.draggable = options.draggable || false;
        defaultOptions.height = options.height || "auto";
        defaultOptions.hide = options.hide || "slow";
        defaultOptions.modal = options.modal || true;
        defaultOptions.overlay = options.overlay || {
            "background-color": "#FFFFFF",
            opacity: 0.5
        };
        defaultOptions.resizable = options.resizable || false;
        defaultOptions.show = options.show || "slow";
        defaultOptions.width = options.width || "700";
        if(true === _.isUndefined(options.showCross) || false === options.showCross) {
            defaultOptions.open = function (event, ui) {
                $(".ui-dialog-titlebar-close", $(this).parent()).hide();
            };
        }
        ; ;
        domElement.dialog(defaultOptions);
        domElement.data("hasDialog", true);
    }
    CubeViz_View_Helper.closeDialog = function closeDialog(domElement) {
        domElement.dialog("close");
        domElement.data("isDialogOpen", false);
    }
    CubeViz_View_Helper.destroyDialog = function destroyDialog(domElement) {
        domElement.dialog("destroy");
        domElement.data("isDialogOpen", false);
    }
    CubeViz_View_Helper.openDialog = function openDialog(domElement) {
        domElement.dialog("open");
        domElement.data("isDialogOpen", true);
        $(".ui-widget-overlay").css("height", 2 * screen.height);
    }
    CubeViz_View_Helper.sortLiItemsByAlphabet = function sortLiItemsByAlphabet(listItems) {
        var a = "";
        var b = "";
        var data = {
        };
        var resultList = [];

        listItems.sort(function (a, b) {
            a = $(a).text().toUpperCase();
            b = $(b).text().toUpperCase();
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        });
        _.each(listItems, function (item) {
            data = $(item).data("data");
            item = $(item).clone();
            $(item).data("data", data);
            resultList.push(item);
        });
        return resultList;
    }
    CubeViz_View_Helper.sortLiItemsByCheckStatus = function sortLiItemsByCheckStatus(listItems) {
        var data = {
        };
        var notCheckedItems = [];
        var resultList = [];

        _.each(listItems, function (item) {
            if($($(item).children().first()).is(":checked")) {
                data = $(item).data("data");
                item = $(item).clone();
                $(item).data("data", data);
                resultList.push(item);
            } else {
                notCheckedItems.push(item);
            }
        });
        _.each(notCheckedItems, function (item) {
            data = $(item).data("data");
            item = $(item).clone();
            $(item).data("data", data);
            resultList.push(item);
        });
        return resultList;
    }
    CubeViz_View_Helper.sortLiItemsByObservationCount = function sortLiItemsByObservationCount(listItems, dimensionTypeUrl, retrievedObservations) {
        var dimensionElementUri = "";
        var listItemValues = [];
        var listItemsWithoutCount = [];
        var observationCount = 0;
        var resultList = [];

        _.each(listItems, function (liItem) {
            dimensionElementUri = $($(liItem).children().first()).val();
            observationCount = 0;
            _.each(retrievedObservations, function (observation) {
                if(dimensionElementUri === observation[dimensionTypeUrl][0].value) {
                    ++observationCount;
                }
            });
            $(liItem).data("observationCount", observationCount);
            if(0 < observationCount) {
                resultList.push($(liItem).clone());
            } else {
                listItemsWithoutCount.push(liItem);
            }
        });
        resultList.sort(function (a, b) {
            a = $(a).data("observationCount");
            b = $(b).data("observationCount");
            return (a < b) ? 1 : (a > b) ? -1 : 0;
        });
        _.each(listItemsWithoutCount, function (item) {
            resultList.push($(item).clone());
        });
        return resultList;
    }
    CubeViz_View_Helper.tplReplace = function tplReplace(templateStr, contentObj) {
        if(true === _.isUndefined(contentObj)) {
            return templateStr;
        }
        var contentObjKeys = _.keys(contentObj);
        _.each(contentObjKeys, function (key) {
            templateStr = templateStr.replace("[[" + key + "]]", _.str.trim(contentObj[key]));
        });
        return _.str.trim(templateStr);
    }
    return CubeViz_View_Helper;
})();
var CubeViz_Visualization_Controller = (function () {
    function CubeViz_Visualization_Controller() { }
    CubeViz_Visualization_Controller.getColor = function getColor(variable) {
        var color = "#FFFFFF";
        if(true === _.isString(variable) || true === _.isNumber(variable)) {
            color = "" + CryptoJS.MD5(variable);
            color = "#" + color.substr((color["length"] - 6), 6);
        } else {
            if(false === _.isUndefined(variable)) {
                color = JSON.stringify(variable);
                color = "#" + color.substr((color["length"] - 6), 6);
            }
        }
        return color;
    }
    CubeViz_Visualization_Controller.getFromChartConfigByClass = function getFromChartConfigByClass(className, charts) {
        var result = undefined;
        _.each(charts, function (chart) {
            if(true === _.isUndefined(result)) {
                if(className == chart.className) {
                    result = chart;
                }
            }
        });
        return result;
    }
    CubeViz_Visualization_Controller.getMultipleDimensions = function getMultipleDimensions(selectedComponentDimensions) {
        var multipleDimensions = [];
        _.each(selectedComponentDimensions, function (selectedDimension) {
            if(2 <= _.keys(selectedDimension.__cv_elements).length) {
                multipleDimensions.push(selectedDimension);
            }
        });
        return multipleDimensions;
    }
    CubeViz_Visualization_Controller.getObjectValueByKeyString = function getObjectValueByKeyString(keyString, objToAccess) {
        var call = "objToAccess";
        var result = undefined;

        try  {
            _.each(keyString.split("."), function (key) {
                call += "." + key;
            });
            eval("result = " + call);
        } catch (ex) {
        }
        return result;
    }
    CubeViz_Visualization_Controller.getOneElementDimensions = function getOneElementDimensions(selectedComponentDimensions) {
        var oneElementDimensions = [];
        _.each(selectedComponentDimensions, function (selectedDimension) {
            if(1 == _.keys(selectedDimension.__cv_elements).length) {
                oneElementDimensions.push(selectedDimension);
            }
        });
        return oneElementDimensions;
    }
    CubeViz_Visualization_Controller.getVisualizationType = function getVisualizationType(className) {
        var hC = new CubeViz_Visualization_HighCharts();
        if(true === hC.isResponsibleFor(className)) {
            return hC.getName();
        }
        throw new Error("Unknown className " + className);
    }
    CubeViz_Visualization_Controller.linkify = function linkify(inputText) {
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        return inputText.replace(urlPattern, '<a href="$&" target="_blank">$&</a>').replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>').replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
    }
    CubeViz_Visualization_Controller.setChartConfigClassEntry = function setChartConfigClassEntry(className, charts, newValue) {
        for(var i in charts) {
            if(className == charts[i].className) {
                charts[i] = newValue;
            }
        }
    }
    CubeViz_Visualization_Controller.updateVisualizationSettings = function updateVisualizationSettings(menuItemValues, visualizationSetting, chartConfigEntryDefaultConfig) {
        var call = "";
        var optionKey = "";
        var optionVal = "";
        var updatedSetting = visualizationSetting || {
        };

        if(0 === _.keys(updatedSetting).length) {
            updatedSetting = chartConfigEntryDefaultConfig;
        }
        updatedSetting = $.parseJSON(JSON.stringify(updatedSetting));
        _.each(menuItemValues, function (menuItemValue) {
            optionKey = $(menuItemValue).data("key");
            optionVal = $(menuItemValue).val();
            if(true === _.isUndefined(optionKey)) {
                return;
            }
            call = "updatedSetting";
            _.each(optionKey.split("."), function (key) {
                call += "." + key;
                eval(call + " = " + call + " || {};");
            });
            eval(call + " = optionVal;");
        });
        return updatedSetting;
    }
    return CubeViz_Visualization_Controller;
})();
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var CubeViz_Visualization_HighCharts = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts, _super);
    function CubeViz_Visualization_HighCharts() {
        _super.call(this);
        this.name = "HighCharts";
        this.supportedClassNames = [
            "CubeViz_Visualization_HighCharts_Area", 
            "CubeViz_Visualization_HighCharts_AreaSpline", 
            "CubeViz_Visualization_HighCharts_Bar", 
            "CubeViz_Visualization_HighCharts_Column", 
            "CubeViz_Visualization_HighCharts_Line", 
            "CubeViz_Visualization_HighCharts_Pie", 
            "CubeViz_Visualization_HighCharts_Polar", 
            "CubeViz_Visualization_HighCharts_Spline"
        ];
    }
    return CubeViz_Visualization_HighCharts;
})(CubeViz_Visualization);
var CubeViz_Visualization_HighCharts_Chart = (function () {
    function CubeViz_Visualization_HighCharts_Chart() { }
    CubeViz_Visualization_HighCharts_Chart.prototype.init = function (chartConfig, retrievedObservations, selectedComponentDimensions, multipleDimensions, oneElementDimensions, selectedMeasureUri, dimensaoPrincipal) {
        var forXAxis = null;
        var forSeries = [];
        var observation = new DataCube_Observation();
        var self = this;

        this.chartConfig = chartConfig;
        this.chartConfig.series = [];
        if(true === _.isUndefined(self.chartConfig.xAxis)) {
            this.chartConfig.xAxis = {
                categories: []
            };
        } else {
            this.chartConfig.xAxis.categories = [];
        }
        this.chartConfig.title.text = "";
        if(true === _.isUndefined(this.chartConfig.xAxis)) {
            this.chartConfig.xAxis = {
                title: {
                    text: ""
                }
            };
        }
        if(true === _.isUndefined(this.chartConfig.yAxis)) {
            this.chartConfig.yAxis = {
                title: {
                    text: ""
                }
            };
        }
        _.each(selectedComponentDimensions, function (selectedDimension) {
            if(0 == _.keys(selectedDimension.__cv_elements).length) {
                return;
            }
            if(selectedDimension.__cv_uri == dimensaoPrincipal) {
                forXAxis = selectedDimension.__properties;
            } else {
                forSeries.push(selectedDimension.__properties);
            }
        });
        this.chartConfig._cubeVizVisz = this.chartConfig._cubeVizVisz || {
        };
        observation.initialize(retrievedObservations, selectedComponentDimensions, selectedMeasureUri);
        if(false === _.str.isBlank(forXAxis) && false === _.str.isBlank(forSeries)) {
            var xAxisElements = observation.getAxesElements(forXAxis);
            _.each(xAxisElements, function (xAxisElement) {
                self.chartConfig.xAxis.categories.push(xAxisElement.self.__cv_niceLabel);
            });
            var selectedDimensionPropertyUris = [];
            _.each(selectedComponentDimensions, function (dimension) {
                selectedDimensionPropertyUris.push(dimension["http://purl.org/linked-data/cube#dimension"]);
            });
            var obj = {
            };
            var uriCombination = "";
            var usedDimensionElementCombinations = {
            };

            var seriesElements = observation.getAxesElements(forSeries[0]);
            self.chartConfig.series = [];
            var mapIdData = {
            };
            _.each(seriesElements, function (seriesElement) {
                var dimensionsSeries = [];
                for(var dimensaoIndex in selectedComponentDimensions) {
                    var dimensao = selectedComponentDimensions[dimensaoIndex];
                    if(dimensao.__cv_uri != dimensaoPrincipal) {
                        dimensionsSeries.push(dimensao.__properties);
                    }
                }
                for(var observationIndex in seriesElement.observations) {
                    var obs = seriesElement.observations[observationIndex];
                    var idData = "";
                    var dscData = "";
                    for(var dimensionSerieIndex in dimensionsSeries) {
                        var dimensionSerie = dimensionsSeries[dimensionSerieIndex];
                        idData = idData + obs[dimensionSerie];
                        dscData = dscData + observation["_axes"][dimensionSerie][obs[dimensionSerie]].self.__cv_niceLabel + " - ";
                    }
                    dscData = dscData.substring(0, dscData.length - 3);
                    dscData = dscData;
                    if(idData in mapIdData) {
                        mapIdData[idData].data.push(parseFloat(obs[selectedMeasureUri]));
                    } else {
                        var cor = CubeViz_Visualization_Controller.getColor(dscData);
                        obj = {
                            color: cor,
                            data: [],
                            name: dscData
                        };
                        obj.data.push(parseFloat(obs[selectedMeasureUri]));
                        mapIdData[idData] = obj;
                    }
                }
            });
            for(var key in mapIdData) {
                var idData = mapIdData[key];
                self.chartConfig.series.push(idData);
            }
        }
        return this;
    };
    CubeViz_Visualization_HighCharts_Chart.prototype.getRenderResult = function () {
        return this.chartConfig;
    };
    return CubeViz_Visualization_HighCharts_Chart;
})();
var CubeViz_Visualization_HighCharts_Area = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Area, _super);
    function CubeViz_Visualization_HighCharts_Area() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Area;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_AreaSpline = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_AreaSpline, _super);
    function CubeViz_Visualization_HighCharts_AreaSpline() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_AreaSpline;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Bar = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Bar, _super);
    function CubeViz_Visualization_HighCharts_Bar() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Bar;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Column = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Column, _super);
    function CubeViz_Visualization_HighCharts_Column() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Column;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Line = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Line, _super);
    function CubeViz_Visualization_HighCharts_Line() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Line;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Pie = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Pie, _super);
    function CubeViz_Visualization_HighCharts_Pie() {
        _super.apply(this, arguments);

    }
    CubeViz_Visualization_HighCharts_Pie.prototype.init = function (chartConfig, retrievedObservations, selectedComponentDimensions, multipleDimensions, oneElementDimensions, selectedMeasureUri) {
        if(1 < _.size(multipleDimensions)) {
            throw new Error("Pie chart is only suitable for one dimension!");
            return;
        }
        var forXAxis = multipleDimensions[_.keys(multipleDimensions)[0]]["http://purl.org/linked-data/cube#dimension"];
        var label = "";
        var observation = new DataCube_Observation();
        var self = this;
        var usedXAxisElements = [];
        var value = 0;

        this.chartConfig = chartConfig;
        this.chartConfig.colors = [];
        this.chartConfig.series = [];
        this.chartConfig.title.text = "";
        if(true === _.isUndefined(this.chartConfig.xAxis)) {
            this.chartConfig.xAxis = {
                title: {
                    text: ""
                }
            };
        }
        if(true === _.isUndefined(this.chartConfig.yAxis)) {
            this.chartConfig.yAxis = {
                title: {
                    text: ""
                }
            };
        }
        observation.initialize(retrievedObservations, selectedComponentDimensions, selectedMeasureUri);
        var xAxisElements = observation.getAxesElements(forXAxis);
        this.chartConfig.series.push({
            type: "pie",
            name: this.chartConfig.title.text,
            data: []
        });
        _.each(xAxisElements, function (xAxisElement) {
            _.each(xAxisElement.observations, function (observation) {
                try  {
                    value = parseFloat(observation[selectedMeasureUri]);
                } catch (ex) {
                    return;
                }
                if(-1 == $.inArray(xAxisElement.self.__cv_niceLabel, usedXAxisElements)) {
                    self.chartConfig.series[0].data.push([
                        xAxisElement.self.__cv_niceLabel, 
                        value
                    ]);
                    self.chartConfig.colors.push(CubeViz_Visualization_Controller.getColor(xAxisElement.self.__cv_uri));
                    usedXAxisElements.push(xAxisElement.self.__cv_niceLabel);
                } else {
                    return;
                }
            });
        });
        return this;
    };
    return CubeViz_Visualization_HighCharts_Pie;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Polar = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Polar, _super);
    function CubeViz_Visualization_HighCharts_Polar() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Polar;
})(CubeViz_Visualization_HighCharts_Chart);
var CubeViz_Visualization_HighCharts_Spline = (function (_super) {
    __extends(CubeViz_Visualization_HighCharts_Spline, _super);
    function CubeViz_Visualization_HighCharts_Spline() {
        _super.apply(this, arguments);

    }
    return CubeViz_Visualization_HighCharts_Spline;
})(CubeViz_Visualization_HighCharts_Chart);
var DataCube_Component = (function () {
    function DataCube_Component() { }
    DataCube_Component.loadAllDimensions = function loadAllDimensions(url, modelIri, dsdUrl, dsUrl, callback) {
        $.ajax({
            url: url + "getcomponents",
            data: {
                modelIri: modelIri,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                componentType: "dimension"
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAllDimensions: " + xhr.responseText);
        }).success(function (entries) {
            if(false === _.isUndefined(entries) && false === _.isUndefined(entries.content)) {
                callback(entries.content);
            }
        });
    }
    DataCube_Component.loadAllMeasures = function loadAllMeasures(url, modelIri, dsdUrl, dsUrl, callback) {
        $.ajax({
            url: url + "getcomponents",
            data: {
                modelIri: modelIri,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                componentType: "measure"
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAllMeasures: " + xhr.responseText);
        }).done(function (entries) {
            if(false === _.isUndefined(entries) && false === _.isUndefined(entries.content)) {
                callback(entries.content);
            }
        });
    }
    DataCube_Component.getDefaultSelectedDimensions = function getDefaultSelectedDimensions(componentDimensions) {
        var alreadyUsedIndexes = [];
        var componentDimensions = JSON.parse(JSON.stringify(componentDimensions));
        var i = 0;
        var infinityBackup = 0;
        var maxNumberOfElements = 0;
        var numberOfElements = 0;
        var randomElementIndex = 0;
        var result = {
        };
        var selectedElements = {
        };

        _.each(componentDimensions, function (componentDimension, dimensionHashedUrl) {
            alreadyUsedIndexes = [];
            infinityBackup = 0;
            numberOfElements = _.keys(componentDimension.__cv_elements).length;
            maxNumberOfElements = 1 + Math.floor(_.keys(componentDimension.__cv_elements).length * 0.3);
            maxNumberOfElements = 10 < maxNumberOfElements ? 10 : 1 > maxNumberOfElements ? 1 : maxNumberOfElements;
            do {
                randomElementIndex = Math.floor((Math.random() * numberOfElements));
                if(-1 === $.inArray(randomElementIndex, alreadyUsedIndexes)) {
                    if((alreadyUsedIndexes.length + 1) <= maxNumberOfElements) {
                        alreadyUsedIndexes.push(randomElementIndex);
                    }
                    if(maxNumberOfElements == alreadyUsedIndexes.length) {
                        break;
                    }
                }
                infinityBackup++;
            }while((2 * maxNumberOfElements) > infinityBackup)
            selectedElements = {
            };
            i = 0;
            _.each(componentDimension.__cv_elements, function (element, elementUri) {
                if(-1 < $.inArray(i, alreadyUsedIndexes)) {
                    selectedElements[i] = element;
                }
                i++;
            });
            componentDimension.__cv_elements = selectedElements;
            result[dimensionHashedUrl] = componentDimension;
        });
        return result;
    }
    return DataCube_Component;
})();
var DataCube_DataSet = (function () {
    function DataCube_DataSet() { }
    DataCube_DataSet.loadAll = function loadAll(url, modelIri, dsdUrl, callback) {
        $.ajax({
            url: url + "getdatasets/",
            data: {
                dsdUrl: dsdUrl,
                modelIri: modelIri
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAll error: " + xhr.responseText);
        }).success(function (entries) {
            if(false === _.isUndefined(entries) && false === _.isUndefined(entries.content)) {
                callback(entries.content);
            }
        });
    }
    return DataCube_DataSet;
})();
var DataCube_DataStructureDefinition = (function () {
    function DataCube_DataStructureDefinition() { }
    DataCube_DataStructureDefinition.loadAll = function loadAll(url, modelUrl, callback) {
        $.ajax({
            url: url + "getdatastructuredefinitions/",
            data: {
                m: modelUrl
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("loadAll error: " + xhr.responseText);
        }).done(function (entries) {
            DataCube_DataStructureDefinition.prepareLoadedDataStructureDefinitions(entries, callback);
        });
    }
    DataCube_DataStructureDefinition.prepareLoadedDataStructureDefinitions = function prepareLoadedDataStructureDefinitions(entries, callback) {
        entries = JSON.parse(entries);
        entries.sort(function (a, b) {
            return a["label"].toUpperCase().localeCompare(b["label"].toUpperCase());
        });
        callback(entries);
    }
    return DataCube_DataStructureDefinition;
})();
var DataCube_Observation = (function () {
    function DataCube_Observation() {
        this._axes = {
        };
    }
    DataCube_Observation.prototype.addAxisEntryPointsTo = function (uri, value, dimensionValues) {
        var self = this;
        _.each(dimensionValues, function (dimensionValue, dimensionUri) {
            dimensionValues[dimensionUri] = {
                "value": dimensionValue,
                "ref": self._axes[dimensionUri][dimensionValue]
            };
        });
        this._axes[uri][value].push(dimensionValues);
    };
    DataCube_Observation.prototype.getAxesElements = function (uri) {
        if(false === _.isUndefined(this._axes[uri])) {
            return this._axes[uri];
        } else {
            return {
            };
        }
    };
    DataCube_Observation.prototype.initialize = function (retrievedObservations, selectedComponentDimensions, measureUri) {
        var dimensionElementInfoObject = {
        };
        var dimensionPropertyUri = "";
        var observationDimensionProperty = {
        };
        var self = this;
        var value = 0;

        this._axes = {
        };
        _.each(retrievedObservations, function (observation) {
            try  {
                value = parseFloat(observation[measureUri]);
                if(true === _.str.include(observation[measureUri], " ")) {
                    value = parseFloat(observation[measureUri].replace(/ /gi, ""));
                }
                if(true === _.isNaN(value)) {
                    return;
                }
                observation[measureUri] = value;
            } catch (ex) {
                return;
            }
            _.each(selectedComponentDimensions, function (dimension) {
                dimensionPropertyUri = dimension["http://purl.org/linked-data/cube#dimension"];
                observationDimensionProperty = observation[dimensionPropertyUri];
                if(true === _.isUndefined(self._axes[dimensionPropertyUri])) {
                    self._axes[dimensionPropertyUri] = {
                    };
                }
                if(true === _.isUndefined(self._axes[dimensionPropertyUri][observationDimensionProperty])) {
                    dimensionElementInfoObject = {
                        __cv_uri: observationDimensionProperty,
                        __cv_niceLabel: observationDimensionProperty
                    };
                    _.each(dimension.__cv_elements, function (dimensionElement) {
                        if(dimensionElement.__cv_uri == observationDimensionProperty) {
                            dimensionElementInfoObject = dimensionElement;
                        }
                    });
                    self._axes[dimensionPropertyUri][observationDimensionProperty] = {
                        observations: {
                        },
                        self: dimensionElementInfoObject
                    };
                }
                self._axes[dimensionPropertyUri][observationDimensionProperty].observations[observation.__cv_uri] = observation;
            });
        });
        return this;
    };
    DataCube_Observation.loadAll = function loadAll(modelIri, dataHash, url, callback) {
        $.ajax({
            url: url + "getobservations/",
            data: {
                cv_dataHash: dataHash,
                modelIri: modelIri
            }
        }).error(function (xhr, ajaxOptions, thrownError) {
            throw new Error("Observation loadAll error: " + xhr.responseText);
        }).done(function (entries) {
            callback(entries.content);
        });
    }
    DataCube_Observation.prototype.sortAxis = function (axisUri, mode) {
        return this;
    };
    return DataCube_Observation;
})();
var View_CubeVizModule_DataStructureDefintion = (function (_super) {
    __extends(View_CubeVizModule_DataStructureDefintion, _super);
    function View_CubeVizModule_DataStructureDefintion(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_DataStructureDefintion", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CubeVizModule_DataStructureDefintion.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-dataStructureDefinition-dialog"));
        return this;
    };
    View_CubeVizModule_DataStructureDefintion.prototype.initialize = function () {
        this.collection.reset("__cv_uri").addList(this.app._.data.dataStructureDefinitions);
        this.render();
    };
    View_CubeVizModule_DataStructureDefintion.prototype.onChange_list = function (event) {
        this.showSpinner();
        this.triggerGlobalEvent("onBeforeChange_selectedDSD");
        var selectedElementId = $("#cubeviz-dataStructureDefinition-list").val();
        var selectedElement = this.collection.get(selectedElementId);

        this.app._.data.selectedDSD = selectedElement;
        this.triggerGlobalEvent("onAfterChange_selectedDSD");
    };
    View_CubeVizModule_DataStructureDefintion.prototype.onClick_questionmark = function () {
        CubeViz_View_Helper.openDialog($("#cubeviz-dataStructureDefinition-dialog"));
    };
    View_CubeVizModule_DataStructureDefintion.prototype.onStart_application = function (event, data) {
        this.initialize();
    };
    View_CubeVizModule_DataStructureDefintion.prototype.render = function () {
        var list = $("#cubeviz-dataStructureDefinition-list");
        var self = this;

        list.empty();
        this.collection.each(function (element) {
            list.append("<option value=\"" + element.__cv_uri + "\">" + element.__cv_niceLabel + "</option>");
        });
        _.each(list.children(), function (listEntry) {
            if($(listEntry).val() == self.app._.data.selectedDSD.__cv_uri) {
                $(listEntry).attr("selected", true);
            }
        });
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-dataStructureDefinition-dialog"), {
            closeOnEscape: true,
            showCross: true,
            width: 500
        });
        this.bindUserInterfaceEvents({
            "change #cubeviz-dataStructureDefinition-list": this.onChange_list,
            "click #cubeviz-dataStructureDefinition-questionMark": this.onClick_questionmark
        });
        this.triggerGlobalEvent("onAfterRender_dataStructureDefinition");
        return this;
    };
    View_CubeVizModule_DataStructureDefintion.prototype.showSpinner = function () {
        $("#cubeviz-module-dataSelection").slideUp("slow", function () {
            $("#cubeviz-module-spinner").slideDown("slow");
        });
    };
    return View_CubeVizModule_DataStructureDefintion;
})(CubeViz_View_Abstract);
var View_CubeVizModule_DataSet = (function (_super) {
    __extends(View_CubeVizModule_DataSet, _super);
    function View_CubeVizModule_DataSet(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_DataSet", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onAfterChange_selectedDSD",
                handler: this.onAfterChange_selectedDSD
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CubeVizModule_DataSet.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-dataSet-dialog"));
        return this;
    };
    View_CubeVizModule_DataSet.prototype.initialize = function () {
        this.collection.reset("__cv_uri");
        this.collection.addList(this.app._.data.dataSets);
        this.render();
    };
    View_CubeVizModule_DataSet.prototype.onChange_list = function () {
        this.showSpinner();
        var selectedElementId = $("#cubeviz-dataSet-list").val();
        var selectedElement = this["collection"].get(selectedElementId);

        this.app._.data.selectedDS = selectedElement;
        this.app._.backend.retrievedObservations = {
        };
        this.triggerGlobalEvent("onChange_selectedDS");
    };
    View_CubeVizModule_DataSet.prototype.onAfterChange_selectedDSD = function (event, data) {
        this.destroy();
        var self = this;
        DataCube_DataSet.loadAll(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data.selectedDSD.__cv_uri, function (entries) {
            self.app._.data.selectedDS = entries[0];
            self.app._.data.dataSets = entries;
            self.collection.reset("__cv_uri");
            self.collection.addList(entries);
            self.triggerGlobalEvent("onChange_selectedDS");
            self.render();
        });
    };
    View_CubeVizModule_DataSet.prototype.onClick_questionmark = function () {
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSet-dialog"));
    };
    View_CubeVizModule_DataSet.prototype.onComplete_loadDSD = function (event, data) {
        this.onAfterChange_selectedDSD(event, data);
    };
    View_CubeVizModule_DataSet.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CubeVizModule_DataSet.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_dataSet");
        var list = $(this.attachedTo);
        var self = this;

        this.collection.each(function (element) {
            list.append("<option value=\"" + element.__cv_uri + "\">" + element.__cv_niceLabel + "</option>");
        });
        _.each(list.children(), function (listEntry) {
            if($(listEntry).val() == self.app._.data.selectedDS.__cv_uri) {
                $(listEntry).attr("selected", true);
            }
        });
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-dataSet-dialog"), {
            closeOnEscape: true,
            showCross: true,
            width: 500
        });
        this.bindUserInterfaceEvents({
            "change #cubeviz-dataSet-list": this.onChange_list,
            "click #cubeviz-dataSet-questionMark": this.onClick_questionmark
        });
        this.triggerGlobalEvent("onAfterRender_dataSet");
        return this;
    };
    View_CubeVizModule_DataSet.prototype.showSpinner = function () {
        $("#cubeviz-module-dataSelection").slideUp("slow", function () {
            $("#cubeviz-module-spinner").slideDown("slow");
        });
    };
    return View_CubeVizModule_DataSet;
})(CubeViz_View_Abstract);
var View_CubeVizModule_Component = (function (_super) {
    __extends(View_CubeVizModule_Component, _super);
    function View_CubeVizModule_Component(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_Component", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onChange_selectedDS",
                handler: this.onChange_selectedDS
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_CubeVizModule_Component.prototype.configureSetupComponentDialog = function (component, componentBox, opener) {
        var self = this;
        $("#cubeviz-component-setupDialogContainer").append(CubeViz_View_Helper.tplReplace($("#cubeviz-component-tpl-setupComponentDialog").html(), {
            __cv_niceLabel: component.__cv_niceLabel,
            __cv_hashedUri: component.__cv_hashedUri
        }));
        var div = $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri);
        div.data("componentBox", componentBox).data("component", component);
        CubeViz_View_Helper.attachDialogTo(div);
        $(div.find(".cubeviz-component-selectAllButton").get(0)).data("dialogDiv", div);
        $(div.find(".cubeviz-component-deselectButton").get(0)).data("dialogDiv", div);
        opener.data("dialogDiv", div);
        $($(div.find(".cubeviz-component-cancel")).get(0)).data("dialogDiv", div);
        $($(div.find(".cubeviz-component-closeAndUpdate")).get(0)).data("dialogDiv", div);
        $($(div.find(".cubeviz-component-sortButtons")).children().get(0)).data("dialogDiv", div).data("type", "alphabet");
        $($(div.find(".cubeviz-component-sortButtons")).children().get(1)).data("dialogDiv", div).data("type", "check status");
        $($(div.find(".cubeviz-component-sortButtons")).children().get(2)).data("dialogDiv", div).data("type", "observation count");
        this.configureSetupComponentElements(component);
    };
    View_CubeVizModule_Component.prototype.configureSetupComponentElements = function (component) {
        var dialogDiv = $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri);
        var elementInstance = {
        };
        var componentElements = new CubeViz_Collection("__cv_uri");
        var elementList = $(dialogDiv.find(".cubeviz-component-setupComponentElements")[0]);
        var selectedDimensions = this.app._.data.selectedComponents.dimensions[component.__cv_uri].__cv_elements;
        var setElementChecked = null;
        var wasSomethingSelected = false;

        selectedDimensions = component.__cv_elements;
        this.app._.data.selectedComponents.dimensions[component.__cv_uri].__cv_elements = selectedDimensions;
        componentElements.addList(component.__cv_elements).sortAscendingBy("__cv_niceLabel").each(function (element) {
            setElementChecked = undefined !== _.find(selectedDimensions, function (dim) {
                return false === _.isUndefined(dim) ? dim.__cv_uri == element.__cv_uri : false;
            });
            if(true === setElementChecked) {
                wasSomethingSelected = true;
            }
            elementInstance = $(CubeViz_View_Helper.tplReplace($("#cubeviz-component-tpl-setupComponentElement").html(), {
                __cv_niceLabel: element.__cv_niceLabel,
                __cv_uri: element.__cv_uri,
                __cv_uri2: element.__cv_uri
            }));
            if(true == setElementChecked) {
                elementInstance.children().first().attr("checked", true);
            }
            elementInstance.data("data", element);
            elementList.append(elementInstance);
        });
        if(false === wasSomethingSelected) {
            $($(elementList.find("li").first()).find("input")).attr("checked", "checked");
        }
    };
    View_CubeVizModule_Component.prototype.destroy = function () {
        _.each(this.collection._, function (component) {
            $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri).dialog("destroy");
            $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri).remove();
        });
        $("#cubeviz-component-setupDialogContainer").empty();
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-component-dialog"));
        return this;
    };
    View_CubeVizModule_Component.prototype.hideCloseAndUpdateSpinner = function (dialogDiv) {
        $(dialogDiv.find(".cubeviz-component-closeUpdateSpinner").first()).hide();
    };
    View_CubeVizModule_Component.prototype.hideSpinner = function () {
        $("#cubeviz-module-spinner").slideUp("slow", function () {
            $("#cubeviz-module-dataSelection").slideDown("slow");
        });
    };
    View_CubeVizModule_Component.prototype.initialize = function () {
        this.collection.reset("__cv_hashedUri");
        this.collection.addList(this.app._.data.components.dimensions);
        this.render();
    };
    View_CubeVizModule_Component.prototype.loadComponentDimensions = function (callback) {
        var self = this;
        DataCube_Component.loadAllDimensions(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data.selectedDSD.__cv_uri, this.app._.data.selectedDS.__cv_uri, function (entries) {
            self.app._.data.components.dimensions = entries;
            self.app._.data.selectedComponents.dimensions = DataCube_Component.getDefaultSelectedDimensions(entries);
            self.collection.reset("__cv_hashedUri").addList(entries);
            callback();
        });
    };
    View_CubeVizModule_Component.prototype.loadComponentMeasures = function (callback) {
        var self = this;
        DataCube_Component.loadAllMeasures(this.app._.backend.url, this.app._.backend.modelUrl, this.app._.data.selectedDSD.__cv_uri, this.app._.data.selectedDS.__cv_uri, function (entries) {
            self.app._.data.components.measures = entries;
            self.app._.data.selectedComponents.measures = entries;
            callback();
        });
    };
    View_CubeVizModule_Component.prototype.onChange_selectedDS = function (event, data) {
        var self = this;
        this.destroy();
        this.loadComponentDimensions(function (newComponentDimensions) {
            self.loadComponentMeasures(function (newComponentMeasures) {
                CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.data, "data", function (updatedDataHash) {
                    self.app._.backend.dataHash = updatedDataHash;
                    self.render();
                    self.hideSpinner();
                });
            });
        });
    };
    View_CubeVizModule_Component.prototype.onClick_cancel = function (event) {
        CubeViz_View_Helper.closeDialog($(event.target).data("dialogDiv"));
    };
    View_CubeVizModule_Component.prototype.onClick_closeAndUpdate = function (event) {
        var dialogDiv = $(event.target).data("dialogDiv");
        var self = this;

        this.showCloseAndUpdateSpinner(dialogDiv);
        this.readAndSaveSetupComponentDialogChanges(dialogDiv, function () {
            if(true === cubeVizApp._.backend.uiParts.index.isLoaded) {
                self.triggerGlobalEvent("onReRender_visualization");
            }
            self.triggerGlobalEvent("onUpdate_componentDimensions");
            self.hideCloseAndUpdateSpinner(dialogDiv);
            CubeViz_View_Helper.closeDialog(dialogDiv);
        });
    };
    View_CubeVizModule_Component.prototype.onClick_deselectButton = function (event) {
        $(event.target).data("dialogDiv").find("[type=\"checkbox\"]").attr("checked", false);
    };
    View_CubeVizModule_Component.prototype.onClick_selectAllButton = function (event) {
        $(event.target).data("dialogDiv").find("[type=\"checkbox\"]").attr("checked", true);
    };
    View_CubeVizModule_Component.prototype.onClick_setupComponentOpener = function (event) {
        this.triggerGlobalEvent("onClick_setupComponentOpener");
        CubeViz_View_Helper.openDialog($(event.target).data("dialogDiv"));
    };
    View_CubeVizModule_Component.prototype.onClick_sortButton = function (event) {
        var dialogDiv = $(event.target).data("dialogDiv");
        if(true === _.isUndefined(dialogDiv)) {
            return;
        }
        var dimensionTypeUrl = dialogDiv.data("dimensionTypeUrl");
        var list = $(dialogDiv.find(".cubeviz-component-setupComponentElements").first());
        var listItems = list.children('li');
        var modifiedItemList = [];

        $(event.target).data("dialogDiv").find(".cubeviz-component-sortButton").removeClass("cubeviz-component-sortButtonSelected");
        $(event.target).addClass("cubeviz-component-sortButtonSelected");
        switch($(event.target).data("type")) {
            case "alphabet": {
                modifiedItemList = CubeViz_View_Helper.sortLiItemsByAlphabet(listItems);
                break;

            }
            case "check status": {
                modifiedItemList = CubeViz_View_Helper.sortLiItemsByCheckStatus(listItems);
                break;

            }
            case "observation count": {
                modifiedItemList = CubeViz_View_Helper.sortLiItemsByObservationCount(listItems, dimensionTypeUrl, this.app._.backend.retrievedObservations);
                break;

            }
            default: {
                return;

            }
        }
        list.empty();
        _.each(modifiedItemList, function (item) {
            list.append(item);
        });
    };
    View_CubeVizModule_Component.prototype.onClick_questionmark = function () {
        CubeViz_View_Helper.openDialog($("#cubeviz-component-dialog"));
    };
    View_CubeVizModule_Component.prototype.readAndSaveSetupComponentDialogChanges = function (dialogDiv, callback) {
        var elementList = dialogDiv.find(".cubeviz-component-setupComponentElements").children();
        var componentBox = dialogDiv.data("componentBox");
        var component = dialogDiv.data("component");
        var input = null;
        var inputLabel = null;
        var selectedElements = new CubeViz_Collection("__cv_uri");
        var self = this;

        if(undefined === component) {
            return;
        }
        _.each(elementList, function (element) {
            input = $($(element).children().get(0));
            inputLabel = $($(element).children().get(1));
            if("checked" === input.attr("checked")) {
                selectedElements.add($(element).data("data"));
            }
        });
        this.app._.data.selectedComponents.dimensions[component.__cv_uri].__cv_elements = selectedElements.toObject();
        $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(selectedElements.size());
        this.app._.data.numberOfMultipleDimensions = _.size(CubeViz_Visualization_Controller.getMultipleDimensions(this.app._.data.selectedComponents.dimensions));
        this.app._.data.numberOfOneElementDimensions = _.size(CubeViz_Visualization_Controller.getOneElementDimensions(this.app._.data.selectedComponents.dimensions));
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.data, "data", function (updatedDataHash) {
            DataCube_Observation.loadAll(self.app._.backend.modelUrl, updatedDataHash, self.app._.backend.url, function (newEntities) {
                self.app._.backend.retrievedObservations = newEntities;
                callback();
            });
            self.app._.backend.dataHash = updatedDataHash;
        });
    };
    View_CubeVizModule_Component.prototype.onComplete_loadDS = function (event, data) {
        this.onChange_selectedDS(event, data);
    };
    View_CubeVizModule_Component.prototype.onComplete_loadObservations = function (event, updatedRetrievedObservations) {
        this.app._.backend.retrievedObservations = updatedRetrievedObservations;
    };
    View_CubeVizModule_Component.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CubeVizModule_Component.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_component");
        var backendCollection = this.collection._;
        var list = $("#cubviz-component-listBox");
        var componentBox = null;
        var selectedComponentDimensions = this.app._.data.selectedComponents.dimensions;
        var selectedDimension = null;
        var self = this;
        var tmp = null;

        this.collection.reset();
        _.each(backendCollection, function (dimension) {
            if(false === _.isUndefined(selectedComponentDimensions)) {
                selectedDimension = selectedComponentDimensions[dimension.__cv_uri];
                dimension.selectedElementCount = _.keys(selectedDimension.__cv_elements).length;
            } else {
                dimension.selectedElementCount = 1;
            }
            dimension.elementCount = _.size(dimension.__cv_elements);
            componentBox = $(CubeViz_View_Helper.tplReplace($("#cubeviz-component-tpl-listBoxItem").html(), dimension));
            $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0)).data("dimension", dimension);
            list.append(componentBox);
            self.configureSetupComponentDialog(dimension, componentBox, $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0)));
            $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(dimension.selectedElementCount);
            self.collection.add(dimension);
        });
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-component-dialog"), {
            closeOnEscape: true,
            showCross: true,
            width: 500
        });
        this.bindUserInterfaceEvents({
            "click .cubeviz-component-cancel": this.onClick_cancel,
            "click .cubeviz-component-closeAndUpdate": this.onClick_closeAndUpdate,
            "click .cubeviz-component-deselectButton": this.onClick_deselectButton,
            "click .cubeviz-component-selectAllButton": this.onClick_selectAllButton,
            "click .cubeviz-component-setupComponentOpener": this.onClick_setupComponentOpener,
            "click .cubeviz-component-sortButtons": this.onClick_sortButton,
            "click #cubeviz-component-questionMark": this.onClick_questionmark
        });
        this.triggerGlobalEvent("onAfterRender_component");
        this.hideSpinner();
        return this;
    };
    View_CubeVizModule_Component.prototype.showCloseAndUpdateSpinner = function (dialogDiv) {
        $(dialogDiv.find(".cubeviz-component-closeUpdateSpinner").first()).show();
    };
    return View_CubeVizModule_Component;
})(CubeViz_View_Abstract);
var View_CubeVizModule_Footer = (function (_super) {
    __extends(View_CubeVizModule_Footer, _super);
    function View_CubeVizModule_Footer(attachedTo, app) {
        _super.call(this, "View_CubeVizModule_Footer", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onAfterChange_selectedDSD",
                handler: this.onAfterChange_selectedDSD
            }, 
            {
                name: "onBeforeClick_selectorItem",
                handler: this.onBeforeClick_selectorItem
            }, 
            {
                name: "onChange_selectedDS",
                handler: this.onChange_selectedDS
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }, 
            {
                name: "onUpdate_componentDimensions",
                handler: this.onUpdate_componentDimensions
            }
        ]);
    }
    View_CubeVizModule_Footer.prototype.changePermaLinkButton = function () {
        var value = "";
        if(true == _.isUndefined(this.collection.get("buttonVal"))) {
            this.collection.add({
                "id": "buttonVal",
                "value": $("#cubeviz-footer-permaLinkButton").html()
            });
            this.showLink("<");
        } else {
            value = this.collection.get("buttonVal").value;
            this.collection.remove("buttonVal");
            this.closeLink(value);
        }
    };
    View_CubeVizModule_Footer.prototype.closeLink = function (label) {
        $("#cubeviz-footer-permaLinkButton").fadeOut("slow");
        $("#cubeviz-footer-permaLinkMenu").fadeOut("slow", function () {
            $("#cubeviz-footer-permaLinkButton").html(label).show();
        });
    };
    View_CubeVizModule_Footer.prototype.initialize = function () {
        this.collection.add({
            id: "cubeviz-footer-permaLink",
            html: $("#cubeviz-footer-permaLink").html()
        });
        this.render();
    };
    View_CubeVizModule_Footer.prototype.onAfterChange_selectedDSD = function () {
        if(false === _.isUndefined(this.collection.get("buttonVal"))) {
            this.changePermaLinkButton();
        }
    };
    View_CubeVizModule_Footer.prototype.onBeforeClick_selectorItem = function () {
        if(true == _.isUndefined(this.collection.get("buttonVal"))) {
        } else {
            var value = this.collection.get("buttonVal").value;
            this.collection.remove("buttonVal");
            this.closeLink(value);
        }
    };
    View_CubeVizModule_Footer.prototype.onChange_selectedDS = function () {
        this.onAfterChange_selectedDSD();
    };
    View_CubeVizModule_Footer.prototype.onClick_permaLinkButton = function (event) {
        this.changePermaLinkButton();
    };
    View_CubeVizModule_Footer.prototype.onClick_showVisualization = function (event) {
        var self = this;
        if(true === cubeVizApp._.backend.uiParts.index.isLoaded) {
            this.triggerGlobalEvent("onReRender_visualization");
        } else {
            if(false === cubeVizApp._.backend.uiParts.index.isLoaded) {
                CubeViz_ConfigurationLink.save(self.app._.backend.url, self.app._.data, "data", function (updatedDataHash) {
                    window.location.href = self.app._.backend.url + "?m=" + encodeURIComponent(self.app._.backend.modelUrl) + "&cv_dataHash=" + updatedDataHash + "&cv_uiHash=" + self.app._.backend.uiHash;
                });
            } else {
                CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.data, "data", function (updatedDataHash) {
                    window.location.href = self.app._.backend.url + "?m=" + encodeURIComponent(self.app._.backend.modelUrl) + "&cv_dataHash=" + updatedDataHash + "&cv_uiHash=" + self.app._.backend.uiHash;
                });
            }
        }
    };
    View_CubeVizModule_Footer.prototype.onStart_application = function () {
        this.initialize();
    };
    View_CubeVizModule_Footer.prototype.onUpdate_componentDimensions = function () {
        if(true == _.isUndefined(this.collection.get("buttonVal"))) {
        } else {
            var value = this.collection.get("buttonVal").value;
            this.collection.remove("buttonVal");
            this.closeLink(value);
        }
    };
    View_CubeVizModule_Footer.prototype.render = function () {
        this.bindUserInterfaceEvents({
            "click #cubeviz-footer-permaLinkButton": this.onClick_permaLinkButton,
            "click #cubeviz-footer-showVisualizationButton": this.onClick_showVisualization
        });
        return this;
    };
    View_CubeVizModule_Footer.prototype.showLink = function (label) {
        var self = this;
        $("#cubeviz-footer-permaLinkButton").fadeOut("slow", function () {
            $("#cubeviz-footer-permaLinkButton").html(label).fadeIn("slow");
            var link = self.app._.backend.url + "?m=" + encodeURIComponent(self.app._.backend.modelUrl) + "&cv_dataHash=" + self.app._.backend.dataHash + "&cv_uiHash=" + self.app._.backend.uiHash;
            var url = $("<a></a>").attr("href", link).attr("target", "_self").html(self.collection.get("cubeviz-footer-permaLink").html);
            $("#cubeviz-footer-permaLink").html(url).fadeIn("slow");
            $("#cubeviz-footer-permaLinkMenu").fadeIn("slow");
        });
    };
    return View_CubeVizModule_Footer;
})(CubeViz_View_Abstract);
var View_IndexAction_Header = (function (_super) {
    __extends(View_IndexAction_Header, _super);
    function View_IndexAction_Header(attachedTo, app) {
        _super.call(this, "View_IndexAction_Header", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_IndexAction_Header.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        CubeViz_View_Helper.destroyDialog($("#cubeviz-index-headerDialogBox"));
        return this;
    };
    View_IndexAction_Header.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_Header.prototype.onClick_questionMark = function () {
        $("#cubeviz-index-headerDialogBox").dialog("open");
    };
    View_IndexAction_Header.prototype.onStart_application = function () {
        this.initialize();
    };
    View_IndexAction_Header.prototype.render = function () {
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-index-headerDialogBox"), {
            closeOnEscape: true,
            height: 450,
            showCross: true,
            width: "50%"
        });
        this.renderHeader();
        this.renderDialogBox();
        this.bindUserInterfaceEvents({
            "click #cubeviz-index-headerQuestionMarkHeadline": this.onClick_questionMark
        });
        return this;
    };
    View_IndexAction_Header.prototype.renderDialogBox = function () {
        var modelLabel = "";
        if(false === _.isUndefined(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"]) && false === _.str.isBlank(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"])) {
            modelLabel = this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"].content;
        } else {
            modelLabel = this.app._.backend.modelUrl;
        }
        $("#cubeviz-index-headerDialogBox").html(CubeViz_View_Helper.tplReplace($("#cubeviz-index-tpl-headerDialogBoxHead").html(), {
            label: modelLabel
        }));
        var headerDialogBox = $($("#cubeviz-index-headerDialogBox").children().last());
        _.each(this.app._.backend.modelInformation, function (entry) {
            headerDialogBox.append(CubeViz_View_Helper.tplReplace($("#cubeviz-index-tpl-headerDialogBoxEntry").html(), {
                predicateLabel: entry.predicateLabel,
                objectContent: CubeViz_Visualization_Controller.linkify(entry.content)
            }));
        });
    };
    View_IndexAction_Header.prototype.renderHeader = function () {
        var modelLabel;
        if(false === _.isUndefined(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"]) && false === _.str.isBlank(this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"])) {
            modelLabel = this.app._.backend.modelInformation["http://www.w3.org/2000/01/rdf-schema#label"].content;
        } else {
            modelLabel = this.app._.backend.modelUrl;
        }
        $("#cubeviz-index-header").html(CubeViz_View_Helper.tplReplace($("#cubeviz-index-tpl-header").html(), {
            modelLabel: modelLabel
        }));
    };
    return View_IndexAction_Header;
})(CubeViz_View_Abstract);
var View_IndexAction_Legend = (function (_super) {
    __extends(View_IndexAction_Legend, _super);
    function View_IndexAction_Legend(attachedTo, app) {
        _super.call(this, "View_IndexAction_Legend", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onReRender_visualization",
                handler: this.onReRender_visualization
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_IndexAction_Legend.prototype.destroy = function () {
        $("#cubeviz-legend-btnShowRetrievedObservations").off();
        $("#cubeviz-legend-sortByTitle").off();
        $("#cubeviz-legend-sortByValue").off();
        $("#cubeviz-legend-retrievedObservations").slideUp("slow");
        $("#cubeviz-legend-selectedConfiguration").slideUp("slow");
        $("#cubeviz-legend-dataSet").html("");
        $("#cubeviz-legend-observations").html("");
        $("#cubeviz-legend-configurationList").html("");
        CubeViz_View_Helper.destroyDialog($("#cubeviz-legend-componentDimensionInfoDialog"));
        _super.prototype.destroy.call(this);
        return this;
    };
    View_IndexAction_Legend.prototype.displayDsdAndDs = function (dsdLabel, dsdUrl, dsLabel, dsUrl) {
        $("#cubeviz-legend-dsdAndDs").html(CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-dsdAndDs").html(), {
            dsdLabel: dsdLabel,
            dsdUrl: dsdUrl,
            dsLabel: dsLabel,
            dsUrl: dsUrl
        }));
    };
    View_IndexAction_Legend.prototype.displayRetrievedObservations = function (list) {
        var infoList = null;
        var label = "";

        $("#cubeviz-legend-observations").html("");
        _.each(list, function (obs) {
            $("#cubeviz-legend-observations").append(CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-observation").html(), obs));
            infoList = $($("#cubeviz-legend-observations").find(".cubeviz-legend-observationInfoList").last());
            _.each(obs.__cv_elements, function (dimensionElement) {
                infoList.append(CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-observationInfoListEntry").html(), {
                    dimensionLabel: dimensionElement.dimensionLabel,
                    fullLabel: dimensionElement.__cv_niceLabel,
                    shortLabel: _.str.prune(dimensionElement.__cv_niceLabel, 65, "..."),
                    __cv_uri: dimensionElement.__cv_uri
                }));
            });
        });
    };
    View_IndexAction_Legend.prototype.displaySelectedConfiguration = function (selectedComponentDimensions) {
        var componentDimensionInfoArea = null;
        var observationIcon = null;
        var dimensionElementList = null;
        var dimensionElementsCopy = new CubeViz_Collection("__cv_uri");
        var html = "";
        var label = "";

        $("#cubeviz-legend-components").html($("#cubeviz-legend-tpl-componentList").html());
        _.each(selectedComponentDimensions, function (dimension) {
            $("#cubeviz-legend-componentList").append(CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-componentDimension").html(), {
                __cv_niceLabel: dimension.__cv_niceLabel
            }));
            dimensionElementList = $($("#cubeviz-legend-componentList").find(".cubeviz-legend-componentDimensionList").last());
            html = "";
            dimensionElementsCopy.reset().addList(JSON.parse(JSON.stringify(dimension.__cv_elements))).sortAscendingBy().each(function (dimensionElement) {
                dimensionElementList.append(CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-componentDimensionEntry").html(), {
                    fullLabel: dimensionElement.__cv_niceLabel,
                    shortLabel: _.str.prune(dimensionElement.__cv_niceLabel, 75, " ..."),
                    __cv_uri: dimensionElement.__cv_uri
                }));
                observationIcon = $(dimensionElementList.find(".cubeviz-legend-observationIcon").last());
                componentDimensionInfoArea = $(dimensionElementList.find(".cubeviz-legend-componentDimensionInfoArea").last());
                $(dimensionElementList.find(".cubeviz-legend-componentDimensionShowInfo").last()).data("componentDimensionInfoArea", componentDimensionInfoArea).data("dimension", dimension).data("dimensionElement", dimensionElement).data("observationIcon", observationIcon);
            });
        });
    };
    View_IndexAction_Legend.prototype.generateList = function (observations, selectedComponentDimensions, selectedMeasureUri) {
        var cubeDimensionUri = "http://purl.org/linked-data/cube#dimension";
        var observationLabel = "";
        var dimensionElements = [];
        var label = "";
        var observationLabel = "";
        var rdfsLabelUri = "http://www.w3.org/2000/01/rdf-schema#label";
        var result = [];

        _.each(observations, function (observation) {
            dimensionElements = [];
            _.each(selectedComponentDimensions, function (dimension) {
                _.each(dimension.__cv_elements, function (dimensionElement) {
                    if(dimensionElement.__cv_uri == observation[dimension[cubeDimensionUri]]) {
                        dimensionElements.push({
                            dimensionLabel: dimension.__cv_niceLabel,
                            __cv_niceLabel: dimensionElement.__cv_niceLabel,
                            __cv_uri: dimensionElement.__cv_uri
                        });
                    }
                });
            });
            result.push({
                __cv_niceLabel: observation.__cv_niceLabel,
                __cv_value: observation[selectedMeasureUri],
                __cv_uri: observation.__cv_uri,
                __cv_elements: dimensionElements
            });
        });
        return result;
    };
    View_IndexAction_Legend.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_Legend.prototype.onClick_btnShowSelectedConfiguration = function (event) {
        event.preventDefault();
        $("#cubeviz-legend-selectedConfiguration").slideToggle('slow');
        return false;
    };
    View_IndexAction_Legend.prototype.onClick_btnShowRetrievedObservations = function (event) {
        event.preventDefault();
        $("#cubeviz-legend-retrievedObservations").slideToggle("slow");
        return false;
    };
    View_IndexAction_Legend.prototype.onClick_componentDimensionShowInfo = function (event) {
        event.preventDefault();
        var showMoreInformationBtn = $(event.target);
        var dimension = showMoreInformationBtn.data("dimension");
        var dimensionElement = showMoreInformationBtn.data("dimensionElement");
        var observationIcon = showMoreInformationBtn.data("observationIcon");

        var infoList = $($("#cubeviz-legend-tpl-componentDimensionInfoList").html());
        _.each(dimensionElement, function (value, key) {
            if(false === _.str.startsWith(key, "__cv_")) {
                infoList.append(CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-componentDimensionInfoListEntry").html(), {
                    key: key,
                    value: CubeViz_Visualization_Controller.linkify(value)
                }));
            }
        });
        $("#cubeviz-legend-componentDimensionInfoDialog").html("").append(CubeViz_View_Helper.tplReplace($("#cubeviz-legend-tpl-componentDimensionInfoHeader").html(), dimensionElement)).append(infoList).fadeIn("slow");
        $("#cubeviz-legend-componentDimensionInfoDialog").dialog("open");
        return false;
    };
    View_IndexAction_Legend.prototype.onClick_sortByTitle = function () {
        this.collection.sortAscendingBy("__cv_niceLabel");
        this.displayRetrievedObservations(this.collection._);
    };
    View_IndexAction_Legend.prototype.onClick_sortByValue = function () {
        this.collection.sortAscendingBy("__cv_value");
        this.displayRetrievedObservations(this.collection._);
    };
    View_IndexAction_Legend.prototype.onReRender_visualization = function () {
        this.destroy();
        this.initialize();
    };
    View_IndexAction_Legend.prototype.onStart_application = function () {
        this.initialize();
    };
    View_IndexAction_Legend.prototype.render = function () {
        var selectedMeasureUri = this.app._.data.selectedComponents.measures[_.keys(this.app._.data.selectedComponents.measures)[0]]["http://purl.org/linked-data/cube#measure"];
        var self = this;

        this.displayDsdAndDs(this.app._.data.selectedDSD.__cv_niceLabel, this.app._.data.selectedDSD.__cv_uri, this.app._.data.selectedDS.__cv_niceLabel, this.app._.data.selectedDS.__cv_uri);
        this.displaySelectedConfiguration(this.app._.data.selectedComponents.dimensions);
        this.collection.reset("__cv_niceLabel").addList(this.generateList(this.app._.backend.retrievedObservations, this.app._.data.selectedComponents.dimensions, selectedMeasureUri));
        this.collection.sortAscendingBy("__cv_niceLabel");
        this.displayRetrievedObservations(this.collection._);
        CubeViz_View_Helper.attachDialogTo($("#cubeviz-legend-componentDimensionInfoDialog"), {
            closeOnEscape: true,
            showCross: true,
            height: 450,
            width: "50%"
        });
        $("#cubeviz-legend-btnShowRetrievedObservations").off();
        $("#cubeviz-legend-btnShowSelectedConfiguration").off();
        $(".cubeviz-legend-componentDimensionShowInfo").off();
        $("#cubeviz-legend-sortByTitle").off();
        $("#cubeviz-legend-sortByValue").off();
        this.bindUserInterfaceEvents({
            "click #cubeviz-legend-btnShowSelectedConfiguration": this.onClick_btnShowSelectedConfiguration,
            "click #cubeviz-legend-btnShowRetrievedObservations": this.onClick_btnShowRetrievedObservations,
            "click .cubeviz-legend-componentDimensionShowInfo": this.onClick_componentDimensionShowInfo,
            "click #cubeviz-legend-sortByTitle": this.onClick_sortByTitle,
            "click #cubeviz-legend-sortByValue": this.onClick_sortByValue
        });
        return this;
    };
    return View_IndexAction_Legend;
})(CubeViz_View_Abstract);
var Habilitacao = (function (_super) {
    __extends(Habilitacao, _super);
    function Habilitacao(attachedTo, app) {
        _super.call(this, "Habilitacao", attachedTo, app);
    }
    Habilitacao.prototype.zerar = function () {
        this.ativos = {
        };
        this.desativos = {
        };
    };
    Habilitacao.prototype.isObservacaoAtivo = function (observation, propriedades, dimensoes) {
        var ativo = true;
        for(var dimensaoIndex in dimensoes) {
            var dimensao = dimensoes[dimensaoIndex];
            if(observation[propriedades[dimensao]] in this.ativos) {
            } else {
                ativo = false;
            }
        }
        return ativo;
    };
    Habilitacao.prototype.isDesativo = function (uri) {
        if(uri in this.desativos) {
            return true;
        } else {
            return false;
        }
    };
    return Habilitacao;
})(CubeViz_View_Abstract);
var GeradorOpcoes = (function (_super) {
    __extends(GeradorOpcoes, _super);
    function GeradorOpcoes(attachedTo, app) {
        _super.call(this, "GeradorOpcoes", attachedTo, app);
    }
    GeradorOpcoes.prototype.renderUnits = function (propriedadeUnidade) {
        var unidades = {
        };
        for(var observacaoIndex in this.app._.backend.retrievedObservations) {
            var observacao = this.app._.backend.retrievedObservations[observacaoIndex];
            unidades[observacao[propriedadeUnidade]] = true;
        }
        var html = "";
        html += "<p style='font-weight:bold;margin-left:15px;margin-bottom:0px;'>Choose one or more metrics:</p>";
        var checked = false;
        for(var unidadeIndex in unidades) {
            if(checked) {
                html += "<input type='checkbox' id='cm-unidade' name='cm-unidade' value='" + unidadeIndex + "' style='margin-left:20px;margin-right:5px;margin-top:-5px;'>" + unidadeIndex + "</input>";
            } else {
                html += "<input type='checkbox' id='cm-unidade' name='cm-unidade' checked='checked' value='" + unidadeIndex + "' style='margin-left:20px;margin-right:5px;margin-top:-5px;'>" + unidadeIndex + "</input>";
                checked = true;
            }
        }
        html += "<div style='border-top:1px dashed rgb(135,135,135);'></div>";
        html += "<p style='font-weight:bold;margin-left:15px;margin-bottom:0px;'>Choose the aggregation operation:</p>";
        html += "<input type='radio' id='cm-unidade-op' name='cm-unidade-op' value='sum' checked='checked' style='margin-left:20px;margin-right:5px;margin-top:-5px;'>Sum</input>";
        html += "<input type='radio' id='cm-unidade-op' name='cm-unidade-op' value='avg' style='margin-left:20px;margin-right:5px;margin-top:-5px;'>Average</input>";
        html += "<input type='radio' id='cm-unidade-op' name='cm-unidade-op' value='max' style='margin-left:20px;margin-right:5px;margin-top:-5px;'>Maximun</input>";
        html += "<input type='radio' id='cm-unidade-op' name='cm-unidade-op' value='min' style='margin-left:20px;margin-right:5px;margin-top:-5px;'>Minimun</input>";
        $("#configuration-menu-unit-content").html(html);
    };
    GeradorOpcoes.prototype.renderHierarchy = function () {
        var disabled = true;
        var dimensoes = this.app._.data.components.dimensions;
        $("#configuration-hierarchy-dimension-content").html("");
        for(var dimensaoIndex in dimensoes) {
            var dimensao = dimensoes[dimensaoIndex];
            var hierarquia = dimensao.hierarchy;
            var identificadorDimensao = this.trataString(dimensao.__cv_uri);
            var html = this.geraHtmlHierarquia(hierarquia, 1, identificadorDimensao, disabled);
            if(disabled == true) {
                disabled = false;
            }
            var div_tag = "<div style=\"background-color:rgb(240,240,240);width:92%;margin-left:4%;margin-top:15px;margin-bottom:15px;border: 1px solid rgb(102, 102, 102);border-radius: 4px 4px 4px 4px;\"><div style=\"padding-right: 1.5em !important;border-radius: 3px 3px 0px 0px;padding: 0.5em 0.5em 0.4em !important;background-color: rgb(136, 136, 136);background-image: -moz-linear-gradient(center top , rgba(255, 255, 255, 0.25), rgba(0, 0, 0, 0.25));font-size: 1em;font-weight: 900;color: rgb(255, 255, 255);border-bottom: 1px solid rgb(102, 102, 102);margin: 0px !important;line-height: 1;font-family: inherit;text-rendering: optimizelegibility;\">" + dimensao.__cv_niceLabel + "</div><div>" + html + "</div></div>";
            $("#configuration-hierarchy-dimension-content").append(div_tag);
        }
    };
    GeradorOpcoes.prototype.geraHtmlHierarquia = function (hierarquia, nivel, identificadorDimensao, disabled) {
        var html = "";
        for(var atributoIndex in hierarquia) {
            var atributo = hierarquia[atributoIndex];
            var div_tag_filhos = this.geraHtmlHierarquia(atributo.__elements, nivel + 1, identificadorDimensao, disabled);
            var ativacao = "<div onclick=\"View_IndexAction_Visualization.prototype.onClickElementoAtivacao(this);\" class='cm-verde'></div>";
            var htmlAgregado = "";
            if(disabled) {
                htmlAgregado = "<input type='radio' id='sum-" + atributo.__cv_uri + "' name='" + atributo.__cv_uri + "' class='operacao " + identificadorDimensao + "' checked='checked'>Sum</input> <input type='radio' id='avg-" + atributo.__cv_uri + "' name='" + atributo.__cv_uri + "' class='operacao " + identificadorDimensao + "' value='avg'>Average</input>  <input type='radio' id='max-" + atributo.__cv_uri + "' name='" + atributo.__cv_uri + "' class='operacao " + identificadorDimensao + "' value='max'>Maximun</input> <input type='radio' id='min-" + atributo.__cv_uri + "' name='" + atributo.__cv_uri + "' class='operacao " + identificadorDimensao + "' value='min'>Minimun</input>";
            } else {
                htmlAgregado = "<input type='radio' disabled='true' id='sum-" + atributo.__cv_uri + "' name='" + atributo.__cv_uri + "' class='operacao " + identificadorDimensao + "' checked='checked'>Sum</input> <input type='radio' disabled='true' id='avg-" + atributo.__cv_uri + "' name='" + atributo.__cv_uri + "' class='operacao " + identificadorDimensao + "' value='avg'>Average</input>  <input type='radio' disabled='true' id='max-" + atributo.__cv_uri + "' name='" + atributo.__cv_uri + "' class='operacao " + identificadorDimensao + "' value='max'>Maximun</input> <input type='radio' disabled='true' id='min-" + atributo.__cv_uri + "' name='" + atributo.__cv_uri + "' class='operacao " + identificadorDimensao + "' value='min'>Minimun</input>";
            }
            htmlAgregado = "<div class='cm-agregacao'>" + htmlAgregado + "</div>";
            var agregacao = "<div style='float:right;height:20px;margin-top:-5px;'>" + htmlAgregado + "</div>";
            var div_tag = "<div style=\"background-color:rgb(249,249,249);width:92%;margin-left:4%;margin-top:15px;margin-bottom:15px;border: 1px solid rgb(102, 102, 102);border-radius: 4px 4px 4px 4px;\"><div class='cm-barra-verde'>" + ativacao + "<span style='cursor:pointer;' onclick=\"View_IndexAction_Visualization.prototype.onClickElemento(this);\" id=" + atributo.__cv_uri + ">" + atributo.__cv_niceLabel + "</span>" + agregacao + "</div><div class='cm-esconder'>" + div_tag_filhos + "</div></div>";
            html = html + div_tag;
        }
        return html;
    };
    GeradorOpcoes.prototype.renderDimensions = function () {
        var html = "<p style='font-weight:bold;margin-left:15px;margin-bottom:0px;'>Select the main dimension:</p>";
        var dimensoes = this.app._.data.components.dimensions;
        var checked = false;
        for(var dimensaoIndex in dimensoes) {
            var dimensao = dimensoes[dimensaoIndex];
            if(checked) {
                html += "<input type='radio' id='cm-dimensaoPrincipal' name='cm-dimensaoPrincipal' value='" + dimensao.__cv_uri + "' style='margin-left:20px;margin-right:5px;margin-top:-3px;' onclick=\"GeradorOpcoes.prototype.onClickAlteraPermissaoEdicaoOperacao(this);\">" + dimensao.__cv_niceLabel + "</input>";
            } else {
                html += "<input type='radio' id='cm-dimensaoPrincipal' name='cm-dimensaoPrincipal' checked='checked' value='" + dimensao.__cv_uri + "' style='margin-left:20px;margin-right:5px;margin-top:-3px;' onclick=\"GeradorOpcoes.prototype.onClickAlteraPermissaoEdicaoOperacao(this);\">" + dimensao.__cv_niceLabel + "</input>";
                checked = true;
            }
        }
        html += "";
        $("#configuration-menu-principal-dimension-content").html(html);
    };
    GeradorOpcoes.prototype.onClickAlteraPermissaoEdicaoOperacao = function (id) {
        var identificador = id.defaultValue;
        identificador = this.trataString(identificador);
        $.each($(".operacao").not("." + identificador + ""), function (index, value) {
            value.disabled = true;
        });
        $.each($("." + identificador + ""), function (index, value) {
            value.disabled = false;
        });
    };
    GeradorOpcoes.prototype.trataString = function (str) {
        str = this.replaceAll("/", "", str);
        str = this.replaceAll(":", "", str);
        str = this.replaceAll("[.]", "", str);
        return str;
    };
    GeradorOpcoes.prototype.replaceAll = function (find, replace, str) {
        return str.replace(new RegExp(find, 'g'), replace);
    };
    return GeradorOpcoes;
})(CubeViz_View_Abstract);
var View_IndexAction_Visualization = (function (_super) {
    __extends(View_IndexAction_Visualization, _super);
    function View_IndexAction_Visualization(attachedTo, app) {
        _super.call(this, "View_IndexAction_Visualization", attachedTo, app);
        this.habilitacao = new Habilitacao(attachedTo, app);
        this.geradorOpcoes = new GeradorOpcoes(attachedTo, app);
        this.novosElementos = [];
        this.propriedadeValor = this.app._.data.selectedComponents.measures[this.app._.data.selectedDSD["http://purl.org/linked-data/cube#component"]]["http://purl.org/linked-data/cube#measure"];
        this.base = this.app._.data.dataSets[0].__cv_uri;
        var partes = this.base.split("/");
        this.base = "";
        for(var index = 0; index < partes.length - 1; index++) {
            this.base = this.base + partes[index] + "/";
        }
        this.numObs = 0;
        var partes = this.propriedadeValor.split("/");
        var prefixo = "";
        for(var i = 0; i < partes.length - 1; i++) {
            prefixo = prefixo + partes[i] + "/";
        }
        var propriedades = {
        };
        propriedades[this.propriedadeValor] = true;
        for(var dimensaoIndex in this.app._.data.components.dimensions) {
            var dimensao = this.app._.data.components.dimensions[dimensaoIndex];
            propriedades[dimensao.__properties] = true;
        }
        for(var observacaoIndex in this.app._.backend.retrievedObservations) {
            var observacao = this.app._.backend.retrievedObservations[observacaoIndex];
            for(var linhaIndex in observacao) {
                var linha = observacao[linhaIndex];
                var n = linhaIndex.indexOf(prefixo);
                if(propriedades[linhaIndex] != true && n == 0) {
                    this.propriedadeUnidade = linhaIndex;
                }
            }
            break;
        }
        this.bindGlobalEvents([
            {
                name: "onChange_visualizationClass",
                handler: this.onChange_visualizationClass
            }, 
            {
                name: "onReRender_visualization",
                handler: this.onReRender_visualization
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_IndexAction_Visualization.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        return this;
    };
    View_IndexAction_Visualization.prototype.handleException = function (thrownException) {
        if(true === _.str.include(thrownException, "Highcharts error #10")) {
            $("#cubeviz-index-visualization").html($("#cubeviz-visualization-tpl-notificationHightchartsException10").html());
        }
        if(false === _.isUndefined(console) && false === _.isUndefined(console.log)) {
            console.log(thrownException);
        }
    };
    View_IndexAction_Visualization.prototype.initialize = function () {
        this.render(true);
    };
    View_IndexAction_Visualization.prototype.onChange_visualizationClass = function () {
        this.renderChart();
    };
    View_IndexAction_Visualization.prototype.onClick_nothingFoundNotificationLink = function (event) {
        $("#cubeviz-visualization-nothingFoundFurtherExplanation").slideDown("slow");
    };
    View_IndexAction_Visualization.prototype.onClick_updateHierarchy = function (event) {
        function achaElementoNaHierarquia(elementos, uri) {
            for(var elementoIndex in elementos) {
                var elemento = elementos[elementoIndex];
                if(elemento.__cv_uri == uri) {
                    getTodosFilhosUri(elemento.__elements);
                    return 1;
                }
                var res = achaElementoNaHierarquia(elemento.__elements, uri);
                if(res == 1) {
                    return 1;
                }
            }
        }
        function getTodosFilhosUri(elementos) {
            for(var elementoIndex in elementos) {
                var elemento = elementos[elementoIndex];
                atributosNaoMostrar[elemento.__cv_uri] = true;
                getTodosFilhosUri(elemento.__elements);
            }
            return null;
        }
        var dimensaoPrincipal = $("#cm-dimensaoPrincipal:checked")[0]["value"];
        var unidadeOperacao = $("#cm-unidade-op:checked")[0]["value"];
        var unidade = {
        };
        var array = $("#cm-unidade:checked");
        for(var arrayIndex in array) {
            if(!this.isNumber(arrayIndex)) {
                break;
            }
            unidade[array[arrayIndex]["value"]] = true;
        }
        var operadores = {
        };
        var atributosMostrar = [];
        var atributosNaoMostrar = {
        };
        this.habilitacao.zerar();
        var dimensoes = this.app._.data.components.dimensions;
        $.each($(".cm-agregacao"), function (index, value) {
            var uri = $(value).parent().parent().children()[1].id;
            for(var dimensaoIndex in dimensoes) {
                var dimensao = dimensoes[dimensaoIndex];
                var hierarquia = dimensao.hierarchy;
                achaElementoNaHierarquia(hierarquia, uri);
            }
        });
        $.each($(".cm-agregacao,.cm-agregacao-escondido"), function (index, value) {
            var uri = $(value).parent().parent().children()[1].id;
            if(!(uri in atributosNaoMostrar)) {
                atributosMostrar.push(uri);
            }
        });
        $.each($(".operacao:checked"), function (index, value) {
            var uri = value.id;
            var op = uri.substring(0, 3);
            uri = uri.substring(4);
            operadores[uri] = op;
        });
        var tmp = this.habilitacao.ativos;
        $.each($(".cm-verde"), function (index, value) {
            var uri = $(value).next()[0].id;
            tmp[uri] = true;
        });
        this.habilitacao.ativos = tmp;
        tmp = this.habilitacao.desativos;
        $.each($(".cm-vermelho"), function (index, value) {
            var uri = $(value).next()[0].id;
            tmp[uri] = true;
        });
        this.habilitacao.desativos = tmp;
        this.renderChartHierarchy(atributosMostrar, dimensaoPrincipal, operadores, unidade, unidadeOperacao);
    };
    View_IndexAction_Visualization.prototype.isNumber = function (value) {
        if((undefined === value) || (null === value)) {
            return false;
        }
        if(typeof value == 'number') {
            return true;
        }
        return !isNaN(value - 0);
    };
    View_IndexAction_Visualization.prototype.onReRender_visualization = function () {
        this.render(false);
    };
    View_IndexAction_Visualization.prototype.onStart_application = function () {
        this.initialize();
    };
    View_IndexAction_Visualization.prototype.render = function (printa) {
        if(printa) {
            this.geradorOpcoes.renderDimensions();
            this.geradorOpcoes.renderHierarchy();
            this.geradorOpcoes.renderUnits(this.propriedadeUnidade);
        }
        this.bindUserInterfaceEvents({
            "click #cubeviz-index-hierarchy-update": this.onClick_updateHierarchy
        });
        if(1 <= _.size(this.app._.backend.retrievedObservations)) {
            this.renderChart();
        } else {
            $("#cubeviz-index-visualization").html("").append($("#cubeviz-visualization-tpl-nothingFoundNotification").text());
            this.triggerGlobalEvent("onReceived_noData");
            this.setVisualizationHeight();
        }
        this.bindUserInterfaceEvents({
            "click #cubeviz-visualization-nothingFoundNotificationLink": this.onClick_nothingFoundNotificationLink
        });
        return this;
    };
    View_IndexAction_Visualization.prototype.onClickElementoListaHierarquia = function (id) {
        var clicked = null;
        var i = 0;
        while(true) {
            var localName = id.attributes[i].localName;
            if(localName == "uri") {
                clicked = id.attributes[i].nodeValue;
                break;
            }
            i++;
        }
        if(document.getElementById("filhos_" + clicked).className == "minimizado") {
            document.getElementById("filhos_" + clicked).className = "";
            document.getElementById(clicked).className = "nao_suprimido";
        } else {
            document.getElementById("filhos_" + clicked).className = "minimizado";
            document.getElementById(clicked).className = "suprimido";
        }
    };
    View_IndexAction_Visualization.prototype.onClickElemento = function (id) {
        if($(id).parent().next()[0].className == "cm-esconder") {
            $(id).parent().next()[0].className = "";
            $(id).next().children()[0].className = "cm-agregacao-escondido";
        } else {
            $(id).parent().next()[0].className = "cm-esconder";
            $(id).next().children()[0].className = "cm-agregacao";
        }
    };
    View_IndexAction_Visualization.prototype.onClickElementoListaHierarquiaHabilitacao = function (id) {
        if(id.className == "verde") {
            id.className = "vermelho";
        } else {
            if(id.className == "vermelho") {
                id.className = "verde";
            }
        }
    };
    View_IndexAction_Visualization.prototype.onClickElementoAtivacao = function (id) {
        if(id.className == "cm-verde") {
            id.className = "cm-vermelho";
            $(id).parent()[0].className = "cm-barra-vermelha";
        } else {
            if(id.className == "cm-vermelho") {
                id.className = "cm-verde";
                $(id).parent()[0].className = "cm-barra-verde";
            }
        }
    };
    View_IndexAction_Visualization.prototype.renderChartHierarchy = function (atributosShow, dimensaoPrincipal, operadores, unidade, unidadeOperacao) {
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.className, this.app._.backend.chartConfig[2].charts);
        var selectedMeasure = this.app._.data.selectedComponents.measures[_.keys(this.app._.data.selectedComponents.measures)[0]];
        var type = null;
        var visualizationSetting = null;

        if(true === _.isUndefined(fromChartConfig)) {
            this.app._.ui.visualization.className = this.app._.backend.chartConfig[2].charts[0].className;
            fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.className, this.app._.backend.chartConfig[2].charts);
        }
        visualizationSetting = CubeViz_Visualization_Controller.updateVisualizationSettings([], this.app._.ui.visualizationSettings[this.app._.ui.visualization.className], fromChartConfig.defaultConfig);
        type = CubeViz_Visualization_Controller.getVisualizationType(this.app._.ui.visualization.className);
        if(false === _.isUndefined(this.app._.generatedVisualization)) {
            try  {
                this.app._.generatedVisualization.destroy();
            } catch (ex) {
                if(false === _.isUndefined(console) && false === _.isUndefined(console.log)) {
                    console.log(ex);
                }
            }
        }
        var hC = new CubeViz_Visualization_HighCharts();
        var chart = hC.load(this.app._.ui.visualization.className);
        var dimensoes = this.getDimensoes();
        var dimensoesSecundarias = this.getDimensoesSecundarias(dimensaoPrincipal);
        var propriedades = this.getMapPropriedades();
        var atributos = this.getRetrievedAtributosViaveis(atributosShow);
        this.adicionaNovosAtributos(atributos, atributosShow);
        var observacoes = this.getObservacoes(propriedades, atributosShow, dimensaoPrincipal, dimensoesSecundarias, dimensoes, operadores, unidade, unidadeOperacao);
        this.organizaObservacoes(observacoes, propriedades[dimensaoPrincipal]);
        chart.init(visualizationSetting, observacoes, atributos, CubeViz_Visualization_Controller.getMultipleDimensions(this.app._.data.selectedComponents.dimensions), CubeViz_Visualization_Controller.getOneElementDimensions(this.app._.data.selectedComponents.dimensions), selectedMeasure["http://purl.org/linked-data/cube#measure"], dimensaoPrincipal);
        try  {
            this.setVisualizationHeight(_.size(chart.getRenderResult().xAxis.categories));
            this.app._.generatedVisualization = new Highcharts.Chart(chart.getRenderResult());
        } catch (ex) {
            this.handleException(ex);
        }
    };
    View_IndexAction_Visualization.prototype.organizaObservacoes = function (observacoes, sort) {
        observacoes.sort(function (a, b) {
            var as = a[sort];
            var bs = b[sort];
            if(as < bs) {
                return -1;
            }
            return 1;
        });
    };
    View_IndexAction_Visualization.prototype.getObservacoes = function (propriedades, atributosShow, dimensaoPrincipal, dimensoesSecundarias, dimensoes, operadores, unidade, unidadeOperacao) {
        var observationsAll = this.app._.backend.retrievedObservations;
        var observationsMap = {
        };
        for(var observationIndex in observationsAll) {
            var observationOriginal = observationsAll[observationIndex];
            var observation = jQuery.extend({
            }, observationOriginal);
            var chave = "";
            for(var dimensaoIndex in dimensoes) {
                var dimensao = dimensoes[dimensaoIndex];
                chave = chave + observation[propriedades[dimensao]] + "&";
            }
            if(observationsMap[chave] == null) {
                if(unidade[observation[this.propriedadeUnidade]] == true) {
                    observationsMap[chave] = observation;
                }
            } else {
                if(unidade[observation[this.propriedadeUnidade]] == true) {
                    var observationTmp = observationsMap[chave];
                    observationTmp[this.propriedadeUnidade] = observationTmp[this.propriedadeUnidade] + " " + observation[this.propriedadeUnidade];
                    if(unidadeOperacao == "sum" || unidadeOperacao == "avg") {
                        observationTmp[this.propriedadeValor] = parseInt(observationTmp[this.propriedadeValor]) + parseInt(observation[this.propriedadeValor]);
                    } else {
                        if(unidadeOperacao == "max") {
                            observationTmp[this.propriedadeValor] = Math.max(parseInt(observationTmp[this.propriedadeValor]), parseInt(observation[this.propriedadeValor]));
                        } else {
                            if(unidadeOperacao == "min") {
                                observationTmp[this.propriedadeValor] = Math.min(parseInt(observationTmp[this.propriedadeValor]), parseInt(observation[this.propriedadeValor]));
                            }
                        }
                    }
                    observationsMap[chave] = observationTmp;
                }
            }
        }
        var countAvg = 0;
        if(unidadeOperacao == "avg") {
            for(var unidadeIndex in unidade) {
                countAvg++;
            }
        }
        var observations = [];
        for(var observationIndex in observationsMap) {
            var observation = observationsMap[observationIndex];
            if(unidadeOperacao == "avg") {
                observation[this.propriedadeValor] = observation[this.propriedadeValor] / countAvg;
            }
            observations.push(observation);
        }
        for(var dimensaoSecundariaIndex in dimensoesSecundarias) {
            var dimensaoSecundaria = dimensoesSecundarias[dimensaoSecundariaIndex];
            var atributosShowDimensao = [];
            for(var atributoShowIndex in atributosShow) {
                var atributoShow = atributosShow[atributoShowIndex];
                var elementoHierarquia = this.achaElementoNaHierarquia(atributoShow);
                if(elementoHierarquia.__cv_properties == propriedades[dimensaoSecundaria]) {
                    atributosShowDimensao.push(atributoShow);
                }
            }
            var atributosMostrar = this.atributosMostrarDentroAtributosShow(atributosShowDimensao);
            observations = this.agregaObservacoesDaDimensaoSecundaria(dimensaoSecundaria, propriedades, atributosMostrar, observations, dimensoes);
        }
        var atributosShowDimensao = [];
        for(var atributoShowIndex in atributosShow) {
            var atributoShow = atributosShow[atributoShowIndex];
            var elementoHierarquia = this.achaElementoNaHierarquia(atributoShow);
            if(elementoHierarquia.__cv_properties == propriedades[dimensaoPrincipal]) {
                atributosShowDimensao.push(atributoShow);
            }
        }
        var atributosMostrar = this.atributosMostrarDentroAtributosShow(atributosShowDimensao);
        observations = this.agregaObservacoesDaDimensaoPrincipal(dimensaoPrincipal, dimensoes, propriedades, atributosMostrar, observations, operadores);
        return observations;
    };
    View_IndexAction_Visualization.prototype.atributosMostrarDentroAtributosShow = function (atributosShow) {
        var atributosMostrar = [];
        for(var atributoShowIndex in atributosShow) {
            var atributoShow = atributosShow[atributoShowIndex];
            var elementoHierarquia = this.achaElementoNaHierarquia(atributoShow);
            var temAbaixo = false;
            while(true) {
                var countFilhos = 0;
                for(var filhoIndex in elementoHierarquia.__elements) {
                    countFilhos++;
                }
                if(countFilhos > 0) {
                    elementoHierarquia = elementoHierarquia.__elements[0];
                }
                if(countFilhos == 0) {
                    break;
                }
                for(var atributoShowIndex2 in atributosShow) {
                    var atributoShow2 = atributosShow[atributoShowIndex2];
                    if(atributoShow2 == elementoHierarquia.__cv_uri) {
                        temAbaixo = true;
                    }
                }
            }
            if(temAbaixo == false) {
                atributosMostrar.push(atributoShow);
            }
        }
        return atributosMostrar;
    };
    View_IndexAction_Visualization.prototype.agregaObservacoesDaDimensaoPrincipal = function (dimensaoPrincipal, dimensoes, propriedades, atributosMostrar, observations, operadores) {
        var observacoesRetornar = [];
        var observacoesSobraram = [];
        var propriedadeDimensaoPrincipal = propriedades[dimensaoPrincipal];
        for(var observationIndex in observations) {
            var observation = observations[observationIndex];
            var estaEmAtributosMostrar = false;
            for(var atributoMostrarIndex in atributosMostrar) {
                var atributoMostrar = atributosMostrar[atributoMostrarIndex];
                if(observation[propriedadeDimensaoPrincipal] == atributoMostrar) {
                    estaEmAtributosMostrar = true;
                    break;
                }
            }
            if(estaEmAtributosMostrar) {
                if(this.habilitacao.isObservacaoAtivo(observation, propriedades, dimensoes)) {
                    observation.__cv_uri = this.base + "observacao_" + (this.numObs++);
                    observacoesRetornar.push(observation);
                }
            } else {
                observacoesSobraram.push(observation);
            }
        }
        observacoesRetornar = observacoesRetornar.concat(this.adicionaObservacoesAgregadasDaDimensaoPrincipal(observacoesSobraram, atributosMostrar, dimensaoPrincipal, dimensoes, propriedades, operadores));
        return observacoesRetornar;
    };
    View_IndexAction_Visualization.prototype.agregaObservacoesDaDimensaoSecundaria = function (dimensaoSecundaria, propriedades, atributosMostrar, observations, dimensoes) {
        var observacoesRetornar = [];
        var observacoesSobraram = [];
        var propriedadeDimensaoSecundaria = propriedades[dimensaoSecundaria];
        for(var observationIndex in observations) {
            var observation = observations[observationIndex];
            var estaEmAtributosMostrar = false;
            for(var atributoMostrarIndex in atributosMostrar) {
                var atributoMostrar = atributosMostrar[atributoMostrarIndex];
                if(observation[propriedadeDimensaoSecundaria] == atributoMostrar) {
                    estaEmAtributosMostrar = true;
                    break;
                }
            }
            if(estaEmAtributosMostrar) {
                if(this.habilitacao.isObservacaoAtivo(observation, propriedades, dimensoes)) {
                    observation.__cv_uri = this.base + "observacao_" + (this.numObs++);
                    observacoesRetornar.push(observation);
                }
            } else {
                observacoesSobraram.push(observation);
            }
        }
        observacoesRetornar = observacoesRetornar.concat(this.adicionaObservacoesAgregadas(observacoesSobraram, atributosMostrar, dimensaoSecundaria, propriedades));
        return observacoesRetornar;
    };
    View_IndexAction_Visualization.prototype.adicionaObservacoesAgregadas = function (observacoes, atributosMostrar, dimensaoSecundaria, propriedades) {
        var novasObservacoes = [];
        var dimensoes = this.getDimensoes();
        var formadoresId = [];
        var grupos = {
        };
        for(var dimensaoIndex in dimensoes) {
            var dimensao = dimensoes[dimensaoIndex];
            if(dimensao != dimensaoSecundaria) {
                formadoresId.push(propriedades[dimensao]);
            }
        }
        for(var observacaoIndex in observacoes) {
            var observacao = observacoes[observacaoIndex];
            var id = "";
            for(var formadorIdIndex in formadoresId) {
                var formadorId = formadoresId[formadorIdIndex];
                id = id + "##" + observacao[formadorId];
            }
            if(id in grupos) {
                var array = grupos[id];
                array.push(observacao);
                grupos[id] = array;
            } else {
                var array = [];
                array.push(observacao);
                grupos[id] = array;
            }
        }
        for(var grupoIndex in grupos) {
            var grupo = grupos[grupoIndex];
            for(var atributoMostrarIndex in atributosMostrar) {
                var atributoMostrar = atributosMostrar[atributoMostrarIndex];
                var elementoHierarquia = this.achaElementoNaHierarquia(atributoMostrar);
                var valor = this.percorreHierarquiaDimensaoSecundaria(elementoHierarquia, grupo);
                if(valor != undefined) {
                    var el = jQuery.extend({
                    }, grupo[0]);
                    el[elementoHierarquia.__cv_properties] = elementoHierarquia.__cv_uri;
                    if(this.habilitacao.isObservacaoAtivo(el, propriedades, dimensoes)) {
                        el[this.propriedadeValor] = valor;
                        el["__cv_niceLabel"] = "label desatualizada";
                        el["__cv_uri"] = this.base + "observacao_" + (this.numObs++);
                        novasObservacoes.push(el);
                    }
                }
            }
        }
        return novasObservacoes;
    };
    View_IndexAction_Visualization.prototype.adicionaObservacoesAgregadasDaDimensaoPrincipal = function (observacoes, atributosMostrar, dimensaoPrincipal, dimensoes, propriedades, operadores) {
        var novasObservacoes = [];
        var dimensoes = this.getDimensoes();
        var formadoresId = [];
        var grupos = {
        };
        for(var dimensaoIndex in dimensoes) {
            var dimensao = dimensoes[dimensaoIndex];
            if(dimensao != dimensaoPrincipal) {
                formadoresId.push(propriedades[dimensao]);
            }
        }
        for(var observacaoIndex in observacoes) {
            var observacao = observacoes[observacaoIndex];
            var id = "";
            for(var formadorIdIndex in formadoresId) {
                var formadorId = formadoresId[formadorIdIndex];
                id = id + "##" + observacao[formadorId];
            }
            if(id in grupos) {
                var array = grupos[id];
                array.push(observacao);
                grupos[id] = array;
            } else {
                var array = [];
                array.push(observacao);
                grupos[id] = array;
            }
        }
        for(var grupoIndex in grupos) {
            var grupo = grupos[grupoIndex];
            for(var atributoMostrarIndex in atributosMostrar) {
                var atributoMostrar = atributosMostrar[atributoMostrarIndex];
                var elementoHierarquia = this.achaElementoNaHierarquia(atributoMostrar);
                var valor = this.percorreHierarquiaDimensaoPrincipal(elementoHierarquia, grupo, operadores);
                if(valor != undefined) {
                    var el = jQuery.extend({
                    }, grupo[0]);
                    el[elementoHierarquia.__cv_properties] = elementoHierarquia.__cv_uri;
                    if(this.habilitacao.isObservacaoAtivo(el, propriedades, dimensoes)) {
                        el[this.propriedadeValor] = valor;
                        el["__cv_niceLabel"] = "label desatualizada";
                        el["__cv_uri"] = this.base + "observacao_" + (this.numObs++);
                        novasObservacoes.push(el);
                    }
                }
            }
        }
        return novasObservacoes;
    };
    View_IndexAction_Visualization.prototype.operacao = function (valorAtual, operando, operacao) {
        if(operacao == "sum") {
            return valorAtual + operando;
        }
        if(operacao == "max") {
            return Math.max(valorAtual, operando);
        }
        if(operacao == "avg") {
            return valorAtual + operando;
        }
        if(operacao == "min") {
            return Math.min(valorAtual, operando);
        }
    };
    View_IndexAction_Visualization.prototype.getValorInicial = function (operacao) {
        if(operacao == "sum") {
            return 0;
        }
        if(operacao == "max") {
            return -1;
        }
        if(operacao == "avg") {
            return 0;
        }
        if(operacao == "min") {
            return 99999;
        }
    };
    View_IndexAction_Visualization.prototype.percorreHierarquiaDimensaoSecundaria = function (elementoHierarquia, grupo) {
        var entrou = false;
        var soma = 0;
        for(var filhoIndex in elementoHierarquia.__elements) {
            entrou = true;
            var filho = elementoHierarquia.__elements[filhoIndex];
            var tmp = this.percorreHierarquiaDimensaoSecundaria(filho, grupo);
            if(tmp != undefined) {
                soma = soma + parseInt(tmp);
            }
        }
        if(!entrou) {
            if(!this.habilitacao.isDesativo(elementoHierarquia.__cv_uri)) {
                elementoHierarquia = this.achaElementoNaHierarquia(elementoHierarquia.__cv_uri);
                for(var elementoIndex in grupo) {
                    var elemento = grupo[elementoIndex];
                    if(elemento[elementoHierarquia.__cv_properties] == elementoHierarquia.__cv_uri) {
                        return elemento[this.propriedadeValor];
                    }
                }
            } else {
                return undefined;
            }
        }
        if(entrou) {
            if(!this.habilitacao.isDesativo(elementoHierarquia.__cv_uri)) {
                return soma;
            } else {
                return undefined;
            }
        }
    };
    View_IndexAction_Visualization.prototype.percorreHierarquiaDimensaoPrincipal = function (elementoHierarquia, grupo, operadores) {
        var entrou = false;
        var res = this.getValorInicial(operadores[elementoHierarquia.__cv_uri]);
        var count = 0;
        for(var filhoIndex in elementoHierarquia.__elements) {
            entrou = true;
            var filho = elementoHierarquia.__elements[filhoIndex];
            var tmp = this.percorreHierarquiaDimensaoPrincipal(filho, grupo, operadores);
            if(tmp != undefined) {
                res = this.operacao(res, parseInt(tmp), operadores[elementoHierarquia.__cv_uri]);
                count++;
            }
        }
        if(operadores[elementoHierarquia.__cv_uri] == "avg") {
            res = (res * 1) / (count * 1);
        }
        if(!entrou) {
            if(!this.habilitacao.isDesativo(elementoHierarquia.__cv_uri)) {
                elementoHierarquia = this.achaElementoNaHierarquia(elementoHierarquia.__cv_uri);
                for(var elementoIndex in grupo) {
                    var elemento = grupo[elementoIndex];
                    if(elemento[elementoHierarquia.__cv_properties] == elementoHierarquia.__cv_uri) {
                        return elemento[this.propriedadeValor];
                    }
                }
            } else {
                return undefined;
            }
        }
        if(entrou) {
            if(!this.habilitacao.isDesativo(elementoHierarquia.__cv_uri)) {
                return res;
            } else {
                return undefined;
            }
        }
    };
    View_IndexAction_Visualization.prototype.adicionaNovosAtributos = function (atributos, atributosShow) {
        this.novosElementos = [];
        var dimensoesHierarquia = this.app._.data.components.dimensions;
        for(var dimensaoHierarquiaIndex in dimensoesHierarquia) {
            var dimensaoHierarquia = dimensoesHierarquia[dimensaoHierarquiaIndex];
            for(var atributoIndex in atributos) {
                var atributo = atributos[atributoIndex];
                if(dimensaoHierarquia.__cv_uri == atributo.__cv_uri) {
                    this.adicionaNovosElementos(dimensaoHierarquia.hierarchy, atributo, atributosShow);
                }
            }
        }
    };
    View_IndexAction_Visualization.prototype.getRetrievedAtributosViaveis = function (atributosShow) {
        var dimensoes = this.app._.data.selectedComponents.dimensions;
        for(var dimensaoIndex in dimensoes) {
            var dimensao = dimensoes[dimensaoIndex];
            var elementos = dimensao.__cv_elements;
            var novosElementos = [];
            for(var elementoIndex in elementos) {
                var elemento = elementos[elementoIndex];
                for(var atributosIndex in atributosShow) {
                    if(atributosShow[atributosIndex] == elemento.__cv_uri) {
                        novosElementos.push(elemento);
                    }
                }
            }
            dimensao.__cv_elements = novosElementos;
        }
        return dimensoes;
    };
    View_IndexAction_Visualization.prototype.getMapPropriedades = function () {
        var propriedades = {
        };
        for(var dimensaoIndex in this.app._.data.components.dimensions) {
            var dimensao = this.app._.data.components.dimensions[dimensaoIndex];
            propriedades[dimensao.__cv_uri] = dimensao.__properties;
        }
        return propriedades;
    };
    View_IndexAction_Visualization.prototype.adicionaNovosElementos = function (dimensaoHierarquia, dimensao, atributosShow) {
        var mostrar = false;
        var entrou = false;
        for(var atributosIndex in dimensaoHierarquia) {
            entrou = true;
            var atributo = dimensaoHierarquia[atributosIndex];
            for(var atributoShowIndex in atributosShow) {
                var temMostrar = atributosShow[atributoShowIndex];
                if(atributo.__cv_uri == temMostrar) {
                    mostrar = true;
                }
            }
            var tmp = this.adicionaNovosElementos(atributo.__elements, dimensao, atributosShow);
            var temFilhos = false;
            for(var filhoIndex in atributo.__elements) {
                temFilhos = true;
                break;
            }
            var jaTem = false;
            for(var elementoIndex in dimensao.__cv_elements) {
                var elemento = dimensao.__cv_elements[elementoIndex];
                if(elemento.__cv_uri == atributo.__cv_uri) {
                    jaTem = true;
                }
            }
            if(tmp != true && mostrar && (temFilhos || !jaTem)) {
                var novoElemento = {
                };
                this.novosElementos.push(atributo.__cv_uri);
                novoElemento = this.achaElementoNaHierarquia(atributo.__cv_uri);
                dimensao.__cv_elements.push(novoElemento);
            }
        }
        if(!entrou) {
            return null;
        }
        return mostrar;
    };
    View_IndexAction_Visualization.prototype.getDimensoesSecundarias = function (dimensaoPrincipal) {
        var dimensoes = [];
        for(var dimensionIndex in this.app._.data.components.dimensions) {
            var dimension = this.app._.data.components.dimensions[dimensionIndex];
            if(dimension.__cv_uri != dimensaoPrincipal) {
                dimensoes.push(dimension.__cv_uri);
            }
        }
        return dimensoes;
    };
    View_IndexAction_Visualization.prototype.getDimensoes = function () {
        var dimensoes = [];
        for(var dimensionIndex in this.app._.data.components.dimensions) {
            var dimension = this.app._.data.components.dimensions[dimensionIndex];
            dimensoes.push(dimension.__cv_uri);
        }
        return dimensoes;
    };
    View_IndexAction_Visualization.prototype.achaElementoNaHierarquia = function (atributoUri) {
        var dimensoes = this.app._.data.components.dimensions;
        for(var dimensaoIndex in dimensoes) {
            var dimensao = dimensoes[dimensaoIndex];
            for(var elementoIndex in dimensao.hierarchy) {
                var elemento = dimensao.hierarchy[elementoIndex];
                var res = this.achaElementoPercorrendoNaHierarquia(atributoUri, elemento);
                if(res != null) {
                    res.__cv_dimensao_uri = dimensao.__cv_uri;
                    res.__cv_properties = dimensao.__properties;
                    return res;
                }
            }
        }
    };
    View_IndexAction_Visualization.prototype.achaElementoPercorrendoNaHierarquia = function (atributoUri, elemento) {
        if(elemento.__cv_uri == atributoUri) {
            return elemento;
        }
        for(var elementoIndex in elemento.__elements) {
            var elementoFilho = elemento.__elements[elementoIndex];
            var res = this.achaElementoPercorrendoNaHierarquia(atributoUri, elementoFilho);
            if(res != null) {
                return res;
            }
        }
        return null;
    };
    View_IndexAction_Visualization.prototype.renderChart = function () {
        this.onClick_updateHierarchy(null);
    };
    View_IndexAction_Visualization.prototype.setVisualizationHeight = function (numberOfYAxisElements) {
        if (typeof numberOfYAxisElements === "undefined") { numberOfYAxisElements = 0; }
        var offset = $(this.attachedTo).offset();
        var minHeight = $(window).height() - offset.top - 95;
        var tmp = 0;

        if(0 < numberOfYAxisElements) {
            tmp = numberOfYAxisElements * 40;
            if(tmp > minHeight) {
                minHeight = tmp;
            }
        }
        $(this.attachedTo).css("height", minHeight);
    };
    View_IndexAction_Visualization.prototype.trataString = function (str) {
        str = this.replaceAll("/", "", str);
        str = this.replaceAll(":", "", str);
        str = this.replaceAll("[.]", "", str);
        return str;
    };
    View_IndexAction_Visualization.prototype.replaceAll = function (find, replace, str) {
        return str.replace(new RegExp(find, 'g'), replace);
    };
    return View_IndexAction_Visualization;
})(CubeViz_View_Abstract);
var View_IndexAction_VisualizationSelector = (function (_super) {
    __extends(View_IndexAction_VisualizationSelector, _super);
    function View_IndexAction_VisualizationSelector(attachedTo, app) {
        _super.call(this, "View_IndexAction_VisualizationSelector", attachedTo, app);
        this.bindGlobalEvents([
            {
                name: "onClick_setupComponentOpener",
                handler: this.onClick_setupComponentOpener
            }, 
            {
                name: "onReceived_noData",
                handler: this.onReceived_noData
            }, 
            {
                name: "onReRender_visualization",
                handler: this.onReRender_visualization
            }, 
            {
                name: "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    View_IndexAction_VisualizationSelector.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        $("#cubeviz-visualizationselector-selector").empty();
        this.hideDongle();
        this.hideMenu();
        return this;
    };
    View_IndexAction_VisualizationSelector.prototype.hideDongle = function () {
        $("#cubeviz-visualizationselector-menuDongleDiv").fadeOut("slow");
        return this;
    };
    View_IndexAction_VisualizationSelector.prototype.hideMenu = function () {
        this.triggerGlobalEvent("onBeforeHide_visualizationSelectorMenu");
        $("#cubeviz-visualizationselector-menu").fadeOut("slow");
        $("#cubeviz-visualizationselector-menuItems").html("");
        this.triggerGlobalEvent("onAfterHide_visualizationSelectorMenu");
        return this;
    };
    View_IndexAction_VisualizationSelector.prototype.initialize = function () {
        this.render();
    };
    View_IndexAction_VisualizationSelector.prototype.onClick_setupComponentOpener = function () {
        this.hideMenu();
    };
    View_IndexAction_VisualizationSelector.prototype.onClick_closeMenu = function () {
        this.hideMenu();
    };
    View_IndexAction_VisualizationSelector.prototype.onClick_selectorItem = function (event) {
        this.triggerGlobalEvent("onBeforeClick_selectorItem");
        var prevClass = "";
        var selectorItemDiv = null;
        var self = this;

        if(true === _.isUndefined($(event.target).data("class"))) {
            selectorItemDiv = $($(event.target).parent());
            this.app._.ui.visualization.className = selectorItemDiv.data("class");
        } else {
            selectorItemDiv = $(event.target);
            this.app._.ui.visualization.className = selectorItemDiv.data("class");
        }
        prevClass = $($(".cubeviz-visualizationselector-selectedSelectorItem").get(0)).data("class");
        this.hideDongle();
        if(prevClass == this.app._.ui.visualization.className) {
            this.showMenu(selectorItemDiv);
        } else {
            this.hideMenu();
            $(".cubeviz-visualizationselector-selectedSelectorItem").removeClass("cubeviz-visualizationselector-selectedSelectorItem").addClass("cubeviz-visualizationselector-selectorItem");
            selectorItemDiv.removeClass("cubeviz-visualizationselector-selectorItem").addClass("cubeviz-visualizationselector-selectedSelectorItem");
            this.showMenuDongle(selectorItemDiv);
            this.triggerGlobalEvent("onChange_visualizationClass");
            CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.ui, "ui", function (updatedUiHash) {
                self.app._.backend.uiHash = updatedUiHash;
            });
        }
        this.triggerGlobalEvent("onAfterClick_selectorItem");
    };
    View_IndexAction_VisualizationSelector.prototype.onClick_updateVisz = function () {
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.className, this.app._.backend.chartConfig[2].charts);
        var self = this;

        this.app._.ui.visualizationSettings[this.app._.ui.visualization.className] = CubeViz_Visualization_Controller.updateVisualizationSettings($(".cubeviz-visualizationselector-menuItemValue"), this.app._.ui.visualizationSettings[this.app._.ui.visualization.className], fromChartConfig.defaultConfig);
        CubeViz_ConfigurationLink.save(this.app._.backend.url, this.app._.ui, "ui", function (updatedUiHash) {
            self.app._.backend.uiHash = updatedUiHash;
        });
        this.triggerGlobalEvent("onReRender_visualization");
    };
    View_IndexAction_VisualizationSelector.prototype.onReceived_noData = function () {
        this.hideDongle();
    };
    View_IndexAction_VisualizationSelector.prototype.onReRender_visualization = function () {
        this.destroy();
        if(0 < _.size(this.app._.backend.retrievedObservations)) {
            this.initialize();
        }
    };
    View_IndexAction_VisualizationSelector.prototype.onStart_application = function () {
        if(0 < _.size(this.app._.backend.retrievedObservations)) {
            this.initialize();
        }
    };
    View_IndexAction_VisualizationSelector.prototype.render = function () {
        this.triggerGlobalEvent("onBeforeRender_visualizationSelector");
        var numberOfMultDims = 2;
        var charts = this.app._.backend.chartConfig[numberOfMultDims].charts;
        var firstViszItem;
        var self = this;
        var viszItem;

        this.hideDongle();
        _.each(charts, function (chartObject) {
            viszItem = $(CubeViz_View_Helper.tplReplace($("#cubeviz-visualizationselector-tpl-selectorItem").html()));
            $(viszItem.find(".cubeviz-icon-small").first()).attr("src", self.app._.backend.imagesPath + chartObject.icon);
            viszItem.data("class", chartObject.className);
            viszItem.off("click");
            viszItem.on("click", $.proxy(self.onClick_selectorItem, self));
            if(self.app._.ui.visualization.className == chartObject.className) {
                viszItem.addClass("cubeviz-visualizationselector-selectedSelectorItem").removeClass("cubeviz-visualizationselector-selectorItem");
            }
            $("#cubeviz-visualizationselector-selector").append(viszItem);
        });
        this.showMenuDongle($($("#cubeviz-visualizationselector-selector").find(".cubeviz-visualizationselector-selectedSelectorItem").first()));
        this.bindUserInterfaceEvents({
        });
        this.triggerGlobalEvent("onAfterRender_visualizationSelector");
        return this;
    };
    View_IndexAction_VisualizationSelector.prototype.showMenu = function (selectorItemDiv) {
        this.triggerGlobalEvent("onBeforeShow_visualizationSelectorMenu");
        var alreadySetSelected = false;
        var defaultValue = "";
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.className, this.app._.backend.chartConfig[2].charts);
        var menuItem;
        var menuItemsHtml = $("#cubeviz-visualizationselector-menuItems").html();
        var position = selectorItemDiv.position();
        var selectBox;
        var shortCutViszSettings = this.app._.ui.visualizationSettings[this.app._.ui.visualization.className];
        var valueOption;

        if(false === _.isUndefined(fromChartConfig.options) && 0 < _.size(fromChartConfig.options) && ("" == menuItemsHtml || null == menuItemsHtml)) {
            _.each(fromChartConfig.options, function (option) {
                if(option.label != "Switching axes") {
                    alreadySetSelected = false;
                    menuItem = $(CubeViz_View_Helper.tplReplace($("#cubeviz-visualizationselector-tpl-menuItem").html(), option));
                    selectBox = $(menuItem.find(".cubeviz-visualizationselector-menuSelectbox").get(0));
                    defaultValue = CubeViz_Visualization_Controller.getObjectValueByKeyString(option.key, shortCutViszSettings);
                    valueOption = $("<option/>");
                    selectBox.data("key", option.key);
                    if(false == _.isUndefined(defaultValue)) {
                        _.each(option.values, function (value) {
                            value.value = value.value.toString();
                            if(defaultValue.toString() == value.value && false == alreadySetSelected) {
                                valueOption = $("<option/>");
                                valueOption.text(value.label).val(value.value).attr("selected", "selected");
                                selectBox.append(valueOption);
                                alreadySetSelected = true;
                            }
                        });
                    }
                    _.each(option.values, function (value) {
                        value.value = value.value.toString();
                        if(false == _.isUndefined(defaultValue) && defaultValue.toString() == value.value) {
                            return;
                        }
                        valueOption = $("<option/>");
                        valueOption.text(value.label).val(value.value);
                        if(false === alreadySetSelected && false === _.isUndefined(value.isDefault) && true === value.isDefault) {
                            valueOption.attr("selected", "selected");
                            alreadySetSelected = true;
                        }
                        selectBox.append(valueOption);
                    });
                    $("#cubeviz-visualizationselector-menuItems").append(menuItem);
                }
            });
            $("#cubeviz-visualizationselector-closeMenu").off("click");
            $("#cubeviz-visualizationselector-closeMenu").on("click", $.proxy(this.onClick_closeMenu, this));
            $("#cubeviz-visualizationselector-updateVisz").off("click");
            $("#cubeviz-visualizationselector-updateVisz").on("click", $.proxy(this.onClick_updateVisz, this));
            $("#cubeviz-visualizationselector-menu").css("top", position.top + 37).css("left", position.left - 192).fadeIn("slow");
        }
        this.triggerGlobalEvent("onAfterShow_visualizationSelectorMenu");
    };
    View_IndexAction_VisualizationSelector.prototype.showMenuDongle = function (selectorItemDiv) {
        var charts = this.app._.backend.chartConfig[2].charts;
        var fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass(this.app._.ui.visualization.className, charts);

        if(false === _.isUndefined(fromChartConfig.options) && 0 < _.size(fromChartConfig.options)) {
            var position = selectorItemDiv.position();
            $("#cubeviz-visualizationselector-menuDongleDiv").css("top", position.top + 25).css("left", position.left + 14).fadeIn("slow");
        }
    };
    return View_IndexAction_VisualizationSelector;
})(CubeViz_View_Abstract);
var cubeVizApp = new CubeViz_View_Application();
$(document).ready(function () {
    if("development" == cubeVizApp._.backend.context) {
        console.log("cubeVizApp._:");
        console.log(cubeVizApp._);
    }
    cubeVizApp.triggerEvent("onStart_application");
});
