/// <reference path="..\..\..\declaration\libraries\Highcharts.d.ts" />
/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />
/// <reference path=".\Habilitacao.ts" />
/// <reference path=".\GeradorOpcoes.ts" />

class View_IndexAction_Visualization extends CubeViz_View_Abstract 
{
	public habilitacao : any;
	public geradorOpcoes : any;

	public novosElementos:any;
	public propriedadeValor:any;
	public base:any;
	public numObs:any;
	public idDimensao:any;
	public propriedadeUnidade:any;

	/**
	* Construtor    
	*/ 
	constructor(attachedTo:string, app:CubeViz_View_Application) 
	{
		super("View_IndexAction_Visualization",attachedTo,app);
		this.habilitacao = new Habilitacao(attachedTo,app);
		this.geradorOpcoes = new GeradorOpcoes(attachedTo,app);
		this.novosElementos = [];
		this.propriedadeValor = this.app._.data.selectedComponents.measures[this.app._.data.selectedDSD["http://purl.org/linked-data/cube#component"]]["http://purl.org/linked-data/cube#measure"];
		this.base = this.app._.data.dataSets[0].__cv_uri;
		var partes = this.base.split("/");
		this.base = "";
		for (var index=0;index<partes.length-1;index++){
			this.base = this.base + partes[index] + "/";
		}
		this.numObs = 0;
		var partes = this.propriedadeValor.split("/");
		var prefixo = "";
		for (var i=0;i<partes.length-1;i++){
			prefixo = prefixo+partes[i]+"/";
		}
		var propriedades = {};
		propriedades[this.propriedadeValor] = true;
		for (var dimensaoIndex in this.app._.data.components.dimensions){
			var dimensao = this.app._.data.components.dimensions[dimensaoIndex];
			propriedades[dimensao.__properties] = true;
		}
		for (var observacaoIndex in this.app._.backend.retrievedObservations){
			var observacao = this.app._.backend.retrievedObservations[observacaoIndex];
			for (var linhaIndex in observacao){
				var linha = observacao[linhaIndex];
				var n = linhaIndex.indexOf(prefixo);
				if (propriedades[linhaIndex]!=true && n==0){
					this.propriedadeUnidade = linhaIndex;
				}
			}
			break;
		}

		// publish event handlers to application: if one of these events get triggered, the associated handler will be executed to handle it
		this.bindGlobalEvents([
			{
				name:    "onChange_visualizationClass",
				handler: this.onChange_visualizationClass
			},
			{
				name:    "onReRender_visualization",
				handler: this.onReRender_visualization
			},
			{
				name:    "onStart_application",
				handler: this.onStart_application
			}
		]);
	}
    
	/**
	*
	*/
	public destroy() : CubeViz_View_Abstract
	{
		super.destroy();
		return this;
	}
    
	/**
	* Handle exception throwing by 
	*/
	public handleException(thrownException) 
	{
		/**
		* (Copied directly from http://www.highcharts.com/errors/10)
		* Highcharts Error #10
		* 
		* Can't plot zero or subzero values on a logarithmic axis
		* This error occurs in the following situations:
		*      + If a zero or subzero data value is added to a logarithmic axis
		*      + If the minimum of a logarithimic axis is set to 0 or less
		*      + If the threshold is set to 0 or less
		*/
		if(true === _.str.include(thrownException, "Highcharts error #10")) {
			$("#cubeviz-index-visualization").html($("#cubeviz-visualization-tpl-notificationHightchartsException10").html());
		}
        
		// Output error
		if(false === _.isUndefined(console) && false === _.isUndefined(console.log)) { 
			console.log(thrownException);
		}
	}
    
	/**
	*
	*/
	public initialize() 
	{        
		this.render(true);
	}
    
	/**
	*
	*/
	public onChange_visualizationClass() 
	{
		this.renderChart();
	}
    
	/**
	*
	*/
	public onClick_nothingFoundNotificationLink(event) 
	{
		$("#cubeviz-visualization-nothingFoundFurtherExplanation").slideDown("slow");
	}

