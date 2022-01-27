!INC Local Scripts.EAConstants-JScript
!INC P1Core.P1Core
!INC P1Core.P1Solution
!INC P1Core.P1Delivery
 /* 
 * Script Name:
 * Author:
 * Purpose:
 * Date:
 */

/*
 * There is no longer a single subsystem view root package with the UKTL structure. Have defaulted the control object 
 * subsystem view root package in the test model to that for the DCMS system. 
 */
 
function OnProjectBrowserScript()
{
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();
	
	switch ( treeSelectedType )
	{
		case otElement :
		{
			var theElement as EA.Element;
			var p1Typ;
			theElement = Repository.GetTreeSelectedObject();
						
			p1Typ = getP1ElementType(theElement);
			
			switch (p1Typ)
			{
				case "System":
				{
					/*syntax for this is now a delimited string 
					SS | delimited
					: to indicate a list of component names
					CMP , delimited
					SubsystemA|SubsystemB
					SubsystemA:cmp1,cmp2,cmp3|SubsystemB|SubsystemC:cmpA
					
					*/
					var SSInput = '';
					SSInput = Session.Input("Please Enter Sub System Name - e.g. SubsystemA:cmp1,cmp2,cmp3|SubsystemB|SubsystemC:cmpA");
					var ssArr = SSInput.split("|");
					
					
					var size = ssArr.length;
					
					for (var i = 0; i<size; i++) 
					{
						var details = ssArr[i].split(":");
						Session.Output("adding Subsystem "+i+" "+ details[0]);
						addSubSystem(details[0],theElement,details[1]);
					}
					break;
				}
				case "Subsystem":
				{
					//add the child subsystem element in the right place
					var cmpName = ''; 
					cmpName = Session.Input("Please Enter Component Name");
					
					let cmpArr = cmpName.split(",");
					var size = cmpArr.length;
									
					for (var i = 0; i<size; i++) 
					{				
						Session.Output("adding ArcComponent "+i+" "+ cmpArr[i]);
						addComponent(cmpArr[i],theElement);	
					}
					break;
				}
				case "Delivery":
				{
					var cmpName = Session.Input("Please Enter Workstream Name");
					let cmpArr = cmpName.split(",");
					var size = cmpArr.length;
									
					for (var i = 0; i<size; i++) 
					{				
						Session.Output("adding Workstream "+i+" "+ cmpArr[i]);
						addWorkstream(cmpArr[i],theElement);	
					}
					
					break;
				}
				case "Workstream":
				{
					var cmpName = Session.Input("Please Enter PrimaryWP Name");
					let cmpArr = cmpName.split(",");
					var size = cmpArr.length;
									
					for (var i = 0; i<size; i++) 
					{				
						Session.Output("adding PrimaryWP "+i+" "+ cmpArr[i]);
						addPrimaryWP(cmpArr[i],theElement);	
					}
					break;
				}
				case "notp1":
				{
					Session.Output("not a p1 type");
				}
				default:
				{
					Session.Output("type not found");
				}
			}
			
			
						
			break;
		}
		default:
		{
			// Error message
			Session.Prompt( "System object must be selected", promptOK );
		}
	}
}

OnProjectBrowserScript();
