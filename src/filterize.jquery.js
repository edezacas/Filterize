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
				
				list.append('<li class="'+ clase +'" data-value="' + option.val() + '"><p>'+option.text()+'</p></li>');
			}
	
			boxList.prepend('<div class="filterize-list-search"><input type="text" autocomplete="off" tabindex="1"></div>');
			
			select.hide();
				
			//Close list when clicking outside it
			$(document).on('click', function(event) {
				  if (!$(event.target).closest(parent).length) {
					  if(boxList.is(":visible")) {
						  boxList.stop(true, true).slideUp();
						  title.toggleClass('active');
				      }					  					  
				  }
			});			
            
			this.fireSearch();	
		},
        // Cache DOM nodes for performance
        buildCache: function () {
            this.$element = $(this.element);
            this.$titleField = $(this.element).siblings('.filterize-title');
            this.$list = $(this.element).siblings('.filterize-list');
            this.$listBox = this.$list.find('ul');
            this.$searchField = this.$list.find('input').first();
            this.$currentListEle = this.getCurrentEle();
            
        },

        // Bind events that trigger methods
        bindEvents: function() {
            var plugin = this;
                                   
            plugin.$element.on('filterize:update'+'.'+plugin._name, function() {
                plugin.update.call(plugin);
            });  
            
            plugin.$titleField.on('click'+'.'+plugin._name, function() {
                plugin.toggleList.call(plugin);
            });              
            
            plugin.$list.on('click'+'.'+plugin._name, "li", function() {
                plugin.setSearchValue.call(plugin);
            });  
            
            plugin.$list.on('mouseover'+'.'+plugin._name, "li" ,function(event) {
                plugin.setListFocus.call(plugin, this);
            });                                         
            
            plugin.$searchField.on('keydown'+'.'+plugin._name, function(event) {                
                plugin.keypress_checker.call(plugin, event);
            });                                     
                                    
        },
        //Update Filterize after select modificated
        update: function() {

			var select = $(this.element),
				parent = select.parent(),
				boxList = this.$list,
				list = boxList.find('ul'),
				elNoRes = select.find(".filterize-no_results");
			
			if(!elNoRes.length){
				select.append('<option class="filterize-no_results" value="no-results">'+this.options.noresultsText+'</option>');
			}
													
			//Empty list before rebuild again
			list.empty();
			
			for(var i = 0,len = select.children('option').length;i < len;i++){
				var option = select.children('option').eq(i),
					clase = option.attr("class");
				
				if(typeof clase == "undefined"){
					clase = "";
				}							
				
				list.append('<li class="'+ clase +'" data-value="' + option.val() + '"><p>'+option.text()+'</p></li>');
			}							

        },   
        //Bind KeyDown
        keypress_checker: function(event){
          
          var stroke = event.which;
                                            
          switch (stroke){
            //Enter
            case 13:
                event.preventDefault();
                this.setSearchValue();
                break;                
            //KeyUp
            case 38:
                event.preventDefault();
                this.setPrevEle();                            
                break;
            //KeyDown   
            case 40:
                event.preventDefault();
                this.setNextEle();
                break;
              
          };            
        }, 
        
        //Set selected class to focus el
        setListFocus: function(el){                             
          
          this.removeListFocus(this.$currentListEle);          
          
          this.setCurrentEle(el);          
          this.$currentListEle.addClass("selected");                                         
        },
        
        //Remove selected class to old focus el
        removeListFocus: function(el){                    
          $(el).removeClass("selected");                                         
        },        

        //Toggle List 
        toggleList: function(){            
            this.$list.stop(true, true).slideToggle();
            this.$titleField.toggleClass('active');
                
            this.$searchField.trigger('focus');                        
        },    
        
        //Set current list value
        setCurrentEle: function(el){          
          this.$currentListEle = $(el);    
          return this.$currentListEle;         
        },
        
        //Get current list value
        getCurrentEle: function() {
            var current = this.$list.find("li.selected");
                        
          if(!current.length){                            
              current = this.$list.find("li").first().addClass("selected");              
          }
          
          return current;          
        },
        
        //Set next element to selected
        setNextEle: function(){
            var nextEl = this.$currentListEle.removeClass("selected").next();                        
            this.doSelected(nextEl);
        },
        
        //Set prev element to selected
        setPrevEle: function(){
            var prevEl = this.$currentListEle.removeClass("selected").prev();
            this.doSelected(prevEl);
        },    
        
        //Select currentEle and scrollTo
        doSelected: function(el){
            var high_bottom, high_top, maxHeight, visible_bottom, visible_top;
            
            el.addClass("selected");
            this.$currentListEle = this.getCurrentEle();
                        
            maxHeight = parseInt(this.$listBox.css("maxHeight"), 10);
            inputHeight = this.$searchField.outerHeight(true);  
            visible_top = this.$listBox.scrollTop();
            visible_bottom = maxHeight + visible_top;            
            high_top = this.$currentListEle.position().top + this.$listBox.scrollTop() - inputHeight - 10;
            high_bottom = high_top + this.$currentListEle.outerHeight(true);             
                                          
            if (high_bottom >= visible_bottom) {
              this.$listBox.scrollTop((high_bottom - maxHeight) > 0 ? high_bottom - maxHeight : 0);  
            } else if (high_top  < visible_top) {              
              this.$listBox.scrollTop(high_top);
            }            
                                          
        }, 
        
        //Set List Value 
        setSearchValue: function(){
            var val = this.$currentListEle.data("value"),
                texto = this.$currentListEle.find("p").text();            
                
            this.$titleField.text(texto);
            this.$list.slideUp();
            
            this.$element.val(val);
            
            //Trigger change event to notify
            this.$element.trigger("change");                   
                
            this.$titleField.toggleClass('active');                
        },
        //Search input value on list
        fireSearch: function(){
	        
			var select = $(this.element),
				parent = select.parent(),		
				list = parent.find('ul'),
				title = this.$titleField;			        
	        	        
	        
			$('.filterize-list-search input').on('change', function(){ 
			    var filter = $(this).val(),
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