	/**
	* Evento disparado ao clicar no botao 'update' na hierarquia
	*/
	public onClick_updateHierarchy(event) 
	{
		function achaElementoNaHierarquia(elementos,uri){
			for (var elementoIndex in elementos){
				var elemento = elementos[elementoIndex];
				if (elemento.__cv_uri==uri){
					getTodosFilhosUri(elemento.__elements);
					return 1; 
				}
				var res = achaElementoNaHierarquia(elemento.__elements,uri);
				if (res == 1){ return 1; }
			}
		}
		function getTodosFilhosUri(elementos){
			for (var elementoIndex in elementos){
				var elemento = elementos[elementoIndex];
				atributosNaoMostrar[elemento.__cv_uri] = true;
				getTodosFilhosUri(elemento.__elements);
			}
			return null;
		}
		var dimensaoPrincipal = $("#cm-dimensaoPrincipal:checked")[0]["value"];
		var unidadeOperacao = $("#cm-unidade-op:checked")[0]["value"];
		var unidade = {};
		var array = $("#cm-unidade:checked");
		for (var arrayIndex in array){
			if (!this.isNumber(arrayIndex)){
				break;
			}
			unidade[array[arrayIndex]["value"]] = true;
		}
		var operadores = {};
		var atributosMostrar = [];
		var atributosNaoMostrar = {};
		this.habilitacao.zerar();
		var dimensoes = this.app._.data.components.dimensions;
		$.each($(".cm-agregacao"), function(index,value){
			var uri = $(value).parent().parent().children()[1].id;
			for (var dimensaoIndex in dimensoes){
				var dimensao = dimensoes[dimensaoIndex];
				var hierarquia = dimensao.hierarchy;
				achaElementoNaHierarquia(hierarquia,uri);
			}
		});
		$.each($(".cm-agregacao,.cm-agregacao-escondido"), function(index,value){
			var uri = $(value).parent().parent().children()[1].id;
			if (!(uri in atributosNaoMostrar)){
				atributosMostrar.push(uri);
			}
		});
		$.each($(".operacao:checked"), function(index, value){
			var uri = value.id;
			var op = uri.substring(0,3);
			uri = uri.substring(4);
			operadores[uri] = op;
		});

		var tmp = this.habilitacao.ativos;
		$.each($(".cm-verde"),function(index, value){
			var uri = $(value).next()[0].id;
			tmp[uri] = true;
		});
		this.habilitacao.ativos = tmp;
		tmp = this.habilitacao.desativos;
		$.each($(".cm-vermelho"),function(index, value){
			var uri = $(value).next()[0].id;
			tmp[uri] = true;
		});
		this.habilitacao.desativos = tmp;

		this.renderChartHierarchy(atributosMostrar,dimensaoPrincipal,operadores,unidade,unidadeOperacao);
	}

	public isNumber(value) : any {
		if ((undefined === value) || (null === value)) {
			return false;
		}
    if (typeof value == 'number') {
        return true;
    }
    return !isNaN(value - 0);
}

	/**
	*
	*/
	public onReRender_visualization() 
	{
		this.render(false);
	}
    
	/**
	*
	*/
	public onStart_application() 
	{
		this.initialize();
	}

	/**
	*
	*/
	public render(printa) 
	{
		if (printa){
			this.geradorOpcoes.renderDimensions();
			this.geradorOpcoes.renderHierarchy();
			this.geradorOpcoes.renderUnits(this.propriedadeUnidade);
		}
		this.bindUserInterfaceEvents({
			"click #cubeviz-index-hierarchy-update":
			this.onClick_updateHierarchy
		});
	
		// If at least one observation was retrieved
		if ( 1 <= _.size(this.app._.backend.retrievedObservations) ) {  
			this.renderChart();
		} 
		// If nothing was retrieved
		else {
			$("#cubeviz-index-visualization").html("").append($("#cubeviz-visualization-tpl-nothingFoundNotification").text());
			this.triggerGlobalEvent("onReceived_noData");
			this.setVisualizationHeight();
		}
        
		/**
		* Delegate events to new items of the template
		*/
		this.bindUserInterfaceEvents({
			"click #cubeviz-visualization-nothingFoundNotificationLink":this.onClick_nothingFoundNotificationLink
		});
        
		return this;
	}

	/**
	* evento disparado ao se clicar em algum elemento da lista de hierarquia
	*/
	public onClickElementoListaHierarquia(id) : void
	{
		var clicked = null;
		var i=0;
		while (true){
			var localName = id.attributes[i].localName;
			if (localName == "uri"){
				clicked = id.attributes[i].nodeValue;
				break;
			}
			i++;
		}
		if (document.getElementById("filhos_"+clicked).className=="minimizado"){
			document.getElementById("filhos_"+clicked).className = "";
			document.getElementById(clicked).className = "nao_suprimido";
		}
		else{
			document.getElementById("filhos_"+clicked).className = "minimizado";
			document.getElementById(clicked).className = "suprimido";
		}
	}

