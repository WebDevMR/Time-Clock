/**
 * Created by Rico on 3/16/2017.
 *
 * This module deals with creating/deleting and updating the task panels that get created after the user enters a time.
 */
import * as TaskService from "./task-service";
import * as TimeFields from "./time-fields";
import * as TimeMath from "./time-clock-math";
import * as TaskName from "./task-name";

"use strict";

let taskNameID = '';
let isEditing = false;


//will hold the current editing value
let inEditTaskName;

export function createTask() {
    console.log("createTask()");
	
    //returns an object with startTime and endTime AMPM values
    let {startPM, endPM} = TimeFields.getAmOrPM();
	
    let taskName = TaskName.getName();
    let startTime = TimeFields.getTimes("start");
    let endTime = TimeFields.getTimes("end");
	
    //TODO it would be nice if this shit would work
    let currentTask = {
        taskName: TaskService.confirmTaskName(taskName),
        taskID: 'id',
        startTimes: {
            id: 'start-body',
            pm: startPM,
            hour: startTime.hour,
            minutes: startTime.minutes
        },
        endTimes: {
            id: 'end-body',
            pm: endPM,
            hour: endTime.hour,
            minutes: endTime.minutes
        },
        totalTimeSpentHours: 0,
        totalTimeSpentMinutes: 0
    };


    console.log("init task:", currentTask);

    if (TimeFields.checkInputGroups(currentTask)) {
        console.log('returning this task:', currentTask);

        if (TimeFields.confirmInputs(currentTask)) {

            currentTask.taskID = TaskService.createUniqueId();

            TaskService.timeCollections.push(currentTask);

            console.log('returning this task:', currentTask);
            return currentTask;
        } else {
            return false;
        }
    } else {

        return false;

    }

}

function enableEditing() {
    isEditing = false;
}


function blurTaskName(event) {

    console.log("inside blurTaskName", event);

    let newTaskName = event.target.value;

    event.target.classList.add('hide');

    inEditTaskName.innerHTML = TaskService.confirmTaskName(newTaskName);
    inEditTaskName.classList.remove('hide');
    setTimeout(enableEditing, 500);
}


function clickedName(event) {
    if (!isEditing) {
        console.log("Something has been clicked in the DOM");
        console.log(event);

        //get the content of the taskname
        inEditTaskName = event.target;

        let taskNameContent = inEditTaskName.innerHTML;
        let taskNameEditInput;


        taskNameID = event.target.id;

        inEditTaskName.classList.add('hide');

        taskNameEditInput = document.getElementById(taskNameID + '-modify');

        taskNameEditInput.value = taskNameContent;

        taskNameEditInput.classList.remove('hide');
        taskNameEditInput.focus();

        taskNameEditInput.addEventListener('keydown', function (e) {
            //13 is the keycode for Enter
            if (e.keyCode === 13) {
                blurTaskName(e);
            }
        });

        taskNameEditInput.addEventListener('blur', blurTaskName);
        isEditing = true;
    }

}


//stamps out the template for the new task panel
function createPanel(currentTask) {

    let newTaskParent = document.createElement('div');

    newTaskParent.id = `task-${currentTask.taskID}`;

    // newTaskParent.setAttribute('data-taskCount', currentTask.taskID);

    newTaskParent.classList.add('row', 'task-panel');

    document.querySelector('.task-holder').appendChild(newTaskParent);

    newTaskParent.innerHTML =
        `<div id="task-name-${currentTask.taskID}">
			<p class="task-title" id="task-${currentTask.taskID}-title"></p>
			<input class="task-input-modify hide" id="task-${currentTask.taskID}-title-modify" type="text">
			<p class="task-total" id="total-time-${currentTask.taskID}"></p>
		</div>
		<div id="times-${currentTask.taskID}">
			<p class="times"></p>
		</div>
		<div id="delete-${currentTask.taskID}" data-task-count="${currentTask.taskID}">
		delete this task
		</div>`;

    let taskName = document.getElementById(`task-${currentTask.taskID}-title`);
    let deleteTaskBtn = document.getElementById(`delete-${currentTask.taskID}`);

    deleteTaskBtn.addEventListener('click', TaskService.deleteTask);
    taskName.addEventListener('click', clickedName);
}


function setTimes(timeObject) {

    const {hour, minutes} = timeObject;

    if (hour === 24) {
        return `${hour - 12}:${minutes}am`;
    }

    if (hour === 0) {
        return `${hour + 12}:${minutes}am`;
    }

    if (hour === 12) {
        return `${hour}:${minutes}pm`
    }

    return hour >= 13 ? `${hour - 12}:${minutes}pm` : `${hour}:${minutes}am`;

}

export function displayTimes(currentTask) {
    console.log('displayTimes(currentTask, taskCount)', currentTask, currentTask.taskID);

    //create the elements first because we reference them via ID
    createPanel(currentTask);

    let taskNameSelector = document.querySelector(`#task-${currentTask.taskID}-title`);
    let totalTimeSelector = document.querySelector(`#total-time-${currentTask.taskID}`);
    let timesParagraph = document.querySelector(`#times-${currentTask.taskID} p`);
    let totalHours = TimeMath.getHours(TaskService.TOTAL_END_MINUTES - TaskService.TOTAL_START_MINUTES);
    let totalMinutes = TimeMath.getRemainingMinutes(TaskService.TOTAL_END_MINUTES - TaskService.TOTAL_START_MINUTES);


    let startTime = setTimes({hour: currentTask.startTimes.hour, minutes: currentTask.startTimes.minutes});
    let endTime = setTimes({hour: currentTask.endTimes.hour, minutes: currentTask.endTimes.minutes});


    console.log('totalHours: ', totalHours);

    if (totalHours < 1) {
        totalHours = 0;
    }

    console.log(currentTask.taskName);
    taskNameSelector.innerHTML = `${currentTask.taskName}`;
    totalTimeSelector.innerHTML = `Time: ${totalHours}.${totalMinutes}`;

    timesParagraph.innerHTML = `${startTime} - ${endTime}`;


    currentTask.totalTimeSpentHours = totalHours;
    currentTask.totalTimeSpentMinutes = totalMinutes;

    TaskService.updateTotalTime();

}