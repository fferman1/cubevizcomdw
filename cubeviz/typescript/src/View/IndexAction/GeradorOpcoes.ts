class GeradorOpcoes extends CubeViz_View_Abstract
{
	constructor(attachedTo:string, app:CubeViz_View_Application)
	{
		super("GeradorOpcoes",attachedTo,app);
	}

	public renderUnits(propriedadeUnidade) : void
	{
		var unidades = {};
		for (var observacaoIndex in this.app._.backend.retrievedObservations){
			var observacao = this.app._.backend.retrievedObservations[observacaoIndex];
			unidades[observacao[propriedadeUnidade]] = true;
		}
		var html="";
		html += "<p style='font-weight:bold;margin-left:15px;margin-bottom:0px;'>Choose one or more metrics:</p>";
		var checked = false;
		for (var unidadeIndex in unidades){
			if (checked){
				html += "<input type='checkbox' id='cm-unidade' name='cm-unidade' value='"+unidadeIndex+"' style='margin-left:20px;margin-right:5px;margin-top:-5px;'>"+unidadeIndex+"</input>";
			}
			else{
				html += "<input type='checkbox' id='cm-unidade' name='cm-unidade' checked='checked' value='"+unidadeIndex+"' style='margin-left:20px;margin-right:5px;margin-top:-5px;'>"+unidadeIndex+"</input>";
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

	}

	public renderHierarchy() : void
	{
		var disabled = true;
		var dimensoes = this.app._.data.components.dimensions;
		$("#configuration-hierarchy-dimension-content").html("");

		for (var dimensaoIndex in dimensoes){
			var dimensao = dimensoes[dimensaoIndex];
			var hierarquia = dimensao.hierarchy;
			var identificadorDimensao = this.trataString(dimensao.__cv_uri);
			var html = this.geraHtmlHierarquia(hierarquia,1,identificadorDimensao,disabled);
			if (disabled==true){
				disabled=false;
			}
			var div_tag = "<div style=\"background-color:rgb(240,240,240);width:92%;margin-left:4%;margin-top:15px;margin-bottom:15px;border: 1px solid rgb(102, 102, 102);border-radius: 4px 4px 4px 4px;\"><div style=\"padding-right: 1.5em !important;border-radius: 3px 3px 0px 0px;padding: 0.5em 0.5em 0.4em !important;background-color: rgb(136, 136, 136);background-image: -moz-linear-gradient(center top , rgba(255, 255, 255, 0.25), rgba(0, 0, 0, 0.25));font-size: 1em;font-weight: 900;color: rgb(255, 255, 255);border-bottom: 1px solid rgb(102, 102, 102);margin: 0px !important;line-height: 1;font-family: inherit;text-rendering: optimizelegibility;\">"+dimensao.__cv_niceLabel+"</div><div>"+html+"</div></div>";
			$("#configuration-hierarchy-dimension-content").append(div_tag);
		}
	}

	public geraHtmlHierarquia(hierarquia,nivel,identificadorDimensao,disabled): any 
	{
		var html = "";
		for (var atributoIndex in hierarquia){
			var atributo = hierarquia[atributoIndex];
			var div_tag_filhos = this.geraHtmlHierarquia(atributo.__elements,nivel+1,identificadorDimensao,disabled);
			var ativacao = "<div onclick=\"View_IndexAction_Visualization.prototype.onClickElementoAtivacao(this);\" class='cm-verde'></div>";
			var htmlAgregado = "";
			if (disabled){
				htmlAgregado = "<input type='radio' id='sum-"+atributo.__cv_uri+"' name='"+atributo.__cv_uri+"' class='operacao "+identificadorDimensao+"' checked='checked'>Sum</input> <input type='radio' id='avg-"+atributo.__cv_uri+"' name='"+atributo.__cv_uri+"' class='operacao "+identificadorDimensao+"' value='avg'>Average</input>  <input type='radio' id='max-"+atributo.__cv_uri+"' name='"+atributo.__cv_uri+"' class='operacao "+identificadorDimensao+"' value='max'>Maximun</input> <input type='radio' id='min-"+atributo.__cv_uri+"' name='"+atributo.__cv_uri+"' class='operacao "+identificadorDimensao+"' value='min'>Minimun</input>";
			}
			else{
				htmlAgregado = "<input type='radio' disabled='true' id='sum-"+atributo.__cv_uri+"' name='"+atributo.__cv_uri+"' class='operacao "+identificadorDimensao+"' checked='checked'>Sum</input> <input type='radio' disabled='true' id='avg-"+atributo.__cv_uri+"' name='"+atributo.__cv_uri+"' class='operacao "+identificadorDimensao+"' value='avg'>Average</input>  <input type='radio' disabled='true' id='max-"+atributo.__cv_uri+"' name='"+atributo.__cv_uri+"' class='operacao "+identificadorDimensao+"' value='max'>Maximun</input> <input type='radio' disabled='true' id='min-"+atributo.__cv_uri+"' name='"+atributo.__cv_uri+"' class='operacao "+identificadorDimensao+"' value='min'>Minimun</input>";
			}
			htmlAgregado = "<div class='cm-agregacao'>"+htmlAgregado+"</div>";
			var agregacao = "<div style='float:right;height:20px;margin-top:-5px;'>"+htmlAgregado+"</div>";
			var div_tag = "<div style=\"background-color:rgb(249,249,249);width:92%;margin-left:4%;margin-top:15px;margin-bottom:15px;border: 1px solid rgb(102, 102, 102);border-radius: 4px 4px 4px 4px;\"><div class='cm-barra-verde'>"+ativacao+"<span style='cursor:pointer;' onclick=\"View_IndexAction_Visualization.prototype.onClickElemento(this);\" id="+atributo.__cv_uri+">"+atributo.__cv_niceLabel+"</span>"+agregacao+"</div><div class='cm-esconder'>"+div_tag_filhos+"</div></div>";
			html = html + div_tag;
		}
		return html;
	}

	public renderDimensions() : void
	{
		var html="<p style='font-weight:bold;margin-left:15px;margin-bottom:0px;'>Select the main dimension:</p>";
		var dimensoes = this.app._.data.components.dimensions;
		var checked = false;
		for (var dimensaoIndex in dimensoes){
			var dimensao = dimensoes[dimensaoIndex];
			if (checked){
				html += "<input type='radio' id='cm-dimensaoPrincipal' name='cm-dimensaoPrincipal' value='"+dimensao.__cv_uri+"' style='margin-left:20px;margin-right:5px;margin-top:-3px;' onclick=\"GeradorOpcoes.prototype.onClickAlteraPermissaoEdicaoOperacao(this);\">"+dimensao.__cv_niceLabel+"</input>";
			}
			else{
				html += "<input type='radio' id='cm-dimensaoPrincipal' name='cm-dimensaoPrincipal' checked='checked' value='"+dimensao.__cv_uri+"' style='margin-left:20px;margin-right:5px;margin-top:-3px;' onclick=\"GeradorOpcoes.prototype.onClickAlteraPermissaoEdicaoOperacao(this);\">"+dimensao.__cv_niceLabel+"</input>";
				checked = true;
			}
		}
		html += "";
		$("#configuration-menu-principal-dimension-content").html(html);
	}

	public onClickAlteraPermissaoEdicaoOperacao(id) : void
	{
		var identificador = id.defaultValue;
		identificador = this.trataString(identificador);
		$.each($(".operacao").not("."+identificador+""), function(index, value){
			value.disabled=true;
		});
		$.each($("."+identificador+""), function(index, value){
			value.disabled=false;
		});
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