	public onClickElemento(id) : void
	{
		if ($(id).parent().next()[0].className=="cm-esconder"){
			$(id).parent().next()[0].className="";
			$(id).next().children()[0].className="cm-agregacao-escondido";
		}
		else{
			$(id).parent().next()[0].className="cm-esconder";
			$(id).next().children()[0].className="cm-agregacao";
		}
	}

	/**
	* 
	*/
	public onClickElementoListaHierarquiaHabilitacao(id) : void
	{
		if (id.className=="verde"){ id.className="vermelho"; }
		else if (id.className=="vermelho"){ id.className="verde"; }
	}

	/**
	* 
	*/
	public onClickElementoAtivacao(id) : void
	{
		if (id.className=="cm-verde"){ id.className="cm-vermelho";$(id).parent()[0].className="cm-barra-vermelha"; }
		else if (id.className=="cm-vermelho"){ id.className="cm-verde";$(id).parent()[0].className="cm-barra-verde"; }
	}

	/**
	* Desenha grafico utilizando da hierarquia
	*/
	public renderChartHierarchy(atributosShow,dimensaoPrincipal,operadores,unidade,unidadeOperacao) : void
	{
		// Dynamiclly set visualization container height get chart config
		var fromChartConfig:any = CubeViz_Visualization_Controller.getFromChartConfigByClass (
			this.app._.ui.visualization.className,
			this.app._.backend.chartConfig[2].charts
		),
		selectedMeasure:any = this.app._.data.selectedComponents.measures[_.keys(this.app._.data.selectedComponents.measures)[0]],
			type:string = null, 
			visualizationSetting:any = null;

		// set default className
		if(true === _.isUndefined(fromChartConfig)) {
			this.app._.ui.visualization.className = this.app._.backend.chartConfig[2].charts[0].className;

			fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass (
				this.app._.ui.visualization.className,
				this.app._.backend.chartConfig[2].charts
			);
		}
		// extract visualization settings
		visualizationSetting = CubeViz_Visualization_Controller.updateVisualizationSettings(
			[],this.app._.ui.visualizationSettings[this.app._.ui.visualization.className],fromChartConfig.defaultConfig);
		// determine if using HighCharts or CubeViz
		type = CubeViz_Visualization_Controller.getVisualizationType(this.app._.ui.visualization.className);

		// if chart was created before, first destroy this instance
		if(false === _.isUndefined(this.app._.generatedVisualization)){
			try {
				this.app._.generatedVisualization.destroy();
			} catch (ex) {
				// show exception if console.log is available, check because 
				// some browsers, especially IE, did not have console defined
				if(false === _.isUndefined(console) && false === _.isUndefined(console.log)) { 
					console.log(ex);
				}
			}
		}

		var hC = new CubeViz_Visualization_HighCharts();

		// load specific chart instance
		var chart = hC.load(this.app._.ui.visualization.className);

		// init chart instance
		var dimensoes = this.getDimensoes();

		var dimensoesSecundarias = this.getDimensoesSecundarias(dimensaoPrincipal);

		var propriedades = this.getMapPropriedades();

		var atributos = this.getRetrievedAtributosViaveis(atributosShow);	

		this.adicionaNovosAtributos(atributos,atributosShow);

		var observacoes = this.getObservacoes(propriedades,atributosShow,dimensaoPrincipal,dimensoesSecundarias,dimensoes,operadores,unidade,unidadeOperacao);

		this.organizaObservacoes(observacoes,propriedades[dimensaoPrincipal]);

		chart.init(visualizationSetting,observacoes,atributos,
			CubeViz_Visualization_Controller.getMultipleDimensions(this.app._.data.selectedComponents.dimensions),
			CubeViz_Visualization_Controller.getOneElementDimensions(this.app._.data.selectedComponents.dimensions),
			selectedMeasure["http://purl.org/linked-data/cube#measure"], dimensaoPrincipal);
		try {            
			// set visualization height
			this.setVisualizationHeight(_.size(chart.getRenderResult().xAxis.categories));
            
			// show chart
			this.app._.generatedVisualization = new Highcharts.Chart(chart.getRenderResult());
		} catch (ex) { 
			this.handleException(ex);
		}
	}

