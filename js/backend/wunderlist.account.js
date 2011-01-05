var account = account || {};
var register_dialog;
var invite_dialog;
var inviteCloseDialog;
var forgot_password_dialog;
var edit_profile_dialog;
var delete_account_dialog;
var logging_in = false;

account.init = function() {
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

	account.load();
}

/**
 * Initializes the account dialog
 *
 * @author Christian Reber
 */
account.load = function() {

	if(wunderlist.isUserLoggedIn())
	{
		account.loadInterface();
		timer.set(2).start();
	}
	else
		account.showRegisterDialog();
}

/**
 * (Re)loads the interface and closes the registration dialog
 *
 * @author Christian Reber, Dennis Schneider
 */
account.loadInterface = function() {
	if (register_dialog != undefined) $(register_dialog).dialog('close');
	
	Menu.initialize();
	wunderlist.initLists();
	filters.init();
	openList();
	makeListsDropable();

	if (os == 'darwin')
		// Stupid, but necessary workaround for Mac OS X
		$('.input-add').focus().blur();
}

/**
 * Shows the register Dialog
 *
 * @author Dennis Schneider
 */
account.showRegisterDialog = function() {
	if(register_dialog == undefined)
	{
		register_dialog = $('<div></div>')
			.html(generateLoginRegisterDialogHTML())
			.dialog({
				autoOpen: false,
				draggable: false,
				modal: true,
				dialogClass: 'dialog-login',
				title: language.data.register_title,
				open: function()
				{
					$('input#login-email').val('');
					$('input#login-password').val('');
					$('.error').hide().fadeIn("fast").text('');
					$('input#login-email').blur();
				}
		});
	}

	openDialog(register_dialog);

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
		wunderlist.createDatabaseStandardElements();
		account.loadInterface();
	});

	// Login
	$('#loginsubmit').live('click', function() {
		if(logging_in == false)
		{
			logging_in = true;
			account.login();
			setTimeout(function() {logging_in = false}, 2000);
			return false;
		}
	});

	// Register
	$('#registersubmit').live('click', function() {
		if(logging_in == false)
		{
			logging_in = true;
			account.register(true);
			setTimeout(function() {logging_in = false}, 2000);
			return false;
		}
	});

	// Login or Register on RETURN and close dialog on ESCAPE
	$('#login-email,#login-password').live('keyup', function(evt) {
		if(evt.keyCode == 13 && logging_in == false)
		{
			logging_in = true;
			account.login();
			setTimeout(function() {logging_in = false}, 2000);
		}
		else if(evt.keyCode == 27)
			account.loadInterface('no_thanks');
	})

	$('#forgot-pwd').live('click', function() {
		account.forgotpw();
	});
}

/**
 * Log into sync account
 *
 * @author Dennis Schneider
 */
account.login = function() {
	var data         = {};
 	data['email'] 	 = $('input#login-email').val().toLowerCase();
	data['password'] = $.md5($('input#login-password').val());
	
	var newsletter = $('input#login-newsletter').attr('checked');
	
	if (newsletter == true)
		data['newsletter'] = 1;

	if(sync.validateEmail(data['email']))
	{
		if($('input#login-password').val() == '')
		{
			$('.error').hide().fadeIn("fast").text(language.data.password_not_empty)
			return false;
		}

		Layout.startLoginAnimation();

		$.ajax({
			url: this.loginUrl,
			type: 'POST',
			data: data,
			success: function(response_data, text, xhrobject)
			{
				if(xhrobject.status == 0)
					showErrorDialog(language.data.no_internet);
				else if(xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case account.status_codes.LOGIN_SUCCESS:

							// Clear old database
							wunderlist.truncateDatabase();

							// Save user
							wunderlist.createUser(data['email'], data['password']);

							// Synchronize data
							$('#sync').click();

							break;

						case account.status_codes.LOGIN_FAILURE:

							Layout.stopLoginAnimation();
							$('.error').hide().fadeIn("fast").text(language.data.error_login_failed);

							break;

						case account.status_codes.LOGIN_DENIED:

							Layout.stopLoginAnimation();
							$('.error').hide().fadeIn("fast").text(language.data.error_login_failed);

							break;

						case account.status_codes.LOGIN_NOT_EXIST:

							var buttonOptions = {};
							buttonOptions[language.data.list_delete_no] = function() {$(this).dialog('close')};
							buttonOptions[language.data.register_create_user] = function() {
								if(logging_in == false)
								{
									logging_in = true;
									account.register();
									$(this).dialog('close');
									setTimeout(function() {logging_in = false}, 5000);
								}
							};

							create_user_dialog = $('<div></div>')
								.dialog({
									autoOpen: false,
									draggable: false,
									dialogClass: 'dialog-delete-list',
									title: language.data.register_question,
									buttons: buttonOptions
							});
							Layout.stopLoginAnimation();
							$(create_user_dialog).dialog('open');

							break;

						default:
							Layout.stopLoginAnimation();
							showErrorDialog(language.data.error_occurred);

							break;
					}
				}
			},
			error: function(xhrobject)
			{
				showErrorDialog(language.data.error_occurred);
				Layout.stopLoginAnimation();
			}
		});
	}
}

