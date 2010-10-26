// login controller
function registerController(settings,view)
{ 
	this.registerForm=$('form',view);
	this.emailField=$('input[name="email"]',view);
	this.passwordField=$('input[name="password"]',view);
	this.termsCheckbox=$('input[name="terms"]',view);
	this.ageCheckbox=$('input[name="age"]',view);
	
	this.registerForm.submit(function(){ return this.register(); });
	

	
	this.register=function(sender)
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
		
		return false;
	}
}