	/**
	* Ordena observacoes
	*/
	public organizaObservacoes(observacoes,sort) : void
	{
		observacoes.sort(function(a,b){
							var as = a[sort];
							var bs = b[sort];
							if (as < bs){return -1;}
							return 1;
						});
	}

	/**
	* retorna as observacoes
	*/
	public getObservacoes(propriedades,atributosShow,dimensaoPrincipal,dimensoesSecundarias,dimensoes,operadores,unidade,unidadeOperacao) : any
	{
		var observationsAll = this.app._.backend.retrievedObservations;
		var observationsMap = {};
		for (var observationIndex in observationsAll){
			var observationOriginal = observationsAll[observationIndex];
			var observation = jQuery.extend({}, observationOriginal);
			var chave = "";
			for (var dimensaoIndex in dimensoes){
				var dimensao = dimensoes[dimensaoIndex];
				chave = chave + observation[propriedades[dimensao]] + "&";
			}
			if (observationsMap[chave] == null){
				if (unidade[observation[this.propriedadeUnidade]]==true){
					observationsMap[chave] = observation;
				}
			}
			else{
				if (unidade[observation[this.propriedadeUnidade]]==true){
					var observationTmp = observationsMap[chave];
					observationTmp[this.propriedadeUnidade] = observationTmp[this.propriedadeUnidade] + " " + observation[this.propriedadeUnidade];
					if (unidadeOperacao=="sum" || unidadeOperacao=="avg"){
						observationTmp[this.propriedadeValor] = parseInt(observationTmp[this.propriedadeValor]) + parseInt(observation[this.propriedadeValor]);
					}
					else if (unidadeOperacao=="max"){
						observationTmp[this.propriedadeValor] = Math.max(parseInt(observationTmp[this.propriedadeValor]), parseInt(observation[this.propriedadeValor]));
					}
					else if (unidadeOperacao=="min"){
						observationTmp[this.propriedadeValor] = Math.min(parseInt(observationTmp[this.propriedadeValor]), parseInt(observation[this.propriedadeValor]));
					}
					observationsMap[chave] = observationTmp;
				}
			}
		}
		var countAvg = 0;
		if (unidadeOperacao == "avg"){
			for (var unidadeIndex in unidade){
				countAvg++;
			}
		}

		var observations = [];
		for (var observationIndex in observationsMap){
			var observation = observationsMap[observationIndex];
			if (unidadeOperacao == "avg"){
				observation[this.propriedadeValor] = observation[this.propriedadeValor]/countAvg;
			}
			observations.push(observation);
		}

		for (var dimensaoSecundariaIndex in dimensoesSecundarias){
			var dimensaoSecundaria = dimensoesSecundarias[dimensaoSecundariaIndex];

			var atributosShowDimensao = [];
			for (var atributoShowIndex in atributosShow){
				var atributoShow = atributosShow[atributoShowIndex];
				var elementoHierarquia = this.achaElementoNaHierarquia(atributoShow);
				
				if (elementoHierarquia.__cv_properties==propriedades[dimensaoSecundaria]){
					atributosShowDimensao.push(atributoShow);
				}

			}
			var atributosMostrar = this.atributosMostrarDentroAtributosShow(atributosShowDimensao);
			observations = this.agregaObservacoesDaDimensaoSecundaria(dimensaoSecundaria,propriedades,atributosMostrar,observations,dimensoes);
		}

		var atributosShowDimensao = [];
		for (var atributoShowIndex in atributosShow){
			var atributoShow = atributosShow[atributoShowIndex];
			var elementoHierarquia = this.achaElementoNaHierarquia(atributoShow);
			
			if (elementoHierarquia.__cv_properties==propriedades[dimensaoPrincipal]){
				atributosShowDimensao.push(atributoShow);
			}
		}

		var atributosMostrar = this.atributosMostrarDentroAtributosShow(atributosShowDimensao);
		observations = this.agregaObservacoesDaDimensaoPrincipal(dimensaoPrincipal,dimensoes,propriedades,atributosMostrar,observations,operadores);

		return observations;
	}

