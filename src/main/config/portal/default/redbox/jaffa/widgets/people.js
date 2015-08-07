var PeopleWidgetBuilder = function($, jaffa) {
    var textClass = jaffa.widgets.baseWidget.extend({
        field: null,
        oldField: null,
        v2rules: {},

        deleteWidget: function() {
        	var titleFieldId= this.field+"foaf:title";
            var givenNameFieldId= this.field+"foaf:givenName";
            var familyNameFieldId= this.field+"foaf:familyName";
            var emailFieldId= this.field+"foaf:email";
            var dcIdentifierId = this.field+"dc:identifier";
            jaffa.form.ignoreField(titleFieldId);
            jaffa.form.ignoreField(givenNameFieldId);
            jaffa.form.ignoreField(familyNameFieldId);
            jaffa.form.ignoreField(emailFieldId);
            jaffa.form.ignoreField(dcIdentifierId);
            this.getContainer().remove();
        },
        // Identity has been altered, adjust the DOM for all fields
        domUpdate: function(from, to, depth) {
            this._super(from, to, depth);
            // Store, we'll need them to notify Jaffa later
            this.oldField = this.field;
            // Replace the portion of the ID that changed
            this.field = this.oldField.domUpdate(from, to, depth);
            // Update DOM but constrain searches to container, since there may
            //  be very temporary duplicate IDs as sort orders swap
            var container = this.getContainer();
            container.find("input[id=\""+this.oldField+"foaf:title\"]").attr("id", this.field+"foaf:title");
            container.find("input[id=\""+this.oldField+"foaf:givenName\"]").attr("id", this.field+"foaf:givenName");
            container.find("input[id=\""+this.oldField+"foaf:familyName\"]").attr("id", this.field+"foaf:familyName");
            container.find("input[id=\""+this.oldField+"foaf:email\"]").attr("id", this.field+"foaf:email");
            container.find("input[id=\""+this.oldField+"dc:identifier\"]").attr("id", this.field+"dc:identifier");
            container.attr("id", container.attr("id").replace(from, to));
            
            // Tell Jaffa to ignore the field's this widget used to manage
            var titleFieldId= this.oldField+"foaf:title";
            var givenNameFieldId= this.oldField+"foaf:givenName";
            var familyNameFieldId= this.oldField+"foaf:familyName";
            var emailFieldId= this.oldField+"foaf:email";
            var dcIdentifierId = this.oldField+"dc:identifier";
            jaffa.form.ignoreField(titleFieldId);
            jaffa.form.ignoreField(givenNameFieldId);
            jaffa.form.ignoreField(familyNameFieldId);
            jaffa.form.ignoreField(emailFieldId);
            jaffa.form.ignoreField(dcIdentifierId);
            
            titleFieldId= this.field+"foaf:title";
            givenNameFieldId= this.field+"foaf:givenName";
            familyNameFieldId= this.field+"foaf:familyName";
            emailFieldId= this.field+"foaf:email";
            dcIdentifierId = this.field+"dc:identifier";
            jaffa.form.addField(titleFieldId, this.id());
           	jaffa.form.addField(givenNameFieldId, this.id());
            jaffa.form.addField(familyNameFieldId, this.id());
            jaffa.form.addField(emailFieldId, this.id());
            jaffa.form.addField(dcIdentifierId, this.id());
            
        },
        // Notify Jaffa that field <=> widget relations need to be updated
        //  This is called separately from above to avoid duplicate IDs that
        //   may occur whilst DOM alterations are occuring
        jaffaUpdate: function() {
            // Only synch if an update has effected this widget
            if (this.oldField != null) {
                this._super();
                var titleFieldId= this.field+"foaf:title";
            	var givenNameFieldId= this.field+"foaf:givenName";
            	var familyNameFieldId= this.field+"foaf:familyName";
            	var emailFieldId= this.field+"foaf:email";
            	var dcIdentifierId = this.field+"dc:identifier";
            	jaffa.form.addField(titleFieldId, this.id());
            	jaffa.form.addField(givenNameFieldId, this.id());
            	jaffa.form.addField(familyNameFieldId, this.id());
            	jaffa.form.addField(emailFieldId, this.id());
            	jaffa.form.addField(dcIdentifierId, this.id());
                this.oldField = null;
            }
            // TODO: Validation alterations ?? Doesn't seem to matter
        },

        // Whereas init() is the constructor, this method is called after Jaffa
        // knows about us and needs us to build UI elements and modify the form.
        buildUi: function() {
            var ui = this.getContainer();
            ui.html("");

            // Field
            this.field = this.getConfig("field");
            if (this.field == null) {
                // TODO: Testing
                jaffa.logError("No field name provided for widget '"+this.id()+"'. This is mandatory!");
                return;
            }
            if(this.field.indexOf(".", this.field.length - 1) == -1) {
            	this.field = this.field+".";
            }
            
            var lookup_only = this.getConfig("lookup-only");
            var titleFieldId= this.field+"foaf:title";
            ui.append("<label for=\""+titleFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Title</label>");
            ui.append("<input type=\"text\" id=\""+titleFieldId+"\" class=\"jaffa-field\" />");
            
            var givenNameFieldId= this.field+"foaf:givenName";
            ui.append("<label for=\""+givenNameFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Given Name</label>");
            ui.append("<input type=\"text\" id=\""+givenNameFieldId+"\" class=\"jaffa-field\" />");
            
            var familyNameFieldId= this.field+"foaf:familyName";
            ui.append("<label for=\""+familyNameFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Family Name</label>");
            ui.append("<input type=\"text\" id=\""+familyNameFieldId+"\" class=\"jaffa-field\" />");
            
            var emailFieldId= this.field+"foaf:email";
            ui.append("<label for=\""+emailFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Email</label>");
            ui.append("<input type=\"text\" id=\""+emailFieldId+"\" class=\"jaffa-field\" />");

            var dcIdentifierId = this.field+"dc:identifier";
            ui.append("<input type=\"hidden\" id=\""+dcIdentifierId+"\" class=\"jaffa-field\" />");
            
            var dlg_source = this.getConfig("source");
            if (dlg_source == null) { dlg_source = 'mint'; }
            ui.append("<a onclick='showMintNlaLookupDialog(this,\""+dlg_source+"\");return false;' class='mintNlaLookup' href='#'>lookup</a>");
            ui.append("<a onclick='clearPeopleElements(this,\""+dlg_source+"\");return false;' class='clearMintNlaLookup' href='#'>clear</a>");
            if (lookup_only) $("[id='" + this.id() + "'] input").attr('disabled','disabled');
            // Are we tying any data lookups to the control?
            var lookupData = this.getConfig("lookup-data");
            if (lookupData != null) {
                var lookupParser = this.getConfig("lookup-parser");
                var source = null;
                var select = null;
                // A simple lookup
                if (lookupParser == null) {
                    source = lookupData;


                // This could get complicated...
                } else {
                    // How to build a request
                    var requestConfig = this.getConfig("lookup-request") || {};
                    var requestType  = requestConfig["data-type"] || "json";
                    var requestField = requestConfig["term-field"] || "q";
                    var requestQuote = requestConfig["term-quote"];
                    if (requestQuote !== false) {
                        requestQuote = true;
                    }

                    // How to parse a response
                    var responseParser = this.getConfig("lookup-parser") || {};
                    var resultsPath = responseParser["results-path"] || [];

                    var thisWidget = this;
                    source = function(request, response) {
                        var data = {};
                        if (requestQuote)  {
                            data[requestField] = '"' + request.term + '"';
                        } else {
                            data[requestField] = request.term;
                        }

                        $.ajax({
                            url: lookupData,
                            data: data,
                            dataType: requestType,
                            contentType: "application/json; charset=utf-8",
                            success: function(data) {
                                // Find the 'node' containing our list of items
                                var results = thisWidget.dataGetOnJsonPath(data, resultsPath);
                                if (results == null) {
                                    jaffa.logWarning("Error parsing response from lookup in widget '"+thisWidget.getId()+"', cannot find results on configured data path.");
                                    response({});
                                    return;
                                }

                                // Fixes scope of 'this'
                                function mapWrap(item) {
                                    return thisWidget.perItemMapping(item);
                                }

                                // Map and return
                                response($.map(results, mapWrap));
                            }
                        });
                    }
                    select = thisWidget.onSelectItemHandling;
                }
            }

            jaffa.form.addField(titleFieldId,  this.id());
            jaffa.form.addField(givenNameFieldId,  this.id());
            jaffa.form.addField(familyNameFieldId,  this.id());
            jaffa.form.addField(emailFieldId,  this.id());
            jaffa.form.addField(dcIdentifierId,  this.id());
            

            // Add help content
            this._super();

            // Complicated validation gets preference
            var v2Rules = this.getConfig("v2Rules");
            if (v2Rules != null) {
                // Error message toggling
                var v2messages = $("<div class=\"jaffaValidationError\"></div>");
                ui.append(v2messages);
                v2messages.hide();
                var rules = this.v2rules;
                function v2invalid(fieldId, testsFailed) {
                    v2messages.html("");
                    var len = testsFailed.length;
                    for (var i = 0; i < len; i++) {
                        var key = testsFailed[i];
                        var message = rules[key].message || "Validation rule '"+key+"' failed.";
                        v2messages.append("<p>"+message+"</p>");
                    }
                    ui.addClass("error");
                    v2messages.show();
                }
                function v2valid(fieldId, testsPassed) {
                    ui.removeClass("error");
                    v2messages.html("");
                    v2messages.hide();
                }
                // Rule integration with Jaffa
                var rulesList = [];
                for (var key in v2Rules) {
                    // Store it for use later
                    this.v2rules[key] = v2Rules[key];
                    rulesList.push(key);
                    // Add the rule to Jaffa
                    jaffa.valid.addNewRule(key, this.v2rules[key].validator, this.v2rules[key].params);
                }
                // Now set these rules against our field
                jaffa.valid.setSubmitRules(this.field, rulesList, v2valid, v2invalid);

            // What about a basic mandatory flag?
            } else {
                var mandatory = this.getConfig("mandatory");
                var mandatoryOnSave = this.getConfig("mandatory-on-save");
                if (mandatory === true || mandatoryOnSave === true) {
                    // Error message creation
                    var validationText = this.getConfig("validation-text") || "This field is mandatory";
                    var validationMessage = $("<div class=\"jaffaValidationError\">"+validationText+"</div>");
                    ui.append(validationMessage);
                    // Error message toggling
                    validationMessage.hide();
                    function invalid(fieldId, testsFailed) {
                        ui.addClass("error");
                        validationMessage.show();
                    }
                    function valid(fieldId, testsPassed) {
                        ui.removeClass("error");
                        validationMessage.hide();
                    }
                    // Notify Jaffa about what we want
                    if (mandatory === true) {
                        jaffa.valid.setSubmitRules(this.field, ["required"], valid, invalid);
                    }
                    if (mandatoryOnSave === true) {
                        jaffa.valid.setSaveRules(this.field, ["required"], valid, invalid);
                    }
                }
            }

            // Add our custom classes
            this.applyBranding(ui);
        },

        // If any of the fields we told Jaffa we manage
        //   are changed it will call this.
        change: function(fieldName, isValid) {
            if (fieldName == this.field && this.labelField != null) {
                var label = jaffa.form.field(fieldName).find(":selected").text();
                jaffa.form.value(this.labelField, label);
            }
        },

        // Constructor... any user provided config and the
        //    jQuery container this was called against.
        init: function(config, container) {
            this._super(config, container);
        }
    });

    // *****************************************
    // Let Jaffa know how things hang together. 'jaffaPeople' is how the
    //   developer can create a widget, eg: $("#id").jaffaPeople();
    // And the class links to the above variable that is a valid widget
    //   implementation, extending the Jaffa bas widget.
    jaffa.widgets.registerWidget("jaffaPeople", textClass);
}
$.requestWidgetLoad(PeopleWidgetBuilder);

var PeopleRepeatableWidgetBuilder = function($, jaffa) {
    var textRepeatableClass = jaffa.widgets.listWidget.extend({
        init: function(config, container) {
            this._super(config, container);
            // Make sure 'listWidget' knows how to create each element
            this.childCreator("jaffaPeople");
        }
    });
    jaffa.widgets.registerWidget("jaffaPeopleRepeatable", textRepeatableClass);
}
$.requestWidgetLoad(PeopleRepeatableWidgetBuilder);

var DatalocationWidgetBuilder = function($, jaffa) {
	var textClass = jaffa.widgets.baseWidget.extend({
		field: null,
		oldField: null,
		v2rules: {},

		deleteWidget: function() {
			var privacyFieldId= this.field+"dc:privacy";
			var typeFieldId= this.field+"dc:type";
			var locationFieldId= this.field+"dc:location";
			var notesFieldId= this.field+"dc:notes";
			jaffa.form.ignoreField(privacyFieldId);
			jaffa.form.ignoreField(typeFieldId);
			jaffa.form.ignoreField(locationFieldId);
			jaffa.form.ignoreField(notesFieldId);
			this.getContainer().remove();
		},
		// Identity has been altered, adjust the DOM for all fields
		domUpdate: function(from, to, depth) {
			this._super(from, to, depth);
			// Store, we'll need them to notify Jaffa later
			this.oldField = this.field;
			// Replace the portion of the ID that changed
			this.field = this.oldField.domUpdate(from, to, depth);
			// Update DOM but constrain searches to container, since there may
			//  be very temporary duplicate IDs as sort orders swap
			var container = this.getContainer();
			container.find("input[id=\""+this.oldField+"dc:privacy\"]").attr("id", this.field+"dc:privacy");
			container.find("input[id=\""+this.oldField+"dc:type\"]").attr("id", this.field+"dc:type");
			container.find("input[id=\""+this.oldField+"dc:location\"]").attr("id", this.field+"dc:location");
			container.find("input[id=\""+this.oldField+"dc:notes\"]").attr("id", this.field+"dc:notes");
			container.attr("id", container.attr("id").replace(from, to));

			// Tell Jaffa to ignore the field's this widget used to manage
			var privacyFieldId= this.oldField+"dc:privacy";
			var typeFieldId= this.oldField+"dc:type";
			var locationFieldId= this.oldField+"dc:location";
			var notesFieldId= this.oldField+"dc:notes";
			jaffa.form.ignoreField(privacyFieldId);
			jaffa.form.ignoreField(typeFieldId);
			jaffa.form.ignoreField(locationFieldId);
			jaffa.form.ignoreField(notesFieldId);

			privacyFieldId= this.field+"dc:privacy";
			typeFieldId= this.field+"dc:type";
			locationFieldId= this.field+"dc:location";
			notesFieldId= this.field+"dc:notes";
			jaffa.form.addField(privacyFieldId, this.id());
			jaffa.form.addField(typeFieldId, this.id());
			jaffa.form.addField(locationFieldId, this.id());
			jaffa.form.addField(notesFieldId, this.id());

		},
		// Notify Jaffa that field <=> widget relations need to be updated
		//  This is called separately from above to avoid duplicate IDs that
		//   may occur whilst DOM alterations are occuring
		jaffaUpdate: function() {
			// Only synch if an update has effected this widget
			if (this.oldField != null) {
				this._super();
				var privacyFieldId= this.field+"dc:privacy";
				var typeFieldId= this.field+"dc:type";
				var locationFieldId= this.field+"dc:location";
				var notesFieldId= this.field+"dc:notes";
				jaffa.form.addField(privacyFieldId, this.id());
				jaffa.form.addField(typeFieldId, this.id());
				jaffa.form.addField(locationFieldId, this.id());
				jaffa.form.addField(notesFieldId, this.id());
				this.oldField = null;
			}
			// TODO: Validation alterations ?? Doesn't seem to matter
		},

		// Whereas init() is the constructor, this method is called after Jaffa
		// knows about us and needs us to build UI elements and modify the form.
		buildUi: function() {
			var ui = this.getContainer();
			ui.html("");

			// Field
			this.field = this.getConfig("field");
			if (this.field == null) {
				// TODO: Testing
				jaffa.logError("No field name provided for widget '"+this.id()+"'. This is mandatory!");
				return;
			}
			if(this.field.indexOf(".", this.field.length - 1) == -1) {
				this.field = this.field+".";
			}

			var privacyFieldId= this.field+"dc:privacy";
			ui.append("<label for=\""+privacyFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Privacy</label>");
			ui.append("<select name=\"privacy\" id=\""+privacyFieldId+"\" class=\"jaffa-field\" />");

			var option = document.createElement("option");
			option.text = "Public";
			option.value = "public";
			var select = document.getElementById(privacyFieldId);
			select.appendChild(option);

			var option1 = document.createElement("option");
			option1.text = "Private";
			option1.value = "private";
			select.appendChild(option1);

			var typeFieldId= this.field+"dc:type";
			ui.append("<label for=\""+typeFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Type</label>");
			ui.append("<select name=\"privacy\" id=\""+typeFieldId+"\" class=\"jaffa-field\" />");

			var option2 = document.createElement("option");
			option2.text = "URL";
			option2.value = "url";
			var select = document.getElementById(typeFieldId);
			select.appendChild(option2);

			var option3 = document.createElement("option");
			option3.text = "File";
			option3.value = "file";
			select.appendChild(option3);

			var option4 = document.createElement("option");
			option4.text = "Physical location";
			option4.value = "physical";
			select.appendChild(option4);

			var locationFieldId= this.field+"dc:location";
			ui.append("<label for=\""+locationFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Location</label>");
			ui.append("<input type=\"text\" id=\""+locationFieldId+"\" class=\"jaffa-field\" />");

			var notesFieldId= this.field+"dc:notes";
			ui.append("<label for=\""+notesFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Notes</label>");
			ui.append("<input type=\"text\" id=\""+notesFieldId+"\" class=\"jaffa-field\" />");

			jaffa.form.addField(privacyFieldId,  this.id());
			jaffa.form.addField(typeFieldId,  this.id());
			jaffa.form.addField(locationFieldId,  this.id());
			jaffa.form.addField(notesFieldId,  this.id());

			// Add our custom classes
			this.applyBranding(ui);
		},

		// If any of the fields we told Jaffa we manage
		//   are changed it will call this.
		change: function(fieldName, isValid) {
			if (fieldName == this.field && this.labelField != null) {
				var label = jaffa.form.field(fieldName).find(":selected").text();
				jaffa.form.value(this.labelField, label);
			}
		},

		// Constructor... any user provided config and the
		//    jQuery container this was called against.
		init: function(config, container) {
			this._super(config, container);
		}
	});

	jaffa.widgets.registerWidget("jaffaDatalocation", textClass);
}
$.requestWidgetLoad(DatalocationWidgetBuilder);


var RelatedPublicationInfoWidgetBuilder = function($, jaffa) {
	var textClass = jaffa.widgets.baseWidget.extend({
		field: null,
		oldField: null,
		v2rules: {},

		deleteWidget: function() {
			var idFieldId= this.field+"dc:identifier";
			var titleFieldId= this.field+"dc:title";
			var noteFieldId= this.field+"skos:note";
			jaffa.form.ignoreField(idFieldId);
			jaffa.form.ignoreField(titleFieldId);
			jaffa.form.ignoreField(noteFieldId);
			this.getContainer().remove();
		},
		// Identity has been altered, adjust the DOM for all fields
		domUpdate: function(from, to, depth) {
			this._super(from, to, depth);
			// Store, we'll need them to notify Jaffa later
			this.oldField = this.field;
			// Replace the portion of the ID that changed
			this.field = this.oldField.domUpdate(from, to, depth);
			// Update DOM but constrain searches to container, since there may
			//  be very temporary duplicate IDs as sort orders swap
			var container = this.getContainer();
			container.find("input[id=\""+this.oldField+"dc:identifier\"]").attr("id", this.field+"dc:identifier");
			container.find("input[id=\""+this.oldField+"dc:title\"]").attr("id", this.field+"dc:title");
			container.find("input[id=\""+this.oldField+"skos:note\"]").attr("id", this.field+"skos:note");
			container.attr("id", container.attr("id").replace(from, to));

			// Tell Jaffa to ignore the field's this widget used to manage
			var idFieldId= this.oldField+"dc:identifier";
			var titleFieldId= this.oldField+"dc:title";
			var noteFieldId= this.oldField+"skos:note";
			jaffa.form.ignoreField(idFieldId);
			jaffa.form.ignoreField(titleFieldId);
			jaffa.form.ignoreField(noteFieldId);

			idFieldId= this.field+"dc:identifier";
			titleFieldId= this.field+"dc:title";
			noteFieldId= this.field+"skos:note";
			jaffa.form.addField(idFieldId, this.id());
			jaffa.form.addField(titleFieldId, this.id());
			jaffa.form.addField(noteFieldId, this.id());

		},
		// Notify Jaffa that field <=> widget relations need to be updated
		//  This is called separately from above to avoid duplicate IDs that
		//   may occur whilst DOM alterations are occuring
		jaffaUpdate: function() {
			// Only synch if an update has effected this widget
			if (this.oldField != null) {
				this._super();
				var idFieldId= this.field+"dc:identifier";
				var titleFieldId= this.field+"dc:title";
				var noteFieldId= this.field+"skos:note";
				jaffa.form.addField(idFieldId, this.id());
				jaffa.form.addField(titleFieldId, this.id());
				jaffa.form.addField(noteFieldId, this.id());
				this.oldField = null;
			}
			// TODO: Validation alterations ?? Doesn't seem to matter
		},

		// Whereas init() is the constructor, this method is called after Jaffa
		// knows about us and needs us to build UI elements and modify the form.
		buildUi: function() {
			var ui = this.getContainer();
			ui.html("");

			// Field
			this.field = this.getConfig("field");
			if (this.field == null) {
				// TODO: Testing
				jaffa.logError("No field name provided for widget '"+this.id()+"'. This is mandatory!");
				return;
			}
			if(this.field.indexOf(".", this.field.length - 1) == -1) {
				this.field = this.field+".";
			}

			var idFieldId = this.field + "dc:identifier";
			ui.append("<label for=\"" + idFieldId + "\" class=\"widgetLabel peopleWidgetLabel\">URL</label>");
			ui.append("<input size=\"60\" type=\"text\" id=\"" + idFieldId + "\" class=\"jaffa-field\" />");

			var titleFieldId= this.field+"dc:title";
			ui.append("<label for=\""+titleFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Citation details</label>");
			ui.append("<input size=\"80\" type=\"text\" id=\""+titleFieldId+"\" class=\"jaffa-field\" />");

			var noteFieldId= this.field+"skos:note";
			ui.append("<label for=\""+noteFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Notes</label>");
			ui.append("<input size=\"40\" type=\"text\" id=\""+noteFieldId+"\" class=\"jaffa-field\" />");

			jaffa.form.addField(idFieldId,  this.id());
			jaffa.form.addField(titleFieldId,  this.id());
			jaffa.form.addField(noteFieldId,  this.id());

			// Add our custom classes
			this.applyBranding(ui);
		},

		// If any of the fields we told Jaffa we manage
		//   are changed it will call this.
		change: function(fieldName, isValid) {
			if (fieldName == this.field && this.labelField != null) {
				var label = jaffa.form.field(fieldName).find(":selected").text();
				jaffa.form.value(this.labelField, label);
			}
		},

		// Constructor... any user provided config and the
		//    jQuery container this was called against.
		init: function(config, container) {
			this._super(config, container);
		}
	});

	jaffa.widgets.registerWidget("jaffaRelatedPublicationInfo", textClass);
}
$.requestWidgetLoad(RelatedPublicationInfoWidgetBuilder);


var RelatedURLInfoWidgetBuilder = function($, jaffa) {
	var textClass = jaffa.widgets.baseWidget.extend({
		field: null,
		oldField: null,
		v2rules: {},

		deleteWidget: function() {
			var idFieldId= this.field+"dc:identifier";
			var titleFieldId= this.field+"dc:title";
			var noteFieldId= this.field+"skos:note";
			jaffa.form.ignoreField(idFieldId);
			jaffa.form.ignoreField(titleFieldId);
			jaffa.form.ignoreField(noteFieldId);
			this.getContainer().remove();
		},
		// Identity has been altered, adjust the DOM for all fields
		domUpdate: function(from, to, depth) {
			this._super(from, to, depth);
			// Store, we'll need them to notify Jaffa later
			this.oldField = this.field;
			// Replace the portion of the ID that changed
			this.field = this.oldField.domUpdate(from, to, depth);
			// Update DOM but constrain searches to container, since there may
			//  be very temporary duplicate IDs as sort orders swap
			var container = this.getContainer();
			container.find("input[id=\""+this.oldField+"dc:identifier\"]").attr("id", this.field+"dc:identifier");
			container.find("input[id=\""+this.oldField+"dc:title\"]").attr("id", this.field+"dc:title");
			container.find("input[id=\""+this.oldField+"skos:note\"]").attr("id", this.field+"skos:note");
			container.attr("id", container.attr("id").replace(from, to));

			// Tell Jaffa to ignore the field's this widget used to manage
			var idFieldId= this.oldField+"dc:identifier";
			var titleFieldId= this.oldField+"dc:title";
			var noteFieldId= this.oldField+"skos:note";
			jaffa.form.ignoreField(idFieldId);
			jaffa.form.ignoreField(titleFieldId);
			jaffa.form.ignoreField(noteFieldId);

			idFieldId= this.field+"dc:identifier";
			titleFieldId= this.field+"dc:title";
			noteFieldId= this.field+"skos:note";
			jaffa.form.addField(idFieldId, this.id());
			jaffa.form.addField(titleFieldId, this.id());
			jaffa.form.addField(noteFieldId, this.id());

		},
		// Notify Jaffa that field <=> widget relations need to be updated
		//  This is called separately from above to avoid duplicate IDs that
		//   may occur whilst DOM alterations are occuring
		jaffaUpdate: function() {
			// Only synch if an update has effected this widget
			if (this.oldField != null) {
				this._super();
				var idFieldId= this.field+"dc:identifier";
				var titleFieldId= this.field+"dc:title";
				var noteFieldId= this.field+"skos:note";
				jaffa.form.addField(idFieldId, this.id());
				jaffa.form.addField(titleFieldId, this.id());
				jaffa.form.addField(noteFieldId, this.id());
				this.oldField = null;
			}
			// TODO: Validation alterations ?? Doesn't seem to matter
		},

		// Whereas init() is the constructor, this method is called after Jaffa
		// knows about us and needs us to build UI elements and modify the form.
		buildUi: function() {
			var ui = this.getContainer();
			ui.html("");

			// Field
			this.field = this.getConfig("field");
			if (this.field == null) {
				// TODO: Testing
				jaffa.logError("No field name provided for widget '"+this.id()+"'. This is mandatory!");
				return;
			}
			if(this.field.indexOf(".", this.field.length - 1) == -1) {
				this.field = this.field+".";
			}

			var idFieldId = this.field + "dc:identifier";
			ui.append("<label for=\"" + idFieldId + "\" class=\"widgetLabel peopleWidgetLabel\">URL</label>");
			ui.append("<input size=\"60\" type=\"text\" id=\"" + idFieldId + "\" class=\"jaffa-field\" />");

			var titleFieldId= this.field+"dc:title";
			ui.append("<label for=\""+titleFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Title</label>");
			ui.append("<input size=\"60\" type=\"text\" id=\""+titleFieldId+"\" class=\"jaffa-field\" />");

			var noteFieldId= this.field+"skos:note";
			ui.append("<label for=\""+noteFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Notes</label>");
			ui.append("<input size=\"60\" type=\"text\" id=\""+noteFieldId+"\" class=\"jaffa-field\" />");

			jaffa.form.addField(idFieldId,  this.id());
			jaffa.form.addField(titleFieldId,  this.id());
			jaffa.form.addField(noteFieldId,  this.id());

			// Add our custom classes
			this.applyBranding(ui);
		},

		// If any of the fields we told Jaffa we manage
		//   are changed it will call this.
		change: function(fieldName, isValid) {
			if (fieldName == this.field && this.labelField != null) {
				var label = jaffa.form.field(fieldName).find(":selected").text();
				jaffa.form.value(this.labelField, label);
			}
		},

		// Constructor... any user provided config and the
		//    jQuery container this was called against.
		init: function(config, container) {
			this._super(config, container);
		}
	});

	jaffa.widgets.registerWidget("jaffaRelatedURLInfo", textClass);
}
$.requestWidgetLoad(RelatedURLInfoWidgetBuilder);




var RelatedDataWidgetBuilder = function($, jaffa) {
	var textClass = jaffa.widgets.baseWidget.extend({
		field: null,
		oldField: null,
		v2rules: {},

		deleteWidget: function() {
			var relationshipFieldId= this.field+"vivo:Relationship.rdf:PlainLiteral";
			var titleFieldId= this.field+"dc:title";
			var identifierFieldId= this.field+"dc:identifier";
			var notesFieldId= this.field+"skos:note";
			var originFieldId= this.field+"redbox:origin";
			var publishToRDAFieldId= this.field+"redbox:publish";
			jaffa.form.ignoreField(relationshipFieldId);
			jaffa.form.ignoreField(titleFieldId);
			jaffa.form.ignoreField(identifierFieldId);
			jaffa.form.ignoreField(notesFieldId);
			jaffa.form.ignoreField(originFieldId);
			jaffa.form.ignoreField(publishToRDAFieldId);
			this.getContainer().remove();
		},
		// Identity has been altered, adjust the DOM for all fields
		domUpdate: function(from, to, depth) {
			this._super(from, to, depth);
			// Store, we'll need them to notify Jaffa later
			this.oldField = this.field;
			// Replace the portion of the ID that changed
			this.field = this.oldField.domUpdate(from, to, depth);
			// Update DOM but constrain searches to container, since there may
			//  be very temporary duplicate IDs as sort orders swap
			var container = this.getContainer();
			container.find("input[id=\""+this.oldField+"vivo:Relationship.rdf:PlainLiteral\"]").attr("id", this.field+"vivo:Relationship.rdf:PlainLiteral");
			container.find("input[id=\""+this.oldField+"dc:title\"]").attr("id", this.field+"dc:title");
			container.find("input[id=\""+this.oldField+"dc:identifier\"]").attr("id", this.field+"dc:identifier");
			container.find("input[id=\""+this.oldField+"skos:note\"]").attr("id", this.field+"skos:note");
			container.find("input[id=\"" + this.oldField + "redbox:origin\"]").attr("id", this.field + "redbox:origin");
			container.find("input[id=\"" + this.oldField + "redbox:publish\"]").attr("id", this.field + "redbox:publish");
			container.attr("id", container.attr("id").replace(from, to));

			// Tell Jaffa to ignore the field's this widget used to manage
			var relationshipFieldId = this.oldField + "vivo:Relationship.rdf:PlainLiteral";
			var titleFieldId = this.oldField + "dc:title";
			var identifierFieldId = this.oldField + "dc:identifier";
			var notesFieldId = this.oldField + "skos:note";
			var originFieldId = this.oldField + "redbox:origin";
			var publishToRDAFieldId = this.oldField + "redbox:publish";
			jaffa.form.ignoreField(relationshipFieldId);
			jaffa.form.ignoreField(titleFieldId);
			jaffa.form.ignoreField(identifierFieldId);
			jaffa.form.ignoreField(notesFieldId);
			jaffa.form.ignoreField(originFieldId);
			jaffa.form.ignoreField(publishToRDAFieldId);

			relationshipFieldId = this.field + "vivo:Relationship.rdf:PlainLiteral";
			titleFieldId = this.field + "dc:title";
			identifierFieldId = this.field + "dc:identifier";
			notesFieldId = this.field + "skos:note";
			originFieldId = this.field + "redbox:origin";
			publishToRDAFieldId = this.field + "redbox:publish";
			jaffa.form.addField(relationshipFieldId, this.id());
			jaffa.form.addField(titleFieldId, this.id());
			jaffa.form.addField(identifierFieldId, this.id());
			jaffa.form.addField(notesFieldId, this.id());
			jaffa.form.addField(originFieldId, this.id());
			jaffa.form.addField(publishToRDAFieldId, this.id());

		},
		// Notify Jaffa that field <=> widget relations need to be updated
		//  This is called separately from above to avoid duplicate IDs that
		//   may occur whilst DOM alterations are occuring
		jaffaUpdate: function() {
			// Only synch if an update has effected this widget
			if (this.oldField != null) {
				this._super();
				var relationshipFieldId = this.field + "vivo:Relationship.rdf:PlainLiteral";
				var titleFieldId = this.field + "dc:title";
				var identifierFieldId = this.field + "dc:identifier";
				var notesFieldId = this.field + "skos:note";
				var originFieldId = this.field + "redbox:origin";
				var publishToRDAFieldId = this.field + "redbox:publish";
				jaffa.form.addField(relationshipFieldId, this.id());
				jaffa.form.addField(titleFieldId, this.id());
				jaffa.form.addField(identifierFieldId, this.id());
				jaffa.form.addField(notesFieldId, this.id());
				jaffa.form.addField(originFieldId, this.id());
				jaffa.form.addField(publishToRDAFieldId, this.id());
				this.oldField = null;
			}
			// TODO: Validation alterations ?? Doesn't seem to matter
		},

		// Whereas init() is the constructor, this method is called after Jaffa
		// knows about us and needs us to build UI elements and modify the form.
		buildUi: function() {
			var ui = this.getContainer();
			ui.html("");

			// Field
			this.field = this.getConfig("field");
			if (this.field == null) {
				// TODO: Testing
				jaffa.logError("No field name provided for widget '"+this.id()+"'. This is mandatory!");
				return;
			}
			if(this.field.indexOf(".", this.field.length - 1) == -1) {
				this.field = this.field+".";
			}

			var relationshipFieldId = this.field + "vivo:Relationship.rdf:PlainLiteral";
			ui.append("<label for=\""+relationshipFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Relationship:</label>");
			ui.append("<select name=\"relationship\" id=\""+relationshipFieldId+"\" class=\"jaffa-field\" />");

			var option = document.createElement("option");
			option.text = "Has association with:";
			option.value = "hasAssociationWith";
			var select = document.getElementById(relationshipFieldId);
			select.appendChild(option);

			var option1 = document.createElement("option");
			option1.text = "Describes";
			option1.value = "describes";
			select.appendChild(option1);

			var option11 = document.createElement("option");
			option11.text = "Described by:";
			option11.value = "isDescribedBy";
			select.appendChild(option11);

			var option12 = document.createElement("option");
			option12.text = "Has part:";
			option12.value = "hasPart";
			select.appendChild(option12);

			var option13 = document.createElement("option");
			option13.text = "Part of:";
			option13.value = "isPartOf";
			select.appendChild(option13);

			var option15 = document.createElement("option");
			option15.text = "Derived from:";
			option15.value = "isDerivedFrom";
			select.appendChild(option15);

			var option14 = document.createElement("option");
			option14.text = "Has derivation:";
			option14.value = "hasDerivedCollection";
			select.appendChild(option14);

			var titleFieldId = this.field + "dc:title";
			ui.append("<label for=\""+titleFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Title:</label>");
			ui.append("<input type=\"text\" id=\""+titleFieldId+"\" class=\"jaffa-field\" />");

			var identifierFieldId = this.field + "dc:identifier";
			ui.append("<label for=\"" + identifierFieldId + "\" class=\"widgetLabel peopleWidgetLabel\">Data URL:</label>");
			ui.append("<input type=\"text\" id=\"" + identifierFieldId + "\" class=\"jaffa-field\" />");

			ui.append("<br>");

			var notesFieldId = this.field + "skos:note";
			ui.append("<label for=\""+notesFieldId+"\" class=\"widgetLabel peopleWidgetLabel\">Notes:</label>");
			ui.append("<input type=\"text\" id=\""+notesFieldId+"\" class=\"jaffa-field\" />");

			var originFieldId = this.field + "redbox:origin";
			ui.append("<label for=\"" + originFieldId + "\" class=\"widgetLabel peopleWidgetLabel\">Local related data:</label>");
			ui.append("<input type=\"checkbox\" id=\"" + originFieldId + "\" class=\"jaffa-field\" />");

			var publishToRDAFieldId = this.field + "redbox:publish";
			ui.append("<label for=\"" + publishToRDAFieldId + "\" class=\"widgetLabel peopleWidgetLabel\">Publish to RDA:</label>");
			ui.append("<input type=\"checkbox\" id=\"" + publishToRDAFieldId + "\" class=\"jaffa-field\" />");

			jaffa.form.addField(relationshipFieldId,  this.id());
			jaffa.form.addField(titleFieldId,  this.id());
			jaffa.form.addField(identifierFieldId,  this.id());
			jaffa.form.addField(notesFieldId,  this.id());
			jaffa.form.addField(originFieldId, this.id());
			jaffa.form.addField(publishToRDAFieldId, this.id());

			// Add our custom classes
			this.applyBranding(ui);
		},

		// If any of the fields we told Jaffa we manage
		//   are changed it will call this.
		change: function(fieldName, isValid) {
			if (fieldName == this.field && this.labelField != null) {
				var label = jaffa.form.field(fieldName).find(":selected").text();
				jaffa.form.value(this.labelField, label);
			}
		},

		// Constructor... any user provided config and the
		//    jQuery container this was called against.
		init: function(config, container) {
			this._super(config, container);
		}
	});

	jaffa.widgets.registerWidget("jaffaRelatedData", textClass);
}
$.requestWidgetLoad(RelatedDataWidgetBuilder);

var CitationDatesWidgetBuilder = function($, jaffa) {
	var textClass = jaffa.widgets.baseWidget.extend({
		field: null,
		oldField: null,
		v2rules: {},

		deleteWidget: function() {
			var dateFieldId= this.field+"rdf:PlainLiteral";
			var typeFieldId= this.field+"dc:type.rdf:PlainLiteral";
//			var identifierFieldId= this.field+"dc:identifier";
			jaffa.form.ignoreField(typeFieldId);
			jaffa.form.ignoreField(dateFieldId);
//			jaffa.form.ignoreField(identifierFieldId);
			this.getContainer().remove();
		},
		// Identity has been altered, adjust the DOM for all fields
		domUpdate: function(from, to, depth) {
			this._super(from, to, depth);
			// Store, we'll need them to notify Jaffa later
			this.oldField = this.field;
			// Replace the portion of the ID that changed
			this.field = this.oldField.domUpdate(from, to, depth);
			// Update DOM but constrain searches to container, since there may
			//  be very temporary duplicate IDs as sort orders swap
			var container = this.getContainer();
			container.find("input[id=\""+this.oldField+"rdf:PlainLiteral\"]").attr("id", this.field+"rdf:PlainLiteral");
			container.find("input[id=\""+this.oldField+"dc:type.rdf:PlainLiteral\"]").attr("id", this.field+"dc:type.rdf:PlainLiteral");
//			container.find("input[id=\""+this.oldField+"dc:identifier\"]").attr("id", this.field+"dc:identifier");
			container.attr("id", container.attr("id").replace(from, to));

			// Tell Jaffa to ignore the field's this widget used to manage
			var dateFieldId = this.oldField + "rdf:PlainLiteral";
			var typeFieldId = this.oldField + "dc:type.rdf:PlainLiteral";
//			var identifierFieldId = this.oldField + "dc:identifier";
			jaffa.form.ignoreField(dateFieldId);
			jaffa.form.ignoreField(typeFieldId);
//			jaffa.form.ignoreField(identifierFieldId);

			dateFieldId = this.field + "rdf:PlainLiteral";
			typeFieldId = this.field + "dc:type.rdf:PlainLiteral";
//			identifierFieldId = this.field + "dc:identifier";
			jaffa.form.addField(dateFieldId, this.id());
			jaffa.form.addField(typeFieldId, this.id());
//			jaffa.form.addField(identifierFieldId, this.id());
		},
		// Notify Jaffa that field <=> widget relations need to be updated
		//  This is called separately from above to avoid duplicate IDs that
		//   may occur whilst DOM alterations are occuring
		jaffaUpdate: function() {
			// Only synch if an update has effected this widget
			if (this.oldField != null) {
				this._super();
				var dateFieldId = this.field + "rdf:PlainLiteral";
				var typeFieldId = this.field + "dc:type.rdf:PlainLiteral";
//				var identifierFieldId = this.field + "dc:identifier";
				jaffa.form.addField(dateFieldId, this.id());
				jaffa.form.addField(typeFieldId, this.id());
//				jaffa.form.addField(identifierFieldId, this.id());
				this.oldField = null;
			}
			// TODO: Validation alterations ?? Doesn't seem to matter
		},

		// Whereas init() is the constructor, this method is called after Jaffa
		// knows about us and needs us to build UI elements and modify the form.
		buildUi: function() {
			var ui = this.getContainer();
			ui.html("");

			// Field
			this.field = this.getConfig("field");
			if (this.field == null) {
				// TODO: Testing
				jaffa.logError("No field name provided for widget '"+this.id()+"'. This is mandatory!");
				return;
			}
			if(this.field.indexOf(".", this.field.length - 1) == -1) {
				this.field = this.field+".";
			}

			var dateFieldId = this.field + "rdf:PlainLiteral";
			ui.append("<input type=\"text\" placeholder=\"YYYY-MM-DD\" class=\"dateYMD\" id=\"" + dateFieldId + "\" class=\"jaffa-field\" />");
			ui.append("<label for=\"" + dateFieldId + "\" class=\"widgetLabel peopleWidgetLabel\">Date is:</label>");

			var typeFieldId = this.field + "dc:type.rdf:PlainLiteral";
			ui.append("<select name=\"type\" id=\""+typeFieldId+"\" class=\"jaffa-field\" />");

			var option = document.createElement("option");
			option.text = "Date Available";
			option.value = "available";
			var select = document.getElementById(typeFieldId);
			select.appendChild(option);

			var option1 = document.createElement("option");
			option1.text = "Date Created";
			option1.value = "created";
			select.appendChild(option1);

			var option11 = document.createElement("option");
			option11.text = "Date (Other)";
			option11.value = "date";
			select.appendChild(option11);

			var option12 = document.createElement("option");
			option12.text = "Date Accepted";
			option12.value = "dateAccepted";
			select.appendChild(option12);

			var option13 = document.createElement("option");
			option13.text = "Date Submitted";
			option13.value = "dateSubmitted";
			select.appendChild(option13);

			var option15 = document.createElement("option");
			option15.text = "Publication Date (End)";
			option15.value = "endPublicationDate";
			select.appendChild(option15);

			var option14 = document.createElement("option");
			option14.text = "Date Issued";
			option14.value = "issued";
			select.appendChild(option14);

			var option16 = document.createElement("option");
			option16.text = "Date Modified";
			option16.value = "modified";
			select.appendChild(option16);

			var option17 = document.createElement("option");
			option17.text = "Publication Date (Start)";
			option17.value = "startPublicationDate";
			select.appendChild(option17);

			var option18 = document.createElement("option");
			option18.text = "Date Valid";
			option18.value = "valid";
			select.appendChild(option18);

			jaffa.form.addField(dateFieldId,  this.id());
			jaffa.form.addField(typeFieldId,  this.id());
//			jaffa.form.addField(identifierFieldId,  this.id());

			// Add our custom classes
			this.applyBranding(ui);
		},

		// If any of the fields we told Jaffa we manage
		//   are changed it will call this.
		change: function(fieldName, isValid) {
			if (fieldName == this.field && this.labelField != null) {
				var label = jaffa.form.field(fieldName).find(":selected").text();
				jaffa.form.value(this.labelField, label);
			}
		},

		// Constructor... any user provided config and the
		//    jQuery container this was called against.
		init: function(config, container) {
			this._super(config, container);
		}
	});

	jaffa.widgets.registerWidget("jaffaCitationDates", textClass);
}
$.requestWidgetLoad(CitationDatesWidgetBuilder);