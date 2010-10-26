/**
 * Copyright (c) 2010, Jon Gilkison and Trunk Archive Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * This is a modified BSD license (the third clause has been removed).
 * The BSD license may be found here:
 * 
 * http://www.opensource.org/licenses/bsd-license.php
 */

(function($){
	
	var views={};						// retain a hashed array of views
	var currentView=null;				// the current view instance
	var defaultViewHash=null;			// the hash for the root view
	var rootView=null;					// the root view instance
	var nav=null;						// the navigator instance
	var backButton=null;				// the navigator's back button instance
	var applicationController=null;		// the application controller
	var appSettings=null;				// application settings
	var templates={};					// list of externally loaded system templates
	var pickers={};						// list of rendered picker templates as views
	var canTransition=false;
	var viewStack=[];
	var goingBack=false;
	var contentContainer=null;
	var navTitle=null;
	var nextNavTitle=null;
	var clickHandler='click';

	$.fn.extend({
		/**
		 * goToRoot - Navigates to the default root view
		 */
		goToRoot:function()
		{
			document.location=defaultViewHash;
		},
		
		/**
		 * goTo - Jumps to a view
		 */
		goTo:function(href)
		{
			document.location=href;
		},
		
		goBack:function()
		{
			goingBack=true;
			history.back();
		},
		
		/**
		 * grid - Renders a button grid
		 */
		grid:function(view){
			return this.each(function(){
				cols=$(this).attr('cols') || 1;
				spacing=$(this).attr('spacing') || 5;
				
				// god forgive me for what i am about to do.
				var table=$("<table>"); //fuck YEAH
				
				var items=$("*",this);
				
				var ccol=0;
				var crow=0;
				var citem=0;
				var tr=$("<tr>").appendTo(table);
				while(true){
					td=$("<td>").appendTo(tr).attr('width',(100/cols)+'%');
					$(items[citem]).appendTo(td);
					colspan=$(items[citem]).attr('span') || 1;
					if (colspan>1)
						td.attr('colspan',colspan);
						
					ccol+=colspan;
					if (ccol>=cols)
					{
						tr=$("<tr>").appendTo(table);
						ccol=0;
						crow++;
					}	
					
					citem++;
					if (citem>=items.length)
						break;
				}
				
				table.appendTo(this);
			});
		},	

		/**
		 * picker - Renders a listview item picker
		 */
		picker:function(view)
		{
			return this.each(function(){
				var picker=null;											// the picker instance
				var pickerFor=$(this).attr('field');						// the name of the field we are picking a value for
				var defaultValue=$(this).attr('defaultValue');				// the default value
				var defaultLabel=$(this).attr('defaultLabel') || 'None';	// the default label
				var valueField=$(this).attr('value-field') || pickerFor;			// the name of the field to fetch the value from
				var labelField=$(this).attr('label-field') || pickerFor;			// the name of the field to fetch the value from
				var pickerSource=$(this).attr('source');					// the name of the field to fetch the label from
				var pickerId='#picker-'+pickerFor;							// the id of the picker
				var pickerTitle=$(this).attr('title');						// title of the picker
				var pickerTemplate=$(this).attr('template');				// title of the picker
				var newView=$(this).attr('new-view');						// the name of the new view
				var liClass=$(this).attr('item-class');						// the class to apply to the li
				var allowNone=$(this).attr('allow-none');

				// render the hidden input to hold the value
				var hiddenInput=$('<input type="hidden" />').attr('name',pickerFor).val(defaultValue).appendTo(this);
				
				// create the link to trigger the picker
				var link=$("<a href='javascript:void(0);' />").html(defaultLabel).appendTo(this);
				link.bind('click',function(e){
					if (picker==null)
					{
						// get the picker template and viewize it
						picker=$.tmpl(templates['picker']).__view(pickerId);
						picker.appendTo(contentContainer);
					}
					
					// set the title of the picker so it will be picked up
					// when it's pushed onto the navigation stack
					picker.attr('title',pickerTitle);
					
					// get the list to hold our values and clear it out
					var list=$('ul.list',picker);
					$('li',list).remove();
					
					// if we allow the user to deselect the value
					if (allowNone)
					{
						li=$('<li />').addClass('none').appendTo(list).bind('click',function(e){
							hiddenInput.val(defaultValue);
							link.html(defaultLabel);
							$().goBack();
						});
						li.html(defaultLabel);
					}
					
					// load up the data from the data source
					// TODO: Specify cacheability, this hits the server
					// everytime.
					$.ajax({
						dataType: "json",
						url: pickerSource,
						success:function(data) {
							// create the items for the list based on the data returned.
							// TODO: Load More ...
							for(var i in data)
							{
								li=$('<li />').appendTo(list);
								li.get(0).pickerData={ data: data[i], index: i};
								
								if (liClass) 
									li.addClass(liClass);
								
								li.bind('click',function(e){
									hiddenInput.val(this.pickerData.data[valueField]);
									link.html(this.pickerData.data[labelField]);
									$().goBack();
								});
								
								// render the list item template
								$(pickerTemplate).tmpl(data[i]).appendTo(li);
							}
						}
					});
						
					// navigate to the picker
					$().goTo(pickerId);
				});
				
			});
		},
		
		/**
		 * __view - Wires up a view
		 */
		__view:function(viewId)
		{
			return this.each(function(){
				// hide the view
				
				var id=$(this).attr('id');
				var thisView=this;
				
				// TODO: Remove this hack
				// Saving a list of scrollers because iScroll needs to be refreshed() 
				// much later this current point in time.
				thisView.__scrollers=[];
				thisView.__scrollsSet=false;
				
				// add it to the hash of views
				this.hashId=viewId || '#'+id;
				
				// set the root view
				if ((this.hashId)==defaultViewHash)
					rootView=this;
					
				// TODO: fix this to query properties to know the correct
				// amount of padding
				//
				// $(this).css({
				// 	width: ($(document).width())+'px',
				// })
				
				// wire up the controller
				var controllerName=$(this).attr('controller') || id+'Controller';
				if (window[controllerName])
				{
					controller=new window[controllerName](appSettings,this);
					// normally i'd shit on circular references
					// but we need it here and since these views exist for a lifetime
					// memory issues don't really matter that much.
					controller.view=this;
					thisView.controller=controller;
				}
				
				// TODO: Encapsulate this way better, ie custom tags or UI tags
				$('scrollarea',this).each(function(){
					thisView.__scrollers.push(new iScroll(this,{desktopCompatibility:true}));
					
				});
				
				$('grid',this).grid(this);
				$('picker',this).picker(this);
				
				// create any nav bar item
				$('navButton',this).each(function(){
					title=$(this).attr('title');

					thisView.editButton=$('<a class="editButton">'+title+'</a>');
					
					href=$(this).attr('href');
					startChar=href.charAt(0);
					if (startChar=='!')
					{
						thisView.editButton.attr('href','javascript:void(0);');
						// controller action link
						thisView.editButton.bind(clickHandler,function(e){
							action=href.substring(1);
							if ((thisView.controller) && (thisView.controller[action]))
								thisView.controller[action](this);
							else if ((applicationController) && (applicationController[action]))
								applicationController[action](this);
								
							return false;
						});
					}
					else
						thisView.editButton.attr('href',href);
				});
				
				// hook up anchor links
				$('a',this).each(function(){
					
					// TODO: refactor this
					var href=$(this).attr('href');
					if (href)
					{
						startChar=href.charAt(0);
						if (startChar=='!')
						{
							$(this).attr('href','javascript:void(0);');
							// controller action link
							$(this).bind(clickHandler,function(e){
								action=href.substring(1);
								console.log(thisView.controller);
								if ((thisView.controller) && (thisView.controller[action]))
									thisView.controller[action](this);
								else if ((applicationController) && (applicationController[action]))
									applicationController[action](this);
								
								return false;
							});
						}
					}
				});
				
				// add this view to the list of views
				views[thisView.hashId]=thisView;
			});			
		},
		
		/**
		 * __navigateTo - navigates to a given #hash href, always use goTo.
		 */
		__navigateTo:function(href)
		{
			if (views[href])
			{
				if ((canTransition) && (currentView) && (!$(currentView).hasClass('transition')))
					$(currentView).addClass('transition');

				view=views[href];

				// if it's the current view, do nothing.
				if (view==currentView)
					return;
					
				// if the controller has a leave method, call it.  If it returns false
				// we don't leave the current view.  
				if ((currentView) && (currentView.controller) && (currentView.controller.leave))
					if (!currentView.controller.leave())
					{
						history.back();
						return;
					}
				
				// if the controller has an enter method, call it.  If it returns false
				// we don't leave the current view.
				if ((view.controller) && (view.controller.enter))
					if (!view.controller.enter())
					{
						history.back();
						return;
					}

				// TODO: CSS transitions
				if (currentView)
				{
					$(currentView).css({"-webkit-transform": "translate3d("+((goingBack) ? 100 : -100) +"%,0%,0%)"});
				}
				
				// remove the nav edit button	
				if ((nav) && (nav.editButton))
				{
					
					nav.editButton.detach();
					nav.editButton=null;
				}
					
				// toggle the back button
				if (nav) 
				{
					if ((rootView==view) || ($(view).attr('showBack')=='false'))
						backButton.hide();
					else
						backButton.show();
				}

				// set the titles
				document.title=$(view).attr('title');
				if (nav) 
				{
					navTitle.css({opacity: 0.0});
					
					if ((canTransition)&&(!navTitle.hasClass('transition')))
					{
						navTitle.addClass('transition');
						nextNavTitle.addClass('transition');
					}
					
					nextNavTitle.html(document.title);
					nextNavTitle.css({opacity:1.0});
					ont=nextNavTitle;
					nextNavTitle=navTitle;
					navTitle=ont;
				}
				
				// add the edit button and show it
				if ((nav) && (view.editButton))
				{
					
					nav.editButton=view.editButton;
					view.editButton.appendTo(nav);
				}
				
				//TODO: CSS Transitions
				$(view).removeClass('transition');
				$(view).css({"-webkit-transform": "translate3d("+((goingBack) ? 100 : -100) +",0%,0%)"});
				$(view).width();
				if (canTransition) $(view).addClass('transition');
				$(view).css({"-webkit-transform": "translate3d(0%,0%,0%)"});
				
				// kludge to get iscroll working, delays refresh so that the
				// view is visible when it does it.
				if ((view.__scrollsSet==false) && (view.__scrollers.length>0))
				{
					for (var i in view.__scrollers)
					{
						var scroller=view.__scrollers[i];
						setTimeout(function(){
							scroller.refresh();
						},500);
					}
					
					view.__scrollsSet=true;
				}
				
				currentView=view;
				goingBack=false;
			}
		},
		
		/**
		 * startApp - Starts the application
		 */
		startApp:function(settings)
		{
			clickHandler=(settings.touchCapable) ? 'touchstart' : 'click';

			// init the picker template, KLUDGE
			templates['picker']=$('<template><view><scrollarea><ul class="list"></ul></scrollarea></view></template>').template();
			
			// stash the settings
			appSettings=settings;
			
			// for iScroll
			document.addEventListener('touchmove', function(e){ e.preventDefault(); });
			
			return this.each(function(){
				
				// if there is an app controller defined, instantiate it and call it's init method
				if (window['appController'])
				{
					applicationController=new window['appController'](settings);
					if (applicationController.init)
						applicationController.init();
				}
				
				// set the default hash view
				defaultViewHash=$(this).attr('start');
				
				
				// if navigator has been specified, set it up
				// and add it to the DOM
				if ($(this).attr('navigator')=='true')
				{
					nav=$('<navigator />').prependTo('body');
					nav.editButton=null;
					backButton=$('<a href="javascript:void(0);" class="back">Back</a>').appendTo(nav);
					backButton.bind(clickHandler,function(){
						$().goBack();
					});
					
					navTitle=$('<navtitle />').appendTo(nav);
					nextNavTitle=$('<navtitle />').css({opacity: 0.0}).appendTo(nav);
				}
		
		
				contentContainer=$("<div id='content'>").css({
					position: 'absolute',
					left: '0px',
					right: '0px',
					top: ((nav) ? nav.height()+2 : 0)+'px',
					bottom: '0px',
					overflow: 'hidden'
				}).appendTo('body');
				
				// wire up the views
				$('view',this).each(function(){
					$(this).__view();
					$(this).detach();
					$(this).appendTo(contentContainer);
				});
				
				// hook into the document hash change
				$(window).hashchange(function()
				{
					var hash=(document.location.hash) ? document.location.hash : defaultViewHash;
					$().__navigateTo(hash);
				});
				
				// if loaded with a hash, jump to it, otherwise navigate to the default
				if(views[document.location.hash]!=undefined)
				{
					$().__navigateTo(document.location.hash);
				}
				else
					$().__navigateTo(defaultViewHash);
					
					setTimeout(function(){
						canTransition=true;
					},500);
			});
			

			
		} // startApp
	}); // extend
})(jQuery);