	/**
	* retira de atributosShow os atributos que nao devem aparecer que estao presentes na hierarquia mais acima
	*/
	public atributosMostrarDentroAtributosShow(atributosShow) : any
	{
		var atributosMostrar = [];
		for (var atributoShowIndex in atributosShow){
			var atributoShow = atributosShow[atributoShowIndex];
			var elementoHierarquia = this.achaElementoNaHierarquia(atributoShow);
			var temAbaixo = false;
			while (true){
				var countFilhos = 0;
				for (var filhoIndex in elementoHierarquia.__elements){
					countFilhos++;
				}
				if (countFilhos>0){
					elementoHierarquia = elementoHierarquia.__elements[0];
				}
				if (countFilhos==0){
					break;
				}
				for (var atributoShowIndex2 in atributosShow){
					var atributoShow2 = atributosShow[atributoShowIndex2];
					if (atributoShow2==elementoHierarquia.__cv_uri){
						temAbaixo = true;
					}
				}
			}
			if (temAbaixo==false){
				atributosMostrar.push(atributoShow);
			}
		}
		return atributosMostrar;
	}

	public agregaObservacoesDaDimensaoPrincipal(dimensaoPrincipal,dimensoes,propriedades,atributosMostrar,observations,operadores) : any
	{
		var observacoesRetornar = [];
		var observacoesSobraram = [];
		var propriedadeDimensaoPrincipal = propriedades[dimensaoPrincipal];
		for (var observationIndex in observations){
			var observation = observations[observationIndex];
			var estaEmAtributosMostrar = false;
			for (var atributoMostrarIndex in atributosMostrar){
				var atributoMostrar = atributosMostrar[atributoMostrarIndex];
				if (observation[propriedadeDimensaoPrincipal]==atributoMostrar){
					estaEmAtributosMostrar = true;
					break;
				}
			}
			if (estaEmAtributosMostrar){
				if (this.habilitacao.isObservacaoAtivo(observation,propriedades,dimensoes)){
					observation.__cv_uri=this.base+"observacao_"+(this.numObs++);
					observacoesRetornar.push(observation);
				}
			}
			else{
				observacoesSobraram.push(observation);
			}
		}
		observacoesRetornar = observacoesRetornar.concat(this.adicionaObservacoesAgregadasDaDimensaoPrincipal(observacoesSobraram,atributosMostrar,dimensaoPrincipal,dimensoes,propriedades,operadores));
		return observacoesRetornar;
	}

	public agregaObservacoesDaDimensaoSecundaria(dimensaoSecundaria,propriedades,atributosMostrar,observations,dimensoes) : any
	{
		var observacoesRetornar = [];
		var observacoesSobraram = [];
		var propriedadeDimensaoSecundaria = propriedades[dimensaoSecundaria];
		for (var observationIndex in observations){
			var observation = observations[observationIndex];
			var estaEmAtributosMostrar = false;
			for (var atributoMostrarIndex in atributosMostrar){
				var atributoMostrar = atributosMostrar[atributoMostrarIndex];
				if (observation[propriedadeDimensaoSecundaria]==atributoMostrar){
					estaEmAtributosMostrar = true;
					break;
				}
			}
			if (estaEmAtributosMostrar){
				if (this.habilitacao.isObservacaoAtivo(observation,propriedades,dimensoes)){
					observation.__cv_uri=this.base+"observacao_"+(this.numObs++);
					observacoesRetornar.push(observation);
				}
			}
			else{
				observacoesSobraram.push(observation);
			}
		}
		observacoesRetornar = observacoesRetornar.concat(this.adicionaObservacoesAgregadas(observacoesSobraram,atributosMostrar,dimensaoSecundaria,propriedades));
		return observacoesRetornar;
	}