/**
 * Sends a new password to user email
 *
 * @author Dennis Schneider
 */
account.forgotpw = function()
{
	var data 		= {};
	data['email'] 	= $('input#login-email').val().toLowerCase();

	if(sync.validateEmail(data['email']))
	{
		$.ajax({
			url: this.forgotPasswordUrl,
			type: 'POST',
			data: data,
			success: function(response_data, text, xhrobject)
			{
				if(xhrobject.status == 0)
					showErrorDialog(language.data.no_internet);
				else if(xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case account.status_codes.PASSWORD_SUCCESS:

							$('.error').hide().fadeIn("fast").text(language.data.password_success);

							break;

						case account.status_codes.PASSWORD_INVALID_EMAIL:

							$('.error').hide().fadeIn("fast").text(language.data.invalid_email);

							break;

						case account.status_codes.PASSWORD_FAILURE:

							$('.error').hide().fadeIn("fast").text(language.data.password_failed);

							break;

						default:

							showErrorDialog(language.data.error_occurred);

							break;
					}
				}
			}
		});
	}
}

/**
 * Register new user at sync server
 *
 * @author Dennis Schneider
 */
account.register = function(onlyRegister)
{
	if (onlyRegister == undefined)
		onlyRegister = false;

	var data = {};
	data['email']    = $('input#login-email').val().toLowerCase();
	data['password'] = $.md5($('input#login-password').val());
	
	var newsletter = $('input#login-newsletter').attr('checked');
	
	if (newsletter == true)
		data['newsletter'] = 1;

	if (sync.validateEmail(data['email']))
	{
		if($('input#login-password').val() == '')
		{
			$('.error').hide().fadeIn("fast").text(language.data.password_not_empty)
			return false;
		}

		Layout.startLoginAnimation();

		$.ajax({
			url: this.registerUrl,
			type: 'POST',
			data: data,
			success: function(response_data, text, xhrobject)
			{
				if(xhrobject.status == 0)
					showErrorDialog(language.data.no_internet);
				else if(xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case account.status_codes.REGISTER_SUCCESS:

							// Save user
							wunderlist.createUser(data['email'], data['password']);

							// Create standard elements
							wunderlist.createDatabaseStandardElements();

							// Load interface
							account.loadInterface();

							// And sync in baby!
							$('#sync').click();

							break;

						case account.status_codes.REGISTER_DUPLICATE:

							if(onlyRegister == true)
							{
								showErrorDialog(language.data.error_duplicated_email);
								Layout.stopLoginAnimation();
							}
							else
							{
								wunderlist.login();
								closeDialog(register_dialog);
							}

							break;

						case account.status_codes.REGISTER_INVALID_EMAIL:

							Layout.stopLoginAnimation();
							$('.error').hide().fadeIn("fast").text(language.data.invalid_email);

							break;

						case account.status_codes.REGISTER_FAILURE:

							Layout.stopLoginAnimation();
							$('.error').hide().fadeIn("fast").text(language.data.registration_failed);

							break;

						default:

							Layout.stopLoginAnimation();
							showErrorDialog(language.error_occurred);

							break;
					}
				}
			},
			error: function(xhrobject)
			{
				showErrorDialog(language.data.register_error);
				Layout.stopLoginAnimation();
			}
		});
	}
}

