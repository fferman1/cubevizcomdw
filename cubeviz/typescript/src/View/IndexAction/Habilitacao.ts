class Habilitacao extends CubeViz_View_Abstract 
{
	public ativos : any;
	public desativos : any;
	
	constructor(attachedTo:string, app:CubeViz_View_Application)
	{
		super("Habilitacao",attachedTo,app);
	}

	public zerar() : any
	{
		this.ativos = {};
		this.desativos = {};
	}

	public isObservacaoAtivo(observation,propriedades,dimensoes) : any
	{
		var ativo = true;
		for (var dimensaoIndex in dimensoes){
			var dimensao = dimensoes[dimensaoIndex];
			if (observation[propriedades[dimensao]] in this.ativos){
			}
			else{
				ativo = false;
			}
		}
		return ativo;
	}

	public isDesativo(uri) : any
	{
		if (uri in this.desativos){
			return true;
		}
		else{
			return false;
		}
	}

}
