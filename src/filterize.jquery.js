/*!
Filterize, a jQuery Plugin to filter select list
by Eduard Deza for Hiringo Team, http://hiringo.com

Version 1.0.0
Full source at https://github.com/edezacas/Filterize

MIT License, https://github.com/edezacas/Filterize/blob/master/LICENSE.md
*/

;(function ($, window, document, undefined) {
    
    var pluginName = 'filterize';

    function Plugin (element, options) {
        this.element = element;
        this._name = pluginName;
        this._defaults = $.fn[pluginName].defaults;
        this.options = $.extend( {}, this._defaults, options );

        this.init();
    }

    $.extend(Plugin.prototype, {

        // Initialization logic
        init: function () {
	        this.buildWrapper();
            this.buildSelect();
            this.buildCache();
            this.bindEvents();
        },
		//Build Wrapper for Select List
		buildWrapper: function(){
			var select = $(this.element);

			select
			.wrap('<div class="filterize-wrap"></div>')
			.append('<option class="filterize-no_results" value="no-results">'+this.options.noresultsText+'</option>');
			
			var parent = select.parent();
			parent.prepend('<div class="filterize-title">'+this.options.titleText+'</div><div class="filterize-list"><ul></ul></div>');
		},
		//Build Select Custom List
		buildSelect: function(){
			var select = $(this.element),
				parent = select.parent(),
				boxList = parent.find('.filterize-list'),
				list = parent.find('ul'),
				title = parent.find('.filterize-title');
										
			title.css('min-width',title.outerWidth());			
	
			for(var i = 0,len = select.children('option').length;i < len;i++){
				var option = select.children('option').eq(i),
					clase = option.attr("class");
				
				if(typeof clase == "undefined"){
					clase = "";
				}							
				
				list.append('<li class="'+ clase +'" data-value="' + option.val() + '"><p>'+option.text()+'</p></li>')
			}
	
			boxList.prepend('<div class="filterize-list-search"><input type="text" autocomplete="off" tabindex="1"></div>');
			
			select.hide();
	
			// open list	
			title.on('click', function(){
				boxList.stop(true, true).slideToggle();
				$(this).toggleClass('active');
			});				

			this.fireSearch();	
		},
        // Cache DOM nodes for performance
        buildCache: function () {
            this.$element = $(this.element);
        },

        // Bind events that trigger methods
        bindEvents: function() {
            var plugin = this;

            plugin.$element.on('filterize:update'+'.'+plugin._name, function() {
                plugin.update.call(plugin);
            });            
        },
        //Update Filterize after select modificated
        update: function() {

			var select = $(this.element),
				parent = select.parent(),
				boxList = parent.find('.filterize-list'),
				list = parent.find('ul');
										
			//Empty list before rebuild again
			list.empty();
			
			for(var i = 0,len = select.children('option').length;i < len;i++){
				var option = select.children('option').eq(i),
					clase = option.attr("class");
				
				if(typeof clase == "undefined"){
					clase = "";
				}							
				
				list.append('<li class="'+ clase +'" data-value="' + option.val() + '"><p>'+option.text()+'</p></li>')
			}							

        },          
        //Search input value on list
        fireSearch: function(){
	        
			var select = $(this.element),
				parent = select.parent(),
				boxList = parent.find('.filterize-list'),				
				list = parent.find('ul'),
				title = parent.find('.filterize-title');			        
	        
			// selected option
	
			list.on('click','li',function(){
				
				var val = $(this).data("value"),
					texto = $(this).find("p").text();
					
				title.text(texto);
				boxList.slideUp();
				
				select.val(val);
				
				//Trigger change event to notify
				select.trigger("change");					
					
				title.toggleClass('active');					
	
			});		        
	        
			$('.filterize-list-search input').on('change', function(){ 
			    var filter = $(this).val(),
			    	list = 	parent.find('ul')
			    	elNoRes = $(list).find(".filterize-no_results");	   

			    if(filter) {
			      // this finds all links in a list that contain the input,
			      // and hide the ones not containing the input while showing the ones that do
				  var matches = $(list).find('p:containsIN(' + filter + ')'),
				  	  matchesParent = matches.parent();
				  	  
				  $('li', list).not(matchesParent).stop(true, false).hide();
				  matchesParent.stop(true, false).show();
			      elNoRes.stop(true, false).hide();			     
			      
			      //No results
			      if(!matches.length){
				      elNoRes.stop(true, false).show();
			      }
			      
			    } else {
					elNoRes.stop(true, false).hide();				    
					$(list).find("li:not(.filterize-no_results)").show();
			    }
			    
			    return false;
			  })
			.keyup( function () {
			    // fire the above change event after every letter
			    $(this).change();
			});			


			//Make jQuery :contains Case-Insensitive		
			if($.fn.jquery != "1.8.0"){
				$.extend($.expr[":"], {
					"containsIN": function(a, i, m) {
						return (a.textContent || a.innerText || "").toLowerCase().indexOf((m[3] || "").toLowerCase()) >= 0;
					}
				});
			}
			else{
				//Fix conflict jQuery v.1.8.0
				jQuery.expr[":"].containsIN = jQuery.expr.createPseudo(function(arg) {
				    return function( elem ) {
				        return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
				    };
				});		
			}
		
        }

    });

    $.fn[pluginName] = function (options) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
        return this;
    };

    $.fn[pluginName].defaults = {
        titleText: 'Select an option',
	    noresultsText: 'No results matched'
    };

})( jQuery, window, document );