/**
 * Change e-mail address or password
 *
 * @author Christian Reber
 */
account.editProfile = function() {

	if(edit_profile_dialog == undefined)
	{
		edit_profile_dialog = $('<div></div>')
			.html(generateEditProfileDialogHTML())
			.dialog({
				autoOpen: false,
				draggable: false,
				modal: true,
				dialogClass: 'dialog-edit-profile',
				title: language.data.edit_profile_title,
				open: function()
				{
					$('#new_email').val('');
					$('#new_password').val('');
					$('#old_password').val('');
					$('.error').hide().fadeIn("fast").text('');
					$('#new_email').blur();
				}
		});
	}

	openDialog(edit_profile_dialog);

	// Disconnect the live functionality
	$('#cancel_edit_profile').die();
	$('#submit_edit_profile').die();
	$('#new_email,#new_password,#old_password').die();

	// Login or Register on RETURN and close dialog on ESCAPE
	$('#new_email,#new_password,#old_password').live('keyup', function(evt) {
		if(evt.keyCode == 13)
			account.change_profile_data();
		else if(evt.keyCode == 27)
			$(edit_profile_dialog).dialog('close');
	});

	// Close Edit Profile Dialog
	$('#cancel_edit_profile').live('click', function() {
		$(edit_profile_dialog).dialog('close');
	});

	// Submit changed data
	$('#submit_edit_profile').live('click', function() {
		account.change_profile_data();
		return false;
	});
}

/**
 * Change profile data - sends POST to server and changes password
 *
 * @author Christian Reber
 */
account.change_profile_data = function() {
	var data = {};
	user_credentials 		= wunderlist.getUserCredentials();
	data['email'] 			= user_credentials['email'];
	data['password'] 		= user_credentials['password'];

	// Does the user wants to save a new email address?
	new_email_address = $('input#new_email').val().toLowerCase();
	if (new_email_address != '')
	{
		if (account.validateEmail(new_email_address))
			data['new_email'] = new_email_address;
		else
		{
			showErrorDialog(language.data.invalid_email);
			return false;
		}
	}

	// Does the user wants to save a new password?
	new_password = $('input#new_password').val();
	if (new_password != language.data.new_password && new_password != '')
	{
		data['new_password'] = $.md5(new_password);
	}

	// Does the user want to change something?
	if(data['new_email'] == undefined && data['new_password'] == undefined)
		return false;

	// Is the old password given and correct?
	if ($('#old_password').val() == '' || data['password'] != $.md5($('#old_password').val()))
	{
		showErrorDialog(language.data.wrong_password);
		return false;
	}

	if(data['new_email'] != undefined || data['new_password'] != undefined)
	{
		$.ajax({
			url: this.editAccountUrl,
			type: 'POST',
			data: data,
			success: function(response_data, text, xhrobject)
			{
				if(xhrobject.status == 0)
					showErrorDialog(language.data.no_internet);
				else if(xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case account.status_codes.EDIT_PROFILE_SUCCESS:

							if(data['new_email'] == undefined)
								data['new_email'] = data['email'];
							if(data['new_password'] == undefined)
								data['new_password'] = data['password'];

							wunderlist.createUser(data['new_email'], data['new_password']);
							closeDialog(edit_profile_dialog);
							showOKDialog(language.data.changed_account_data);

							break;

						case account.status_codes.EDIT_PROFILE_AUTHENTICATION_FAILED:

							showErrorDialog(language.data.authentication_failed);
							break;

						case account.status_codes.EDIT_PROFILE_EMAIL_ALREADY_EXISTS:

							showErrorDialog(language.email_already_exists);
							break;

						case account.status_codes.EDIT_PROFILE_INVALID_EMAIL_ADDRESS:

							showErrorDialog(language.error_invalid_email);
							break;

						default:

							showErrorDialog(language.data.error_occurred);

							break;
					}
				}
			},
			error: function(msg)
			{
				showErrorDialog(language.data.error_occurred);
			}
		});
	}
}

