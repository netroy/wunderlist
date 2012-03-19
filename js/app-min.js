/** backend/account.js**/
define("backend/account",["helpers/settings"],function(a,b){function d(){return c=a.getString("logged_in","false")==="true",c}"use strict";var c=!1;return{isLoggedIn:d}});

/** backend/sync.js**/
define("backend/sync",[],function(a){return"use strict",{}});

/** models/base.js**/
define("models/base",["libs/backbone"],function(a){var b=a.Model.extend({initialize:function(){}});return b});

/** models/list.js**/
define("models/list",["models/base"],function(a){"use strict";var b=a.extend({defaults:{online_id:0,position:0,deleted:0,shared:0,task_count:0,inbox:0},initialize:function(){return a.prototype.initialize(this,arguments)}});return b});

/** models/task.js**/
define("models/task",["models/base"],function(a){"use strict";var b=a.extend({initialize:function(){return a.prototype.initialize(this,arguments)}});return b});

/** views/base.js**/
define("views/base",["libs/jquery","libs/underscore","libs/backbone"],function(a,b,c,d){"use strict";var e=a(document),f=c.View.extend({initialize:function(){var c=this;return c.el=a(c.el),typeof c.template=="string"&&(c.template=b.template(c.template)),e.on("language_changed",function(a,b){c.render()}),b.bindAll(this,"render"),c},render:function(){var b=this,c;if(b.model===d)return;return b.template!==d&&(c=a(b.template(b.model.toJSON())),b.el instanceof a&&(b.el.replaceWith(c).remove(),delete b.el),b.el=c),b}});return f});

/** views/list.js**/
define("views/list",["libs/jquery","views/base","models/list","helpers/language"],function(a,b,c,d,e){"use strict";var f=b.prototype,g=b.extend({template:'<li<%= (inbox == 1)?" class=\'inbox\'":""%>><label><%=label%></label><span class="taskCount"><%=task_count%></span><a class="share"></a><a class="delete"></a><a class="edit"></a><a class="save"></a></li>',initialize:function(){return f.initialize.apply(this,arguments)},render:function(){var a=this,b=a.model,c=a.model.get("name"),e=d.data[c.toLowerCase()]||c;return a.model.set("label",e),f.render.apply(this,arguments)}});return g});

/** views/task.js**/
define("views/task",["libs/jquery","views/base","models/task"],function(a,b,c){"use strict";var d=b.extend({initialize:function(){return b.prototype.initialize(this,arguments)}});return d});

/** frontend/background.js**/
define("frontend/background",["libs/jquery","helpers/settings"],function(a,b,c){function i(c,g){typeof g!="string"&&(c&&c.target?g=a(c.target).attr("rel"):g="one"),d.attr("rel",g),f.attr("rel",g),a("a.active",e).removeClass("active"),a('a[rel="'+g+'"]',e).addClass("active"),b.setString("active_theme",g)}function j(){d=a("body"),g=a("#bottomBar a.backgroundSwitcher"),e=a(".backgroundList",g),f=a(".activeBackground",g),e.hide(),g.click(function(){e.fadeToggle(100)});var c,j;for(c=0,j=h.length;c<j;c++)e.append('<a class="icon" rel="'+h[c]+'"> </a>');e.delegate("a","click",i),i(null,b.getString("active_theme","one"))}"use strict";var d,e,f,g,h=["one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve"];return{init:j}});

/** frontend/dialogs.js**/
define("frontend/dialogs",[],function(a){return"use strict",{}});

/** frontend/filters.js**/
define("frontend/filters",["libs/jquery"],function(a,b){function d(){console.log("filters init")}"use strict";var c={};return c.init=d,c});

