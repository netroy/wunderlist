wunderlist.account       = wunderlist.account || {};
wunderlist.account.email = Titanium.App.Properties.getString('email', '');

var register_dialog;
var invite_dialog;
var inviteCloseDialog;
var forgot_password_dialog;
var edit_profile_dialog;
var delete_account_dialog;
var logging_in = false;

wunderlist.account.init = function() {
	this.syncDomain 	   = 'https://sync.wunderlist.net';
	this.registerUrl       = this.syncDomain + '/register';
	this.loginUrl          = this.syncDomain + '/login';
	this.forgotPasswordUrl = this.syncDomain + '/password';
	this.inviteUrl         = this.syncDomain + '/invite';
	this.editAccountUrl    = this.syncDomain + '/edit-account';
	this.deleteAccountUrl  = this.syncDomain + '/delete-account';

	this.status_codes =
	{
		'REGISTER_SUCCESS':                   100,
		'REGISTER_DUPLICATE':                 101,
		'REGISTER_INVALID_EMAIL':             102,
		'REGISTER_FAILURE':                   103,

		'LOGIN_SUCCESS':                      200,
		'LOGIN_FAILURE':                      201,
		'LOGIN_DENIED':                       202,
		'LOGIN_NOT_EXIST':                    203,

		'PASSWORD_SUCCESS':                   400,
		'PASSWORD_INVALID_EMAIL':             401,
		'PASSWORD_FAILURE':                   402,

		'INVITE_SUCCESS':         			  500,
		'INVITE_INVALID_EMAIL':               501,
		'INVITE_FAILURE':                     502,

		'EDIT_PROFILE_SUCCESS':               600,
		'EDIT_PROFILE_AUTHENTICATION_FAILED': 601,
		'EDIT_PROFILE_EMAIL_ALREADY_EXISTS':  602,
		'EDIT_PROFILE_INVALID_EMAIL_ADDRESS': 603,
		'EDIT_PROFILE_FAILURE':               604,

		'DELETE_ACCOUNT_SUCCESS':             700,
		'DELETE_ACCOUNT_FAILURE':             701,
		'DELETE_ACCOUNT_INVALID_EMAIL':       702,
		'DELETE_ACCOUNT_NOT_EXISTS':          703,
		'DELETE_ACCOUNT_DENIED':              704
	}

	wunderlist.account.load();
};

/**
 * Creates a user in the properties
 *
 * @author Dennis Schneider
 */
wunderlist.account.createUser = function(email, password) {
	Titanium.App.Properties.setString('logged_in', 'true');
	Titanium.App.Properties.setString('email', email.toString());
	Titanium.App.Properties.setString('password', password.toString());
	
	wunderlist.account.email = email;
							
	// Set the new app title, so the user can see which account is currently logged in
	wunderlist.setTitle('Wunderlist - ' + email);
};

/**
 * Sets the user to logout
 *
 * @author Dennis Schneider
 */
wunderlist.account.logUserOut = function() {
	Titanium.App.Properties.setString('logged_in', 'false');
	wunderlist.account.deleteUserCredentials();
};

/**
 * Checks if the user is logged in
 *
 * @author Dennis Schneider
 */
wunderlist.account.isLoggedIn = function() {
	logged_in = Titanium.App.Properties.getString('logged_in', 'false');
	if (logged_in == 'true')
		return true;
	else
		return false;
};

/**
 * Gets the user credentials
 *
 * @author Dennis Schneider
 */
wunderlist.account.getUserCredentials = function() {
	values = {
		'email': Titanium.App.Properties.getString('email', ''),
		'password': Titanium.App.Properties.getString('password', '') // encrypted !
	};

 	return values;
};


/**
 * Removes the user credentials
 *
 * @author Dennis Schneider
 */
wunderlist.account.deleteUserCredentials = function() {
	Titanium.App.Properties.setString('email', '');
	Titanium.App.Properties.setString('password', '');
};

/**
 * Initializes the account dialog
 *
 * @author Christian Reber
 */