/**
 * Delete the account
 *
 * @author Dennis Schneider
 */
account.deleteAccount = function() {
	if(delete_account_dialog == undefined)
	{
		var html =

		'<p>' + language.data.delete_account_desc + '</p>' +
		'<input class="input-normal"          type="text"     id="delete_email" name="delete_email" placeholder="' + language.data.email + '" />' +
		'<input class="input-normal"          type="password" id="delete_password" name="delete_password" placeholder="'+ language.data.password + '" />' +
		'<input class="input-button register" type="submit"   id="submit_delete_profile" value="' + language.data.delete_account + '" />'+
		'<input class="input-button"          type="submit"   id="cancel_delete_profile" value="' + language.data.cancel + '" />' +

		'<span class="error"></div>';

		delete_account_dialog = $('<div></div>')
			.html(html)
			.dialog({
				autoOpen: false,
				draggable: false,
				modal: true,
				dialogClass: 'dialog-edit-profile',
				title: language.data.delete_account_title,
				open: function()
				{
					$('#delete_email').val('');
					$('#delete_password').val('');
					$('#delete_email').blur();
				}
		});

		$(delete_account_dialog).dialog('open');

		// Login or Register on RETURN and close dialog on ESCAPE
		$('#delete_email,#delete_password').live('keyup', function(evt) {
			if(evt.keyCode == 13)
			{
				account.delete_account_data();
			}
			else if(evt.keyCode == 27)
				$(delete_account_dialog).dialog('close');
		});

		// Close Edit Profile Dialog
		$('#cancel_delete_profile').live('click', function() {
			$(delete_account_dialog).dialog('close');
		});

		// Submit changed data
		$('#submit_delete_profile').live('click', function() {
			account.delete_account_data();
			return false;
		});
	}
	else
		$(delete_account_dialog).dialog('open');
}

/**
 * Delete the account - sends POST to server and deletes account
 *
 * @author Dennis Schneider
 */
account.delete_account_data = function() {
	var data = {};
	user_credentials 		= wunderlist.getUserCredentials();
	data['email'] 			= $('input#delete_email').val().toLowerCase();
	data['password'] 		= $.md5($('input#delete_password').val());

	if(data['email'] != undefined || data['password'] != undefined)
	{
		$.ajax({
			url: this.deleteAccountUrl,
			type: 'POST',
			data: data,
			success: function(response_data, text, xhrobject)
			{
				if(xhrobject.status == 0)
					showErrorDialog(language.no_internet);
				else if(xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case account.status_codes.DELETE_ACCOUNT_SUCCESS:
							account.logout();
							$(delete_account_dialog).dialog('close');
							showConfirmationDialog();
							break;

						case account.status_codes.DELETE_ACCOUNT_NOT_EXISTS:
							showErrorDialog(language.data.sync_not_exist);
							break;

						case account.status_codes.DELETE_ACCOUNT_INVALID_EMAIL:
							showErrorDialog(language.data.error_invalid_email);
							break;

						case account.status_codes.DELETE_ACCOUNT_FAILURE:
							showErrorDialog(language.data.delete_account_failure);
							break;

						case account.status_codes.DELETE_ACCOUNT_DENIED:
							showErrorDialog(language.data.delete_account_denied);
							break;

						default:
							showErrorDialog(language.data.error_occurred);
							break;
					}
				}
			},
			error: function(msg)
			{
				showErrorDialog(language.data.error_occurred);
			}
		});
	}
}

/**
 * Logs the user out
 *
 * @author Dennis Schneider
 */
account.logout = function()
{
	if(sync.isSyncing == false)
	{
		// Remove all user data
		wunderlist.truncateDatabase();
		wunderlist.logUserOut();
		clear_last_opened_list();

		// Clear Interface
		$('#content').html('');
		$('#lists a.list').remove();
		Menu.remove();

		// Show register Dialog
		account.showRegisterDialog();

		Titanium.UI.setBadge(null);
	}
	else
	{
		showWhileSyncDialog(language.data.no_logout_sync);
	}
}