/** frontend/menu.js**/
define("frontend/menu",["libs/jquery","views/base","models/base","helpers/language","helpers/settings","backend/account","backend/sync","frontend/dialogs"],function(a,b,c,d,e,f,g,h,i){function k(){var b=new j;b.submenu=a("#bottomBar ul.menu");var c=b.addItem("account",i,"account"),k=b.addItem("settings",i,"settings"),l=b.addItem("downloads",i,"downloads"),m=b.addItem("about_us",i,"aboutus");c.addItem("invitation",f.showInviteDialog);if(f.isLoggedIn()){c.addItem("change_login_data",f.editProfile),c.addItem("delete_account",f.deleteAccount),c.addSeparator();var n=e.os==="web"?b:c;n.addItem("logout",function(){g.fireSync(!0)},"logout")}else c.addItem("sign_in",f.showRegisterDialog);var o=k.addItem("language",i,"language"),p=d.availableLang,q;a.each(p,function(a){q=o.addItem(p[a].translation),q.el.attr("class",a)}),o.el.delegate("li","click",function(a){d.setLanguage(a.currentTarget.className)}),k.addSeparator(),k.addItem("add_item_method",h.openSelectAddItemMethodDialog),k.addItem("switchdateformat",h.openSwitchDateFormatDialog),k.addItem("sidebar_position",h.openSidebarPositionDialog),k.addItem("delete_prompt_menu",h.openDeletePromptDialog);var r=e.getInt("enable_natural_date_recognition",0),s="enable_natural_date_recognition",t;r===1&&(s="disable_natural_date_recognition"),t=k.addItem(s,function(){var a=e.getInt("enable_natural_date_recognition",0);a===1?(e.setInt("enable_natural_date_recognition",0),t.setLabel("enable_natural_date_recognition")):(e.setInt("enable_natural_date_recognition",1),t.setLabel("disable_natural_date_recognition"))}),k.addSeparator(),k.addItem("reset_window_size",i),k.addItem("reset_note_window",i),m.addItem("knowledge_base","http://support.6wunderkinder.com/kb"),m.addItem("wunderkinder_tw","http://www.twitter.com/6Wunderkinder"),m.addItem("wunderkinder_fb","http://www.facebook.com/6Wunderkinder"),m.addSeparator(),m.addItem("changelog","http://www.6wunderkinder.com/wunderlist/changelog"),m.addItem("backgrounds",h.openBackgroundsDialog),m.addItem("about_wunderlist",h.openCreditsDialog),m.addItem("about_wunderkinder","http://www.6wunderkinder.com/"),l.addItem("iphone","http://itunes.apple.com/us/app/wunderlist-to-do-listen/id406644151"),l.addItem("ipad","http://itunes.apple.com/us/app/wunderlist-hd/id420670429"),l.addItem("android","http://market.android.com/details?id=com.wunderkinder.wunderlistandroid"),e.os!=="darwin"&&l.addItem("macosx","http://www.6wunderkinder.com/wunderlist/"),e.os!=="windows"&&l.addItem("windows","http://www.6wunderkinder.com/wunderlist/"),e.os!=="linux"&&l.addItem("linux","http://www.6wunderkinder.com/wunderlist/")}"use strict";var j=b.extend({tagName:"li",initialize:function(c,d,e){var f=this;b.prototype.initialize.apply(f,[]),f.label=c,f.bind("change:label",f.render),f.span=a("<span/>"),f.el.append(f.span),f.handler=d,f.cssClass=e,typeof d=="function"&&f.el.click(d)},addItem:function(b,c,d){var e=this,f=new j(b,c,d);return typeof e.submenu=="undefined"&&(e.submenu=a("<ul/>").addClass(e.cssClass),e.el.append(e.submenu)),this.submenu.append(f.render().el),f},addSeparator:function(){this.submenu.append("<li class='separator' />")},clear:function(){this.submenu.remove(),this.el.remove()},setLabel:function(a){this.label=a,this.trigger("change:label")},render:function(){var a=this,b=a.el,c=a.span,e=a.cssClass,f=a.handler,g=a.label;return g=d.data[g]||g,typeof e!="undefined"&&b.addClass(e),typeof f=="string"?b.html("<a href="+f+" target='_blank'>"+g+"</a>"):c.html(g),a}});return{init:k}});

/** frontend/sharing.js**/
define("frontend/sharing",["libs/jquery","helpers/settings"],function(a,b,c){function d(){}return"use strict",{init:d}});

/** frontend/sidebar.js**/
define("frontend/sidebar",["libs/jquery","helpers/settings"],function(a,b,c){function j(){d=b.getString(h,"right")!=="right",e=b.getString(i,"true")==="true",f.toggleClass("sidebarleft",d),f.toggleClass("sidebarClosed",!e)}function k(){f.toggleClass("sidebarClosed",e),e=!e,b.setString(i,e)}function l(){return e}function m(){return!d}function n(a){a=a.toLowerCase(),!a.match(/^(left|right)$/)||(d=a==="left",b.setString(h,a)),j()}function o(){f=a("body"),g=a("a.toggleSidebar",".rightBottom"),j(),a(".rightBottom").delegate("a.toggleSidebar","click",k)}"use strict";var d,e,f,g,h="sidebar_position",i="sidebar_opened_status";return{init:o,isOpen:l,isSideBarRight:m,setSideBarPosition:n,initPosition:j,toggleSidebar:k}});