	public adicionaObservacoesAgregadas(observacoes,atributosMostrar,dimensaoSecundaria,propriedades) : any
	{
		var novasObservacoes = [];
		var dimensoes = this.getDimensoes();
		var formadoresId = [];
		var grupos = {};
		for (var dimensaoIndex in dimensoes){
			var dimensao = dimensoes[dimensaoIndex];
			if (dimensao!=dimensaoSecundaria){
				formadoresId.push(propriedades[dimensao]);
			}
		}
		for (var observacaoIndex in observacoes){
			var observacao = observacoes[observacaoIndex];
			var id = "";
			for (var formadorIdIndex in formadoresId){
				var formadorId = formadoresId[formadorIdIndex];
				id = id+"##"+observacao[formadorId];
			}
			if (id in grupos){
				var array = grupos[id];
				array.push(observacao);
				grupos[id] = array;
			}
			else{
				var array = [];
				array.push(observacao);
				grupos[id] = array;
			}
		}
		for (var grupoIndex in grupos){
			var grupo = grupos[grupoIndex];
			for (var atributoMostrarIndex in atributosMostrar){
				var atributoMostrar = atributosMostrar[atributoMostrarIndex];
				var elementoHierarquia = this.achaElementoNaHierarquia(atributoMostrar);
				var valor = this.percorreHierarquiaDimensaoSecundaria(elementoHierarquia,grupo);
				if (valor!=undefined){
					var el = jQuery.extend({}, grupo[0]);
					el[elementoHierarquia.__cv_properties] = elementoHierarquia.__cv_uri;
					if (this.habilitacao.isObservacaoAtivo(el,propriedades,dimensoes)){
						el[this.propriedadeValor] = valor;
						el["__cv_niceLabel"] = "label desatualizada";
						el["__cv_uri"]=this.base+"observacao_"+(this.numObs++);
						novasObservacoes.push(el);
					}
				}
			}
		}
		return novasObservacoes;
	}

	public adicionaObservacoesAgregadasDaDimensaoPrincipal(observacoes,atributosMostrar,dimensaoPrincipal,dimensoes,propriedades,operadores) : any
	{
		var novasObservacoes = [];
		var dimensoes = this.getDimensoes();
		var formadoresId = [];
		var grupos = {};
		for (var dimensaoIndex in dimensoes){
			var dimensao = dimensoes[dimensaoIndex];
			if (dimensao!=dimensaoPrincipal){
				formadoresId.push(propriedades[dimensao]);
			}
		}
		for (var observacaoIndex in observacoes){
			var observacao = observacoes[observacaoIndex];
			var id = "";
			for (var formadorIdIndex in formadoresId){
				var formadorId = formadoresId[formadorIdIndex];
				id = id+"##"+observacao[formadorId];
			}
			if (id in grupos){
				var array = grupos[id];
				array.push(observacao);
				grupos[id] = array;
			}
			else{
				var array = [];
				array.push(observacao);
				grupos[id] = array;
			}
		}
		for (var grupoIndex in grupos){
			var grupo = grupos[grupoIndex];
			for (var atributoMostrarIndex in atributosMostrar){
				var atributoMostrar = atributosMostrar[atributoMostrarIndex];
				var elementoHierarquia = this.achaElementoNaHierarquia(atributoMostrar);
				var valor = this.percorreHierarquiaDimensaoPrincipal(elementoHierarquia,grupo,operadores);
				if (valor!=undefined){
					var el = jQuery.extend({}, grupo[0]);
					el[elementoHierarquia.__cv_properties] = elementoHierarquia.__cv_uri;
					if (this.habilitacao.isObservacaoAtivo(el,propriedades,dimensoes)){
						el[this.propriedadeValor] = valor;
						el["__cv_niceLabel"] = "label desatualizada";
						el["__cv_uri"]=this.base+"observacao_"+(this.numObs++);
						novasObservacoes.push(el);
					}
				}
			}
		}
		return novasObservacoes;
	}

	public operacao(valorAtual,operando,operacao) : any{
		if (operacao=="sum"){
			return valorAtual+operando;
		}
		if (operacao=="max"){
			return Math.max(valorAtual,operando);
		}
		if (operacao=="avg"){
			return valorAtual+operando;
		}
		if (operacao=="min"){
			return Math.min(valorAtual,operando);
		}
	}

	public getValorInicial(operacao) : any
	{
		if (operacao=="sum"){
			return 0;
		}
		if (operacao=="max"){
			return -1;
		}
		if (operacao=="avg"){
			return 0;
		}
		if (operacao=="min"){
			return 99999;
		}
	}

	/**
	*
	*/
	public percorreHierarquiaDimensaoSecundaria(elementoHierarquia,grupo) : any
	{
		var entrou = false;
		var soma = 0;
		for (var filhoIndex in elementoHierarquia.__elements){
			entrou = true;
			var filho = elementoHierarquia.__elements[filhoIndex];
			var tmp = this.percorreHierarquiaDimensaoSecundaria(filho,grupo);
			if (tmp!=undefined){
				soma = soma + parseInt(tmp);
			}
		}
		if (!entrou){
			if (!this.habilitacao.isDesativo(elementoHierarquia.__cv_uri)){
				elementoHierarquia = this.achaElementoNaHierarquia(elementoHierarquia.__cv_uri);
				for (var elementoIndex in grupo){
					var elemento = grupo[elementoIndex];
					if (elemento[elementoHierarquia.__cv_properties]==elementoHierarquia.__cv_uri){
						return elemento[this.propriedadeValor];
					}
				}
			}
			else{
				return undefined;
			}
		}
		if (entrou){
			if (!this.habilitacao.isDesativo(elementoHierarquia.__cv_uri)){
				return soma;
			}
			else{
				return undefined;
			}
		}
	}