wunderlist.account.load = function() {
	if (wunderlist.account.isLoggedIn())
	{
		wunderlist.account.loadInterface();
		wunderlist.timer.set(4).start();
		$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
	}
	else
	{
		wunderlist.account.showRegisterDialog();
	}
};

/**
 * (Re)loads the interface and closes the registration dialog
 *
 * @author Christian Reber, Dennis Schneider
 */
wunderlist.account.loadInterface = function() {
	if (register_dialog != undefined) 
	{
		// Hide the wood texture
		$('div.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
		
		$(register_dialog).dialog('close');
	}
	
	var taskInput = $("input.input-add").val();
	
	menu.initialize();
	wunderlist.database.initLists(wunderlist.database.getLists());
	filters.init();
	openList();
	
	makeListsDropable();
	makeFilterDropable();

	if (settings.os === 'darwin')
	{
		// Stupid, but necessary workaround for Mac OS X
		$('.input-add').focus().blur();
	}
	
	if (taskInput != '')
	{
		$("input.input-add").val(taskInput);
		$("input.input-add").focus();
	}
};

/**
 * Shows the register Dialog
 *
 * @author Dennis Schneider
 */
wunderlist.account.showRegisterDialog = function() {
	if ($("[role='dialog']").length == 0)
	{
		register_dialog = $('<div></div>')
			.html(html.generateLoginRegisterDialogHTML())
			.dialog({
				autoOpen: false,
				draggable: false,
				resizable: false,
				modal: true,
				closeOnEscape: false,
				dialogClass: 'dialog-login',
				title: wunderlist.language.english.register_title,
				open: function()
				{
					$('input#login-email').val('');
					$('input#login-password').val('');
					$('.error').hide().fadeIn("fast").text('');
					$('input#login-email').blur();
				}
		});
	

		dialogs.openDialog(register_dialog);
	}

	// Set wood background for login dialog
	setTimeout(function() { $('.ui-widget-overlay').addClass('ui-widget-overlay-wood');	}, 1);

	Layout.stopLoginAnimation();

	// Unbind the live functionality
	$('#cancelreg').die();
	$('#loginsubmit').die();
	$('#registersubmit').die();
	$('#login-email,#login-password').die();
	$('#forgot-pwd').die();

	// Close Register Dialog
	$('#cancelreg').live('click', function() {
		Layout.startLoginAnimation();
		wunderlist.database.createStandardElements();
		wunderlist.account.loadInterface();
		$('div.sharelist').remove();
	});

	// Login
	$('#loginsubmit').live('click', function() {
		if (logging_in == false)
		{
			logging_in = true;
			wunderlist.account.login();
			setTimeout(function() {logging_in = false}, 2000);
			return false;
		}
	});

	// Register
	$('#registersubmit').live('click', function() {
		if (logging_in == false)
		{
			logging_in = true;
			wunderlist.account.register(true);
			setTimeout(function() {logging_in = false}, 2000);
			return false;
		}
	});

	// Login or Register on RETURN and close dialog on ESCAPE
	$('#login-email,#login-password').live('keyup', function(evt) {
		if (evt.keyCode == 13 && logging_in == false)
		{
			logging_in = true;
			wunderlist.account.login();
			setTimeout(function() {logging_in = false}, 2000);
		}
		else if (evt.keyCode == 27)
		{
			wunderlist.account.loadInterface('no_thanks');
		}
	})

	$('#forgot-pwd').live('click', function() {
		wunderlist.account.forgotpw();
	});

	menu.remove();
};

/**
 * Validate the login or registration data
 *
 * @author Daniel Marschner
 */
wunderlist.account.validate = function(email, password) {
	var valid = true;
	
	// Validate email
	if (email == '' || email.toLowerCase() == 'email')
	{
		valid = false;
		wunderlist.account.showEmailError(wunderlist.language.data.email_not_empty);
	}	
	else if (wunderlist.account.validateEmail(email) == false)
	{
		valid = false;
		wunderlist.account.showEmailError(wunderlist.language.data.error_invalid_email);
	}
	
	// Validate password
	//if (password == '' || password.toLowerCase() == 'password')
	if (password === '')
	{
		valid = false;
		wunderlist.account.showPasswordError(wunderlist.language.data.password_not_empty);
	}
	
	return valid;
};

/**
 * Show command errors at the password error p tag
 *
 * @author Daniel Marschner
 */
wunderlist.account.showError = function(msg) {
	$('input.input-red').removeClass('input-red');
	$('p.error-email').text('');
	$('p.error-password').hide().text('').fadeIn("fast").text(msg);
};

/**
 * Show errors on password forgot dialog
 *
 * @author Marvin Labod
 */
wunderlist.account.showForgotPasswordError = function(msg) {
	$('.forgotpwbuttons div.errorwrap').fadeIn();
	$('p.error-forgotpw').hide().text('').fadeIn("fast").text(msg);
};

/**
 * Show email spezific errors on login or registration
 *
 * @author Daniel Marschner
 */
wunderlist.account.showEmailError = function(msg) {
	var pClass = '';
	
	if ($(".showlogindialog").is(':visible'))
	{
		pClass = '.showlogindialog ';
		$('input#login-email').addClass('input-red');
	}
	else
	{
		pClass = '.showregisterdialog ';
		$('input#register-email').addClass('input-red');
	}
	
	$(pClass + 'p.error-email').hide().text('').fadeIn("fast").text(msg);
};

/**
 * Show password spezific error on login or registration
 *
 * @author Daniel Marschner
 */
wunderlist.account.showPasswordError = function(msg) {
	var pClass = '';
	
	if ($(".showlogindialog").is(':visible'))
	{
		pClass = '.showlogindialog ';
		$('input#login-password').addClass('input-red');
	}
	else
	{
		pClass = '.showregisterdialog ';
		$('input#register-password').addClass('input-red');
	}
	
	$(pClass + 'p.error-password').hide().text('').fadeIn("fast").text(msg);
};

/**
 * Log into sync account
 *
 * @author Dennis Schneider
 */
wunderlist.account.login = function() {
	$('div.errorwrap p').text('');
	$('input.input-red').removeClass('input-red');

	var data = {
		'email'    : $.trim($('input#login-email').val().toLowerCase()),
		'password' : $.trim($('input#login-password').val()),
		'device'   : 'desktop',
		'version'  : parseInt(wunderlist.str_replace('.', '', Titanium.App.version.toString())),
		'offset'   : wunderlist.timer.getTimezoneOffset(),
		'language' : navigator.language
	};
	
	if (wunderlist.account.validate(data['email'], data['password']) == true)
	{
		var newsletter = $('input#login-newsletter').attr('checked');
	
		if (newsletter == true)
			data['newsletter'] = 1;
		
		data['password'] = Titanium.Codec.digestToHex(Titanium.Codec.MD5, data['password']);
		
		Layout.startLoginAnimation();

		$.ajax({
			url     : this.loginUrl,
			type    : 'POST',
			data    : data,
			timeout : settings.REQUEST_TIMEOUT,
			success : function(response_data, text, xhrobject) {
				if (xhrobject.status == 0)
				{
					dialogs.showErrorDialog(wunderlist.language.data.no_internet);
				}
				else if (xhrobject.status == 200)
				{
					var response = JSON.parse(response_data);

					switch (response.code)
					{
						case wunderlist.account.status_codes.LOGIN_SUCCESS:

							// Clear old database
							wunderlist.database.truncate();

							// Save user
							wunderlist.account.createUser(data['email'], data['password']);
							
							// Synchronize data
							$('#sync').click();
							
							break;

						case wunderlist.account.status_codes.LOGIN_FAILURE:

							Layout.stopLoginAnimation();
							wunderlist.account.showPasswordError(wunderlist.language.data.error_login_failed);

							break;

						case wunderlist.account.status_codes.LOGIN_DENIED:

							Layout.stopLoginAnimation();
							wunderlist.account.showPasswordError(wunderlist.language.data.error_login_failed);

							break;

						case wunderlist.account.status_codes.LOGIN_NOT_EXIST:

							var buttonOptions = {};
							buttonOptions[wunderlist.language.data.list_delete_no] = function() {$(this).dialog('close')};
							buttonOptions[wunderlist.language.data.register_create_user] = function() {
								if (logging_in == false)
								{
									logging_in = true;
									wunderlist.account.register(false, true);
									$(this).dialog('close');
									// Hide the wood texture
									$('div.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
									setTimeout(function() {logging_in = false}, 5000);
								}
							};

							create_user_dialog = $('<div></div>')
								.dialog({
									autoOpen: false,
									resizable: false,
									draggable: false,
									dialogClass: 'dialog-delete-list',
									title: wunderlist.language.data.register_question,
									buttons: buttonOptions
							});
							Layout.stopLoginAnimation();
							dialogs.openDialog(create_user_dialog);
							
							break;

						default:
							Layout.stopLoginAnimation();
							dialogs.showErrorDialog(wunderlist.language.data.error_occurred);

							break;
					}
				}
			},
			error: function(xhrobject)
			{
				dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
				Layout.stopLoginAnimation();
			}
		});
	}
};

/**
 * Sends a new password to user email
 *
 * @author Dennis Schneider
 */
wunderlist.account.forgotpw = function() {
	var data = {'email' : $.trim($('input#forgotpw-email').val().toLowerCase())};

	if (wunderlist.is_email(data['email']))
	{	
		$.ajax({
			url     : this.forgotPasswordUrl,
			type    : 'POST',
			data    : data,
			timeout : settings.REQUEST_TIMEOUT,
			success : function(response_data, text, xhrobject) {
				if (xhrobject.status == 0)
				{
					showErrorDialog(wunderlist.language.data.no_internet);
				}
				else if (xhrobject.status == 200)
				{
					var response = JSON.parse(response_data);

					switch(response.code)
					{
						case wunderlist.account.status_codes.PASSWORD_SUCCESS:

							wunderlist.account.showForgotPasswordError(wunderlist.language.data.password_success);

							break;

						case wunderlist.account.status_codes.PASSWORD_INVALID_EMAIL:

							wunderlist.account.showForgotPasswordError(wunderlist.language.data.invalid_email);

							break;

						case wunderlist.account.status_codes.PASSWORD_FAILURE:

							wunderlist.account.showForgotPasswordError(wunderlist.language.data.password_failed);

							break;

						default:

							dialogs.showErrorDialog(wunderlist.language.data.error_occurred);

							break;
					}
				}
			}
		});
	}
	else
	{
		wunderlist.account.showForgotPasswordError(wunderlist.language.data.invalid_email);
	}
};

/**
 * Register new user at sync server
 *
 * @author Dennis Schneider
 */
wunderlist.account.register = function(onlyRegister, registerOnLogin) {
	$('div.errorwrap p').text('');
	$('input.input-red').removeClass('input-red');

	if (onlyRegister == undefined)
	{
		onlyRegister = false;
	}
	
	if (registerOnLogin == undefined)
	{
		registerOnLogin = false;
	}
	
	var data = {
		'email'    : (registerOnLogin == true) ? $.trim($('input#login-email').val().toLowerCase()) : $.trim($('input#register-email').val().toLowerCase()),
		'password' : (registerOnLogin == true) ? $.trim($('input#login-password').val()) : $.trim($('input#register-password').val()),
		'device'   : 'desktop',
		'version'  : parseInt(wunderlist.str_replace('.', '', Titanium.App.version.toString())),
		'offset'   : wunderlist.timer.getTimezoneOffset(),
		'language' : navigator.language
	};

	if (wunderlist.account.validate(data['email'], data['password']) == true)
	{
		var newsletter = $('input#register-newsletter').attr('checked');
	
		if (newsletter == true)
			data['newsletter'] = 1;
		
		data['password'] = Titanium.Codec.digestToHex(Titanium.Codec.MD5, data['password']);
		
		Layout.startLoginAnimation();

		$.ajax({
			url     : this.registerUrl,
			type    : 'POST',
			data    : data,
			timeout : settings.REQUEST_TIMEOUT,
			success : function(response_data, text, xhrobject) {
				if (xhrobject.status == 0)
				{
					dialogs.showErrorDialog(wunderlist.language.data.no_internet);
				}
				else if(xhrobject.status == 200)
				{
					var response = JSON.parse(response_data);

					switch(response.code)
					{
						case wunderlist.account.status_codes.REGISTER_SUCCESS:

							// Save user
							wunderlist.account.createUser(data['email'], data['password']);

							// Create standard elements
							wunderlist.database.createStandardElements();

							// Load interface
							wunderlist.account.loadInterface();

							// And sync in baby!
							$('#sync').click();

							// Hide the wood texture
							$('div.ui-widget-overlay').removeClass('ui-widget-overlay-wood');

							break;

						case wunderlist.account.status_codes.REGISTER_DUPLICATE:

							if(onlyRegister == true)
							{
								dialogs.showErrorDialog(wunderlist.language.data.error_duplicated_email);
								Layout.stopLoginAnimation();
							}
							else
							{
								wunderlist.login();
								dialogs.closeDialog(register_dialog);
							}

							break;

						case wunderlist.account.status_codes.REGISTER_INVALID_EMAIL:

							Layout.stopLoginAnimation();
							wunderlist.account.showEmailError(wunderlist.language.data.invalid_email);

							break;

						case wunderlist.account.status_codes.REGISTER_FAILURE:

							Layout.stopLoginAnimation();
							wunderlist.account.showEmailError(wunderlist.language.data.registration_failed);

							break;

						default:

							Layout.stopLoginAnimation();
							dialogs.showErrorDialog(language.error_occurred);

							break;
					}
				}
			},
			error: function(xhrobject)
			{
				dialogs.showErrorDialog(wunderlist.language.data.register_error);
				Layout.stopLoginAnimation();
			}
		});
	}
};

/**
 * Change e-mail address or password
 *
 * @author Christian Reber
 */
wunderlist.account.editProfile = function() {
	if ($("[role='dialog']").length == 0)
	{
		edit_profile_dialog = $('<div></div>').html(html.generateEditProfileDialogHTML()).dialog({
			autoOpen      : false,
			draggable     : false,
			resizable     : false,
			modal         : true,
			closeOnEscape : true,
			dialogClass   : 'dialog-edit-profile',
			title         : wunderlist.language.data.edit_profile_title,
			open          : function() {
				$('#new_email').val('');
				$('#new_password').val('');
				$('#old_password').val('');
				$('.error').hide().fadeIn("fast").text('');
				$('#new_email').blur();
			}
		});

		dialogs.openDialog(edit_profile_dialog);
		
	    $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');

		// Disconnect the live functionality
		$('#cancel_edit_profile').die();
		$('#submit_edit_profile').die();
		$('#new_email,#new_password,#old_password').die();

		// Login or Register on RETURN and close dialog on ESCAPE
		$('#new_email,#new_password,#old_password').live('keyup', function(evt) {
			if(evt.keyCode == 13)
				wunderlist.account.change_profile_data();
			else if(evt.keyCode == 27)
				$(edit_profile_dialog).dialog('close');
		});

		// Close Edit Profile Dialog
		$('#cancel_edit_profile').live('click', function() {
			$(edit_profile_dialog).dialog('close');
		});

		// Submit changed data
		$('#submit_edit_profile').live('click', function() {
			wunderlist.account.change_profile_data();
			return false;
		});
	}
};

/**
 * Change profile data - sends POST to server and changes password
 *
 * @author Christian Reber
 */
wunderlist.account.change_profile_data = function() {
	var user_credentials = wunderlist.account.getUserCredentials();
	
	var data = {
		'email'    : user_credentials['email'],
		'password' : user_credentials['password']
	};
	
	// Does the user wants to save a new email address?
	new_email_address = $('input#new_email').val().toLowerCase();
	if (new_email_address != '')
	{
		if (wunderlist.account.validateEmail(new_email_address))
			data['new_email'] = new_email_address;
		else
		{
			dialogs.showErrorDialog(wunderlist.language.data.invalid_email);
			return false;
		}
	}

	// Does the user wants to save a new password?
	new_password = $('input#new_password').val();
	if (new_password != wunderlist.language.data.new_password && new_password != '')
	{
		data['new_password'] = Titanium.Codec.digestToHex(Titanium.Codec.MD5, new_password);
	}

	// Does the user want to change something?
	if (data['new_email'] == undefined && data['new_password'] == undefined)
		return false;

	// Is the old password given and correct?
	if ($('#old_password').val() == '' || data['password'] != Titanium.Codec.digestToHex(Titanium.Codec.MD5, $('#old_password').val()))
	{
		dialogs.showErrorDialog(wunderlist.language.data.wrong_password);
		return false;
	}

	if (data['new_email'] != undefined || data['new_password'] != undefined)
	{
		$.ajax({
			url     : this.editAccountUrl,
			type    : 'POST',
			data    : data,
			timeout : settings.REQUEST_TIMEOUT,			
			success : function(response_data, text, xhrobject) {
				if(xhrobject.status == 0)
					dialogs.showErrorDialog(wunderlist.language.data.no_internet);
				else if(xhrobject.status == 200)
				{
					var response = JSON.parse(response_data);

					switch(response.code)
					{
						case wunderlist.account.status_codes.EDIT_PROFILE_SUCCESS:

							if(data['new_email'] == undefined)
								data['new_email'] = data['email'];
							if(data['new_password'] == undefined)
								data['new_password'] = data['password'];

							wunderlist.account.createUser(data['new_email'], data['new_password']);
							dialogs.closeDialog(edit_profile_dialog);
							dialogs.showOKDialog(wunderlist.language.data.changed_account_data);

							break;

						case wunderlist.account.status_codes.EDIT_PROFILE_AUTHENTICATION_FAILED:

							dialogs.showErrorDialog(wunderlist.language.data.authentication_failed);
							break;

						case wunderlist.account.status_codes.EDIT_PROFILE_EMAIL_ALREADY_EXISTS:

							dialogs.showErrorDialog(wunderlist.language.data.email_already_exists);
							break;

						case wunderlist.account.status_codes.EDIT_PROFILE_INVALID_EMAIL_ADDRESS:

							dialogs.showErrorDialog(wunderlist.language.data.error_invalid_email);
							break;

						default:

							dialogs.showErrorDialog(wunderlist.language.data.error_occurred);

							break;
					}
				}
			},
			error: function(msg) {
				dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
			}
		});
	}
};

/**
 * Delete the account
 *
 * @author Dennis Schneider
 */
wunderlist.account.deleteAccount = function() {
	if ($("[role='dialog']").length == 0)
	{
		var html_code =	'<p>' + wunderlist.language.data.delete_account_desc + '</p>' +
		'<input class="input-normal"          type="text"     id="delete_email" name="delete_email" placeholder="' + wunderlist.language.data.email + '" />' +
		'<input class="input-normal"          type="password" id="delete_password" name="delete_password" placeholder="'+ wunderlist.language.data.password + '" />' +
		'<p class="clearfix"><input class="input-button register" type="submit"   id="submit_delete_profile" value="' + wunderlist.language.data.delete_account + '" />'+
		'<input class="input-button"          type="submit"   id="cancel_delete_profile" value="' + wunderlist.language.data.cancel + '" /></p>' +

		'<span class="error"></span>';

		delete_account_dialog = $('<div></div>').html(html_code).dialog({
				autoOpen: false,
				draggable: false,
				resizable: false,
				modal: true,
				dialogClass: 'dialog-edit-profile',
				closeOnEscape: true,
				title: wunderlist.language.data.delete_account_title,
				open: function()
				{
					$('#delete_email').val('');
					$('#delete_password').val('');
					$('#delete_email').blur();
				}
		});

		dialogs.openDialog(delete_account_dialog);
	
		$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');

		// Login or Register on RETURN and close dialog on ESCAPE
		$('#delete_email,#delete_password').live('keyup', function(evt) {
			if (evt.keyCode == 13)
			{
				wunderlist.account.delete_account_data();
			}
			else if(evt.keyCode == 27)
			{
				$(delete_account_dialog).dialog('close');
			}
		});

		// Close Edit Profile Dialog
		$('#cancel_delete_profile').live('click', function() {
			$(delete_account_dialog).dialog('close');
		});

		// Submit changed data
		$('#submit_delete_profile').live('click', function() {
			wunderlist.account.delete_account_data();
			return false;
		});
 	} 
};

/**
 * Delete the account - sends POST to server and deletes account
 *
 * @author Dennis Schneider
 */
wunderlist.account.delete_account_data = function() {
	var valid = true;
	var ucs   = wunderlist.account.getUserCredentials();
	
	var data = {
		'email'    : $.trim($('input#delete_email').val().toLowerCase()),
		'password' : Titanium.Codec.digestToHex(Titanium.Codec.MD5, $.trim($('input#delete_password').val()))
	};
	
	if (ucs['email'] != data['email'])
		valid = false;
	if (ucs['password'] != data['password'])
		valid = false;
	
	if(valid == true)
	{
		$.ajax({
			url     : this.deleteAccountUrl,
			type    : 'POST',
			data    : data,
			timeout : settings.REQUEST_TIMEOUT,			
			success : function(response_data, text, xhrobject) {
				if (xhrobject.status == 0)
				{
					showErrorDialog(language.no_internet);
				}
				else if (xhrobject.status == 200)
				{
					var response = JSON.parse(response_data);

					switch(response.code)
					{
						case wunderlist.account.status_codes.DELETE_ACCOUNT_SUCCESS:
							dialogs.closeDialog(delete_account_dialog);
							wunderlist.account.logout();
							dialogs.showConfirmationDialog();							
							break;

						case wunderlist.account.status_codes.DELETE_ACCOUNT_NOT_EXISTS:
							dialogs.showErrorDialog(wunderlist.language.data.sync_not_exist);
							break;

						case wunderlist.account.status_codes.DELETE_ACCOUNT_INVALID_EMAIL:
							dialogs.showErrorDialog(wunderlist.language.data.error_invalid_email);
							break;

						case wunderlist.account.status_codes.DELETE_ACCOUNT_FAILURE:
							dialogs.showErrorDialog(wunderlist.language.data.delete_account_failure);
							break;

						case wunderlist.account.status_codes.DELETE_ACCOUNT_DENIED:
							dialogs.showErrorDialog(wunderlist.language.data.delete_account_denied);
							break;

						default:
							dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
							break;
					}
				}
			},
			error: function(msg) {
				dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
			}
		});
	}
};

/**
 * Logs the user out
 *
 * @author Dennis Schneider
 */
wunderlist.account.logout = function() {
	if (wunderlist.sync.isSyncing == false)
	{
		wunderlist.setTitle('Wunderlist');
		
		// Remove all user data
		wunderlist.database.truncate();
		wunderlist.account.logUserOut();
		settings.clear_last_opened_list();

		// Clear Interface
		$('#content').html('');
		$('#lists a.list').remove();
		menu.remove();
		
		dialogs.closeEveryone();
		
		// Show register Dialog
		wunderlist.account.showRegisterDialog();
		Titanium.UI.setBadge(null);
	}
	else
	{
		dialogs.showWhileSyncDialog(wunderlist.language.data.no_logout_sync);
	}
};

/**
 * Shows the invite dialog
 *
 * @author Daniel Marschner
 */
wunderlist.account.showInviteDialog = function() {
	if ($("[role='dialog']").length == 0)
	{
		var inviteEventListener = 0;
	
		invite_dialog = dialogs.generateDialog(wunderlist.language.data.invite, html.generateSocialDialogHTML(), 'dialog-social');
		dialogs.openDialog(invite_dialog);
	
		$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
	
		$('div#invitebox input#send_invitation').live('click', function(){
			input = $('div#invitebox input#email');
	
			if(input.val() != wunderlist.language.data.invite_email && wunderlist.account.validateEmail(input.val()))
				wunderlist.account.invite();
			else
				input.select();
		});
	
		// Invite on RETURN and close dialog on ESCAPE
		$('div#invitebox input#email').live('keyup', function(evt) {
			if (evt.keyCode == 13)
			{
				if(inviteEventListener == 0)
				{
					if($(this).val() != wunderlist.language.data.invite_email && wunderlist.account.validateEmail($(this).val()))
						wunderlist.account.invite();
					else
						$(this).select();
				}
	
				inviteEventListener++;
	
				setTimeout(function() {inviteEventListener = 0}, 100);
			}
		});
	
		// Fill on blur, if empty
		$('div#invitebox input#email').live('blur', function() {
			if ($(this).val() == '')
				$(this).val(wunderlist.language.data.invite_email);
		});
	
		// Clear on focus
		$('div#invitebox input#email').live('focus', function() {
			if ($(this).val() == wunderlist.language.data.invite_email)
				$(this).val('');
		});
	}
};

/**
 * Sends an invitation to the entered email address
 *
 * @author Daniel Marschner
 */
wunderlist.account.invite = function() {
	var valid = true;
	var ucs   = wunderlist.account.getUserCredentials();
	
	var data  = {
		'email'        : ucs['email'],
		'invite_email' : $.trim($('div#invitebox input#email').val().toLowerCase()),
		'invite_text'  : $.trim($('textarea#invite-text').val())
	};
	
	if (data['invite_email'] == '' || data['invite_email'] == undefined)
		valid = false;
	if (data['invite_text'] == '' || data['invite_text'] == undefined)
		valid = false;

	if (valid == true)
	{
		$.ajax({
			url     : this.inviteUrl,
			type    : 'POST',
			data    : data,
			timeout : settings.REQUEST_TIMEOUT,			
			success : function(response_data, text, xhrobject) {
				if (xhrobject.status == 0)
				{
					wunderlist.account.showInviteOKDialog(wunderlist.language.data.no_internet);
				}
				else if(xhrobject.status == 200)
				{
					var response = JSON.parse(response_data);

					switch(response.code)
					{
						case wunderlist.account.status_codes.INVITE_SUCCESS:

							settings.save_invited('true');
							
							if ($("[role='dialog']").length == 1)
							{
								var buttonOptions = {};
								buttonOptions['OK'] = function() {
									$(this).dialog('close');
									input.val(wunderlist.language.data.invite_email);
									dialogs.closeDialog(invite_dialog);
								};
								buttonOptions[wunderlist.language.data.invite_more] = function() { $(this).dialog('close'); input.select();	};
	
								inviteCloseDialog = $('<div></div>').dialog({
									autoOpen      : false,
									draggable     : false,
									resizable     : false,
									modal         : true,
									closeOnEscape : true,
									title         : wunderlist.language.data.invitation_success,
									buttons       : buttonOptions
								});
	
								dialogs.openDialog(inviteCloseDialog);
							}

							break;

						case wunderlist.account.status_codes.INVITE_INVALID_EMAIL:

							wunderlist.account.showInviteOKDialog(wunderlist.language.data.invitation_invalid_email);

							break;

						case wunderlist.account.status_codes.INVITE_FAILURE:

							wunderlist.account.showInviteOKDialog(wunderlist.language.data.invitation_error);

							break;

						default:

							wunderlist.account.showInviteOKDialog(wunderlist.language.data.error_occurred);

							break;
					}
				}
			},
			error: function(msg) {
				wunderlist.account.showInviteOKDialog(wunderlist.language.data.invite_email);
			}
		});
	}
};

/**
 * Open a confirm dialog for invitations
 *
 * @author Daniel Marschner
 */
wunderlist.account.showInviteOKDialog = function(title) {
	wunderlist.account.inviteOKDialog = $('<div></div>').dialog({
		autoOpen      : false,
		draggable     : false,
		modal         : true,
		resizable     : false,
		title         : title,
		closeOnEscape : true,
		buttons       : {
			'OK': function() {
				$(this).dialog('close');
				$(this).dialog('destroy');
				delete wunderlist.account.inviteOKDialog;
				input.val(wunderlist.language.data.invite_email);
				dialogs.closeDialog(invite_dialog);
			}
		}
	});
		
	dialogs.openDialog(wunderlist.account.inviteOKDialog);
};

/**
 * Smaller validation
 *
 * @author Christian Reber
 */
wunderlist.account.validateEmail = function(email) {
	var reg = /^([A-Za-z0-9_\-\.\+])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	if (reg.test(email) == false)
		return false;
	else
		return true;
};