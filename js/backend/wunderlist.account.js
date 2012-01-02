wunderlist.account       = wunderlist.account || {};
wunderlist.account.email = wunderlist.settings.getString('email', '');

var register_dialog;
var invite_dialog;
var inviteCloseDialog;
var forgot_password_dialog;
var edit_profile_dialog;
var delete_account_dialog;
var logging_in = false;

wunderlist.account.init = function() {
	this.syncDomain 	     = '';//'https://sync.wunderlist.net';
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

	load();
};

/**
 * Creates a user in the properties
 * @author Dennis Schneider
 */
function createUser(email, password) {
	wunderlist.settings.setString('logged_in', 'true');
	wunderlist.settings.setString('email', email);
	wunderlist.settings.setString('password', password);
	
	wunderlist.account.email = email;
							
	// Set the new app title, so the user can see which account is currently logged in
	wunderlist.helpers.utils.setTitle('Wunderlist - ' + email);
}

/**
 * Sets the user to logout
 * @author Dennis Schneider
 */
function logUserOut() {
	wunderlist.settings.setString('logged_in', 'false');
	deleteUserCredentials();
}

/**
 * Checks if the user is logged in
 *
 * @author Dennis Schneider
 */
wunderlist.account.isLoggedIn = function() {
	logged_in = wunderlist.settings.getString('logged_in', 'false');
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
	return {
		'email': wunderlist.settings.getString('email', ''),
		'password': wunderlist.settings.getString('password', '') // encrypted !
	};
};


/**
 * Removes the user credentials
 * @author Dennis Schneider
 */
function deleteUserCredentials() {
	wunderlist.settings.setString('email', '');
	wunderlist.settings.setString('password', '');
}

/**
 * Initializes the account dialog
 * @author Christian Reber
 */
function load() {
	if (wunderlist.account.isLoggedIn()) {
    $("body").removeClass("login");
		wunderlist.account.loadInterface();
		wunderlist.timer.set(4).start();
		$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
	} else {
    $("body").addClass("login");
		wunderlist.account.showRegisterDialog();
	}
}

/**
 * (Re)loads the interface and closes the registration dialog
 * @author Christian Reber, Dennis Schneider
 */
