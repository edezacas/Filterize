/*!
Filterize, a jQuery Plugin to filter select list
by Eduard Deza at Hiringo Team, http://hiringo.com

Version 1.0.0
Full source at https://github.com/edezacas/Filterize
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
			.append('<option class="filterize-no_results" value="no-results">'+this.options.titleText+'</option>');
			
			var parent = select.parent();
			parent.prepend('<div class="filterize-title">Selecciona un pais</div><div class="filterize-list"><ul></ul></div>');
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
				boxList.slideToggle(400);
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
        //Search input value on list
        fireSearch: function(){
	        
			var select = $(this.element),
				parent = select.parent(),
				boxList = parent.find('.filterize-list'),				
				list = parent.find('ul'),
				title = parent.find('.filterize-title');			        
	        
			// selected option
	
			list.on('click','li',function(){
				
				var isSearchField = $(this).hasClass('filterize-list-search');
				
				if(!isSearchField){
					var val = $(this).data("value"),
						texto = $(this).find("p").text();
						
					title.text(texto);
					boxList.slideUp(400);
					
					select.val(val);
					
					//Force Trigger change event
					select.trigger("change");					
						
					title.toggleClass('active');					
				}
	
			});		        
	        
			$('.filterize-list-search input').on('change', function(){ 
			    var filter = $(this).val(),
			    	list = 	parent.find('ul');	   

			    if(filter) {
			      // this finds all links in a list that contain the input,
			      // and hide the ones not containing the input while showing the ones that do
			      $(list).find("p:not(:Contains(" + filter + "))").parent().stop(true, false).slideUp();
			      $(list).find("p:Contains(" + filter + ")").parent().stop(true, false).slideDown();
			      $(list).find(".filterize-no_results").stop(true, false).slideUp(400);
			      
			      //No results
			      if(!$(list).find("p:Contains(" + filter + ")").length){
	
				      $(list).find(".filterize-no_results").stop(true, false).slideDown(400);
			      }
			      
			    } else {
					$(list).find(".filterize-no_results").stop(true, false).slideUp();				    
					$(list).find("li:not(.filterize-no_results)").slideDown(400);
			    }
			    
			    return false;
			  })
			.keyup( function () {
			    // fire the above change event after every letter
			    $(this).change();
			});			
	
			// custom css expression for a case-insensitive contains()
			jQuery.expr[':'].Contains = function(a,i,m){
			    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
			};	        
        },    

        callback: function() {
            // Cache onComplete option
            var onComplete = this.options.onComplete;

            if ( typeof onComplete === 'function' ) {
                onComplete.call(this.element);
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
        titleText: 'No results matched',
        onComplete: null
    };

})( jQuery, window, document );
