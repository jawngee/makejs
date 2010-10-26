// login controller
function loginController(settings,view)
{ 
	var that=this;
	
	this.loginForm=$('form',view);
	
	this.emailField=$('input[name="email"]',view);
	this.passwordField=$('input[name="password"]',view);
	this.loginForm.submit(function(){ that.login(); return false; });
	
	this.login=function(sender)
	{
		if (this.emailField.val().trim()=='')
		{
			this.emailField.addClass('error');
			this.emailField.val('');
			this.emailField.get(0).focus();
			return false;
		}

		if (this.passwordField.val().trim()=='')
		{
			this.passwordField.addClass('error');
			this.passwordField.val('');
			this.passwordField.get(0).focus();
			return false;
		}
		
		this.emailField.removeClass('error');
		this.passwordField.removeClass('error');

		$().goTo('#dashboard');

		
		return false;
	}
}

