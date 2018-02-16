angular.module('Rvd')
.directive('rvdModule', function ($injector, stepRegistry) {
  return {
    restrict: 'E',
    scope: {
      module: '='
    },
    templateUrl: function(elem, attr) {
      var url = 'templates/modules/' + attr.kind + 'Module.html';
      return url;
    },
    link: function( scope, element, attrs) {
      console.log('created module ', scope.module);

      scope.addStep = function (classAttribute,pos,listmodel) { // we don't use listmodel since all this happens inside a specific module scope
      		console.log("Adding step ");
      		r = RegExp("button-([^ ]+)");
      		m = r.exec( classAttribute );
      		if ( m != null ) {
      			var step;
      			var stepkind = m[1];
      			if (stepkind == "control") {
                      step = {kind: stepkind}
      			} else {
                      step = $injector.invoke([stepkind+'Model', function(model){
                          var stepname = stepRegistry.name();
                          return new model(stepname);
                      }]);
      			}

      			//console.log("adding step - " + m[1]);
      			scope.$apply( function ()	{
      				scope.module.steps.splice(pos,0, step);
      			});
      		}
      	}

      scope.removeStep = function (step) { // we don't need list since we know the module
      		console.log("Removing step");
      		scope.module.steps.splice( scope.module.steps.indexOf(step), 1);
      }
    }
  }
})
.directive('playStep', function (bundledWavsCache) {
  return {
    restrict: 'E',
    scope: {
      step: '=',
      onRemove: '&'
    },
    templateUrl: 'templates/steps/playStep.html',
    link: function (scope, element, attrs) {
      console.log("added play step");

      scope.bundledWavs = bundledWavsCache.get();

      scope.selectBundledWav = function(playstep, wavUrl) {
        playstep.remote.wavUrl = wavUrl;
      }

      // this method replaces rvdModule:removeStep() so that removal button in stepHeading.html keeps working
      scope.removeStep = function(step) {// ignore: (step,listModel)
        scope.onRemove({removedStep: step});
      }

      scope.$on('project-wav-removed', function (event, data) {
        if ( data == scope.step.local.wavLocalFilename )
          scope.step.local.wavLocalFilename = "";
      });

    }
  }
})
.directive('gatherStep', function (gatherModel) {
	return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				if (scope.step) {
					//gatherModel.validate(scope.step);
				}
				else
					scope.step = new gatherModel();
				
				
				function getEffectiveValidationType(validation) {
					if ( validation.userPattern != undefined )
						return "One of";
					else
						return "Regex"
				}
				scope.getEffectiveValidationType = getEffectiveValidationType;
				
				function setValidationTypeOneOf(validation) {
					if ( getEffectiveValidationType(validation) != "One of" ) {
						validation.userPattern = "";
						validation.regexPattern = undefined;
					}
				}
				scope.setValidationTypeOneOf = setValidationTypeOneOf;
				
				function setValidationTypeRegex(validation) {
					if ( getEffectiveValidationType(validation) != "Regex" ) {
						validation.userPattern = undefined;
						validation.regexPattern = "";
					}
				}		
				scope.setValidationTypeRegex = 	setValidationTypeRegex;
				
		}
	}
})
.directive('controlStep', function (nodeRegistry, stepRegistry) {
    return {
        restict: 'E',
        templateUrl: "templates/directive/controlStep.html",
        scope: {
            stepModel: '=model'
        },
        link: function (scope) {
            var conditionLastId = 0;
            var actionLastId = 0;
            // create UI data structure
            var step = {
                iface: {},
                label: "control",
            }
            scope.step = step;
            var stepModel = scope.stepModel;
            // new step
            if (!stepModel.name) {
                stepModel.name = stepRegistry.name(); // generate a new unique name
                //stepModel.kind = "control";

                step.conditions = [];
                step.actions = [];
                step.conditionJoiner = "all"; // default
                //step.conditionExpression = undefined;
            }
            // existing step
            else {
                fromDto(step, stepModel);
                // initialize conditionLastId, actionLastId
                for (var i=0; i<step.conditions.length; i++) {
                    var intName = parseInt(step.conditions[i].name.substring(1));
                    if (intName > conditionLastId)
                        conditionLastId = intName;
                }
                for (var i=0; i<step.actions.length; i++) {
                    var intName = parseInt(step.actions[i].name.substring(1));
                    if (intName > actionLastId)
                        actionLastId = intName;
                }
            }

            // Initialized a control step (UI element) from the dto (stored data received from server)
            function fromDto(step, dto) {
                // conditions
                step.conditions = [];
                for (var i=0; i<dto.conditions.length; i++) {
                    var condition = {};
                    var dtoCondition = dto.conditions[i];
                    condition.name = dtoCondition.name;
                    condition.operator = dtoCondition.operator;
                    if (dtoCondition.matcher) {
                        condition.matcher = dtoCondition.matcher;
                    } else {
                        // this is a comparison
                        condition.comparison = dtoCondition.comparison;
                    }
                    step.conditions.push(condition);
                }
                step.conditionExpression = dto.conditionExpression;
                if (!step.conditionExpression || (dto.conditionExpression.indexOf("AND") !== -1))
                    step.conditionJoiner = "all";
                else
                    step.conditionJoiner = "any";
                // actions
                step.actions = [];
                for (i=0; i<dto.actions.length; i++) {
                    var action = {};
                    var dtoAction = dto.actions[i];
                    action.name = dtoAction.name;
                    if (dtoAction.assign) {
                        action.kind = "assign";
                        action.assign = dtoAction.assign;
                    } else
                    if (dtoAction.continueTo) {
                        action.kind = "continueTo";
                        action.continueTo = dtoAction.continueTo;
                    } else
                    if (dtoAction.capture) {
                        action.kind = "capture";
                        action.capture = dtoAction.capture;
                    }
                    step.actions.push(action);
                }
            }

            function toDto(dto, step) {
                // conditions
                dto.conditions = [];
                for (var i=0; i<step.conditions.length; i++) {
                    var dtoCondition = {};
                    var condition = step.conditions[i];
                    dtoCondition.name = condition.name;
                    dtoCondition.operator = condition.operator;
                    if (dtoCondition.operator == "matches")
                        dtoCondition.matcher = condition.matcher;
                    else
                        dtoCondition.comparison = condition.comparison;
                    dto.conditions.push(dtoCondition);
                }
                dto.conditionExpression = step.conditionExpression;
                // actions
                dto.actions = [];
                for (i=0; i<step.actions.length; i++) {
                    var dtoAction = {};
                    var action = step.actions[i];
                    dtoAction.name = action.name;
                    dtoAction[action.kind] = action[action.kind];
                    dto.actions.push(dtoAction);
                }
            }

            function newCondition(step) {
                return {
                   name: "C" + (++conditionLastId),
                   operator : "equals",
                   comparison : {operand1:"", operand2: "", type: 'text'}
                   // matcher: {}
               }
            }

            function newAction(kind,step) {
                return {
                   name: "A" + (++actionLastId),
                   kind : "assign", // continueTo / assign / capture
                   assign: {expression: "", varScope:"app"}
                   // assign: {},
                   // continueTo: {},
                   // capture: {}
               }
            }

            scope.addCondition = function () {
                step.conditions.push(newCondition());
                rebuildConditionExpression(step);
            }
            scope.removeCondition = function (conditionName) {
                for (var i=0; i<step.conditions.length; i++) {
                    if (step.conditions[i].name == conditionName) {
                        step.conditions.splice(i,1);
                        rebuildConditionExpression(step);
                        return;
                    }
                }
            }
            scope.conditionOperatorChanged = function (condition, operator) {
                if (operator == "matches" && !condition.matcher) {
                    condition.matcher = {regex:"", text:""}
                } else
                if (operator != matcher && !condition.comparison) {
                    condition.comparison = {operand1:"", operand2: "", type: 'text'};
                }
            }

            // Actions methods
            scope.addAction = function () {
                step.actions.push(newAction());
            }
            scope.removeAction = function (actionName) {
                for (var i=0; i<step.actions.length; i++) {
                    if (step.actions[i].name == actionName) {
                        step.actions.splice(i,1);
                        return;
                    }
                }
            }
            scope.moveAction = function (index, distance) {
                if (index + distance >= 0 && index + distance < step.actions.length) {
                    var tmpAction = step.actions[index+distance];
                    step.actions[index + distance] = step.actions[index];
                    step.actions[index] = tmpAction;
                }
            }
            scope.actionKindChanged = function (action, kind) {
                if (kind == "assign" && !action.assign)
                    action.assign = { expression: "", varScope: "app"};
                else
                if (kind == "continueTo" && !action.continueTo)
                    action.continueTo = {};
                else
                if (kind == "capture" && !action.capture)
                    action.capture = {regex:"",data:"", varScope: "app"};
            }

            function rebuildConditionExpression(step) {
                var conditions = step.conditions;
                var joiner = step.conditionJoiner;
                var expression;

                if (!conditions || conditions.length == 0)
                    expression = undefined; // do nothing - 'expression; stays undefined
                else {
                    var names = [];
                    for (var i=0; i<conditions.length;i++)
                        names.push(conditions[i].name);
                    if (joiner == "all")
                        expression = names.join(" AND ")
                    if (joiner == "any")
                        expression = names.join(" OR ");
                }
                step.conditionExpression = expression;
            }
            scope.rebuildConditionExpression = rebuildConditionExpression;
            scope.removeStep = function (step) {
                scope.$emit("step-removed", step);
            }
            scope.$on("clear-step-warnings", function () {
                step.iface.showWarning = false; // TODO remove the 'showWarning' attribute and use 'headWarning' object instead
                delete step.iface.headWarning;
            })
            scope.$on("update-dtos", function () {
                toDto(stepModel, step);
            });
            scope.$on("notify-step", function (event, args) {
                if (args.target == stepModel.name) { // does the event refer to this step
                    if (args.type == "validation-error") {
                        step.iface.showWarning = true;
                        step.iface.headWarning = { type: "warning", title: args.data.summary};
                    }
                }
            });


            scope.getAllTargets = nodeRegistry.getNodes;
        }
    }

})
.directive('recordStep', function (nodeRegistry, RvdConfiguration) {
    return {
        restict: 'E',
                templateUrl: "templates/directive/recordStep.html",
        scope: {
            step: '='
        },
        link: function (scope, element, attrs) {
            var step = scope.step;

            scope.yesNoBooleanOptions = [{caption:"Yes", value:true}, {caption:"No", value:false}];
            scope.videoSupport = RvdConfiguration.videoSupport;
            if (! RvdConfiguration.videoSupport)
                delete step.media;
            
            var stepUi = {}
            scope.stepUi = stepUi;
            if ( ! step.finishOnKey )
                stepUi.fokMode = "anykey";
            else
            if (step.finishOnKey == "-1")
                stepUi.fokMode = "disabled";
            else
            // step.finishOnKey != -1 && !!step.finishOnKey
                stepUi.fokMode = "typekeys";

            scope.fokModeChanged = function(fokMode) {
                //console.log("fokModeChanged");
                if (fokMode == "anykey")
                    delete step.finishOnKey;
                else
                if (fokMode == "disabled")
                    step.finishOnKey = "-1";
                else
                if (fokMode == "typekeys")
                    delete step.finishOnKey;
            }

            scope.removeStep = function (step) {
                scope.$emit("step-removed", step);
            }
            scope.$on("clear-step-warnings", function () {
                step.iface.showWarning = false; // TODO remove the 'showWarning' attribute and use 'headWarning' object instead
                delete step.iface.headWarning;
            })
            scope.$on("notify-step", function (event, args) {
                if (args.target == step.name) { // does the event refer to this step
                    if (args.type == "validation-error") {
                        step.iface.showWarning = true;
                        step.iface.headWarning = { type: "warning", title: args.data.summary};
                    }
                }
            });

            scope.getAllTargets = nodeRegistry.getNodes;
        }
    }
})
;

