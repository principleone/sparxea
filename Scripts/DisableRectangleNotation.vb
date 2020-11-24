option explicit
!INC Local Scripts.EAConstants-VBScript
' Script Name: Disable Rectangle Notation
' Author: Andrew Dixon
' Purpose: disable the rectangle notation on the selected objects in a diagram
' Date: 24/11/2020
sub OnDiagramScript()
 ' Get a reference to the current diagram
 dim currentDiagram as EA.Diagram
 set currentDiagram = Repository.GetCurrentDiagram()
 if not currentDiagram is nothing then
 ' Get a reference to any selected connector/objects
 dim selectedObjects as EA.Collection
 set selectedObjects = currentDiagram.SelectedObjects 
 dim currentDiagramObject as EA.DiagramObject
 dim style
 dim i
 if selectedObjects.Count > 0 then
 ' One or more diagram objects are selected
 for i = 0 to selectedObjects.Count - 1 
 set currentDiagramObject = selectedObjects.GetAt( i )
 currentDiagramObject.Style = Replace(currentDiagramObject.Style , "UCRect=1;", "UCRect=0;")
 currentDiagramObject.Update()
 next
 currentDiagram.Update() 
 else
 Session.Prompt "This script requires to select objects to update", promptOK
 end if
 else
 Session.Prompt "This script requires a diagram to be visible", promptOK
 end if
end sub
OnDiagramScript