	/**
	*
	*/
	public percorreHierarquiaDimensaoPrincipal(elementoHierarquia,grupo,operadores) : any
	{
		var entrou = false;
		var res = this.getValorInicial(operadores[elementoHierarquia.__cv_uri]);
		var count = 0;
		for (var filhoIndex in elementoHierarquia.__elements){
			entrou = true;
			var filho = elementoHierarquia.__elements[filhoIndex];
			var tmp = this.percorreHierarquiaDimensaoPrincipal(filho,grupo,operadores);
			if (tmp != undefined){
				res = this.operacao(res,parseInt(tmp),operadores[elementoHierarquia.__cv_uri]);
				count++;
			}
		}
		if (operadores[elementoHierarquia.__cv_uri]=="avg"){
			res = (res*1.0)/(count*1.0);
		}
		if (!entrou){
			if (!this.habilitacao.isDesativo(elementoHierarquia.__cv_uri)){
				elementoHierarquia = this.achaElementoNaHierarquia(elementoHierarquia.__cv_uri);
				for (var elementoIndex in grupo){
					var elemento = grupo[elementoIndex];
					if (elemento[elementoHierarquia.__cv_properties]==elementoHierarquia.__cv_uri){
						return elemento[this.propriedadeValor];
					}
				}
			}
			else{
				return undefined;
			}
		}
		if (entrou){
			if (!this.habilitacao.isDesativo(elementoHierarquia.__cv_uri)){
				return res;
			}
			else{
				return undefined;
			}
		}
	}

	/**
	* adiciona os novos atributos e carrega em novosElementos os atributos novos que foram adicionados
	*/
	public adicionaNovosAtributos(atributos,atributosShow) : void
	{
		this.novosElementos = [];

		var dimensoesHierarquia = this.app._.data.components.dimensions;
		for (var dimensaoHierarquiaIndex in dimensoesHierarquia){
			var dimensaoHierarquia = dimensoesHierarquia[dimensaoHierarquiaIndex];
			for (var atributoIndex in atributos){
				var atributo = atributos[atributoIndex];
				if (dimensaoHierarquia.__cv_uri==atributo.__cv_uri){
					this.adicionaNovosElementos(dimensaoHierarquia.hierarchy,atributo,atributosShow);
				}
			}
		}
	}

	/**
	* retorna das dimensoes que ja retornariam, apenas aquelas que ainda vao aparecer (nao adiciona as novas)
	*/
	public getRetrievedAtributosViaveis(atributosShow) : any
	{
		var dimensoes = this.app._.data.selectedComponents.dimensions
		for (var dimensaoIndex in dimensoes){
			var dimensao = dimensoes[dimensaoIndex];
			var elementos = dimensao.__cv_elements;
			var novosElementos = [];
			for (var elementoIndex in elementos){
				var elemento = elementos[elementoIndex];
				for (var atributosIndex in atributosShow){
					if (atributosShow[atributosIndex]==elemento.__cv_uri){
						novosElementos.push(elemento);
					}
				}
			}
			dimensao.__cv_elements=novosElementos;
		}
		return dimensoes;
	}

	/**
	* retorna um map[dimensao,propriedade]
	*/
	public getMapPropriedades() : any
	{
		var propriedades = {}
		for (var dimensaoIndex in this.app._.data.components.dimensions){
			var dimensao = this.app._.data.components.dimensions[dimensaoIndex];
			propriedades[dimensao.__cv_uri] = dimensao.__properties;
		}
		return propriedades;
	}