angular.module('Rvd').directive('conferenceDialNoun', function (RvdConfiguration) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var localWaitType; // we need somewhere to store it but not in scope

            // init scope.waitType
            function initWaitType() {
					if (!!scope.dialnoun.waitModule) {
                    localWaitType = 'Module';
                    scope.dialnoun.waitUrl = undefined;
                } else
                if (scope.dialnoun.waitUrl) {
                    localWaitType = 'URL';
                    scope.dialnoun.waitModule = undefined;
                } else {
                    localWaitType = 'Module';
                    scope.dialnoun.waitUrl = undefined;
                }
            }

            function setWaitType(waitType) {
                if (localWaitType != waitType) {
                    if (waitType == 'Module')
                        scope.dialnoun.waitUrl = undefined;
                    else if (waitType == 'URL')
                        scope.dialnoun.waitModule = undefined;
                    else
                        return // do nothing - this is invalid waitType
                    localWaitType = waitType;
                }
            }

            function getWaitType() {
                return localWaitType;
            }

            function chooseProjectWav(wav) {
				scope.dialnoun.waitUrl = RvdConfiguration.projectsRootPath + '/' + scope.project.projectName + '/wavs/' + wav.filename; // TODO build a proper link here
			}

            // bootstrap
            initWaitType();
            // show advanced view if any property is set
            if (!!scope.dialnoun.muted || !!scope.dialnoun.beep || !!scope.dialnoun.startConferenceOnEnter
				|| !!scope.dialnoun.endConferenceOnExit || !!scope.dialnoun.waitModule || !!scope.dialnoun.waitUrl) {
					scope.dialnoun.iface = {advancedShown: true}
			}
			// clear video attributes if videoSupport is off
			if (!RvdConfiguration.videoSupport) {
			    scope.dialnoun.enableVideo = false;
			}

            // public interface
            scope.getWaitType = getWaitType;
            scope.setWaitType = setWaitType;
            scope.chooseProjectWav = chooseProjectWav;
        }
    }
});
