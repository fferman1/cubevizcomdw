/**
 * Test if hasDialog was correct set
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var div = $("<div></div>"),
            hasDialog = div.data("hasDialog");
        
        this.assertTrue( true !== hasDialog, "true !== " + hasDialog );
        
        /**
         * check after attaching dialog
         */
        CubeViz_View_Helper.attachDialogTo(div);
        
        hasDialog = div.data("hasDialog");
        
        this.assertTrue( true === hasDialog, "true === " + hasDialog );
        
        /**
         * check again after open dialog
         */        
        CubeViz_View_Helper.openDialog(div);       
        hasDialog = div.data("hasDialog");
        this.assertTrue( true === hasDialog, "true === " + hasDialog );
        
        /**
         * check again after closing dialog
         */
        CubeViz_View_Helper.closeDialog(div);        
        hasDialog = div.data("hasDialog");
        this.assertTrue( true === hasDialog, "true === " + hasDialog );
        
        /**
         * check again after closing dialog
         */
        CubeViz_View_Helper.destroyDialog(div);
        hasDialog = div.data("hasDialog");
        this.assertTrue( true === hasDialog, "true === " + hasDialog );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onStart_application", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test if isDialogOpen was correct set
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var div = $("<div></div>");
        
        /**
         * check after attaching dialog
         */
        CubeViz_View_Helper.attachDialogTo(div);
        
        var isDialogOpen = div.data("isDialogOpen");        
        
        this.assertTrue( true !== isDialogOpen, "false === " + isDialogOpen );
        
        /**
         * check again after opening dialog
         */
        CubeViz_View_Helper.openDialog(div);
        var isDialogOpen = div.data("isDialogOpen");        
        this.assertTrue( true === isDialogOpen, "true === " + isDialogOpen );
        
        /**
         * check again after closing dialog
         */
        CubeViz_View_Helper.closeDialog(div);        
        isDialogOpen = div.data("isDialogOpen");
        this.assertTrue( false === isDialogOpen, "false === " + isDialogOpen );
        
        /**
         * check again after closing dialog
         */
        CubeViz_View_Helper.destroyDialog(div);
        isDialogOpen = div.data("isDialogOpen");
        this.assertTrue( false === isDialogOpen, "false === " + isDialogOpen );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onStart_application", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test fixed overlay
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var div = $("<div></div>");
        
        CubeViz_View_Helper.attachDialogTo(div);
        CubeViz_View_Helper.openDialog(div);
        
        var currentOverlayHeight = $(".ui-widget-overlay").css("height"),
            doubleScreenHeight = (2 * screen.height) + "px";
        
        this.assertTrue( 
            currentOverlayHeight === doubleScreenHeight,
            currentOverlayHeight + " === " + doubleScreenHeight
        );
        
        CubeViz_View_Helper.closeDialog(div);
        CubeViz_View_Helper.destroyDialog(div);
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onStart_application", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test sorting function: sortLiItemsByAlphabet by using exisiting list of 
 * dimension elements in setup component elements dialog.
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var givenComponentDimensionKeys = _.keys(cubeVizApp._.data.components.dimensions),
            firstComponentHashedUrl = givenComponentDimensionKeys[0],
            firstComponent = cubeVizApp._.data.components.dimensions[firstComponentHashedUrl],
            setupComponentDialogId = "#cubeviz-component-setupComponentDialog-" + 
                                      givenComponentDimensionKeys[0],
            listDOMElement = $(setupComponentDialogId).find(".cubeviz-component-setupComponentElements").first(),
            
            originalList = $(listDOMElement).children("li").get(),
            originalListStrings:string[] = [],
            
            generatedList:any[] = [],
            generatedListStrings:string[] = [];
       
        /**
         * By helper class
         * Sort list items by alphabet, and create a list only containing strings.
         */
        generatedList = CubeViz_View_Helper.sortLiItemsByAlphabet(originalList);
        _.each(generatedList, function(item){
            generatedListStrings.push($($(item).children().last()).html());
        });
        
        /**
         * By itself
         * Sort list items by alphabet, and create a list only containing strings.
         */
        originalList.sort(function(a, b) {
            a = $(a).text().toUpperCase();
            b = $(b).text().toUpperCase();
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        });
        _.each(originalList, function(item){
            originalListStrings.push($($(item).children().last()).html());
        });
        
        // test if both string lists are the same
        this.assertTrue(
            true === _.isEqual(generatedListStrings, originalListStrings)
        );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_component", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test sorting function: sortLiItemsByAlphabet by using own small list
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var unorderedList = [
                $("<li>c</li>"), $("<li>a</li>"), $("<li>b</li>")
            ],
            orderedList = CubeViz_View_Helper.sortLiItemsByAlphabet(unorderedList);
        
        this.assertTrue(
            orderedList[0].text() === "a", orderedList[0].text() + " must be equal to a"
        );
        this.assertTrue(
            orderedList[1].text() === "b", orderedList[1].text() + " must be equal to b"
        );
        this.assertTrue(
            orderedList[2].text() === "c", orderedList[2].text() + " must be equal to c"
        );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_component", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test sorting function: sortLiItemsByCheckStatus by using own small list
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var unorderedList = [
                $("<li><input type=\"checkbox\">1</li>"), 
                $("<li><input type=\"checkbox\" checked=\"checked\">2</li>"),
                $("<li><input type=\"checkbox\">3</li>"), 
                $("<li><input type=\"checkbox\" checked=\"checked\">4</li>")
            ],
            orderedList = CubeViz_View_Helper.sortLiItemsByCheckStatus(unorderedList);
            
        this.assertTrue(
            $(orderedList[0].children().first()).is(":checked"), 
            "sortLiItemsByCheckStatus: first item must be checked"
        );
        
        this.assertTrue(
            $(orderedList[1].children().first()).is(":checked"), 
            "sortLiItemsByCheckStatus: second item must be checked"
        );
        
        this.assertTrue(
            !$(orderedList[2].children().first()).is(":checked"), 
            "sortLiItemsByCheckStatus: third item must be unchecked"
        );
        
        this.assertTrue(
            !$(orderedList[3].children().first()).is(":checked"), 
            "sortLiItemsByCheckStatus: fourth item must be unchecked"
        );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_component", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test sorting function: sortLiItemsByCheckStatus by using exisiting list of 
 * dimension elements in setup component elements dialog.
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var givenComponentDimensionKeys = _.keys(cubeVizApp._.data.components.dimensions),
            firstComponentHashedUrl = givenComponentDimensionKeys[0],
            firstComponent = cubeVizApp._.data.components.dimensions[firstComponentHashedUrl],
            setupComponentDialogId = "#cubeviz-component-setupComponentDialog-" + 
                                      givenComponentDimensionKeys[0],
            listDOMElement = $(setupComponentDialogId).find(".cubeviz-component-setupComponentElements").first(),
            
            notCheckedItems:string[] = [],
            originalList = $(listDOMElement).children("li").get(),
            originalListStrings:string[] = [],
            
            generatedList:any[] = [],
            generatedListStrings:string[] = [];
       
        /**
         * By helper class
         * Sort list items by check status, and create a list only containing strings.
         */
        generatedList = CubeViz_View_Helper.sortLiItemsByCheckStatus(originalList);
        _.each(generatedList, function(item){
            generatedListStrings.push($($(item).children().last()).html());
        });
        
        /**
         * By itself
         */
        _.each(originalList, function(item){
            if($($(item).children().first()).is(":checked")){
                originalListStrings.push($($(item).children().last()).html());
            } else {
                notCheckedItems.push($($(item).children().last()).html());
            }
        });
        
        _.each(notCheckedItems, function(item){
            originalListStrings.push(item);
        });
        
        // test if both string lists are the same
        this.assertTrue(
            true === _.isEqual(generatedListStrings, originalListStrings)
        );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_component", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test sorting function: sortLiItemsByObservationCount by using exisiting list of 
 * dimension elements in setup component elements dialog.
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var givenComponentDimensionKeys = _.keys(cubeVizApp._.data.components.dimensions),
            firstComponentHashedUrl = givenComponentDimensionKeys[0],
            firstComponent = cubeVizApp._.data.components.dimensions[firstComponentHashedUrl],
            setupComponentDialogId = "#cubeviz-component-setupComponentDialog-" + 
                                      givenComponentDimensionKeys[0],
            listDOMElement = $(setupComponentDialogId).find(".cubeviz-component-setupComponentElements").first(),
            
            notCheckedItems:string[] = [],
            originalList:any[] = $(listDOMElement).children("li").get(),
            originalListCopy:any[] = [],
            originalListStrings:string[] = [],
            
            generatedList:any[] = [],
            generatedListStrings:string[] = [];
       
        /**
         * By helper class
         * Sort list items by alphabet, and create a list only containing strings.
         */
        generatedList = CubeViz_View_Helper.sortLiItemsByObservationCount(
            originalList, firstComponent.typeUrl, cubeVizApp._.data.retrievedObservations
        );        
        _.each(generatedList, function(item){
            generatedListStrings.push($($(item).children().last()).html());
        });
        
        
        /**
         * By itself
         */
        var dimensionElementUri:string = "",
            listItemValues:string[] = [],
            listItemsWithoutCount:any[] = [],
            observationCount:number = 0,
            resultList:any[] = [];
            
        // extract checkbox values of given list; it contains items such as 
        // http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent 
        _.each(originalList, function(liItem){
            
            dimensionElementUri = $($(liItem).children().first()).val();
            observationCount = 0;
            
            // count observations which refers to given dimension type url
            _.each(cubeVizApp._.data.retrievedObservations, function(observation){
                if(dimensionElementUri === observation[firstComponent.typeUrl][0].value) {
                    ++observationCount;
                }
            });
            
            // save count
            $(liItem).data("observationCount", observationCount);
            
            // if count is > 0, directly add the item back to the list
            if(0 < observationCount){
                resultList.push($(liItem).clone());
                
            // otherwise stored it somewhere else for later
            } else {
                listItemsWithoutCount.push(liItem);
            }
        });
        
        // sort items by observationCount
        resultList.sort(function(a, b) {
           a = $(a).data("observationCount");
           b = $(b).data("observationCount");
           return (a < b) ? 1 : (a > b) ? -1 : 0;
        });
        
        // add somewhere else stored items back the given list
        _.each(listItemsWithoutCount, function(item){
            resultList.push($(item).clone());
        });
        
        _.each(resultList, function(item){
            originalListStrings.push($($(item).children().last()).html());
        });
        
        this.assertTrue(
            true === _.isEqual(generatedListStrings, originalListStrings),
            "generatedListStrings and originalListStrings have to be equal"
        );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_component", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});
