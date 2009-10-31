rollout CrazyTrain "Export Animation" width:200 height:300
(
	pickbutton pickButton "Pick Object" pos:[85,9] width:100 height:23
	label lbl1 "Animated Obj:" pos:[10,12] width:75 height:20
	spinner startTime "Start Time:" pos:[110,40] width:75 height:16 range:[-1000,1000,0] type:#integer
	spinner endTime "End Time:" pos:[110,60] width:75 height:16 range:[-1000,1000,0] type:#integer
	button exportButton "Export" pos:[10,80] width:176 height:23
	bitmap bmp1 "Bitmap" pos:[10,110] width:176 height:60 fileName:"logo.bmp"
		
	on pickButton picked obj do
	(
		global selectedObject = obj
		pickButton.text = obj.name
	)
	
	on exportButton pressed do
	(
		export_name = getSaveFileName caption:"Save A Test File:" types:"Crazy Train Export (*.cte)|*.cte|All|*.*|"
		
		export_file = createfile export_name
		
		slidertime = startTime.value
		
		duration = endTime.value - startTime.value
		
		for t = 0 to duration do
		(
			p = selectedObject.pos
			--p.y = p.y + 2.7
			--p.z = p.z - 3
			format "[%, %, %],\n" p.x p.y p.z to:export_file

			slidertime = currenttime + 1
		)
	)
)

rollout Help "Help" width:200 Height:35
(
	label lbl5 "1 : Animate in the top viewport only      2 : Pick animated object to export      3 : Click the export button" pos:[10,10] width:180 height:45
)

-- create the rollout window and add the  rollout
if CrazyTrainFloater != undefined do
(
	closerolloutfloater CrazyTrainFloater
)

CrazyTrainFloater = newRolloutFloater "CrazyTrain" 210 230 
addRollout CrazyTrain CrazyTrainFloater
addRollout Help CrazyTrainFloater	rolledup:true	