/**
 * Shows the invite dialog
 *
 * @author Daniel Marschner
 */
account.showInviteDialog = function()
{
	var inviteEventListener = 0;

	if(invite_dialog == undefined)
		invite_dialog = generateDialog('', generateSocialDialogHTML(), 'dialog-social');

	openDialog(invite_dialog);

	$('div#invitebox input#send_invitation').live('click', function(){
		input = $('div#invitebox input#email');

		if(input.val() != language.data.invite_email && account.validateEmail(input.val()))
			account.invite();
		else
			input.select();
	});

	// Invite on RETURN and close dialog on ESCAPE
	$('div#invitebox input#email').live('keyup', function(evt) {
		if(evt.keyCode == 13)
		{
			if(inviteEventListener == 0)
			{
				if($(this).val() != language.data.invite_email && account.validateEmail($(this).val()))
					account.invite();
				else
					$(this).select();
			}

			inviteEventListener++;

			setTimeout(function() {inviteEventListener = 0}, 100);
		}
	});

	// Fill on blur, if empty
	$('div#invitebox input#email').live('blur', function() {
		if($(this).val() == '')
			$(this).val(language.data.invite_email);
	});

	// Clear on focus
	$('div#invitebox input#email').live('focus', function() {
		if($(this).val() == language.data.invite_email)
			$(this).val('');
	});
}

/**
 * Sends an invitation to the entered email address
 *
 * @author Daniel Marschner
 */
account.invite = function()
{
	var data  = {};
	var input = $('div#invitebox input#email');
	var text  = $('textarea#invite-text');

    if(wunderlist.isUserLoggedIn())
    {
        var user         = wunderlist.getUserCredentials();
    	data['email']    = user.email;
    }

    data['invite_email'] = input.val().toLowerCase();
	data['invite_text']  = text.val();

	if(sync.validateEmail(data['invite_email']))
	{
		$.ajax({
			url: this.inviteUrl,
			type: 'POST',
			data: data,
			success: function(response_data, text, xhrobject)
			{
				if(xhrobject.status == 0)
					account.showInviteOKDialog(language.data.no_internet);
				else if(xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case account.status_codes.INVITE_SUCCESS:

							save_invited('true');

							if(inviteCloseDialog == undefined)
							{
								var buttonOptions = {};

								buttonOptions['OK'] = function() {
									$(this).dialog('close');
									input.val(language.data.invite_email);
									closeDialog(invite_dialog);
								};
								buttonOptions[language.data.invite_more] = function() {
									$(this).dialog('close');
									input.select();
								};

								inviteCloseDialog = $('<div></div>').dialog({
									autoOpen: false,
									draggable: false,
									modal: false,
									title: language.data.invitation_success,
									buttons: buttonOptions
								});
							}

							openDialog(inviteCloseDialog);

							break;

						case account.status_codes.INVITE_INVALID_EMAIL:

							account.showInviteOKDialog(language.data.invitation_invalid_email);

							break;

						case account.status_codes.INVITE_FAILURE:

							account.showInviteOKDialog(language.data.invitation_error);

							break;

						default:

							account.showInviteOKDialog(language.data.error_occurred);

							break;
					}
				}
			},
			error: function(msg) {
				account.showInviteOKDialog(language.data.invite_email);
			}
		});
	}
}

/**
 * Open a confirm dialog for invitations
 *
 * @author Daniel Marschner
 */
account.showInviteOKDialog = function(title) {
	if(account.inviteOKDialog == undefined)
	{
		account.inviteOKDialog = $('<div></div>').dialog({
			autoOpen: false,
			draggable: false,
			modal: false,
			title: title,
			buttons: {
				'OK': function() {
					$(this).dialog('close');
					$(this).dialog('destroy');
					delete account.inviteOKDialog;
					input.val(language.data.invite_email);
					closeDialog(invite_dialog);
				}
			}
		});
	}
	openDialog(account.inviteOKDialog);
}

/**
 * Smaller validation
 *
 * @author Christian Reber
 */
account.validateEmail = function(email)
{
	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	if(reg.test(email) == false)
		return false;
	else
		return true;
}