wunderlist.account.loadInterface = function() {
	if (register_dialog !== undefined) {
		// Hide the wood texture
		$('div.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
		
		$(register_dialog).dialog('close');
		$("#loginheader, #loginfooter").remove();
		$("body").removeClass("login");
	}
	
	var taskInput = $("input.input-add").val();

	wunderlist.frontend.sortdrop.makeListsDropable();
	wunderlist.frontend.sortdrop.makeFilterDropable();
	
	if (wunderlist.settings.os === 'darwin') {
		$('.input-add').focus().blur();
	}
	
	if (taskInput !== '') {
		$("input.input-add").val(taskInput);
	}

  var email = wunderlist.settings.getString('email', '');
  if($("#email").length) {
    $("#email").find("span").html(email);
  } else {
    $("#sync").after('<a id="email" class="filter loggedinas roundedboth"><span>'+email+'</span></a>');
  }
};

/**
 * Shows the register Dialog
 * @author Dennis Schneider
 * TODO: move dom stuff to frontend
 */
wunderlist.account.showRegisterDialog = function() {
	if ($("[role='dialog']").length === 0) {
		register_dialog = $('<div></div>')
			.html(html.generateLoginRegisterDialogHTML())
			.dialog({
				autoOpen: true,
				draggable: false,
				resizable: false,
				modal: false,
				closeOnEscape: false,
				dialogClass: 'dialog-login',
				title: wunderlist.language.english.register_title,
				open: function() {
					$('input#login-email').val('');
					$('input#login-password').val('');
					$('.error').hide().fadeIn("fast").text('');
					$('input#login-email').blur();
				}
		});

    var header = $("<div id='loginheader'></div>");
    header.append($("<h1/>").html(wunderlist.language.english.register_dialog_h1));
    header.append($("<h2/>").html(wunderlist.language.english.register_dialog_h2));
    header.append('<a class="seefeatures" href="http://6wunderkinder.com/wunderlist" target="_blank">see the features of Wunderlist</a>');
    header.append('<a class="visitblog" href="http://blog.wunderlist.com/" target="_blank">visit the blog of Wunderlist</a>');
    register_dialog.append('<div class="freewunderlist">free for every device</div>');
    
    var footer = $("<div id='loginfooter'></div>");
    var downloads = $('<div class="wkdownload"></div>');
		if (wunderlist.settings.os !== 'darwin') {
      downloads.append('<a class="mac" href="http://itunes.apple.com/app/wunderlist/id410628904?mt=12&ls=1">Download for Mac OSX</a>');
		}
		if (wunderlist.settings.os !== 'windows') {
      downloads.append('<a class="windows" href="http://www.6wunderkinder.com/downloads/wunderlist-1.2.2-win.msi">Download for Windows</a>');
		}
		if (wunderlist.settings.os !== 'linux') {
		  downloads.append('<a class="linux" href="http://www.6wunderkinder.com/downloads/wunderlist-1.2.4-linux-64.tgz">Download for Linux</a>');
		}
    downloads.append('<a class="ipad" href="http://itunes.apple.com/us/app/wunderlist-hd/id420670429">Download for iPad</a>');
    downloads.append('<a class="iphone" href="http://itunes.apple.com/us/app/wunderlist-to-do-listen/id406644151">Download for iPhone</a>');
    downloads.append('<a class="android" href="https://market.android.com/details?id=com.wunderkinder.wunderlistandroid">Download for Android</a>');
    
    footer.append(downloads);
    footer.append('<div class="wkseparator"></div>');
    var followus = footer.append('<div class="followus"></div>').find(".followus");
    var p = $("<p/>");
    p.append('<a class="followtwitter" target="_blank" href="http://www.twitter.com/6wunderkinder">Follow us on Twitter</a>');
    p.append('<a class="followfacebook" target="_blank" href="http://www.facebook.com/6wunderkinder">Follow Us on Facebook</a>');
    p.append('<a class="wklogowhite" href="http://www.6wunderkinder.com">6Wunderkinder</a>');
    followus.append('<div class="wklogo">6W</div>');
    followus.append(p);

	  register_dialog.parent().before(header).after(footer).attr("style", "");

	}

	wunderlist.layout.stopLoginAnimation();

	// Unbind the live functionality
	$('#cancelreg').die();
	$('#loginsubmit').die();
	$('#registersubmit').die();
	$('#login-email,#login-password').die();
	$('#forgot-pwd').die();

	// Close Register Dialog
	$('#cancelreg').live('click', function() {
		wunderlist.layout.startLoginAnimation();
		wunderlist.database.createStandardElements();
		wunderlist.account.loadInterface();
		$('div.sharelist').remove();
	});

	// Login
	$('#loginsubmit').live('click', function() {
		if (logging_in === false) {
			logging_in = true;
			wunderlist.account.login();
			setTimeout(function() {
			  logging_in = false;
			}, 2000);
			return false;
		}
	});

	// Register
	$('#registersubmit').live('click', function() {
		if (logging_in === false) {
			logging_in = true;
			wunderlist.account.register(true);
			setTimeout(function() {
			  logging_in = false;
			}, 2000);
			return false;
		}
	});

	// Login or Register on RETURN and close dialog on ESCAPE
	$('#login-email,#login-password').live('keyup', function(evt) {
		if (evt.keyCode === 13 && logging_in === false) {
			logging_in = true;
			wunderlist.account.login();
			setTimeout(function() {logging_in = false}, 2000);
		} else if (evt.keyCode === 27) {
			wunderlist.account.loadInterface('no_thanks');
		}
	})

	$('#forgot-pwd').live('click', function() {
		wunderlist.account.forgotpw();
	});

	wunderlist.menu.remove();
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
		'version'  : parseInt(wunderlist.helpers.utils.str_replace('.', '', Titanium.App.version.toString())),
		'offset'   : wunderlist.timer.getTimezoneOffset(),
		'language' : navigator.language
	};
	
	if (wunderlist.account.validate(data['email'], data['password']) == true)
	{
		var newsletter = $('input#login-newsletter').attr('checked');
	
		if (newsletter == true)
			data['newsletter'] = 1;
		
		data['password'] = Titanium.Codec.digestToHex(Titanium.Codec.MD5, data['password']);
		
		wunderlist.layout.startLoginAnimation();

		$.ajax({
			url     : this.loginUrl,
			type    : 'POST',
			data    : data,
			timeout : wunderlist.settings.REQUEST_TIMEOUT,
			success : function(response_data, text, xhrobject) {
				if (xhrobject.status == 0) {
					wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.no_internet);
				} else if (xhrobject.status === 200) {
					var response = JSON.parse(response_data);

					switch (response.code) {
						case wunderlist.account.status_codes.LOGIN_SUCCESS:

							// Clear old database
							wunderlist.database.truncate(function(err){
  							// Save user
  							createUser(data['email'], data['password']);

  							// Synchronize data
  							$('#sync').click();
							});
							break;
						case wunderlist.account.status_codes.LOGIN_FAILURE:
							wunderlist.layout.stopLoginAnimation();
							wunderlist.account.showPasswordError(wunderlist.language.data.error_login_failed);
							break;

						case wunderlist.account.status_codes.LOGIN_DENIED:
							wunderlist.layout.stopLoginAnimation();
							wunderlist.account.showPasswordError(wunderlist.language.data.error_login_failed);
							break;

						case wunderlist.account.status_codes.LOGIN_NOT_EXIST:

							var buttonOptions = {};
							buttonOptions[wunderlist.language.data.list_delete_no] = function() {
							  $(this).dialog('close');
							};
							buttonOptions[wunderlist.language.data.register_create_user] = function() {
								if (logging_in === false) {
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
							wunderlist.layout.stopLoginAnimation();
							wunderlist.helpers.dialogs.openDialog(create_user_dialog);
							
							break;

						default:
							wunderlist.layout.stopLoginAnimation();
							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_occurred);

							break;
					}
				}
			},
			error: function(xhrobject) {
				wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
				wunderlist.layout.stopLoginAnimation();
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
	if (wunderlist.helpers.utils.is_email(data['email'])) {	
		$.ajax({
			url     : this.forgotPasswordUrl,
			type    : 'POST',
			data    : data,
			timeout : wunderlist.settings.REQUEST_TIMEOUT,
			success : function(response_data, text, xhrobject) {
				if (xhrobject.status == 0) {
					showErrorDialog(wunderlist.language.data.no_internet);
				} else if (xhrobject.status == 200) {
					var response = JSON.parse(response_data);

					switch(response.code) {
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
							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
							break;
					}
				}
			}
		});
	} else {
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

	if (onlyRegister === undefined) {
		onlyRegister = false;
	}
	
	if (registerOnLogin === undefined) {
		registerOnLogin = false;
	}
	
	var data = {
		'email'    : (registerOnLogin == true) ? $.trim($('input#login-email').val().toLowerCase()) : $.trim($('input#register-email').val().toLowerCase()),
		'password' : (registerOnLogin == true) ? $.trim($('input#login-password').val()) : $.trim($('input#register-password').val()),
		'device'   : 'desktop',
		'version'  : parseInt(wunderlist.helpers.utils.str_replace('.', '', Titanium.App.version.toString())),
		'offset'   : wunderlist.timer.getTimezoneOffset(),
		'language' : navigator.language
	};

	if (wunderlist.account.validate(data['email'], data['password']) === true) {
		var newsletter = $('input#register-newsletter').attr('checked');
	
		if (newsletter === true) {
		  data['newsletter'] = 1;
		}

		data['password'] = Titanium.Codec.digestToHex(Titanium.Codec.MD5, data['password']);
		
		wunderlist.layout.startLoginAnimation();

		$.ajax({
			url     : this.registerUrl,
			type    : 'POST',
			data    : data,
			timeout : wunderlist.settings.REQUEST_TIMEOUT,
			success : function(response_data, text, xhrobject) {
				if (xhrobject.status === 0) {
					wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.no_internet);
				} else if(xhrobject.status == 200) {
					var response = JSON.parse(response_data);

					switch(response.code) {
						case wunderlist.account.status_codes.REGISTER_SUCCESS:

							// Save user
							createUser(data['email'], data['password']);

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

							if(onlyRegister === true) {
								wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_duplicated_email);
								wunderlist.layout.stopLoginAnimation();
							} else {
								wunderlist.login();
								wunderlist.helpers.dialogs.closeDialog(register_dialog);
							}

							break;

						case wunderlist.account.status_codes.REGISTER_INVALID_EMAIL:

							wunderlist.layout.stopLoginAnimation();
							wunderlist.account.showEmailError(wunderlist.language.data.invalid_email);

							break;

						case wunderlist.account.status_codes.REGISTER_FAILURE:

							wunderlist.layout.stopLoginAnimation();
							wunderlist.account.showEmailError(wunderlist.language.data.registration_failed);

							break;

						default:

							wunderlist.layout.stopLoginAnimation();
							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.error_occurred);

							break;
					}
				}
			},
			error: function(xhrobject) {
				wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.register_error);
				wunderlist.layout.stopLoginAnimation();
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

		wunderlist.helpers.dialogs.openDialog(edit_profile_dialog);
		
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
	if (new_email_address !== '') {
		if (wunderlist.account.validateEmail(new_email_address)){
		  data['new_email'] = new_email_address;
		}
	} else {
		wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.invalid_email);
		return false;
	}

	// Does the user wants to save a new password?
	new_password = $('input#new_password').val();
	if (new_password !== wunderlist.language.data.new_password && new_password !== '') {
		data['new_password'] = Titanium.Codec.digestToHex(Titanium.Codec.MD5, new_password);
	}

	// Does the user want to change something?
	if (data['new_email'] == undefined && data['new_password'] === undefined) {
	  return false;
	}

	// Is the old password given and correct?
	if ($('#old_password').val() === '' || data['password'] !== Titanium.Codec.digestToHex(Titanium.Codec.MD5, $('#old_password').val())) {
		wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.wrong_password);
		return false;
	}

	if (data['new_email'] != undefined || data['new_password'] != undefined) {
		$.ajax({
			url     : this.editAccountUrl,
			type    : 'POST',
			data    : data,
			timeout : wunderlist.settings.REQUEST_TIMEOUT,			
			success : function(response_data, text, xhrobject) {
				if(xhrobject.status === 0) {
				  wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.no_internet);
				}
					
				else if(xhrobject.status == 200) {
					var response = JSON.parse(response_data);

					switch(response.code) {
						case wunderlist.account.status_codes.EDIT_PROFILE_SUCCESS:

							if(data['new_email'] === undefined) {
							  data['new_email'] = data['email'];
							}
							if(data['new_password'] === undefined) {
							  data['new_password'] = data['password'];
							}

							createUser(data['new_email'], data['new_password']);
							wunderlist.helpers.dialogs.closeDialog(edit_profile_dialog);
							wunderlist.helpers.dialogs.showOKDialog(wunderlist.language.data.changed_account_data);

							break;

						case wunderlist.account.status_codes.EDIT_PROFILE_AUTHENTICATION_FAILED:

							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.authentication_failed);
							break;

						case wunderlist.account.status_codes.EDIT_PROFILE_EMAIL_ALREADY_EXISTS:

							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.email_already_exists);
							break;

						case wunderlist.account.status_codes.EDIT_PROFILE_INVALID_EMAIL_ADDRESS:

							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_invalid_email);
							break;

						default:

							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_occurred);

							break;
					}
				}
			},
			error: function(msg) {
				wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
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

		wunderlist.helpers.dialogs.openDialog(delete_account_dialog);
	
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
	
	if (ucs['email'] !== data['email']) {
	  valid = false;
	}
	if (ucs['password'] !== data['password']) {
	  valid = false;
	}

	if(valid === true) {
		$.ajax({
			url     : this.deleteAccountUrl,
			type    : 'POST',
			data    : data,
			timeout : wunderlist.settings.REQUEST_TIMEOUT,			
			success : function(response_data, text, xhrobject) {
				if (xhrobject.status == 0) {
					showErrorDialog(wunderlist.language.no_internet);
				} else if (xhrobject.status == 200) {
					var response = JSON.parse(response_data);

					switch(response.code) {
						case wunderlist.account.status_codes.DELETE_ACCOUNT_SUCCESS:
							wunderlist.helpers.dialogs.closeDialog(delete_account_dialog);
							wunderlist.account.logout();
							wunderlist.helpers.dialogs.showConfirmationDialog();							
							break;

						case wunderlist.account.status_codes.DELETE_ACCOUNT_NOT_EXISTS:
							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.sync_not_exist);
							break;

						case wunderlist.account.status_codes.DELETE_ACCOUNT_INVALID_EMAIL:
							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_invalid_email);
							break;

						case wunderlist.account.status_codes.DELETE_ACCOUNT_FAILURE:
							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.delete_account_failure);
							break;

						case wunderlist.account.status_codes.DELETE_ACCOUNT_DENIED:
							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.delete_account_denied);
							break;

						default:
							wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
							break;
					}
				}
			},
			error: function(msg) {
				wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
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
	if (wunderlist.sync.isSyncing() === false) {
		wunderlist.helpers.utils.setTitle('Wunderlist');
		
		// Remove all user data
		wunderlist.database.truncate(wundrlist.nop);
		logUserOut();

		wunderlist.settings.setString('last_opened_list', '1');

		// Clear Interface
		$('#content').html('');
		$('#lists a.list').remove();
		wunderlist.menu.remove();
		
		wunderlist.helpers.dialogs.closeEveryone();
		
		// Show register Dialog
		wunderlist.account.showRegisterDialog();
		Titanium.UI.setBadge(null);
	} else {
		wunderlist.helpers.dialogs.showWhileSyncDialog(wunderlist.language.data.no_logout_sync);
	}
};

/**
 * Shows the invite dialog
 *
 * @author Daniel Marschner
 */
wunderlist.account.showInviteDialog = function() {
	if ($("[role='dialog']").length === 0) {
		var inviteEventListener = 0;
	
		invite_dialog = wunderlist.helpers.dialogs.generateDialog(wunderlist.language.data.invite, html.generateSocialDialogHTML(), 'dialog-social');
		wunderlist.helpers.dialogs.openDialog(invite_dialog);
	
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
	
	if (data['invite_email'] === '' || data['invite_email'] === undefined || data['invite_text'] === '' || data['invite_text'] === undefined){
	  valid = false;
	}

	if (valid === true) {
		$.ajax({
			url     : this.inviteUrl,
			type    : 'POST',
			data    : data,
			timeout : wunderlist.settings.REQUEST_TIMEOUT,			
			success : function(response_data, text, xhrobject) {
				if (xhrobject.status === 0) {
					wunderlist.account.showInviteOKDialog(wunderlist.language.data.no_internet);
				} else if(xhrobject.status === 200) {
					var response = JSON.parse(response_data);

					switch(response.code) {
						case wunderlist.account.status_codes.INVITE_SUCCESS:

							wunderlist.settings.setString('invited', 'true');
							
							if ($("[role='dialog']").length === 1) {
								var buttonOptions = {};
								buttonOptions['OK'] = function() {
									$(this).dialog('close');
									input.val(wunderlist.language.data.invite_email);
									wunderlist.helpers.dialogs.closeDialog(invite_dialog);
								};

								buttonOptions[wunderlist.language.data.invite_more] = function() {
								  $(this).dialog('close');
								  input.select();
								};
	
								inviteCloseDialog = $('<div></div>').dialog({
									autoOpen      : false,
									draggable     : false,
									resizable     : false,
									modal         : true,
									closeOnEscape : true,
									title         : wunderlist.language.data.invitation_success,
									buttons       : buttonOptions
								});
	
								wunderlist.helpers.dialogs.openDialog(inviteCloseDialog);
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
				wunderlist.helpers.dialogs.closeDialog(invite_dialog);
			}
		}
	});
		
	wunderlist.helpers.dialogs.openDialog(wunderlist.account.inviteOKDialog);
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