	/**
	* Carrega this.novosElementos
	*/
	public adicionaNovosElementos(dimensaoHierarquia,dimensao,atributosShow) : bool
	{
		var mostrar = false;
		var entrou = false;
		for (var atributosIndex in dimensaoHierarquia){
			entrou = true;
			var atributo = dimensaoHierarquia[atributosIndex];
			for (var atributoShowIndex in atributosShow){
				var temMostrar = atributosShow[atributoShowIndex];
				if (atributo.__cv_uri==temMostrar){
					mostrar = true;
				}
			}
			var tmp = this.adicionaNovosElementos(atributo.__elements,dimensao,atributosShow);
			var temFilhos = false;
			for (var filhoIndex in atributo.__elements){
				temFilhos = true;
				break;
			}
			var jaTem = false;
			for (var elementoIndex in dimensao.__cv_elements){
				var elemento = dimensao.__cv_elements[elementoIndex];
				if (elemento.__cv_uri==atributo.__cv_uri){
					jaTem = true;
				}
			}
			if (tmp!=true && mostrar && (temFilhos || !jaTem)){
				var novoElemento = {};
				this.novosElementos.push(atributo.__cv_uri);
				novoElemento = this.achaElementoNaHierarquia(atributo.__cv_uri);
				dimensao.__cv_elements.push(novoElemento);
			}
		}
		
		if (!entrou){
			return null;
		}
		return mostrar;
	}

	/**
	* retorna as dimensoes secundarias
	*/
	public getDimensoesSecundarias(dimensaoPrincipal) : any
	{
		var dimensoes = [];
		for (var dimensionIndex in this.app._.data.components.dimensions){
			var dimension = this.app._.data.components.dimensions[dimensionIndex];
			if (dimension.__cv_uri!=dimensaoPrincipal){
				dimensoes.push(dimension.__cv_uri);
			}
		}
		return dimensoes;
	}

	/**
	* retorna as dimensoes
	*/
	public getDimensoes() : any
	{
		var dimensoes = [];
		for (var dimensionIndex in this.app._.data.components.dimensions){
			var dimension = this.app._.data.components.dimensions[dimensionIndex];
			dimensoes.push(dimension.__cv_uri);
		}
		return dimensoes;
	}

	/**
	* passa uma uri e retorna o elemento na estrutura da hierarquia
	*/
	public achaElementoNaHierarquia(atributoUri) : any
	{
		var dimensoes = this.app._.data.components.dimensions;
		for (var dimensaoIndex in dimensoes){
			var dimensao = dimensoes[dimensaoIndex];
			for (var elementoIndex in dimensao.hierarchy){
				var elemento = dimensao.hierarchy[elementoIndex];
				var res = this.achaElementoPercorrendoNaHierarquia(atributoUri,elemento);	
				if (res!=null){
					res.__cv_dimensao_uri = dimensao.__cv_uri;
					res.__cv_properties = dimensao.__properties;					
					return res;
				}
			}
		}
	}

	/**
	* recebe uma uri e um elemento na estrutura de hierarquia, e retorna o elemento se encontrado nessa estrutura
	*/
	private achaElementoPercorrendoNaHierarquia(atributoUri,elemento) : any
	{		
		if (elemento.__cv_uri==atributoUri){
			return elemento;
		}
		for (var elementoIndex in elemento.__elements){
			var elementoFilho = elemento.__elements[elementoIndex];
			var res = this.achaElementoPercorrendoNaHierarquia(atributoUri,elementoFilho);
			if (res != null){
				return res;
			}
		}
		return null;
	}

	/**
	* Render Chart inicial
	*/
	public renderChart() : void
	{
		this.onClick_updateHierarchy(null);
	}
    
	/**
	* Set height of the visualization area depending on given number of y-axis
	* elements. Will return a min height or number of y-axis elements multiplied
	* with fixed pixel size.     * 
	* @param numberOfYAxisElements Number of elements on the y axis
	* @return number New height of visualization container.
	*/
	public setVisualizationHeight (numberOfYAxisElements:number = 0) 
	{
		var offset:any = $(this.attachedTo).offset(),
			minHeight:number = $(window).height() - offset.top - 95,
			tmp:number = 0;
            
		if(0 < numberOfYAxisElements) {
			tmp = numberOfYAxisElements * 40;
			if(tmp > minHeight) {
				minHeight = tmp;
			}
		}

		$(this.attachedTo).css ("height", minHeight);
	}

	public trataString(str) :any
	{
		str = this.replaceAll("/","",str);
		str = this.replaceAll(":","",str);
		str = this.replaceAll("[.]","",str);
		return str;
	}

	public replaceAll(find, replace, str) :any
	{
		return str.replace(new RegExp(find, 'g'), replace);
	}

}
