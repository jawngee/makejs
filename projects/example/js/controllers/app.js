// home controller
function appController(settings)
{
	this.settings=settings;
	
	this.init=function()
	{
	}
	
	this.logout=function(sender)
	{
		$().goToRoot();
	}
}
